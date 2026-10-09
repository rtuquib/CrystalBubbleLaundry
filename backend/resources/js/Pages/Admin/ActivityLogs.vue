<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    logs: Object,
});
</script>

<template>
    <AppShell>
        <Head title="Activity logs" />
        <div>
            <h1 class="text-2xl font-semibold text-slate-800">Activity logs</h1>
            <p class="mt-1 text-sm text-slate-500">Recent user actions and system events.</p>
        </div>

        <div class="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                        <th class="px-4 py-3">When</th>
                        <th class="px-4 py-3">User</th>
                        <th class="px-4 py-3">Action</th>
                        <th class="px-4 py-3">Description</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="log in logs.data"
                        :key="log.id"
                    >
                        <td class="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-600">
                            {{ log.created_at }}
                        </td>
                        <td class="px-4 py-3">{{ log.user?.name ?? '—' }}</td>
                        <td class="px-4 py-3 font-mono text-xs">{{ log.action }}</td>
                        <td class="max-w-md px-4 py-3 text-slate-700">{{ log.description }}</td>
                    </tr>
                    <tr v-if="!logs.data?.length">
                        <td
                            colspan="4"
                            class="px-4 py-8 text-center text-slate-500"
                        >
                            No log entries yet.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div
            v-if="logs.links?.length > 3"
            class="mt-4 flex flex-wrap gap-1"
        >
            <Link
                v-for="l in logs.links"
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
