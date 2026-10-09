import { reactive } from 'vue'

const store = reactive({
  items: [],
})

let seq = 0

/**
 * Global lightweight toast queue (production-style feedback without extra deps).
 */
export function useToast() {
  function dismiss(id) {
    const i = store.items.findIndex((t) => t.id === id)
    if (i >= 0) store.items.splice(i, 1)
  }

  function push(message, type = 'success', durationMs = 4000) {
    const id = ++seq
    store.items.push({ id, message: String(message), type })
    if (durationMs > 0) {
      setTimeout(() => dismiss(id), durationMs)
    }
    return id
  }

  return { items: store.items, push, dismiss }
}
