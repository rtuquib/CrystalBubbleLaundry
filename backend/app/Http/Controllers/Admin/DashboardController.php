<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\LaundryOrder;
use App\Models\Payment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $today = now()->startOfDay();

        return Inertia::render('Admin/Dashboard', [
            'kpis' => [
                'customers' => Customer::query()->count(),
                'orders_today' => LaundryOrder::query()->where('created_at', '>=', $today)->count(),
                'payments_today' => (float) Payment::query()->where('created_at', '>=', $today)->sum('amount_paid'),
                'low_stock' => InventoryItem::query()->whereColumn('quantity', '<=', 'reorder_level')->count(),
            ],
            'recent_orders' => LaundryOrder::query()
                ->with('customer:id,full_name,customer_code')
                ->latest()
                ->limit(8)
                ->get(['id', 'order_code', 'customer_id', 'status', 'amount', 'created_at']),
            'recent_payments' => Payment::query()
                ->with(['customer:id,full_name', 'laundryOrder:id,order_code'])
                ->latest()
                ->limit(8)
                ->get(),
            'inventory_alerts' => InventoryItem::query()
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->orderBy('quantity')
                ->limit(6)
                ->get(['id', 'item_name', 'quantity', 'reorder_level', 'unit']),
            'notifications_preview' => AppNotification::query()
                ->where('recipient_id', $request->user()->id)
                ->latest()
                ->limit(5)
                ->get(['id', 'title', 'is_read', 'created_at']),
        ]);
    }
}
