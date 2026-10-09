<?php

namespace App\Http\Controllers;

use App\Enums\LaundryOrderStatus;
use App\Models\Customer;
use App\Models\LaundryOrder;
use App\Models\OrderStatusHistory;
use App\Services\ActivityLogger;
use App\Services\OrderPricingService;
use App\Services\OrderStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LaundryOrderController extends Controller
{
    public function index(Request $request): Response
    {
        $q = trim((string) $request->get('q', ''));
        $status = $request->get('status');

        $orders = LaundryOrder::query()
            ->with('customer:id,full_name,customer_code')
            ->when($q !== '', function ($query) use ($q): void {
                $query->where('order_code', 'like', "%{$q}%");
            })
            ->when($status, function ($query) use ($status): void {
                $query->where('status', $status);
            })
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => ['q' => $q, 'status' => $status],
            'statuses' => collect(LaundryOrderStatus::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Orders/Create', [
            'customers' => Customer::query()->where('status', 'active')->orderBy('full_name')->get(['id', 'full_name', 'customer_code', 'preferred_scent', 'preferred_detergent']),
            'statuses' => collect(LaundryOrderStatus::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function store(Request $request, OrderPricingService $pricing): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'pickup_schedule' => ['nullable', 'date'],
            'preferred_scent' => ['nullable', 'string', 'max:128'],
            'preferred_detergent' => ['nullable', 'string', 'max:128'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.weight' => ['required', 'numeric', 'min:0'],
            'items.*.wash' => ['boolean'],
            'items.*.dry' => ['boolean'],
            'items.*.fold' => ['boolean'],
            'items.*.iron' => ['boolean'],
        ]);

        $customer = Customer::query()->findOrFail($validated['customer_id']);

        $order = DB::transaction(function () use ($validated, $request, $pricing, $customer) {
            $serviceType = $this->summarizeServices($validated['items']);
            $total = $pricing->orderTotal($validated['items']);

            $order = LaundryOrder::query()->create([
                'customer_id' => $customer->id,
                'service_type' => $serviceType,
                'preferred_scent' => $validated['preferred_scent'] ?? $customer->preferred_scent,
                'preferred_detergent' => $validated['preferred_detergent'] ?? $customer->preferred_detergent,
                'amount' => $total,
                'pickup_schedule' => $validated['pickup_schedule'] ?? null,
                'status' => LaundryOrderStatus::Received,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $row) {
                $line = $pricing->lineTotal($row);
                $order->items()->create([
                    'item_description' => $row['item_description'],
                    'quantity' => $row['quantity'],
                    'weight' => $row['weight'],
                    'wash' => (bool) ($row['wash'] ?? false),
                    'dry' => (bool) ($row['dry'] ?? false),
                    'fold' => (bool) ($row['fold'] ?? false),
                    'iron' => (bool) ($row['iron'] ?? false),
                    'line_amount' => $line,
                ]);
            }

            OrderStatusHistory::query()->create([
                'laundry_order_id' => $order->id,
                'status' => LaundryOrderStatus::Received,
                'user_id' => $request->user()->id,
                'note' => 'Order created',
                'created_at' => now(),
            ]);

            ActivityLogger::log('order.created', "Order {$order->order_code}", $order);

            return $order;
        });

        return redirect()->route('orders.show', $order)->with('success', 'Order created.');
    }

    public function show(LaundryOrder $laundry_order): Response
    {
        $laundry_order->load(['customer', 'items', 'statusHistories.user:id,name', 'payments']);

        return Inertia::render('Orders/Show', [
            'order' => $laundry_order,
            'statuses' => collect(LaundryOrderStatus::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
            'total_paid' => (float) $laundry_order->totalPaid(),
            'balance' => $laundry_order->balanceDue(),
        ]);
    }

    public function edit(LaundryOrder $laundry_order): Response
    {
        $laundry_order->load('items');

        return Inertia::render('Orders/Edit', [
            'order' => $laundry_order,
            'customers' => Customer::query()->where('status', 'active')->orderBy('full_name')->get(['id', 'full_name', 'customer_code']),
        ]);
    }

    public function update(Request $request, LaundryOrder $laundry_order, OrderPricingService $pricing): RedirectResponse
    {
        $validated = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'pickup_schedule' => ['nullable', 'date'],
            'preferred_scent' => ['nullable', 'string', 'max:128'],
            'preferred_detergent' => ['nullable', 'string', 'max:128'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.weight' => ['required', 'numeric', 'min:0'],
            'items.*.wash' => ['boolean'],
            'items.*.dry' => ['boolean'],
            'items.*.fold' => ['boolean'],
            'items.*.iron' => ['boolean'],
        ]);

        DB::transaction(function () use ($validated, $request, $pricing, $laundry_order): void {
            $laundry_order->items()->delete();
            $total = $pricing->orderTotal($validated['items']);
            $laundry_order->update([
                'customer_id' => $validated['customer_id'],
                'service_type' => $this->summarizeServices($validated['items']),
                'preferred_scent' => $validated['preferred_scent'],
                'preferred_detergent' => $validated['preferred_detergent'],
                'amount' => $total,
                'pickup_schedule' => $validated['pickup_schedule'] ?? null,
                'updated_by' => $request->user()->id,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $row) {
                $line = $pricing->lineTotal($row);
                $laundry_order->items()->create([
                    'item_description' => $row['item_description'],
                    'quantity' => $row['quantity'],
                    'weight' => $row['weight'],
                    'wash' => (bool) ($row['wash'] ?? false),
                    'dry' => (bool) ($row['dry'] ?? false),
                    'fold' => (bool) ($row['fold'] ?? false),
                    'iron' => (bool) ($row['iron'] ?? false),
                    'line_amount' => $line,
                ]);
            }

            ActivityLogger::log('order.updated', "Order {$laundry_order->order_code} updated", $laundry_order);
        });

        return redirect()->route('orders.show', $laundry_order)->with('success', 'Order updated.');
    }

    public function destroy(LaundryOrder $laundry_order): RedirectResponse
    {
        ActivityLogger::log('order.deleted', "Deleted {$laundry_order->order_code}", $laundry_order);
        $laundry_order->delete();

        return redirect()->route('orders.index')->with('success', 'Order deleted.');
    }

    public function updateStatus(Request $request, LaundryOrder $laundry_order, OrderStatusService $statusService): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(LaundryOrderStatus::values())],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $to = LaundryOrderStatus::from($validated['status']);
        $statusService->transition($laundry_order, $to, $request->user(), $validated['note'] ?? null);

        return back()->with('success', 'Status updated.');
    }

    /**
     * @param  list<array<string, mixed>>  $items
     */
    private function summarizeServices(array $items): string
    {
        $labels = [];
        foreach ($items as $i) {
            foreach (['wash' => 'Wash', 'dry' => 'Dry', 'fold' => 'Fold', 'iron' => 'Iron'] as $k => $lab) {
                if (! empty($i[$k])) {
                    $labels[$k] = $lab;
                }
            }
        }

        return $labels === [] ? '—' : implode(', ', array_values($labels));
    }
}
