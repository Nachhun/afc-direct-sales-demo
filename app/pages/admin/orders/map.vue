<template>
  <div class="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0 z-50 shadow-xs">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/orders" class="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all group">
          <Icon name="heroicons:arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
        </NuxtLink>
        <div>
          <h1 class="text-xl font-black text-slate-900">Live Order Map</h1>
          <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Visualizing {{ filteredOrders.length }} / {{ mappedOrders.length }} stores geographically</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Store Name Search -->
        <div class="relative w-56 sm:w-64">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search store name or order ID..."
            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-xs"
          />
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Date Filter -->
        <div class="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 shadow-xs">
           <Icon name="heroicons:calendar" class="w-4 h-4 text-blue-600" />
           <input type="date" v-model="startDate" @change="fetchOrders" class="bg-transparent text-slate-900 text-[10px] font-black focus:outline-none border-none p-0 cursor-pointer uppercase" />
           <span class="text-slate-400 text-[10px] font-black">TO</span>
           <input type="date" v-model="endDate" @change="fetchOrders" class="bg-transparent text-slate-900 text-[10px] font-black focus:outline-none border-none p-0 cursor-pointer uppercase" />
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div 
      ref="mapWrapperRef"
      :class="isFullscreen ? 'fixed inset-0 z-[999999] w-screen h-screen bg-slate-100 rounded-none' : 'flex-1 relative overflow-hidden'" 
      class="transition-all duration-300">
      <div id="map" class="absolute inset-0 z-0 bg-slate-100"></div>

      <!-- Map Layer Switcher & Fullscreen Button (Top Left) -->
      <div class="absolute top-5 left-5 z-10 flex items-center gap-2 pointer-events-auto">
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

      <!-- Hint Badge (Bottom Left) -->
      <div class="absolute bottom-5 left-5 z-10 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-auto text-[10px] font-bold text-slate-600">
        <Icon name="heroicons:cursor-arrow-rays" class="w-3.5 h-3.5 text-blue-600" />
        <span>Click anywhere on map to copy coordinates</span>
      </div>
      
      <!-- Stats Overlay -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 pointer-events-none">
        <div class="bg-white/95 backdrop-blur-md border border-slate-200 px-6 py-3.5 flex items-center gap-5 border-t-4 border-t-blue-600 shadow-xl pointer-events-auto rounded-2xl">
          <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
            <Icon name="heroicons:map-pin" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex items-center gap-6">
            <div>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Mapped Stores</p>
              <p class="text-2xl font-black text-slate-900 leading-none mt-0.5">{{ filteredOrders.length }}</p>
            </div>
            <NuxtLink to="/admin/orders?status=no_gps" v-if="orders.length > mappedOrders.length" class="border-l border-slate-200 pl-6 group cursor-pointer">
              <p class="text-[9px] font-black text-amber-500 uppercase tracking-wider group-hover:underline flex items-center gap-1">
                Missing GPS
                <Icon name="heroicons:arrow-right" class="w-3 h-3" />
              </p>
              <p class="text-2xl font-black text-amber-600 leading-none mt-0.5">{{ orders.length - mappedOrders.length }}</p>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Legend Overlay -->
      <div class="absolute top-5 right-5 z-10 bg-white/95 backdrop-blur-md border border-slate-200/80 p-4 space-y-2.5 shadow-xl pointer-events-auto rounded-2xl min-w-[150px]">
        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1.5 mb-1 flex items-center gap-1.5">
          <Icon name="heroicons:list-bullet" class="w-3.5 h-3.5" />
          Status Key
        </p>
        <div class="flex items-center gap-2.5 group">
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-700">Pending</span>
        </div>
        <div class="flex items-center gap-2.5 group">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
          <span class="text-[10px] font-black uppercase tracking-wider text-slate-700">Completed</span>
        </div>
        <div class="flex items-center gap-2.5 group">
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

