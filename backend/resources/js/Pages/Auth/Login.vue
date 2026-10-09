<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

defineProps({
    canResetPassword: { type: Boolean, default: true },
    status: { type: String, default: null },
});

const showPassword = ref(false);
const form = useForm({ email: '', password: '', remember: true });

const submit = () => form.post(route('login'), {
    onFinish: () => form.reset('password'),
});
</script>

<template>
    <Head title="Sign in" />
    <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-sky-200 via-blue-100 to-cyan-100 px-4 py-8">
        <div class="pointer-events-none absolute inset-0 bg-blue-500/20"></div>
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.85),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_70%_85%,rgba(56,189,248,0.16),transparent_35%)]"></div>

        <section class="relative z-10 w-full max-w-[538px] rounded-[22px] border border-white/70 bg-white px-8 py-9 shadow-[0_24px_48px_-12px_rgba(37,99,235,0.3)] sm:px-9 sm:py-10">
            <div class="mb-3 flex justify-center">
                <div class="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-md">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-600 ring-2 ring-white">
                        <svg viewBox="0 0 32 32" class="h-7 w-7" aria-hidden="true">
                            <path fill="white" d="m9 5 4-2h6l4 2 6 4-4 6-3-2v15H10V13l-3 2-4-6 6-4Zm4 0a3 3 0 0 0 6 0l-2-1h-2l-2 1Z" />
                        </svg>
                    </div>
                </div>
            </div>

            <h1 class="text-center text-4xl font-semibold tracking-tight text-blue-700 sm:text-[46px]">Sign in</h1>
            <p class="mt-2 text-center text-base text-slate-500 sm:text-lg">Welcome back! Please log in to your account</p>

            <div v-if="status" class="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{{ status }}</div>

            <form class="mt-6 space-y-5" @submit.prevent="submit">
                <div>
                    <label for="email" class="mb-2 block text-sm font-semibold text-slate-600">Email</label>
                    <input id="email" v-model.trim="form.email" type="email" autocomplete="username" autofocus required placeholder="Email address" class="w-full rounded-full border border-slate-300 bg-white px-5 py-4 text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                    <p v-if="form.errors.email" class="mt-1 text-sm text-red-600">{{ form.errors.email }}</p>
                </div>

                <div>
                    <label for="password" class="mb-2 block text-sm font-semibold text-slate-600">Password</label>
                    <div class="relative">
                        <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required placeholder="Password" class="w-full rounded-full border border-slate-300 bg-white px-5 py-4 pr-20 text-base text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                        <button type="button" class="absolute inset-y-0 right-0 px-5 text-sm font-semibold text-blue-600 hover:text-blue-700" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button>
                    </div>
                    <p v-if="form.errors.password" class="mt-1 text-sm text-red-600">{{ form.errors.password }}</p>
                </div>

                <div class="flex items-center justify-between gap-3 text-sm">
                    <label class="inline-flex cursor-pointer select-none items-center gap-2 text-slate-700">
                        <input v-model="form.remember" type="checkbox" class="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-300" />
                        <span>Remember me</span>
                    </label>
                    <Link v-if="canResetPassword" :href="route('password.request')" class="font-semibold text-blue-600 hover:text-blue-700">Forgot password?</Link>
                </div>

                <button type="submit" :disabled="form.processing" class="w-full rounded-md bg-gradient-to-r from-blue-600 to-blue-700 py-3.5 text-lg font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {{ form.processing ? 'Signing in…' : 'Login' }}
                </button>

                <div class="h-px w-full bg-slate-200"></div>
                <p class="text-center text-sm text-slate-500">Need an account? <span class="font-medium text-slate-600">Contact your store administrator.</span></p>
            </form>
        </section>
    </main>
</template>
