<script setup>
import { Head, Link } from '@inertiajs/vue3';

defineProps({
    canLogin: { type: Boolean, default: true },
});
</script>

<template>
    <Head title="Crystal Bubble Laundry" />
    <div class="flex min-h-screen flex-col items-center justify-center bg-sky-600 px-4 text-white">
        <div class="max-w-lg text-center">
            <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Crystal Bubble Laundry</h1>
            <p class="mt-3 text-sky-100">
                Management system for customers, orders, payments, inventory, and live production status.
            </p>
            <div class="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                    v-if="canLogin"
                    :href="route('login')"
                    class="rounded-full bg-white px-8 py-3 text-sm font-semibold text-sky-700 shadow hover:bg-sky-50"
                >
                    Staff / Admin login
                </Link>
            </div>
            <p class="mt-8 text-xs text-sky-200">
                Customer records are managed internally. Contact your branch for service.
            </p>
        </div>
    </div>
</template>
