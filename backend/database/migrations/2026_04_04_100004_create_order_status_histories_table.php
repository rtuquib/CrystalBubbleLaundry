<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laundry_order_id')->constrained('laundry_orders')->cascadeOnDelete();
            $table->string('status', 64);
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_histories');
    }
};
