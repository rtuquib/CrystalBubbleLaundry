<?php

use App\Http\Controllers\Api\PopularServiceController;
use Illuminate\Support\Facades\Route;

Route::get('/popular-services', [PopularServiceController::class, 'index']);
