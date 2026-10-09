<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\StaffUserController;
use App\Http\Controllers\SuperAdmin\StoreController;
use App\Http\Controllers\AppNotificationController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InventoryItemController;
use App\Http\Controllers\LaundryOrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->route('login'));

Route::get('/dashboard', function () {
    $user = auth()->user();
    if (! $user) {
        return redirect()->route('login');
    }

    return $user->isSuperAdmin()
        ? redirect()->route('super-admin.dashboard')
        : ($user->isAdmin()
        ? redirect()->route('admin.dashboard')
        : redirect()->route('staff.dashboard'));
})->middleware(['auth'])->name('dashboard');

Route::middleware(['auth'])->group(function () {
    Route::get('/notifications/unread-count', [AppNotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::get('/notifications/recipients', [AppNotificationController::class, 'recipients'])->name('notifications.recipients');

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');
        Route::get('/activity-logs', ActivityLogController::class)->name('activity-logs');
        Route::resource('staff', StaffUserController::class)->parameters(['staff' => 'user'])->except(['show']);
    });

    Route::middleware('role:super_admin')->prefix('super-admin')->name('super-admin.')->group(function () {
        Route::get('/', [StoreController::class, 'index'])->name('dashboard');
        Route::post('/stores', [StoreController::class, 'store'])->name('stores.store');
        Route::patch('/stores/{store}/status', [StoreController::class, 'updateStatus'])->name('stores.status');
    });

    Route::get('/platform/dashboard', fn () => redirect()->route('super-admin.dashboard'))
        ->middleware('role:super_admin');

    Route::middleware('role:admin|staff')->group(function () {
        Route::get('/staff/dashboard', StaffDashboardController::class)->name('staff.dashboard');

        Route::resource('customers', CustomerController::class);
        Route::resource('orders', LaundryOrderController::class)->parameters(['orders' => 'laundry_order']);
        Route::post('orders/{laundry_order}/status', [LaundryOrderController::class, 'updateStatus'])->name('orders.status');

        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::get('payments/create', [PaymentController::class, 'create'])->name('payments.create');
        Route::post('payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::post('payments/{payment}/confirm', [ReceiptController::class, 'confirm'])->name('payments.confirm');

        Route::get('inventory', [InventoryItemController::class, 'index'])->name('inventory.index');
        Route::get('inventory/create', [InventoryItemController::class, 'create'])->name('inventory.create');
        Route::post('inventory', [InventoryItemController::class, 'store'])->name('inventory.store');
        Route::get('inventory/{inventory_item}/edit', [InventoryItemController::class, 'edit'])->name('inventory.edit');
        Route::put('inventory/{inventory_item}', [InventoryItemController::class, 'update'])->name('inventory.update');
        Route::post('inventory/{inventory_item}/movement', [InventoryItemController::class, 'movement'])->name('inventory.movement');

        Route::get('reports', ReportController::class)->name('reports.index');

        Route::get('notifications', [AppNotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications', [AppNotificationController::class, 'store'])->name('notifications.store');
        Route::patch('notifications/{app_notification}/read', [AppNotificationController::class, 'markRead'])->name('notifications.read');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('receipts/{payment}', [ReceiptController::class, 'show'])->name('receipts.show');
    Route::get('receipts/{payment}/print', [ReceiptController::class, 'print'])->name('receipts.print');
    Route::get('receipts/{payment}/pdf', [ReceiptController::class, 'downloadPdf'])->name('receipts.pdf');
});

require __DIR__.'/auth.php';
