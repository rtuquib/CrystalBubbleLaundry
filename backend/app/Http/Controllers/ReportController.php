<?php

namespace App\Http\Controllers;

use App\Enums\LaundryOrderStatus;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\LaundryOrder;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $from = $request->get('from', now()->subDays(30)->toDateString());
        $to = $request->get('to', now()->toDateString());
        $service = $request->get('service_type');
        $payMethod = $request->get('payment_method');
        $orderStatus = $request->get('order_status');

        $fromDt = Carbon::parse($from)->startOfDay();
        $toDt = Carbon::parse($to)->endOfDay();

        $ordersBase = LaundryOrder::query()->whereBetween('created_at', [$fromDt, $toDt]);
        if ($orderStatus) {
            $ordersBase->where('status', $orderStatus);
        }
        if ($service) {
            $ordersBase->where('service_type', 'like', '%'.$service.'%');
        }

        $paymentsBase = Payment::query()->whereBetween('created_at', [$fromDt, $toDt]);
        if ($payMethod) {
            $paymentsBase->where('payment_method', $payMethod);
        }

        $driver = DB::getDriverName();
        $dayExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m-%d', created_at)"
            : 'DATE(created_at)';
        $monthExpr = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $dailySales = Payment::query()
            ->selectRaw("{$dayExpr} as day, SUM(amount_paid) as total")
            ->whereBetween('created_at', [$fromDt, $toDt])
            ->when($payMethod, fn ($q) => $q->where('payment_method', $payMethod))
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        $monthlyRevenue = Payment::query()
            ->selectRaw("{$monthExpr} as month, SUM(amount_paid) as total")
            ->whereBetween('created_at', [$fromDt, $toDt])
            ->when($payMethod, fn ($q) => $q->where('payment_method', $payMethod))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $customerAnalytics = Customer::query()
            ->withCount('laundryOrders')
            ->withSum('laundryOrders', 'amount')
            ->orderByDesc('laundry_orders_sum_amount')
            ->limit(25)
            ->get()
            ->map(fn (Customer $c) => [
                'id' => $c->id,
                'full_name' => $c->full_name,
                'orders_count' => $c->laundry_orders_count,
                'spend' => (float) ($c->laundry_orders_sum_amount ?? 0),
            ]);

        $orderVolume = [
            'total' => (clone $ordersBase)->count(),
            'by_status' => LaundryOrder::query()
                ->select('status', DB::raw('count(*) as c'))
                ->whereBetween('created_at', [$fromDt, $toDt])
                ->groupBy('status')
                ->get()
                ->mapWithKeys(function ($r) {
                    $key = $r->status instanceof LaundryOrderStatus ? $r->status->value : (string) $r->status;

                    return [$key => $r->c];
                }),
        ];

        $servicePopularity = LaundryOrder::query()
            ->join('order_items', 'order_items.laundry_order_id', '=', 'laundry_orders.id')
            ->whereBetween('laundry_orders.created_at', [$fromDt, $toDt])
            ->selectRaw('SUM(CASE WHEN order_items.wash = 1 THEN 1 ELSE 0 END) as wash')
            ->selectRaw('SUM(CASE WHEN order_items.dry = 1 THEN 1 ELSE 0 END) as dry')
            ->selectRaw('SUM(CASE WHEN order_items.fold = 1 THEN 1 ELSE 0 END) as fold')
            ->selectRaw('SUM(CASE WHEN order_items.iron = 1 THEN 1 ELSE 0 END) as iron')
            ->first();

        $paymentSummary = Payment::query()
            ->select('payment_method', DB::raw('SUM(amount_paid) as total'), DB::raw('COUNT(*) as cnt'))
            ->whereBetween('created_at', [$fromDt, $toDt])
            ->groupBy('payment_method')
            ->get();

        $inventoryUsage = InventoryMovement::query()
            ->whereIn('type', ['stock_out', 'adjustment_out'])
            ->whereBetween('created_at', [$fromDt, $toDt])
            ->select('inventory_item_id', DB::raw('SUM(quantity) as qty'))
            ->groupBy('inventory_item_id')
            ->with('inventoryItem:id,item_name,unit')
            ->orderByDesc('qty')
            ->limit(15)
            ->get();

        return Inertia::render('Reports/Index', [
            'filters' => compact('from', 'to', 'service', 'payMethod', 'orderStatus'),
            'daily_sales' => $dailySales,
            'monthly_revenue' => $monthlyRevenue,
            'customer_analytics' => $customerAnalytics,
            'order_volume' => $orderVolume,
            'service_popularity' => $servicePopularity,
            'payment_summary' => $paymentSummary,
            'inventory_usage' => $inventoryUsage,
            'status_options' => collect(LaundryOrderStatus::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }
}
