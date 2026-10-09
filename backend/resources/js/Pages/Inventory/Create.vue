<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm } from '@inertiajs/vue3';

const form = useForm({
    item_name: '',
    category: 'detergent',
    unit: 'unit',
    quantity: 0,
    reorder_level: 10,
    status: 'active',
});

const submit = () => form.post(route('inventory.store'));
</script>

<template>
    <AppShell>
        <Head title="Add inventory" />
        <h1 class="text-2xl font-semibold text-slate-800">Add inventory item</h1>
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
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-sm text-slate-600">Quantity</label>
                    <input
                        v-model.number="form.quantity"
                        type="number"
                        min="0"
                        step="0.001"
                        class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2"
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
            </div>
            <PrimaryButton :disabled="form.processing">Save</PrimaryButton>
        </form>
    </AppShell>
</template>
