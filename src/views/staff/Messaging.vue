<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 class="text-2xl font-semibold text-slate-900">Team Messaging</h1>
      <p class="text-sm text-slate-500 mt-2">
        Communicate directly with admin for schedule updates and operational concerns.
      </p>
    </section>

    <RoleMessagingPanel v-if="currentUserId" :currentUserId="currentUserId" targetRole="admin" title="Admin Conversations" />
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
