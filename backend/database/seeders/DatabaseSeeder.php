<?php

namespace Database\Seeders;

use App\Enums\LaundryOrderStatus;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\LaundryOrder;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Models\Store;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $store = Store::query()->firstOrCreate(
            ['code' => 'CB-LEGACY'],
            ['name' => 'Crystal Bubble Laundry (Existing Store)', 'status' => 'active']
        );

        User::query()->updateOrCreate(
            ['email' => 'admin@crystalbubble.test'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
                'store_id' => $store->id,
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'staff@crystalbubble.test'],
            [
                'name' => 'Floor Staff',
                'password' => Hash::make('password'),
                'role' => User::ROLE_STAFF,
                'store_id' => $store->id,
            ]
        );

        Auth::login(User::query()->where('email', 'admin@crystalbubble.test')->firstOrFail());

        $customer = Customer::query()->firstOrCreate(
            ['email' => 'demo.customer@example.com'],
            [
                'full_name' => 'Demo Customer',
                'contact_number' => '09171234567',
                'address' => 'Davao City',
                'gender' => 'prefer_not_say',
                'preferred_scent' => 'Lavender',
                'preferred_detergent' => 'Hypoallergenic',
                'status' => 'active',
            ]
        );

        InventoryItem::query()->firstOrCreate(
            ['item_name' => 'Liquid detergent (bulk)'],
            [
                'category' => 'detergent',
                'unit' => 'L',
                'quantity' => 40,
                'reorder_level' => 15,
                'status' => 'active',
            ]
        );

        InventoryItem::query()->firstOrCreate(
            ['item_name' => 'Fabric softener'],
            [
                'category' => 'softener',
                'unit' => 'L',
                'quantity' => 8,
                'reorder_level' => 12,
                'status' => 'active',
            ]
        );

        InventoryItem::query()->firstOrCreate(
            ['item_name' => 'Garment bags'],
            [
                'category' => 'packaging',
                'unit' => 'pcs',
                'quantity' => 50,
                'reorder_level' => 20,
                'status' => 'active',
            ]
        );

        if (LaundryOrder::query()->count() === 0) {
            $admin = User::query()->where('email', 'admin@crystalbubble.test')->first();
            $order = LaundryOrder::query()->create([
                'customer_id' => $customer->id,
                'service_type' => 'Wash, Dry, Fold',
                'preferred_scent' => $customer->preferred_scent,
                'preferred_detergent' => $customer->preferred_detergent,
                'amount' => 285,
                'pickup_schedule' => now()->addDay(),
                'status' => LaundryOrderStatus::Washing,
                'created_by' => $admin?->id,
                'updated_by' => $admin?->id,
            ]);

            OrderItem::query()->create([
                'laundry_order_id' => $order->id,
                'item_description' => 'Mixed garments',
                'quantity' => 1,
                'weight' => 5,
                'wash' => true,
                'dry' => true,
                'fold' => true,
                'iron' => false,
                'line_amount' => 285,
            ]);

            OrderStatusHistory::query()->create([
                'laundry_order_id' => $order->id,
                'status' => LaundryOrderStatus::Received,
                'user_id' => $admin?->id,
                'note' => 'Order created',
                'created_at' => now()->subHours(3),
            ]);

            OrderStatusHistory::query()->create([
                'laundry_order_id' => $order->id,
                'status' => LaundryOrderStatus::Washing,
                'user_id' => $admin?->id,
                'note' => null,
                'created_at' => now()->subHour(),
            ]);
        }
    }
}
