<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import InputError from '@/Components/InputError.vue';
import InputLabel from '@/Components/InputLabel.vue';
import PrimaryButton from '@/Components/PrimaryButton.vue';
import TextInput from '@/Components/TextInput.vue';
import { Head, Link, router, useForm } from '@inertiajs/vue3';

const props = defineProps({
    notifications: Object,
    recipients: Array,
});

const form = useForm({
    recipient_id: props.recipients?.[0]?.id ?? '',
    title: '',
    message: '',
    type: 'general',
});

const submit = () => form.post(route('notifications.store'), { preserveScroll: true });

const markRead = (id) => {
    router.patch(route('notifications.read', { app_notification: id }), {}, { preserveScroll: true });
};
</script>

<template>
    <AppShell>
        <Head title="Notifications" />
        <h1 class="text-2xl font-semibold text-slate-800">Notifications</h1>
        <p class="mt-1 text-sm text-slate-500">Internal messages between admin and staff.</p>

        <div class="mt-8 grid gap-8 lg:grid-cols-2">
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-800">Compose</h2>
                <p
                    v-if="!recipients?.length"
                    class="mt-3 text-sm text-amber-800"
                >
                    No recipients are available. Add a staff user (admin) or ensure an admin account exists (staff).
                </p>
                <form
                    v-else
                    class="mt-4 space-y-4"
                    @submit.prevent="submit"
                >
                    <div>
                        <InputLabel
                            for="recipient_id"
                            value="Send to"
                        />
                        <select
                            id="recipient_id"
                            v-model="form.recipient_id"
                            class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            required
                        >
                            <option
                                v-for="r in recipients"
                                :key="r.id"
                                :value="r.id"
                            >
                                {{ r.name }} ({{ r.email }})
                            </option>
                        </select>
                        <InputError
                            class="mt-1"
                            :message="form.errors.recipient_id"
                        />
                    </div>
                    <div>
                        <InputLabel
                            for="title"
                            value="Title"
                        />
                        <TextInput
                            id="title"
                            v-model="form.title"
                            class="mt-1 block w-full"
                            required
                        />
                        <InputError
                            class="mt-1"
                            :message="form.errors.title"
                        />
                    </div>
                    <div>
                        <InputLabel
                            for="message"
                            value="Message"
                        />
                        <textarea
                            id="message"
                            v-model="form.message"
                            rows="4"
                            class="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
                            required
                        />
                        <InputError
                            class="mt-1"
                            :message="form.errors.message"
                        />
                    </div>
                    <div>
                        <InputLabel
                            for="type"
                            value="Type (optional)"
                        />
                        <TextInput
                            id="type"
                            v-model="form.type"
                            class="mt-1 block w-full"
                        />
                    </div>
                    <PrimaryButton :disabled="form.processing">Send</PrimaryButton>
                </form>
            </section>

            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 class="text-lg font-semibold text-slate-800">Inbox</h2>
                <ul class="mt-4 divide-y divide-slate-100">
                    <li
                        v-for="n in notifications.data"
                        :key="n.id"
                        class="py-4"
                        :class="{ 'bg-sky-50/50 -mx-2 rounded-xl px-2': !n.is_read }"
                    >
                        <div class="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <p class="font-medium text-slate-800">{{ n.title }}</p>
                                <p class="text-xs text-slate-500">
                                    From {{ n.sender?.name ?? 'System' }} · {{ n.created_at }}
                                </p>
                            </div>
                            <button
                                v-if="!n.is_read"
                                type="button"
                                class="text-sm text-sky-600 hover:underline"
                                @click="markRead(n.id)"
                            >
                                Mark read
                            </button>
                            <span
                                v-else
                                class="text-xs text-slate-400"
                                >Read</span
                            >
                        </div>
                        <p class="mt-2 whitespace-pre-wrap text-sm text-slate-600">{{ n.message }}</p>
                    </li>
                    <li
                        v-if="!notifications.data?.length"
                        class="py-8 text-center text-slate-500"
                    >
                        No messages yet.
                    </li>
                </ul>
                <div
                    v-if="notifications.links?.length > 3"
                    class="mt-4 flex flex-wrap gap-1"
                >
                    <Link
                        v-for="l in notifications.links"
                        :key="l.label"
                        :href="l.url || '#'"
                        class="rounded-lg px-3 py-1 text-sm"
                        :class="l.active ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600 ring-1 ring-slate-200'"
                        :preserve-scroll="true"
                    >
                        <span v-html="l.label" />
                    </Link>
                </div>
            </section>
        </div>
    </AppShell>
</template>
