<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Avoid "Specified key was too long" on MySQL with utf8mb4 (unique indexes on varchar(255)).
        Schema::defaultStringLength(191);

        Vite::prefetch(concurrency: 3);
    }
}
