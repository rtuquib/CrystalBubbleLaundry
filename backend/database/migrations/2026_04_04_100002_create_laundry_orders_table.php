<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laundry_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('order_code')->unique();
            $table->string('service_type')->nullable()->comment('Summary label, e.g. Wash+Dry+Fold');
            $table->string('preferred_scent')->nullable();
            $table->string('preferred_detergent')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->dateTime('pickup_schedule')->nullable();
            $table->string('status', 64)->default('received');
            $table->timestamp('received_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laundry_orders');
    }
};
