<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Filter Bar Card -->
    <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
      <div class="flex flex-wrap items-center gap-4 justify-between">
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
              <Icon name="heroicons:funnel" class="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 class="text-slate-900 font-black text-sm">Map Filters</h3>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Refine coordinates geographically</p>
            </div>
          </div>

          <!-- Mapped Stats Summary & Status Key -->
          <div class="hidden lg:flex items-center gap-3 border-l border-slate-200 pl-6">
            <!-- Stores Count Card -->
            <div class="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-2xs">
              <div class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
                <Icon name="heroicons:building-storefront" class="w-4 h-4" />
              </div>
              <div>
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Stores</span>
                <span class="text-xs font-black text-slate-900 mt-1 block leading-none">{{ filteredMapStores.length }}</span>
              </div>
            </div>

            <!-- Revenue Card -->
            <div class="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-2xs">
              <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <Icon name="heroicons:banknotes" class="w-4 h-4" />
              </div>
              <div>
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Revenue</span>
                <span class="text-xs font-black text-emerald-600 mt-1 block leading-none">
                  ${{ totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </div>
            </div>

            <!-- Status Key Card (Moved from map overlay) -->
            <div class="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5 shadow-2xs">
              <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                <Icon name="heroicons:list-bullet" class="w-4 h-4" />
              </div>
              <div>
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Status Key</span>
                <div class="flex items-center gap-1.5">
                  <button 
                    type="button"
                    @click="mapSelectedStatus = mapSelectedStatus === 'pending' ? '' : 'pending'"
                    :class="mapSelectedStatus === 'pending' ? 'bg-amber-100 ring-1.5 ring-amber-500 font-black' : 'hover:bg-slate-200/70'"
                    class="flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all cursor-pointer"
                    title="Click to filter Pending"
                  >
                    <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <span class="text-[9px] font-black uppercase tracking-wider text-slate-700">Pending</span>
                  </button>
                  <button 
                    type="button"
                    @click="mapSelectedStatus = mapSelectedStatus === 'completed' ? '' : 'completed'"
                    :class="mapSelectedStatus === 'completed' ? 'bg-emerald-100 ring-1.5 ring-emerald-500 font-black' : 'hover:bg-slate-200/70'"
                    class="flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all cursor-pointer"
                    title="Click to filter Completed"
                  >
                    <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    <span class="text-[9px] font-black uppercase tracking-wider text-slate-700">Completed</span>
                  </button>
                  <button 
                    type="button"
                    @click="mapSelectedStatus = mapSelectedStatus === 'cancelled' ? '' : 'cancelled'"
                    :class="mapSelectedStatus === 'cancelled' ? 'bg-red-100 ring-1.5 ring-red-500 font-black' : 'hover:bg-slate-200/70'"
                    class="flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-all cursor-pointer"
                    title="Click to filter Cancelled"
                  >
                    <span class="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                    <span class="text-[9px] font-black uppercase tracking-wider text-slate-700">Cancelled</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-wrap items-center gap-3 flex-1 justify-end">
          <!-- Sales Rep Filter -->
          <div class="flex flex-col min-w-[140px]">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Sales Representative</label>
            <select v-model="mapSelectedRepId" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 cursor-pointer">
              <option value="">All Representatives</option>
              <option v-for="rep in uniqueReps" :key="rep.id" :value="rep.id">{{ rep.name }}</option>
            </select>
          </div>

          <!-- Store Type Filter -->
          <div class="flex flex-col min-w-[130px]">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Channel</label>
            <select v-model="mapSelectedStoreType" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 cursor-pointer">
              <option value="">All Channels</option>
              <option v-for="type in uniqueStoreTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>

          <!-- Order Type (Direct Drop) Filter -->
          <div class="flex flex-col min-w-[140px]">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Order Type</label>
            <select v-model="mapSelectedOrderType" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 cursor-pointer">
              <option value="">All Orders</option>
              <option value="direct">⚡ Direct Drop</option>
              <option value="standard">Standard Delivery</option>
            </select>
          </div>

          <!-- Delivery / Order Status Filter -->
          <div class="flex flex-col min-w-[130px]">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivery Status</label>
            <select v-model="mapSelectedStatus" class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 cursor-pointer">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Export Excel Button -->
          <div class="flex flex-col justify-end">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 hidden sm:block">Export</label>
            <button 
              @click="exportMapStoresToExcel"
              class="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Export all visible map stores to Excel"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div 
      ref="mapWrapperRef"
      :class="isFullscreen ? 'fixed inset-0 z-[999999] w-screen h-screen bg-slate-100 rounded-none border-0' : 'relative overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-sm'"
      class="transition-all duration-300">
      
      <div id="dashboard-map" :class="isFullscreen ? 'h-full w-full' : 'h-[600px] w-full'" class="z-0 bg-slate-100"></div>

      <!-- Top Controls Bar (Layer Switcher + Fullscreen Toggle + Filters in Fullscreen) -->
      <div class="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <!-- Left: Layer Switcher & Fullscreen Button -->
        <div class="flex items-center gap-2 pointer-events-auto">
          <!-- Layer Switcher -->
          <div class="bg-white/95 backdrop-blur-md border border-slate-200/90 p-1 rounded-2xl shadow-xl flex items-center gap-1">
            <button 
              type="button"
              @click="setMapLayer('light')" 
              :class="activeMapLayer === 'light' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-100 font-bold'"
              class="px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
              <Icon name="heroicons:map" class="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button 
              type="button"
              @click="setMapLayer('streets')" 
              :class="activeMapLayer === 'streets' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-100 font-bold'"
              class="px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
              <Icon name="heroicons:globe-americas" class="w-3.5 h-3.5" />
              <span>Street</span>
            </button>
            <button 
              type="button"
              @click="setMapLayer('satellite')" 
              :class="activeMapLayer === 'satellite' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-100 font-bold'"
              class="px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer">
              <Icon name="heroicons:globe-asia-australia" class="w-3.5 h-3.5 text-emerald-400" />
              <span>Satellite</span>
            </button>
          </div>

          <!-- Full Screen Button -->
          <button 
            type="button"
            @click="toggleFullscreen" 
            :class="isFullscreen ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800' : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50'"
            class="backdrop-blur-md border px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer">
            <Icon :name="isFullscreen ? 'heroicons:arrows-pointing-in' : 'heroicons:arrows-pointing-out'" class="w-4 h-4 text-blue-600" />
            <span>{{ isFullscreen ? 'Exit Full Screen (ESC)' : 'Full Screen' }}</span>
          </button>
        </div>

        <!-- Right (Only visible in Fullscreen Mode): Quick Stats & Filter Pills -->
        <div v-if="isFullscreen" class="hidden md:flex items-center gap-3 pointer-events-auto">
          <!-- Stats Summary Pill -->
          <div class="bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-1.5 flex items-center gap-4 text-white shadow-2xl">
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stores:</span>
              <span class="text-xs font-black text-blue-400">{{ filteredMapStores.length }}</span>
            </div>
            <div class="w-px h-3 bg-white/20"></div>
            <div class="flex items-center gap-2">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue:</span>
              <span class="text-xs font-black text-emerald-400">${{ totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
          </div>

          <!-- Quick Filters Selects -->
          <div class="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-1 shadow-xl flex items-center gap-2">
            <select v-model="mapSelectedRepId" class="bg-transparent border-0 px-2 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer">
              <option value="">All Reps</option>
              <option v-for="rep in uniqueReps" :key="rep.id" :value="rep.id">{{ rep.name }}</option>
            </select>
            <div class="w-px h-4 bg-slate-200"></div>
            <select v-model="mapSelectedStoreType" class="bg-transparent border-0 px-2 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer">
              <option value="">All Channels</option>
              <option v-for="type in uniqueStoreTypes" :key="type" :value="type">{{ type }}</option>
            </select>
            <div class="w-px h-4 bg-slate-200"></div>
            <select v-model="mapSelectedOrderType" class="bg-transparent border-0 px-2 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer">
              <option value="">All Orders</option>
              <option value="direct">Direct Drop</option>
              <option value="standard">Standard</option>
            </select>
            <div class="w-px h-4 bg-slate-200"></div>
            <select v-model="mapSelectedStatus" class="bg-transparent border-0 px-2 py-1 text-xs font-bold text-slate-800 outline-none cursor-pointer">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Hint & Cursor Lat/Lng Badge (Bottom Left) -->
      <div class="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto text-[10px] font-bold text-slate-600">
        <Icon name="heroicons:cursor-arrow-rays" class="w-3.5 h-3.5 text-blue-600" />
        <span>Click anywhere on map to copy coordinates</span>
      </div>
      
      <!-- Legend Overlay (Only visible in Fullscreen Mode) -->
      <div v-if="isFullscreen" class="absolute bottom-4 right-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200/80 p-3.5 space-y-2 shadow-xl pointer-events-auto rounded-2xl min-w-[140px]">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 mb-1 flex items-center gap-1.5">
          <Icon name="heroicons:list-bullet" class="w-3.5 h-3.5 text-blue-600" />
          Status Key
        </p>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-700">Pending</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-700">Completed</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs"></span>
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-700">Cancelled</span>
        </div>
      </div>

      <!-- Toast Feedback for Coordinates Copy -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-4 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-4 opacity-0"
      >
        <div v-if="copyToast.show" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-white/20">
          <div class="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Icon name="heroicons:check" class="w-3.5 h-3.5" />
          </div>
          <span class="text-xs font-black tracking-wide">{{ copyToast.text }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { exportStyledExcel } from '~/utils/excelExport'
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  allOrders: any[]
}>()

const mapWrapperRef = ref<HTMLElement | null>(null)
const mapSelectedStoreType = ref('')
const mapSelectedRepId = ref('')
const mapSelectedStatus = ref('')
const mapSelectedOrderType = ref('') // '' (all), 'direct' (direct drop), 'standard' (standard delivery)
const dashboardMap = ref<any>(null)
const dashboardClusterGroup = ref<any>(null)
const isFullscreen = ref(false)

async function toggleFullscreen() {
  if (typeof document === 'undefined') return

  if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
    try {
      if (mapWrapperRef.value?.requestFullscreen) {
        await mapWrapperRef.value.requestFullscreen()
      } else if ((mapWrapperRef.value as any)?.webkitRequestFullscreen) {
        await (mapWrapperRef.value as any).webkitRequestFullscreen()
      }
      isFullscreen.value = true
    } catch (err) {
      console.warn('Native fullscreen fallback to CSS', err)
      isFullscreen.value = !isFullscreen.value
    }
  } else {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      }
    } catch (err) {
      console.warn('Exit fullscreen error', err)
    }
    isFullscreen.value = false
  }

  triggerMapResize()
}

function handleFullscreenChange() {
  isFullscreen.value = !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
  triggerMapResize()
}

function triggerMapResize() {
  nextTick(() => {
    [50, 150, 300, 500].forEach(delay => {
      setTimeout(() => {
        if (dashboardMap.value) {
          dashboardMap.value.invalidateSize(true)
        }
      }, delay)
    })
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

// Map Layers Setup
type MapLayerType = 'light' | 'streets' | 'satellite'
const activeMapLayer = ref<MapLayerType>('light')
const tileLayers: Partial<Record<MapLayerType, any>> = {}

const mapLayerConfigs: Record<MapLayerType, { url: string; options: any }> = {
  light: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }
  },
  streets: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, attribution: '&copy; Esri &copy; DigitalGlobe &copy; GeoEye' }
  }
}

