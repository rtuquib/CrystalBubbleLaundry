<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Admin Messaging</h1>
      <p class="text-sm text-slate-500 mt-2">
        Coordinate staff operations, pickup updates, and order escalations in one channel.
      </p>
    </section>

    <RoleMessagingPanel v-if="currentUserId" :currentUserId="currentUserId" targetRole="staff" title="Staff Conversations" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RoleMessagingPanel from '../../components/RoleMessagingPanel.vue'

const currentUserId = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('loggedInUser') || '{}').id || ''
  } catch {
    return ''
  }
})
</script>
