<template>
  <section class="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
        <p class="text-sm text-slate-500 mt-1">{{ description }}</p>
      </div>
      <div v-if="selectedShop" class="shrink-0 rounded-full bg-sky-50 border border-sky-100 px-3 py-1.5">
        <p class="text-[11px] uppercase tracking-wide text-sky-500 font-semibold">Selected shop</p>
        <p class="text-sm font-semibold text-sky-800">{{ selectedShop.name }}</p>
      </div>
    </div>

    <div v-if="searchable && shops.length > 2" class="mb-4">
      <label class="sr-only" for="shop-search">Search laundry shops</label>
      <input
        id="shop-search"
        v-model="query"
        type="search"
        placeholder="Search by name or location"
        class="w-full sm:max-w-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400"
      />
    </div>

    <p v-if="loading" class="text-sm text-slate-500 py-6 text-center">Loading laundry shops…</p>
    <p v-else-if="error" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
      {{ error }}
    </p>
    <p
      v-else-if="!shops.length"
      class="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl px-4 py-6 text-center"
    >
      No laundry shops are available right now. Please check back later.
    </p>
    <p
      v-else-if="!filteredShops.length"
      class="text-sm text-slate-500 py-4"
    >
      No shops match your search.
    </p>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <article
        v-for="shop in filteredShops"
        :key="shop.id"
        class="rounded-2xl border p-4 flex flex-col gap-3 transition"
        :class="
          selectedId === shop.id
            ? 'border-sky-400 bg-sky-50 ring-2 ring-sky-200'
            : 'border-slate-200 bg-white'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-base font-semibold text-slate-900">{{ shop.name }}</h3>
            <p v-if="shop.code" class="text-xs text-slate-400 mt-0.5">{{ shop.code }}</p>
          </div>
          <span
            class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            :class="shop.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
          >
            {{ shop.status === 'active' ? 'Open' : shop.status }}
          </span>
        </div>

        <dl class="space-y-1.5 text-sm text-slate-600">
          <div v-if="shop.address" class="flex gap-2">
            <dt class="text-slate-400 w-20 shrink-0">Location</dt>
            <dd>{{ shop.address }}</dd>
          </div>
          <div v-if="contactFor(shop)" class="flex gap-2">
            <dt class="text-slate-400 w-20 shrink-0">Contact</dt>
            <dd>{{ contactFor(shop) }}</dd>
          </div>
          <div v-if="shop.hours" class="flex gap-2">
            <dt class="text-slate-400 w-20 shrink-0">Hours</dt>
            <dd>{{ shop.hours }}</dd>
          </div>
        </dl>

        <div class="mt-auto pt-1">
          <button
            v-if="selectedId === shop.id"
            type="button"
            class="w-full rounded-xl border border-sky-300 bg-white px-3 py-2 text-sm font-semibold text-sky-700"
            disabled
          >
            Currently selected
          </button>
          <button
            v-else
            type="button"
            class="w-full rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 action-btn"
            @click="$emit('select', shop.id)"
          >
            Select Shop
          </button>
        </div>
      </article>
    </div>

    <p v-if="!selectedId && shops.length && hint" class="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
      {{ hint }}
    </p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Preferred Laundry Shop' },
  description: {
    type: String,
    default: 'Choose the branch you want to use for your next order. You can change this anytime before you submit.',
  },
  shops: { type: Array, default: () => [] },
  selectedId: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hint: { type: String, default: 'Please choose a laundry shop before placing an order.' },
  searchable: { type: Boolean, default: true },
})

defineEmits(['select'])

const query = ref('')

const selectedShop = computed(() => props.shops.find((s) => s.id === props.selectedId) || null)

const filteredShops = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.shops
  return props.shops.filter((shop) => {
    const haystack = [shop.name, shop.code, shop.address, shop.phone, shop.contactEmail]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

function contactFor(shop) {
  return shop.phone || shop.contactEmail || ''
}
</script>
