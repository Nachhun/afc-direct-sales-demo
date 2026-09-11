<template>
  <div class="relative w-full" style="height: 100dvh;">

    <!-- Map fills the screen -->
    <div id="delivery-map" class="w-full h-full z-0"></div>

    <!-- Top bar overlay -->
    <div class="absolute top-0 left-0 right-0 z-10 p-4 bg-white/90 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div class="flex items-center gap-3">
        <NuxtLink to="/delivery" class="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-0.5 flex-wrap">
            <p class="font-black text-slate-900 text-sm truncate">{{ delivery?.order?.shop_name }}</p>
            <span v-if="delivery?.order?.order_custom_id" class="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">ORD: {{ delivery.order.order_custom_id }}</span>
            <span v-if="delivery?.delivery_custom_id" class="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">DEL: {{ delivery.delivery_custom_id }}</span>
          </div>
          <p class="text-xs text-slate-400 truncate">{{ delivery?.order?.customer_address || 'No address' }}</p>
        </div>
        <span :class="delivery?.is_overdue ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'" class="text-[10px] font-black uppercase px-2 py-1 rounded-lg">
          {{ delivery?.is_overdue ? 'OVERDUE' : 'On Track' }}
        </span>
      </div>
    </div>

    <!-- Bottom action panel -->
    <div class="absolute bottom-0 left-0 right-0 z-10 p-4 bg-white/90 backdrop-blur-sm border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] space-y-3">
      
      <!-- Silent Error Alert -->
      <div v-if="mapError" class="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[10px] font-bold flex items-center justify-between border border-red-100">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:exclamation-triangle" class="w-3 h-3" />
          <span>{{ mapError }}</span>
        </div>
        <button @click="mapError = ''" class="text-red-400 hover:text-red-600">
          <Icon name="heroicons:x-mark" class="w-3 h-3" />
        </button>
      </div>

      <!-- Deadline -->
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-500 font-bold">Deadline</span>
        <span :class="delivery?.is_overdue ? 'text-red-600 font-black' : 'text-slate-700 font-bold'">
          {{ delivery?.deadline_at ? new Date(delivery.deadline_at).toLocaleString() : '—' }}
        </span>
      </div>

      <!-- Products summary -->
      <div class="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 space-y-0.5">
        <p class="font-black text-slate-700 mb-1">📦 Items to deliver:</p>
        <p v-for="item in (delivery?.order?.items || [])" :key="item.id">
          • {{ item.product?.name }} [{{ item.unit || 'pc' }}] × {{ item.qty }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2">
        <!-- Row 1: Primary Actions -->
        <div class="flex gap-3 items-end">
          <div class="flex-1 flex gap-2">
              <button @click="getRoute"
                :disabled="!isValidDestination(delivery?.order?.location)"
                :class="!isValidDestination(delivery?.order?.location) ? 'bg-slate-300 pointer-events-none' : 'bg-slate-800 hover:bg-slate-900 shadow-lg'"
                class="flex-1 py-3 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all">
                <Icon name="heroicons:map-pin" class="w-5 h-5" />
                Route
              </button>
              <button @click="openGoogleMaps"
                :disabled="!isValidDestination(delivery?.order?.location)"
                class="bg-blue-50 text-blue-600 px-4 py-3 rounded-2xl hover:bg-blue-100 transition-all border border-blue-100 flex items-center justify-center"
                title="Open in Google Maps">
                <Icon name="logos:google-maps" class="w-5 h-5" />
              </button>
            </div>
          
          <!-- Complete -->
          <div v-if="['pending', 'in_transit'].includes(delivery?.status)" class="flex-1 space-y-2">
            <div v-if="distanceToTarget > 0 && distanceToTarget < 999" class="text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
              <Icon name="heroicons:map-pin" class="w-3 h-3" />
              <span>Distance: {{ (distanceToTarget * 1000).toFixed(0) }}m</span>
            </div>

            <button @click="completeDelivery"
              :disabled="actionLoading"
              class="w-full py-3 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg text-sm bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30">
              <Icon name="heroicons:check-circle" class="w-4 h-4" />
              Complete ✅
            </button>
          </div>
        </div>

        <!-- Row 2: Exception Reporting (Pending or In Transit) -->
        <div v-if="['pending', 'in_transit'].includes(delivery?.status)" class="space-y-1.5 mt-1 border-t border-slate-100 pt-2">
          <!-- Shop Closed -->
          <button @click="markShopClosed"
            :disabled="actionLoading"
            class="w-full py-2 text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-xl flex items-center justify-center gap-1 text-xs transition-all">
            <Icon name="heroicons:x-circle" class="w-4 h-4" />
            Shop Closed ❌
          </button>

          <!-- Customer Cancel -->
          <button @click="showCancelModal = true"
            :disabled="actionLoading"
            class="w-full py-2 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold rounded-xl flex items-center justify-center gap-1 text-xs transition-all">
            <Icon name="heroicons:no-symbol" class="w-4 h-4" />
            Customer Cancel 🚫
          </button>

          <!-- Deliver with Issue -->
          <div v-if="!showIssueForm">
            <button @click="showIssueForm = true"
              :disabled="actionLoading"
              class="w-full py-2 text-orange-600 bg-orange-50 hover:bg-orange-100 font-bold rounded-xl flex items-center justify-center gap-1 text-xs transition-all">
              <Icon name="heroicons:exclamation-triangle" class="w-4 h-4" />
              Deliver with Issue ⚠️
            </button>
          </div>

          <!-- Issue Note Form -->
          <div v-else class="bg-orange-50 border border-orange-100 rounded-xl p-2.5 space-y-2 mt-1 animate-slide-up max-h-[60vh] overflow-y-auto">
            <!-- Issue Category Selection (Matches Drawing) -->
            <div class="flex gap-4 mb-4 bg-white p-3 rounded-2xl border border-orange-100 shadow-sm">
              <label class="flex-1 flex items-center gap-2 cursor-pointer group">
                <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                  :class="issueType === 'shortage' ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 group-hover:border-orange-300'">
                  <Icon v-if="issueType === 'shortage'" name="heroicons:check" class="w-3.5 h-3.5" />
                </div>
                <input type="radio" v-model="issueType" value="shortage" class="hidden" />
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Shortage</span>
              </label>
              
              <div class="w-px h-5 bg-slate-100"></div>

              <label class="flex-1 flex items-center gap-2 cursor-pointer group">
                <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                  :class="issueType === 'partial' ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 group-hover:border-orange-300'">
                  <Icon v-if="issueType === 'partial'" name="heroicons:check" class="w-3.5 h-3.5" />
                </div>
                <input type="radio" v-model="issueType" value="partial" class="hidden" />
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Partial</span>
              </label>
            </div>

            <p class="text-[9px] font-black text-orange-600 uppercase mb-2">Adjust Quantities</p>
            
            <!-- Item Quantity Input (Matches "Enter number" in drawing) -->
            <div class="space-y-2 py-1.5 mb-3">
               <div v-for="item in (delivery?.order?.items || [])" :key="item.id" 
                 class="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <p class="text-[11px] font-black text-slate-800 truncate mb-0.5">{{ item.product?.name }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ordered: {{ item.qty }} {{ item.unit || 'pc' }}</p>
                    </div>
                    <div class="w-24">
                      <label class="text-[8px] font-black text-slate-400 uppercase block mb-1">Delivered Qty</label>
                      <input type="number" v-model.number="itemQuantities[item.id]" 
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"
                        placeholder="0" />
                    </div>
                  </div>
               </div>
            </div>

            <p class="text-[9px] font-black text-orange-600 uppercase">Additional Note</p>
            <textarea v-model="issueNote" rows="2" class="w-full p-2 bg-white border border-orange-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-orange-400" placeholder="e.g. Broken packaging..."></textarea>
            
            <div class="flex gap-3 pt-2">
              <button @click="submitIssue" :disabled="actionLoading" 
                class="flex-1 py-3.5 bg-orange-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-200 active:scale-95 transition-all">
                <Icon v-if="actionLoading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin inline mr-1" />
                Submit Issue
              </button>
              <button @click="showIssueForm = false; issueNote = ''" 
                class="px-6 py-3.5 bg-white border border-orange-200 text-orange-600 text-[11px] font-black uppercase tracking-widest rounded-2xl active:bg-orange-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="authStore.isAdmin && delivery?.status !== 'delivered' && !['in_transit', 'pending', 'shop_closed', 'delivered_with_issue', 'customer_cancelled'].includes(delivery?.status)" class="py-2 text-center text-xs text-blue-600 font-bold">
        Viewing Live Map as Admin.
      </div>

      <!-- Delivered state -->
      <div v-if="delivery?.status === 'delivered'" class="py-4 text-center">
        <p class="text-2xl">✅</p>
        <p class="font-black text-emerald-600">Delivered!</p>
        <p class="text-xs text-slate-400 mt-1">{{ delivery?.completed_at ? new Date(delivery.completed_at).toLocaleString() : '' }}</p>
        <NuxtLink to="/delivery" class="mt-3 btn-secondary inline-block text-sm">Back to list</NuxtLink>
      </div>

      <!-- Customer Cancelled state -->
      <div v-if="delivery?.status === 'customer_cancelled'" class="py-4 text-center">
        <p class="text-2xl">🚫</p>
        <p class="font-black text-rose-600">Customer Cancelled</p>
        <p v-if="delivery?.note" class="text-xs text-slate-600 mt-1 italic px-4">"{{ delivery.note }}"</p>
        <p class="text-[10px] text-slate-400 mt-2 px-6">Order was cancelled at the shop and stock returned. Admins have been notified.</p>
        <NuxtLink to="/delivery" class="mt-4 btn-secondary inline-block text-sm">Back to list</NuxtLink>
      </div>

      <!-- Shop Closed state -->
      <div v-if="delivery?.status === 'shop_closed'" class="py-4 text-center">
        <p class="text-2xl">❌</p>
        <p class="font-black text-red-600">Shop Closed</p>
        <p class="text-xs text-slate-400 mt-1">Reported at {{ new Date().toLocaleString() }}</p>
        <p class="text-[10px] text-slate-400 mt-2 px-6">Admins have been notified of the failed delivery attempt.</p>
        <NuxtLink to="/delivery" class="mt-4 btn-secondary inline-block text-sm">Back to list</NuxtLink>
      </div>

      <!-- Delivered with issue state -->
      <div v-if="delivery?.status === 'delivered_with_issue'" class="py-4 text-center">
        <p class="text-2xl">⚠️</p>
        <p class="font-black text-orange-600">Delivered with Issue</p>
        <p v-if="delivery?.note" class="text-[10px] text-slate-500 mt-1 px-4 italic">"{{ delivery.note }}"</p>
        <p class="text-[10px] text-slate-400 mt-2 px-6">Admins have been notified of the reported shortage/loss.</p>
        <NuxtLink to="/delivery" class="mt-4 btn-secondary inline-block text-sm">Back to list</NuxtLink>
      </div>
    </div>

    <!-- Customer Cancel Modal -->
    <Teleport to="body">
      <div v-if="showCancelModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative animate-slide-up">
          <div class="p-6 pb-4 bg-rose-50 border-b border-rose-100 flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Icon name="heroicons:x-circle" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900">Customer Cancel</h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Order #{{ delivery?.order_id }} · {{ delivery?.order?.shop_name }}</p>
              </div>
            </div>
            <button @click="showCancelModal = false" class="p-2 hover:bg-rose-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <p class="text-xs font-bold text-slate-600">
              Select reason for cancellation:
            </p>

            <div class="space-y-2">
              <label v-for="r in cancelReasons" :key="r" 
                class="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all"
                :class="cancelReason === r ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500/20' : 'border-slate-200 hover:border-rose-200 bg-white'">
                <input type="radio" v-model="cancelReason" :value="r" class="text-rose-600 focus:ring-rose-500 w-4 h-4" />
                <span class="text-xs font-bold text-slate-800">{{ r }}</span>
              </label>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Additional Details (Optional)</label>
              <textarea v-model="customCancelNote" rows="2" 
                placeholder="e.g. Customer cancelled due to budget..."
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-slate-400"></textarea>
            </div>
          </div>

          <div class="p-6 pt-2 border-t border-slate-100 flex gap-3 bg-slate-50/50">
            <button @click="submitCustomerCancel" :disabled="actionLoading"
              class="flex-1 py-3.5 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-1.5">
              <Icon v-if="actionLoading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <span>Confirm Cancel</span>
            </button>
            <button @click="showCancelModal = false"
              class="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">
              Back
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false }) // Full-screen map, no layout chrome
const api = useApi()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const id = route.params.id as string
const delivery = ref<any>(null)
const actionLoading = ref(false)
const showIssueForm = ref(false)
const showCancelModal = ref(false)
const cancelReasons = [
  'Customer changed mind / refused order',
  'Out of budget / Cannot pay COD',
  'Wrong order / already received before',
  'Shop closed permanently / relocated',
  'Other reason'
]
const cancelReason = ref('Customer changed mind / refused order')
const customCancelNote = ref('')
const issueNote = ref('')
const issueType = ref<'shortage' | 'partial'>('shortage')
const itemQuantities = ref<Record<number, number>>({})
let map: any = null
let myMarker: any = null
let destMarker: any = null
let routeLayer: any = null
let locationInterval: any = null
let L: any = null // Store Leaflet instance
let myLat = 0, myLng = 0
const distanceToTarget = ref(999) // Default to far away if unknown
const mapError = ref('')

