<template>
  <div class="space-y-6">
    <!-- Success Toast -->
    <Transition name="fade">
      <div v-if="toast.show" 
        class="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/50 backdrop-blur-xl">
        <div class="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Icon name="heroicons:check" class="w-4 h-4 text-white" />
        </div>
        <span class="text-xs font-black uppercase tracking-widest">{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Header Section -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
        <p class="text-slate-500 text-sm mt-1">Review, track, and manage all sales orders.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink to="/admin/orders/map" class="btn-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <Icon name="heroicons:map" class="w-4 h-4" /> Live Map
        </NuxtLink>
        <NuxtLink to="/admin/orders/analysis" class="btn-secondary flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
          <Icon name="heroicons:presentation-chart-line" class="w-4 h-4" /> Analytics
        </NuxtLink>
        <!-- Bulk Print buttons -->
        <button v-if="selectedIds.size > 0" @click="printSelected"
          class="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md">
          <Icon name="heroicons:printer" class="w-4 h-4" />
          Print Selected ({{ selectedIds.size }})
        </button>
        <button @click="printAll"
          class="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md">
          <Icon name="heroicons:printer" class="w-4 h-4" />
          Print All ({{ filtered.length }})
        </button>
      </div>
    </div>

    <!-- KPI Summary Section -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <div v-for="stat in [
        { label: 'Total Volume', value: summary.total, color: 'text-slate-900', bg: 'bg-white', active: statusFilter === '', key: '' },
        { label: 'Pending', value: summary.pending, color: 'text-amber-500', bg: 'bg-white', active: statusFilter === 'pending', key: 'pending' },
        { label: 'Completed', value: summary.completed, color: 'text-emerald-600', bg: 'bg-white', active: statusFilter === 'completed', key: 'completed' },
        { label: 'Cancelled', value: summary.cancelled, color: 'text-red-500', bg: 'bg-white', active: statusFilter === 'cancelled', key: 'cancelled' },
        { label: 'Missing GPS', value: missingGpsCount, color: 'text-purple-600', bg: 'bg-white', active: statusFilter === 'no_gps', key: 'no_gps' }
      ]" :key="stat.label" 
      @click="statusFilter = stat.key"
      :class="[stat.bg, stat.active ? 'ring-2 ring-blue-500/20 border-blue-500 shadow-md scale-[1.02]' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:scale-[1.01]']"
      class="border rounded-3xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group">
        <div v-if="stat.active" class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ stat.label }}</p>
        <p :class="stat.color" class="text-3xl font-black tracking-tight">{{ stat.value || 0 }}</p>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm flex flex-wrap items-center gap-4">
      <div class="relative w-full lg:flex-1">
        <Icon name="heroicons:magnifying-glass" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input v-model="search" type="text" placeholder="Search shop, SO#, customer ID, DEL#..." 
          class="w-full bg-slate-50 border-none rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 transition-all" />
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
        <div class="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-3 w-full sm:w-auto">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-slate-400" />
          <input type="date" v-model="startDate" class="bg-transparent text-[11px] font-black uppercase text-slate-600 focus:outline-none" />
          <span class="text-slate-300 font-bold px-1">→</span>
          <input type="date" v-model="endDate" class="bg-transparent text-[11px] font-black uppercase text-slate-600 focus:outline-none" />
        </div>

        <select v-model="statusFilter" class="w-full sm:w-auto bg-slate-50 border-none rounded-2xl px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500/10 appearance-none cursor-pointer min-w-[140px]">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_gps">📍 Missing GPS</option>
        </select>
      </div>
    </div>

    <!-- MOBILE CARD VIEW -->
    <div class="lg:hidden space-y-4">
      <div v-for="item in filtered" :key="item.id" 
        @click="router.push(`/admin/orders/${item.id}`)"
        class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden active:scale-[0.98] transition-all">
        
        <div :class="statusBarColor(item)" class="absolute left-0 top-0 bottom-0 w-1.5"></div>

        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-black text-slate-900 text-base leading-tight">{{ item.shop_name }}</h3>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ORD #{{ item.order_custom_id || item.id }}</p>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <span :class="statusClass(item.status)" class="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider">
              {{ item.status }}
            </span>
            <span v-if="item.is_direct_sale" class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <Icon name="heroicons:bolt" class="w-3 h-3 text-emerald-500" /> Direct Sale
            </span>
            <span v-if="isMissingGps(item)" class="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <Icon name="heroicons:map-pin" class="w-3 h-3 text-purple-500" /> No GPS
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">SO Number</p>
            <p class="text-xs font-bold text-slate-700">{{ item.so_number || '—' }}</p>
          </div>
          <div>
            <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Customer ID</p>
            <p class="text-xs font-bold text-slate-700">{{ item.customer_id || '—' }}</p>
          </div>
        </div>

        <div class="bg-slate-50 rounded-2xl p-3 mb-4 space-y-2">
           <div class="flex items-center gap-2">
              <Icon name="heroicons:user" class="w-3.5 h-3.5 text-slate-400" />
              <p class="text-[10px] text-slate-600 font-bold">Saleman: {{ item.user?.name || 'Unknown' }}</p>
           </div>
           <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5">
                <Icon name="heroicons:clock" class="w-3.5 h-3.5 text-slate-400" />
                <p class="text-[10px] text-slate-600">Submitted: {{ formatDateShort(item.created_at) }}</p>
              </div>
              <div v-if="item.delivery?.delivery_custom_id" class="flex items-center gap-1.5">
                <Icon name="heroicons:truck" class="w-3.5 h-3.5 text-emerald-400" />
                <p class="text-[10px] text-emerald-600 font-black uppercase">DEL #{{ item.delivery.delivery_custom_id }}</p>
              </div>
           </div>
        </div>

        <div class="flex gap-2">
          <!-- Select checkbox on mobile card -->
          <button @click.stop="toggleSelect(item.id)"
            class="shrink-0 w-10 flex items-center justify-center rounded-2xl border transition-all"
            :class="selectedIds.has(item.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'">
            <Icon :name="selectedIds.has(item.id) ? 'heroicons:check' : 'heroicons:square-2-stack'" class="w-4 h-4" />
          </button>
          <button v-if="item.status === 'cancelled'" @click.stop="restoreOrder(item)"
            class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1">
            <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" /> Restore
          </button>
          <NuxtLink :to="`/admin/orders/${item.id}`" @click.stop
            class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all">
            <Icon name="heroicons:eye" class="w-4 h-4 inline-block mr-1" /> Details
          </NuxtLink>
          <button @click.stop="printInvoice(item)" 
            class="flex-1 bg-amber-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-100">
            <Icon name="heroicons:printer" class="w-4 h-4 inline-block mr-1" /> Print
          </button>
        </div>
      </div>
      
      <div v-if="filtered.length === 0" class="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No matching orders</div>
    </div>

    <!-- DESKTOP TABLE VIEW -->
    <div class="hidden lg:block bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div class="overflow-x-auto overflow-y-auto max-h-[700px] relative scrollbar-thin scrollbar-thumb-slate-200">
        <table class="w-full text-left text-sm border-separate border-spacing-0">
          <thead class="sticky top-0 z-20">
            <tr class="bg-slate-50/95 backdrop-blur-sm shadow-sm">
              <!-- Select-all checkbox -->
              <th class="px-3 py-4 border-b border-slate-100 text-center w-8">
                <input type="checkbox" :checked="allFilteredSelected" @change="toggleSelectAll"
                  class="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
              </th>
              <th class="w-1 p-0 border-b border-slate-100"></th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Order</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customer ID</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Customer</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">SO Number</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Planned</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Submit Day</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Req. Delivery</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Edit</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Assign</th>
              <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Print</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in filtered" :key="item.id" 
              @click="router.push(`/admin/orders/${item.id}`)"
              class="hover:bg-slate-50/50 transition-colors group cursor-pointer"
              :class="{ 'bg-indigo-50/60': selectedIds.has(item.id) }">

              <!-- Row select checkbox -->
              <td class="px-3 py-4 text-center" @click.stop>
                <input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)"
                  class="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
              </td>

              <!-- Status bar -->
              <td :class="statusBarColor(item)" class="w-1 p-0 min-w-[4px]"></td>

              <!-- Order # -->
              <td class="px-4 py-4">
                <div class="flex flex-col gap-1">
                  <span class="font-black text-slate-900">#{{ item.id }}</span>
                  <div class="flex items-center gap-1 flex-wrap">
                    <span :class="statusClass(item.status)" class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border w-fit">
                      {{ item.status }}
                    </span>
                    <span v-if="item.is_direct_sale" class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit flex items-center gap-0.5" title="Direct Sale / Drop-off by Rep">
                      <Icon name="heroicons:bolt" class="w-2.5 h-2.5 text-emerald-600" /> Direct
                    </span>
                    <span v-if="isMissingGps(item)" class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 border border-purple-200 w-fit flex items-center gap-0.5" title="GPS Location is missing or invalid">
                      <Icon name="heroicons:map-pin" class="w-2.5 h-2.5 text-purple-600" /> No GPS
                    </span>
                  </div>
                </div>
              </td>
              
              <!-- Customer ID -->
              <td class="px-4 py-4 text-center">
                <span v-if="item.customer_id" class="text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-lg">{{ item.customer_id }}</span>
                <span v-else class="text-slate-300">—</span>
              </td>

              <!-- Customer -->
              <td class="px-4 py-4">
                <div class="font-black text-slate-900 text-xs leading-tight">{{ item.shop_name }}</div>
                <div class="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1 font-bold">
                  <Icon name="heroicons:user-circle" class="w-3 h-3" />
                  {{ item.user?.name || 'Unknown' }}
                </div>
              </td>

              <!-- SO Number -->
              <td class="px-4 py-4 text-center">
                <span v-if="item.so_number" class="text-[10px] font-black text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-lg">{{ item.so_number }}</span>
                <span v-else class="text-slate-300">—</span>
              </td>

               <!-- Planned -->
              <td class="px-4 py-4 text-center">
                <span v-if="item.delivery?.planned_delivery_date" class="text-[10px] font-black text-indigo-600">
                  {{ new Date(item.delivery.planned_delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                </span>
                <span v-else class="text-slate-300">—</span>
              </td>

              <!-- Submit Day -->
              <td class="px-4 py-4 text-center">
                <div class="text-[10px] font-black text-slate-700">{{ formatDateShort(item.created_at) }}</div>
              </td>

              <!-- Request Delivery -->
              <td class="px-4 py-4 text-center">
                <div class="text-[10px] font-black text-slate-700">{{ item.delivery_date ? formatDateShort(item.delivery_date) : '—' }}</div>
              </td>

              <!-- Edit Action -->
              <td class="px-4 py-4 text-center" @click.stop>
                <NuxtLink :to="`/admin/orders/${item.id}`" class="bg-white hover:bg-slate-50 text-slate-600 p-2 rounded-lg border border-slate-200 transition-all inline-flex items-center justify-center">
                  <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                </NuxtLink>
              </td>

              <!-- Assign Action -->
              <td class="px-4 py-4 text-center" @click.stop>
                <div v-if="item.status === 'cancelled'" class="flex items-center justify-center">
                  <button @click="restoreOrder(item)" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-1 shadow-xs">
                    <Icon name="heroicons:arrow-path" class="w-3 h-3" /> Restore
                  </button>
                </div>
                <div v-else-if="item.is_direct_sale" class="text-[9px] font-black text-emerald-600 uppercase flex flex-col items-center gap-0.5">
                  <Icon name="heroicons:bolt" class="w-3.5 h-3.5 text-emerald-500" />
                  Direct Drop
                </div>
                <div v-else-if="!item.delivery?.courier_id" class="flex items-center justify-center gap-1.5">
                  <select v-model="quickAssign[item.id]" 
                    class="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold focus:outline-none focus:border-blue-400 min-w-[100px] max-w-[120px]">
                    <option value="" disabled>Assign Courier...</option>
                    <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                  <button @click="assignQuickly(item)" :disabled="!quickAssign[item.id]" 
                    class="bg-blue-600 text-white px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-all whitespace-nowrap">
                    Go
                  </button>
                </div>
                <div v-else class="text-[9px] font-black text-emerald-600 uppercase flex flex-col items-center gap-1">
                  <Icon name="heroicons:check-badge" class="w-4 h-4" />
                  Assigned
                </div>
              </td>

              <!-- Print Action -->
              <td class="px-4 py-4 text-center" @click.stop>
                <button @click="printInvoice(item)" class="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg transition-all inline-flex items-center justify-center shadow-sm">
                  <Icon name="heroicons:printer" class="w-4 h-4" />
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filtered.length === 0 && !loading">
              <td colspan="13" class="px-6 py-24 text-center">
                <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                  <Icon name="heroicons:clipboard-document-list" class="w-8 h-8 opacity-50" />
                </div>
                <p class="text-slate-500 font-black text-lg">No matching orders</p>
                <p class="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Adjust your status filter or search query</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
definePageMeta({ layout: 'admin' })
const authStore = useAuthStore()
const api = useApi()
const route = useRoute()
const router = useRouter()

const orders = ref<any[]>([])
const couriers = ref<any[]>([])
const summary = ref<any>({ pending: 0, completed: 0, cancelled: 0, total: 0 })
const loading = ref(true)
const toast = reactive({ show: false, message: '' })
const search = ref((route.query.search as string) || '')
const quickAssign = reactive<Record<number, string>>({})

// Initialize filters from query or defaults
const statusFilter = ref((route.query.status as string) || '')
const startDate = ref((route.query.start as string) || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
const endDate = ref((route.query.end as string) || new Date().toISOString().split('T')[0])

// Watch for date changes to fetch new range from API
watch([startDate, endDate], () => {
  fetchOrders()
})

// Sync URL query params silently without re-fetching API on search or tab clicks
watch([statusFilter, startDate, endDate, search], ([status, start, end, q]) => {
  router.replace({
    query: {
      ...route.query,
      status: status || undefined,
      start: start || undefined,
      end: end || undefined,
      search: q || undefined
    }
  })
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
    summary.value = res.summary || { pending: 0, completed: 0, cancelled: 0, total: 0 }
  } catch (err: any) {
    console.error('Failed to fetch orders:', err?.message || err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
  fetchCouriers()
})

async function fetchCouriers() {
  try {
    const users = await api.get('/admin/users?active_only=1') as any[]
    couriers.value = users.filter((u: any) => u.role === 'delivery' && u.is_active !== false && u.is_active !== 0)
  } catch (e) {
    console.error('Failed to fetch couriers', e)
  }
}

async function assignQuickly(item: any) {
  const courierId = quickAssign[item.id]
  if (!courierId) return
  
  try {
    loading.value = true
    if (item.delivery?.id) {
      // Update existing delivery
      await api.put(`/admin/deliveries/${item.delivery.id}`, { 
        courier_id: courierId 
      })
    } else {
      // Create new delivery
      await api.post('/admin/deliveries', { 
        order_id: item.id, 
        courier_id: courierId 
      })
    }
    
    showToast('Order Assigned Successfully!')
    quickAssign[item.id] = ''
    await fetchOrders()
  } catch (e: any) {
    alert('Assignment failed: ' + (e.response?.data?.message || e.message))
  } finally {
    loading.value = false
  }
}

function isMissingGps(item: any) {
  if (!item?.location) return true
  return !/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/.test(item.location.trim())
}

const missingGpsCount = computed(() => {
  return (orders.value || []).filter(o => isMissingGps(o)).length
})

const filtered = computed(() => {
  const rawQ = search.value?.toLowerCase().trim() || ''
  const cleanQ = rawQ.replace(/^(del:|afcdo-|afc-)/i, '').replace(/\//g, '')

  return (orders.value || []).filter(o => {
    const delCustom = (o.delivery?.delivery_custom_id || '').toLowerCase()
    const delNum = (o.delivery_number || '').toLowerCase()
    const orderCustom = (o.order_custom_id || '').toLowerCase()
    const cleanDelCustom = delCustom.replace(/^(afcdo-|afc-)/i, '').replace(/\//g, '')
    const cleanDelNum = delNum.replace(/^(afcdo-|afc-)/i, '').replace(/\//g, '')

    const matchesSearch = !rawQ || 
                         o.shop_name?.toLowerCase().includes(rawQ) ||
                         o.customer_address?.toLowerCase().includes(rawQ) ||
                         orderCustom.includes(rawQ) ||
                         o.so_number?.toLowerCase().includes(rawQ) ||
                         o.customer_id?.toLowerCase().includes(rawQ) ||
                         delCustom.includes(rawQ) ||
                         delNum.includes(rawQ) ||
                         (cleanQ && cleanDelCustom.includes(cleanQ)) ||
                         (cleanQ && cleanDelNum.includes(cleanQ)) ||
                         o.location?.includes(rawQ);
    
    let matchesStatus = true;
    if (statusFilter.value === 'no_gps') {
      matchesStatus = isMissingGps(o);
    } else if (statusFilter.value) {
      matchesStatus = o.status === statusFilter.value;
    }
    
    return matchesSearch && matchesStatus;
  });
})

async function saveCustomIds(item: any) {
  try {
    // Save Order ID
    await api.put(`/admin/orders/${item.id}`, { 
      status: item.status,
      order_custom_id: item.order_custom_id 
    })

    // Save Delivery ID if changed or new
    const delId = item._temp_delivery_id !== undefined ? item._temp_delivery_id : (item.delivery?.delivery_custom_id || '')
    
    if (item.delivery) {
      await api.put(`/admin/deliveries/${item.delivery.id}`, { 
        delivery_custom_id: delId 
      })
      item.delivery.delivery_custom_id = delId
    } else if (delId && delId.trim()) {
      const res = await api.post('/admin/deliveries', { 
        order_id: Number(item.id),
        courier_id: null,
        delivery_custom_id: delId.trim()
      }) as any
      item.delivery = res
    }

    // Clear temp storage
    delete item._temp_delivery_id

    // Visual feedback
    item._saved = true
    setTimeout(() => {
      item._saved = false
      item._isEditing = false
    }, 1500)

    // Fetch full updated order and sync with local item
    const updated = await api.get(`/orders/${item.id}`) as any
    Object.assign(item, updated)

    showToast('All Information Saved!')
  } catch (e: any) {
    console.error('Failed to save IDs', e)
    let msg = e.response?.data?.message || e.message || 'Unknown error'
    
    // Check for validation errors object
    if (e.response?.data?.errors) {
      const errors = e.response.data.errors
      const firstError = Object.values(errors)[0] as string[]
      if (firstError && firstError.length > 0) {
        msg = `${msg}: ${firstError[0]}`
      }
    }
    
    alert(`Failed to save IDs: ${msg}`)
  }
}

function showToast(msg: string) {
  toast.message = msg
  toast.show = true
  setTimeout(() => toast.show = false, 3000)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function restoreOrder(item: any) {
  if (!confirm(`Restore cancelled order #${item.id} (${item.shop_name}) back to Pending? This will re-deduct product stock and reactivate delivery dispatch.`)) return
  try {
    await api.put(`/admin/orders/${item.id}`, { status: 'pending' })
    showToast(`Order #${item.id} restored to Pending!`)
    await fetchOrders()
  } catch (e: any) {
    alert(e.message || e.data?.message || 'Failed to restore order')
  }
}

function printInvoice(item: any) {
  if (!item?.invoice_url) return
  window.open(item.invoice_url, '_blank')
}

// ── Bulk invoice print ───────────────────────────────────────────────────────
const selectedIds = ref<Set<number>>(new Set())

const allFilteredSelected = computed(() =>
  filtered.value.length > 0 && filtered.value.every((o: any) => selectedIds.value.has(o.id))
)

function toggleSelect(id: number) {
  const next = new Set(selectedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedIds.value = next
}

function toggleSelectAll() {
  if (allFilteredSelected.value) {
    // Deselect all visible
    const next = new Set(selectedIds.value)
    filtered.value.forEach((o: any) => next.delete(o.id))
    selectedIds.value = next
  } else {
    // Select all visible
    const next = new Set(selectedIds.value)
    filtered.value.forEach((o: any) => next.add(o.id))
    selectedIds.value = next
  }
}

async function openBulkPrintUrl(payload: any) {
  try {
    const res = await api.post('/orders/bulk-invoice-url', payload) as { url: string }
    if (res.url) {
      window.open(res.url, '_blank')
    }
  } catch (e: any) {
    alert('Failed to generate bulk invoice link: ' + (e.message || e.data?.message || 'Unknown error'))
  }
}

function printSelected() {
  if (selectedIds.value.size === 0) return
  openBulkPrintUrl({ ids: [...selectedIds.value] })
}

function printAll() {
  if (filtered.value.length === 0) return
  openBulkPrintUrl({
    start_date: startDate.value,
    end_date: endDate.value,
    status: statusFilter.value || undefined,
    search: search.value || undefined,
  })
}

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100'
    case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    case 'cancelled': return 'text-red-600 bg-red-50 border-red-100'
    default: return 'text-slate-500 bg-slate-50 border-slate-100'
  }
}

function statusBarColor(item: any) {
  if (item.status === 'completed') return 'bg-emerald-500'
  if (item.status === 'cancelled') return 'bg-red-500'
  if (item.status === 'pending') return 'bg-amber-400'
  return 'bg-slate-300'
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translate(-50%, 20px); }
</style>
