<template>
  <div class="flex-1 flex flex-col bg-slate-50 h-full overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 z-50 shadow-sm">
      <div class="flex items-center gap-4">
        <NuxtLink to="/admin/orders" class="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all group">
          <Icon name="heroicons:arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
        </NuxtLink>
        <div>
          <h1 class="text-xl font-black text-slate-900 italic tracking-tight">Market Intelligence</h1>
          <p class="text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">Geographic Performance Analysis</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200 shadow-sm">
           <Icon name="heroicons:calendar" class="w-4 h-4 text-blue-600" />
           <input type="date" v-model="startDate" @change="fetchData" class="bg-transparent text-slate-900 text-[10px] font-bold focus:outline-none border-none p-0 cursor-pointer uppercase" />
           <span class="text-slate-400 text-[10px] font-black px-1">TO</span>
           <input type="date" v-model="endDate" @change="fetchData" class="bg-transparent text-slate-900 text-[10px] font-bold focus:outline-none border-none p-0 cursor-pointer uppercase" />
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="flex-1 relative overflow-hidden bg-slate-100">
      <div id="analysis-map" class="absolute inset-0 z-0"></div>
      
      <!-- Intensity Legend -->
      <div class="absolute bottom-8 left-8 z-10 bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-2xl min-w-[200px]">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Icon name="heroicons:bolt" class="w-4 h-4 text-amber-600" />
          Sales Intensity
        </h3>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <p class="text-[11px] font-black text-slate-900 uppercase tracking-wider">High Volume</p>
              <p class="text-[9px] font-bold text-slate-500 italic">>$1,000 Cumulative</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center scale-75">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            </div>
            <div>
              <p class="text-[11px] font-black text-slate-700 uppercase tracking-wider">Standard Growth</p>
              <p class="text-[9px] font-bold text-slate-500 italic">$100 - $500 Range</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Global Performance Stats -->
      <div class="absolute top-8 right-8 z-10 space-y-3 pointer-events-none">
        <div class="bg-white border-l-4 border-blue-600 px-6 py-4 border border-slate-200 rounded-2xl shadow-xl pointer-events-auto min-w-[180px]">
          <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Mapped Revenue</p>
          <p class="text-2xl font-black text-slate-900 tracking-tight">${{ totalMappedRevenue.toLocaleString() }}</p>
        </div>
        <div class="bg-white border-l-4 border-amber-600 px-6 py-4 border border-slate-200 rounded-2xl shadow-xl pointer-events-auto min-w-[180px]">
          <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Hotspot Regions</p>
          <p class="text-2xl font-black text-slate-900 tracking-tight">{{ clusterCount }}</p>
        </div>

        <!-- Selection Controls -->
        <div class="flex flex-col gap-3 pointer-events-auto">
          <button @click="toggleSelectionMode" 
            class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-sm"
            :class="isSelecting ? 'bg-red-600 text-white border-red-700 shadow-lg shadow-red-500/20' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900'">
            <Icon :name="isSelecting ? 'heroicons:x-mark' : 'heroicons:pencil-square'" class="w-6 h-6" />
          </button>
          
          <div v-if="selectionBounds" class="space-y-3">
             <button @click="clearSelection" 
               class="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all">
               <Icon name="heroicons:trash" class="w-4 h-4" />
               Clear Area
             </button>
             
             <NuxtLink :to="`/admin/orders/area?bounds=${JSON.stringify(selectionBounds)}&start=${startDate}&end=${endDate}`"
               class="px-4 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
               <Icon name="heroicons:list-bullet" class="w-4 h-4" />
               View Area List
             </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
const api = useApi()
const router = useRouter()
let map: any = null
let intensityGroup: any = null
let selectionLayer: any = null

const isSelecting = ref(false)
const selectionBounds = ref<any>(null)
const isDrawing = ref(false)
const startPoint = ref<any>(null)

definePageMeta({ 
  layout: 'admin',
  fullWidth: true
})

const startDate = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const orders = ref<any[]>([])

const mappedOrders = computed(() => {
  let allMapped = (orders.value || []).filter(o => {
    if (!o.location) return false
    return /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/.test(o.location.trim())
  })

  if (!selectionBounds.value) return allMapped

  const [[lat1, lng1], [lat2, lng2]] = selectionBounds.value
  const minLat = Math.min(lat1, lat2)
  const maxLat = Math.max(lat1, lat2)
  const minLng = Math.min(lng1, lng2)
  const maxLng = Math.max(lng1, lng2)

  return allMapped.filter(o => {
    const [lat, lng] = o.location.split(',').map((n: string) => parseFloat(n.trim()))
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
  })
})

const totalMappedRevenue = computed(() => {
  return mappedOrders.value.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
})

const clusterCount = computed(() => {
  // Simple heuristic for clusters (unique coordinate points)
  const uniquePoints = new Set(mappedOrders.value.map(o => o.location.trim()))
  return uniquePoints.size
})

async function fetchData() {
  try {
    const res = await api.get('/orders', { 
      params: { start_date: startDate.value, end_date: endDate.value } 
    }) as any
    orders.value = res.orders || []
    setTimeout(updateIntensityCircles, 100)
  } catch (e) {
    console.error('Analysis map failed to load', e)
  }
}

function clearSelection() {
  selectionBounds.value = null
  if (selectionLayer) {
    selectionLayer.remove()
    selectionLayer = null
  }
}

