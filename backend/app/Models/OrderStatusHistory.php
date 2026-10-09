<?php

namespace App\Models;

use App\Enums\LaundryOrderStatus;
use App\Models\Concerns\BelongsToStore;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    use BelongsToStore;

    public $timestamps = false;

    protected $table = 'order_status_histories';

    protected $fillable = [
        'laundry_order_id',
        'status',
        'user_id',
        'note',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => LaundryOrderStatus::class,
            'created_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<LaundryOrder, $this> */
    public function laundryOrder(): BelongsTo
    {
        return $this->belongsTo(LaundryOrder::class, 'laundry_order_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
