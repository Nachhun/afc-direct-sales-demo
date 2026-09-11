<template>
  <div>
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="page-title text-3xl font-black">Inventory Arrangement</h1>
        <p class="text-slate-500 text-sm mt-1">Aggregate daily ordered items to simplify warehouse packing.</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <!-- Delivery Plan Filter -->
        <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 h-11 shadow-sm hover:border-blue-300 transition-colors">
          <Icon name="heroicons:map" class="w-4 h-4 text-purple-600 shrink-0" />
          <select 
            v-model="selectedPlanId" 
            @change="onPlanChange" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer max-w-[170px] sm:max-w-[210px] truncate"
            id="plan-filter"
          >
            <option value="all">📦 All Delivery Plans</option>
            <option value="unassigned">⚠️ Unassigned (No Plan)</option>
            <optgroup label="Delivery Plans" v-if="deliveryPlans.length > 0">
              <option v-for="plan in deliveryPlans" :key="plan.id" :value="plan.id">
                {{ plan.name }} {{ plan.date ? `(${plan.date})` : '' }} {{ plan.courier?.name ? `- ${plan.courier.name}` : '' }}
              </option>
            </optgroup>
          </select>
        </div>

        <!-- Date Filters -->
        <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 h-11 shadow-sm">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-slate-400" />
          <input type="date" v-model="startDate" @change="fetchData" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" />
          <span class="text-slate-400 text-xs">-</span>
          <input type="date" v-model="endDate" @change="fetchData" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <!-- Date Type Toggle -->
        <div class="flex items-center bg-slate-100 rounded-xl p-1 h-11">
          <button @click="dateType = 'created_at'; fetchData()" 
            :class="dateType === 'created_at' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            class="px-4 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
            Order Date
          </button>
          <button @click="dateType = 'delivery_date'; fetchData()" 
            :class="dateType === 'delivery_date' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            class="px-4 h-full rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
            Delivery Date
          </button>
        </div>

        <!-- Export Actions -->
        <div class="flex items-center gap-2 h-11">
          <button @click="exportData('excel')" 
            class="flex items-center gap-2 px-4 h-full rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
            <Icon name="heroicons:table-cells" class="w-4 h-4" />
            Excel
          </button>
          <button @click="exportData('pdf')" 
            class="flex items-center gap-2 px-4 h-full rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-md">
            <Icon name="heroicons:document-text" class="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Search & Summary -->
    <div class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:w-96 group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400" />
          </div>
          <input v-model="search" type="text" placeholder="Search product or category..." 
            class="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
        </div>

        <div class="flex gap-4">
          <div class="text-right">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Orders</p>
            <p class="text-xl font-black text-slate-900">{{ filteredData.length }}</p>
          </div>
          <div class="w-px bg-slate-200"></div>
          <div class="text-right">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Items</p>
            <p class="text-xl font-black text-blue-600">{{ totalItems }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Loading Inventory...</p>
    </div>

    <div v-else-if="filteredData.length === 0" class="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm">
      <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100">
        <Icon name="heroicons:cube" class="w-8 h-8" />
      </div>
      <p class="text-slate-400 text-sm font-medium">No orders found for this period.</p>
    </div>

    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      <!-- Left Side: Order List View -->
      <div class="space-y-6">
        <div class="bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Icon name="heroicons:clipboard-document-list" class="w-5 h-5" /></div>
            <div>
              <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest">Raw Orders List</h2>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Order by Order Breakdown</p>
            </div>
          </div>
        </div>

        <div v-for="order in filteredData" :key="order.id" class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <!-- Order Header -->
        <div @click="toggleOrder(order.id)" class="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 transition-colors group">
          <div class="flex items-center gap-4">
            <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shrink-0">
              <Icon name="heroicons:chevron-down" class="w-4 h-4 transition-transform duration-200" :class="{'rotate-180': expandedOrders[order.id]}" />
            </div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h3 class="text-lg font-black text-slate-900">{{ order.shop_name || 'Unknown Shop' }}</h3>
                <span v-if="order.order_custom_id" class="px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-[10px] font-black text-blue-600 uppercase">ORD: {{ order.order_custom_id }}</span>
                <span v-if="order.delivery?.plan" class="px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-[10px] font-black text-purple-700 uppercase flex items-center gap-1">
                  <Icon name="heroicons:map" class="w-3 h-3" />
                  {{ order.delivery.plan.name }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-1 font-medium">
                {{ dateType === 'delivery_date' ? 'Delivery Date' : 'Order Date' }}: {{ new Date(dateType === 'delivery_date' ? order.delivery_date : order.created_at).toLocaleString() }} &middot; 
                Status: <span class="uppercase font-bold">{{ order.status }}</span>
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black uppercase text-slate-400 tracking-widest">Items in Order</p>
            <p class="text-xl font-black text-slate-900">{{ order.items?.length || 0 }}</p>
          </div>
        </div>

        <!-- Order Items -->
        <div v-show="expandedOrders[order.id]" class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr class="border-b border-slate-100 bg-white">
                <th class="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 w-12 text-center">#</th>
                <th class="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th class="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Product Name</th>
                <th class="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Unit</th>
                <th class="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in order.items" :key="item.id" class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td class="py-3 px-6 text-xs font-bold text-slate-400 text-center">{{ Number(idx) + 1 }}</td>
                <td class="py-3 px-6 text-xs text-slate-500 font-bold uppercase">{{ item.product?.category?.name || 'Uncategorized' }}</td>
                <td class="py-3 px-6 text-sm text-slate-900 font-black">
                  <div class="flex items-center gap-2">
                    {{ item.product?.name || 'Unknown Product' }}
                    <span v-if="item.product?.sku" class="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-widest shrink-0">{{ item.product.sku }}</span>
                  </div>
                </td>
                <td class="py-3 px-6 text-center">
                  <span class="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-black text-slate-600 uppercase">{{ item.unit || 'N/A' }}</span>
                </td>
                <td class="py-3 px-6 text-right font-black text-lg text-slate-900">{{ item.qty }}</td>
              </tr>
              <tr v-if="!order.items || order.items.length === 0">
                <td colspan="5" class="py-6 text-center text-sm font-medium text-slate-400">No items in this order.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <!-- Right Side: Aggregated Product Summary -->
      <div class="space-y-6 sticky top-6">
        <div class="bg-slate-900 px-6 py-4 rounded-3xl border border-slate-800 shadow-lg flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Icon name="heroicons:squares-2x2" class="w-5 h-5" /></div>
            <div>
              <h2 class="text-sm font-black text-white uppercase tracking-widest">Aggregated Summary</h2>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Total Product Quantities to Pack</p>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-3xl shadow-sm p-2">
          <div v-for="(group, idx) in aggregatedProducts" :key="idx" class="border-b border-slate-50 last:border-0 p-4 hover:bg-slate-50/50 transition-colors rounded-2xl">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">{{ group.category }}</p>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-black text-slate-900">{{ group.name }}</h3>
                  <span v-if="group.sku" class="text-[9px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-widest shrink-0">{{ group.sku }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-1.5 items-end">
                <span v-for="(data, unit) in group.totals" :key="unit" class="flex flex-col items-end gap-1 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                  <span class="text-[9px] font-black uppercase tracking-widest text-slate-400">{{ data.orders.size }} Orders</span>
                  <div class="flex items-center gap-1">
                    <span class="text-lg font-black text-slate-900">{{ Number(data.qty).toLocaleString() }}</span>
                    <span class="text-[9px] font-black uppercase tracking-widest text-slate-500">{{ unit }}</span>
                  </div>
                </span>
              </div>
            </div>
          </div>
          
          <div v-if="aggregatedProducts.length === 0" class="p-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            No products to summarize
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin' })

const api = useApi()
const authStore = useAuthStore()

const now = new Date()
const startDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
const endDate = ref(now.toISOString().split('T')[0])
const search = ref('')
const dateType = ref<'created_at' | 'delivery_date'>('created_at')
const selectedPlanId = ref<string | number>('all')
const deliveryPlans = ref<any[]>([])

const loading = ref(true)
const inventoryData = ref<any[]>([])

const expandedOrders = ref<Record<number, boolean>>({})

function toggleOrder(id: number) {
  expandedOrders.value[id] = !expandedOrders.value[id]
}

async function fetchPlans() {
  try {
    const res = await api.get('/admin/delivery-plans') as any[]
    deliveryPlans.value = res || []
  } catch (err) {
    console.error('Failed to load delivery plans:', err)
  }
}

function onPlanChange() {
  if (selectedPlanId.value !== 'all' && selectedPlanId.value !== 'unassigned') {
    const plan = deliveryPlans.value.find(p => String(p.id) === String(selectedPlanId.value))
    if (plan && plan.date) {
      startDate.value = plan.date
      endDate.value = plan.date
      dateType.value = 'delivery_date'
    }
  }
  fetchData()
}

const filteredData = computed(() => {
  const activeOrders = (inventoryData.value || []).filter(order => {
    return order.status !== 'completed' && order.status !== 'cancelled' && !order.is_direct_sale
  })
  if (!search.value) return activeOrders
  const q = search.value.toLowerCase()
  return activeOrders.filter(order => 
    order.shop_name?.toLowerCase().includes(q) || 
    order.order_custom_id?.toLowerCase().includes(q) ||
    order.items?.some((item: any) => item.product?.name?.toLowerCase().includes(q))
  )
})

const totalItems = computed(() => {
  return filteredData.value.reduce((sum, order) => {
    return sum + (order.items?.reduce((itemSum: number, item: any) => itemSum + Number(item.qty), 0) || 0)
  }, 0)
})

const aggregatedProducts = computed(() => {
  const map = new Map<string, { category: string, name: string, sku: string, totals: Record<string, {qty: number, orders: Set<number>}> }>()
  
  filteredData.value.forEach(order => {
    order.items?.forEach((item: any) => {
      const prodName = item.product?.name || 'Unknown Product'
      const prodSku = item.product?.sku || ''
      const catName = item.product?.category?.name || 'Uncategorized'
      const unit = item.unit || 'N/A'
      const qty = Number(item.qty) || 0
      
      const key = `${catName}::${prodName}`
      if (!map.has(key)) {
        map.set(key, { category: catName, name: prodName, sku: prodSku, totals: {} })
      }
      
      const entry = map.get(key)!
      if (!entry.totals[unit]) entry.totals[unit] = { qty: 0, orders: new Set() }
      entry.totals[unit].qty += qty
      entry.totals[unit].orders.add(order.id)
    })
  })
  
  return Array.from(map.values()).sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return a.name.localeCompare(b.name)
  })
})

onMounted(async () => {
  if (authStore.isSaleAdmin) {
    navigateTo('/admin/products')
    return
  }
  if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAdminReporter && !authStore.isDelivery) {
    navigateTo('/admin')
    return
  }
  fetchPlans()
  fetchData()
})

