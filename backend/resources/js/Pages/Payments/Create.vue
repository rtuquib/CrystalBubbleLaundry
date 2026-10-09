<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { watch } from 'vue';

const props = defineProps({
    orders: Array,
    prefill_order_id: [Number, String, null],
});

const form = useForm({
    laundry_order_id: props.prefill_order_id || props.orders[0]?.id || '',
    amount_paid: '',
    payment_method: 'cash',
    reference_number: '',
    change_amount: 0,
});

watch(
    () => form.laundry_order_id,
    (id) => {
        const o = props.orders.find((x) => x.id === Number(id));
        if (o) {
            form.amount_paid = String(o.amount);
        }
    },
    { immediate: true },
);

const submit = () => form.post(route('payments.store'));
</script>

<template>
    <AppShell>
        <Head title="Record payment" />
        <h1 class="text-2xl font-semibold text-slate-800">Record payment</h1>
        <form
            class="mt-6 max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            @submit.prevent="submit"
        >
            <div>
                <label class="text-sm text-slate-600">Order</label>
                <select
                    v-model="form.laundry_order_id"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                    required
                >
                    <option
                        v-for="o in orders"
                        :key="o.id"
                        :value="o.id"
                    >
                        {{ o.order_code }} — {{ o.customer?.full_name }} (₱{{ o.amount }})
                    </option>
                </select>
            </div>
            <div>
                <label class="text-sm text-slate-600">Amount paid</label>
                <input
                    v-model="form.amount_paid"
                    type="number"
                    step="0.01"
                    min="0.01"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                    required
                />
            </div>
            <div>
                <label class="text-sm text-slate-600">Method</label>
                <select
                    v-model="form.payment_method"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                    <option value="cash">Cash</option>
                    <option value="digital">Digital</option>
                </select>
            </div>
            <div>
                <label class="text-sm text-slate-600">Reference (digital)</label>
                <input
                    v-model="form.reference_number"
                    type="text"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                />
            </div>
            <div>
                <label class="text-sm text-slate-600">Change (cash)</label>
                <input
                    v-model="form.change_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                />
            </div>
            <PrimaryButton :disabled="form.processing">Save</PrimaryButton>
        </form>
    </AppShell>
</template>
