<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="page-title text-3xl font-black">Sales Intelligence</h1>
        <p class="text-slate-500 text-sm mt-1">Export detailed reports and analyze team performance.</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <!-- Date Filters -->
        <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 h-11 shadow-sm">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-slate-400" />
          <input type="date" v-model="startDate" @change="loadReport" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" />
          <span class="text-slate-400 text-xs">-</span>
          <input type="date" v-model="endDate" @change="loadReport" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <!-- Export Actions -->
        <div class="flex items-center gap-2 h-11">
          <button @click="exportReport('excel')" 
            class="flex items-center gap-2 px-4 h-full rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
            <Icon name="heroicons:table-cells" class="w-4 h-4" />
            Excel
          </button>
          <button @click="exportReport('pdf')" 
            class="flex items-center gap-2 px-4 h-full rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
            <Icon name="heroicons:document-text" class="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Aggregating Sales Data...</p>
    </div>

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Revenue Card -->
        <div class="bg-white p-6 border-l-4 border-blue-600 border border-slate-200 rounded-3xl relative overflow-hidden group shadow-sm">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:banknotes" class="w-16 h-16 text-slate-900" />
          </div>
          <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Gross Revenue</p>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-black text-slate-900">${{ Number(report.total_sales || 0).toLocaleString() }}</p>
          </div>
          <p class="mt-4 text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
             <Icon name="heroicons:globe-americas" class="w-3.5 h-3.5" />
             Consolidated Earnings
          </p>
        </div>
        
        <!-- Volume Card -->
        <div class="bg-white p-6 border-l-4 border-purple-600 border border-slate-200 rounded-3xl relative overflow-hidden group shadow-sm">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:shopping-cart" class="w-16 h-16 text-slate-900" />
          </div>
          <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Order Volume</p>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-black text-slate-900">{{ report.total_orders }}</p>
          </div>
          <p class="mt-4 text-[10px] text-purple-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Icon name="heroicons:bolt" class="w-3.5 h-3.5" />
            Market Activity
          </p>
        </div>
        
        <!-- Average Card -->
        <div class="bg-white p-6 border-l-4 border-amber-600 border border-slate-200 rounded-3xl relative overflow-hidden group shadow-sm">
          <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:scale" class="w-16 h-16 text-slate-900" />
          </div>
          <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Efficiency Ratio</p>
          <p class="text-3xl font-black text-slate-900">
            ${{ report.total_orders ? (Number(report.total_sales || 0) / report.total_orders).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0 }}
          </p>
          <p class="mt-4 text-[10px] text-amber-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Icon name="heroicons:calculator" class="w-3.5 h-3.5" />
            Avg. Ticket Value
          </p>
        </div>
      </div>

      <!-- Top Salesmen -->
      <section class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Icon name="heroicons:user-group" class="w-4 h-4 text-blue-600" />
            Top Performance Ranking
          </h2>
        </div>
        
        <div v-if="!report.top_salesmen?.length" class="text-center py-16">
          <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
            <Icon name="heroicons:chart-bar" class="w-8 h-8" />
          </div>
          <p class="text-slate-400 text-sm font-medium">No sales data found for this period.</p>
        </div>
        
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div v-for="(s, i) in report.top_salesmen" :key="s.id"
            class="flex items-center gap-4 bg-white border border-slate-100 hover:border-blue-500 rounded-2xl px-5 py-5 transition-all group shadow-sm">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-inner shrink-0"
              :class="i === 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'">
              #{{ Number(i) + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline mb-2">
                <p class="text-slate-900 text-sm font-bold truncate">{{ s.name }}</p>
                <p class="text-slate-900 font-black text-sm">${{ Number(s.total_sales || 0).toLocaleString() }}</p>
              </div>
              <!-- Progress Bar -->
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div class="bg-blue-600 h-full transition-all duration-1000 shadow-sm shadow-blue-500/20"
                  :style="`width: ${maxSales > 0 ? (Number(s.total_sales || 0) / maxSales) * 100 : 0}%`">
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-slate-500 text-[9px] font-black uppercase tracking-widest">{{ s.orders_count }} orders contribution</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Detailed Order Log -->
      <section class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 class="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2.5">
              <span class="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]"></span>
              Detailed Order Log
            </h2>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 ml-4.5">Granular Transaction History</p>
          </div>

          <div class="flex flex-col md:flex-row items-center gap-4">
            <!-- Log Search -->
            <div class="relative w-full md:w-72 group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400" />
              </div>
              <input v-model="logSearch" type="text" placeholder="Search shop/user..." 
                class="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
            </div>

            <!-- Log Date Filter -->
            <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 h-11 shadow-sm">
              <input type="date" v-model="logStartDate" @change="fetchLogOrders" 
                class="bg-transparent text-slate-900 text-[11px] font-bold focus:outline-none border-none p-0 cursor-pointer appearance-none" />
              <span class="text-slate-300 font-black">-</span>
              <input type="date" v-model="logEndDate" @change="fetchLogOrders" 
                class="bg-transparent text-slate-900 text-[11px] font-bold focus:outline-none border-none p-0 cursor-pointer appearance-none" />
            </div>

            <span class="shrink-0 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600 shadow-sm">
              {{ filteredOrders.length }} Records
            </span>
          </div>
        </div>

        <div v-if="loadingLog" class="flex flex-col items-center justify-center py-24 space-y-4">
          <div class="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
          <p class="text-slate-500 text-[9px] font-black uppercase tracking-widest animate-pulse">Filtering Records...</p>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="text-center py-16 border-t border-slate-100">
          <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100">
            <Icon name="heroicons:clipboard-document-list" class="w-8 h-8" />
          </div>
          <p class="text-slate-400 text-sm font-medium">No order data available for this filter.</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="order in filteredOrders" :key="order.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-100 hover:border-blue-500 rounded-2xl px-6 py-5 transition-all duration-300 group shadow-sm">
            <div class="flex items-center gap-5 mb-4 sm:mb-0">
              <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-all">
                <Icon name="heroicons:receipt-percent" class="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-3 mb-1.5">
                  <p class="text-slate-900 text-base font-black truncate group-hover:text-blue-600 transition-colors">{{ order.shop_name }}</p>
                  <span :class="statusClass(order.status)" class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0">
                    {{ order.status }}
                  </span>
                </div>
                <p class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.1em] flex items-center gap-2.5">
                  <span class="text-slate-700 group-hover:text-slate-900 transition-colors truncate max-w-[120px] sm:max-w-none">{{ order.user?.name || 'Unknown User' }}</span>
                  <span class="text-slate-300 text-[6px]">●</span>
                  <span class="opacity-60">{{ formatDate(order.created_at) }}</span>
                  <span class="text-slate-300 text-[6px]">●</span>
                  <span class="text-blue-600">{{ order.items?.length || 0 }} Items</span>
                </p>
              </div>
            </div>
            <div class="text-left sm:text-right pl-17 sm:pl-0 shrink-0">
              <p class="text-slate-900 font-black text-xl leading-none mb-2 tracking-tight">${{ Number(order.total_amount || 0).toLocaleString() }}</p>
              <NuxtLink :to="`/admin/orders/${order.id}`" class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-[0.15em] transition-all group/link">
                Review Transaction 
                <Icon name="heroicons:chevron-right" class="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const api = useApi()
