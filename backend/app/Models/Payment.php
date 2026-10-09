<?php

namespace App\Models;

use App\Models\Concerns\BelongsToStore;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'laundry_order_id',
        'customer_id',
        'receipt_number',
        'payment_method',
        'payment_status',
        'amount_paid',
        'change_amount',
        'reference_number',
        'paid_at',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'change_amount' => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<LaundryOrder, $this> */
    public function laundryOrder(): BelongsTo
    {
        return $this->belongsTo(LaundryOrder::class, 'laundry_order_id');
    }

    /** @return BelongsTo<Customer, $this> */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /** @return BelongsTo<User, $this> */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
