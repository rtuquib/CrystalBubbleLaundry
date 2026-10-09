<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="p-4 border-b border-slate-200">
        <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
        <p class="text-xs text-slate-500 mt-1">Internal admin/staff communication</p>
      </div>
      <div class="max-h-[520px] overflow-y-auto p-2">
        <button
          v-for="row in conversations"
          :key="row.peer.id"
          type="button"
          class="w-full text-left px-3 py-3 rounded-xl hover:bg-slate-50 border border-transparent"
          :class="activePeerId === row.peer.id ? 'bg-blue-50 border-blue-200' : ''"
          @click="selectPeer(row.peer.id)"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="font-medium text-slate-800">{{ row.peer.name }}</p>
            <span
              v-if="row.unread > 0"
              class="min-w-[20px] h-5 px-1 inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold"
            >
              {{ row.unread > 99 ? '99+' : row.unread }}
            </span>
          </div>
          <p class="text-xs text-slate-500 capitalize">{{ row.peer.role }}</p>
          <p class="text-sm text-slate-600 mt-1 truncate">{{ row.last?.body || 'No messages yet.' }}</p>
          <p v-if="row.last" class="text-[11px] text-slate-400 mt-1">{{ formatDateTime(row.last.createdAt) }}</p>
        </button>
      </div>
    </section>

    <section class="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[520px]">
      <div class="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">{{ activePeer?.name || 'Select conversation' }}</h3>
          <p class="text-xs text-slate-500 capitalize">{{ activePeer?.role || 'No recipient selected' }}</p>
        </div>
      </div>

      <div class="flex-1 p-4 space-y-3 overflow-y-auto max-h-[420px]">
        <div v-if="!messages.length" class="h-full grid place-items-center text-slate-400 text-sm">
          No messages yet. Start conversation below.
        </div>
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="max-w-[80%] px-4 py-2 rounded-2xl text-sm"
          :class="msg.fromId === currentUserId ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'"
        >
          <p>{{ msg.body }}</p>
          <p class="text-[11px] mt-1" :class="msg.fromId === currentUserId ? 'text-blue-100' : 'text-slate-500'">
            {{ formatDateTime(msg.createdAt) }}
          </p>
        </div>
      </div>

      <form class="p-4 border-t border-slate-200 flex gap-2" @submit.prevent="submitMessage">
        <input
          v-model="draft"
          type="text"
          :disabled="!activePeerId"
          placeholder="Type message..."
          class="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
        />
        <button
          type="submit"
          :disabled="!activePeerId || !draft.trim()"
          class="rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-medium disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useLaundryDb } from '../composables/useLaundryDb.js'
import {
  getConversationMessages,
  getConversationSummaries,
  markConversationRead,
  sendMessage,
} from '../services/laundryDb.js'

const props = defineProps({
  currentUserId: {
    type: String,
    required: true,
  },
  targetRole: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: 'Messaging',
  },
})

const { state } = useLaundryDb()
const activePeerId = ref('')
const draft = ref('')

const conversations = computed(() => {
  state.value
  return getConversationSummaries(props.currentUserId, props.targetRole)
})

const activePeer = computed(() =>
  state.value.accounts.find((a) => a.id === activePeerId.value) || null,
)

const messages = computed(() => {
  state.value
  if (!activePeerId.value) return []
  return getConversationMessages(props.currentUserId, activePeerId.value)
})

watch(
  conversations,
  (rows) => {
    if (!rows.length) {
      activePeerId.value = ''
      return
    }
    if (!activePeerId.value || !rows.some((r) => r.peer.id === activePeerId.value)) {
      activePeerId.value = rows[0].peer.id
    }
  },
  { immediate: true },
)

watch(
  () => activePeerId.value,
  (peerId) => {
    if (peerId) markConversationRead(props.currentUserId, peerId)
  },
  { immediate: true },
)

function selectPeer(peerId) {
  activePeerId.value = peerId
  markConversationRead(props.currentUserId, peerId)
}

function submitMessage() {
  if (!activePeerId.value || !draft.value.trim()) return
  sendMessage({
    fromId: props.currentUserId,
    toId: activePeerId.value,
    body: draft.value,
  })
  draft.value = ''
}

function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
