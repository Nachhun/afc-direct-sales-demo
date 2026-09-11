<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-550/10">
          <Icon name="heroicons:clock" class="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h1 class="page-title text-3xl mb-0.5 text-slate-900 font-black">My History</h1>
          <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Order Archive & Tracking</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- Date Filters -->
        <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm focus-within:border-amber-500/30 transition-colors">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-slate-400" />
          <input type="date" v-model="startDate"
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" />
          <span class="text-slate-300 font-bold px-1">-</span>
          <input type="date" v-model="endDate"
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <NuxtLink v-if="authStore.isAdmin" to="/admin"
          class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 text-xs font-black uppercase tracking-widest transition-all duration-300">
          <Icon name="heroicons:squares-2x2" class="w-4 h-4" />
          Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Order Status Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <!-- Total -->
      <button @click="statusFilter = ''"
        class="bg-white p-5 rounded-3xl text-left border border-slate-200/60 border-b-4 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-sm"
        :class="statusFilter === '' ? 'border-b-amber-500' : 'border-b-slate-200'">
        <p class="text-[9px] uppercase font-black tracking-widest mb-2 text-amber-600">My Total</p>
        <p class="text-3xl font-black leading-none text-slate-900">{{ summary.total || 0 }}</p>
      </button>

      <!-- Pending -->
      <button @click="statusFilter = 'pending'"
        class="bg-white p-5 rounded-3xl text-left border border-slate-200/60 border-b-4 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-sm"
        :class="statusFilter === 'pending' ? 'border-b-yellow-500' : 'border-b-slate-200'">
        <p class="text-[9px] uppercase font-black tracking-widest mb-2 text-yellow-600">Pending</p>
        <p class="text-3xl font-black leading-none text-slate-900">{{ summary.pending || 0 }}</p>
      </button>

      <!-- Completed -->
      <button @click="statusFilter = 'completed'"
        class="bg-white p-5 rounded-3xl text-left border border-slate-200/60 border-b-4 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-sm"
        :class="statusFilter === 'completed' ? 'border-b-emerald-500' : 'border-b-slate-200'">
        <p class="text-[9px] uppercase font-black tracking-widest mb-2 text-emerald-600">Completed</p>
        <p class="text-3xl font-black leading-none text-slate-900">{{ summary.completed || 0 }}</p>
      </button>

      <!-- Cancelled -->
      <button @click="statusFilter = 'cancelled'"
        class="bg-white p-5 rounded-3xl text-left border border-slate-200/60 border-b-4 transition-all duration-300 hover:-translate-y-0.5 active:scale-95 shadow-sm"
        :class="statusFilter === 'cancelled' ? 'border-b-red-500' : 'border-b-slate-200'">
        <p class="text-[9px] uppercase font-black tracking-widest mb-2 text-red-600">Cancelled</p>
        <p class="text-3xl font-black leading-none text-slate-900">{{ summary.cancelled || 0 }}</p>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-3">
      <div class="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Loading orders...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="glass-card p-16 text-center">
      <div class="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
        <Icon name="heroicons:clipboard-document-list" class="w-8 h-8" />
      </div>
      <p class="text-slate-600 font-bold mb-1">No orders found</p>
      <p class="text-slate-500 text-sm mb-6">Try adjusting your date filters or create a new order</p>
      <NuxtLink to="/order/new" class="btn-primary inline-flex items-center gap-2">
        <Icon name="heroicons:plus" class="w-4 h-4" />
        New Order
      </NuxtLink>
    </div>

    <!-- Order List -->
    <div v-else class="space-y-4">
      <TransitionGroup name="list">
        <NuxtLink
          v-for="order in filtered"
          :key="order.id"
          :to="`/order/${order.id}`"
          class="glass-panel p-6 block hover:bg-slate-50 border border-slate-200/60 rounded-3xl transition-all duration-300 group active:scale-95 shadow-sm"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Icon name="heroicons:shopping-bag" class="w-6 h-6 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2 mb-1">
                  <h3 class="font-black text-slate-900 text-base leading-none">{{ order.shop_name }}</h3>
                  <span :class="statusClass(order.status)" class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border">
                    {{ order.status }}
                  </span>
                  <span v-if="order.is_direct_sale" class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Icon name="heroicons:bolt" class="w-3 h-3 text-emerald-600" /> Direct Sale
                  </span>
                  <span v-if="order.delivery?.status && !order.is_direct_sale" :class="{
                    'bg-red-50 text-red-600 border-red-100': order.delivery.status === 'shop_closed',
                    'bg-orange-50 text-orange-600 border-orange-100': order.delivery.status === 'delivered_with_issue',
                    'bg-amber-50 text-amber-600 border-amber-100': order.delivery.status === 'pending',
                    'bg-blue-50 text-blue-600 border-blue-100': order.delivery.status === 'in_transit',
                    'bg-emerald-50 text-emerald-600 border-emerald-100': order.delivery.status === 'delivered'
                  }" class="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border">
                    {{ order.delivery.status.replace(/_/g, ' ') }}
                  </span>
                </div>
                <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">{{ order.customer_address || 'No Address Provided' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-slate-900 font-black text-lg leading-none mb-1">${{ Number(order.total_amount).toLocaleString() }}</p>
              <p class="text-slate-500 text-[9px] font-black uppercase tracking-widest">{{ order.items?.length || 0 }} items</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <div class="flex flex-wrap gap-1.5 max-w-[70%]">
              <span v-for="item in order.items.slice(0, 3)" :key="item.id"
                class="text-[9px] bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100 font-bold">
                {{ item.product?.name }} ×{{ item.qty }}
              </span>
              <span v-if="order.items.length > 3" class="text-[9px] text-slate-500 font-bold px-1">+{{ order.items.length - 3 }} more</span>
            </div>
            <div class="flex items-center gap-2 text-slate-500">
              <Icon name="heroicons:calendar" class="w-3.5 h-3.5" />
              <span class="text-[10px] font-black uppercase tracking-widest">{{ formatDate(order.created_at) }}</span>
            </div>
          </div>
        </NuxtLink>
      </TransitionGroup>

      <!-- Filtrered Empty State -->
      <div v-if="filtered.length === 0" class="glass-panel p-20 text-center rounded-3xl border-dashed border-slate-200 shadow-inner">
        <div class="w-16 h-16 glass-panel rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-6">
          <Icon name="heroicons:clipboard-document-list" class="w-8 h-8 opacity-40" />
        </div>
        <p class="text-slate-600 font-black text-lg mb-2">No matches found</p>
        <p class="text-slate-500 text-xs font-bold uppercase tracking-widest opacity-60">Try selecting a different status filter</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const authStore = useAuthStore()
