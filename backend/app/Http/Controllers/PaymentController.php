<?php

namespace App\Http\Controllers;

use App\Models\LaundryOrder;
use App\Models\Payment;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $method = $request->get('payment_method');
        $status = $request->get('payment_status');

        $payments = Payments::query()
            ->with(['customer:id,full_name', 'laundryOrder:id,order_code'])
            ->when($method, fn ($q) => $q->where('payment_method', $method))
            ->when($status, fn ($q) => $q->where('payment_status', $status))
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'can_manage_receipts' => $request->user()?->isStaff() ?? false,
            'filters' => [
                'payment_method' => $method,
                'payment_status' => $status,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $orderId = $request->get('laundry_order_id');

        return Inertia::render('Payments/Create', [
            'orders' => LaundryOrder::query()
                ->with('customer:id,full_name')
                ->orderByDesc('id')
                ->limit(100)
                ->get(['id', 'order_code', 'customer_id', 'amount']),
            'prefill_order_id' => $orderId ? (int) $orderId : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'laundry_order_id' => ['required', 'exists:laundry_orders,id'],
            'amount_paid' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'string', 'in:cash,digital'],
            'reference_number' => ['nullable', 'string', 'max:128'],
            'change_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $order = LaundryOrder::query()->with('customer')->findOrFail($validated['laundry_order_id']);

        DB::transaction(function () use ($validated, $request, $order): void {
            $paidBefore = (float) $order->payments()->sum('amount_paid');
            $newTotal = $paidBefore + (float) $validated['amount_paid'];
            $orderAmount = (float) $order->amount;

            $paymentStatus = 'pending';
            if ($newTotal >= $orderAmount) {
                $paymentStatus = 'paid';
            } elseif ($newTotal > 0) {
                $paymentStatus = 'partial';
            }

            Payment::query()->create([
                'laundry_order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'receipt_number' => 'PENDING-'.Str::upper((string) Str::uuid()),
                'payment_method' => $validated['payment_method'],
                'payment_status' => $paymentStatus,
                'amount_paid' => $validated['amount_paid'],
                'change_amount' => $validated['change_amount'] ?? 0,
                'reference_number' => $validated['reference_number'] ?? null,
                'paid_at' => null,
                'recorded_by' => $request->user()->id,
            ]);

            ActivityLogger::log('payment.recorded', "Payment recorded for {$order->order_code}", $order, [
                'amount' => $validated['amount_paid'],
                'method' => $validated['payment_method'],
            ]);
        });

        return redirect()->route('payments.index')->with('success', 'Payment recorded.');
    }
}
