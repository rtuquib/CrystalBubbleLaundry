<?php

namespace App\Models;

use App\Enums\LaundryOrderStatus;
use App\Models\Concerns\BelongsToStore;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LaundryOrder extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'customer_id',
        'order_code',
        'service_type',
        'preferred_scent',
        'preferred_detergent',
        'amount',
        'pickup_schedule',
        'status',
        'received_at',
        'completed_at',
        'created_by',
        'updated_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'pickup_schedule' => 'datetime',
            'received_at' => 'datetime',
            'completed_at' => 'datetime',
            'status' => LaundryOrderStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (LaundryOrder $order): void {
            if (empty($order->order_code)) {
                $order->order_code = static::nextOrderCode();
            }
            if ($order->received_at === null) {
                $order->received_at = now();
            }
        });
    }

    public static function nextOrderCode(): string
    {
        $n = static::query()->max('id');

        return 'CB-ORD-'.str_pad((string) (($n ?? 0) + 1), 5, '0', STR_PAD_LEFT);
    }

    /** @return BelongsTo<Customer, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /** @return HasMany<OrderItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'laundry_order_id');
    }

    /** @return HasMany<OrderStatusHistory, $this> */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class, 'laundry_order_id')->orderByDesc('created_at');
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'laundry_order_id');
    }

    public function totalPaid(): string
    {
        return (string) $this->payments()->sum('amount_paid');
    }

    public function balanceDue(): float
    {
        return max(0, (float) $this->amount - (float) $this->totalPaid());
    }
}
