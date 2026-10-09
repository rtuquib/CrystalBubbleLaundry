<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, router, useForm } from '@inertiajs/vue3';

defineProps({ stores: Array, summary: Object });

const form = useForm({
    name: '', address: '', contact_email: '', admin_name: '', admin_email: '',
    admin_password: '', admin_password_confirmation: '',
});
const submit = () => form.post(route('super-admin.stores.store'), { onSuccess: () => form.reset() });
const setStatus = (store) => router.patch(route('super-admin.stores.status', store.id), {
    status: store.status === 'active' ? 'suspended' : 'active',
});
</script>

<template>
    <AppShell>
        <Head title="Super admin · Stores" />
        <h1 class="text-2xl font-semibold text-slate-800">Super admin dashboard</h1>
        <p class="mt-1 text-sm text-slate-500">Monitor stores using CrystalBubbleLaundry. Each store has separate customers, orders, payments, and inventory.</p>

        <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div v-for="(value, key) in { stores: summary.stores, active: summary.active, customers: summary.customers, orders: summary.orders, sales: summary.sales }" :key="key" class="rounded-xl border bg-white p-4">
                <p class="text-xs uppercase text-slate-500">{{ key === 'sales' ? 'Recorded sales' : key }}</p>
                <p class="mt-1 text-2xl font-bold text-sky-700">{{ key === 'sales' ? '₱' + Number(value).toLocaleString() : value }}</p>
            </div>
        </div>

        <section class="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold">Stores</h2>
            <div class="mt-4 overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="text-xs uppercase text-slate-500"><tr><th class="p-2">Store</th><th class="p-2">Status</th><th class="p-2">Accounts</th><th class="p-2">Customers</th><th class="p-2">Orders</th><th class="p-2">Recorded sales</th><th class="p-2"></th></tr></thead>
                    <tbody><tr v-for="store in stores" :key="store.id" class="border-t">
                        <td class="p-2"><p class="font-medium">{{ store.name }}</p><p class="text-xs text-slate-500">{{ store.code }} · {{ store.contact_email || 'No contact email' }}</p></td>
                        <td class="p-2"><span class="rounded-full px-2 py-1 text-xs" :class="store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">{{ store.status }}</span></td>
                        <td class="p-2">{{ store.users_count }}</td><td class="p-2">{{ store.customers_count }}</td><td class="p-2">{{ store.orders_count }}</td><td class="p-2">₱{{ Number(store.sales_total).toLocaleString() }}</td>
                        <td class="p-2"><button class="text-sky-700 underline" @click="setStatus(store)">{{ store.status === 'active' ? 'Suspend' : 'Reactivate' }}</button></td>
                    </tr></tbody>
                </table>
            </div>
        </section>

        <section class="mt-8 max-w-3xl rounded-2xl border bg-white p-5 shadow-sm">
            <h2 class="text-lg font-semibold">Onboard a store</h2>
            <p class="mt-1 text-sm text-slate-500">Create a separate store and its first administrator. Staff accounts can be added by that administrator.</p>
            <form class="mt-5 grid gap-4 sm:grid-cols-2" @submit.prevent="submit">
                <div><InputLabel for="store_name" value="Store name" /><TextInput id="store_name" v-model="form.name" class="mt-1 w-full" required /><InputError :message="form.errors.name" /></div>
                <div><InputLabel for="contact_email" value="Store contact email" /><TextInput id="contact_email" v-model="form.contact_email" type="email" class="mt-1 w-full" /><InputError :message="form.errors.contact_email" /></div>
                <div class="sm:col-span-2"><InputLabel for="address" value="Address" /><TextInput id="address" v-model="form.address" class="mt-1 w-full" /><InputError :message="form.errors.address" /></div>
                <div><InputLabel for="admin_name" value="Administrator name" /><TextInput id="admin_name" v-model="form.admin_name" class="mt-1 w-full" required /><InputError :message="form.errors.admin_name" /></div>
                <div><InputLabel for="admin_email" value="Administrator login email" /><TextInput id="admin_email" v-model="form.admin_email" type="email" class="mt-1 w-full" required /><InputError :message="form.errors.admin_email" /></div>
                <div><InputLabel for="admin_password" value="Temporary password (10+ characters)" /><TextInput id="admin_password" v-model="form.admin_password" type="password" class="mt-1 w-full" required /><InputError :message="form.errors.admin_password" /></div>
                <div><InputLabel for="admin_password_confirmation" value="Confirm password" /><TextInput id="admin_password_confirmation" v-model="form.admin_password_confirmation" type="password" class="mt-1 w-full" required /></div>
                <div class="sm:col-span-2"><PrimaryButton :disabled="form.processing">Create store and administrator</PrimaryButton></div>
            </form>
        </section>
    </AppShell>
</template>
