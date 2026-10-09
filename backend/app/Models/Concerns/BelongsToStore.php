<?php

namespace App\Models\Concerns;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

trait BelongsToStore
{
    protected static function bootBelongsToStore(): void
    {
        static::addGlobalScope('store', function (Builder $builder): void {
            $user = Auth::user();

            if ($user && $user->role !== User::ROLE_SUPER_ADMIN) {
                $builder->where($builder->getModel()->qualifyColumn('store_id'), $user->store_id ?? 0);
            }
        });

        static::creating(function ($model): void {
            $user = Auth::user();
            if ($user && $user->role !== User::ROLE_SUPER_ADMIN && empty($model->store_id)) {
                $model->store_id = $user->store_id;
            }
        });
    }
}
