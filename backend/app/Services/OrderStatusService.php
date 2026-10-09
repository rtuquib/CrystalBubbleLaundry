<?php

namespace App\Services;

use App\Enums\LaundryOrderStatus;
use App\Models\LaundryOrder;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderStatusService
{
    public function __construct(
        private InventoryStockService $inventoryStockService,
        private OfficialReceiptService $officialReceiptService,
    ) {}

    public function transition(LaundryOrder $order, LaundryOrderStatus $to, ?User $user, ?string $note = null): void
    {
        DB::transaction(function () use ($order, $to, $user, $note): void {
            $from = $order->status;
            $order->status = $to;
            $order->updated_by = $user?->id;
            if ($to === LaundryOrderStatus::Completed) {
                $order->completed_at = now();
                $this->inventoryStockService->deductForCompletedOrder($order, $user);
            }
            $order->save();

            if ($to === LaundryOrderStatus::Completed) {
                $generatedForPayment = $this->officialReceiptService->generateForCompletedOrderIfEligible($order, $user);
                if ($generatedForPayment) {
                    ActivityLogger::log(
                        'receipt.auto_generated',
                        "Auto-generated {$generatedForPayment->receipt_number} for {$order->order_code}",
                        $order,
                        ['payment_id' => $generatedForPayment->id]
                    );
                }
            }

            OrderStatusHistory::query()->create([
                'laundry_order_id' => $order->id,
                'status' => $to,
                'user_id' => $user?->id,
                'note' => $note,
                'created_at' => now(),
            ]);

            ActivityLogger::log(
                'order.status_changed',
                "Status {$from->value} → {$to->value} for {$order->order_code}",
                $order,
                ['from' => $from->value, 'to' => $to->value]
            );
        });
    }
}