// Copy feedback toast
const copyToast = ref<{ show: boolean; text: string }>({ show: false, text: '' })
let toastTimer: any = null

function showCopyToast(coords: string) {
  copyToast.value = { show: true, text: `Copied: ${coords}` }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    copyToast.value.show = false
  }, 2500)
}

function setMapLayer(layer: MapLayerType) {
  activeMapLayer.value = layer
  if (!dashboardMap.value) return
  const L = (window as any).L
  if (!L) return

  // Remove existing tile layers
  Object.keys(tileLayers).forEach(k => {
    const l = tileLayers[k as MapLayerType]
    if (l && dashboardMap.value.hasLayer(l)) {
      dashboardMap.value.removeLayer(l)
    }
  })

  // Create or add layer
  if (!tileLayers[layer]) {
    const config = mapLayerConfigs[layer]
    tileLayers[layer] = L.tileLayer(config.url, config.options)
  }

  dashboardMap.value.addLayer(tileLayers[layer])
  tileLayers[layer].setZIndex(1)

  if (dashboardClusterGroup.value) {
    dashboardClusterGroup.value.bringToFront()
  }
}

// Global copy method accessible from Leaflet popup HTML
if (process.client) {
  ;(window as any).__copyMapCoords = (coords: string, btn?: HTMLElement) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(coords)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = coords
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    showCopyToast(coords)
    if (btn) {
      const originalText = btn.innerHTML
      btn.innerHTML = `<span style="color: #4ade80; font-weight: bold;">✓ Copied!</span>`
      setTimeout(() => {
        btn.innerHTML = originalText
      }, 1500)
    }
  }
}

