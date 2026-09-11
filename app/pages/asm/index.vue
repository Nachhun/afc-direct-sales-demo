<template>
  <div class="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-12">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center justify-between w-full md:w-auto">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 glass-panel rounded-xl flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="AFC Logo" class="h-8 w-auto object-contain" />
            </div>
            <div>
              <h1 class="text-xl sm:text-2xl font-black tracking-wider uppercase text-blue-600">Area Sales Manager</h1>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                Hello, {{ authStore.user?.name || 'Manager' }} | Sales Rep Tracking Panel
              </p>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
          <NuxtLink to="/admin" class="px-3 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 active:scale-[0.98] hover:-translate-y-0.5 whitespace-nowrap">
            <Icon name="heroicons:squares-2x2" class="w-4 h-4" />
            <span>Dashboard</span>
          </NuxtLink>
          <NuxtLink to="/admin/sales-tracking" class="px-3 py-2 sm:px-5 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 active:scale-[0.98] hover:-translate-y-0.5 whitespace-nowrap">
            <Icon name="heroicons:map" class="w-4 h-4" />
            <span>Sales Tracking</span>
          </NuxtLink>
          <NuxtLink to="/order/new" class="px-3 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-blue-600/25 flex items-center gap-1.5 active:scale-[0.98] hover:-translate-y-0.5 whitespace-nowrap">
            <Icon name="heroicons:plus-circle" class="w-4 h-4" />
            <span>New Order</span>
          </NuxtLink>
          <button @click="fetchData" class="p-2 sm:p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 border border-slate-200 transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5 shadow-sm shrink-0" title="Refresh Dashboard">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 sm:w-5 sm:h-5" :class="{ 'animate-spin': loading }" />
          </button>
          <button @click="authStore.logout()" class="px-3 py-2 sm:px-5 sm:py-2.5 bg-red-50 hover:bg-red-100 rounded-xl text-red-650 text-[10px] sm:text-xs font-black uppercase tracking-widest border border-red-200 transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5 shadow-sm whitespace-nowrap">
            Logout
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-5 sm:px-6 sm:py-8 space-y-8 animate-fade-in">
      <!-- Error State -->
      <div v-if="error" class="bg-red-950/20 border border-red-900/50 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-12">
        <div class="w-12 h-12 bg-red-950 text-red-500 rounded-xl flex items-center justify-center mx-auto border border-red-800/40 shadow-lg shadow-red-500/10">
          <Icon name="heroicons:exclamation-triangle" class="w-6 h-6" />
        </div>
        <div class="space-y-2">
          <h3 class="font-black uppercase tracking-wider text-red-400 text-sm">Failed to Load Dashboard</h3>
          <p class="text-xs text-slate-400 font-medium leading-relaxed">{{ error }}</p>
        </div>
        <button @click="fetchData" class="px-5 py-2.5 bg-red-900/60 hover:bg-red-850 rounded-xl text-white text-xs font-black uppercase tracking-widest border border-red-800/50 transition-all duration-300 shadow-sm active:scale-95">
          Retry Connection
        </button>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading && !dashboardData" class="flex flex-col items-center justify-center py-32 space-y-4">
        <Icon name="heroicons:arrow-path" class="w-12 h-12 text-blue-600 animate-spin" />
        <p class="text-sm text-slate-550 font-black uppercase tracking-wider">Loading ASM Dashboard Analytics...</p>
      </div>
 
      <div v-else-if="dashboardData" class="space-y-8">
        <!-- KPI Cards Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <!-- Total Revenue -->
          <div @click="activeTab = 'orders'" class="glass-card hover:bg-slate-50 active:scale-[0.98] cursor-pointer relative overflow-hidden group border-slate-100 flex flex-col justify-between min-h-[110px] transition-all duration-300 hover:-translate-y-1 shadow-sm col-span-2 sm:col-span-1">
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Icon name="heroicons:currency-dollar" class="w-20 h-20 text-blue-500" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Revenue</p>
              </div>
              <p class="text-xl sm:text-2xl font-black text-blue-600 mt-3">${{ formatCurrency(dashboardData.total_revenue) }}</p>
            </div>
            <p class="text-[9px] text-slate-400 mt-2 uppercase font-bold">Excludes Cancelled</p>
          </div>
 
          <!-- Sales Reps -->
          <div @click="activeTab = 'sales_reps'" class="glass-card hover:bg-slate-50 active:scale-[0.98] cursor-pointer relative overflow-hidden group border-slate-100 flex flex-col justify-between min-h-[110px] transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Icon name="heroicons:users" class="w-20 h-20 text-purple-500" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sales Reps</p>
              </div>
              <p class="text-xl sm:text-2xl font-black text-purple-650 mt-3">{{ dashboardData.sales_reps?.length || 0 }} Reps</p>
            </div>
            <p class="text-[9px] text-slate-400 mt-2 uppercase font-bold">Active in field</p>
          </div>
 
          <!-- Total Provinces -->
          <div @click="activeTab = 'map'" class="glass-card hover:bg-slate-50 active:scale-[0.98] cursor-pointer relative overflow-hidden group border-slate-100 flex flex-col justify-between min-h-[110px] transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Icon name="heroicons:map-pin" class="w-20 h-20 text-emerald-500" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Provinces</p>
              </div>
              <p class="text-xl sm:text-2xl font-black text-emerald-650 mt-3">{{ dashboardData.total_provinces }} Areas</p>
            </div>
            <p class="text-[9px] text-slate-400 mt-2 uppercase font-bold">Covered Geography</p>
          </div>
 
          <!-- Total Outlets -->
          <div @click="activeTab = 'map'" class="glass-card hover:bg-slate-50 active:scale-[0.98] cursor-pointer relative overflow-hidden group border-slate-100 flex flex-col justify-between min-h-[110px] transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-pink-500 to-rose-500"></div>
            <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Icon name="heroicons:building-storefront" class="w-20 h-20 text-pink-500" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Outlets</p>
              </div>
              <p class="text-xl sm:text-2xl font-black text-pink-600 mt-3">{{ dashboardData.total_stores }} Stores</p>
            </div>
            <p class="text-[9px] text-slate-400 mt-2 uppercase font-bold">Registered Profiles</p>
          </div>
 
          <!-- Total Customers -->
          <div @click="activeTab = 'orders'" class="glass-card hover:bg-slate-50 active:scale-[0.98] cursor-pointer relative overflow-hidden group border-slate-100 flex flex-col justify-between min-h-[110px] transition-all duration-300 hover:-translate-y-1 shadow-sm">
            <div class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-yellow-500"></div>
            <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Icon name="heroicons:user-group" class="w-20 h-20 text-amber-500" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Customers</p>
              </div>
              <p class="text-xl sm:text-2xl font-black text-amber-600 mt-3">{{ dashboardData.total_customers }} Active</p>
            </div>
            <p class="text-[9px] text-slate-400 mt-2 uppercase font-bold">Placed orders</p>
          </div>
        </div>
 
        <!-- Navigation Tabs -->
        <div class="border-b border-slate-200 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          <button @click="activeTab = 'sales_reps'" :class="tabClass('sales_reps')">
            <Icon name="heroicons:users" class="w-4 h-4" />
            <span>Sales Representatives</span>
          </button>
          <button @click="activeTab = 'orders'" :class="tabClass('orders')">
            <Icon name="heroicons:list-bullet" class="w-4 h-4" />
            <span>Recent Orders</span>
          </button>
          <button @click="activeTab = 'map'" :class="tabClass('map')">
            <Icon name="heroicons:map" class="w-4 h-4" />
            <span>Store Mapping Network</span>
          </button>
        </div>

        <!-- Tab 1: Sales Representatives Performance -->
        <div v-if="activeTab === 'sales_reps'" class="card space-y-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
              <h2 class="text-sm font-black tracking-[0.2em] uppercase text-slate-700">Sales Representative Leaderboard</h2>
            </div>
            
            <div class="relative w-full md:w-80">
              <input v-model="repSearchQuery" type="text" class="input-field !pl-10 !pr-4 placeholder:text-slate-400 text-sm" placeholder="Search by name or Telegram..." />
              <Icon name="heroicons:magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <button v-if="repSearchQuery" @click="repSearchQuery = ''" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Desktop Leaderboard Table -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                  <th class="py-3 px-4">Rank</th>
                  <th class="py-3 px-4">Sales Rep Name</th>
                  <th class="py-3 px-4">Telegram ID</th>
                  <th class="py-3 px-4">Total Orders</th>
                  <th class="py-3 px-4 text-right">Revenue Contributed</th>
                  <th class="py-3 px-4 text-right">Performance Ratio</th>
                  <th class="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(rep, index) in filteredSalesReps" :key="rep.id" 
                  @click="selectedRep = rep"
                  class="border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-300 cursor-pointer group">
                  <td class="py-4 px-4 font-black">
                    <span v-if="index === 0" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-black">🥇</span>
                    <span v-else-if="index === 1" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black">🥈</span>
                    <span v-else-if="index === 2" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-55 to-orange-65 bg-orange-50 text-orange-650 border border-orange-200 text-[10px] font-black">🥉</span>
                    <span v-else class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-400 border border-slate-200 text-[9px] font-bold">{{ Number(index) + 1 }}</span>
                  </td>
                  <td class="py-4 px-4 font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                    {{ rep.name }}
                  </td>
                  <td class="py-4 px-4 font-bold text-slate-600">{{ rep.telegram_id || 'N/A' }}</td>
                  <td class="py-4 px-4 font-bold text-slate-600">{{ rep.total_orders }} orders</td>
                  <td class="py-4 px-4 text-right font-black text-blue-600">${{ formatCurrency(rep.total_sales) }}</td>
                  <td class="py-4 px-4 text-right">
                    <div class="flex items-center justify-end gap-3">
                      <span class="font-bold text-slate-500 text-[10px]">{{ getRatio(rep.total_sales) }}%</span>
                      <div class="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                        <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full" :style="{ width: getRatio(rep.total_sales) + '%' }"></div>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-4 text-center">
                    <button type="button" 
                      @click.stop="selectedRep = rep"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 group-hover:bg-blue-600 group-hover:text-white rounded-xl text-slate-600 text-[10px] font-black uppercase tracking-wider transition-all duration-300 border border-slate-200 group-hover:border-blue-500 active:scale-95 shadow-sm"
                    >
                      <Icon name="heroicons:presentation-chart-line" class="w-3.5 h-3.5" />
                      <span>Analyze</span>
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredSalesReps.length === 0">
                  <td colspan="7" class="py-12 text-center text-slate-400 uppercase font-black tracking-widest">
                    <Icon name="heroicons:users" class="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No Sales Representatives Found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Leaderboard Card List -->
          <div class="md:hidden space-y-3">
            <div v-for="(rep, index) in filteredSalesReps" :key="rep.id"
              @click="selectedRep = rep"
              class="bg-white border border-slate-150 rounded-2xl p-4 active:scale-[0.98] transition-all flex justify-between items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  :class="index === 0 ? 'bg-amber-50 text-amber-600 border border-amber-200' : index === 1 ? 'bg-slate-55 text-slate-600 border border-slate-200' : index === 2 ? 'bg-orange-50 text-orange-650 border border-orange-200' : 'bg-slate-50 text-slate-400 border border-slate-200'">
                  {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : Number(index) + 1 }}
                </div>
                <div>
                  <p class="font-black text-slate-900 text-sm">{{ rep.name }}</p>
                  <p class="text-[10px] text-slate-400 font-bold mt-0.5">TG: {{ rep.telegram_id || 'N/A' }} • {{ rep.total_orders }} orders</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="font-black text-blue-600 text-sm">${{ formatCurrency(rep.total_sales) }}</p>
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest">{{ getRatio(rep.total_sales) }}% Share</span>
              </div>
            </div>
            <div v-if="filteredSalesReps.length === 0" class="py-12 text-center text-slate-400 uppercase font-black tracking-widest">
              <Icon name="heroicons:users" class="w-8 h-8 mx-auto mb-2 text-slate-350" />
              No Sales Representatives Found
            </div>
          </div>
        </div>

        <!-- Tab 2: Recent Orders -->
        <div v-if="activeTab === 'orders'" class="card space-y-6">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <div class="w-1.5 h-5 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
              <h2 class="text-sm font-black tracking-[0.2em] uppercase text-slate-700">Sales Audit Order Stream</h2>
            </div>
            
            <!-- Filters Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- Search -->
              <div class="relative">
                <input v-model="orderSearchQuery" type="text" class="input-field !pl-10 !pr-4 placeholder:text-slate-400 text-sm" placeholder="Search orders, shops, reps..." />
                <Icon name="heroicons:magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <button v-if="orderSearchQuery" @click="orderSearchQuery = ''" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                  <Icon name="heroicons:x-mark" class="w-4 h-4" />
                </button>
              </div>
              
              <!-- Status Dropdown (Blueprint A style) -->
              <div class="relative">
                <select v-model="orderStatusFilter" class="input-field appearance-none !pl-10 !pr-10 text-sm cursor-pointer text-slate-900 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Icon name="heroicons:funnel" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Icon name="heroicons:chevron-down" class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-500" />
              </div>

              <!-- Date Dropdown (Blueprint A style) -->
              <div class="relative">
                <select v-model="orderDateFilter" class="input-field appearance-none !pl-10 !pr-10 text-sm cursor-pointer text-slate-900 bg-slate-50 border border-slate-200 rounded-xl">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
                <Icon name="heroicons:calendar" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Icon name="heroicons:chevron-down" class="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-500" />
              </div>
            </div>
          </div>

          <!-- Desktop Orders Table -->
          <div class="hidden sm:block overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                  <th class="py-3 px-4">SO/FO Numbers</th>
                  <th class="py-3 px-4">Salesman</th>
                  <th class="py-3 px-4">Shop Name</th>
                  <th class="py-3 px-4">Order Date</th>
                  <th class="py-3 px-4 text-right">Total Amount</th>
                  <th class="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in filteredOrders" :key="order.id" class="border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-300">
                  <td class="py-4 px-4 font-black">
                    <div class="flex flex-col">
                      <span class="text-slate-900">{{ order.so_number || 'No SO' }}</span>
                      <span class="text-[10px] text-slate-450 font-bold">FO: {{ order.fo_number || 'N/A' }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-4 font-bold text-slate-600">{{ order.salesman_name }}</td>
                  <td class="py-4 px-4 font-black text-slate-800">{{ order.shop_name }}</td>
                  <td class="py-4 px-4 text-slate-500 font-bold">{{ order.created_at }}</td>
                  <td class="py-4 px-4 text-right font-black text-blue-600">${{ formatCurrency(order.total_amount) }}</td>
                  <td class="py-4 px-4 text-center">
                    <div class="flex flex-col items-center gap-1">
                      <span :class="statusBadgeClass(order.status)">{{ order.status }}</span>
                      <span v-if="order.is_direct_sale" class="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        ⚡ Direct
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredOrders.length === 0">
                  <td colspan="6" class="py-12 text-center text-slate-400 uppercase font-black tracking-widest">
                    <Icon name="heroicons:inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No Orders Available Matching Filters
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Orders Card List -->
          <div class="sm:hidden space-y-3">
            <div v-for="order in filteredOrders" :key="order.id"
              class="bg-white border border-slate-150 rounded-2xl p-4 space-y-3">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-black text-slate-900 text-sm leading-tight">{{ order.shop_name }}</h4>
                  <p class="text-[10px] text-slate-450 font-bold mt-0.5">SO: {{ order.so_number || 'No SO' }} • FO: {{ order.fo_number || 'N/A' }}</p>
                </div>
                <div class="flex items-center gap-1 flex-wrap justify-end">
                  <span v-if="order.is_direct_sale" class="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    ⚡ Direct
                  </span>
                  <span :class="statusBadgeClass(order.status)">{{ order.status }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center pt-2.5 border-t border-slate-100">
                <div>
                  <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest">Sales Rep</p>
                  <p class="text-xs font-bold text-slate-650">{{ order.salesman_name }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] text-slate-450 font-bold">{{ order.created_at }}</p>
                  <p class="font-black text-blue-600 text-sm mt-0.5">${{ formatCurrency(order.total_amount) }}</p>
                </div>
              </div>
            </div>
            <div v-if="filteredOrders.length === 0" class="py-12 text-center text-slate-400 uppercase font-black tracking-widest">
              <Icon name="heroicons:inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No Orders Available Matching Filters
            </div>
          </div>
        </div>

        <!-- Tab 3: Stores Network Map -->
        <div v-show="activeTab === 'map'" class="space-y-4">
          <div class="card space-y-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center gap-2">
                <div class="w-1.5 h-5 bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"></div>
                <div>
                  <h2 class="text-sm font-black tracking-[0.2em] uppercase text-slate-700">Registered Store Locations Map</h2>
                  <p class="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">Visual map network coordinates of active stores</p>
                </div>
              </div>
              
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div class="relative w-full sm:w-64">
                  <input v-model="mapSearchQuery" type="text" class="input-field !pl-10 !pr-4 placeholder:text-slate-400 text-xs" placeholder="Find shop or customer ID..." />
                  <Icon name="heroicons:magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <button v-if="mapSearchQuery" @click="mapSearchQuery = ''" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                    <Icon name="heroicons:x-mark" class="w-4 h-4" />
                  </button>
                </div>
                
                <div class="flex gap-2 justify-center sm:justify-start">
                  <span class="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded-xl border border-blue-100">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> New Stores
                  </span>
                  <span class="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider rounded-xl border border-slate-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Regular Stores
                  </span>
                </div>
              </div>
            </div>
            
            <div id="map" class="w-full h-[320px] sm:h-[550px] rounded-2xl overflow-hidden border border-slate-200 shadow-lg z-10 bg-slate-50"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Rep Detail Modal -->
    <Teleport to="body">
      <div v-if="selectedRep" 
        class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
        @click.self="selectedRep = null"
      >
        <div class="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scale-in text-slate-900 relative">
          <!-- Modal Header -->
          <div class="p-6 sm:p-8 border-b border-slate-200 flex justify-between items-start gap-4 shrink-0 bg-slate-50 sticky top-0 backdrop-blur-md z-10">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg shadow-blue-500/20 border border-blue-400/20">
                {{ selectedRep.name?.charAt(0) }}
              </div>
              <div>
                <h3 class="text-xl font-black tracking-wide text-slate-900 uppercase">{{ selectedRep.name }}</h3>
                <p class="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">
                  {{ selectedRep.email || 'No email' }} | Telegram: {{ selectedRep.telegram_id || 'N/A' }}
                </p>
              </div>
            </div>
            <button type="button" @click="selectedRep = null" class="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-xl flex items-center justify-center transition-all duration-300 border border-slate-200 hover:scale-105 active:scale-95 shadow-sm">
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 sm:p-8 space-y-8 overflow-y-auto flex-1 no-scrollbar">
            <!-- Stats Cards Grid -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div class="glass-card border-slate-100 relative overflow-hidden group hover:bg-slate-50 transition-all duration-300 min-h-[90px] p-5 rounded-2xl">
                <div class="absolute top-0 left-0 right-0 h-[2px] bg-blue-500"></div>
                <div class="absolute -right-3 -bottom-3 opacity-5">
                  <Icon name="heroicons:currency-dollar" class="w-16 h-16 text-blue-500" />
                </div>
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Contributed Sales</p>
                <p class="text-xl font-black text-blue-600 mt-2">${{ formatCurrency(selectedRep.total_sales) }}</p>
                <p class="text-[9px] text-slate-400 mt-1 uppercase font-bold">{{ getRatio(selectedRep.total_sales) }}% of total revenue</p>
              </div>

              <div class="glass-card border-slate-100 relative overflow-hidden group hover:bg-slate-50 transition-all duration-300 min-h-[90px] p-5 rounded-2xl">
                <div class="absolute top-0 left-0 right-0 h-[2px] bg-purple-500"></div>
                <div class="absolute -right-3 -bottom-3 opacity-5">
                  <Icon name="heroicons:shopping-cart" class="w-16 h-16 text-purple-500" />
                </div>
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Orders</p>
                <p class="text-xl font-black text-purple-650 mt-2">{{ selectedRep.total_orders }} Orders</p>
                <p class="text-[9px] text-slate-400 mt-1 uppercase font-bold">Placed to date</p>
              </div>

              <div class="glass-card border-slate-100 relative overflow-hidden group hover:bg-slate-50 transition-all duration-300 min-h-[90px] p-5 rounded-2xl">
                <div class="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500"></div>
                <div class="absolute -right-3 -bottom-3 opacity-5">
                  <Icon name="heroicons:presentation-chart-line" class="w-16 h-16 text-emerald-550" />
                </div>
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Average Ticket</p>
                <p class="text-xl font-black text-emerald-650 mt-2">${{ formatCurrency(selectedRep.total_orders > 0 ? selectedRep.total_sales / selectedRep.total_orders : 0) }}</p>
                <p class="text-[9px] text-slate-400 mt-1 uppercase font-bold">Per order average</p>
              </div>

              <div class="glass-card border-slate-100 relative overflow-hidden group hover:bg-slate-50 transition-all duration-300 min-h-[90px] p-5 rounded-2xl">
                <div class="absolute top-0 left-0 right-0 h-[2px] bg-amber-500"></div>
                <div class="absolute -right-3 -bottom-3 opacity-5">
                  <Icon name="heroicons:trophy" class="w-16 h-16 text-amber-500" />
                </div>
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Team Rank</p>
                <p class="text-xl font-black text-amber-600 mt-2">Rank #{{ getRepRank(selectedRep.id) }}</p>
                <p class="text-[9px] text-slate-400 mt-1 uppercase font-bold">Out of {{ dashboardData.sales_reps?.length || 0 }} reps</p>
              </div>
            </div>

            <!-- Extra Info Card -->
            <div class="bg-slate-50 border border-slate-150 rounded-2xl p-5 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Top Selling Outlet</p>
                <p class="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5">
                  <Icon name="heroicons:building-storefront" class="w-4 h-4 text-blue-600" />
                  {{ selectedRepTopOutlet }}
                </p>
              </div>
              <div class="sm:text-right">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Performance Category</p>
                <span class="inline-block px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider mt-1">
                  {{ getRatio(selectedRep.total_sales) >= 50 ? 'Elite Contributor' : getRatio(selectedRep.total_sales) >= 20 ? 'Strong Performer' : 'Core Representative' }}
                </span>
              </div>
            </div>

            <!-- Rep Orders Table -->
            <div class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h4 class="text-xs font-black tracking-widest uppercase text-slate-550 flex items-center gap-2">
                  <Icon name="heroicons:list-bullet" class="w-4 h-4 text-slate-500" />
                  <span>Orders Registered by {{ selectedRep.name }} (Last 100 Stream)</span>
                </h4>
                
                <div class="relative w-full sm:w-64">
                  <input v-model="modalOrderSearchQuery" type="text" class="input-field !pl-10 !pr-4 placeholder:text-slate-400 text-xs" placeholder="Search rep orders..." />
                  <Icon name="heroicons:magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <button v-if="modalOrderSearchQuery" @click="modalOrderSearchQuery = ''" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                    <Icon name="heroicons:x-mark" class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <!-- Desktop Modal Orders Table -->
              <div class="hidden sm:block overflow-x-auto border border-slate-200 rounded-2xl">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
                      <th class="py-3 px-4">SO/FO Numbers</th>
                      <th class="py-3 px-4">Shop Name</th>
                      <th class="py-3 px-4">Order Date</th>
                      <th class="py-3 px-4 text-right">Total Amount</th>
                      <th class="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="order in filteredSelectedRepOrders" :key="order.id" class="border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-300">
                      <td class="py-4 px-4 font-black">
                        <div class="flex flex-col">
                          <span class="text-slate-900">{{ order.so_number || 'No SO' }}</span>
                          <span class="text-[10px] text-slate-450 font-bold">FO: {{ order.fo_number || 'N/A' }}</span>
                        </div>
                      </td>
                      <td class="py-4 px-4 font-black text-slate-800">{{ order.shop_name }}</td>
                      <td class="py-4 px-4 text-slate-500 font-bold">{{ order.created_at }}</td>
                      <td class="py-4 px-4 text-right font-black text-blue-600">${{ formatCurrency(order.total_amount) }}</td>
                      <td class="py-4 px-4 text-center">
                        <span :class="statusBadgeClass(order.status)">{{ order.status }}</span>
                      </td>
                    </tr>
                    <tr v-if="filteredSelectedRepOrders.length === 0">
                      <td colspan="5" class="py-12 text-center text-slate-400 uppercase font-black tracking-widest">
                        <Icon name="heroicons:inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No Recent Orders Found for this Rep
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Modal Orders Card List -->
              <div class="sm:hidden space-y-3">
                <div v-for="order in filteredSelectedRepOrders" :key="order.id"
                  class="bg-white border border-slate-150 rounded-2xl p-4 space-y-3">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-black text-slate-900 text-sm leading-tight">{{ order.shop_name }}</h4>
                      <p class="text-[10px] text-slate-450 font-bold mt-0.5">SO: {{ order.so_number || 'No SO' }} • FO: {{ order.fo_number || 'N/A' }}</p>
                    </div>
                    <span :class="statusBadgeClass(order.status)">{{ order.status }}</span>
                  </div>
                  <div class="flex justify-between items-center pt-2.5 border-t border-slate-100 text-[10px]">
                    <span class="text-slate-500 font-bold">{{ order.created_at }}</span>
                    <span class="font-black text-blue-600">${{ formatCurrency(order.total_amount) }}</span>
                  </div>
                </div>
                <div v-if="filteredSelectedRepOrders.length === 0" class="py-12 text-center text-slate-400 uppercase font-black tracking-widest">
                  <Icon name="heroicons:inbox" class="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No Recent Orders Found for this Rep
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({
  middleware: 'auth',
  layout: false
})

const authStore = useAuthStore()
const api = useApi()

const loading = ref(false)
const dashboardData = ref<any>(null)
const activeTab = ref('sales_reps')

const selectedRep = ref<any>(null)

// Search & Filtering State Variables
const repSearchQuery = ref('')
const orderSearchQuery = ref('')
const orderStatusFilter = ref('')
const orderDateFilter = ref('all')
const mapSearchQuery = ref('')
const modalOrderSearchQuery = ref('')

// Reset modal search query when a different representative is selected
watch(selectedRep, () => {
  modalOrderSearchQuery.value = ''
})

// Computed Leaderboard list filtered by search query
const filteredSalesReps = computed(() => {
  if (!dashboardData.value?.sales_reps) return []
  const query = repSearchQuery.value.toLowerCase().trim()
  if (!query) return dashboardData.value.sales_reps
  return dashboardData.value.sales_reps.filter((rep: any) => 
    rep.name?.toLowerCase().includes(query) || 
    rep.telegram_id?.toString().includes(query) ||
    rep.email?.toLowerCase().includes(query)
  )
})

// Computed Recent Orders stream filtered by search, status, and date range
const filteredOrders = computed(() => {
  if (!dashboardData.value?.recent_orders) return []
  let list = dashboardData.value.recent_orders

  // 1. Search Query
  const query = orderSearchQuery.value.toLowerCase().trim()
  if (query) {
    list = list.filter((o: any) => 
      o.shop_name?.toLowerCase().includes(query) ||
      o.salesman_name?.toLowerCase().includes(query) ||
      o.so_number?.toLowerCase().includes(query) ||
      o.fo_number?.toLowerCase().includes(query)
    )
  }

  // 2. Status Filter
  if (orderStatusFilter.value) {
    list = list.filter((o: any) => o.status?.toLowerCase() === orderStatusFilter.value.toLowerCase())
  }

  // 3. Date Filter
  if (orderDateFilter.value !== 'all') {
    const now = new Date()
    list = list.filter((o: any) => {
      if (!o.created_at) return false
      const orderDate = new Date(o.created_at)
      const diffMs = now.getTime() - orderDate.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      
      if (orderDateFilter.value === 'today') {
        return orderDate.toDateString() === now.toDateString()
      } else if (orderDateFilter.value === 'week') {
        return diffDays <= 7
      } else if (orderDateFilter.value === 'month') {
        return diffDays <= 30
      }
      return true
    })
  }

  return list
})

const selectedRepOrders = computed(() => {
  if (!selectedRep.value || !dashboardData.value?.recent_orders) return []
  return dashboardData.value.recent_orders.filter(
    (order: any) => order.salesman_name === selectedRep.value.name
  )
})

const filteredSelectedRepOrders = computed(() => {
  const orders = selectedRepOrders.value
  if (orders.length === 0) return []
  const query = modalOrderSearchQuery.value.toLowerCase().trim()
  if (!query) return orders
  return orders.filter((o: any) => 
    o.shop_name?.toLowerCase().includes(query) ||
    o.so_number?.toLowerCase().includes(query) ||
    o.fo_number?.toLowerCase().includes(query)
  )
})

const selectedRepTopOutlet = computed(() => {
  const orders = selectedRepOrders.value
  if (orders.length === 0) return 'None'
  const storeTotals: Record<string, number> = {}
  orders.forEach((o: any) => {
    storeTotals[o.shop_name] = (storeTotals[o.shop_name] || 0) + o.total_amount
  })
  let topStore = 'None'
  let maxSales = 0
  for (const [store, total] of Object.entries(storeTotals)) {
    if (total > maxSales) {
      maxSales = total
      topStore = store
    }
  }
  return topStore
})

const getRepRank = (repId: number) => {
  if (!dashboardData.value?.sales_reps) return 0
  return dashboardData.value.sales_reps.findIndex((r: any) => r.id === repId) + 1
}

// Map objects
let map: any = null
let markerGroup: any = null

const error = ref('')

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/asm/dashboard')
    dashboardData.value = res
    if (activeTab.value === 'map') {
      await nextTick()
      initMap()
    }
  } catch (e: any) {
    console.error('Failed to load dashboard data', e)
    error.value = e?.message || e?.data?.message || e?.statusText || 'Unable to communicate with the direct sales server. Please check your credentials or network link.'
  } finally {
    loading.value = false
  }
}