onMounted(async () => {
  // 1. Pre-load Leaflet
  L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  try {
    // Always fetch single delivery to ensure full relations (items, product, courier)
    delivery.value = await api.get(`/deliveries/${id}`)
    
    // Initialize item quantities for partial delivery reporting
    if (delivery.value?.order?.items) {
      delivery.value.order.items.forEach((item: any) => {
        itemQuantities.value[item.id] = item.qty
      })
    }
  } catch (e) {
    console.error('Failed to load delivery detail', e)
  }
  
  await initMap()
  
  if (authStore.isAdmin) {
    startAdminPolling()
  } else {
    startTracking()
  }
})

onUnmounted(() => {
  clearInterval(locationInterval)
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
  if (map) map.remove()
})

async function initMap() {
  if (!L) return

  map = L.map('delivery-map').setView([11.5564, 104.9282], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  const loc = delivery.value?.order?.location
  let dLat = 11.5564
  let dLng = 104.9282
  
  if (loc && /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(loc.trim())) {
    [dLat, dLng] = loc.split(',').map(Number)
  }

  const status = delivery.value?.status
  const color = status === 'in_transit' ? '#f472b6' : 
                status === 'delivered' ? '#10b981' : 
                status === 'delivered_with_issue' ? '#f97316' :
                status === 'shop_closed' ? '#ef4444' : '#facc15'

  const destIcon = L.divIcon({
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);position:relative;"><div style="width:10px;height:10px;background:white;border-radius:50%;position:absolute;top:8px;left:8px;"></div></div>`,
    className: '', iconSize: [32, 32], iconAnchor: [16, 32]
  })
  destMarker = L.marker([dLat, dLng], { icon: destIcon, zIndexOffset: -50 })
    .addTo(map)
    .bindPopup(`<strong>Point: ${delivery.value?.order?.shop_name}</strong><br>Status: ${status}`)
    .openPopup()
  map.setView([dLat, dLng], 14)
}

