<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Enums\LaundryOrderStatus;
use App\Models\AppNotification;
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

        return Inertia::render('Staff/Dashboard', [
            'kpis' => [
                'in_progress' => LaundryOrder::query()->where('status', '!=', LaundryOrderStatus::Completed)->count(),
                'wash_dry' => LaundryOrder::query()->whereIn('status', [LaundryOrderStatus::Washing, LaundryOrderStatus::Drying])->count(),
                'ready' => LaundryOrder::query()->where('status', LaundryOrderStatus::ReadyForPickup)->count(),
                'payments_today' => (float) Payment::query()->where('created_at', '>=', $today)->sum('amount_paid'),
            ],
            'recent_orders' => LaundryOrder::query()
                ->with('customer:id,full_name,customer_code')
                ->latest()
                ->limit(8)
                ->get(['id', 'order_code', 'customer_id', 'status', 'amount', 'created_at']),
            'inventory_alerts' => InventoryItem::query()
                ->whereColumn('quantity', '<=', 'reorder_level')
                ->orderBy('quantity')
                ->limit(5)
                ->get(['id', 'item_name', 'quantity', 'reorder_level', 'unit']),
            'notifications_preview' => AppNotification::query()
                ->where('recipient_id', $request->user()->id)
                ->latest()
                ->limit(5)
                ->get(['id', 'title', 'is_read', 'created_at']),
        ]);
    }
}
