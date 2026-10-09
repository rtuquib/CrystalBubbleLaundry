<?php

namespace App\Models;

use App\Models\Concerns\BelongsToStore;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'laundry_order_id',
        'item_description',
        'quantity',
        'weight',
        'wash',
        'dry',
        'fold',
        'iron',
        'line_amount',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'weight' => 'decimal:2',
            'wash' => 'boolean',
            'dry' => 'boolean',
            'fold' => 'boolean',
            'iron' => 'boolean',
            'line_amount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<LaundryOrder, $this> */
    public function laundryOrder(): BelongsTo
    {
        return $this->belongsTo(LaundryOrder::class, 'laundry_order_id');
    }
}
