<template>
  <div class="relative w-full" style="height: 100dvh;">

    <!-- Map fills the screen -->
    <div id="overview-map" class="w-full h-full z-0"></div>

    <!-- Top bar overlay -->
    <div class="absolute top-0 left-0 right-0 z-10 p-4 bg-white/90 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-black text-slate-900 text-lg tracking-tight">Delivery Map</p>
          <p class="text-xs text-slate-500 font-bold">{{ deliveries.length }} Assigned Orders</p>
        </div>
        <NuxtLink to="/delivery" class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm hover:scale-105 transition-transform">
          <Icon name="heroicons:list-bullet" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>
    
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false }) // Full-screen map
const api = useApi()
const router = useRouter()
const authStore = useAuthStore()

const deliveries = ref<any[]>([])
let map: any = null
let markers: any[] = []

onMounted(async () => {
  (window as any).goToDelivery = (id: number) => {
    router.push(`/delivery/map/${id}`)
  }

  try {
    const planId = useRoute().query.plan_id
    if (planId) {
      const data = await api.get('/deliveries/my') as any[]
      deliveries.value = data.filter((d: any) => String(d.delivery_plan_id) === String(planId))
    } else {
      deliveries.value = await api.get('/deliveries/my') as any[]
    }
  } catch (e) {
    console.error('Failed to load active deliveries', e)
  }
  
  await initMap()
})

onUnmounted(() => {
  if (map) map.remove()
})

async function initMap() {
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  map = L.map('overview-map').setView([11.5564, 104.9282], 13) // Default to Phnom Penh
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  const destIcon = L.divIcon({
    html: `<div style="background:#ef4444;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3)"></div>`,
    className: '', iconSize: [32, 32], iconAnchor: [16, 32]
  })

  // Group to zoom to fit all markers
  const bounds = L.latLngBounds([])

  deliveries.value.forEach((d, index) => {
    let lat = 11.5564
    let lng = 104.9282
    
    const loc = d.order?.location
    if (loc && /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(loc.trim())) {
      [lat, lng] = loc.split(',').map(Number)
    } else {
      // Simulate random spread if no exact GPS is available so pins don't overlap completely
      lat += (Math.random() - 0.5) * 0.04
      lng += (Math.random() - 0.5) * 0.04
    }

    bounds.extend([lat, lng])

    const popupHtml = `
      <div class="p-2 space-y-2 min-w-[150px]">
        <h4 class="font-black text-sm text-slate-900">${d.order?.shop_name}</h4>
        <p class="text-xs text-slate-500 truncate">${d.order?.customer_address || 'No address'}</p>
        <div class="pt-2">
          <button onclick="window.goToDelivery(${d.id})" class="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-xs rounded-xl transition-colors">
            ${d.status === 'in_transit' ? 'Resume Delivery' : 'Start Delivery'}
          </button>
        </div>
      </div>
    `

    const marker = L.marker([lat, lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(popupHtml)
      
    markers.push(marker)
  })

  // Fit bounds if we have pins
  if (markers.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}
</script>

<style>
/* Override Leaflet z-index so header appears above map */
.leaflet-control-container { z-index: 5 !important; }
.leaflet-popup-content-wrapper { border-radius: 16px; overflow: hidden; }
.leaflet-popup-content { margin: 10px 14px; }
</style>
