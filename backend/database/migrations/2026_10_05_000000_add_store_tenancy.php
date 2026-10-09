<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tenantTables = [
        'customers', 'laundry_orders', 'order_items', 'order_status_histories', 'payments',
        'inventory_items', 'inventory_movements', 'app_notifications', 'activity_logs',
    ];

    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('address')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('status', 24)->default('active');
            $table->timestamps();
        });

        DB::table('stores')->insert([
            'name' => 'Crystal Bubble Laundry (Existing Store)',
            'code' => 'CB-LEGACY',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $storeId = (int) DB::table('stores')->where('code', 'CB-LEGACY')->value('id');

        Schema::table('users', function (Blueprint $table): void {
            $table->foreignId('store_id')->nullable()->after('id')->constrained()->restrictOnDelete();
        });
        DB::table('users')->whereNull('store_id')->update(['store_id' => $storeId]);

        foreach ($this->tenantTables as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->foreignId('store_id')->nullable()->constrained()->restrictOnDelete();
                $table->index('store_id');
            });
            DB::table($tableName)->whereNull('store_id')->update(['store_id' => $storeId]);
        }
    }

    public function down(): void
    {
        foreach (array_reverse($this->tenantTables) as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropForeign(['store_id']);
                $table->dropIndex(['store_id']);
                $table->dropColumn('store_id');
            });
        }
        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });
        Schema::dropIfExists('stores');
    }
};
