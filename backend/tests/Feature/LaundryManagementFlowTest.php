<?php

namespace Tests\Feature;

use App\Enums\LaundryOrderStatus;
use App\Models\Customer;
use App\Models\InventoryItem;
use App\Models\LaundryOrder;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LaundryManagementFlowTest extends TestCase
{
    use RefreshDatabase;

    private function makeStaff(): User
    {
        return User::factory()->create(['role' => User::ROLE_STAFF]);
    }

    public function test_staff_can_create_customer(): void
    {
        $user = $this->makeStaff();

        $response = $this->actingAs($user)->post(route('customers.store'), [
            'full_name' => 'Jane Customer',
            'contact_number' => '555-0100',
            'status' => 'active',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('customers', [
            'full_name' => 'Jane Customer',
            'status' => 'active',
        ]);
    }

    public function test_staff_can_create_order_with_line_items(): void
    {
        $user = $this->makeStaff();
        $customer = Customer::query()->create([
            'full_name' => 'Order Customer',
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->post(route('orders.store'), [
            'customer_id' => $customer->id,
            'items' => [
                [
                    'item_description' => 'Shirts',
                    'quantity' => 2,
                    'weight' => 3.5,
                    'wash' => true,
                    'dry' => true,
                    'fold' => false,
                    'iron' => false,
                ],
            ],
        ]);

        $order = LaundryOrder::query()->where('customer_id', $customer->id)->first();
        $this->assertNotNull($order);
        $response->assertRedirect(route('orders.show', $order, absolute: false));
        $this->assertSame(1, $order->items()->count());
        $this->assertSame(LaundryOrderStatus::Received, $order->status);
    }

    public function test_staff_can_record_payment_for_order(): void
    {
        $user = $this->makeStaff();
        $customer = Customer::query()->create([
            'full_name' => 'Pay Customer',
            'status' => 'active',
        ]);

        $this->actingAs($user)->post(route('orders.store'), [
            'customer_id' => $customer->id,
            'items' => [
                [
                    'item_description' => 'Towels',
                    'quantity' => 1,
                    'weight' => 2,
                    'wash' => true,
                    'dry' => false,
                    'fold' => false,
                    'iron' => false,
                ],
            ],
        ]);

        $order = LaundryOrder::query()->where('customer_id', $customer->id)->firstOrFail();

        $response = $this->actingAs($user)->post(route('payments.store'), [
            'laundry_order_id' => $order->id,
            'amount_paid' => (float) $order->amount,
            'payment_method' => 'digital',
            'reference_number' => 'GCASH-123',
            'change_amount' => 0,
        ]);

        $response->assertRedirect(route('payments.index', absolute: false));
        $this->assertSame(1, Payment::query()->where('laundry_order_id', $order->id)->count());
        $this->assertDatabaseHas('payments', [
            'laundry_order_id' => $order->id,
            'customer_id' => $customer->id,
            'payment_method' => 'digital',
        ]);
    }

    public function test_inventory_stock_out_reduces_on_hand_quantity(): void
    {
        $user = $this->makeStaff();
        $item = InventoryItem::query()->create([
            'item_name' => 'Test Detergent',
            'category' => 'detergent',
            'unit' => 'L',
            'quantity' => 10,
            'reorder_level' => 1,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->post(
            route('inventory.movement', ['inventory_item' => $item->id]),
            [
                'type' => 'stock_out',
                'quantity' => 2.5,
                'notes' => 'Test deduction',
            ]
        );

        $response->assertRedirect();
        $item->refresh();
        $this->assertEqualsWithDelta(7.5, (float) $item->quantity, 0.001);
    }

    public function test_marking_order_completed_deducts_inventory_by_weight(): void
    {
        $user = $this->makeStaff();
        $customer = Customer::query()->create([
            'full_name' => 'Complete Customer',
            'status' => 'active',
        ]);

        $detergent = InventoryItem::query()->create([
            'item_name' => 'Main Detergent',
            'category' => 'detergent',
            'unit' => 'L',
            'quantity' => 100,
            'reorder_level' => 1,
            'status' => 'active',
        ]);
        $softener = InventoryItem::query()->create([
            'item_name' => 'Softener',
            'category' => 'softener',
            'unit' => 'L',
            'quantity' => 100,
            'reorder_level' => 1,
            'status' => 'active',
        ]);
        $packaging = InventoryItem::query()->create([
            'item_name' => 'Bags',
            'category' => 'packaging',
            'unit' => 'pc',
            'quantity' => 100,
            'reorder_level' => 1,
            'status' => 'active',
        ]);

        $this->actingAs($user)->post(route('orders.store'), [
            'customer_id' => $customer->id,
            'items' => [
                [
                    'item_description' => 'Bulk load',
                    'quantity' => 1,
                    'weight' => 10,
                    'wash' => true,
                    'dry' => false,
                    'fold' => false,
                    'iron' => false,
                ],
            ],
        ]);

        $order = LaundryOrder::query()->where('customer_id', $customer->id)->firstOrFail();

        $response = $this->actingAs($user)->post(route('orders.status', $order), [
            'status' => LaundryOrderStatus::Completed->value,
            'note' => 'Picked up',
        ]);

        $response->assertRedirect();
        $order->refresh();
        $this->assertSame(LaundryOrderStatus::Completed, $order->status);

        $expectedDet = round(10 * 0.12, 3);
        $expectedSoft = round(10 * 0.06, 3);

        $this->assertEqualsWithDelta(100 - $expectedDet, (float) $detergent->fresh()->quantity, 0.001);
        $this->assertEqualsWithDelta(100 - $expectedSoft, (float) $softener->fresh()->quantity, 0.001);
        $this->assertEqualsWithDelta(99.0, (float) $packaging->fresh()->quantity, 0.001);
    }

    public function test_staff_cannot_open_admin_activity_logs(): void
    {
        $user = $this->makeStaff();

        $this->actingAs($user)->get(route('admin.activity-logs'))->assertForbidden();
    }
}
