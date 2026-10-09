<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

const props = defineProps({
    payments: Object,
    filters: Object,
    can_manage_receipts: Boolean,
});

const method = ref(props.filters.payment_method ?? '');
const status = ref(props.filters.payment_status ?? '');

watch([method, status], () => {
    router.get(
        route('payments.index'),
        { payment_method: method.value || undefined, payment_status: status.value || undefined },
        { preserveState: true, replace: true },
    );
});
</script>

<template>
    <AppShell>
        <Head title="Payments" />
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-slate-800">Payments</h1>
                <p class="text-sm text-slate-500">Receipts, methods, and history.</p>
            </div>
            <Link
                :href="route('payments.create')"
                class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white"
                >Record payment</Link
            >
        </div>

        <div class="mt-4 flex flex-wrap gap-3">
            <select
                v-model="method"
                class="rounded-xl border border-slate-200 px-4 py-2 text-sm"
            >
                <option value="">All methods</option>
                <option value="cash">Cash</option>
                <option value="digital">Digital</option>
            </select>
            <select
                v-model="status"
                class="rounded-xl border border-slate-200 px-4 py-2 text-sm"
            >
                <option value="">All statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
            </select>
        </div>

        <div class="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                        <th class="px-4 py-3">OR Number</th>
                        <th class="px-4 py-3">Order</th>
                        <th class="px-4 py-3">Customer</th>
                        <th class="px-4 py-3">Amount</th>
                        <th class="px-4 py-3">Method</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="p in payments.data"
                        :key="p.id"
                    >
                        <td class="px-4 py-3 font-mono text-xs">
                            {{ p.receipt_number.startsWith('OR-') ? p.receipt_number : 'Awaiting confirmation' }}
                        </td>
                        <td class="px-4 py-3 font-mono text-xs">{{ p.laundry_order?.order_code }}</td>
                        <td class="px-4 py-3">{{ p.customer?.full_name }}</td>
                        <td class="px-4 py-3">₱ {{ p.amount_paid }}</td>
                        <td class="px-4 py-3 capitalize">{{ p.payment_method }}</td>
                        <td class="px-4 py-3 capitalize">{{ p.payment_status }}</td>
                        <td class="px-4 py-3">
                            <div class="flex justify-end gap-2">
                                <Link
                                    :href="route('receipts.show', p.id)"
                                    class="rounded-lg border border-slate-300 px-3 py-1 text-xs text-slate-700"
                                >
                                    View
                                </Link>
                                <button
                                    v-if="can_manage_receipts && !p.receipt_number.startsWith('OR-')"
                                    type="button"
                                    class="rounded-lg bg-emerald-600 px-3 py-1 text-xs text-white"
                                    @click="router.post(route('payments.confirm', p.id))"
                                >
                                    Confirm payment
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppShell>
</template>
