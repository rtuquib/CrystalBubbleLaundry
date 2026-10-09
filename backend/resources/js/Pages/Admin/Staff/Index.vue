<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link, router } from '@inertiajs/vue3';

defineProps({
    staff: Object,
});

const removeUser = (u) => {
    if (!confirm(`Remove staff account ${u.name}?`)) {
        return;
    }
    router.delete(route('admin.staff.destroy', { user: u.id }));
};
</script>

<template>
    <AppShell>
        <Head title="Staff accounts" />
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-semibold text-slate-800">Staff accounts</h1>
                <p class="text-sm text-slate-500">Create and manage operational logins.</p>
            </div>
            <Link
                :href="route('admin.staff.create')"
                class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                >Add staff</Link
            >
        </div>

        <div class="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table class="min-w-full text-left text-sm">
                <thead class="border-b border-slate-100 bg-slate-50 text-slate-500">
                    <tr>
                        <th class="px-4 py-3">Name</th>
                        <th class="px-4 py-3">Email</th>
                        <th class="px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    <tr
                        v-for="u in staff.data"
                        :key="u.id"
                    >
                        <td class="px-4 py-3 font-medium text-slate-800">{{ u.name }}</td>
                        <td class="px-4 py-3 text-slate-600">{{ u.email }}</td>
                        <td class="px-4 py-3 text-right">
                            <Link
                                :href="route('admin.staff.edit', { user: u.id })"
                                class="text-sky-600 hover:underline"
                                >Edit</Link
                            >
                            <button
                                type="button"
                                class="ml-4 text-red-600 hover:underline"
                                @click="removeUser(u)"
                            >
                                Remove
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!staff.data?.length">
                        <td
                            colspan="3"
                            class="px-4 py-8 text-center text-slate-500"
                        >
                            No staff users yet.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div
            v-if="staff.links?.length > 3"
            class="mt-4 flex flex-wrap gap-1"
        >
            <Link
                v-for="l in staff.links"
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
