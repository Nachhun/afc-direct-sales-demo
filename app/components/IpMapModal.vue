<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop with blur -->
    <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" @click="close"></div>

    <div class="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
      <div 
        class="relative w-full max-w-3xl transform overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-left align-middle shadow-2xl border border-slate-700/80 transition-all text-white"
      >
        <!-- Top Glow Accent Bar -->
        <div class="h-1.5 w-full bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500"></div>

        <!-- Header -->
        <div class="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
              <span>{{ geoData?.flag || '🌐' }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-lg sm:text-xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                  <span>{{ ip }}</span>
                  <button 
                    @click="copyIp" 
                    type="button"
                    class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    :title="copied ? 'Copied!' : 'Copy IP'"
                  >
                    <Icon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-4 h-4" :class="{ 'text-emerald-400': copied }" />
                  </button>
                </h3>
                <!-- Blocked Badge -->
                <span 
                  v-if="geoData?.threat_intelligence?.is_blocked" 
                  class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  Firewall Blocked
                </span>
                <span 
                  v-else 
                  class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40"
                >
                  Active / Monitored
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>{{ geoData?.city || 'Resolving...' }}, {{ geoData?.country || '' }}</span>
                <span v-if="geoData?.org" class="text-slate-500">• {{ geoData.org }}</span>
              </p>
            </div>
          </div>

          <button 
            type="button" 
            @click="close"
            class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-5 sm:p-6 space-y-5">
          <!-- Loading State -->
          <div v-if="loading" class="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin text-indigo-400" />
            <span class="text-xs font-mono uppercase tracking-widest text-slate-400">Querying Satellite & IP Geolocation...</span>
          </div>

          <template v-else>
            <!-- Interactive Map Container -->
            <div class="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-inner bg-slate-950">
              <div ref="mapContainerRef" class="h-64 sm:h-72 w-full z-0"></div>

              <!-- Map Overlay Badges -->
              <div class="absolute top-3 left-3 z-[400] flex items-center gap-2 pointer-events-none">
                <span class="px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[11px] font-mono text-slate-200 flex items-center gap-1.5 shadow-lg">
                  <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>{{ geoData?.lat?.toFixed(4) }}, {{ geoData?.lon?.toFixed(4) }}</span>
                </span>
              </div>

              <!-- Google Maps quick external link -->
              <div v-if="geoData?.google_maps_url" class="absolute bottom-3 right-3 z-[400]">
                <a 
                  :href="geoData.google_maps_url" 
                  target="_blank" 
                  rel="noopener"
                  class="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white backdrop-blur-md border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg"
                >
                  <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5 text-blue-400" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>

            <!-- Intelligence Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <!-- Country & City -->
              <div class="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Origin Country</span>
                <div class="flex items-center gap-1.5">
                  <span class="text-base">{{ geoData?.flag }}</span>
                  <span class="text-xs font-bold text-white truncate">{{ geoData?.country }}</span>
                </div>
                <span class="text-[11px] text-slate-400 block mt-0.5 truncate">{{ geoData?.city }}, {{ geoData?.region }}</span>
              </div>

              <!-- ISP & Host -->
              <div class="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">ISP / Cloud Org</span>
                <span class="text-xs font-bold text-white block truncate" :title="geoData?.org || geoData?.isp">
                  {{ geoData?.org || geoData?.isp || 'Unknown' }}
                </span>
                <span class="text-[11px] text-slate-400 block mt-0.5 truncate font-mono">{{ geoData?.as || 'N/A' }}</span>
              </div>

              <!-- Threat Strikes -->
              <div class="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Strikes / Offenses</span>
                <div class="flex items-center gap-1.5">
                  <span class="text-sm font-black text-rose-400 font-mono">{{ geoData?.threat_intelligence?.strikes || 0 }}</span>
                  <span class="text-[10px] text-slate-400">strikes</span>
                </div>
                <span class="text-[11px] text-slate-400 block mt-0.5">
                  {{ geoData?.threat_intelligence?.total_events || 0 }} total events
                </span>
              </div>

              <!-- Timezone & Range -->
              <div class="bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Network Timezone</span>
                <span class="text-xs font-bold text-white block truncate">{{ geoData?.timezone || 'UTC' }}</span>
                <span class="text-[10px] font-mono block mt-0.5 text-slate-400">
                  {{ geoData?.is_private ? '🔒 Private LAN' : '🌐 Public Internet' }}
                </span>
              </div>
            </div>

            <!-- Latest Offense Snippet (if available) -->
            <div v-if="geoData?.threat_intelligence?.latest_threat" class="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
              <div class="flex items-center justify-between gap-2 mb-1">
                <span class="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Icon name="heroicons:exclamation-triangle" class="w-3.5 h-3.5" />
                  Latest Detected Activity
                </span>
                <span class="text-[10px] text-slate-500 font-mono">
                  {{ geoData.threat_intelligence.latest_threat.time }}
                </span>
              </div>
              <p class="text-xs text-slate-300 font-mono line-clamp-2">
                {{ geoData.threat_intelligence.latest_threat.message }}
              </p>
            </div>
          </template>
        </div>

        <!-- Footer Actions -->
        <div class="p-4 sm:p-6 pt-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              @click="filterByIp"
              class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-blue-400" />
              <span>Filter All Logs</span>
            </button>
          </div>

          <div class="flex items-center gap-2.5">
            <!-- Unblock Button if already blocked -->
            <button 
              v-if="geoData?.threat_intelligence?.is_blocked" 
              type="button" 
              @click="handleUnblock"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="heroicons:lock-open" class="w-4 h-4" />
              <span>Unblock IP</span>
            </button>

            <!-- Catch & Ban Button if not blocked -->
            <button 
              v-else 
              type="button" 
              @click="handleBan"
              class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="heroicons:no-symbol" class="w-4 h-4" />
              <span>Catch & Ban IP</span>
            </button>

            <button 
              type="button" 
              @click="close"
              class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useApi } from '~/composables/useApi'

