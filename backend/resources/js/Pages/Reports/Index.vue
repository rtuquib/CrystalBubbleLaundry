<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    filters: Object,
    daily_sales: Array,
    monthly_revenue: Array,
    customer_analytics: Array,
    order_volume: Object,
    service_popularity: Object,
    payment_summary: Array,
    inventory_usage: Array,
    status_options: Array,
});

const from = ref(props.filters.from ?? '');
const to = ref(props.filters.to ?? '');
const serviceType = ref(props.filters.service ?? '');
const paymentMethod = ref(props.filters.payMethod ?? '');
const orderStatus = ref(props.filters.orderStatus ?? '');

const applyFilters = () => {
    router.get(
        route('reports.index'),
        {
            from: from.value,
            to: to.value,
            service_type: serviceType.value || undefined,
            payment_method: paymentMethod.value || undefined,
            order_status: orderStatus.value || undefined,
        },
        { preserveState: true, replace: true },
    );
};

const fmtMoney = (n) => {
    const x = Number(n);
    return Number.isFinite(x) ? x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
};

const statusLabel = (key) => {
    const o = props.status_options?.find((s) => s.value === key);
    return o?.label ?? key;
};
</script>

<template>
    <AppShell>
        <Head title="Reports" />
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-slate-800">Reports &amp; analytics</h1>
                <p class="text-sm text-slate-500">Sales, orders, customers, payments, and inventory usage.</p>
            </div>
        </div>

        <form
            class="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6"
            @submit.prevent="applyFilters"
        >
            <div>
                <label class="text-xs font-medium text-slate-500">From</label>
                <input
                    v-model="from"
                    type="date"
                    class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
            </div>
            <div>
                <label class="text-xs font-medium text-slate-500">To</label>
                <input
                    v-model="to"
                    type="date"
                    class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
            </div>
            <div>
                <label class="text-xs font-medium text-slate-500">Service type (contains)</label>
                <input
                    v-model="serviceType"
                    type="text"
                    placeholder="e.g. Wash"
                    class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
            </div>
            <div>
                <label class="text-xs font-medium text-slate-500">Payment method</label>
                <select
                    v-model="paymentMethod"
                    class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                    <option value="">Any</option>
                    <option value="cash">Cash</option>
                    <option value="digital">Digital</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-medium text-slate-500">Order status</label>
                <select
                    v-model="orderStatus"
                    class="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                    <option value="">Any</option>
                    <option
                        v-for="s in status_options"
                        :key="s.value"
                        :value="s.value"
                    >
                        {{ s.label }}
                    </option>
                </select>
            </div>
            <div class="flex items-end">
                <button
                    type="submit"
                    class="w-full rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                >
                    Apply
                </button>
            </div>
        </form>

        <div class="mt-8 grid gap-6 lg:grid-cols-2">
            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-800">Daily sales (payments)</h2>
                <div class="mt-4 overflow-x-auto">
                    <table class="min-w-full text-left text-sm">
                        <thead class="border-b border-slate-100 text-slate-500">
                            <tr>
                                <th class="py-2 pr-4">Day</th>
                                <th class="py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr
                                v-for="row in daily_sales"
                                :key="row.day"
                            >
                                <td class="py-2 pr-4 font-mono text-xs">{{ row.day }}</td>
                                <td class="py-2">₱{{ fmtMoney(row.total) }}</td>
                            </tr>
                            <tr v-if="!daily_sales?.length">
                                <td
                                    colspan="2"
                                    class="py-4 text-slate-500"
                                >
                                    No payment data in range.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-800">Monthly revenue</h2>
                <div class="mt-4 overflow-x-auto">
                    <table class="min-w-full text-left text-sm">
                        <thead class="border-b border-slate-100 text-slate-500">
                            <tr>
                                <th class="py-2 pr-4">Month</th>
                                <th class="py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr
                                v-for="row in monthly_revenue"
                                :key="row.month"
                            >
                                <td class="py-2 pr-4 font-mono text-xs">{{ row.month }}</td>
                                <td class="py-2">₱{{ fmtMoney(row.total) }}</td>
                            </tr>
                            <tr v-if="!monthly_revenue?.length">
                                <td
                                    colspan="2"
                                    class="py-4 text-slate-500"
                                >
                                    No revenue in range.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-2">
            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-800">Order volume</h2>
                <p class="mt-1 text-2xl font-bold text-sky-800">{{ order_volume?.total ?? 0 }}</p>
                <p class="text-xs text-slate-500">Orders created in date range</p>
                <ul class="mt-4 space-y-2 text-sm">
                    <li
                        v-for="(count, key) in order_volume?.by_status ?? {}"
                        :key="key"
                        class="flex justify-between border-b border-slate-50 pb-2"
                    >
                        <span>{{ statusLabel(key) }}</span>
                        <span class="font-medium">{{ count }}</span>
                    </li>
                </ul>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-800">Service popularity (line items)</h2>
                <ul
                    v-if="service_popularity"
                    class="mt-4 grid grid-cols-2 gap-3 text-sm"
                >
                    <li class="rounded-xl bg-slate-50 px-3 py-2">
                        <span class="text-slate-500">Wash</span>
                        <p class="text-lg font-semibold">{{ Number(service_popularity.wash) || 0 }}</p>
                    </li>
                    <li class="rounded-xl bg-slate-50 px-3 py-2">
                        <span class="text-slate-500">Dry</span>
                        <p class="text-lg font-semibold">{{ Number(service_popularity.dry) || 0 }}</p>
                    </li>
                    <li class="rounded-xl bg-slate-50 px-3 py-2">
                        <span class="text-slate-500">Fold</span>
                        <p class="text-lg font-semibold">{{ Number(service_popularity.fold) || 0 }}</p>
                    </li>
                    <li class="rounded-xl bg-slate-50 px-3 py-2">
                        <span class="text-slate-500">Iron</span>
                        <p class="text-lg font-semibold">{{ Number(service_popularity.iron) || 0 }}</p>
                    </li>
                </ul>
                <p
                    v-else
                    class="mt-4 text-slate-500"
                >
                    No item data.
                </p>
            </section>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-2">
            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-800">Payment summary</h2>
                <table class="mt-4 min-w-full text-left text-sm">
                    <thead class="border-b border-slate-100 text-slate-500">
                        <tr>
                            <th class="py-2 pr-4">Method</th>
                            <th class="py-2 pr-4">Count</th>
                            <th class="py-2">Total</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr
                            v-for="row in payment_summary"
                            :key="row.payment_method"
                        >
                            <td class="py-2 pr-4 capitalize">{{ row.payment_method }}</td>
                            <td class="py-2 pr-4">{{ row.cnt }}</td>
                            <td class="py-2">₱{{ fmtMoney(row.total) }}</td>
                        </tr>
                        <tr v-if="!payment_summary?.length">
                            <td
                                colspan="3"
                                class="py-4 text-slate-500"
                            >
                                No payments in range.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-800">Inventory usage (out / adjustments)</h2>
                <ul class="mt-4 space-y-2 text-sm">
                    <li
                        v-for="row in inventory_usage"
                        :key="row.inventory_item_id"
                        class="flex justify-between border-b border-slate-50 pb-2"
                    >
                        <span>{{ row.inventory_item?.item_name ?? 'Item' }}</span>
                        <span class="font-mono text-xs text-slate-600">
                            {{ Number(row.qty).toFixed(3) }} {{ row.inventory_item?.unit }}
                        </span>
                    </li>
                    <li
                        v-if="!inventory_usage?.length"
                        class="text-slate-500"
                    >
                        No stock movements in range.
                    </li>
                </ul>
            </section>
        </div>

        <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-slate-800">Customer analytics (top 25 by order total)</h2>
            <div class="mt-4 overflow-x-auto">
                <table class="min-w-full text-left text-sm">
                    <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                        <tr>
                            <th class="px-3 py-2">Customer</th>
                            <th class="px-3 py-2">Orders</th>
                            <th class="px-3 py-2">Spend</th>
                            <th class="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr
                            v-for="c in customer_analytics"
                            :key="c.id"
                        >
                            <td class="px-3 py-2 font-medium text-slate-800">{{ c.full_name }}</td>
                            <td class="px-3 py-2">{{ c.orders_count }}</td>
                            <td class="px-3 py-2">₱{{ fmtMoney(c.spend) }}</td>
                            <td class="px-3 py-2">
                                <Link
                                    :href="route('customers.show', c.id)"
                                    class="text-sky-600 hover:underline"
                                    >Profile</Link
                                >
                            </td>
                        </tr>
                        <tr v-if="!customer_analytics?.length">
                            <td
                                colspan="4"
                                class="px-3 py-4 text-slate-500"
                            >
                                No customers yet.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </AppShell>
</template>
