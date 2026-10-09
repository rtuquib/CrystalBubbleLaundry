<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_code')->unique();
            $table->string('full_name');
            $table->string('contact_number')->nullable();
            $table->string('address')->nullable();
            $table->string('email')->nullable();
            $table->string('gender', 32)->nullable();
            $table->string('preferred_scent')->nullable();
            $table->string('preferred_detergent')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 32)->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
