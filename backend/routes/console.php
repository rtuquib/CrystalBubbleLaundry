<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Models\User;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
Artisan::command('super-admin:promote {email}', function (string $email): int {
    $user = User::query()->where('email', $email)->first();
    if (! $user) {
        $this->error('No user exists with that email. Create the account first, then promote it.');
        return 1;
    }

    $user->role = User::ROLE_SUPER_ADMIN;
    $user->save();
    $this->info("{$user->email} can now access the platform dashboard.");
    return 0;
})->purpose('Promote an existing account to CrystalBubble super admin');

Artisan::command('super-admin:create', function (): int {
    $name = $this->ask('Super admin name');
    $email = strtolower((string) $this->ask('Super admin email'));
    if (! filter_var($email, FILTER_VALIDATE_EMAIL) || User::query()->where('email', $email)->exists()) {
        $this->error('Enter a valid email address that is not already in use.');
        return 1;
    }

    $password = (string) $this->secret('Password (at least 12 characters)');
    $confirmation = (string) $this->secret('Confirm password');
    if (strlen($password) < 12 || $password !== $confirmation) {
        $this->error('The password must be at least 12 characters and both entries must match.');
        return 1;
    }

    User::query()->create([
        'name' => $name,
        'email' => $email,
        'password' => $password,
        'role' => User::ROLE_SUPER_ADMIN,
        'store_id' => null,
    ]);
    $this->info('Super admin account created.');
    return 0;
})->purpose('Create the first CrystalBubble platform super admin');
