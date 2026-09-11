<template>
  <NuxtLayout :name="(authStore.isAdmin || authStore.isAsm) ? 'admin' : 'default'">
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="page-title text-3xl font-black flex items-center gap-2 tracking-tight">
            <Icon name="heroicons:squares-2x2" class="w-8 h-8 text-blue-600" />
            Dashboard Intelligence
          </h1>
          <p class="text-slate-500 text-sm mt-1">Real-time performance metrics and sales synchronization.</p>
        </div>

        <!-- Shared Date Filters (Overview and Store Map Tab Only) -->
        <div v-if="activeTab === 'overview' || activeTab === 'store-map'" class="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-slate-400" />
          <input type="date" v-model="startDate" 
            class="bg-transparent text-slate-900 text-xs focus:outline-none border-none p-0 cursor-pointer" />
          <span class="text-slate-300 text-xs">-</span>
          <input type="date" v-model="endDate" 
            class="bg-transparent text-slate-900 text-xs focus:outline-none border-none p-0 cursor-pointer" />
        </div>
      </div>

      <!-- Submodule Tab Switchers -->
      <div class="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button 
          @click="activeTab = 'overview'" 
          :class="['px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0', activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800']"
        >
          Executive Overview
        </button>
        <button 
          @click="activeTab = 'rep-performance'" 
          :class="['px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0', activeTab === 'rep-performance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800']"
        >
          Sale Performance
        </button>
        <button 
          @click="activeTab = 'delivery-performance'" 
          :class="['px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0', activeTab === 'delivery-performance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800']"
        >
          Delivery Performance
        </button>
        <button 
          @click="activeTab = 'product'" 
          :class="['px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0 flex items-center gap-1.5', activeTab === 'product' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800']"
        >
          <Icon name="heroicons:cube" class="w-4 h-4" />
          Product Performance
        </button>
        <button 
          @click="activeTab = 'store'" 
          :class="['px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0 flex items-center gap-1.5', activeTab === 'store' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800']"
        >
          <Icon name="heroicons:building-storefront" class="w-4 h-4" />
          Store Performance
        </button>
        <button 
          @click="activeTab = 'ai-analyst'" 
          :class="['px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0 flex items-center gap-1.5', activeTab === 'ai-analyst' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800']"
        >
          <Icon name="heroicons:sparkles" class="w-4 h-4 text-indigo-500" />
          AI Store Analyst
        </button>
        <button 
          @click="activeTab = 'store-map'" 
          :class="['px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all shrink-0 flex items-center gap-1.5', activeTab === 'store-map' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800']"
        >
          <Icon name="heroicons:map" class="w-4 h-4" />
          Store Map
        </button>
      </div>

      <!-- Lazy Loaded Submodule Components -->
      <div class="relative">
        <!-- Overview loading overlay indicator when fetching shared orders -->
        <div v-if="loadingOrders" class="absolute inset-x-0 top-0 h-1 bg-blue-500/20 overflow-hidden">
          <div class="h-full bg-blue-600 animate-pulse w-full"></div>
        </div>

        <LazyDashboardOverview 
          v-if="activeTab === 'overview'" 
          :start-date="startDate" 
          :end-date="endDate" 
          :all-orders="allOrders" 
        />
        <LazyDashboardSalesPerformance 
          v-else-if="activeTab === 'rep-performance'" 
        />
        <LazyDashboardDeliveryPerformance 
          v-else-if="activeTab === 'delivery-performance'" 
        />
        <div v-else-if="activeTab === 'product'" class="space-y-4 animate-fade-in">
          <!-- Product Sub-tabs (Product Performance & By SKU in Store) -->
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              @click="productSubTab = 'overview'"
              :class="['px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5', productSubTab === 'overview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800']"
            >
              <Icon name="heroicons:cube" class="w-3.5 h-3.5" />
              Product Performance
            </button>
            <button
              @click="productSubTab = 'store-sku'"
              :class="['px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5', productSubTab === 'store-sku' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800']"
            >
              <Icon name="heroicons:shopping-cart" class="w-3.5 h-3.5" />
              By SKU in Store
            </button>
          </div>

          <LazyDashboardProductPerformance 
            v-if="productSubTab === 'overview'" 
          />
          <LazyDashboardStoreSkuPerformance 
            v-else-if="productSubTab === 'store-sku'" 
          />
        </div>
        <LazyDashboardStorePerformance 
          v-else-if="activeTab === 'store'" 
        />
        <LazyDashboardStoreAiAnalyst 
          v-else-if="activeTab === 'ai-analyst'" 
        />
        <div v-show="activeTab === 'store-map'" class="animate-fade-in">
          <DashboardStoreMap 
            ref="mapComponentRef" 
            :all-orders="allOrders" 
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: false })

const api = useApi()
const authStore = useAuthStore()

// Shared Date Utils
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const activeTab = ref('overview')
const productSubTab = ref<'overview' | 'store-sku'>('overview')
const startDate = ref(toLocalDateString(firstDay))
const endDate = ref(toLocalDateString(lastDay))
const allOrders = ref<any[]>([])
const loadingOrders = ref(false)
const mapComponentRef = ref<any>(null)

async function fetchOrders() {
  loadingOrders.value = true
  try {
    const params = { start_date: startDate.value, end_date: endDate.value }
    const o = await api.get('/orders', { params }) as any
    allOrders.value = o.orders || []
  } catch (e) {
    console.error('Failed to load orders for shared state:', e)
  } finally {
    loadingOrders.value = false
  }
}

watch([startDate, endDate], () => {
  fetchOrders()
})

watch(activeTab, (newTab) => {
  if (newTab === 'store-map') {
    nextTick(() => {
      if (mapComponentRef.value) {
        mapComponentRef.value.resizeMap()
      }
    })
  }
})

onMounted(() => {
  fetchOrders()
})
</script>

<style>
/* Micro-animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-slide-up {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* slate-300 */
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8; /* slate-400 */
}
</style>