async function updateCourierMarker(lat: number, lng: number) {
  if (!L) return
  const status = delivery.value?.status
  const color = status === 'in_transit' ? '#f472b6' : 
                status === 'delivered' ? '#10b981' : 
                status === 'delivered_with_issue' ? '#f97316' :
                status === 'shop_closed' ? '#ef4444' : '#facc15'
  
  const courierIcon = L.divIcon({
    html: `
      <div style="background:${color}; width:28px; height:28px; border-radius:50%; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:14px;">
        🚚
      </div>`,
    className: '', iconSize: [28, 28], iconAnchor: [14, 14]
  })

  if (myMarker) {
    myMarker.setLatLng([lat, lng])
  } else {
    myMarker = L.marker([lat, lng], { icon: courierIcon }).addTo(map).bindPopup(authStore.isAdmin ? '🚚 Courier' : '📍 You')
    if (!authStore.isAdmin || !destMarker) {
      map.setView([lat, lng], 14)
    }
  }

  // Calculate distance to destination
  const loc = delivery.value?.order?.location
  if (loc && /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(loc.trim())) {
    const [dLat, dLng] = loc.split(',').map(Number)
    distanceToTarget.value = calculateDistance(lat, lng, dLat, dLng)
  } else {
    distanceToTarget.value = 0 // Allow completion if shop has no GPS
  }
}

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function startAdminPolling() {
  const update = async () => {
    try {
      // Just re-fetch the delivery to get the latest GPS coordinates
      delivery.value = await api.get(`/deliveries/${id}`)
      if (delivery.value.courier_lat && delivery.value.courier_lng) {
        updateCourierMarker(delivery.value.courier_lat, delivery.value.courier_lng)
      }
    } catch {}
  }
  
  if (delivery.value?.courier_lat && delivery.value?.courier_lng) {
    updateCourierMarker(delivery.value.courier_lat, delivery.value.courier_lng)
  }
  
  locationInterval = setInterval(update, 10000) // Poll every 10s for admin
}