function formatCurrency(val?: number) {
  if (val === undefined || isNaN(val)) return '0.00'
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getRatio(repSales: number): number {
  if (!dashboardData.value?.total_revenue) return 0
  const ratio = (repSales / dashboardData.value.total_revenue) * 100
  return Math.round(ratio)
}

function tabClass(tab: string) {
  return [
    'px-5 py-2.5 font-black uppercase text-xs tracking-widest transition-all duration-300 rounded-xl border flex items-center gap-2 active:scale-95 whitespace-nowrap',
    activeTab.value === tab
      ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/5'
      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300'
  ]
}

function statusBadgeClass(status?: string) {
  const norm = status?.toLowerCase() || ''
  const base = 'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border transition-all duration-300'
  if (norm === 'completed') return `${base} bg-emerald-50 border-emerald-100 text-emerald-600`
  if (norm === 'cancelled') return `${base} bg-red-50 border-red-100 text-red-650`
  return `${base} bg-amber-50 border-amber-100 text-amber-600`
}

async function initMap() {
  if (!process.client || !dashboardData.value?.stores) return

  // Destroy if exists
  if (map) {
    map.remove()
    map = null
  }

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  })

  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
  })

  map = L.map('map', {
    zoomControl: true,
    attributionControl: false,
    layers: [lightLayer]
  }).setView([11.5564, 104.9282], 12)

  const baseMaps = {
    "Light Map": lightLayer,
    "Satellite View": satelliteLayer
  }

  L.control.layers(baseMaps, undefined, { position: 'topright' }).addTo(map)

  markerGroup = L.featureGroup().addTo(map)
  updateMapMarkers()
}

