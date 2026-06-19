<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Fidelity Tiers ───────────────────────────────────────────────
        Schema::create('fidelity_tiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->nullable()->unique();
            $table->decimal('min_lifetime_spend', 12, 2)->default(0);
            $table->decimal('points_multiplier', 5, 2)->default(1.00);
            $table->json('perks')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('min_lifetime_spend');
        });

        // ── Profiles ─────────────────────────────────────────────────────
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->string('phone')->nullable();
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->nullable();
            $table->decimal('lifetime_spend', 12, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        // ── Categories ───────────────────────────────────────────────────
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('parent_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->foreign('parent_id')->references('id')->on('categories')->nullOnDelete();

            $table->index('is_active');
        });

        // ── Products ─────────────────────────────────────────────────────
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('category_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->json('specifications')->nullable();
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();

            // Indexes for searchable / filterable columns.
            $table->index('name');
            $table->index('is_active');
            $table->index(['is_active', 'category_id']);
        });

        // ── Product Variants ─────────────────────────────────────────────
        Schema::create('product_variants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id');
            $table->string('sku')->unique();
            $table->string('name');
            $table->json('attributes')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();

            $table->index('product_id');
            $table->index('stock');
        });

        // ── Cart Items ───────────────────────────────────────────────────
        Schema::create('cart_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->string('session_token')->nullable()->index();
            $table->uuid('product_variant_id');
            $table->integer('quantity')->default(1);
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('product_variant_id')->references('id')->on('product_variants')->cascadeOnDelete();

            $table->index('user_id');
        });

        // ── Orders ───────────────────────────────────────────────────────
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('order_number')->unique();
            $table->string('status')->default('pending');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('fidelity_discount', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->integer('fidelity_points_earned')->default(0);
            $table->integer('fidelity_points_redeemed')->default(0);
            $table->string('shipping_name');
            $table->string('shipping_address');
            $table->string('shipping_city');
            $table->string('shipping_state')->nullable();
            $table->string('shipping_postal_code');
            $table->string('shipping_country');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            $table->index(['user_id', 'created_at']);
            $table->index('status');
        });

        // ── Order Items ──────────────────────────────────────────────────
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_id');
            $table->uuid('product_variant_id')->nullable();
            $table->string('product_name');
            $table->string('variant_name');
            $table->string('sku');
            $table->decimal('unit_price', 10, 2);
            $table->integer('quantity');
            $table->decimal('line_total', 10, 2);
            $table->timestamps();
            $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete();
            $table->foreign('product_variant_id')->references('id')->on('product_variants')->nullOnDelete();

            $table->index('order_id');
        });

        // ── Fidelity Ledger ──────────────────────────────────────────────
        Schema::create('fidelity_ledgers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('order_id')->nullable();
            $table->string('entry_type'); // earned | redeemed | expired | adjustment
            $table->integer('points');
            $table->integer('balance_after');
            $table->string('description')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();

            $table->index(['user_id', 'entry_type']);
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fidelity_ledgers');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('profiles');
        Schema::dropIfExists('fidelity_tiers');
    }
};
