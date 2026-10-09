<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    protected $fillable = ['name', 'code', 'address', 'contact_email', 'status'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function getStoreAdminAttribute(): ?User
    {
        return $this->users()->where('role', User::ROLE_ADMIN)->first();
    }
}
