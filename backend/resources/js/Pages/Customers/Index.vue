<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, watch } from 'vue';

const props = defineProps({
    customers: Object,
    filters: Object,
});

const q = ref(props.filters.q ?? '');

watch(q, (val) => {
    router.get(
        route('customers.index'),
        { q: val },
        { preserveState: true, replace: true },
    );
});
</script>

<template>
    <AppShell>
        <Head title="Customers" />
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-slate-800">Customers</h1>
                <p class="text-sm text-slate-500">Register, search, and open service history.</p>
            </div>
            <Link
                :href="route('customers.create')"
                class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                >Add customer</Link
            >
        </div>

        <div class="mt-4">
            <input
                v-model="q"
                type="search"
                placeholder="Search name, code, email, phone..."
                class="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
            />
        </div>

        <div class="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                        <th class="px-4 py-3">Code</th>
                        <th class="px-4 py-3">Name</th>
                        <th class="px-4 py-3">Contact</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="c in customers.data"
                        :key="c.id"
                    >
                        <td class="px-4 py-3 font-mono text-xs">{{ c.customer_code }}</td>
                        <td class="px-4 py-3 font-medium text-slate-800">{{ c.full_name }}</td>
                        <td class="px-4 py-3 text-slate-600">{{ c.contact_number || '—' }}</td>
                        <td class="px-4 py-3 capitalize">{{ c.status }}</td>
                        <td class="px-4 py-3">
                            <Link
                                :href="route('customers.show', c.id)"
                                class="text-sky-600 hover:underline"
                                >View</Link
                            >
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div
            v-if="customers.links?.length > 3"
            class="mt-4 flex flex-wrap gap-1"
        >
            <Link
                v-for="l in customers.links"
                :key="l.label"
                :href="l.url || '#'"
                class="rounded-lg px-3 py-1 text-sm"
                :class="l.active ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'"
                :preserve-scroll="true"
            >
                <span v-html="l.label" />
            </Link>
        </div>
    </AppShell>
</template>
