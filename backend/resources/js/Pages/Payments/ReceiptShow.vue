<script setup>
import AppShell from '@/Layouts/AppShell.vue';
import { Head, Link } from '@inertiajs/vue3';

const props = defineProps({
    payment: Object,
    can_manage_actions: Boolean,
});

const hasOfficialReceipt = props.payment.receipt_number?.startsWith('OR-');
</script>

<template>
    <AppShell>
        <Head :title="`Receipt ${payment.receipt_number}`" />
        <div class="space-y-6">
            <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-semibold text-slate-800">Official Receipt</h1>
                    <p class="mt-1 text-sm text-slate-500">
                        Receipt details for audit, customer support, and thesis/demo presentation.
                    </p>
                </div>
                <div class="flex gap-2">
                    <Link
                        :href="route('payments.index')"
                        class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                        Back to payments
                    </Link>
                    <a
                        v-if="can_manage_actions"
                        :href="route('receipts.print', payment.id)"
                        target="_blank"
                        class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                    >
                        Thermal print
                    </a>
                    <a
                        v-if="can_manage_actions"
                        :href="route('receipts.pdf', payment.id)"
                        class="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white"
                    >
                        Download PDF
                    </a>
                </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <dl class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                    <div>
                        <dt class="text-slate-500">OR Number</dt>
                        <dd class="font-mono text-slate-800">
                            {{ hasOfficialReceipt ? payment.receipt_number : 'Awaiting payment confirmation' }}
                        </dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Order Code</dt>
                        <dd class="font-mono text-slate-800">{{ payment.laundry_order?.order_code }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Customer</dt>
                        <dd class="text-slate-800">{{ payment.customer?.full_name }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Amount Paid</dt>
                        <dd class="text-slate-800">PHP {{ payment.amount_paid }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Payment Method</dt>
                        <dd class="capitalize text-slate-800">{{ payment.payment_method }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Status</dt>
                        <dd class="capitalize text-slate-800">{{ payment.payment_status }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Reference Number</dt>
                        <dd class="text-slate-800">{{ payment.reference_number ?? 'N/A' }}</dd>
                    </div>
                    <div>
                        <dt class="text-slate-500">Paid At</dt>
                        <dd class="text-slate-800">{{ payment.paid_at ?? 'N/A' }}</dd>
                    </div>
                </dl>
            </div>
        </div>
    </AppShell>
</template>
