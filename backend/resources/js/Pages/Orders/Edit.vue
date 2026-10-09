<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm } from '@inertiajs/vue3';

const props = defineProps({
    order: Object,
    customers: Array,
});

const form = useForm({
    customer_id: props.order.customer_id,
    pickup_schedule: props.order.pickup_schedule?.slice(0, 16) ?? '',
    preferred_scent: props.order.preferred_scent ?? '',
    preferred_detergent: props.order.preferred_detergent ?? '',
    notes: props.order.notes ?? '',
    items: props.order.items.map((it) => ({
        item_description: it.item_description,
        quantity: it.quantity,
        weight: Number(it.weight),
        wash: !!it.wash,
        dry: !!it.dry,
        fold: !!it.fold,
        iron: !!it.iron,
    })),
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

const submit = () => form.put(route('orders.update', { laundry_order: props.order.id }));
</script>

<template>
    <AppShell>
        <Head title="Edit order" />
        <h1 class="text-2xl font-semibold text-slate-800">Edit {{ order.order_code }}</h1>
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
                >
                    <option
                        v-for="c in customers"
                        :key="c.id"
                        :value="c.id"
                    >
                        {{ c.full_name }}
                    </option>
                </select>
                <div class="mt-4">
                    <label class="text-sm text-slate-600">Pickup schedule</label>
                    <TextInput
                        v-model="form.pickup_schedule"
                        type="datetime-local"
                        class="mt-1 block w-full max-w-md"
                    />
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
                            class="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>
                    <div class="sm:col-span-2">
                        <label class="text-xs text-slate-500">Weight (kg)</label>
                        <input
                            v-model.number="row.weight"
                            type="number"
                            min="0"
                            step="0.1"
                            class="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
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
            </div>

            <PrimaryButton :disabled="form.processing">Save changes</PrimaryButton>
        </form>
    </AppShell>
</template>