const props = defineProps<{
  modelValue: boolean
  ip: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'ban', ip: string): void
  (e: 'unblock', ip: string, blockedId?: number): void
  (e: 'filter', ip: string): void
}>()

const api = useApi()
const loading = ref(false)
const geoData = ref<any>(null)
const copied = ref(false)
const mapContainerRef = ref<HTMLElement | null>(null)

let mapInstance: any = null
let markerInstance: any = null

function close() {
  emit('update:modelValue', false)
}

function copyIp() {
  if (!props.ip) return
  navigator.clipboard.writeText(props.ip)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function handleBan() {
  emit('ban', props.ip)
}

function handleUnblock() {
  emit('unblock', props.ip, geoData.value?.threat_intelligence?.blocked_id)
}

function filterByIp() {
  emit('filter', props.ip)
  close()
}

// Fetch IP info and initialize map
async function fetchIpGeo() {
  if (!props.ip) return
  loading.value = true
  destroyMap()

  try {
    const res = await api.get(`/admin/system-logs/ip-info/${props.ip}`) as any
    geoData.value = res
  } catch (e) {
    console.error('Failed to resolve IP geo info:', e)
    geoData.value = {
      ip: props.ip,
      country: 'Unknown',
      city: 'N/A',
      flag: '🌐',
      lat: 11.5564,
      lon: 104.9282,
    }
  } finally {
    loading.value = false
    await nextTick()
    setTimeout(() => {
      initMap()
    }, 100)
  }
}

async function initMap() {
  if (!mapContainerRef.value || !geoData.value) return

  const lat = geoData.value.lat || 11.5564
  const lon = geoData.value.lon || 104.9282

  try {
    const LModule = await import('leaflet')
    const L = LModule.default || LModule
    await import('leaflet/dist/leaflet.css')

    destroyMap()

    // Initialize Leaflet Map
    mapInstance = L.map(mapContainerRef.value, {
      center: [lat, lon],
      zoom: (geoData.value.lat && geoData.value.lon) ? 10 : 3,
      zoomControl: true,
      attributionControl: false,
    })

    // Clean Dark Theme Tiles (No API key required, zero watermarks)
    L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
    }).addTo(mapInstance)

    L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
    }).addTo(mapInstance)

    // Pulsing Threat Target Marker
    const isBlocked = geoData.value?.threat_intelligence?.is_blocked
    const pulseColor = isBlocked ? 'bg-rose-500' : 'bg-amber-400'
    const pinColor = isBlocked ? 'bg-rose-600' : 'bg-amber-500'

    const customIcon = L.divIcon({
      className: 'threat-radar-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full ${pulseColor} opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 ${pinColor} border-2 border-white shadow-lg"></span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    markerInstance = L.marker([lat, lon], { icon: customIcon }).addTo(mapInstance)

    // Popup
    const popupContent = `
      <div style="font-family: inherit; font-size: 11px; color: #0f172a; padding: 4px;">
        <div style="font-weight: 800; font-size: 12px; margin-bottom: 2px;">
          ${geoData.value.flag || '🌐'} ${geoData.value.ip}
        </div>
        <div><b>Location:</b> ${geoData.value.city || ''}, ${geoData.value.country || ''}</div>
        <div><b>ISP:</b> ${geoData.value.org || geoData.value.isp || 'N/A'}</div>
      </div>
    `
    markerInstance.bindPopup(popupContent)

    // Force tile recalculation after transition
    setTimeout(() => {
      mapInstance?.invalidateSize()
    }, 200)

  } catch (err) {
    console.error('Failed to initialize IP map:', err)
  }
}

function destroyMap() {
  if (mapInstance) {
    try {
      mapInstance.remove()
    } catch (e) {}
    mapInstance = null
    markerInstance = null
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    fetchIpGeo()
  } else {
    destroyMap()
  }
})

watch(() => props.ip, () => {
  if (props.modelValue) {
    fetchIpGeo()
  }
})

onBeforeUnmount(() => {
  destroyMap()
})
</script>

<style scoped>
:deep(.threat-radar-icon) {
  background: transparent !important;
  border: none !important;
}

:deep(.leaflet-popup-content-wrapper) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}
</style>
