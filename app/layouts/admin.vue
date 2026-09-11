<template>
  <div class="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-blue-100 overflow-x-hidden">
    <!-- Desktop Sidebar -->
    <aside 
      :class="[
        isCollapsed ? 'w-20' : 'w-64',
        'bg-white border-r border-slate-200 hidden lg:flex flex-col min-h-screen fixed top-0 left-0 bottom-0 z-50 transition-all duration-300 ease-in-out'
      ]"
    >
      <!-- Collapse / Expand Toggle Button -->
      <button 
        @click="toggleSidebar"
        type="button"
        class="absolute -right-3.5 top-8 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:scale-110 transition-all z-50 cursor-pointer"
        :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
        <Icon :name="isCollapsed ? 'heroicons:chevron-right' : 'heroicons:chevron-left'" class="w-4 h-4" />
      </button>

      <!-- Logo Header -->
      <div class="border-b border-slate-100 flex items-center transition-all duration-300" :class="isCollapsed ? 'p-4 justify-center' : 'p-6'">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 glass-panel rounded-xl flex items-center justify-center shrink-0">
            <img src="/logo.png" alt="AFC Logo" class="h-10 w-auto object-contain" />
          </div>
          <div v-if="!isCollapsed" class="min-w-0 transition-opacity duration-200 overflow-hidden">
            <p class="font-black text-slate-900 text-base tracking-tight leading-none truncate">AFC Direct</p>
            <p class="text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-1 truncate">Admin Control <span class="text-[8px] bg-blue-100 px-1 rounded">v2.5</span></p>
          </div>
        </div>
      </div>
      
      <!-- Nav Links -->
      <nav class="flex-1 px-3 py-2 space-y-3 overflow-y-auto custom-scrollbar">
        <div v-for="(group, gIdx) in filteredNavGroups" :key="group.title" class="space-y-0.5">
          <!-- Category Header (hidden when collapsed) or subtle divider when collapsed -->
          <div 
            v-if="!isCollapsed" 
            class="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none flex items-center justify-between"
          >
            <span>{{ group.title }}</span>
          </div>
          <div v-else-if="gIdx > 0" class="my-2 border-t border-slate-100 mx-2"></div>

          <!-- Category Links -->
          <NuxtLink 
            v-for="link in group.items" 
            :key="link.to" 
            :to="link.to" 
            :exact="link.exact" 
            class="sidebar-link group" 
            active-class="sidebar-link-active"
            :class="isCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2 gap-2.5'"
            :title="link.fullLabel"
          >
            <Icon :name="link.icon" class="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105" />
            <span v-if="!isCollapsed" class="truncate text-[13px] font-semibold tracking-tight">{{ link.fullLabel }}</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- User Profile & Log Out -->
      <div class="border-t border-slate-100 transition-all duration-300" :class="isCollapsed ? 'p-3 space-y-3' : 'p-4 space-y-4'">
        <div 
          class="bg-slate-50 border border-slate-100 rounded-2xl flex items-center transition-all"
          :class="isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'"
          :title="authStore.user?.name + ' (' + authStore.user?.role + ')'"
        >
          <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0">
            {{ authStore.user?.name?.charAt(0) }}
          </div>
          <div v-if="!isCollapsed" class="flex-1 min-w-0">
            <p class="text-slate-900 text-sm font-bold truncate">{{ authStore.user?.name }}</p>
            <p class="text-slate-500 text-[10px] uppercase font-black tracking-widest truncate">{{ authStore.user?.role?.replace('_', ' ') }}</p>
          </div>
        </div>
        
        <button 
          @click="authStore.logout()" 
          class="w-full flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-bold group"
          :class="isCollapsed ? 'py-3' : 'gap-2 px-4 py-3 text-sm'"
          :title="'Log Out'"
        >
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5 group-hover:-translate-x-1 transition-transform shrink-0" />
          <span v-if="!isCollapsed">Log Out</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Drawer Overlay -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"></div>
    </Transition>

    <!-- Mobile Drawer Panel -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="-translate-x-full" enter-to-class="translate-x-0" leave-active-class="transition duration-200 ease-in" leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
      <div v-if="isMobileMenuOpen" class="fixed top-0 left-0 bottom-0 w-4/5 max-w-xs bg-white z-50 lg:hidden flex flex-col shadow-2xl">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 glass-panel rounded-xl flex items-center justify-center">
              <img src="/logo.png" alt="AFC Logo" class="h-8 w-auto object-contain" />
            </div>
            <div>
              <p class="font-black text-slate-900 text-sm">AFC Direct</p>
              <p class="text-blue-600 font-bold text-[9px] uppercase tracking-widest">Admin Control</p>
            </div>
          </div>
          <button @click="isMobileMenuOpen = false" class="p-2 text-slate-400 hover:text-slate-600 rounded-lg">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <nav class="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
          <div v-for="group in filteredNavGroups" :key="group.title" class="space-y-0.5">
            <div class="px-3 pt-1 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
              {{ group.title }}
            </div>
            <NuxtLink 
              v-for="link in group.items" 
              :key="link.to" 
              :to="link.to" 
              :exact="link.exact" 
              @click="isMobileMenuOpen = false" 
              class="sidebar-link px-3 py-2 gap-2.5" 
              active-class="sidebar-link-active"
            >
              <Icon :name="link.icon" class="w-4.5 h-4.5 shrink-0" />
              <span class="text-[13px] font-semibold">{{ link.fullLabel }}</span>
            </NuxtLink>
          </div>
        </nav>

        <div class="p-4 border-t border-slate-100 space-y-3">
          <div class="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center gap-3">
            <div class="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-xs font-black text-white">
              {{ authStore.user?.name?.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-slate-900 text-xs font-bold truncate">{{ authStore.user?.name }}</p>
              <p class="text-slate-500 text-[9px] uppercase font-black tracking-widest">{{ authStore.user?.role?.replace('_', ' ') }}</p>
            </div>
          </div>
          
          <button @click="authStore.logout()" class="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 text-xs font-bold">
            <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Mobile Bottom Sheet Backdrop -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="isBottomNavExpanded" @click="isBottomNavExpanded = false" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"></div>
    </Transition>

    <!-- Main Content -->
    <div 
      :class="[
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64',
        'flex-1 min-h-screen flex flex-col min-w-0 w-full overflow-x-hidden transition-all duration-300 ease-in-out'
      ]"
    >
      <!-- Mobile Top Bar -->
      <header class="lg:hidden bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between sticky top-0 z-40">
        <div class="flex items-center gap-3">
          <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="w-10 h-10 flex items-center justify-center text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <Icon :name="isMobileMenuOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="w-6 h-6" />
          </button>
          <div class="h-8 w-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center">
            <img src="/logo.png" alt="AFC Logo" class="h-5 w-auto object-contain" />
          </div>
          <span class="font-black text-slate-900 text-sm tracking-tight">AFC Admin</span>
        </div>
        <button @click="authStore.logout()" class="w-10 h-10 flex items-center justify-center text-slate-500 btn-icon-action">
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-6 h-6" />
        </button>
      </header>

      <!-- Expandable / Collapsible Mobile Bottom Nav -->
      <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 p-2 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.12)] transition-all duration-300">
        <!-- Toggle Header -->
        <div class="flex items-center justify-between px-2 pb-1.5 border-b border-slate-100 mb-1">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {{ isBottomNavExpanded ? 'All Modules (' + filteredNavLinks.length + ')' : 'Quick Menu' }}
          </span>
          <button @click="isBottomNavExpanded = !isBottomNavExpanded" class="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-wider">
            <span>{{ isBottomNavExpanded ? 'Drop Down' : 'Push Up' }}</span>
            <Icon :name="isBottomNavExpanded ? 'heroicons:chevron-down' : 'heroicons:chevron-up'" class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Collapsed View (Single Row: 4 Shortcuts + More Button) -->
        <div v-if="!isBottomNavExpanded" class="grid grid-cols-5 gap-1">
          <NuxtLink v-for="link in primaryNavLinks" :key="link.to" :to="link.to" :exact="link.exact" 
            class="flex flex-col items-center justify-center py-1.5 px-0.5 text-slate-400 transition-all duration-200 rounded-lg hover:bg-slate-50 min-h-[44px]" 
            active-class="text-blue-600 bg-blue-50/80 font-bold scale-105 shadow-sm">
            <Icon :name="link.icon" class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-tight mt-0.5 text-center leading-tight truncate w-full px-0.5">{{ link.label }}</span>
          </NuxtLink>
          
          <button @click="isBottomNavExpanded = true" 
            class="flex flex-col items-center justify-center py-1.5 px-0.5 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all duration-200 rounded-lg min-h-[44px]">
            <Icon name="heroicons:chevron-up" class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-tight mt-0.5 text-center leading-tight truncate w-full px-0.5">More</span>
          </button>
        </div>

        <!-- Expanded View (Pushed Up Full Grid of ALL Modules) -->
        <div v-else class="grid grid-cols-5 gap-1 animate-fade-in py-1">
          <NuxtLink v-for="link in filteredNavLinks" :key="link.to" :to="link.to" :exact="link.exact" 
            class="flex flex-col items-center justify-center py-1.5 px-0.5 text-slate-400 transition-all duration-200 rounded-lg hover:bg-slate-50 min-h-[44px]" 
            active-class="text-blue-600 bg-blue-50/80 font-bold scale-105 shadow-sm">
            <Icon :name="link.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
            <span class="text-[8px] sm:text-[9px] font-black uppercase tracking-tight mt-0.5 text-center leading-tight truncate w-full px-0.5">{{ link.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <main :class="[
        'flex-1 animate-fade-in w-full min-w-0 overflow-x-hidden',
        route.meta.fullWidth ? 'h-full flex flex-col' : (isBottomNavExpanded ? 'p-2 sm:p-6 lg:p-8 pb-56 lg:pb-8' : 'p-2 sm:p-6 lg:p-8 pb-28 lg:pb-8')
      ]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const isMobileMenuOpen = ref(false)
const isBottomNavExpanded = ref(false)
const isCollapsed = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('admin_sidebar_collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  }
})

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed.value))
  }
}

