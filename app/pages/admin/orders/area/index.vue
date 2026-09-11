<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div class="flex items-center gap-6">
        <NuxtLink to="/admin/orders/analysis" class="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all group shadow-sm">
          <Icon name="heroicons:arrow-left" class="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
        </NuxtLink>
        <div>
          <h1 class="text-3xl font-black text-slate-900 italic tracking-tight mb-0.5">Regional Detail</h1>
          <div class="flex items-center gap-2">
            <Icon name="heroicons:map-pin" class="w-3 h-3 text-blue-600" />
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{{ locationDisplay }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm">
           <Icon name="heroicons:calendar" class="w-4 h-4 text-blue-600" />
           <div class="flex items-center gap-3">
             <input type="date" v-model="startDate" @change="fetchOrders" 
               class="bg-transparent text-slate-900 text-xs font-black uppercase border-none focus:outline-none cursor-pointer p-0" />
             <span class="text-slate-300 text-[10px] font-black tracking-widest px-1">TO</span>
             <input type="date" v-model="endDate" @change="fetchOrders" 
               class="bg-transparent text-slate-900 text-xs font-black uppercase border-none focus:outline-none cursor-pointer p-0" />
           </div>
        </div>
        
        <button @click="exportAreaReport"
          class="h-12 px-6 rounded-2xl bg-emerald-600 text-white flex items-center gap-2 hover:bg-emerald-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-md shadow-emerald-500/10">
          <Icon name="heroicons:document-arrow-down" class="w-4 h-4" />
          Export Excel
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div class="bg-white p-6 rounded-3xl border-l-4 border-blue-600 border border-slate-200 shadow-sm">
        <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Revenue</p>
        <p class="text-3xl font-black text-slate-900">${{ totalRevenue.toLocaleString() }}</p>
      </div>
      <div class="bg-white p-6 rounded-3xl border-l-4 border-emerald-600 border border-slate-200 shadow-sm">
        <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Order Count</p>
        <p class="text-3xl font-black text-slate-900">{{ filteredOrders.length }}</p>
      </div>
      <div class="bg-white p-6 rounded-3xl border-l-4 border-amber-600 border border-slate-200 shadow-sm">
        <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">Average Ticket</p>
        <p class="text-3xl font-black text-slate-900">${{ avgOrderValue.toLocaleString() }}</p>
      </div>
    </div>

    <!-- Transaction Log -->
    <div class="space-y-4">
      <h3 class="text-xs font-black text-slate-900 uppercase tracking-[0.3em] ml-1 mb-6 flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
        Area Transactions
      </h3>
      
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
         <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
         <p class="text-slate-500 text-[9px] font-black uppercase tracking-widest">Compiling history...</p>
      </div>

      <div v-else class="space-y-3">
        <div v-for="order in filteredOrders" :key="order.id">
          <NuxtLink :to="`/admin/orders/${order.id}`"
            class="flex items-center justify-between bg-white hover:border-blue-500 border border-slate-100 rounded-2xl px-6 py-5 transition-all duration-300 group shadow-sm">
            <div class="flex items-center gap-5">
              <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <Icon name="heroicons:receipt-percent" class="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
              </div>
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <p class="text-slate-900 text-base font-black">{{ order.shop_name }}</p>
                  <span :class="statusClass(order.status)" class="px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-slate-100">
                    {{ order.status }}
                  </span>
                </div>
                <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <span class="text-slate-700 font-bold">{{ order.user?.name }}</span>
                  <span class="text-slate-300 text-[6px]">●</span>
                  <span>{{ formatDateTime(order.created_at) }}</span>
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-slate-900 font-black text-xl leading-none mb-1">${{ Number(order.total_amount).toLocaleString() }}</p>
              <p class="text-slate-400 text-[9px] font-black uppercase tracking-widest">
                {{ order.items?.length || 0 }} products
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty State -->
        <div v-if="filteredOrders.length === 0" class="bg-white p-20 text-center rounded-3xl border border-dashed border-slate-200">
          <Icon name="heroicons:document-magnifying-glass" class="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p class="text-slate-900 font-black text-xl mb-1">No Transactions Found</p>
          <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">No activity recorded for this area in selected dates</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const api = useApi()
const route = useRoute()

definePageMeta({ layout: 'admin' })

const location = ref((route.query.loc as string) || '')
const boundsStr = ref((route.query.bounds as string) || '')
const startDate = ref((route.query.start as string) || '')
const endDate = ref((route.query.end as string) || '')
const orders = ref<any[]>([])
const loading = ref(true)

const locationDisplay = computed(() => {
  if (boundsStr.value) return 'Custom Geographic Selection'
  return location.value || 'Unknown Area'
})

const filteredOrders = computed(() => {
  if (boundsStr.value) {
    try {
      const bounds = JSON.parse(boundsStr.value)
      const [[lat1, lng1], [lat2, lng2]] = bounds
      const minLat = Math.min(lat1, lat2)
      const maxLat = Math.max(lat1, lat2)
      const minLng = Math.min(lng1, lng2)
      const maxLng = Math.max(lng1, lng2)

      return (orders.value || []).filter(o => {
        if (!o.location) return false
        const parts = o.location.split(',')
        if (parts.length < 2) return false
        const lat = parseFloat(parts[0].trim())
        const lng = parseFloat(parts[1].trim())
        return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
      })
    } catch (e) {
      console.error('Invalid bounds format', e)
    }
  }

  const target = location.value?.trim().toLowerCase()
  if (!target) return []
  return (orders.value || []).filter(o => o.location?.trim().toLowerCase() === target)
})

const totalRevenue = computed(() => {
  return filteredOrders.value.reduce((sum, o) => sum + Number(o.total_amount || 0), 0)
})

const avgOrderValue = computed(() => {
  if (filteredOrders.value.length === 0) return 0
  return Math.round(totalRevenue.value / filteredOrders.value.length)
})

async function fetchOrders() {
  loading.value = true
  try {
    const res = await api.get('/orders', { 
      params: { 
        start_date: startDate.value, 
        end_date: endDate.value 
      } 
    }) as any
    orders.value = res.orders || []
  } catch (e) {
    console.error('Failed to fetch area data', e)
  } finally {
    loading.value = false
  }
}

async function exportAreaReport() {
  try {
    const response = await api.get('/admin/reports/export/excel', {
      params: { 
        start_date: startDate.value, 
        end_date: endDate.value,
        loc: location.value,
        bounds: boundsStr.value
      },
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })
    
    const blob = (response instanceof Blob) ? response : new Blob([response as any])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const areaName = location.value ? location.value.replace(/[^a-z0-9]/gi, '_') : 'custom_area'
    link.setAttribute('download', `area_report_${areaName}_${startDate.value}_to_${endDate.value}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed', e)
  }
}

function formatDate(d: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  })
}

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100 shadow-sm'
    case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-sm'
    case 'cancelled': return 'text-red-600 bg-red-50 border-red-100 shadow-sm'
    default: return 'text-slate-500 bg-slate-50 border-slate-100'
  }
}

onMounted(fetchOrders)
</script>