// Unique filters computed from loaded orders
function getStoreChannel(order: any): string {
  // 1. Check if Modern Trade
  const isMT = !!(order.is_modern_trade || order.store?.is_modern_trade)
  if (isMT) return 'Modern Trade'

  // 2. Check if Wholesale
  const isWS = !!(order.is_wholesale || (order.store?.store_type || order.store_type || '').toLowerCase().includes('wholesale'))
  if (isWS) return 'Wholesale'

  // 3. Check if New Store
  const isNew = !!(order.is_new_store || order.store?.is_new_store)
  if (isNew) return 'New Store'

  // 4. Default to Regular Store
  return 'Regular Store'
}

// Unique filters computed from loaded orders
const uniqueStoreTypes = computed(() => {
  const types = new Set<string>()
  props.allOrders.forEach(o => {
    types.add(getStoreChannel(o))
  })
  return Array.from(types).sort()
})

const uniqueReps = computed(() => {
  const reps = new Map<number, string>()
  props.allOrders.forEach(o => {
    if (o.user) {
      reps.set(o.user.id, o.user.name)
    }
  })
  return Array.from(reps.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
})

// Cambodia bounding box: lat 9-15, lng 102-108 (with small buffer)
function normalizeCoordinate(loc: string): { lat: number; lng: number } | null {
  if (!loc) return null
  const parts = loc.split(',').map((n: string) => parseFloat(n.trim()))
  if (parts.length < 2) return null

  const lat0 = parts[0]
  const lng0 = parts[1]
  if (lat0 === undefined || lng0 === undefined) return null
  if (isNaN(lat0) || isNaN(lng0)) return null

  let lat = lat0
  let lng = lng0

  // Auto-fix swapped coordinates: real Cambodia lat is 9-15, lng is 102-108
  // If lat looks like a longitude (100+), swap them
  if (lat > 90 || (lat > 15 && lng < 90)) {
    const temp = lat; lat = lng; lng = temp
  }

  // Reject if still outside Cambodia region
  if (lat < 8 || lat > 16 || lng < 100 || lng > 110) return null

  return { lat, lng }
}

const filteredMapStores = computed(() => {
  const storesMap = new Map<string, {
    store_id: number
    customer_id: string
    shop_name: string
    location: string
    raw_lat: number
    raw_lng: number
    customer_address: string
    province?: string
    contact?: string
    store_type: string
    channel: string
    orders: any[]
    status: string
    total_amount: number
  }>()

  props.allOrders.forEach(o => {
    if (mapSelectedRepId.value && o.user_id !== Number(mapSelectedRepId.value)) return
    if (mapSelectedStatus.value && o.status !== mapSelectedStatus.value) return
    if (mapSelectedOrderType.value === 'direct' && !o.is_direct_sale) return
    if (mapSelectedOrderType.value === 'standard' && o.is_direct_sale) return

    const channel = getStoreChannel(o)
    if (mapSelectedStoreType.value && channel !== mapSelectedStoreType.value) return

    const type = o.store?.store_type || o.store_type
    const rawLoc = o.location || o.store?.location
    if (!rawLoc) return
    const coords = normalizeCoordinate(rawLoc)
    if (!coords) return
    const loc = `${coords.lat},${coords.lng}`

    const storeKey = o.store?.customer_id || o.customer_id || o.store_id || o.store?.id || loc

    if (!storesMap.has(storeKey)) {
      storesMap.set(storeKey, {
        store_id: o.store_id || o.store?.id,
        customer_id: o.store?.customer_id || o.customer_id || '',
        shop_name: o.store?.shop_name || o.shop_name || `Store #${o.store_id || o.id}`,
        location: loc,
        raw_lat: coords.lat,
        raw_lng: coords.lng,
        customer_address: o.store?.customer_address || o.customer_address || 'N/A',
        province: o.store?.province || o.province || '',
        contact: o.store?.contact || o.contact || o.phone || '',
        store_type: type || 'N/A',
        channel: channel,
        orders: [],
        status: o.status,
        total_amount: 0
      })
    }

    const storeEntry = storesMap.get(storeKey)!
    storeEntry.orders.push(o)
    if (o.status !== 'cancelled' && o.status !== 'terminated') {
      storeEntry.total_amount += Number(o.total_amount || 0)
    }
    
    if (o.status === 'pending') {
      storeEntry.status = 'pending'
    } else if (storeEntry.status !== 'pending' && o.status === 'completed') {
      storeEntry.status = 'completed'
    }
  })

  return Array.from(storesMap.values())
})

const totalRevenue = computed(() => {
  return filteredMapStores.value.reduce((sum, store) => sum + store.total_amount, 0)
})

async function exportMapStoresToExcel() {
  const stores = filteredMapStores.value
  if (!stores.length) {
    alert('No stores available to export.')
    return
  }

  const columns = [
    { header: 'Customer ID', key: 'customer_id', width: 16, isCenter: true },
    { header: 'Name Shop', key: 'shop_name', width: 28 },
    { header: 'Location (Province / Address)', key: 'location', width: 34 },
    { header: 'Coordinates', key: 'coordinates', width: 24, isCenter: true },
    { header: 'Phone Number', key: 'phone', width: 18, isCenter: true },
    { header: 'Last Order Date', key: 'last_order_date', width: 18, isDate: true },
    { header: 'Amount History ($)', key: 'amount_history', width: 20, isCurrency: true },
    { header: 'Total Orders', key: 'orders_count', width: 14, isCenter: true },
    { header: 'Channel', key: 'channel', width: 16, isCenter: true },
    { header: 'Sales Representative', key: 'rep_name', width: 24 },
    { header: 'Delivery Status', key: 'status', width: 16, isStatusBadge: true }
  ]

  const data = stores.map(st => {
    let lastOrderDate = 'N/A'
    let repName = 'Unassigned'
    if (st.orders && st.orders.length) {
      const sorted = [...st.orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      const latestOrder = sorted[0]
      if (latestOrder.created_at) {
        lastOrderDate = new Date(latestOrder.created_at).toLocaleDateString()
      }
      repName = latestOrder.user?.name || 'Unassigned'
    }

    const locCombined = [st.province, st.customer_address !== 'N/A' ? st.customer_address : ''].filter(Boolean).join(', ')

    return {
      customer_id: st.customer_id || ('STORE-' + st.store_id),
      shop_name: st.shop_name,
      location: locCombined || st.location,
      coordinates: st.location,
      phone: st.contact || 'N/A',
      last_order_date: lastOrderDate,
      amount_history: Number(st.total_amount || 0),
      orders_count: st.orders.length,
      channel: st.channel,
      rep_name: repName,
      status: st.status ? (st.status.charAt(0).toUpperCase() + st.status.slice(1)) : 'Normal'
    }
  })

  const dateStr = new Date().toISOString().slice(0, 10)
  await exportStyledExcel({
    title: 'AFC Direct Sales — Store Network & Territory Map Report',
    subtitle: 'Store distribution, delivery statuses, and revenue history',
    sheetName: 'Store Map Report',
    filename: `store_map_report_${dateStr}`,
    columns,
    data
  })
}

// Map control functions
async function initDashboardMap() {
  if (process.client && !dashboardMap.value) {
    const LModule = await import('leaflet')
    const L = LModule.default || LModule
    ;(window as any).L = L

    // Comprehensive Leaflet safety patches for zoom/scroll transitions
    if (!(L as any).__patched) {
      ;(L as any).__patched = true

      const gridProto = (L as any)?.GridLayer?.prototype
      if (gridProto) {
        const origAnimateZoom = gridProto._animateZoom
        gridProto._animateZoom = function (this: any, opt: any) {
          if (!this._map) return
          return origAnimateZoom?.call(this, opt)
        }
        const origUpdateLevels = gridProto._updateLevels
        gridProto._updateLevels = function (this: any) {
          if (!this._map) return
          return origUpdateLevels?.call(this)
        }
        const origSetView = gridProto._setView
        if (origSetView) {
          gridProto._setView = function (this: any, center: any, zoom: any, noPrune: any, noUpdate: any) {
            if (!this._map) return
            return origSetView.call(this, center, zoom, noPrune, noUpdate)
          }
        }
        const origResetView = gridProto._resetView
        if (origResetView) {
          gridProto._resetView = function (this: any, e: any) {
            if (!this._map) return
            return origResetView.call(this, e)
          }
        }
      }

      const markerProto = (L as any)?.Marker?.prototype
      if (markerProto) {
        const origMarkerAnimate = markerProto._animateZoom
        markerProto._animateZoom = function (this: any, opt: any) {
          if (!this._map) return
          return origMarkerAnimate?.call(this, opt)
        }
      }

      const popupProto = (L as any)?.Popup?.prototype
      if (popupProto) {
        const origPopupAnimate = popupProto._animateZoom
        popupProto._animateZoom = function (this: any, opt: any) {
          if (!this._map) return
          return origPopupAnimate?.call(this, opt)
        }
      }

      const layerProto = (L as any)?.Layer?.prototype
      if (layerProto) {
        const origLayerAnimate = layerProto._animateZoom
        if (origLayerAnimate) {
          layerProto._animateZoom = function (this: any, opt: any) {
            if (!this._map) return
            return origLayerAnimate.call(this, opt)
          }
        }
      }
    }

    try {
      await import('leaflet.markercluster')
    } catch (e) {
      console.warn('markercluster import error', e)
    }

    dashboardMap.value = L.map('dashboard-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([11.5564, 104.9282], 13) // Default to Phnom Penh

    // Set initial layer
    setMapLayer(activeMapLayer.value)

    dashboardClusterGroup.value = L.featureGroup()
    dashboardMap.value.addLayer(dashboardClusterGroup.value)

    // Click on map to view and copy coordinates
    dashboardMap.value.on('click', (e: any) => {
      const clickLat = e.latlng.lat
      const clickLng = e.latlng.lng
      const formattedCoords = `${clickLat.toFixed(6)}, ${clickLng.toFixed(6)}`

      L.popup({
        className: 'glass-popup-container',
        offset: [0, -5]
      })
      .setLatLng(e.latlng)
      .setContent(`
        <div class="p-3 min-w-[220px] font-sans">
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1 font-bold" style="margin: 0 0 6px 0;">
            <span>📍 Map Coordinates</span>
          </p>
          <div style="background: #f1f5f9; padding: 8px 10px; border-radius: 10px; margin-bottom: 10px; font-family: monospace; font-size: 11px; font-weight: 800; color: #1e293b; text-align: center; border: 1px solid #e2e8f0; user-select: all;">
            ${formattedCoords}
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button 
              onclick="window.__copyMapCoords('${formattedCoords}', this)" 
              style="flex: 1; padding: 6px 12px; background: #2563eb; color: white; border: none; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 4px rgba(37,99,235,0.2);">
              <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <span>Copy Lat, Lng</span>
            </button>
            <a href="https://www.google.com/maps?q=${clickLat},${clickLng}" target="_blank" rel="noopener noreferrer" 
               style="padding: 6px 10px; background: #f1f5f9; color: #334155; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 11px; text-decoration: none; display: flex; align-items: center; justify-content: center;" title="Open in Google Maps">
              <svg style="width: 13px; height: 13px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          </div>
        </div>
      `)
      .openOn(dashboardMap.value)
    })
    
    // Add watcher to refresh pins dynamically
    watch(filteredMapStores, () => {
      updateDashboardMapMarkers()
    }, { deep: true, immediate: true })

    updateDashboardMapMarkers()
  }
}

function updateDashboardMapMarkers() {
  if (!dashboardMap.value || !dashboardClusterGroup.value) return
  
  dashboardClusterGroup.value.clearLayers()
  const L = (window as any).L
  if (!L) return
  
  const usedCoordinates = new Map<string, number>()

  filteredMapStores.value.forEach(store => {
    // Coordinates are already normalized and Cambodia-validated by filteredMapStores
    const coords = normalizeCoordinate(store.location)
    if (!coords) return
    let lat = coords.lat
    let lng = coords.lng
    const exactLat = store.raw_lat ?? coords.lat
    const exactLng = store.raw_lng ?? coords.lng
    const formattedExactCoords = `${exactLat.toFixed(6)}, ${exactLng.toFixed(6)}`
    
    // Simple Coordinate Jitter for markers
    const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
    const count = usedCoordinates.get(coordKey) || 0
    usedCoordinates.set(coordKey, count + 1)
    
    if (count > 0) {
      const angle = count * (Math.PI / 3)
      const radius = 0.0004 * count
      lat += Math.cos(angle) * radius
      lng += Math.sin(angle) * radius
    }

    // Status colors
    let color = '#d97706' // Pending (Amber-600)
    if (store.status === 'completed') color = '#059669' // Completed (Emerald-600)
    if (store.status === 'cancelled') color = '#dc2626' // Cancelled (Red-600)

    const shopName = store.shop_name
    const escapedShopName = shopName.replace(/"/g, '&quot;')

    // Custom Small Circle DivIcon
    const customIcon = L.divIcon({
      className: 'custom-store-pin-wrapper',
      html: `
        <div style="
          background-color: ${color};
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2.5px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
          cursor: pointer;
        "></div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })

    const marker = L.marker([lat, lng], { 
      icon: customIcon,
      title: shopName,
      zIndexOffset: store.status === 'pending' ? 1000 : 0 
    })

    let ordersListHtml = store.orders.map((order: any) => `
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; padding: 4px 0; border-bottom: 1px solid rgba(0,0,0,0.05); gap: 8px;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-family: monospace; color: #4b5563;">#${order.so_number || order.id}</span>
          ${order.is_direct_sale ? '<span style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; font-size: 7.5px; font-weight: 900; padding: 1px 3.5px; border-radius: 4px; text-transform: uppercase;">Direct Drop</span>' : ''}
        </div>
        <span style="font-weight: 850; color: #1f2937;">$${Number(order.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
        <span style="
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 8px;
          text-transform: uppercase;
          font-weight: 900;
          ${order.status === 'completed' ? 'background: #ecfdf5; color: #047857;' : order.status === 'pending' ? 'background: #fffbeb; color: #b45309;' : 'background: #fef2f2; color: #b91c1c;'}
        ">${order.status}</span>
      </div>
    `).join('')

    marker.bindPopup(`
      <div class="p-3 min-w-[240px] font-sans">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex justify-between items-center font-bold" style="margin: 0 0 4px 0;">
          <span>Customer ID: ${store.customer_id || 'N/A'}</span>
          <span style="color: #6366f1;">Profile: ${store.store_type}</span>
        </p>
        <h4 class="text-sm font-black text-slate-900 mb-0.5" style="margin: 0 0 2px 0; font-size: 13px; font-weight: 900;">${escapedShopName}</h4>
        <p class="text-xs font-bold text-slate-500 mb-2 truncate max-w-[220px]" style="margin: 0 0 8px 0; color: #64748b;">${store.customer_address}</p>
        
        <!-- Coordinate & Copy Bar -->
        <div style="background: #f1f5f9; padding: 5px 8px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 6px;">
          <div style="display: flex; align-items: center; gap: 4px; font-family: monospace; font-size: 10px; font-weight: 700; color: #334155;">
            <span>📍</span>
            <span>${formattedExactCoords}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button onclick="window.__copyMapCoords('${formattedExactCoords}', this)" 
                    style="background: #2563eb; color: white; border: none; border-radius: 6px; padding: 3px 8px; font-size: 9px; font-weight: 900; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; gap: 3px;">
              <span>Copy</span>
            </button>
            <a href="https://www.google.com/maps?q=${exactLat},${exactLng}" target="_blank" rel="noopener noreferrer" 
               style="background: #e2e8f0; color: #334155; border-radius: 6px; padding: 2px 5px; font-size: 9px; display: flex; align-items: center; text-decoration: none;" title="Open in Google Maps">
              ↗
            </a>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="background: #f8fafc; padding: 6px 8px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 2px;">Channel</span>
            <span style="font-size: 10px; font-weight: 900; color: #475569; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${store.channel}</span>
          </div>
          <div style="background: #eff6ff; padding: 6px 8px; border-radius: 8px; border: 1px solid #bfdbfe;">
            <span style="font-size: 8px; font-weight: 900; color: #60a5fa; text-transform: uppercase; display: block; margin-bottom: 2px;">Total Sales</span>
            <span style="font-size: 10px; font-weight: 900; color: #1d4ed8; display: block;">$${Number(store.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
          <p style="font-size: 9px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin: 0 0 6px 0;">Orders (${store.orders.length})</p>
          <div style="max-height: 100px; overflow-y: auto; padding-right: 4px;">
            ${ordersListHtml}
          </div>
        </div>
      </div>
    `, {
      className: 'glass-popup-container',
      offset: [0, -10]
    })
    
    dashboardClusterGroup.value.addLayer(marker)
  })

  if (dashboardClusterGroup.value.getLayers().length > 0) {
    try {
      dashboardMap.value.fitBounds(dashboardClusterGroup.value.getBounds(), { padding: [80, 80], maxZoom: 15, animate: false })
    } catch (e) {
      console.warn('Could not fit bounds', e)
    }
  }
}

// Invalidate size helper when component is showing
function resizeMap() {
  if (dashboardMap.value) {
    dashboardMap.value.invalidateSize()
    nextTick(() => {
      if (dashboardClusterGroup.value && dashboardClusterGroup.value.getLayers().length > 0) {
        try {
          dashboardMap.value.fitBounds(dashboardClusterGroup.value.getBounds(), { padding: [80, 80], maxZoom: 15, animate: false })
        } catch (e) {
          console.warn('Could not fit bounds on resize', e)
        }
      }
    })
  }
}

defineExpose({
  resizeMap
})

onMounted(() => {
  if (process.client) {
    window.addEventListener('keydown', handleKeydown)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  }
  nextTick(() => {
    initDashboardMap()
  })
})

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  }
  if (dashboardMap.value) {
    dashboardMap.value.remove()
    dashboardMap.value = null
  }
})
</script>
