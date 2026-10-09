<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laundry_order_id')->constrained('laundry_orders')->cascadeOnDelete();
            $table->string('item_description');
            $table->unsignedInteger('quantity')->default(1);
            $table->decimal('weight', 10, 2)->default(0);
            $table->boolean('wash')->default(false);
            $table->boolean('dry')->default(false);
            $table->boolean('fold')->default(false);
            $table->boolean('iron')->default(false);
            $table->decimal('line_amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
