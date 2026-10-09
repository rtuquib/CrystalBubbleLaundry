<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm } from '@inertiajs/vue3';

const props = defineProps({
    customers: Array,
});

const form = useForm({
    customer_id: props.customers[0]?.id ?? '',
    pickup_schedule: '',
    preferred_scent: '',
    preferred_detergent: '',
    notes: '',
    items: [
        {
            item_description: 'Mixed garments',
            quantity: 1,
            weight: 3,
            wash: true,
            dry: true,
            fold: true,
            iron: false,
        },
    ],
});

const addRow = () =>
    form.items.push({
        item_description: '',
        quantity: 1,
        weight: 1,
        wash: true,
        dry: false,
        fold: false,
        iron: false,
    });

const removeRow = (i) => form.items.splice(i, 1);

const onCustomer = () => {
    const c = props.customers.find((x) => x.id === Number(form.customer_id));
    if (c) {
        form.preferred_scent = c.preferred_scent ?? '';
        form.preferred_detergent = c.preferred_detergent ?? '';
    }
};

const submit = () => form.post(route('orders.store'));
</script>

<template>
    <AppShell>
        <Head title="New order" />
        <h1 class="text-2xl font-semibold text-slate-800">Create order</h1>
        <form
            class="mt-6 space-y-6"
            @submit.prevent="submit"
        >
            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <label class="text-sm font-medium text-slate-700">Customer</label>
                <select
                    v-model="form.customer_id"
                    class="mt-1 block w-full max-w-md rounded-xl border border-slate-200 px-3 py-2"
                    required
                    @change="onCustomer"
                >
                    <option
                        v-for="c in customers"
                        :key="c.id"
                        :value="c.id"
                    >
                        {{ c.full_name }} ({{ c.customer_code }})
                    </option>
                </select>
                <p
                    v-if="form.errors.customer_id"
                    class="mt-1 text-sm text-red-600"
                >
                    {{ form.errors.customer_id }}
                </p>
                <div class="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label class="text-sm text-slate-600">Pickup schedule</label>
                        <TextInput
                            v-model="form.pickup_schedule"
                            type="datetime-local"
                            class="mt-1 block w-full"
                        />
                    </div>
                </div>
                <div class="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label class="text-sm text-slate-600">Preferred scent</label>
                        <TextInput
                            v-model="form.preferred_scent"
                            class="mt-1 block w-full"
                        />
                    </div>
                    <div>
                        <label class="text-sm text-slate-600">Preferred detergent</label>
                        <TextInput
                            v-model="form.preferred_detergent"
                            class="mt-1 block w-full"
                        />
                    </div>
                </div>
                <div class="mt-4">
                    <label class="text-sm text-slate-600">Notes</label>
                    <textarea
                        v-model="form.notes"
                        rows="2"
                        class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <h2 class="font-semibold text-slate-800">Line items</h2>
                    <button
                        type="button"
                        class="text-sm text-sky-600 hover:underline"
                        @click="addRow"
                    >
                        + Add row
                    </button>
                </div>
                <div
                    v-for="(row, i) in form.items"
                    :key="i"
                    class="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-12"
                >
                    <div class="sm:col-span-5">
                        <label class="text-xs text-slate-500">Description</label>
                        <TextInput
                            v-model="row.item_description"
                            class="mt-1 block w-full"
                            required
                        />
                    </div>
                    <div class="sm:col-span-2">
                        <label class="text-xs text-slate-500">Qty</label>
                        <input
                            v-model.number="row.quantity"
                            type="number"
                            min="1"
                            class="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm"
                        />
                    </div>
                    <div class="sm:col-span-2">
                        <label class="text-xs text-slate-500">Weight (kg)</label>
                        <input
                            v-model.number="row.weight"
                            type="number"
                            min="0"
                            step="0.1"
                            class="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm"
                        />
                    </div>
                    <div class="flex flex-wrap items-end gap-3 sm:col-span-3">
                        <label class="flex items-center gap-1 text-xs"><input v-model="row.wash" type="checkbox" /> Wash</label>
                        <label class="flex items-center gap-1 text-xs"><input v-model="row.dry" type="checkbox" /> Dry</label>
                        <label class="flex items-center gap-1 text-xs"><input v-model="row.fold" type="checkbox" /> Fold</label>
                        <label class="flex items-center gap-1 text-xs"><input v-model="row.iron" type="checkbox" /> Iron</label>
                    </div>
                    <div class="sm:col-span-12">
                        <button
                            v-if="form.items.length > 1"
                            type="button"
                            class="text-xs text-red-600 hover:underline"
                            @click="removeRow(i)"
                        >
                            Remove row
                        </button>
                    </div>
                </div>
                <p
                    v-if="form.errors.items"
                    class="mt-2 text-sm text-red-600"
                >
                    {{ form.errors.items }}
                </p>
            </div>

            <PrimaryButton :disabled="form.processing">Submit order</PrimaryButton>
        </form>
    </AppShell>
</template>