function toggleSelectionMode() {
  isSelecting.value = !isSelecting.value
  if (!isSelecting.value) {
    clearSelection()
    if (map) {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
    }
  } else {
    if (map) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
    }
  }
}

function updateIntensityCircles() {
  if (!map || !intensityGroup) return
  
  intensityGroup.clearLayers()
  const L = (window as any).L
  if (!L) return
  
  // Group by location to show aggregate performance
  const locationGroups: Record<string, { total: number; shop: string; details: any[] }> = {}
  
  mappedOrders.value.forEach(order => {
    const loc = order.location.trim()
    if (!locationGroups[loc]) {
       locationGroups[loc] = { total: 0, shop: order.shop_name, details: [] }
    }
    locationGroups[loc].total += Number(order.total_amount || 0)
    locationGroups[loc].details.push(order)
  })

  Object.entries(locationGroups).forEach(([loc, data]) => {
    const [lat, lng] = loc.split(',').map(n => parseFloat(n.trim()))
    
    // Scale radius based on total sales (min 10, max 100)
    const scaleFactor = Math.log10(data.total + 1) * 20
    const radius = Math.max(10, Math.min(100, scaleFactor))
    
    // Intensity color scaling
    const opacity = Math.max(0.2, Math.min(0.8, data.total / 2000))
    const color = data.total > 1000 ? '#2563eb' : '#3b82f6'

    const circle = L.circleMarker([lat, lng], {
      radius: radius,
      fillColor: color,
      color: '#fff',
      weight: 1,
      opacity: 0.3,
      fillOpacity: opacity,
      className: 'performance-pulse'
    }).bindPopup(`
      <div class="p-4 min-w-[240px] font-sans">
        <p class="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2 px-3 py-1 bg-blue-500/5 rounded-full inline-block">Regional Performance</p>
        <h4 class="text-lg font-black text-slate-900 leading-tight mb-0.5">${data.shop}</h4>
        <div class="flex items-center gap-2 mb-4">
           <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
           <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">${data.details.length} Transactions Captured</p>
        </div>
        
        <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-inner">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Sales</span>
            <span class="text-xl font-black text-slate-900">$${data.total.toLocaleString()}</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
            <div class="bg-blue-600 h-full" style="width: ${Math.min(100, (data.total / 2000) * 100)}%"></div>
          </div>
        </div>
        
        <div class="mt-4 pt-3 flex justify-end">
           <button onclick="window.__nuxtRouter.push('/admin/orders/area?loc=${encodeURIComponent(loc)}&start=${startDate.value}&end=${endDate.value}')" 
             style="background:none;border:none;cursor:pointer;color:#2563eb;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;display:flex;align-items:center;gap:4px;padding:0">
             View Orders 
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
           </button>
        </div>
      </div>
    `, {
      className: 'glass-popup-container shadow-2xl',
      offset: [0, 0]
    })

    intensityGroup.addLayer(circle)
  })

  if (intensityGroup.getLayers().length > 0) {
    map.fitBounds(intensityGroup.getBounds(), { padding: [100, 100], maxZoom: 14 })
  }
}

onMounted(async () => {
  if (process.client) {
    // Expose Nuxt router so Leaflet popup onclick can use SPA navigation
    ;(window as any).__nuxtRouter = router
    const L = await import('leaflet')
    ;(window as any).L = L

    map = L.map('analysis-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([11.5564, 104.9282], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map)

    intensityGroup = L.featureGroup().addTo(map)

    // Map Drawing Events
    const handleDrawStart = (e: any) => {
      if (!isSelecting.value) return
      isDrawing.value = true
      startPoint.value = e.latlng
      
      if (selectionLayer) selectionLayer.remove()
      selectionLayer = L.rectangle([e.latlng, e.latlng], {
        color: '#ff4444', 
        weight: 2, 
        fillOpacity: 0.1,
        dashArray: '5, 5'
      }).addTo(map)
    }

    const handleDrawMove = (e: any) => {
      if (!isDrawing.value || !selectionLayer) return
      selectionLayer.setBounds(L.latLngBounds(startPoint.value, e.latlng))
    }

    const handleDrawEnd = (e: any) => {
      if (!isDrawing.value) return
      isDrawing.value = false
      
      if (selectionLayer) {
        const bounds = selectionLayer.getBounds()
        selectionBounds.value = [
          [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
          [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
        ]
      }
    }

    map.on('mousedown', handleDrawStart)
    map.on('mousemove', handleDrawMove)
    map.on('mouseup', handleDrawEnd)

    // Touch support for mobile viewports
    map.on('touchstart', handleDrawStart)
    map.on('touchmove', handleDrawMove)
    map.on('touchend', handleDrawEnd)

    await fetchData()
  }
})

onUnmounted(() => {
  if (map) map.remove()
})
</script>

<style>
.glass-popup-container .leaflet-popup-content-wrapper {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 0;
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.5);
}
.glass-popup-container .leaflet-popup-content {
  margin: 0;
}
.glass-popup-container .leaflet-popup-tip {
  background: white;
}
.performance-pulse {
  animation: marker-pulse 3s infinite;
}
@keyframes marker-pulse {
  0% { filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0.4)); }
  50% { filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.6)); }
  100% { filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0.4)); }
}
</style>
