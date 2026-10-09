<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    items: Object,
    low_stock: Array,
});
</script>

<template>
    <AppShell>
        <Head title="Inventory" />
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-slate-800">Inventory</h1>
                <p class="text-sm text-slate-500">Stock levels, movements, and low-stock alerts.</p>
            </div>
            <Link
                :href="route('inventory.create')"
                class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white"
                >Add item</Link
            >
        </div>

        <div
            v-if="low_stock?.length"
            class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
            <p class="font-semibold">Low stock</p>
            <ul class="mt-2 list-disc pl-5">
                <li
                    v-for="x in low_stock"
                    :key="x.id"
                >
                    {{ x.item_name }} — {{ x.quantity }} {{ x.unit }}
                </li>
            </ul>
        </div>

        <div class="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                        <th class="px-4 py-3">Item</th>
                        <th class="px-4 py-3">Category</th>
                        <th class="px-4 py-3">Qty</th>
                        <th class="px-4 py-3">Reorder</th>
                        <th class="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="it in items.data"
                        :key="it.id"
                    >
                        <td class="px-4 py-3 font-medium">{{ it.item_name }}</td>
                        <td class="px-4 py-3 capitalize">{{ it.category }}</td>
                        <td class="px-4 py-3">{{ it.quantity }} {{ it.unit }}</td>
                        <td class="px-4 py-3">{{ it.reorder_level }}</td>
                        <td class="px-4 py-3">
                            <Link
                                :href="route('inventory.edit', { inventory_item: it.id })"
                                class="text-sky-600 hover:underline"
                                >Manage</Link
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppShell>
</template>