async function fetchData() {
  loading.value = true
  try {
    const params: any = { 
      start_date: startDate.value, 
      end_date: endDate.value,
      date_type: dateType.value,
      plan_id: selectedPlanId.value
    }
    const res = await api.get('/admin/inventory/arrangement', { params }) as any
    inventoryData.value = res.data || []
  } catch (error) {
    console.error('Failed to load inventory arrangement:', error)
  } finally { 
    loading.value = false 
  }
}

async function exportData(type: 'excel' | 'pdf') {
  try {
    const params: any = { 
      start_date: startDate.value, 
      end_date: endDate.value,
      date_type: dateType.value,
      plan_id: selectedPlanId.value
    }

    const response = await api.get(`/admin/inventory/export/${type}`, {
      params,
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

    let planSuffix = ''
    if (selectedPlanId.value !== 'all' && selectedPlanId.value !== 'unassigned') {
      const plan = deliveryPlans.value.find(p => String(p.id) === String(selectedPlanId.value))
      if (plan) {
        planSuffix = `_plan_${plan.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`
      }
    } else if (selectedPlanId.value === 'unassigned') {
      planSuffix = '_unassigned'
    }

    link.setAttribute('download', `inventory_arrangement${planSuffix}_${startDate.value}_to_${endDate.value}.${type === 'excel' ? 'xlsx' : 'pdf'}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export data. Please try again.')
  }
}
</script>
