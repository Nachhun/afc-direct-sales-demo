<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-slate-900">{{ authStore.isAdmin ? 'Overall History' : 'My Delivery History' }}</h1>
        <p class="text-slate-500 text-sm mt-1">{{ authStore.isAdmin ? 'History of all completed deliveries.' : 'Your successfully completed deliveries.' }}</p>
      </div>
    </div>

    <!-- Stats/Filters Area (Optional future expansion) -->
    
    <!-- State: Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-slate-100 animate-pulse rounded-3xl" />
    </div>

    <!-- State: Empty -->
    <div v-else-if="deliveries.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
        📦
      </div>
      <p class="font-bold text-slate-900">No deliveries yet</p>
      <p class="text-sm text-slate-500 mt-1">When you complete an order, it will appear here.</p>
      <NuxtLink to="/delivery" class="btn-primary mt-6 inline-block">Back to Active</NuxtLink>
    </div>

    <!-- Deliveries List -->
    <div v-else class="space-y-4">
      <div v-for="d in deliveries" :key="d.id" class="card relative overflow-hidden group">
        <!-- Status Banner -->
        <div :class="{
          'bg-emerald-50 text-emerald-600 border-emerald-100': d.status === 'delivered',
          'bg-orange-50 text-orange-600 border-orange-100': d.status === 'delivered_with_issue',
          'bg-red-50 text-red-600 border-red-100': d.status === 'shop_closed',
          'bg-rose-50 text-rose-600 border-rose-100': d.status === 'customer_cancelled'
        }" class="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-widest border-b border-l">
          {{ (d.status || '').replace(/_/g, ' ') }}
        </div>

        <div class="flex justify-between items-start pt-2">
          <div>
            <p class="font-black text-slate-900">{{ d.order?.shop_name }}</p>
            <p class="text-xs text-slate-400 mt-0.5">#{{ d.order_id }} · {{ d.order?.customer_address || '' }}</p>
            <p v-if="authStore.isAdmin" class="text-[10px] font-bold text-blue-500 mt-1">Courier: {{ d.courier?.name }}</p>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivered On</p>
            <p class="text-xs font-bold text-slate-700">
              {{ d.completed_at ? new Date(d.completed_at).toLocaleString() : '—' }}
            </p>
          </div>
          <div class="bg-slate-50 rounded-xl p-3">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned</p>
            <p class="text-xs font-bold text-slate-700 truncate">
              {{ d.assigned_at ? new Date(d.assigned_at).toLocaleDateString() : '—' }}
            </p>
          </div>
        </div>
        
        <!-- Products summary -->
        <div class="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <p class="font-bold text-slate-700 mb-2">Items Included:</p>
          <div v-for="item in (d.order?.items || [])" :key="item.id" class="flex justify-between">
            <span>{{ item.qty }}x {{ item.product?.name }} [{{ item.unit || 'pc' }}]</span>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'delivery' })
const api = useApi()
const authStore = useAuthStore()
const loading = ref(true)
const deliveries = ref<any[]>([])

onMounted(async () => {
  try {
    if (authStore.isAdmin) {
      const data = await api.get('/admin/deliveries') as any
      deliveries.value = (data.deliveries || []).filter((d: any) => ['delivered', 'shop_closed', 'delivered_with_issue', 'customer_cancelled'].includes(d.status))
    } else {
      deliveries.value = await api.get('/deliveries/history') as any[]
    }
  } catch (e) {
    console.error('Failed to load history', e)
  } finally {
    loading.value = false
  }
})
</script>
