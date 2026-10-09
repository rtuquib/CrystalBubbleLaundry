<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, Link, router, useForm } from '@inertiajs/vue3';

const props = defineProps({
    order: Object,
    statuses: Array,
    total_paid: Number,
    balance: Number,
});

const statusForm = useForm({
    status: props.order.status,
    note: '',
});

const submitStatus = () =>
    statusForm.post(route('orders.status', { laundry_order: props.order.id }), {
        preserveScroll: true,
        onSuccess: () => statusForm.reset('note'),
    });

const destroy = () => {
    if (confirm('Delete this order?')) {
        router.delete(route('orders.destroy', { laundry_order: props.order.id }));
    }
};
</script>

<template>
    <AppShell>
        <Head :title="order.order_code" />
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
                <h1 class="text-2xl font-semibold text-slate-800">{{ order.order_code }}</h1>
                <p class="text-sm text-slate-500">{{ order.customer?.full_name }} · {{ order.service_type }}</p>
            </div>
            <div class="flex flex-wrap gap-2">
                <Link
                    :href="route('orders.edit', { laundry_order: order.id })"
                    class="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white"
                    >Edit</Link
                >
                <Link
                    :href="`${route('payments.create')}?laundry_order_id=${order.id}`"
                    class="rounded-xl bg-emerald-600 px-4 py-2 text-sm text-white"
                    >Record payment</Link
                >
                <button
                    type="button"
                    class="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600"
                    @click="destroy"
                >
                    Delete
                </button>
            </div>
        </div>

        <div class="mt-6 grid gap-4 lg:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <h2 class="font-semibold text-slate-800">Status &amp; timeline</h2>
                <p class="mt-1 text-sm capitalize text-sky-700">Current: {{ order.status }}</p>
                <form
                    class="mt-4 flex flex-wrap items-end gap-3"
                    @submit.prevent="submitStatus"
                >
                    <div>
                        <label class="text-xs text-slate-500">New status</label>
                        <select
                            v-model="statusForm.status"
                            class="mt-1 block rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        >
                            <option
                                v-for="s in statuses"
                                :key="s.value"
                                :value="s.value"
                            >
                                {{ s.label }}
                            </option>
                        </select>
                    </div>
                    <div class="flex-1 min-w-[200px]">
                        <label class="text-xs text-slate-500">Note</label>
                        <input
                            v-model="statusForm.note"
                            type="text"
                            class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>
                    <PrimaryButton :disabled="statusForm.processing">Update</PrimaryButton>
                </form>
                <ul class="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
                    <li
                        v-for="h in order.status_histories"
                        :key="h.id"
                        class="flex justify-between gap-2"
                    >
                        <span class="font-medium capitalize">{{ h.status }}</span>
                        <span class="text-slate-500">{{ h.created_at }} · {{ h.user?.name || '—' }}</span>
                    </li>
                </ul>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 class="font-semibold text-slate-800">Financials</h2>
                <p class="mt-2 text-sm text-slate-600">Order total: ₱ {{ order.amount }}</p>
                <p class="text-sm text-slate-600">Paid: ₱ {{ total_paid }}</p>
                <p class="text-sm font-semibold text-amber-700">Balance: ₱ {{ balance }}</p>
                <p class="mt-3 text-xs text-slate-500">Pickup: {{ order.pickup_schedule || '—' }}</p>
                <p class="text-xs text-slate-500">Scent: {{ order.preferred_scent || '—' }}</p>
                <p class="text-xs text-slate-500">Detergent: {{ order.preferred_detergent || '—' }}</p>
            </div>
        </div>

        <h2 class="mt-8 font-semibold text-slate-800">Items</h2>
        <div class="mt-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                        <th class="px-4 py-2">Description</th>
                        <th class="px-4 py-2">Qty</th>
                        <th class="px-4 py-2">Kg</th>
                        <th class="px-4 py-2">Services</th>
                        <th class="px-4 py-2">Line</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="it in order.items"
                        :key="it.id"
                    >
                        <td class="px-4 py-2">{{ it.item_description }}</td>
                        <td class="px-4 py-2">{{ it.quantity }}</td>
                        <td class="px-4 py-2">{{ it.weight }}</td>
                        <td class="px-4 py-2 text-xs">
                            <span v-if="it.wash">W </span>
                            <span v-if="it.dry">D </span>
                            <span v-if="it.fold">F </span>
                            <span v-if="it.iron">I</span>
                        </td>
                        <td class="px-4 py-2">₱ {{ it.line_amount }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppShell>
</template>
