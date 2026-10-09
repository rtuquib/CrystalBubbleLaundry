<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\LaundryOrder;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class InventoryStockService
{
    public function stockIn(InventoryItem $item, float $qty, ?User $user, ?string $notes = null): void
    {
        $this->applyMovement($item, 'stock_in', abs($qty), $user, $notes);
    }

    public function stockOut(InventoryItem $item, float $qty, ?User $user, ?string $notes = null): void
    {
        $this->applyMovement($item, 'stock_out', abs($qty), $user, $notes);
    }

    public function adjust(InventoryItem $item, float $newQuantity, ?User $user, ?string $notes = null): void
    {
        $delta = $newQuantity - (float) $item->quantity;
        if ($delta === 0.0) {
            return;
        }
        $type = $delta > 0 ? 'adjustment_in' : 'adjustment_out';
        $this->applyMovement($item, $type, abs($delta), $user, $notes);
    }

    public function deductForCompletedOrder(LaundryOrder $order, ?User $user): void
    {
        $kg = (float) $order->items()->sum('weight');
        if ($kg <= 0) {
            return;
        }

        $detergent = InventoryItem::query()->where('category', 'detergent')->first();
        $softener = InventoryItem::query()->where('category', 'softener')->first();
        $packaging = InventoryItem::query()->where('category', 'packaging')->first();

        if ($detergent) {
            $this->applyMovement($detergent, 'stock_out', round($kg * 0.12, 3), $user, "Order {$order->order_code}");
        }
        if ($softener) {
            $this->applyMovement($softener, 'stock_out', round($kg * 0.06, 3), $user, "Order {$order->order_code}");
        }
        if ($packaging) {
            $this->applyMovement($packaging, 'stock_out', 1, $user, "Order {$order->order_code}");
        }
    }

    private function applyMovement(InventoryItem $item, string $type, float $qty, ?User $user, ?string $notes): void
    {
        DB::transaction(function () use ($item, $type, $qty, $user, $notes): void {
            if (str_contains($type, 'out')) {
                $item->quantity = max(0, (float) $item->quantity - $qty);
            } else {
                $item->quantity = (float) $item->quantity + $qty;
            }
            $item->save();

            $item->movements()->create([
                'type' => $type,
                'quantity' => $qty,
                'notes' => $notes,
                'user_id' => $user?->id,
                'created_at' => now(),
            ]);

            ActivityLogger::log('inventory.movement', "{$type} {$qty} {$item->item_name}", $item);
        });
    }
}