// Close menu and drawer on route navigation
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
  isBottomNavExpanded.value = false
})

interface NavItem {
  to: string
  icon: string
  label: string
  fullLabel: string
  exact?: boolean
  roles: string[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Operations',
    items: [
      { to: '/admin', icon: 'heroicons:squares-2x2', label: 'Home', fullLabel: 'Dashboard', exact: true, roles: ['super_admin', 'admin', 'admin_delivery', 'admin_reporter', 'administrator', 'superadmin', 'salesman', 'delivery', 'asm', 'sale_admin', 'sale admin'] },
      { to: '/order/new', icon: 'heroicons:plus-circle', label: 'New', fullLabel: 'New Order', roles: ['super_admin', 'admin', 'admin_delivery', 'administrator', 'superadmin', 'sale_admin', 'sale admin', 'asm'] },
      { to: '/admin/orders', icon: 'heroicons:clipboard-document-list', label: 'Orders', fullLabel: 'Orders', roles: ['super_admin', 'admin', 'admin_delivery', 'admin_reporter', 'administrator', 'superadmin', 'sale_admin', 'sale admin'] },
    ]
  },
  {
    title: 'Logistics',
    items: [
      { to: '/admin/inventory', icon: 'heroicons:rectangle-stack', label: 'Pack', fullLabel: 'Inventory Arrangement', roles: ['super_admin', 'admin', 'admin_delivery', 'admin_reporter', 'administrator', 'superadmin'] },
      { to: '/admin/deliveries/map', icon: 'heroicons:truck', label: 'Deliver', fullLabel: 'Delivery Arrangement', roles: ['super_admin', 'admin', 'admin_delivery', 'administrator', 'superadmin'] },
      { to: '/admin/deliveries/plans', icon: 'heroicons:list-bullet', label: 'Plans', fullLabel: 'Delivery Plans', roles: ['super_admin', 'admin', 'admin_delivery', 'administrator', 'superadmin'] },
    ]
  },
  {
    title: 'Sales & Tracking',
    items: [
      { to: '/asm', icon: 'heroicons:user-group', label: 'ASM Panel', fullLabel: 'ASM Panel', roles: ['super_admin', 'admin', 'superadmin', 'administrator', 'asm'] },
      { to: '/admin/sales-tracking', icon: 'heroicons:map-pin', label: 'Track', fullLabel: 'Sales Tracking', roles: ['super_admin', 'admin', 'admin_delivery', 'admin_reporter', 'administrator', 'superadmin', 'asm'] },
      { to: '/admin/kpi-sales', icon: 'heroicons:currency-dollar', label: 'KPI Sale', fullLabel: 'KPI Sales', roles: ['super_admin', 'admin', 'admin_delivery', 'admin_reporter', 'administrator', 'superadmin', 'sale_admin', 'sale admin', 'asm'] },
      { to: '/admin/reports', icon: 'heroicons:chart-bar-square', label: 'Stats', fullLabel: 'Reports', roles: ['super_admin', 'admin', 'admin_reporter', 'administrator', 'superadmin', 'sale_admin', 'sale admin'] },
    ]
  },
  {
    title: 'Master Catalog',
    items: [
      { to: '/admin/products', icon: 'heroicons:cube', label: 'Items', fullLabel: 'Products', roles: ['super_admin', 'admin', 'admin_delivery', 'administrator', 'superadmin', 'sale_admin', 'sale admin'] },
      { to: '/admin/stores', icon: 'heroicons:building-storefront', label: 'Stores', fullLabel: 'Stores', roles: ['super_admin', 'admin', 'admin_reporter', 'administrator', 'superadmin', 'delivery', 'admin_delivery'] },
      { to: '/admin/trade-classes', icon: 'heroicons:tag', label: 'Trade', fullLabel: 'Trade Classes', roles: ['super_admin', 'admin', 'administrator', 'superadmin'] },
    ]
  },
  {
    title: 'System & Security',
    items: [
      { to: '/admin/users', icon: 'heroicons:users', label: 'Team', fullLabel: 'Users', roles: ['super_admin', 'admin', 'administrator', 'superadmin'] },
      { to: '/admin/system-logs', icon: 'heroicons:shield-check', label: 'Monitor', fullLabel: 'System Monitor', roles: ['super_admin', 'admin', 'administrator', 'superadmin'] },
      { to: '/admin/settings', icon: 'heroicons:cog-6-tooth', label: 'Settings', fullLabel: 'Settings', roles: ['super_admin', 'admin', 'administrator', 'superadmin'] },
    ]
  },
]

