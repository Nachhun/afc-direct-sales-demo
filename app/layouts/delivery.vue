<template>
  <div class="min-h-screen bg-[#0A1628] flex flex-col font-sans">
    <!-- Top bar -->
    <header class="bg-[#0D1B31]/80 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 glass-panel rounded-lg flex items-center justify-center">
          <img src="/logo.png" alt="AFC" class="h-5 w-auto object-contain" />
        </div>
        <span class="font-black text-white text-sm">🚚 Delivery</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-slate-400 text-xs font-bold">{{ authStore.user?.name }}</span>
        <button @click="authStore.logout()" class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="flex-1 p-4 max-w-2xl mx-auto w-full pb-24 animate-fade-in">
      <slot />
    </main>

    <!-- Bottom Nav -->
    <nav class="fixed bottom-0 left-0 right-0 bg-[#0D1B31]/90 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around px-2 py-2 pb-safe">
      <NuxtLink to="/delivery" exact
        class="flex flex-col items-center py-1 text-slate-500 transition-all w-full"
        active-class="text-emerald-400">
        <Icon name="heroicons:list-bullet" class="w-6 h-6" />
        <span class="text-[9px] font-black uppercase tracking-widest mt-1">List</span>
      </NuxtLink>
      <NuxtLink to="/delivery/map" exact
        class="flex flex-col items-center py-1 text-slate-500 transition-all w-full"
        active-class="text-emerald-400">
        <Icon name="heroicons:map" class="w-6 h-6" />
        <span class="text-[9px] font-black uppercase tracking-widest mt-1">Map View</span>
      </NuxtLink>
      <NuxtLink to="/delivery/history"
        class="flex flex-col items-center py-1 text-slate-500 transition-all w-full"
        active-class="text-emerald-400">
        <Icon name="heroicons:clock" class="w-6 h-6" />
        <span class="text-[9px] font-black uppercase tracking-widest mt-1">History</span>
      </NuxtLink>

      <!-- Back to Admin for Admins -->
      <NuxtLink v-if="authStore.isAdmin" to="/admin"
        class="flex flex-col items-center py-1 text-blue-500/60 transition-all w-full">
        <Icon name="heroicons:squares-2x2" class="w-6 h-6" />
        <span class="text-[9px] font-black uppercase tracking-widest mt-1">Admin</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()

if (process.client && (!authStore.isLoggedIn || (!authStore.isAdmin && !authStore.isDelivery))) {
  navigateTo('/login')
}

onMounted(() => {
  // Auto-request location permissions immediately upon entering the delivery app
  // but only do it once per session to prevent repeated prompts in Telegram WebApp
  if (process.client && navigator.geolocation && !sessionStorage.getItem('locationRequested')) {
    sessionStorage.setItem('locationRequested', 'true')
    navigator.geolocation.getCurrentPosition(() => {}, () => {}, { timeout: 10000 })
  }
})
</script>
