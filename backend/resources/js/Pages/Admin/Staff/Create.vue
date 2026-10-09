<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, Link, useForm } from '@inertiajs/vue3';

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

const submit = () => form.post(route('admin.staff.store'));
</script>

<template>
    <AppShell>
        <Head title="Add staff" />
        <div class="flex items-center gap-4">
            <Link
                :href="route('admin.staff.index')"
                class="text-sm text-sky-600 hover:underline"
                >&larr; Back</Link
            >
        </div>
        <h1 class="mt-4 text-2xl font-semibold text-slate-800">New staff account</h1>

        <form
            class="mt-6 max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            @submit.prevent="submit"
        >
            <div>
                <InputLabel
                    for="name"
                    value="Name"
                />
                <TextInput
                    id="name"
                    v-model="form.name"
                    class="mt-1 block w-full"
                    required
                    autocomplete="name"
                />
                <InputError
                    class="mt-1"
                    :message="form.errors.name"
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
                    required
                    autocomplete="username"
                />
                <InputError
                    class="mt-1"
                    :message="form.errors.email"
                />
            </div>
            <div>
                <InputLabel
                    for="password"
                    value="Password"
                />
                <TextInput
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="mt-1 block w-full"
                    required
                    autocomplete="new-password"
                />
                <InputError
                    class="mt-1"
                    :message="form.errors.password"
                />
            </div>
            <div>
                <InputLabel
                    for="password_confirmation"
                    value="Confirm password"
                />
                <TextInput
                    id="password_confirmation"
                    v-model="form.password_confirmation"
                    type="password"
                    class="mt-1 block w-full"
                    required
                    autocomplete="new-password"
                />
            </div>
            <PrimaryButton :disabled="form.processing">Create account</PrimaryButton>
        </form>
    </AppShell>
</template>