let watchId: number | null = null

function startTracking() {
  if (!navigator.geolocation) return

  // Do not track or prompt for location unless they are actively delivering
  if (!['pending', 'in_transit'].includes(delivery.value?.status)) return

  let lastPush = 0

  // Prevent multiple watchers
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)

  watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      myLat = pos.coords.latitude
      myLng = pos.coords.longitude
      
      updateCourierMarker(myLat, myLng)

      // Throttle backend pushes to once every 2s
      if (['pending', 'in_transit'].includes(delivery.value?.status)) {
        const now = Date.now()
        if (now - lastPush > 2000) {
          lastPush = now
          try {
            await api.put(`/deliveries/${id}/location`, { lat: myLat, lng: myLng })
          } catch {}
        }
      }
    }, 
    (err) => console.warn('Geolocation tracking paused:', err.message), 
    { enableHighAccuracy: true, maximumAge: 1000 }
  )
}

async function getRoute() {
  const fetchAndDrawRoute = async (lat: number, lng: number) => {
    const loc = delivery.value?.order?.location
    if (!isValidDestination(loc)) {
      mapError.value = 'Shop address is not a GPS coordinate. Cannot draw route.'
      return
    }
    const [oLat, oLng] = loc.split(',').map(Number)

    try {
      const res = await $fetch<any>(`https://router.project-osrm.org/route/v1/driving/${lng},${lat};${oLng},${oLat}?overview=full&geometries=geojson`)
      if (!res.routes || res.routes.length === 0) throw new Error('No route found')
      
      const coords = res.routes[0].geometry.coordinates.map(([clng, clat]: number[]) => [clat, clng])
      const L = await import('leaflet')
      if (routeLayer) routeLayer.remove()
      routeLayer = L.polyline(coords, { color: '#f472b6', weight: 6, opacity: 0.9 }).addTo(map)
      map.fitBounds(routeLayer.getBounds(), { padding: [60, 60] })
      mapError.value = ''
    } catch (err: any) {
      console.error('OSRM Route Error:', err)
      // Auto fallback to Google Maps if demo server fails
      openGoogleMaps()
      mapError.value = 'Navigation server busy. Opening Google Maps instead...'
    }
  }

  // 1. Try real-time browser coordinates first
  if (myLat && myLng) {
    await fetchAndDrawRoute(myLat, myLng)
    return
  }

  // 2. Try Fallback: Use the last known position stored in the database (crucial for blocked GPS)
  if (delivery.value?.courier_lat && delivery.value?.courier_lng) {
    console.log('Using database fallback for route starting point')
    await fetchAndDrawRoute(delivery.value.courier_lat, delivery.value.courier_lng)
    mapError.value = 'Using last known position (Auto-refreshing...)'
    return
  }

  // 3. Last resort: Request fresh browser permission
  if (!navigator.geolocation) {
    mapError.value = 'GPS not supported on this device'
    return
  }
  
  const btn = document.activeElement as HTMLButtonElement
  const originalText = btn ? btn.innerHTML : ''
  if (btn) btn.innerHTML = '<span class="animate-pulse">Locating...</span>'

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      myLat = pos.coords.latitude
      myLng = pos.coords.longitude
      updateCourierMarker(myLat, myLng)
      fetchAndDrawRoute(myLat, myLng).finally(() => {
        if (btn) btn.innerHTML = originalText
      })
    },
    (err) => {
      if (btn) btn.innerHTML = originalText
      mapError.value = 'Location access denied. Please allow GPS to see route.'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

function isValidDestination(loc: string) {
  if (!loc) return false
  return /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(loc.trim())
}

function openGoogleMaps() {
  const loc = delivery.value?.order?.location
  if (!isValidDestination(loc)) return
  // Google Maps URL scheme for directions
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.trim()}`, '_blank')
}

async function completeDelivery() {
  if (!confirm('Mark this delivery as completed?')) return
  actionLoading.value = true
  try {
    delivery.value = await api.put(`/deliveries/${id}/complete`, {
      lat: myLat,
      lng: myLng
    })
  } catch (e: any) {
    mapError.value = e.message || e.data?.message || 'Failed to complete delivery'
    if (e.data?.code === 'TOO_FAR') {
      alert(`Distance check failed: ${e.data.message}`)
    }
  } finally {
    actionLoading.value = false
  }
}

async function markShopClosed() {
  if (!confirm('Mark as Shop Closed? This will notify administrators that the delivery attempt failed because the outlet is closed.')) return
  actionLoading.value = true
  try {
    delivery.value = await api.put(`/deliveries/${id}/shop-closed`, {})
  } finally {
    actionLoading.value = false
  }
}

async function submitCustomerCancel() {
  const fullReason = customCancelNote.value.trim()
    ? `${cancelReason.value} - ${customCancelNote.value.trim()}`
    : cancelReason.value

  actionLoading.value = true
  try {
    delivery.value = await api.put(`/deliveries/${id}/customer-cancel`, {
      reason: fullReason
    })
    showCancelModal.value = false
  } catch (e: any) {
    mapError.value = e.message || e.data?.message || 'Failed to cancel delivery'
  } finally {
    actionLoading.value = false
  }
}

async function submitIssue() {
  const itemsWithChanges = Object.entries(itemQuantities.value).map(([id, qty]) => ({
    id: parseInt(id),
    delivered_qty: qty
  }))

  const hasChanges = itemsWithChanges.some(item => {
    const original = delivery.value.order.items.find((i: any) => i.id === item.id)
    return original && item.delivered_qty !== original.qty
  })

  if (!issueNote.value.trim() && !hasChanges) {
    alert('Please either adjust quantities or provide a note about the issue.')
    return
  }
  
  if (!confirm('Submit delivery with reported issue/shortage?')) return
  actionLoading.value = true
  try {
    delivery.value = await api.put(`/deliveries/${id}/complete`, {
      status: 'delivered_with_issue',
      note: `[${issueType.value.toUpperCase()}] ${issueNote.value}`,
      items: itemsWithChanges,
      lat: myLat,
      lng: myLng
    })
    showIssueForm.value = false
    issueNote.value = ''
  } catch (e: any) {
    mapError.value = e.message || e.data?.message || 'Failed to submit issue'
  } finally {
    actionLoading.value = false
  }
}

function adjustQty(itemId: number, delta: number, max: number = 9999) {
  const current = itemQuantities.value[itemId] || 0
  const next = current + delta
  if (next >= 0 && next <= max) {
    itemQuantities.value[itemId] = next
  }
}
</script>

<style>
/* Override Leaflet z-index so header/footer appear above map */
.leaflet-control-container { z-index: 5 !important; }
</style>
