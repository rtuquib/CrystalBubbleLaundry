<?php

namespace App\Models;

use App\Models\Concerns\BelongsToStore;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class InventoryMovement extends Model
{
    use BelongsToStore;

    public $timestamps = false;

    protected $fillable = [
        'inventory_item_id',
        'type',
        'quantity',
        'reference_type',
        'reference_id',
        'notes',
        'user_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'created_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<InventoryItem, $this> */
    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
