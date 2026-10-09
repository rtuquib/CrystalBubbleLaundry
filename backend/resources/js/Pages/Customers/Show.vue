<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link, router } from '@inertiajs/vue3';

defineProps({
    customer: Object,
});

const destroy = (id) => {
    if (confirm('Delete this customer?')) router.delete(route('customers.destroy', id));
};
</script>

<template>
    <AppShell>
        <Head :title="customer.full_name" />
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 class="text-2xl font-semibold text-slate-800">{{ customer.full_name }}</h1>
                <p class="font-mono text-sm text-slate-500">{{ customer.customer_code }}</p>
            </div>
            <div class="flex gap-2">
                <Link
                    :href="route('customers.edit', customer.id)"
                    class="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
                    >Edit</Link
                >
                <button
                    type="button"
                    class="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    @click="destroy(customer.id)"
                >
                    Delete
                </button>
            </div>
        </div>

        <dl class="mt-6 grid gap-4 sm:grid-cols-2 rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm">
            <div>
                <dt class="text-slate-500">Contact</dt>
                <dd class="font-medium">{{ customer.contact_number || '—' }}</dd>
            </div>
            <div>
                <dt class="text-slate-500">Email</dt>
                <dd class="font-medium">{{ customer.email || '—' }}</dd>
            </div>
            <div>
                <dt class="text-slate-500">Address</dt>
                <dd class="font-medium">{{ customer.address || '—' }}</dd>
            </div>
            <div>
                <dt class="text-slate-500">Preferences</dt>
                <dd class="font-medium">{{ customer.preferred_scent || '—' }} / {{ customer.preferred_detergent || '—' }}</dd>
            </div>
        </dl>

        <h2 class="mt-8 text-lg font-semibold text-slate-800">Service history</h2>
        <div class="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                        <th class="px-4 py-2">Order</th>
                        <th class="px-4 py-2">Status</th>
                        <th class="px-4 py-2">Amount</th>
                        <th class="px-4 py-2"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="o in customer.laundry_orders"
                        :key="o.id"
                    >
                        <td class="px-4 py-2 font-mono text-xs">{{ o.order_code }}</td>
                        <td class="px-4 py-2 capitalize">{{ o.status }}</td>
                        <td class="px-4 py-2">₱ {{ o.amount }}</td>
                        <td class="px-4 py-2">
                            <Link
                                :href="route('orders.show', { laundry_order: o.id })"
                                class="text-sky-600 hover:underline"
                                >Open</Link
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppShell>
</template>
