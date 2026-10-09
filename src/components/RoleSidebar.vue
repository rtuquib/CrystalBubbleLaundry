<template>
  <aside class="h-full w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-blue-50 flex flex-col shadow-2xl">
    <div class="h-20 px-6 border-b border-white/15 flex items-center justify-between">
      <div>
        <p class="text-lg font-semibold leading-tight">{{ brandTitle }}</p>
        <p class="text-xs text-blue-200">{{ panelLabel }}</p>
      </div>
      <button
        @click="$emit('close')"
        class="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/25 text-blue-100 hover:bg-white/10"
        aria-label="Close sidebar"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto px-4 py-5 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-blue-100/95 hover:bg-white/10 hover:text-white transition"
        active-class="bg-white text-blue-900 shadow-md hover:bg-white hover:text-blue-900"
        @click="$emit('close')"
      >
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-semibold">
          {{ item.icon }}
        </span>
        <span class="truncate">{{ item.label }}</span>
        <span
          v-if="item.badge && item.badge > 0"
          class="ml-auto min-w-[20px] h-5 px-1 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-semibold"
        >
          {{ item.badge > 99 ? '99+' : item.badge }}
        </span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  brandTitle: {
    type: String,
    default: 'CrystalBubble',
  },
  panelLabel: {
    type: String,
    default: 'Workspace',
  },
  navItems: {
    type: Array,
    default: () => [],
  },
})

defineEmits(['close'])
</script>
