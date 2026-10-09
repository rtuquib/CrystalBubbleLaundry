<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, useForm } from '@inertiajs/vue3';

const form = useForm({
    full_name: '',
    contact_number: '',
    address: '',
    email: '',
    gender: '',
    preferred_scent: '',
    preferred_detergent: '',
    notes: '',
    status: 'active',
});

const submit = () => form.post(route('customers.store'));
</script>

<template>
    <AppShell>
        <Head title="New customer" />
        <h1 class="text-2xl font-semibold text-slate-800">Add customer</h1>
        <form
            class="mt-6 max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            @submit.prevent="submit"
        >
            <div>
                <InputLabel
                    for="full_name"
                    value="Full name"
                />
                <TextInput
                    id="full_name"
                    v-model="form.full_name"
                    class="mt-1 block w-full"
                    required
                />
                <InputError
                    class="mt-1"
                    :message="form.errors.full_name"
                />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <InputLabel
                        for="contact_number"
                        value="Contact number"
                    />
                    <TextInput
                        id="contact_number"
                        v-model="form.contact_number"
                        class="mt-1 block w-full"
                    />
                </div>
                <div>
                    <InputLabel
                        for="email"
                        value="Email"
                    />
                    <TextInput
                        id="email"
                        v-model="form.email"
                        type="email"
                        class="mt-1 block w-full"
                    />
                </div>
            </div>
            <div>
                <InputLabel
                    for="address"
                    value="Address"
                />
                <TextInput
                    id="address"
                    v-model="form.address"
                    class="mt-1 block w-full"
                />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <InputLabel
                        for="gender"
                        value="Gender"
                    />
                    <TextInput
                        id="gender"
                        v-model="form.gender"
                        class="mt-1 block w-full"
                    />
                </div>
                <div>
                    <InputLabel
                        for="status"
                        value="Status"
                    />
                    <select
                        id="status"
                        v-model="form.status"
                        class="mt-1 block w-full rounded-md border border-slate-200"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
                <div>
                    <InputLabel
                        for="preferred_scent"
                        value="Preferred scent"
                    />
                    <TextInput
                        id="preferred_scent"
                        v-model="form.preferred_scent"
                        class="mt-1 block w-full"
                    />
                </div>
                <div>
                    <InputLabel
                        for="preferred_detergent"
                        value="Preferred detergent"
                    />
                    <TextInput
                        id="preferred_detergent"
                        v-model="form.preferred_detergent"
                        class="mt-1 block w-full"
                    />
                </div>
            </div>
            <div>
                <InputLabel
                    for="notes"
                    value="Notes"
                />
                <textarea
                    id="notes"
                    v-model="form.notes"
                    rows="3"
                    class="mt-1 block w-full rounded-md border border-slate-200"
                />
            </div>
            <PrimaryButton :disabled="form.processing">Save</PrimaryButton>
        </form>
    </AppShell>
</template>