definePageMeta({ 
  layout: 'admin',
  fullWidth: true
})

const api = useApi()
const mapWrapperRef = ref<HTMLElement | null>(null)
let map: any = null
let clusterGroup: any = null
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
      console.warn('Native fullscreen fallback', err)
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
        if (map) {
          map.invalidateSize(true)
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
  if (!map) return
  const L = (window as any).L
  if (!L) return

  // Remove existing tile layers
  Object.keys(tileLayers).forEach(k => {
    const l = tileLayers[k as MapLayerType]
    if (l && map.hasLayer(l)) {
      map.removeLayer(l)
    }
  })

  // Create or add layer
  if (!tileLayers[layer]) {
    const config = mapLayerConfigs[layer]
    tileLayers[layer] = L.tileLayer(config.url, config.options)
  }

  map.addLayer(tileLayers[layer])
  tileLayers[layer].setZIndex(1)

  if (clusterGroup) {
    clusterGroup.bringToFront()
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

const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const orders = ref<any[]>([])
const searchQuery = ref('')

const mappedOrders = computed(() => {
  return (orders.value || []).filter(o => {
    if (!o.location) return false
    return /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/.test(o.location.trim())
  })
})

const filteredOrders = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return mappedOrders.value
  return mappedOrders.value.filter(o => {
    const shopName = (o.shop_name || '').toLowerCase()
    const id = String(o.id || '')
    const address = (o.customer_address || '').toLowerCase()
    return shopName.includes(query) || id.includes(query) || address.includes(query)
  })
})

watch(filteredOrders, () => {
  updateMapMarkers()
})

async function fetchOrders() {
  try {
    const res = await api.get('/orders', { 
      params: { start_date: startDate.value, end_date: endDate.value } 
    }) as any
    orders.value = res.orders || []
    setTimeout(updateMapMarkers, 100)
  } catch (e) {
    console.error('Failed to fetch orders for map', e)
  }
}

