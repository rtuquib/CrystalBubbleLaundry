<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'store_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';

    public const ROLE_STAFF = 'staff';

    public const ROLE_SUPER_ADMIN = 'super_admin';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function isStaff(): bool
    {
        return $this->role === self::ROLE_STAFF || $this->isAdmin();
    }

    /** @return HasMany<AppNotification, $this> */
    public function receivedAppNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class, 'recipient_id');
    }

    /** @return HasMany<AppNotification, $this> */
    public function sentAppNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class, 'sender_id');
    }
}
