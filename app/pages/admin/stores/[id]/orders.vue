<template>
  <div class="space-y-6 animate-fade-in pb-16">
    <!-- Top Header & Breadcrumbs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <NuxtLink to="/admin/stores" class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors mb-3 group">
          <Icon name="heroicons:arrow-left" class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Store Directory</span>
        </NuxtLink>
        <div class="flex items-center gap-3 flex-wrap">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
            <Icon name="heroicons:building-storefront" class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
              {{ store?.shop_name || 'Loading Store...' }}
              <span v-if="store?.is_new_store" class="text-[9px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-widest">New Store</span>
            </h1>
            <p class="text-slate-500 text-xs flex items-center gap-3 flex-wrap mt-1">
              <span v-if="store?.customer_id" class="font-bold text-slate-700">ID: {{ store.customer_id }}</span>
              <span v-if="store?.contact" class="font-bold text-slate-700">Tel: {{ store.contact }}</span>
              <span v-if="store?.customer_address || store?.province" class="text-slate-600 font-medium">📍 {{ store?.customer_address || (store?.province + ' ' + (store?.district || '')) }}</span>
              <a v-if="store?.location && isValidCoords(store.location)" :href="`https://www.google.com/maps?q=${store.location}`" target="_blank" class="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1 transition-colors">
                <Icon name="heroicons:map-pin" class="w-3 h-3" /> GPS Map
              </a>
            </p>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <NuxtLink
        v-if="store"
        :to="`/order/new?store_id=${store.id}`"
        class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0 active:scale-95 self-start sm:self-center"
      >
        <Icon name="heroicons:plus-circle" class="w-5 h-5" />
        + Create New Order
      </NuxtLink>
    </div>

    <!-- Summary Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
          <Icon name="heroicons:clipboard-document-list" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Total Orders</p>
          <p class="text-2xl font-black text-slate-900 mt-0.5">{{ orders.length }}</p>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
          <Icon name="heroicons:currency-dollar" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Total Revenue</p>
          <p class="text-2xl font-black text-slate-900 mt-0.5">${{ totalRevenue.toFixed(2) }}</p>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
          <Icon name="heroicons:calendar" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-slate-400 font-black text-[10px] uppercase tracking-widest">Last Order Date</p>
          <p class="text-base font-black text-slate-900 mt-0.5">{{ lastOrderDate }}</p>
        </div>
      </div>
    </div>

    <!-- Orders Section -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
      <div class="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">Store Invoices & Order History</h2>
          <p class="text-slate-500 text-xs mt-0.5">Showing all sales orders and delivery invoices recorded for {{ store?.shop_name }}</p>
        </div>
        
        <div class="relative w-full sm:w-64">
          <input 
            v-model="orderSearch" 
            type="text" 
            placeholder="Filter order #, SO, status..." 
            class="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
          >
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex-1 flex flex-col items-center justify-center py-16">
        <div class="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Store Orders...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredOrders.length === 0" class="flex-1 flex flex-col items-center justify-center py-16 text-center">
        <Icon name="heroicons:document-text" class="w-12 h-12 text-slate-300 mb-2" />
        <h3 class="text-slate-900 font-black text-base">No orders found</h3>
        <p class="text-slate-500 text-xs mt-1">There are no orders recorded for this store matching your search.</p>
      </div>

      <!-- Orders List -->
      <div v-else class="p-4 space-y-4">
        <div v-for="order in filteredOrders" :key="order.id" class="bg-white border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 sm:p-5 transition-all shadow-xs space-y-3">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 flex-wrap mb-1.5">
                <span class="text-slate-900 font-black text-base">Order #{{ order.id }}</span>
                <span v-if="order.delivery_number || order.delivery?.delivery_custom_id" class="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                  DEL: {{ order.delivery?.delivery_custom_id || order.delivery_number }}
                </span>
                <span v-if="order.so_number" class="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                  SO: {{ order.so_number }}
                </span>
                <span v-if="order.customer_id" class="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 text-[10px] font-black uppercase tracking-widest">
                  CUST: {{ order.customer_id }}
                </span>
              </div>
              <p class="text-slate-500 text-xs">
                Date: <strong class="text-slate-700">{{ new Date(order.created_at).toLocaleDateString() }}</strong>
                <span v-if="order.delivery_date" class="ml-3">Delivery Date: <strong class="text-slate-700">{{ new Date(order.delivery_date).toLocaleDateString() }}</strong></span>
              </p>
            </div>

            <div class="flex items-center gap-3">
              <span :class="`badge-${order.status} text-[10px] px-3 py-1`">{{ order.status }}</span>
              <span class="text-slate-900 font-black text-lg">${{ Number(order.total_amount || 0).toFixed(2) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div class="text-xs text-slate-500 font-bold">
              <span v-if="order.items?.length">{{ order.items.length }} Items</span>
              <span v-if="order.user?.name" class="ml-2">• Rep: {{ order.user.name }}</span>
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="printOrderInvoice(order)" 
                class="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <Icon name="heroicons:printer" class="w-3.5 h-3.5" />
                View / Print Invoice
              </button>

              <NuxtLink 
                :to="`/admin/orders/${order.id}`" 
                class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5" />
                Order Details
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'admin' })

const api = useApi()
const route = useRoute()

const storeId = computed(() => route.params.id)
const store = ref<any>(null)
const orders = ref<any[]>([])
const loading = ref(true)
const orderSearch = ref('')

onMounted(async () => {
  if (!storeId.value) return
  loading.value = true
  try {
    const res = await api.get(`/stores/${storeId.value}/orders`) as any
    store.value = res.store || null
    orders.value = res.orders || []
  } catch (e) {
    console.error('Failed to load store orders page', e)
  } finally {
    loading.value = false
  }
})

const filteredOrders = computed(() => {
  if (!orderSearch.value) return orders.value
  const q = orderSearch.value.toLowerCase()
  return orders.value.filter(o => {
    return (
      String(o.id).includes(q) ||
      (o.so_number && String(o.so_number).toLowerCase().includes(q)) ||
      (o.delivery_number && String(o.delivery_number).toLowerCase().includes(q)) ||
      (o.status && String(o.status).toLowerCase().includes(q))
    )
  })
})

const totalRevenue = computed(() => {
  return orders.value.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
})

const lastOrderDate = computed(() => {
  if (orders.value.length === 0) return 'No Orders'
  const first = orders.value[0]
  return new Date(first.created_at).toLocaleDateString()
})

function printOrderInvoice(order: any) {
  if (!order?.invoice_url) return
  window.open(order.invoice_url, '_blank')
}

function isValidCoords(location: string) {
  if (!location) return false
  const parts = location.split(',')
  if (parts.length !== 2) return false
  const p0 = parts[0]?.trim()
  const p1 = parts[1]?.trim()
  if (!p0 || !p1) return false
  const lat = parseFloat(p0)
  const lng = parseFloat(p1)
  return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0
}
</script>