function isLinkAllowed(link: NavItem): boolean {
  if (authStore.isSuperAdmin) return true
  const userRole = authStore.user?.role?.toLowerCase() || ''
  if (link.roles.includes('any')) return true
  if (link.roles.includes(userRole)) return true
  if (authStore.isAdmin && link.roles.includes('admin')) return true
  if (authStore.isSaleAdmin && link.roles.includes('sale_admin')) return true
  if (authStore.isAdminDelivery && link.roles.includes('admin_delivery')) return true
  if (authStore.isAdminReporter && link.roles.includes('admin_reporter')) return true
  if (authStore.isAsm && link.roles.includes('asm')) return true
  return false
}

const filteredNavGroups = computed(() => {
  return navGroups.map(group => ({
    title: group.title,
    items: group.items.filter(isLinkAllowed)
  })).filter(group => group.items.length > 0)
})

const filteredNavLinks = computed(() => {
  return filteredNavGroups.value.flatMap(group => group.items)
})

const primaryNavLinks = computed(() => filteredNavLinks.value.slice(0, 4))

if (process.client) {
  console.log('AUTH_DEBUG - User:', JSON.stringify(authStore.user))
  console.log('AUTH_DEBUG - isSuperAdmin:', authStore.isSuperAdmin)
  console.log('AUTH_DEBUG - isAdminDelivery:', authStore.isAdminDelivery)
  console.log('AUTH_DEBUG - isAdmin:', authStore.isAdmin)
  if (!authStore.isLoggedIn) {
    navigateTo('/login')
  }
}
</script>

<style scoped>
.sidebar-link {
  @apply flex items-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/75 transition-all duration-200 text-xs font-semibold;
}
.sidebar-link-active {
  @apply text-blue-600 bg-blue-50/90 font-bold border border-blue-100/80 shadow-sm;
}
.sidebar-link-active :deep(svg),
.sidebar-link-active :deep(span) {
  @apply text-blue-600 font-bold;
}
.custom-scrollbar::-webkit-scrollbar {
  height: 3px;
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  @apply bg-transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 rounded-full;
}
</style>

