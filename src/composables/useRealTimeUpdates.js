import { ref, onMounted, onUnmounted } from 'vue'
import { useLaundryDb } from './useLaundryDb.js'

export function useRealTimeUpdates(intervalMs = 30000) {
  const { tick } = useLaundryDb()
  const isPolling = ref(false)
  const lastUpdate = ref(Date.now())
  let pollingInterval = null

  const startPolling = () => {
    if (isPolling.value) return
    
    isPolling.value = true
    pollingInterval = setInterval(() => {
      tick()
      lastUpdate.value = Date.now()
    }, intervalMs)
  }

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
    isPolling.value = false
  }

  const forceUpdate = () => {
    tick()
    lastUpdate.value = Date.now()
  }

  onMounted(() => {
    // Start polling when component mounts
    startPolling()
  })

  onUnmounted(() => {
    // Clean up when component unmounts
    stopPolling()
  })

  // Handle page visibility changes
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopPolling()
    } else {
      startPolling()
      // Force update when page becomes visible again
      forceUpdate()
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    isPolling,
    lastUpdate,
    startPolling,
    stopPolling,
    forceUpdate
  }
}