async function updateMapMarkers() {
  if (!map || !markerGroup) return
  const L = await import('leaflet')
  markerGroup.clearLayers()

  const rawStores = dashboardData.value.stores || []
  const query = mapSearchQuery.value.toLowerCase().trim()

  const filteredStores = rawStores.filter((store: any) => {
    if (!query) return true
    return store.shop_name?.toLowerCase().includes(query) ||
           store.customer_id?.toString().toLowerCase().includes(query) ||
           store.address_line?.toLowerCase().includes(query)
  })

  filteredStores.forEach((store: any) => {
    if (!store.latitude || !store.longitude) return

    const color = store.is_new_store ? '#2563eb' : '#64748b'
    const markerHtml = `
      <div style="
        background-color: ${color};
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      "></div>
    `

    const icon = L.divIcon({
      html: markerHtml,
      className: 'custom-map-marker',
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })

    const popupHtml = `
      <div class="p-4 space-y-2 bg-white text-slate-900 rounded-2xl min-w-[200px] border border-slate-100" style="font-family: inherit;">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">Customer ID: ${store.customer_id || 'N/A'}</p>
        <h3 class="text-xs font-black text-blue-600 uppercase tracking-wide">${store.shop_name}</h3>
        <p class="text-[10px] text-slate-650 font-bold mt-1">${store.address_line || 'No address'}</p>
        <p class="text-[9px] text-slate-500 mt-1 font-bold">Contact: ${store.contact || 'N/A'}</p>
        <span class="inline-block mt-2 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md ${
          store.is_new_store
            ? 'bg-blue-50 text-blue-600 border border-blue-100'
            : 'bg-slate-50 text-slate-400 border border-slate-200'
        }">${store.is_new_store ? 'New Store' : 'Regular'}</span>
      </div>
    `

    const marker = L.marker([store.latitude, store.longitude], { icon })
      .bindPopup(popupHtml, {
        className: 'glass-popup-container',
        offset: [0, -5]
      })

    markerGroup.addLayer(marker)
  })

  // Fit bounds if markers exist
  if (markerGroup.getLayers().length > 0) {
    try {
      map.fitBounds(markerGroup.getBounds(), { padding: [50, 50], maxZoom: 15 })
    } catch (e) {
      console.warn('Map bounds fit error', e)
    }
  }
}

// Watch tab changes to initialize the map if the tab switches to map
watch(activeTab, (newTab) => {
  if (newTab === 'map') {
    nextTick().then(() => {
      initMap()
    })
  }
})

// Watch mapSearchQuery to update markers
watch(mapSearchQuery, () => {
  updateMapMarkers()
})

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (map) {
    map.remove()
  }
})
</script>

<style>
.custom-map-marker {
  background: none !important;
  border: none !important;
}

.glass-popup-container .leaflet-popup-content-wrapper {
  background: white !important;
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.glass-popup-container .leaflet-popup-content {
  margin: 0;
}

.glass-popup-container .leaflet-popup-tip {
  background: white !important;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
