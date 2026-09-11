<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="page-title text-3xl">Delivery KPI</h1>
        <p class="text-slate-500 text-sm mt-1">On-time performance by courier.</p>
      </div>
      <div class="flex gap-3">
        <NuxtLink to="/admin/deliveries" class="btn-secondary flex items-center gap-2">
          <Icon name="heroicons:arrow-left" class="w-4 h-4" /> Back
        </NuxtLink>
        <button @click="exportCsv" class="btn-primary flex items-center gap-2">
          <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" /> Export CSV
        </button>
      </div>
    </div>

    <!-- Overall KPI -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="card text-center">
        <p class="text-3xl font-black text-slate-900">{{ overall.total }}</p>
        <p class="text-xs text-slate-400 uppercase font-black mt-1">Total Deliveries</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-black text-emerald-600">{{ overall.on_time }}</p>
        <p class="text-xs text-slate-400 uppercase font-black mt-1">On Time</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-black text-red-500">{{ overall.overdue }}</p>
        <p class="text-xs text-slate-400 uppercase font-black mt-1">Overdue</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-black" :class="overall.rate >= 80 ? 'text-emerald-600' : overall.rate >= 60 ? 'text-amber-500' : 'text-red-500'">
          {{ overall.rate }}%
        </p>
        <p class="text-xs text-slate-400 uppercase font-black mt-1">On-Time Rate</p>
      </div>
    </div>

    <!-- Per Courier KPI Table -->
    <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-slate-100 bg-slate-50">
            <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase">Courier</th>
            <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase text-center">Total</th>
            <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase text-center">On Time ✅</th>
            <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase text-center">Overdue ⚠️</th>
            <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase text-center">Rate</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="c in couriers" :key="c.id" class="hover:bg-slate-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-sm font-black text-emerald-600">
                  {{ c.name?.charAt(0) }}
                </div>
                <span class="font-bold text-sm text-slate-900">{{ c.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-center font-bold text-slate-700">{{ c.deliveries_count }}</td>
            <td class="px-6 py-4 text-center font-bold text-emerald-600">{{ c.on_time_count }}</td>
            <td class="px-6 py-4 text-center font-bold text-red-500">{{ c.overdue_count }}</td>
            <td class="px-6 py-4 text-center">
              <div class="flex items-center gap-2 justify-center">
                <div class="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="c.on_time_rate >= 80 ? 'bg-emerald-500' : c.on_time_rate >= 60 ? 'bg-amber-400' : 'bg-red-400'"
                    :style="`width:${c.on_time_rate}%`" />
                </div>
                <span class="font-black text-sm" :class="c.on_time_rate >= 80 ? 'text-emerald-600' : c.on_time_rate >= 60 ? 'text-amber-500' : 'text-red-500'">
                  {{ c.on_time_rate }}%
                </span>
              </div>
            </td>
          </tr>
          <tr v-if="couriers.length === 0">
            <td colspan="5" class="px-6 py-16 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">No courier data yet</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const api = useApi()
const config = useRuntimeConfig()
const authStore = useAuthStore()
const couriers = ref<any[]>([])

const overall = computed(() => {
  const total = couriers.value.reduce((s, c) => s + c.deliveries_count, 0)
  const on_time = couriers.value.reduce((s, c) => s + c.on_time_count, 0)
  const overdue = couriers.value.reduce((s, c) => s + c.overdue_count, 0)
  const rate = total > 0 ? Math.round(on_time / total * 100) : 0
  return { total, on_time, overdue, rate }
})

onMounted(async () => {
  if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAdminDelivery) {
    navigateTo('/admin')
    return
  }
  couriers.value = await api.get('/admin/deliveries/kpi') as any[]
})

function exportCsv() {
  const url = `${config.public.apiBase}/admin/deliveries/export`
  const a = document.createElement('a')
  a.href = url
  a.setAttribute('Authorization', `Bearer ${authStore.token}`)
  a.download = 'deliveries_export.csv'
  a.click()
}
</script>
