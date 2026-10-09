<?php

namespace App\Models;

use App\Models\Concerns\BelongsToStore;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'customer_code',
        'full_name',
        'contact_number',
        'address',
        'email',
        'gender',
        'preferred_scent',
        'preferred_detergent',
        'notes',
        'status',
    ];

    protected static function booted(): void
    {
        static::creating(function (Customer $customer): void {
            if (empty($customer->customer_code)) {
                $customer->customer_code = static::nextCustomerCode();
            }
        });
    }

    public static function nextCustomerCode(): string
    {
        $n = static::query()->max('id');

        return 'CB-CUST-'.str_pad((string) (($n ?? 0) + 1), 5, '0', STR_PAD_LEFT);
    }

    /** @return HasMany<LaundryOrder, $this> */
    public function laundryOrders(): HasMany
    {
        return $this->hasMany(LaundryOrder::class);
    }

    /** @return HasMany<Payment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
