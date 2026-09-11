<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div v-for="stat in statCards" :key="stat.label" class="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-sm relative overflow-hidden group">
        <div class="absolute top-0 right-0 p-3 sm:p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon :name="stat.icon" class="w-12 h-12 sm:w-16 sm:h-16 text-slate-900" />
        </div>
        <p class="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-widest truncate">{{ stat.label }}</p>
        <div class="flex flex-col sm:flex-row sm:items-baseline gap-1 mt-3 sm:mt-4">
          <p class="text-base sm:text-2xl md:text-3xl font-black text-slate-900 truncate" v-if="!loading">{{ stat.value }}</p>
          <div v-else class="h-7 w-20 sm:w-24 bg-slate-100 animate-pulse rounded-lg"></div>
          <span v-if="stat.prefix" class="text-blue-600 font-bold text-[10px] sm:text-sm">{{ stat.prefix }}</span>
        </div>
        <div class="mt-3 sm:mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full transition-all duration-1000" :class="stat.color" :style="{ width: '100%' }"></div>
        </div>
      </div>
    </div>

    <!-- Custom Comparison Section -->
    <section v-if="stats.comparison" class="space-y-6">
      <!-- Custom Period Comparison Controller -->
      <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative">
        <div v-if="loadingComparison" class="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-2xl">
          <div class="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 class="text-slate-900 font-black text-lg flex items-center gap-2 mb-1">
              <Icon name="heroicons:scale" class="w-5 h-5 text-indigo-500" />
              Custom Period Comparison
            </h3>
            <p class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Compare specific date ranges independently</p>
          </div>
          
          <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <!-- Period 1 -->
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p class="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-blue-600"></span> Period 1
              </p>
              <div class="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-slate-100">
                <input type="date" v-model="compP1Start" @change="fetchComparison" class="bg-transparent text-slate-900 text-[10px] focus:outline-none w-full cursor-pointer" />
                <span class="text-slate-400 text-[10px]">to</span>
                <input type="date" v-model="compP1End" @change="fetchComparison" class="bg-transparent text-slate-900 text-[10px] focus:outline-none w-full cursor-pointer" />
              </div>
            </div>

            <!-- Period 2 -->
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span> Period 2
              </p>
              <div class="flex items-center gap-2 bg-white rounded-lg px-2 py-1.5 border border-slate-100">
                <input type="date" v-model="compP2Start" @change="fetchComparison" class="bg-transparent text-slate-900 text-[10px] focus:outline-none w-full cursor-pointer" />
                <span class="text-slate-400 text-[10px]">to</span>
                <input type="date" v-model="compP2End" @change="fetchComparison" class="bg-transparent text-slate-900 text-[10px] focus:outline-none w-full cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="customComparison" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Comparison Card -->
        <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative">
          <h3 class="text-slate-900 font-black text-lg flex items-center gap-2 mb-6">
            <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-blue-600" />
            Revenue Comparison
          </h3>

          <div class="space-y-6">
            <div class="flex items-center justify-end mb-4">
               <div :class="trendClass(customComparison.sales_growth)" class="px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5">
                 <Icon :name="customComparison.sales_growth >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" class="w-4 h-4" />
                 {{ Math.abs(customComparison.sales_growth) }}% 
                 <span class="opacity-70 font-medium ml-1">({{ customComparison.sales_diff >= 0 ? 'Up' : 'Down' }} ${{ Math.abs(customComparison.sales_diff || 0).toLocaleString() }})</span>
               </div>
            </div>

            <div class="relative group">
              <div class="flex justify-between items-end mb-2">
                <span class="text-blue-600 text-[10px] font-black uppercase tracking-widest">Period 1 Result</span>
                <span class="text-slate-900 font-black text-xl">${{ Number(customComparison.new_result || 0).toLocaleString() }}</span>
              </div>
              <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                <div class="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                  :style="`width: ${Math.max(customComparison.new_result, customComparison.old_result) > 0 ? (customComparison.new_result / Math.max(customComparison.new_result, customComparison.old_result)) * 100 : 0}%` "></div>
              </div>
            </div>

            <div class="relative group">
              <div class="flex justify-between items-end mb-2">
                <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Period 2 Result</span>
                <span class="text-slate-400 font-black text-xl">${{ Number(customComparison.old_result || 0).toLocaleString() }}</span>
              </div>
              <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                <div class="h-full bg-slate-400 rounded-full transition-all duration-1000" 
                  :style="`width: ${Math.max(customComparison.new_result, customComparison.old_result) > 0 ? (customComparison.old_result / Math.max(customComparison.new_result, customComparison.old_result)) * 100 : 0}%` "></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Volume Comparison Card -->
        <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm relative">
          <h3 class="text-slate-900 font-black text-lg flex items-center gap-2 mb-6">
            <Icon name="heroicons:square-3-stack-3d" class="w-5 h-5 text-purple-600" />
            Volume Comparison
          </h3>

          <div class="space-y-6">
            <div class="flex items-center justify-end mb-4">
               <div :class="trendClass(customComparison.order_growth)" class="px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5">
                 <Icon :name="customComparison.order_growth >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" class="w-4 h-4" />
                 {{ Math.abs(customComparison.order_growth) }}% 
                 <span class="opacity-70 font-medium ml-1">({{ customComparison.order_diff >= 0 ? 'Up' : 'Down' }} {{ Math.abs(customComparison.order_diff || 0) }} Orders)</span>
               </div>
            </div>

            <div class="relative group">
              <div class="flex justify-between items-end mb-2">
                <span class="text-blue-600 text-[10px] font-black uppercase tracking-widest">Period 1 Result</span>
                <span class="text-slate-900 font-black text-xl">{{ customComparison.new_orders }}</span>
              </div>
              <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                <div class="h-full bg-purple-600 rounded-full transition-all duration-1000" 
                  :style="`width: ${Math.max(customComparison.new_orders, customComparison.old_orders) > 0 ? (customComparison.new_orders / Math.max(customComparison.new_orders, customComparison.old_orders)) * 100 : 0}%` "></div>
              </div>
            </div>

            <div class="relative group">
              <div class="flex justify-between items-end mb-2">
                <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Period 2 Result</span>
                <span class="text-slate-400 font-black text-xl">{{ customComparison.old_orders }}</span>
              </div>
              <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                <div class="h-full bg-slate-400 rounded-full transition-all duration-1000" 
                  :style="`width: ${Math.max(customComparison.new_orders, customComparison.old_orders) > 0 ? (customComparison.old_orders / Math.max(customComparison.new_orders, customComparison.old_orders)) * 100 : 0}%` "></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
      <!-- Top Salesmen -->
      <section class="glass-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Icon name="heroicons:trophy" class="w-4 h-4 text-amber-500" />
            Top Performance
          </h2>
        </div>
        
        <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-3">
          <div class="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Analyzing Data...</p>
        </div>
        
        <div v-else-if="stats.top_salesmen?.length === 0" class="text-center py-12">
          <p class="text-slate-500 text-sm font-medium">No sales activity recorded yet.</p>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="(s, i) in stats.top_salesmen" :key="s.id"
            class="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl px-5 py-4 transition-all duration-300 group">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-inner"
              :class="i === 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white text-slate-400 border border-slate-200'">
              {{ Number(i) + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-slate-900 text-sm font-bold truncate">{{ s.name }}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">{{ s.orders_count }} orders</span>
                <span class="w-1 h-1 rounded-full bg-slate-200"></span>
                <span class="text-blue-600 text-[10px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-slate-900 font-black text-sm">${{ Number(s.total_sales || 0).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Recent Activity -->
      <section class="glass-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Icon name="heroicons:bolt" class="w-4 h-4 text-blue-600" />
            Recent Activity
          </h2>
          <NuxtLink to="/admin/orders" class="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest transition-colors">See Feed →</NuxtLink>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-3">
          <div class="w-8 h-8 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="recentOrders.length === 0" class="text-center py-12">
          <p class="text-slate-500 text-sm font-medium">No activity for this period.</p>
        </div>

        <div v-else class="space-y-3">
          <NuxtLink v-for="order in recentOrders" :key="order.id" :to="`/admin/orders/${order.id}`"
            class="flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl px-5 py-4 transition-all duration-300 group">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                <Icon name="heroicons:shopping-bag" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-slate-900 text-sm font-bold truncate">{{ order.shop_name }}</p>
                <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">{{ order.user?.name }} · {{ formatDate(order.created_at) }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-slate-900 font-black text-sm">${{ Number(order.total_amount).toLocaleString() }}</p>
              <span :class="statusClass(order.status)" class="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border">
                {{ order.status }}
              </span>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const props = defineProps<{
  startDate: string
  endDate: string
  allOrders: any[]
}>()

const api = useApi()
const authStore = useAuthStore()

// Tab 1: Executive Overview State
const stats = ref<any>({ total_orders: 0, total_sales: 0, top_salesmen: [] })
const salesmen = ref<any[]>([])
const products = ref<any[]>([])
const loading = ref(true)

// Custom Comparison State
const compP1Start = ref(props.startDate)
const compP1End = ref(props.endDate)

const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
const defaultDiff = (lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24) + 1
const p2Start = new Date(firstDay.getTime() - defaultDiff * 24 * 60 * 60 * 1000)
const p2End = new Date(lastDay.getTime() - defaultDiff * 24 * 60 * 60 * 1000)

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const compP2Start = ref(toLocalDateString(p2Start))
const compP2End = ref(toLocalDateString(p2End))
const customComparison = ref<any>(null)
const loadingComparison = ref(false)

const statCards = computed(() => [
  { label: 'Total Volume', value: `$${Number(stats.value.total_sales || 0).toLocaleString()}`, icon: 'heroicons:banknotes', color: 'bg-blue-600', prefix: 'USD' },
  { label: 'Operations', value: stats.value.total_orders, icon: 'heroicons:shopping-cart', color: 'bg-indigo-600', prefix: 'Orders' },
  { label: 'Force', value: salesmen.value.length, icon: 'heroicons:user-group', color: 'bg-emerald-600', prefix: 'Members' },
  { label: 'Inventory', value: products.value.length, icon: 'heroicons:cube', color: 'bg-amber-600', prefix: 'Items' },
])

const recentOrders = computed(() => {
  return (props.allOrders || []).slice(0, 5)
})

async function fetchOverviewData() {
  loading.value = true
  try {
    const params = { start_date: props.startDate, end_date: props.endDate }
    
    // Fetch summary stats
    try {
      stats.value = await api.get('/admin/reports/summary', { params }) as any
    } catch (e: any) {
      console.warn('Summary stats restricted or failed', e.status)
    }

    // Update order counts if empty
    if ((stats.value.total_orders === 0 || !stats.value.total_orders) && props.allOrders.length > 0) {
      stats.value.total_orders = props.allOrders.length
    }

    // Fetch products count
    try {
      const p = await api.get('/products') as any[]
      products.value = p
    } catch (e: any) {
       console.warn('Inventory restricted or failed', e.status)
    }

    // Fetch users for metrics
    if (authStore.isAdmin || authStore.isAsm) {
      try {
        const allUsers = await api.get('/admin/users?active_only=1') as any[]
        salesmen.value = (Array.isArray(allUsers) ? allUsers : []).filter(u => u.is_active !== false && u.is_active !== 0)
      } catch (e: any) {
        console.warn('Users metric restricted or failed', e.status)
      }
    }

    compP1Start.value = props.startDate
    compP1End.value = props.endDate
    
    if (stats.value.total_orders !== undefined) {
      fetchComparison()
    }
  } catch (e) {
    console.error('General dashboard error:', e)
  } finally {
    loading.value = false
  }
}

async function fetchComparison() {
  loadingComparison.value = true
  try {
    const res = await api.get('/admin/reports/summary', {
      params: { 
        start_date: compP1Start.value, 
        end_date: compP1End.value,
        compare_start_date: compP2Start.value,
        compare_end_date: compP2End.value
      }
    })
    customComparison.value = (res as any).comparison
  } catch (e) {
    console.error(e)
  } finally {
    loadingComparison.value = false
  }
}

watch([() => props.startDate, () => props.endDate], () => {
  fetchOverviewData()
})

onMounted(() => {
  fetchOverviewData()
})

function formatDate(d?: string) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-slate-500 bg-slate-50 border-slate-200'
  }
}

function trendClass(growth: number) {
  if (growth === 0) return 'text-slate-500 bg-slate-50 border-slate-200'
  return growth > 0 
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200' 
    : 'text-red-600 bg-red-50 border-red-200'
}
</script>