const api = useApi()
const route = useRoute()
const router = useRouter()

const orders = ref<any[]>([])
const summary = ref<any>({ pending: 0, completed: 0, cancelled: 0, total: 0 })
const loading = ref(true)

// Initialize filters from query or defaults
const statusFilter = ref((route.query.status as string) || '')
const startDate = ref((route.query.start as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const endDate = ref((route.query.end as string) || new Date().toISOString().split('T')[0])

// Watch only AFTER initial mount — don't fire on first render
watch([statusFilter, startDate, endDate], ([status, start, end]) => {
  router.replace({
    query: {
      ...route.query,
      status: status || undefined,
      start: start || undefined,
      end: end || undefined
    }
  })
  fetchOrders()
}, { immediate: false })

async function fetchOrders() {
  loading.value = true
  try {
    const res = await api.get('/orders', {
      params: {
        start_date: startDate.value,
        end_date: endDate.value
      }
    }) as any

    // Handle both array response (old) and object response (new)
    if (Array.isArray(res)) {
      orders.value = res
      summary.value = {
        total: res.length,
        pending: res.filter((o: any) => o.status === 'pending').length,
        completed: res.filter((o: any) => o.status === 'completed').length,
        cancelled: res.filter((o: any) => o.status === 'cancelled').length,
      }
    } else {
      orders.value = res.orders || []
      summary.value = res.summary || { total: 0, pending: 0, completed: 0, cancelled: 0 }
    }
  } catch (e) {
    console.error('Failed to load orders', e)
    orders.value = []
    summary.value = { total: 0, pending: 0, completed: 0, cancelled: 0 }
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  return (orders.value || []).filter(o => {
    return !statusFilter.value || o.status === statusFilter.value;
  });
})

onMounted(fetchOrders)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'cancelled': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-slate-500 bg-slate-50 border-slate-200'
  }
}
</script>
