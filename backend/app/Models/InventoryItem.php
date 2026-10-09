<?php

namespace App\Models;

use App\Models\Concerns\BelongsToStore;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use BelongsToStore;

    protected $fillable = [
        'item_name',
        'category',
        'unit',
        'quantity',
        'reorder_level',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'reorder_level' => 'decimal:3',
        ];
    }

    /** @return HasMany<InventoryMovement, $this> */
    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class, 'inventory_item_id')->orderByDesc('created_at');
    }

    public function isLowStock(): bool
    {
        return (float) $this->quantity <= (float) $this->reorder_level;
    }
}
