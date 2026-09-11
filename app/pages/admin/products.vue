<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
        <button 
          @click="currentView = 'inventory'" 
          :class="currentView === 'inventory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'" 
          class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
        >
          Inventory
        </button>
        <button 
          @click="currentView = 'discount'" 
          :class="currentView === 'discount' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'" 
          class="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
        >
          Discount
        </button>
      </div>

      <!-- Action Search & Add Button -->
      <div class="flex items-center gap-3 flex-1 max-w-sm">
        <div class="relative flex-1">
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            v-model="searchQuery" 
            class="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold shadow-sm focus:ring-2 focus:ring-blue-500/10 outline-none" 
            placeholder="Search..." 
          />
        </div>
        <button 
          v-if="authStore.isAdmin || authStore.isSuperAdmin || authStore.isAdminDelivery" 
          @click="handleTopAddButtonClick" 
          class="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md shadow-blue-200 transition-all whitespace-nowrap"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
          {{ topAddButtonLabel }}
        </button>
      </div>
    </div>

    <!-- Active Loading Spinner -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-3 bg-white border border-slate-200 rounded-3xl">
      <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Syncing Products Catalog...</p>
    </div>

    <div v-else>
      <KeepAlive>
        <ProductInventory 
          v-if="currentView === 'inventory'"
          ref="inventoryRef"
          :products="products"
          :categories="categories"
          :promos="promos"
          :unifiedPromos="unifiedPromos"
          :search-query="searchQuery"
          @refresh="fetchData(false)"
        />
        <ProductDiscount 
          v-else-if="currentView === 'discount'"
          ref="discountRef"
          :products="products"
          :categories="categories"
          :promos="promos"
          :unifiedPromos="unifiedPromos"
          :search-query="searchQuery"
          @refresh="fetchData(false)"
        />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'admin' })

const api = useApi()
const authStore = useAuthStore()
const route = useRoute()

// State
const products = ref<any[]>([])
const categories = ref<any[]>([])
const promos = ref<any[]>([])
const unifiedPromos = ref<any[]>([])
const searchQuery = ref('')
const loading = ref(true)
const currentView = ref(route.query.tab === 'discount' || route.query.view === 'discount' ? 'discount' : 'inventory')

// Child Component References
const inventoryRef = ref<any>(null)
const discountRef = ref<any>(null)

watch(() => [route.query.tab, route.query.view], ([newTab, newView]) => {
  if (newTab === 'discount' || newView === 'discount') {
    currentView.value = 'discount'
  } else if (newTab === 'inventory' || newView === 'inventory') {
    currentView.value = 'inventory'
  }
})

const activeSystem = computed(() => {
  // Try to read custom system from discountRef first
  return discountRef.value?.activeSystem || 'category'
})

const topAddButtonLabel = computed(() => {
  if (currentView.value === 'inventory') return 'Add Item'
  if (activeSystem.value === 'mixed') return 'New Mixed Combo'
  if (activeSystem.value === 'bundle') return 'Add Bundle'
  if (activeSystem.value === 'category') return 'Add Category Promo'
  return 'Add Promo'
})

function handleTopAddButtonClick() {
  if (currentView.value === 'inventory') {
    inventoryRef.value?.openModal()
  } else {
    discountRef.value?.handleAddButton()
  }
}

async function fetchData(showSpinner = true) {
  if (showSpinner) loading.value = true
  try {
    const [p, c, pr] = await Promise.all([
      api.get('/products'), 
      api.get('/categories'),
      api.get('/admin/promotions').catch((e: any) => {
        console.error('Failed to load promotions:', e)
        return []
      }),
    ])
    products.value = p as any[]
    categories.value = c as any[]
    promos.value = pr as any[]
    unifiedPromos.value = pr as any[]
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (authStore.isAdminReporter) {
    navigateTo('/admin')
    return
  }
  await fetchData()
})
</script>

<style>
/* Micro-animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
