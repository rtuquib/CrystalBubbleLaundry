<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

const props = defineProps({
    orders: Object,
    filters: Object,
    statuses: Array,
});

const q = ref(props.filters.q ?? '');
const status = ref(props.filters.status ?? '');

watch([q, status], ([nvQ, nvSt]) => {
    router.get(
        route('orders.index'),
        { q: nvQ, status: nvSt },
        { preserveState: true, replace: true },
    );
});
</script>

<template>
    <AppShell>
        <Head title="Orders" />
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-slate-800">Laundry orders</h1>
                <p class="text-sm text-slate-500">Create orders, track status, and manage pickup.</p>
            </div>
            <Link
                :href="route('orders.create')"
                class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                >New order</Link
            >
        </div>

        <div class="mt-4 flex flex-wrap gap-3">
            <input
                v-model="q"
                type="search"
                placeholder="Order code..."
                class="rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
            <select
                v-model="status"
                class="rounded-xl border border-slate-200 px-4 py-2 text-sm"
            >
                <option value="">All statuses</option>
                <option
                    v-for="s in statuses"
                    :key="s.value"
                    :value="s.value"
                >
                    {{ s.label }}
                </option>
            </select>
        </div>

        <div class="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                        <th class="px-4 py-3">Code</th>
                        <th class="px-4 py-3">Customer</th>
                        <th class="px-4 py-3">Services</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3">Amount</th>
                        <th class="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="o in orders.data"
                        :key="o.id"
                    >
                        <td class="px-4 py-3 font-mono text-xs">{{ o.order_code }}</td>
                        <td class="px-4 py-3">{{ o.customer?.full_name }}</td>
                        <td class="px-4 py-3 text-slate-600">{{ o.service_type }}</td>
                        <td class="px-4 py-3 capitalize">{{ o.status }}</td>
                        <td class="px-4 py-3">₱ {{ o.amount }}</td>
                        <td class="px-4 py-3">
                            <Link
                                :href="route('orders.show', { laundry_order: o.id })"
                                class="text-sky-600 hover:underline"
                                >View</Link
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppShell>
</template>
