<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-10 bg-slate-50">

    <div class="w-full max-w-md space-y-6">
      <!-- App Branding Header -->
      <div class="text-center">
        <div class="w-20 h-20 flex items-center justify-center mx-auto mb-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200/80">
          <img src="/logo.png" alt="AFC Logo" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          AFC Direct Sales <span class="text-[10px] bg-blue-50 text-blue-600 border border-blue-200/80 px-2 py-0.5 rounded-full font-bold ml-1">v2.1 Live Demo</span>
        </h1>
        <p class="text-slate-500 mt-1 text-xs sm:text-sm font-medium">Sales Force Automation & Order Management PWA</p>
      </div>

      <!-- ✨ LIVE DEMO PERSONA SELECTOR (NO LOGIN REQUIRED) -->
      <div class="bg-white rounded-3xl p-6 border-2 border-blue-500/20 shadow-xl shadow-blue-500/5 relative overflow-hidden">
        <div class="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
          Interactive Demo
        </div>

        <div class="mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 class="text-sm font-black uppercase tracking-wider text-slate-900">Explore Demo System</h2>
          </div>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Click any role below to experience the production workflow with synthetic FMCG data.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <!-- 1. Super Admin -->
          <button
            type="button"
            @click="authStore.loginDemo('super_admin')"
            class="flex flex-col text-left p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all group border border-slate-700"
          >
            <div class="flex items-center justify-between w-full mb-1.5">
              <span class="text-base">👑</span>
              <span class="text-[9px] font-black uppercase tracking-widest bg-white/10 px-1.5 py-0.5 rounded text-white/80">Admin</span>
            </div>
            <p class="font-bold text-xs tracking-tight">Executive Director</p>
            <p class="text-[10px] text-white/60 mt-0.5 leading-tight">Full analytics, revenue KPI & AI store analyst</p>
          </button>

          <!-- 2. Area Sales Manager (ASM) -->
          <button
            type="button"
            @click="authStore.loginDemo('asm')"
            class="flex flex-col text-left p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 hover:bg-blue-100/60 text-slate-900 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all group border border-blue-200/80"
          >
            <div class="flex items-center justify-between w-full mb-1.5">
              <span class="text-base">📊</span>
              <span class="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">ASM</span>
            </div>
            <p class="font-bold text-xs tracking-tight text-indigo-950">Area Sales Manager</p>
            <p class="text-[10px] text-slate-500 mt-0.5 leading-tight">Sales rep tracking & territory outlet map</p>
          </button>

          <!-- 3. Field Sales Rep -->
          <button
            type="button"
            @click="authStore.loginDemo('salesman')"
            class="flex flex-col text-left p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:bg-emerald-100/60 text-slate-900 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all group border border-emerald-200/80"
          >
            <div class="flex items-center justify-between w-full mb-1.5">
              <span class="text-base">💼</span>
              <span class="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Salesman</span>
            </div>
            <p class="font-bold text-xs tracking-tight text-emerald-950">Sales Representative</p>
            <p class="text-[10px] text-slate-500 mt-0.5 leading-tight">Store visits & product ordering workflow</p>
          </button>

          <!-- 4. Delivery Courier -->
          <button
            type="button"
            @click="authStore.loginDemo('delivery')"
            class="flex flex-col text-left p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 hover:bg-amber-100/60 text-slate-900 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all group border border-amber-200/80"
          >
            <div class="flex items-center justify-between w-full mb-1.5">
              <span class="text-base">🚚</span>
              <span class="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Delivery</span>
            </div>
            <p class="font-bold text-xs tracking-tight text-amber-950">Courier / Driver</p>
            <p class="text-[10px] text-slate-500 mt-0.5 leading-tight">GPS routes, Leaflet map & proof of delivery</p>
          </button>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Synthetic Mock FMCG Data
          </span>
          <span class="font-mono text-[10px]">Zero Real Customer Info</span>
        </div>
      </div>

      <!-- Standard Production Auth (Optional / Collapsed) -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <button
          type="button"
          @click="showRealAuth = !showRealAuth"
          class="w-full flex items-center justify-between text-left text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <span>Production Sign-In (Private Server)</span>
          <svg
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': showRealAuth }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="showRealAuth" class="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div v-if="error" class="bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-xs font-medium">
            {{ error }}
          </div>

          <a
            :href="googleLoginUrl"
            class="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-xl py-2.5 px-4 hover:bg-slate-50 transition-colors duration-200 cursor-pointer shadow-xs text-xs font-medium text-slate-700"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </a>
        </div>
      </div>

      <p class="text-center text-slate-400 text-[10px] leading-relaxed">
        Engineered by Ouk Chhunna · Full-Stack Software Developer<br/>
        Production Architecture Demo · All Data Synthetic
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: false })

const authStore = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const showRealAuth = ref(false)
const loading = ref(false)
const error = ref('')

const googleLoginUrl = computed(() => {
  return config.public.apiBase + '/auth/google/redirect'
})

onMounted(() => {
  authStore.loadFromStorage()
  if (authStore.isLoggedIn) {
    if (authStore.isAdmin) router.push('/admin')
    else if (authStore.isDelivery) router.push('/delivery')
    else if (authStore.isAsm) router.push('/asm')
    else router.push('/order/new')
  }
})
</script>