const authStore = useAuthStore()

definePageMeta({ layout: 'admin' })

const now = new Date()
const startDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
const endDate = ref(now.toISOString().split('T')[0])
const report = ref<any>({ 
  total_orders: 0, 
  total_sales: 0, 
  top_salesmen: [],
  comparison: {
    sales_growth: 0,
    order_growth: 0,
    prev_sales: 0,
    prev_orders: 0,
    prev_start: '',
    prev_end: ''
  }
})
const orders = ref<any[]>([])
const loading = ref(true)
const loadingLog = ref(false)
const logSearch = ref('')
const logStartDate = ref(startDate.value)
const logEndDate = ref(endDate.value)

const filteredOrders = computed(() => {
  if (!logSearch.value) return orders.value
  const q = logSearch.value.toLowerCase()
  return orders.value.filter(o => 
    o.shop_name?.toLowerCase().includes(q) || 
    o.user?.name?.toLowerCase().includes(q) ||
    o.id?.toString().includes(q)
  )
})

const maxSales = computed(() => {
  if (!report.value.top_salesmen?.length) return 1
  return Math.max(...report.value.top_salesmen.map((s: any) => Number(s.total_sales || 0)), 1)
})

onMounted(async () => {
  if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAdminReporter) {
    navigateTo('/admin')
    return
  }
  await loadReport()
})

async function loadReport() {
  loading.value = true
  // Sync log dates if they match the previous global dates (initially)
  logStartDate.value = startDate.value
  logEndDate.value = endDate.value
  
  try {
    const params = { start_date: startDate.value, end_date: endDate.value }
    const [res, ordersRes] = await Promise.all([
      api.get('/admin/reports/summary', { params }),
      api.get('/orders', { params })
    ])
    report.value = res
    orders.value = (ordersRes as any).orders || []
  } catch (error) {
    console.error('Failed to load report:', error)
  } finally { 
    loading.value = false 
  }
}

async function fetchLogOrders() {
  loadingLog.value = true
  try {
    const params = { start_date: logStartDate.value, end_date: logEndDate.value }
    const res = await api.get('/orders', { params }) as any
    orders.value = res.orders || []
  } catch (e) {
    console.error(e)
  } finally {
    loadingLog.value = false
  }
}

async function exportReport(type: 'excel' | 'pdf') {
  try {
    const response = await api.get(`/admin/reports/export/${type}`, {
      params: { 
        start_date: startDate.value, 
        end_date: endDate.value 
      },
      responseType: 'blob',
      headers: {
        Accept: type === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'application/pdf'
      }
    })
    
    const blob = (response instanceof Blob) ? response : new Blob([response as any])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `sales_report_${startDate.value}_to_${endDate.value}.${type === 'excel' ? 'xlsx' : 'pdf'}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export report. Please try again.')
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100'
    case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    case 'cancelled': return 'text-red-600 bg-red-50 border-red-100'
    default: return 'text-slate-500 bg-slate-50 border-slate-100'
  }
}
</script>
