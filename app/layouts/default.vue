<template>
  <div class="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-amber-500/10 overflow-x-hidden">
    <!-- Sidebar (desktop) -->
    <aside class="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col min-h-screen fixed top-0 left-0 bottom-0 z-50">
      <div class="p-6 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 glass-panel rounded-xl flex items-center justify-center">
            <img src="/logo.png" alt="AFC Logo" class="h-10 w-auto object-contain" />
          </div>
          <div>
            <p class="font-black text-slate-900 text-base tracking-tight leading-none">AFC Direct</p>
            <p class="text-amber-600 font-bold text-[10px] uppercase tracking-widest mt-1">Sales Portal</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <template v-if="authStore.isDelivery">
          <NuxtLink to="/delivery"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 text-sm font-bold border border-transparent"
            active-class="text-amber-600 bg-amber-50 border-amber-100">
            <Icon name="heroicons:truck" class="w-5 h-5" />
            <span>My Deliveries</span>
          </NuxtLink>
          <NuxtLink to="/admin/stores"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 text-sm font-bold border border-transparent"
            active-class="text-amber-600 bg-amber-50 border-amber-100">
            <Icon name="heroicons:building-storefront" class="w-5 h-5" />
            <span>Stores</span>
          </NuxtLink>
          <NuxtLink to="/delivery/history"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 text-sm font-bold border border-transparent"
            active-class="text-amber-600 bg-amber-50 border-amber-100">
            <Icon name="heroicons:clock" class="w-5 h-5" />
            <span>History</span>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/order/new"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 text-sm font-bold border border-transparent"
            active-class="text-amber-600 bg-amber-50 border-amber-100">
            <Icon name="heroicons:plus-circle" class="w-5 h-5" />
            <span>New Order</span>
          </NuxtLink>
          <NuxtLink v-if="authStore.isAsm" to="/asm"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 text-sm font-bold border border-transparent"
            active-class="text-amber-600 bg-amber-50 border-amber-100">
            <Icon name="heroicons:chart-bar" class="w-5 h-5" />
            <span>ASM Dashboard</span>
          </NuxtLink>
          <NuxtLink v-if="authStore.isAsm" to="/admin/sales-tracking"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 text-sm font-bold border border-transparent"
            active-class="text-amber-600 bg-amber-50 border-amber-100">
            <Icon name="heroicons:map" class="w-5 h-5" />
            <span>Sales Tracking</span>
          </NuxtLink>
          <NuxtLink to="/order/history"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 text-sm font-bold border border-transparent"
            active-class="text-amber-600 bg-amber-50 border-amber-100">
            <Icon name="heroicons:clock" class="w-5 h-5" />
            <span>My Orders</span>
          </NuxtLink>
        </template>
      </nav>

      <div class="p-4 border-t border-slate-100 space-y-4">
        <div class="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-650 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg shadow-amber-550/20">
            {{ authStore.user?.name?.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-slate-900 text-sm font-bold truncate">{{ authStore.user?.name }}</p>
            <p class="text-slate-500 text-[10px] uppercase font-black tracking-widest">
              {{ authStore.isDelivery ? 'Courier' : (authStore.isAsm ? 'ASM' : 'Sales Rep') }}
            </p>
          </div>
        </div>
        <NuxtLink v-if="authStore.isLoggedIn" to="/admin" class="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 text-sm font-bold group border border-transparent">
          <Icon name="heroicons:squares-2x2" class="w-4 h-4" />
          <span>Dashboard</span>
        </NuxtLink>
        <button @click="authStore.logout()" class="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-500 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all duration-300 text-sm font-bold group border border-transparent">
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 lg:ml-64 min-h-screen flex flex-col min-w-0 w-full overflow-x-hidden">
      <!-- Mobile/Tablet Top Bar -->
      <header class="lg:hidden bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between sticky top-0 z-40">
        <div class="flex items-center gap-3">
          <div class="h-8 w-8 glass-panel rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="AFC Logo" class="h-5 w-auto object-contain" />
          </div>
          <span class="font-black text-slate-900 text-sm tracking-tight">AFC Courier</span>
        </div>
        <div class="flex items-center gap-2">
          <button @click="authStore.logout()" class="text-slate-500 p-2 btn-icon-action">
            <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Mobile/Tablet Bottom Nav -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around px-2 pt-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.03)]">
        <template v-if="authStore.isDelivery">
          <NuxtLink to="/delivery"
            class="flex flex-col items-center py-2 px-6 rounded-xl text-slate-400 transition-all duration-300"
            active-class="text-amber-600 scale-105 bg-amber-50 active:scale-95">
            <Icon name="heroicons:truck" class="w-5 h-5 sm:w-6 sm:h-6" />
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">Deliveries</span>
          </NuxtLink>
          <NuxtLink to="/admin/stores"
            class="flex flex-col items-center py-2 px-6 rounded-xl text-slate-400 transition-all duration-300"
            active-class="text-amber-600 scale-105 bg-amber-50 active:scale-95">
            <Icon name="heroicons:building-storefront" class="w-5 h-5 sm:w-6 sm:h-6" />
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">Stores</span>
          </NuxtLink>
          <NuxtLink to="/delivery/history"
            class="flex flex-col items-center py-2 px-6 rounded-xl text-slate-400 transition-all duration-300"
            active-class="text-amber-600 scale-105 bg-amber-50 active:scale-95">
            <Icon name="heroicons:clock" class="w-5 h-5 sm:w-6 sm:h-6" />
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">History</span>
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/order/new"
            class="flex flex-col items-center py-2 px-6 rounded-xl text-slate-400 transition-all duration-300"
            active-class="text-amber-600 scale-105 bg-amber-50 active:scale-95">
            <Icon name="heroicons:plus-circle" class="w-5 h-5 sm:w-6 sm:h-6" />
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">New Order</span>
          </NuxtLink>
          <NuxtLink v-if="authStore.isAsm" to="/asm"
            class="flex flex-col items-center py-2 px-6 rounded-xl text-slate-400 transition-all duration-300"
            active-class="text-amber-600 scale-105 bg-amber-50 active:scale-95">
            <Icon name="heroicons:chart-bar" class="w-5 h-5 sm:w-6 sm:h-6" />
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">ASM Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/order/history"
            class="flex flex-col items-center py-2 px-6 rounded-xl text-slate-400 transition-all duration-300"
            active-class="text-amber-600 scale-105 bg-amber-50 active:scale-95">
            <Icon name="heroicons:clock" class="w-5 h-5 sm:w-6 sm:h-6" />
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">History</span>
          </NuxtLink>
          <NuxtLink to="/admin"
            class="flex flex-col items-center py-2 px-6 rounded-xl text-slate-400 transition-all duration-300"
            active-class="text-amber-600 scale-105 bg-amber-50 active:scale-95">
            <Icon name="heroicons:squares-2x2" class="w-5 h-5 sm:w-6 sm:h-6" />
            <span class="text-[9px] font-black uppercase tracking-widest mt-1">Dashboard</span>
          </NuxtLink>
        </template>
      </nav>

      <main class="flex-1 p-2 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full min-w-0 animate-fade-in pb-24 lg:pb-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()

if (process.client) {
  if (!authStore.isLoggedIn) {
    navigateTo('/login')
  } else if (authStore.isDelivery) {
    navigateTo('/delivery')
  }
}
</script>