function escapeHtml(str: string) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function updateMapMarkers() {
  if (!map || !clusterGroup) return
  
  clusterGroup.clearLayers()
  const L = (window as any).L
  if (!L) return
  
  const usedCoordinates = new Map<string, number>()

  filteredOrders.value.forEach(order => {
    let [lat, lng] = order.location.split(',').map((n: string) => parseFloat(n.trim()))
    const exactCoords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    
    // Simple Jitter for stacked pins
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
    if (order.status === 'completed') color = '#059669' // Completed (Emerald-600)
    if (order.status === 'cancelled') color = '#dc2626' // Cancelled (Red-600)

    const shopName = order.shop_name || `Store #${order.id}`
    const escapedShopName = escapeHtml(shopName)

    // Custom DivIcon showing STORE NAME
    const customIcon = L.divIcon({
      className: 'custom-store-pin-wrapper',
      html: `
        <div style="
          background-color: ${color};
          color: white;
          padding: 4px 10px;
          border-radius: 9999px;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 800;
          font-size: 10px;
          letter-spacing: 0.2px;
          white-space: nowrap;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
          border: 1.5px solid rgba(255,255,255,0.9);
          transform: translate(-50%, -100%);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          max-width: 160px;
        ">
          <span style="width: 6px; height: 6px; background: white; border-radius: 50%; shrink-0: 0;"></span>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapedShopName}</span>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    })

    const marker = L.marker([lat, lng], { 
      icon: customIcon,
      title: shopName,
      zIndexOffset: order.status === 'pending' ? 1000 : 0 
    })
      .bindPopup(`
        <div class="p-4 min-w-[240px] font-sans">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between items-center" style="margin: 0 0 4px 0;">
            <span>Order #${order.id}</span>
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-black">${order.status.toUpperCase()}</span>
          </p>
          <h4 class="text-base font-black text-slate-900 mb-0.5" style="margin: 0 0 2px 0;">${escapedShopName}</h4>
          <p class="text-xs font-bold text-slate-500 mb-2 truncate max-w-[220px]" style="margin: 0 0 8px 0; color: #64748b;">${escapeHtml(order.customer_address || 'N/A')}</p>

          <!-- Coordinate & Copy Bar -->
          <div style="background: #f1f5f9; padding: 5px 8px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; gap: 6px;">
            <div style="display: flex; align-items: center; gap: 4px; font-family: monospace; font-size: 10px; font-weight: 700; color: #334155;">
              <span>📍</span>
              <span>${exactCoords}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">
              <button onclick="window.__copyMapCoords('${exactCoords}', this)" 
                      style="background: #2563eb; color: white; border: none; border-radius: 6px; padding: 3px 8px; font-size: 9px; font-weight: 900; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; gap: 3px;">
                <span>Copy</span>
              </button>
              <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" rel="noopener noreferrer" 
                 style="background: #e2e8f0; color: #334155; border-radius: 6px; padding: 2px 5px; font-size: 9px; display: flex; align-items: center; text-decoration: none;" title="Open in Google Maps">
                ↗
              </a>
            </div>
          </div>

          ${order.delivery?.planned_delivery_date ? `
            <div class="mb-3 bg-blue-50 border border-blue-100 rounded-xl p-2 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span class="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                Planned: ${new Date(order.delivery.planned_delivery_date).toLocaleDateString()}
              </span>
            </div>
          ` : ''}

          <div class="flex items-center justify-between border-t border-slate-100 pt-3">
            <div class="flex flex-col">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</span>
              <span class="text-base font-black text-blue-600 leading-none">$${Number(order.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <a href="/admin/orders/${order.id}" style="color: white !important;" class="bg-blue-600 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">Details →</a>
          </div>
        </div>
      `, {
        className: 'glass-popup-container',
        offset: [0, -15]
      })
    
    clusterGroup.addLayer(marker)
  })

  // Fit bounds if markers exist
  if (clusterGroup.getLayers().length > 0) {
    try {
      map.fitBounds(clusterGroup.getBounds(), { padding: [80, 80], maxZoom: 15, animate: false })
    } catch (e) {
      console.warn('Could not fit bounds', e)
    }
  }
}

onMounted(async () => {
  if (process.client) {
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

    map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([11.5564, 104.9282], 13) // Default to Phnom Penh

    // Set initial layer
    setMapLayer(activeMapLayer.value)

    // Click on map to view and copy coordinates
    map.on('click', (e: any) => {
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
      .openOn(map)
    })

    // High performance cluster group with fallback
    const createCluster = (L as any).markerClusterGroup || (window as any).L?.markerClusterGroup
    if (typeof createCluster === 'function') {
      clusterGroup = createCluster({
        maxClusterRadius: 45,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount()
          let bg = 'bg-blue-600'
          if (count > 50) bg = 'bg-indigo-600'
          if (count > 100) bg = 'bg-purple-600'
          return L.divIcon({
            html: `<div class="${bg} w-10 h-10 text-white font-black text-xs rounded-full flex items-center justify-center border-2 border-white shadow-xl hover:scale-110 transition-transform">${count}</div>`,
            className: 'custom-cluster-wrapper',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        }
      })
    } else {
      clusterGroup = L.featureGroup()
    }
    map.addLayer(clusterGroup)

    if (process.client) {
      window.addEventListener('keydown', handleKeydown)
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    }

    await fetchOrders()
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  }
  if (map) map.remove()
})
</script>

<style>
.custom-store-pin-wrapper, .custom-cluster-wrapper {
  background: none;
  border: none;
}
.glass-popup-container .leaflet-popup-content-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: 28px;
  padding: 0;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.glass-popup-container .leaflet-popup-content {
  margin: 0;
}
.glass-popup-container .leaflet-popup-tip {
  background: rgba(255, 255, 255, 0.95);
}
.leaflet-container {
  background: #f8fafc !important;
}
</style>
