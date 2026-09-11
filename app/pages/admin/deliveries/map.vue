<template>
  <div class="h-[calc(100vh-20px)] flex flex-col pb-2 gap-2">
    <!-- Row 1: Header + Stats + Actions -->
    <div class="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between shrink-0">
      <div class="flex items-center gap-6">
        <h1 class="text-xl font-black text-slate-800 leading-none">Live Map</h1>
        
        <div class="hidden md:flex gap-4 border-l border-slate-200 pl-6">
          <div>
            <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Mapped</p>
            <p class="text-base font-black text-slate-900 leading-none mt-1">{{ markersCount }}</p>
          </div>
          <div v-if="missingGpsCount > 0" class="border-l border-slate-100 pl-4">
            <p class="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none">No GPS</p>
            <p class="text-base font-black text-amber-600 leading-none mt-1">{{ missingGpsCount }}</p>
          </div>
          <div class="border-l border-slate-100 pl-4">
            <p class="text-[8px] font-black text-red-500 uppercase tracking-widest leading-none">Closed</p>
            <p class="text-base font-black text-red-600 leading-none mt-1">{{ shopClosedCount }}</p>
          </div>
          <div class="border-l border-slate-100 pl-4">
            <p class="text-[8px] font-black text-orange-500 uppercase tracking-widest leading-none">Issue</p>
            <p class="text-base font-black text-orange-600 leading-none mt-1">{{ issueCount }}</p>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="hidden lg:inline text-[9px] font-black uppercase text-slate-300 mr-2">Shape: 🚚 Courier | 📍 Order Point</span>
        
        <!-- Select Area (Box Selection) -->
        <button @click="toggleSelectAreaMode" 
          :class="activeDrawMode === 'area' ? 'bg-red-500 hover:bg-red-600 shadow-red-200 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-red-400'" 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shadow-sm">
          <Icon name="heroicons:stop" class="w-3.5 h-3.5" :class="activeDrawMode === 'area' ? 'text-white' : 'text-slate-400'" />
          <span class="text-[9px] font-black uppercase" :class="activeDrawMode === 'area' ? 'text-white' : ''">
            {{ activeDrawMode === 'area' ? 'Selecting...' : 'Select Area' }}
          </span>
        </button>

        <!-- Draw Route (Connect 1-to-1) -->
        <button @click="toggleDrawRouteMode" 
          :class="activeDrawMode === 'route' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200 text-white' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-orange-400'" 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shadow-sm">
          <Icon name="heroicons:pencil" class="w-3.5 h-3.5" :class="activeDrawMode === 'route' ? 'text-white' : 'text-orange-500'" />
          <span class="text-[9px] font-black uppercase" :class="activeDrawMode === 'route' ? 'text-white' : ''">
            {{ activeDrawMode === 'route' ? 'Connecting...' : 'Draw Route' }}
          </span>
        </button>

        <button @click="fetchLive(true)" class="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all">
          <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          <span class="text-[9px] font-black uppercase">Sync</span>
        </button>
        <!-- View Nav: Map → List → Plans -->
        <div class="flex items-center bg-slate-100 rounded-lg p-0.5">
          <span class="px-3 py-1.5 rounded-md text-[9px] font-black uppercase bg-slate-900 text-white shadow-sm">🗺 Map</span>
          <NuxtLink to="/admin/deliveries/plans" class="px-3 py-1.5 rounded-md text-[9px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all">📁 Plans</NuxtLink>
          <NuxtLink :to="{ path: '/admin/deliveries', query: { ...filters } }" class="px-3 py-1.5 rounded-md text-[9px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all">📋 List</NuxtLink>
        </div>
      </div>
    </div>

    <!-- Row 2: Filters -->
    <div class="bg-white px-3 py-2 rounded-2xl border border-slate-100 shadow-sm shrink-0">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 items-center">
        <!-- Date Type & Picker -->
        <div class="flex gap-1 lg:col-span-2">
          <div class="flex items-center bg-slate-100 rounded-lg p-0.5 h-7">
            <button v-for="type in [{ id: 'created_at', label: 'Order' }, { id: 'delivery_date', label: 'Req' }, { id: 'planned_delivery_date', label: 'Plan' }]" :key="type.id"
              @click="filters.date_type = type.id"
              :class="filters.date_type === type.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
              class="px-2 rounded-md text-[8px] font-black uppercase transition-all h-full">
              {{ type.label }}
            </button>
          </div>
          <input type="date" v-model="filters.delivery_date" class="bg-slate-50 border border-slate-200 rounded-lg px-2 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 flex-1 h-7" />
        </div>
        
        <select v-model="filters.province" @change="filters.districts = []; filters.communes = [];" class="bg-slate-50 border border-slate-200 rounded-lg px-2 h-7 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none">
          <option value="">All Provinces</option>
          <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
        </select>

        <div class="relative">
          <button @click="showDistrictDropdown = !showDistrictDropdown" :disabled="!filters.province"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 h-7 text-[10px] font-bold flex items-center justify-between disabled:opacity-50">
            <span class="truncate">{{ filters.districts.length ? filters.districts.length + ' Dist.' : 'All Districts' }}</span>
            <Icon name="heroicons:chevron-down" class="w-3 h-3 text-slate-400" />
          </button>
          <div v-if="showDistrictDropdown" class="absolute top-full left-0 right-0 z-[1100] mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-60 overflow-y-auto">
            <div class="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <span class="text-[9px] font-black uppercase text-slate-400">Districts</span>
              <button @click="showDistrictDropdown = false" class="text-slate-400"><Icon name="heroicons:x-mark" class="w-4 h-4" /></button>
            </div>
            <div class="space-y-1">
              <label v-for="d in districts" :key="d" class="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer">
                <input type="checkbox" :value="d" v-model="filters.districts" @change="filters.communes = []" class="rounded text-blue-600" />
                <span class="text-[10px] font-bold">{{ d }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="relative">
          <button @click="showCommuneDropdown = !showCommuneDropdown" :disabled="!filters.districts.length"
            class="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 h-7 text-[10px] font-bold flex items-center justify-between disabled:opacity-50">
            <span class="truncate">{{ filters.communes.length ? filters.communes.length + ' Comm.' : 'All Communes' }}</span>
            <Icon name="heroicons:chevron-down" class="w-3 h-3 text-slate-400" />
          </button>
          <div v-if="showCommuneDropdown" class="absolute top-full left-0 right-0 z-[1100] mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-60 overflow-y-auto">
            <div class="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
              <span class="text-[9px] font-black uppercase text-slate-400">Communes</span>
              <button @click="showCommuneDropdown = false" class="text-slate-400"><Icon name="heroicons:x-mark" class="w-4 h-4" /></button>
            </div>
            <div class="space-y-1">
              <label v-for="c in communes" :key="c" class="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer">
                <input type="checkbox" :value="c" v-model="filters.communes" class="rounded text-blue-600" />
                <span class="text-[10px] font-bold">{{ c }}</span>
              </label>
            </div>
          </div>
        </div>

        <select v-model="filters.delivery_plan_id" class="bg-slate-50 border border-slate-200 rounded-lg px-2 h-7 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none">
          <option value="">All Plans</option>
          <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>

        <select v-model="filters.status" class="bg-slate-50 border border-slate-200 rounded-lg px-2 h-7 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/10 appearance-none">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="shop_closed">Shop Closed</option>
          <option value="customer_cancelled">Customer Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Map Container -->
    <div class="relative w-full flex-1 min-h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <div id="admin-map" class="absolute inset-0"></div>

      <!-- Active Draw Mode Floating Banner -->
      <div v-if="activeDrawMode !== 'none'" class="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 backdrop-blur text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 text-xs font-bold animate-in fade-in slide-in-from-top-2">
        <span v-if="activeDrawMode === 'area'" class="flex items-center gap-2 text-red-300">
          <Icon name="heroicons:stop" class="w-4 h-4 text-red-400" />
          <span>Click & drag a box over an area to select orders</span>
        </span>
        <span v-else class="flex items-center gap-2 text-orange-300">
          <Icon name="heroicons:pencil" class="w-4 h-4 text-orange-400" />
          <span>Click stops or drag across pins to connect 1-to-1 in sequence</span>
        </span>
        <div class="flex items-center gap-1.5 border-l border-white/20 pl-2">
          <button @click="setDrawMode('none')" class="text-[10px] font-black uppercase bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg text-white transition-all">
            Done
          </button>
          <button v-if="selectedOrders.length > 0" @click="clearSelection" class="text-[10px] font-black uppercase bg-red-500/30 hover:bg-red-500/50 px-2.5 py-1 rounded-lg text-red-200 transition-all">
            Clear
          </button>
        </div>
      </div>

      <!-- Bulk Action Overlay -->
      <div v-if="selectedOrders.length > 0" class="absolute top-6 left-6 z-[1000] w-80">
        <div class="bg-white rounded-[32px] shadow-2xl p-6 border-2 transition-all"
             :class="isRouteModeSelection ? 'border-orange-500 shadow-orange-500/20' : 'border-red-500 shadow-red-500/20'">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest mb-1"
                 :class="isRouteModeSelection ? 'text-orange-500' : 'text-red-500'">
                {{ isRouteModeSelection ? 'Route Sequence' : 'Bulk Selection' }}
              </p>
              <h3 class="text-xl font-black text-slate-800">
                {{ selectedOrders.length }} {{ isRouteModeSelection ? 'Stops Connected' : 'Orders Selected' }}
              </h3>
            </div>
            <button @click="clearSelection" class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div :class="isRouteModeSelection ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100'" class="rounded-2xl p-3 border">
              <p :class="isRouteModeSelection ? 'text-orange-400' : 'text-red-400'" class="text-[8px] font-black uppercase tracking-tighter mb-1">Unassigned</p>
              <p :class="isRouteModeSelection ? 'text-orange-600' : 'text-red-600'" class="text-lg font-black leading-none">{{ selectedOrders.filter(s => s.type === 'unassigned').length }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-3 border border-slate-200">
              <p class="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Assigned</p>
              <p class="text-lg font-black text-slate-700 leading-none">{{ selectedOrders.filter(s => s.type === 'delivery').length }}</p>
            </div>
          </div>

          <!-- Selected Orders List (removable) -->
          <div class="max-h-36 overflow-y-auto space-y-1 mb-3 pr-1 custom-scrollbar">
            <div v-for="(s, idx) in selectedOrders" :key="s.data.id || s.data.order_id || idx"
              class="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                      :class="isRouteModeSelection ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-600'">
                  {{ idx + 1 }}
                </span>
                <div class="min-w-0">
                  <p class="text-[10px] font-bold text-slate-700 truncate">{{ s.type === 'unassigned' ? s.data.shop_name : s.data.order?.shop_name }}</p>
                  <p class="text-[8px] text-slate-400 truncate">{{ s.type === 'unassigned' ? s.data.district : s.data.order?.district }}</p>
                </div>
              </div>
              <button @click="selectedOrders.splice(idx, 1)"
                class="w-5 h-5 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shrink-0 ml-2"
                title="Remove Stop">
                <Icon name="heroicons:x-mark" class="w-3 h-3" />
              </button>
            </div>
          </div>

          <div class="space-y-3 pt-4 border-t border-slate-100">
            <div>
               <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Add to Plan</label>
               <select v-model="bulkAssignPlan" :disabled="isBulkAssigning" 
                 class="text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none"
                 :class="isRouteModeSelection ? 'focus:border-orange-400' : 'focus:border-red-400'">
                 <option value="">No Plan (Quick Assign)</option>
                 <option value="__new__">+ Create New Route Plan...</option>
                 <!-- Only allow adding to DRAFT plans -->
                 <option v-for="p in plans.filter(p => p.status === 'draft')" :key="p.id" :value="p.id">{{ p.name }}</option>
               </select>
            </div>

            <!-- If creating new plan -->
            <div v-if="bulkAssignPlan === '__new__'" class="space-y-2 p-3 bg-orange-50/50 rounded-2xl border border-orange-100 animate-in fade-in duration-200">
              <div>
                <label class="text-[9px] font-black uppercase text-orange-600 block mb-1">New Plan Name</label>
                <input type="text" v-model="newPlanForm.name" placeholder="e.g. Route Plan 1" 
                  class="text-[11px] bg-white border border-orange-200 rounded-xl px-3 py-1.5 w-full focus:outline-none font-bold" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Date</label>
                  <input type="date" v-model="newPlanForm.date" 
                    class="text-[11px] bg-white border border-slate-200 rounded-xl px-2 py-1.5 w-full focus:outline-none font-bold" />
                </div>
                <div>
                  <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Courier</label>
                  <select v-model="newPlanForm.courier_id" 
                    class="text-[11px] bg-white border border-slate-200 rounded-xl px-2 py-1.5 w-full focus:outline-none font-bold">
                    <option value="">Select...</option>
                    <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div v-if="!bulkAssignPlan">
               <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Or Quick Assign Courier</label>
               <select v-model="bulkAssignCourier" :disabled="isBulkAssigning" class="text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full focus:outline-none focus:border-red-400">
                 <option value="">Select Courier...</option>
                 <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
               </select>
            </div>
            
            <button @click="applyBulkAssign" :disabled="isBulkAssigning || (!bulkAssignPlan && !bulkAssignCourier)" 
              class="w-full text-white text-[11px] font-black uppercase py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              :class="isRouteModeSelection ? 'bg-orange-500 shadow-orange-200 hover:bg-orange-600' : 'bg-red-500 shadow-red-200 hover:bg-red-600'">
              <Icon v-if="isBulkAssigning" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <Icon v-else name="heroicons:check" class="w-4 h-4" />
              {{ isBulkAssigning ? 'Assigning...' : (bulkAssignPlan === '__new__' ? 'Create Plan & Assign Stops' : 'Confirm Bulk Assign') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Plan Info Overlay -->
      <div v-if="filters.delivery_plan_id" class="absolute top-6 right-6 z-[1000] w-72">
        <div class="bg-white rounded-[32px] shadow-2xl p-6 border border-slate-100">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Active Plan</p>
              <h3 class="text-sm font-black text-slate-800 truncate max-w-[160px]">{{ plans.find(p => String(p.id) === String(filters.delivery_plan_id))?.name || 'Loading...' }}</h3>
            </div>
            <button @click="filters.delivery_plan_id = ''" class="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-indigo-50 rounded-2xl p-3 border border-indigo-100/50">
              <p class="text-[8px] font-black text-indigo-400 uppercase tracking-tighter mb-1">In Plan</p>
              <p class="text-lg font-black text-indigo-600 leading-none">{{ liveDeliveries.filter(d => String(d.delivery_plan_id) === String(filters.delivery_plan_id)).length }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <p class="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Filtered</p>
              <p class="text-lg font-black text-slate-700 leading-none">{{ markersCount }}</p>
            </div>
          </div>

          <div v-if="markersCount > 0" class="flex flex-col gap-2">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 mb-1">Stops in Route</p>
            <div class="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
               <div v-for="d in allRawDeliveries.filter(d => String(d.delivery_plan_id) === String(filters.delivery_plan_id))" :key="d.id"
                 class="group flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                 <div class="flex items-center gap-2 min-w-0">
                    <span class="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] font-black">{{ d.order?.shop_name?.charAt(0) }}</span>
                    <span class="text-[10px] font-bold text-slate-700 truncate">{{ d.order?.shop_name }}</span>
                 </div>
                 <button @click="toggleOrderInPlan(d.order_id, d.delivery_plan_id, 'remove')" 
                   class="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                   <Icon name="heroicons:minus-small" class="w-3.5 h-3.5" />
                 </button>
               </div>
            </div>
          </div>
          
          <div v-if="!plans.find(p => String(p.id) === String(filters.delivery_plan_id))?.courier_id" class="flex flex-col gap-2 pt-4 border-t border-slate-50 mt-4">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assign Courier to Dispatch</label>
            <div class="flex gap-2">
              <select v-model="quickAssignMap" 
                class="flex-1 bg-slate-50 border border-slate-100 text-slate-700 text-[10px] font-bold rounded-xl px-3 py-2 focus:outline-none appearance-none">
                <option value="">Courier...</option>
                <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
              <button @click="updatePlanCourier(filters.delivery_plan_id as any, quickAssignMap)" :disabled="!quickAssignMap || planLoading"
                class="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-30 shrink-0 shadow-lg shadow-blue-200">
                Set
              </button>
            </div>
          </div>

          <div v-else class="pt-4 border-t border-slate-50 mt-4">
            <div class="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-[10px] text-white font-black">🚚</div>
                <div class="min-w-0">
                  <span class="block text-[10px] font-black text-emerald-600 uppercase tracking-tighter leading-none mb-1">Assigned Courier</span>
                  <span class="block text-xs font-black text-emerald-700 truncate">{{ plans.find(p => String(p.id) === String(filters.delivery_plan_id))?.courier?.name }}</span>
                </div>
              </div>
              <button @click="updatePlanCourier(filters.delivery_plan_id as any, '')" class="text-[9px] font-black uppercase text-emerald-600 hover:underline">Change</button>
            </div>
            
            <template v-if="plans.find(p => String(p.id) === String(filters.delivery_plan_id))?.status === 'completed'">
              <div class="w-full py-3 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                <Icon name="heroicons:check-badge" class="w-5 h-5 text-emerald-400" /> COMPLETED
              </div>
            </template>
            <button v-else @click="applyPlanCourier" :disabled="isDispatching"
              :class="plans.find(p => String(p.id) === String(filters.delivery_plan_id))?.status === 'active' ? 'bg-blue-600 shadow-blue-100 hover:bg-blue-700' : 'bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700'"
              class="w-full py-3 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
              <Icon :name="isDispatching ? 'heroicons:arrow-path' : 'heroicons:paper-airplane'" :class="{'animate-spin': isDispatching, 'rotate-45': !isDispatching}" class="w-5 h-5" /> 
              {{ isDispatching ? 'Dispatching...' : (plans.find(p => String(p.id) === String(filters.delivery_plan_id))?.status === 'active' ? 'Sync New Orders' : 'Dispatch Route') }}
            </button>
          </div>
        </div>
      </div>

    </div>


    <!-- Toast Notification -->
    <Teleport to="body">
      <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] animate-in fade-in slide-in-from-top-4 duration-300">
        <div class="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
          <Icon :name="toast.success ? 'heroicons:check-circle' : 'heroicons:exclamation-circle'" 
                :class="toast.success ? 'text-emerald-400' : 'text-red-400'" class="w-5 h-5" />
          <span class="text-sm font-black uppercase tracking-widest">{{ toast.message }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  fullWidth: true
})

import { ref, onMounted, onUnmounted, nextTick, watch, reactive } from 'vue'
const api = useApi()
const authStore = useAuthStore()
const route = useRoute()

// Map Drawing & Route State
const activeDrawMode = ref<'none' | 'area' | 'route'>('none')
const isRouteModeSelection = ref(false)
const selectedOrders = ref<any[]>([])
const bulkAssignPlan = ref('')
const bulkAssignCourier = ref('')
const isBulkAssigning = ref(false)

const newPlanForm = reactive({
  name: '',
  date: new Date().toISOString().split('T')[0],
  courier_id: ''
})

let drawPolygon: any = null
let drawStartPoint: any = null
let isDrawingArea = false

let routePolyline: any = null
let routePolylineGlow: any = null
let routeStopMarkers: any[] = []
let isDrawingRoute = false
let freehandPolyline: any = null
let prevMousePt: { x: number, y: number } | null = null

function toggleSelectAreaMode() {
  if (activeDrawMode.value === 'area') {
    setDrawMode('none')
  } else {
    setDrawMode('area')
  }
}

function toggleDrawRouteMode() {
  if (activeDrawMode.value === 'route') {
    setDrawMode('none')
  } else {
    setDrawMode('route')
  }
}

function setDrawMode(mode: 'none' | 'area' | 'route') {
  activeDrawMode.value = mode
  const mapDiv = document.getElementById('admin-map')

  if (mode === 'none') {
    if (mapDiv) mapDiv.classList.remove('cursor-crosshair')
    isDrawingArea = false
    isDrawingRoute = false
    if (map) {
      map.dragging.enable()
      map.touchZoom.enable()
      map.doubleClickZoom.enable()
    }
  } else if (mode === 'area') {
    if (mapDiv) mapDiv.classList.add('cursor-crosshair')
    isRouteModeSelection.value = false
    clearSelection()
    if (map) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
    }
  } else if (mode === 'route') {
    if (mapDiv) mapDiv.classList.add('cursor-crosshair')
    isRouteModeSelection.value = true
    if (drawPolygon && map) {
      map.removeLayer(drawPolygon)
      drawPolygon = null
    }
    if (map) {
      map.dragging.disable()
      map.touchZoom.disable()
      map.doubleClickZoom.disable()
    }
  }
}

function clearSelection() {
  if (drawPolygon && map) {
    map.removeLayer(drawPolygon)
    drawPolygon = null
  }
  if (routePolyline && map) {
    map.removeLayer(routePolyline)
    routePolyline = null
  }
  if (routePolylineGlow && map) {
    map.removeLayer(routePolylineGlow)
    routePolylineGlow = null
  }
  if (freehandPolyline && map) {
    map.removeLayer(freehandPolyline)
    freehandPolyline = null
  }
  routeStopMarkers.forEach(m => m.remove())
  routeStopMarkers = []

  selectedOrders.value = []
  bulkAssignPlan.value = ''
  bulkAssignCourier.value = ''
  isRouteModeSelection.value = false
}

function toggleRouteStop(item: { type: string, data: any, coords: [number, number] }) {
  isRouteModeSelection.value = true
  const targetId = item.type === 'unassigned' ? item.data.id : (item.data.order_id || item.data.id)
  const idx = selectedOrders.value.findIndex(s => {
    const sId = s.type === 'unassigned' ? s.data.id : (s.data.order_id || s.data.id)
    return sId === targetId
  })

  if (idx !== -1) {
    selectedOrders.value.splice(idx, 1)
  } else {
    selectedOrders.value.push(item)
  }
  updateRouteVisuals()
}

function updateRouteVisuals() {
  if (!map || !L) return

  routeStopMarkers.forEach(m => m.remove())
  routeStopMarkers = []

  if (!isRouteModeSelection.value && selectedOrders.value.length === 0) {
    if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null }
    if (routePolylineGlow) { map.removeLayer(routePolylineGlow); routePolylineGlow = null }
    return
  }

  const latlngs: [number, number][] = []
  selectedOrders.value.forEach((s, idx) => {
    let coords = s.coords
    if (!coords) {
      const loc = s.type === 'unassigned' ? s.data?.location : s.data?.order?.location
      if (loc && /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(loc.trim())) {
        coords = loc.split(',').map(Number) as [number, number]
        s.coords = coords
      }
    }
    if (coords) {
      latlngs.push(coords)

      if (isRouteModeSelection.value) {
        // Add numbered stop badge on pin
        const badge = L.marker(coords, {
          icon: L.divIcon({
            html: `
              <div style="
                background: #ea580c;
                color: white;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 11px;
                font-weight: 900;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                position: absolute;
                top: -14px;
                right: -14px;
                pointer-events: none;
              ">${idx + 1}</div>
            `,
            className: '',
            iconSize: [24, 24],
            iconAnchor: [0, 0]
          }),
          interactive: false,
          zIndexOffset: 3000 + idx
        }).addTo(map)

        routeStopMarkers.push(badge)
      }
    }
  })

  if (isRouteModeSelection.value && latlngs.length >= 2) {
    // Glow / outline
    if (routePolylineGlow) {
      routePolylineGlow.setLatLngs(latlngs)
    } else {
      routePolylineGlow = L.polyline(latlngs, {
        color: '#ffffff',
        weight: 8,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map)
    }

    // Main route line (orange)
    if (routePolyline) {
      routePolyline.setLatLngs(latlngs)
    } else {
      routePolyline = L.polyline(latlngs, {
        color: '#ea580c',
        weight: 4,
        opacity: 0.95,
        lineJoin: 'round',
        lineCap: 'round'
      }).addTo(map)
    }
  } else {
    if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null }
    if (routePolylineGlow) { map.removeLayer(routePolylineGlow); routePolylineGlow = null }
  }
}

watch(selectedOrders, () => {
  updateRouteVisuals()
}, { deep: true })

function getAllCandidatePins() {
  const candidates: { id: any, type: string, data: any, coords: [number, number] }[] = []
  const parseC = (loc: string) => {
    if (loc && /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(loc.trim())) {
      return loc.split(',').map(Number) as [number, number]
    }
    return null
  }

  allRawUnassigned.value.forEach(o => {
    if (!currentlyFilteredOrderIds.value.includes(o.id)) return
    const coords = parseC(o.location)
    if (coords) {
      candidates.push({ id: o.id, type: 'unassigned', data: o, coords })
    }
  })

  liveDeliveries.value.forEach(d => {
    if (d.status === 'delivered' || d.status === 'shop_closed' || d.status === 'customer_cancelled') return
    if (d.courier_id || d.delivery_plan_id) return
    const coords = parseC(d.order?.location)
    if (coords) {
      candidates.push({ id: d.order_id || d.id, type: 'delivery', data: d, coords })
    }
  })

  return candidates
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  const l2 = dx * dx + dy * dy
  if (l2 === 0) return Math.hypot(px - x1, py - y1)
  let t = ((px - x1) * dx + (py - y1) * dy) / l2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

function hitTestCandidatesAlongSegment(p1: { x: number, y: number }, p2: { x: number, y: number }, candidates: any[]) {
  if (!map || !L) return

  for (const pin of candidates) {
    const pinPt = map.latLngToContainerPoint(L.latLng(pin.coords[0], pin.coords[1]))
    const dist = distToSegment(pinPt.x, pinPt.y, p1.x, p1.y, p2.x, p2.y)

    // Snaps if within 45px of stroke line
    if (dist <= 45) {
      const alreadySelected = selectedOrders.value.some(s => {
        const sId = s.type === 'unassigned' ? s.data.id : (s.data.order_id || s.data.id)
        return sId === pin.id
      })
      if (!alreadySelected) {
        isRouteModeSelection.value = true
        selectedOrders.value.push(pin)
        updateRouteVisuals()
      }
    }
  }
}

function findSelectedOrders() {
  const selected: any[] = []
  if (!drawPolygon || !map) return
  
  const bounds = drawPolygon.getBounds()
  
  const parseC = (loc: string) => {
    if (loc && /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(loc.trim())) {
      return loc.split(',').map(Number) as [number, number]
    }
    return null
  }

  liveDeliveries.value.forEach(d => {
    if (d.status === 'delivered' || d.status === 'shop_closed' || d.status === 'customer_cancelled') return
    // Skip if already assigned to a courier OR in a delivery plan — cannot be re-assigned
    if (d.courier_id || d.delivery_plan_id) return
    let destCoords = parseC(d.order?.location)
    if (destCoords && bounds.contains(L.latLng(destCoords[0], destCoords[1]))) {
      selected.push({ type: 'delivery', data: d, coords: destCoords })
    }
  })

  allRawUnassigned.value.forEach(o => {
    let coords = parseC(o.location)
    if (coords && bounds.contains(L.latLng(coords[0], coords[1]))) {
      if (currentlyFilteredOrderIds.value.includes(o.id)) {
        selected.push({ type: 'unassigned', data: o, coords })
      }
    }
  })

  isRouteModeSelection.value = false
  selectedOrders.value = selected
  if (selected.length === 0) {
    showToast('No orders found in selection', false)
    clearSelection()
  }
}

async function applyBulkAssign() {
  if (selectedOrders.value.length === 0) return
  isBulkAssigning.value = true
  
  try {
    const orderIds = selectedOrders.value
      .filter(s => s.type === 'unassigned' || (!s.data.delivery_plan_id && !s.data.courier_id))
      .map(s => s.type === 'unassigned' ? s.data.id : s.data.order_id)

    if (!orderIds.length) {
      showToast('No unassigned orders to assign', false)
      return
    }

    if (bulkAssignPlan.value === '__new__') {
      const planName = newPlanForm.name.trim() || `Route Plan ${newPlanForm.date}`
      const planRes = await api.post('/admin/delivery-plans', {
        name: planName,
        date: newPlanForm.date,
        courier_id: newPlanForm.courier_id ? parseInt(newPlanForm.courier_id) : null,
        status: 'draft'
      }) as any

      await api.post(`/admin/delivery-plans/${planRes.id}/assign-orders`, { order_ids: orderIds })
      showToast(`Route Plan "${planName}" Created with ${orderIds.length} Stops!`)
    } else if (bulkAssignPlan.value) {
      await api.post(`/admin/delivery-plans/${bulkAssignPlan.value}/assign-orders`, { order_ids: orderIds })
      showToast('Bulk Assigned to Route Plan!')
    } else if (bulkAssignCourier.value) {
      const promises = selectedOrders.value
        .filter(s => s.type === 'unassigned')
        .map(s => api.post('/admin/deliveries', { order_id: s.data.id, courier_id: bulkAssignCourier.value, status: 'pending' }))
      await Promise.allSettled(promises)
      showToast('Bulk Assign Complete!')
    }
    
    clearSelection()
    setDrawMode('none')
    await fetchLive(true)
  } catch (e: any) {
    showToast(e.data?.message || 'Error during bulk assign', false)
  } finally {
    isBulkAssigning.value = false
  }
}

const liveDeliveries = ref<any[]>([])
const allRawDeliveries = ref<any[]>([])
const allRawUnassigned = ref<any[]>([])

const router = useRouter()
const filters = reactive({ 
  delivery_date: (route.query.delivery_date as string) || '',
  date_type: (route.query.date_type as string) || 'delivery_date',
  province: (route.query.province as string) || '',
  districts: Array.isArray(route.query.districts) ? route.query.districts : (route.query.districts ? [route.query.districts] : []),
  communes: Array.isArray(route.query.communes) ? route.query.communes : (route.query.communes ? [route.query.communes] : []),
  search: (route.query.search as string) || '',
  status: (route.query.status as string) || '',
  courier_id: (route.query.courier_id as string) || '',
  delivery_plan_id: (route.query.delivery_plan_id as string) || ''
})

const showDistrictDropdown = ref(false)
const showCommuneDropdown = ref(false)
const plans = ref<any[]>([])

let routerTimeout: any = null
watch(filters, (newVal, oldVal) => {
  // If plan changed, try to sync date
  if (newVal.delivery_plan_id && newVal.delivery_plan_id !== oldVal?.delivery_plan_id) {
    const plan = plans.value.find(p => String(p.id) === String(newVal.delivery_plan_id))
    if (plan && plan.date) {
      filters.delivery_date = plan.date
      filters.date_type = 'planned_delivery_date'
    }
  }
  
  if (routerTimeout) clearTimeout(routerTimeout)
  routerTimeout = setTimeout(() => {
    router.replace({ query: { ...route.query, ...newVal } })
    fetchLive(true, true) // Force client-side redraw instantly
  }, 150)
}, { deep: true })

const quickAssignMap = ref('')
const planLoading = ref(false)

const provinces = computed(() => {
  const all = [...allRawUnassigned.value, ...allRawDeliveries.value.map(d => d.order)].filter(Boolean)
  return [...new Set(all.map(o => o.province))].filter(Boolean).sort() as string[]
})

const districts = computed(() => {
  const all = [...allRawUnassigned.value, ...allRawDeliveries.value.map(d => d.order)].filter(Boolean)
  let filtered = all
  if (filters.province) filtered = filtered.filter(o => o.province === filters.province)
  return [...new Set(filtered.map(o => o.district))].filter(Boolean).sort() as string[]
})

const communes = computed(() => {
  const all = [...allRawUnassigned.value, ...allRawDeliveries.value.map(d => d.order)].filter(Boolean)
  let filtered = all
  if (filters.province) filtered = filtered.filter(o => o.province === filters.province)
  if (filters.districts.length) filtered = filtered.filter(o => filters.districts.includes(o.district))
  return [...new Set(filtered.map(o => o.commune))].filter(Boolean).sort() as string[]
})

function applyFilters(o: any, d: any = null) {
  const q = filters.search.toLowerCase().trim()
  if (q) {
    const match = 
      o.shop_name?.toLowerCase().includes(q) ||
      o.so_number?.toLowerCase().includes(q) ||
      o.customer_id?.toLowerCase().includes(q) ||
      d?.courier?.name?.toLowerCase().includes(q)
    if (!match) return false
  }
  if (filters.status) {
    if (d && d.status !== filters.status) return false
    if (!d && filters.status !== 'pending') return false
  }
  if (filters.delivery_date) {
    const field = filters.date_type as 'created_at' | 'delivery_date' | 'planned_delivery_date'
    const dateVal = field === 'planned_delivery_date' ? d?.planned_delivery_date : o[field]
    if (!dateVal) return false
    const dm = new Date(dateVal)
    if (isNaN(dm.getTime())) return false
    
    // Handle plain date strings YYYY-MM-DD vs ISO
    const s = String(dateVal)
    const dStr = (s.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(s)) 
      ? s 
      : `${dm.getFullYear()}-${String(dm.getMonth()+1).padStart(2,'0')}-${String(dm.getDate()).padStart(2,'0')}`
      
    if (dStr !== filters.delivery_date) return false
  }
  if (filters.province && o.province !== filters.province) return false
  if (filters.districts.length && !filters.districts.includes(o.district)) return false
  if (filters.communes.length && !filters.communes.includes(o.commune)) return false
  
  if (filters.delivery_plan_id) {
    const pId = String(filters.delivery_plan_id)
    const orderPlanId = String(d?.delivery_plan_id || '')
    // Show ONLY if it's in the selected plan
    if (orderPlanId !== pId) return false
  }
  
  return true
}

const couriers = ref<any[]>([])
const quickAssign = ref<Record<number, any>>({})
const missingGpsCount = ref(0)
const markersCount = ref(0)
const currentlyFilteredOrderIds = ref<number[]>([])

const shopClosedCount = computed(() => {
  return liveDeliveries.value.filter((d: any) => d.status === 'shop_closed').length
})

const issueCount = computed(() => {
  return liveDeliveries.value.filter((d: any) => d.status === 'delivered_with_issue').length
})
const loading = ref(false)
let map: any = null
let markers: any[] = []
let refreshInterval: any = null
let L: any = null // Store Leaflet instance

onMounted(async () => {
  if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAdminDelivery) {
    navigateTo('/admin')
    return
  }
  await fetchCouriers()
  await fetchPlans()
  await loadMap()
  await fetchLive()
  refreshInterval = setInterval(fetchLive, 10000) // Poll every 10s instead of 2s
})

async function fetchPlans() {
  plans.value = await api.get('/admin/delivery-plans') as any[]
}

async function toggleOrderInPlan(orderId: number, planId: number, action: 'add' | 'remove') {
  try {
    if (action === 'add') {
      await api.post(`/admin/delivery-plans/${planId}/assign-orders`, { order_ids: [orderId] })
    } else {
      await api.post(`/admin/delivery-plans/${planId}/remove-orders`, { order_ids: [orderId] })
    }
    await fetchLive(true)
    showToast(action === 'add' ? 'Added to plan' : 'Removed from plan')
  } catch (e) {
    alert('Failed to update plan assignment')
  }
}


async function updatePlanCourier(planId: string, courierId: string) {
  if (!courierId) return
  planLoading.value = true
  try {
    await api.put(`/admin/delivery-plans/${planId}`, { courier_id: courierId })
    const plansRes = await api.get('/admin/delivery-plans') as any[]
    plans.value = plansRes
    showToast('Courier assigned to Route!')
  } catch (e) {
    alert('Failed to assign courier')
  } finally {
    planLoading.value = false
  }
}

const isDispatching = ref(false)

async function applyPlanCourier() {
  if (!filters.delivery_plan_id) return
  const plan = plans.value.find(p => String(p.id) === String(filters.delivery_plan_id))
  if (!plan || !plan.courier_id || plan.status === 'completed') return
  
  if (!confirm(`Dispatch to ${plan.courier?.name || 'Courier'}? This will assign any new orders in the plan.`)) return
  
  isDispatching.value = true
  try {
    const res = await api.post(`/admin/delivery-plans/${plan.id}/apply`, {}) as any
    showToast(res.message)
    await fetchLive(true)
  } catch (e) {
    alert('Failed to apply plan')
  } finally {
    isDispatching.value = false
  }
}

onUnmounted(() => {
  clearInterval(refreshInterval)
  if (map) map.remove()
})

async function fetchCouriers() {
  try {
    const data = await api.get('/admin/users?active_only=1') as any
    // Only fetch active couriers to assign to
    couriers.value = (Array.isArray(data) ? data : []).filter((u: any) => u.role === 'delivery' && u.is_active !== false && u.is_active !== 0)
  } catch (e) {
    console.error('Failed to fetch couriers', e)
  }
}

async function loadMap() {
  const leafletModule = await import('leaflet') as any
  L = leafletModule.default || leafletModule
  
  if (typeof window !== 'undefined') {
    (window as any).L = L
  }

  await import('leaflet/dist/leaflet.css')

  if (!map) {
    map = L.map('admin-map').setView([11.5564, 104.9282], 12) // Phnom Penh default
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)
    
    // Fix for tiles not loading / grey map
    setTimeout(() => {
      if (map) map.invalidateSize()
    }, 500)

    const handleDrawStart = (e: any) => {
      if (activeDrawMode.value === 'none') return

      if (activeDrawMode.value === 'area') {
        isDrawingArea = true
        drawStartPoint = e.latlng
        
        if (drawPolygon) {
          map.removeLayer(drawPolygon)
          drawPolygon = null
        }
        
        drawPolygon = L.rectangle([drawStartPoint, drawStartPoint], { color: 'red', weight: 2, fillColor: '#fca5a5', fillOpacity: 0.3 }).addTo(map)
        return
      }

      if (activeDrawMode.value === 'route') {
        isDrawingRoute = true
        const mapDiv = document.getElementById('admin-map')
        if (mapDiv) mapDiv.classList.add('drawing-route-active')
        
        const startPt = map.latLngToContainerPoint(e.latlng)
        prevMousePt = startPt
        
        // Start live visual freehand brush stroke
        if (freehandPolyline) {
          map.removeLayer(freehandPolyline)
          freehandPolyline = null
        }
        freehandPolyline = L.polyline([e.latlng], {
          color: '#ea580c',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map)

        const candidates = getAllCandidatePins()
        hitTestCandidatesAlongSegment(startPt, startPt, candidates)
      }
    }

    const handleDrawMove = (e: any) => {
      if (activeDrawMode.value === 'area' && isDrawingArea) {
        if (drawPolygon) {
          drawPolygon.setBounds([drawStartPoint, e.latlng])
        }
        return
      }

      if (activeDrawMode.value === 'route' && isDrawingRoute) {
        const currentPt = map.latLngToContainerPoint(e.latlng)
        
        if (freehandPolyline) {
          freehandPolyline.addLatLng(e.latlng)
        }
        
        const candidates = getAllCandidatePins()
        const startPt: { x: number, y: number } = prevMousePt ? { x: prevMousePt.x, y: prevMousePt.y } : { x: currentPt.x, y: currentPt.y }
        hitTestCandidatesAlongSegment(startPt, { x: currentPt.x, y: currentPt.y }, candidates)
        prevMousePt = currentPt
      }
    }

    const handleDrawEnd = () => {
      if (activeDrawMode.value === 'area' && isDrawingArea) {
        isDrawingArea = false
        if (!drawStartPoint) {
          setDrawMode('none')
          return
        }
        findSelectedOrders()
        setDrawMode('none')
        return
      }

      if (activeDrawMode.value === 'route' && isDrawingRoute) {
        isDrawingRoute = false
        prevMousePt = null
        const mapDiv = document.getElementById('admin-map')
        if (mapDiv) mapDiv.classList.remove('drawing-route-active')
        
        if (freehandPolyline) {
          map.removeLayer(freehandPolyline)
          freehandPolyline = null
        }
        updateRouteVisuals()
      }
    }

    map.on('mousedown', handleDrawStart)
    map.on('mousemove', handleDrawMove)
    map.on('mouseup', handleDrawEnd)

    // Touch support for mobile devices
    map.on('touchstart', handleDrawStart)
    map.on('touchmove', handleDrawMove)
    map.on('touchend', handleDrawEnd)

    // Global listener to ensure drawing completes cleanly even if mouse leaves map
    window.addEventListener('mouseup', handleDrawEnd)
    window.addEventListener('touchend', handleDrawEnd)
  }
}

async function fetchLive(force = false, redrawOnly = false) {
  let deliveries: any[] = []
  let unassignedOrders: any[] = []
  
  if (!redrawOnly) {
    loading.value = true
    try {
      const [data, plansRes] = await Promise.all([
        api.get('/admin/deliveries/live-map'),
        api.get('/admin/delivery-plans')
      ]) as [any, any[]]

      allRawDeliveries.value = data.deliveries || []
      allRawUnassigned.value = data.unassigned_orders || []
      plans.value = plansRes || []
    } finally {
      loading.value = false
    }
  }
  
  deliveries = allRawDeliveries.value.filter(d => applyFilters(d.order, d))
  unassignedOrders = allRawUnassigned.value.filter(o => applyFilters(o, null))
  
  liveDeliveries.value = deliveries
  currentlyFilteredOrderIds.value = [
    ...deliveries.map(d => d.order_id),
    ...unassignedOrders.map(o => o.id)
  ]

  if (!L || !map) return // Ensure Leaflet and Map are loaded

  // Clear old markers ONLY if no popup is open to avoid frustrating the user
  // Unless we are FORCING a refresh (e.g. after a save)
  const openPopup = markers.find(m => m.getPopup() && m.getPopup().isOpen())
  if (openPopup && !force) return // Skip automatic refresh if user is interacting

  markers.forEach(m => m.remove())
  markers = []

  // Helper for coordinate parsing
  const parseCoords = (loc: string) => {
    if (loc && /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(loc.trim())) {
      return loc.split(',').map(Number) as [number, number]
    }
    return null
  }

  const usedCoordinates = new Map<string, number>()
  const getJitteredCoords = (lat: number, lng: number): [number, number] => {
    const coordKey = `${lat.toFixed(6)},${lng.toFixed(6)}`
    const count = usedCoordinates.get(coordKey) || 0
    usedCoordinates.set(coordKey, count + 1)
    
    if (count > 0) {
      const angle = count * (Math.PI / 3) // Hexagonal spread
      const radius = 0.0004 * count // ~45 meters per step
      lat += Math.cos(angle) * radius
      lng += Math.sin(angle) * radius
    }
    return [lat, lng]
  }

  let parsedCount = 0
  const activePlanRaw = plans.value.find(p => String(p.id) === String(filters.delivery_plan_id))
  // Only allow "Quick Add" actions if the selected plan is still a DRAFT
  const activePlan = (activePlanRaw && activePlanRaw.status === 'draft') ? activePlanRaw : null

  // 1. Render Active Deliveries
  deliveries.forEach((d: any) => {
    const color = d.status === 'in_transit' ? '#f472b6' 
      : d.status === 'delivered' ? '#10b981' 
      : d.status === 'pending' ? '#fbbf24' 
      : d.status === 'shop_closed' ? '#ef4444' 
      : d.status === 'customer_cancelled' ? '#e11d48'
      : d.status === 'delivered_with_issue' ? '#f97316' 
      : '#64748b'
    
    // Courier Icon
    const courierIcon = L.divIcon({
      html: `<div style="background:${color}; width:32px; height:32px; border-radius:50%; border:3px solid white; box-shadow:0 4px 12px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:16px;">🚚</div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    const isInPlan = filters.delivery_plan_id && String(d.delivery_plan_id) === String(filters.delivery_plan_id)

    // Destination Icon
    const destIcon = L.divIcon({
      html: `
        <div class="${isInPlan ? 'plan-pulse' : ''}" style="background:${color}; width:28px; height:28px; border-radius:50%; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:14px; position:relative;">
          📍
          ${isInPlan ? '<div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#6366f1; color:white; font-size:7px; font-weight:900; padding:1px 4px; border-radius:4px; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">IN ROUTE</div>' : ''}
        </div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })

    let destCoords = parseCoords(d.order?.location)
    if (destCoords) destCoords = getJitteredCoords(destCoords[0], destCoords[1])

    let courierCoords: [number, number] | null = (d.courier_lat !== null && d.courier_lng !== null) ? [d.courier_lat, d.courier_lng] : null
    if (courierCoords) courierCoords = getJitteredCoords(courierCoords[0], courierCoords[1])

    if (destCoords || courierCoords) {
      parsedCount++
    }

    // Draw route line if both coordinates exist
    if (destCoords && courierCoords) {
      const polyline = L.polyline([courierCoords, destCoords], {
        color: color,
        weight: 3,
        opacity: 0.6,
        dashArray: '10, 10',
        lineJoin: 'round'
      }).addTo(map)
      markers.push(polyline)
    }


    if (destCoords) {
      const dMarker = L.marker(destCoords, { icon: destIcon, zIndexOffset: -100 })
        .addTo(map)
        .bindPopup(`
          <div class="p-4 min-w-[240px] font-sans">
            <div class="flex justify-between items-start mb-3">
              <div>
                <strong class="text-slate-900 text-sm">${d.order?.shop_name}</strong>
                <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">${d.courier?.name || 'NOT ASSIGNED'}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">${d.status.replace('_', ' ')}</span>
            </div>

            <div class="text-[9px] mb-4 flex flex-col gap-0.5 font-bold border-l-2 border-slate-100 pl-3">
              <div class="text-slate-400">Order Date: <span class="text-slate-600">${new Date(d.order?.created_at || d.created_at).toLocaleDateString()}</span></div>
              <div class="text-slate-400">Request Date: <span class="text-slate-600">${d.order?.delivery_date ? new Date(d.order.delivery_date).toLocaleDateString() : '—'}</span></div>
            </div>
            
            <div class="space-y-2">
              ${isInPlan ? `
                <button id="remove-plan-btn-dest-${d.id}" class="w-full bg-red-600 text-white text-[11px] font-black uppercase py-3 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                   Remove from Route
                </button>
              ` : `
                ${activePlan ? `
                  <button id="add-plan-btn-dest-${d.id}" class="w-full bg-indigo-600 text-white text-[11px] font-black uppercase py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    Add to ${activePlan.name}
                  </button>
                ` : ''}
              `}

              ${d.courier_id ? `
                <button id="unassign-btn-dest-main-${d.id}" class="w-full bg-red-50 text-red-600 text-[11px] font-black uppercase py-3 rounded-xl border border-red-100 hover:bg-red-100 hover:text-red-700 transition-all flex items-center justify-center gap-2 shadow-sm">
                  ❌ Remove Assignment
                </button>
              ` : ''}

              <div class="pt-2 border-t border-slate-50 mt-2">
                <button id="toggle-details-${d.id}" class="text-[9px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">Advanced Settings...</button>
                <div id="details-${d.id}" class="hidden space-y-3 mt-3">
                  <div>
                    <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Reassign Courier</label>
                    <select id="reassign-select-dest-${d.id}" class="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 w-full">
                      <option value="${d.courier_id || ''}">${d.courier?.name || 'Select Courier'}</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Planned Date</label>
                    <input id="planned-date-dest-${d.id}" type="date" value="${d.planned_delivery_date ? new Date(d.planned_delivery_date).toISOString().split('T')[0] : ''}" class="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 w-full" />
                  </div>
                  <div class="flex gap-2">
                    <button id="save-all-dest-${d.id}" class="bg-emerald-600 text-white text-[10px] font-black uppercase py-2 flex-1 rounded-xl">Save</button>
                    <button id="remove-btn-dest-${d.id}" class="bg-red-50 text-red-500 text-[10px] font-black uppercase py-2 px-3 rounded-xl">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `)

      dMarker.on('popupopen', () => {
        const removePlanBtn = document.getElementById(`remove-plan-btn-dest-${d.id}`)
        const addPlanBtn = document.getElementById(`add-plan-btn-dest-${d.id}`)
        const unassignBtnMain = document.getElementById(`unassign-btn-dest-main-${d.id}`)
        const toggleBtn = document.getElementById(`toggle-details-${d.id}`)
        const detailsDiv = document.getElementById(`details-${d.id}`)
        
        if (removePlanBtn) removePlanBtn.onclick = () => toggleOrderInPlan(d.order_id, d.delivery_plan_id, 'remove')
        if (addPlanBtn && activePlan) addPlanBtn.onclick = () => toggleOrderInPlan(d.order_id, activePlan.id, 'add')
        if (unassignBtnMain) unassignBtnMain.onclick = () => removeDelivery(d.id)
        if (toggleBtn && detailsDiv) toggleBtn.onclick = () => detailsDiv.classList.toggle('hidden')

        const select = document.getElementById(`reassign-select-dest-${d.id}`) as HTMLSelectElement
        const saveAllBtn = document.getElementById(`save-all-dest-${d.id}`) as HTMLButtonElement
        const removeBtn = document.getElementById(`remove-btn-dest-${d.id}`) as HTMLButtonElement

        if (select && select.options.length <= 1) {
          couriers.value.forEach(c => {
            if (c.id !== d.courier_id) {
              const opt = document.createElement('option')
              opt.value = c.id; opt.text = c.name; select.appendChild(opt)
            }
          })
        }
        if (saveAllBtn) {
          saveAllBtn.onclick = () => {
            const planDate = (document.getElementById(`planned-date-dest-${d.id}`) as HTMLInputElement).value
            const cId = parseInt(select.value) || d.courier_id
            updateDelivery(d.id, { planned_delivery_date: planDate || null, courier_id: cId })
          }
        }
        if (removeBtn) removeBtn.onclick = () => removeDelivery(d.id)
      })

      markers.push(dMarker)

      // 🔴 If route mode or bulk selection is active: click marker to toggle selection
      dMarker.on('click', (e: any) => {
        if (activeDrawMode.value === 'route') {
          L.DomEvent.stopPropagation(e)
          dMarker.closePopup()
          if (!d.courier_id && !d.delivery_plan_id) {
            toggleRouteStop({ type: 'delivery', data: d, coords: destCoords })
          }
          return
        }

        if (selectedOrders.value.length === 0) return // Let popup open normally
        L.DomEvent.stopPropagation(e)
        dMarker.closePopup()
        const idx = selectedOrders.value.findIndex(s => s.data.order_id === d.order_id || s.data.id === d.order_id)
        if (idx !== -1) {
          selectedOrders.value.splice(idx, 1)
        }
      })
    }

    if (courierCoords) {
      const marker = L.marker(courierCoords, { icon: courierIcon, zIndexOffset: 100 })
        .addTo(map)
        .bindPopup(`
          <div class="p-4 min-w-[240px] font-sans">
            <div class="flex justify-between items-start mb-3">
              <div>
                <strong class="text-slate-900 text-sm">Courier: ${d.courier?.name || 'NOT ASSIGNED'}</strong>
                <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Order: ${d.order?.shop_name}</p>
                <div class="text-[9px] mt-1.5 flex flex-col gap-0.5 font-bold">
                  <div class="text-slate-400">Submit: <span class="text-slate-600">${new Date(d.order?.created_at || d.created_at).toLocaleDateString()}</span></div>
                  <div class="text-slate-400">Request: <span class="text-slate-600">${d.order?.delivery_date ? new Date(d.order.delivery_date).toLocaleDateString() : '—'}</span></div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase">${d.status.replace('_', ' ')}</span>
            </div>
            
            <div class="space-y-3 pt-3 border-t border-slate-100">
              <!-- Reassign section -->
              <div>
                <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Reassign Courier</label>
                <div class="flex gap-2">
                  <select id="reassign-select-${d.id}" class="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 flex-1">
                    <option value="${d.courier_id || ''}">${d.courier?.name || 'Selected Courier...'}</option>
                  </select>
                  <button id="reassign-btn-${d.id}" class="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-all">Save</button>
                </div>
              </div>

              <!-- ID & Date Fields -->
              <div class="grid grid-cols-1 gap-2">

              <div>
                <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Planned Date</label>
                <input id="planned-date-${d.id}" type="date" value="${d.planned_delivery_date ? new Date(d.planned_delivery_date).toISOString().split('T')[0] : ''}" class="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 w-full" />
              </div>

              <div class="flex gap-2 pt-2">
                <button id="save-all-${d.id}" class="bg-emerald-600 text-white text-[10px] font-black uppercase py-2 flex-1 rounded-xl shadow-lg shadow-emerald-500/10 hover:bg-emerald-700 transition-all">Update Info</button>
                <button id="remove-btn-${d.id}" class="bg-red-50 text-red-500 text-[10px] font-black uppercase py-2 px-3 rounded-xl border border-red-100 font-black">Remove</button>
              </div>
            </div>
          </div>
        `)

      marker.on('popupopen', () => {
        const select = document.getElementById(`reassign-select-${d.id}`) as HTMLSelectElement
        const reassignBtn = document.getElementById(`reassign-btn-${d.id}`) as HTMLButtonElement
        const saveAllBtn = document.getElementById(`save-all-${d.id}`) as HTMLButtonElement
        const removeBtn = document.getElementById(`remove-btn-${d.id}`) as HTMLButtonElement

        if (select) {
          if (select.options.length <= 1) {
            couriers.value.forEach(c => {
              if (c.id !== d.courier_id) {
                const opt = document.createElement('option')
                opt.value = c.id
                opt.text = c.name
                select.appendChild(opt)
              }
            })
          }
        }

        if (reassignBtn) {
          reassignBtn.onclick = () => {
            const selVal = parseInt(select.value)
            const cId = isNaN(selVal) ? d.courier_id : selVal
            updateDelivery(d.id, { courier_id: cId })
          }
        }
        if (saveAllBtn) {
          saveAllBtn.onclick = () => {
            const planDate = (document.getElementById(`planned-date-${d.id}`) as HTMLInputElement).value
            const selVal = parseInt(select.value)
            const cId = isNaN(selVal) ? d.courier_id : selVal
            updateDelivery(d.id, { 
              planned_delivery_date: planDate || null,
              courier_id: cId
            })
          }
        }
        if (removeBtn) removeBtn.onclick = () => removeDelivery(d.id)
      })

      markers.push(marker)
    }
  })

  // 2. Render Unassigned Orders
  unassignedOrders.forEach((o: any) => {
    let coords = parseCoords(o.location)
    if (!coords) return
    coords = getJitteredCoords(coords[0], coords[1])
    parsedCount++

    const isSelected = selectedOrders.value.some(s => s.data.id === o.id)

    const unassignedIcon = L.divIcon({
      html: `
        <div style="background:${isSelected ? '#ef4444' : '#f472b6'}; width:28px; height:28px; border-radius:50%; border:${isSelected ? '3px solid #ef4444' : '2px solid white'}; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:14px; ${isSelected ? 'outline:3px solid rgba(239,68,68,0.4);' : ''}">
        ${isSelected ? '✕' : '📍'}
        </div>`,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })

    const popupContainer = document.createElement('div')
    popupContainer.innerHTML = `
      <div class="p-4 min-w-[240px] font-sans">
        <div class="mb-4">
          <strong class="text-slate-900 text-sm">${o.shop_name}</strong>
          <span class="block text-[9px] font-black uppercase text-pink-500 tracking-widest mt-0.5">Need to Assign</span>
        </div>

        <div class="text-[9px] mb-4 flex flex-col gap-0.5 font-bold border-l-2 border-pink-100 pl-3">
          <div class="text-slate-400">Order Date: <span class="text-slate-600">${new Date(o.created_at).toLocaleDateString()}</span></div>
          <div class="text-slate-400">Request Date: <span class="text-slate-600">${o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : '—'}</span></div>
        </div>
        
        <div class="space-y-2">
          ${activePlan ? `
            <button id="add-plan-btn-${o.id}" class="w-full bg-indigo-600 text-white text-[11px] font-black uppercase py-3 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                Add to ${activePlan.name}
            </button>
          ` : `
             <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-2">
                <label class="text-[9px] font-black text-slate-400 uppercase block mb-1">Quick Assign</label>
                <div class="flex gap-2">
                  <select id="courier-select-${o.id}" class="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] font-bold">
                    <option value="">Select Courier...</option>
                  </select>
                  <button id="assign-btn-${o.id}" class="bg-blue-600 text-white text-[10px] font-black px-3 rounded-lg">Go</button>
                </div>
             </div>
          `}

          <div class="pt-2 border-t border-slate-50 mt-2">
            <button id="toggle-details-${o.id}" class="text-[9px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">Advanced Settings...</button>
            <div id="details-${o.id}" class="hidden space-y-3 mt-3">
               <div>
                  <label class="text-[9px] font-black uppercase text-slate-400 block mb-1">Select Plan</label>
                  <select id="plan-select-${o.id}" class="text-[11px] bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 w-full">
                    <option value="">Choose Route...</option>
                  </select>
               </div>
               <button id="plan-btn-${o.id}" class="w-full bg-slate-900 text-white text-[10px] font-black py-2 rounded-xl">Add to Selected Plan</button>
            </div>
          </div>
        </div>
      </div>`

    const marker = L.marker(coords, { icon: unassignedIcon })
      .addTo(map)
      .bindPopup(popupContainer)

    // 🔴 If route mode or bulk selection is active: click marker to toggle selection
    marker.on('click', (e: any) => {
      if (activeDrawMode.value === 'route') {
        L.DomEvent.stopPropagation(e)
        marker.closePopup()
        toggleRouteStop({ type: 'unassigned', data: o, coords })
        return
      }

      if (selectedOrders.value.length === 0) return // Let popup open normally
      L.DomEvent.stopPropagation(e)
      marker.closePopup()
      const idx = selectedOrders.value.findIndex(s => s.data.id === o.id)
      if (idx !== -1) {
        // Deselect
        selectedOrders.value.splice(idx, 1)
      } else {
        // Add to selection (only if it's truly unassigned)
        selectedOrders.value.push({ type: 'unassigned', data: o, coords })
      }
    })

    marker.on('popupopen', () => {
      const addPlanBtn = document.getElementById(`add-plan-btn-${o.id}`)
      const toggleBtn = document.getElementById(`toggle-details-${o.id}`)
      const detailsDiv = document.getElementById(`details-${o.id}`)
      
      if (addPlanBtn && activePlan) addPlanBtn.onclick = () => toggleOrderInPlan(o.id, activePlan.id, 'add')
      if (toggleBtn && detailsDiv) toggleBtn.onclick = () => detailsDiv.classList.toggle('hidden')

      const courierSelect = document.getElementById(`courier-select-${o.id}`) as HTMLSelectElement
      const assignBtn = document.getElementById(`assign-btn-${o.id}`) as HTMLButtonElement
      
      if (courierSelect && assignBtn) {
        couriers.value.forEach(c => {
          const opt = document.createElement('option')
          opt.value = c.id; opt.text = c.name; courierSelect.appendChild(opt)
        })
        assignBtn.onclick = () => {
          const cId = parseInt(courierSelect.value)
          if (cId) {
            quickAssign.value[o.id] = cId
            assignQuickly(o.id)
          }
        }
      }

      const planSelect = document.getElementById(`plan-select-${o.id}`) as HTMLSelectElement
      const planBtn = document.getElementById(`plan-btn-${o.id}`) as HTMLButtonElement

      if (planSelect) {
        // 1. Populate dropdown with DRAFT plans only
        plans.value.filter(p => p.status === 'draft').forEach(p => {
          const opt = document.createElement('option')
          opt.value = p.id; opt.text = p.name; planSelect.appendChild(opt)
        })

        // 2. Set click listener for the assignment button
        if (planBtn) {
          planBtn.onclick = () => {
            const pId = parseInt(planSelect.value)
            if (pId) toggleOrderInPlan(o.id, pId, 'add')
          }
        }
      }
    })

    markers.push(marker)
  })

  // Finalize counts
  markersCount.value = parsedCount
  missingGpsCount.value = (deliveries.length + unassignedOrders.length) - parsedCount
}

function focusCourier(d: any) {
  if (d.courier_lat && d.courier_lng && map) {
    map.setView([d.courier_lat, d.courier_lng], 15)
  }
}

async function updateDelivery(id: number, payload: any) {
  try {
    const btn = document.getElementById(`save-all-${id}`) as HTMLButtonElement 
             || document.getElementById(`save-all-dest-${id}`) as HTMLButtonElement
             || document.getElementById(`reassign-btn-${id}`) as HTMLButtonElement
             || document.getElementById(`reassign-btn-dest-${id}`) as HTMLButtonElement
             
    if (btn) btn.disabled = true;

    // The backend already handles order_custom_id within delivery update,
    // so we don't need a separate call unless we're ONLY updating the order.
    await api.put(`/admin/deliveries/${id}`, payload)
    await fetchLive(true) // FORCE refresh markers
    showToast('Update Success!')
  } catch (e: any) {
    console.error('Update failed:', e)
    const errorMsg = e.data?.message || e.message || 'Unknown error'
    showToast('Update Failed: ' + errorMsg, false)
    const btn = document.getElementById(`save-all-${id}`) as HTMLButtonElement 
             || document.getElementById(`save-all-dest-${id}`) as HTMLButtonElement
             || document.getElementById(`reassign-btn-${id}`) as HTMLButtonElement
             || document.getElementById(`reassign-btn-dest-${id}`) as HTMLButtonElement
    if (btn) btn.disabled = false;
  }
}

async function removeDelivery(id: number) {
  if (!confirm('Remove this delivery assignment?')) return
  try {
    await api.del(`/admin/deliveries/${id}`)
    await fetchLive()
    showToast('Assignment Removed')
  } catch (e: any) {
    showToast('Remove Failed: ' + (e.data?.message || 'Error'), false)
  }
}

async function assignQuickly(orderId: number) {
  const courierId = quickAssign.value[orderId]
  if (!courierId) {
    showToast('Please select a courier', false)
    return
  }

  try {
    const btn = document.getElementById(`assign-btn-${orderId}`) as HTMLButtonElement
    const dateInput = document.getElementById(`planned-date-${orderId}`) as HTMLInputElement
    if(btn) btn.disabled = true;

    await api.post('/admin/deliveries', {
      order_id: orderId,
      courier_id: courierId,
      status: 'pending',
      planned_delivery_date: dateInput?.value || null
    })
    
    // Refresh map to move it from unassigned to active delivery
    await fetchLive(true) // FORCE refresh
    delete quickAssign.value[orderId]
    showToast('Order Assigned Successfully!')
  } catch (e: any) {
    showToast('Assignment Failed', false)
    const btn = document.getElementById(`assign-btn-${orderId}`) as HTMLButtonElement
    if(btn) btn.disabled = false;
  }
}

const toast = reactive({ show: false, message: '', success: true })
function showToast(msg: string, isSuccess = true) {
  toast.message = msg
  toast.success = isSuccess
  toast.show = true
  setTimeout(() => toast.show = false, 3000)
}
</script>

<style>
@import 'leaflet/dist/leaflet.css';

.plan-pulse {
  animation: plan-pulse-ring 2s infinite;
}
@keyframes plan-pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
}

#admin-map.drawing-route-active .leaflet-marker-pane,
#admin-map.drawing-route-active .leaflet-popup-pane {
  pointer-events: none !important;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
