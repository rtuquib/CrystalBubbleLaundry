<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laundry_order_id')->constrained('laundry_orders')->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('receipt_number')->unique();
            $table->string('payment_method', 32);
            $table->string('payment_status', 32)->default('pending');
            $table->decimal('amount_paid', 12, 2);
            $table->decimal('change_amount', 12, 2)->default(0);
            $table->string('reference_number')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
