<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm } from '@inertiajs/vue3';

const props = defineProps({
    item: Object,
});

const form = useForm({
    item_name: props.item.item_name,
    category: props.item.category,
    unit: props.item.unit,
    reorder_level: Number(props.item.reorder_level),
    status: props.item.status,
});

const mov = useForm({
    type: 'stock_in',
    quantity: 1,
    notes: '',
});

const submit = () => form.put(route('inventory.update', { inventory_item: props.item.id }));

const submitMov = () =>
    mov.post(route('inventory.movement', { inventory_item: props.item.id }), {
        preserveScroll: true,
        onSuccess: () => mov.reset('notes'),
    });
</script>

<template>
    <AppShell>
        <Head :title="item.item_name" />
        <h1 class="text-2xl font-semibold text-slate-800">Edit {{ item.item_name }}</h1>
        <p class="text-sm text-slate-500">On hand: {{ item.quantity }} {{ item.unit }}</p>

        <form
            class="mt-6 max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            @submit.prevent="submit"
        >
            <div>
                <label class="text-sm text-slate-600">Name</label>
                <TextInput
                    v-model="form.item_name"
                    class="mt-1 block w-full"
                    required
                />
            </div>
            <div>
                <label class="text-sm text-slate-600">Category</label>
                <select
                    v-model="form.category"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                    <option value="detergent">Detergent</option>
                    <option value="softener">Softener</option>
                    <option value="packaging">Packaging</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label class="text-sm text-slate-600">Unit</label>
                <TextInput
                    v-model="form.unit"
                    class="mt-1 block w-full"
                />
            </div>
            <div>
                <label class="text-sm text-slate-600">Reorder level</label>
                <input
                    v-model.number="form.reorder_level"
                    type="number"
                    min="0"
                    step="0.001"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                />
            </div>
            <div>
                <label class="text-sm text-slate-600">Status</label>
                <select
                    v-model="form.status"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <PrimaryButton :disabled="form.processing">Save metadata</PrimaryButton>
        </form>

        <h2 class="mt-10 text-lg font-semibold text-slate-800">Stock in / out</h2>
        <form
            class="mt-3 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            @submit.prevent="submitMov"
        >
            <div>
                <label class="text-xs text-slate-500">Type</label>
                <select
                    v-model="mov.type"
                    class="mt-1 block rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                    <option value="stock_in">Stock in</option>
                    <option value="stock_out">Stock out</option>
                </select>
            </div>
            <div>
                <label class="text-xs text-slate-500">Quantity</label>
                <input
                    v-model.number="mov.quantity"
                    type="number"
                    min="0.001"
                    step="0.001"
                    class="mt-1 block w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="text-xs text-slate-500">Notes</label>
                <input
                    v-model="mov.notes"
                    type="text"
                    class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
            </div>
            <PrimaryButton :disabled="mov.processing">Apply</PrimaryButton>
        </form>

        <h2 class="mt-10 text-lg font-semibold text-slate-800">Recent movements</h2>
        <ul class="mt-2 space-y-1 text-sm text-slate-600">
            <li
                v-for="m in item.movements"
                :key="m.id"
            >
                {{ m.type }} · {{ m.quantity }} · {{ m.created_at }}
            </li>
        </ul>
    </AppShell>
</template>
