<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Global GPS Alert Banner -->
  <Teleport to="body">
    <div v-if="gpsError" class="fixed top-4 left-4 right-4 z-[9999]">
      <div class="bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 border border-red-500 max-w-md mx-auto">
        <div class="p-2 bg-white/10 rounded-xl shrink-0 mt-0.5">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-white animate-pulse" />
        </div>
        <div class="flex-1">
          <h4 class="text-xs font-black uppercase tracking-widest leading-none text-red-200">GPS Permission Blocked</h4>
          <p class="text-[11px] font-bold mt-1.5 leading-snug">
            Your device blocked location permissions. Please enable Location Services in your phone settings so your sales routes can be logged correctly!
          </p>
        </div>
        <button @click="gpsError = false" class="text-white/60 hover:text-white shrink-0 self-center p-1">
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { onMounted, onUnmounted, watch, ref } from 'vue'

const authStore = useAuthStore()
const api = useApi()
const gpsError = ref(false)

if (import.meta.client) {
  authStore.loadFromStorage()
}

let geoWatchId: number | null = null
let lastUpdate = 0
const UPDATE_INTERVAL = 10000 // 10 seconds throttle

let wakeLock: any = null

async function requestWakeLock() {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) return
  try {
    wakeLock = await (navigator as any).wakeLock.request('screen')
  } catch (err) {
    console.warn('Wake Lock request failed:', err)
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release().then(() => {
      wakeLock = null
    })
  }
}

function startBackgroundTracking() {
  if (typeof window === 'undefined' || !navigator.geolocation) return

  // Request screen wake lock so the browser doesn't sleep
  requestWakeLock()

  geoWatchId = navigator.geolocation.watchPosition(
    async (position) => {
      gpsError.value = false
      
      const now = Date.now()
      if (now - lastUpdate < UPDATE_INTERVAL) return
      
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      const accuracy = position.coords.accuracy

      try {
        await api.post('/location', {
          lat,
          lng,
          accuracy
        })
        lastUpdate = now
        
        if (authStore.user) {
          authStore.user.location = `${lat},${lng}`
        }
      } catch (e) {
        console.error('Failed to log location in background', e)
      }
    },
    (err) => {
      console.warn('Background Geolocation error:', err.message)
      if (err.code === 1) {
        gpsError.value = true
      }
    },
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000
    }
  )
}

function stopBackgroundTracking() {
  if (geoWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(geoWatchId)
    geoWatchId = null
  }
  releaseWakeLock()
  gpsError.value = false
}

onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    try {
      const tg = (window as any).Telegram.WebApp
      if (typeof tg.ready === 'function') tg.ready()
      if (typeof tg.expand === 'function') tg.expand()
    } catch (e) {
      console.warn('Telegram WebApp expand failed', e)
    }
  }

  // Re-request wake lock if window visibility state becomes visible again (tab was minimized/focused)
  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock()
      }
    })
  }

  // Automatically manage background tracking based on user session and role
  watch(
    () => [authStore.isLoggedIn, authStore.user?.role],
    (newVal) => {
      const isLoggedIn = newVal[0]
      const role = newVal[1]
      
      if (isLoggedIn && (role === 'salesman' || role === 'delivery')) {
        // Delay location permission prompt by 3.5 seconds so Welcome Splash Screen completes first
        setTimeout(() => {
          startBackgroundTracking()
        }, 3500)
      } else {
        stopBackgroundTracking()
      }
    },
    { immediate: true }
  )
})

onUnmounted(() => {
  stopBackgroundTracking()
})
</script>
