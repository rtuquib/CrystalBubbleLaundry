<script setup>
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';

const page = usePage();
const user = computed(() => page.props.auth.user);
const isAdmin = computed(() => user.value?.role === 'admin');
const isSuperAdmin = computed(() => user.value?.role === 'super_admin');
const unread = computed(() => page.props.unread_notifications_count ?? 0);
const flash = computed(() => page.props.flash ?? {});

const dashHref = computed(() =>
    isSuperAdmin.value ? route('super-admin.dashboard') : (isAdmin.value ? route('admin.dashboard') : route('staff.dashboard')),
);
</script>

<template>
    <div class="min-h-screen bg-slate-100">
        <div class="flex min-h-screen">
            <aside
                class="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-sky-900 text-white lg:flex"
            >
                <div class="border-b border-white/10 px-5 py-6">
                    <p class="text-lg font-semibold leading-tight">Crystal Bubble</p>
                    <p class="text-xs text-sky-200">Laundry Management</p>
                </div>
                <nav class="flex flex-1 flex-col gap-1 px-3 py-4 text-sm">
                    <template v-if="isSuperAdmin">
                        <Link :href="route('super-admin.dashboard')" class="rounded-lg bg-white/15 px-3 py-2">All stores</Link>
                    </template>
                    <template v-else>
                    <Link
                        :href="dashHref"
                        class="rounded-lg px-3 py-2 hover:bg-white/10"
                        :class="{ 'bg-white/15': $page.url.startsWith('/admin/dashboard') || $page.url.startsWith('/staff/dashboard') }"
                    >
                        Dashboard
                    </Link>
                    <Link
                        :href="route('customers.index')"
                        class="rounded-lg px-3 py-2 hover:bg-white/10"
                        :class="{ 'bg-white/15': $page.url.startsWith('/customers') }"
                    >
                        Customers
                    </Link>
                    <Link
                        :href="route('orders.index')"
                        class="rounded-lg px-3 py-2 hover:bg-white/10"
                        :class="{ 'bg-white/15': $page.url.startsWith('/orders') }"
                    >
                        Orders
                    </Link>
                    <Link
                        :href="route('payments.index')"
                        class="rounded-lg px-3 py-2 hover:bg-white/10"
                        :class="{ 'bg-white/15': $page.url.startsWith('/payments') }"
                    >
                        Payments
                    </Link>
                    <Link
                        :href="route('inventory.index')"
                        class="rounded-lg px-3 py-2 hover:bg-white/10"
                        :class="{ 'bg-white/15': $page.url.startsWith('/inventory') }"
                    >
                        Inventory
                    </Link>
                    <Link
                        :href="route('reports.index')"
                        class="rounded-lg px-3 py-2 hover:bg-white/10"
                        :class="{ 'bg-white/15': $page.url.startsWith('/reports') }"
                    >
                        Reports
                    </Link>
                    <Link
                        :href="isSuperAdmin ? route('super-admin.dashboard') : route('notifications.index')"
                        class="rounded-lg px-3 py-2 hover:bg-white/10"
                        :class="{ 'bg-white/15': $page.url.startsWith('/notifications') }"
                    >
                        Notifications
                        <span
                            v-if="unread > 0"
                            class="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-sky-900"
                            >{{ unread }}</span
                        >
                    </Link>
                    <template v-if="isAdmin">
                        <Link
                            :href="route('admin.activity-logs')"
                            class="rounded-lg px-3 py-2 hover:bg-white/10"
                            :class="{ 'bg-white/15': $page.url.startsWith('/admin/activity-logs') }"
                        >
                            Activity logs
                        </Link>
                        <Link
                            :href="route('admin.staff.index')"
                            class="rounded-lg px-3 py-2 hover:bg-white/10"
                            :class="{ 'bg-white/15': $page.url.startsWith('/admin/staff') }"
                        >
                            Staff accounts
                        </Link>
                    </template>
                    </template>
                </nav>
                <div class="border-t border-white/10 p-4 text-xs text-sky-200">
                    <p class="font-medium text-white">{{ user?.name }}</p>
                    <p class="capitalize">{{ isSuperAdmin ? 'Super admin' : user?.store?.name }}</p>
                    <Link
                        :href="route('profile.edit')"
                        class="mt-2 block text-sky-100 underline hover:text-white"
                        >Profile</Link
                    >
                    <Link
                        :href="route('logout')"
                        method="post"
                        as="button"
                        class="mt-1 block text-sky-100 underline hover:text-white"
                        >Log out</Link
                    >
                </div>
            </aside>

            <div class="flex min-w-0 flex-1 flex-col">
                <header
                    class="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden"
                >
                    <span class="font-semibold text-slate-800">Crystal Bubble</span>
                    <Link
                        :href="isSuperAdmin ? route('super-admin.dashboard') : route('notifications.index')"
                        class="relative text-sm text-sky-700"
                    >
                        🔔
                        <span
                            v-if="unread > 0"
                            class="absolute -right-2 -top-1 rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-sky-900"
                            >{{ unread }}</span
                        >
                    </Link>
                </header>
                <main class="flex-1 p-4 sm:p-6 lg:p-8">
                    <div
                        v-if="flash.success"
                        class="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
                    >
                        {{ flash.success }}
                    </div>
                    <div
                        v-if="flash.error"
                        class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                    >
                        {{ flash.error }}
                    </div>
                    <slot />
                </main>
            </div>
        </div>
    </div>
</template>
