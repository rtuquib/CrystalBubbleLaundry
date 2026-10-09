<?php

namespace App\Services;

use App\Models\LaundryOrder;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OfficialReceiptService
{
    public function generateForPayment(Payment $payment): bool
    {
        return DB::transaction(function () use ($payment): bool {
            $locked = Payment::query()->lockForUpdate()->findOrFail($payment->id);

            if (str_starts_with((string) $locked->receipt_number, 'OR-')) {
                return false;
            }

            $locked->receipt_number = $this->nextReceiptNumber();
            if (! $locked->paid_at) {
                $locked->paid_at = now();
            }
            $locked->payment_status = 'paid';
            $locked->save();

            return true;
        });
    }

    public function generateForCompletedOrderIfEligible(LaundryOrder $order, ?User $actor = null): ?Payment
    {
        return DB::transaction(function () use ($order, $actor): ?Payment {
            $orderId = $order->id;

            $alreadyHasOfficialReceipt = Payment::query()
                ->where('laundry_order_id', $orderId)
                ->where('receipt_number', 'like', 'OR-%')
                ->lockForUpdate()
                ->exists();

            if ($alreadyHasOfficialReceipt) {
                return null;
            }

            $payment = Payment::query()
                ->where('laundry_order_id', $orderId)
                ->where('payment_status', 'paid')
                ->orderByDesc('paid_at')
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                return null;
            }

            if (! str_starts_with((string) $payment->receipt_number, 'OR-')) {
                $payment->receipt_number = $this->nextReceiptNumber();
                if (! $payment->paid_at) {
                    $payment->paid_at = now();
                }
                if ($actor?->id && ! $payment->recorded_by) {
                    $payment->recorded_by = $actor->id;
                }
                $payment->save();
            }

            return $payment;
        });
    }

    private function nextReceiptNumber(): string
    {
        $prefix = 'OR-'.now()->format('Ymd').'-';
        $count = Payment::query()->where('receipt_number', 'like', $prefix.'%')->lockForUpdate()->count();

        return $prefix.str_pad((string) ($count + 1), 4, '0', STR_PAD_LEFT);
    }
}
