<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    kpis: Object,
    recent_orders: Array,
    recent_payments: Array,
    inventory_alerts: Array,
    notifications_preview: Array,
});
</script>

<template>
    <AppShell>
        <Head title="Admin Dashboard" />
        <h1 class="text-2xl font-semibold text-slate-800">Admin dashboard</h1>
        <p class="mt-1 text-sm text-slate-500">KPIs, recent activity, inventory risk, and messages.</p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs text-slate-500">Customers</p>
                <p class="mt-1 text-2xl font-bold text-sky-600">{{ kpis.customers }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs text-slate-500">Orders today</p>
                <p class="mt-1 text-2xl font-bold text-amber-600">{{ kpis.orders_today }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs text-slate-500">Payments today (₱)</p>
                <p class="mt-1 text-2xl font-bold text-emerald-600">{{ kpis.payments_today }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs text-slate-500">Low-stock SKUs</p>
                <p class="mt-1 text-2xl font-bold text-red-600">{{ kpis.low_stock }}</p>
            </div>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="font-semibold text-slate-800">Recent orders</h2>
                <ul class="mt-3 divide-y divide-slate-100 text-sm">
                    <li
                        v-for="o in recent_orders"
                        :key="o.id"
                        class="flex justify-between py-2"
                    >
                        <Link
                            :href="route('orders.show', { laundry_order: o.id })"
                            class="text-sky-700 hover:underline"
                            >{{ o.order_code }}</Link
                        >
                        <span class="text-slate-500">{{ o.customer?.full_name }}</span>
                    </li>
                </ul>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="font-semibold text-slate-800">Inventory alerts</h2>
                <ul class="mt-3 text-sm text-slate-600">
                    <li
                        v-for="a in inventory_alerts"
                        :key="a.id"
                        class="py-1"
                    >
                        {{ a.item_name }} — {{ a.quantity }} {{ a.unit }} (≤ {{ a.reorder_level }})
                    </li>
                    <li
                        v-if="!inventory_alerts?.length"
                        class="text-slate-400"
                    >
                        No alerts.
                    </li>
                </ul>
            </div>
        </div>
    </AppShell>
</template>
