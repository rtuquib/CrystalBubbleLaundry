<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    kpis: Object,
    recent_orders: Array,
    inventory_alerts: Array,
    notifications_preview: Array,
});
</script>

<template>
    <AppShell>
        <Head title="Staff Dashboard" />
        <h1 class="text-2xl font-semibold text-slate-800">Operations dashboard</h1>
        <p class="mt-1 text-sm text-slate-500">Queue depth, pickups, and supply alerts.</p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs text-slate-500">In progress</p>
                <p class="mt-1 text-2xl font-bold text-sky-600">{{ kpis.in_progress }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs text-slate-500">Wash / dry</p>
                <p class="mt-1 text-2xl font-bold text-amber-600">{{ kpis.wash_dry }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs text-slate-500">Ready for pickup</p>
                <p class="mt-1 text-2xl font-bold text-emerald-600">{{ kpis.ready }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p class="text-xs text-slate-500">Payments today (₱)</p>
                <p class="mt-1 text-2xl font-bold text-slate-800">{{ kpis.payments_today }}</p>
            </div>
        </div>

        <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                    <span class="capitalize text-slate-500">{{ o.status }}</span>
                </li>
            </ul>
        </div>
    </AppShell>
</template>
