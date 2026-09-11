<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900">Delivery Management</h1>
        <p class="text-slate-500 text-sm mt-1">Assign orders to couriers and track deliveries.</p>
      </div>
      <div class="flex gap-3 items-center">
        <NuxtLink to="/admin/deliveries/kpi" class="btn-secondary flex items-center gap-2 text-xs">
          <Icon name="heroicons:chart-bar" class="w-4 h-4" /> KPI
        </NuxtLink>
        <!-- View Nav Pill -->
        <div class="flex items-center bg-slate-100 rounded-xl p-1">
          <NuxtLink to="/admin/deliveries/map" class="px-4 py-2 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1.5">🗺 Map</NuxtLink>
          <NuxtLink to="/admin/deliveries/plans" class="px-4 py-2 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all flex items-center gap-1.5">📁 Plans</NuxtLink>
          <span class="px-4 py-2 rounded-lg text-[10px] font-black uppercase bg-white text-blue-600 shadow-sm flex items-center gap-1.5">📋 List</span>
        </div>
        <NuxtLink to="/admin/settings" class="btn-secondary flex items-center gap-2 text-xs">
          <Icon name="heroicons:cog-6-tooth" class="w-4 h-4" /> Settings
        </NuxtLink>
      </div>
    </div>

    <!-- 🚨 OVERDUE ALERT BANNER -->
    <div v-if="kpi.overdue > 0" 
      class="relative overflow-hidden rounded-2xl border-2 border-red-300 bg-red-50 px-5 py-4 flex items-start gap-4 shadow-lg shadow-red-100 animate-pulse-border">
      <!-- Pulsing left accent -->
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-2xl"></div>
      
      <div class="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0 ml-1.5">
        <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" />
      </div>
      
      <div class="flex-1 min-w-0">
        <p class="text-sm font-black text-red-700 uppercase tracking-wide">
          ⚠️ {{ kpi.overdue }} Overdue {{ kpi.overdue === 1 ? 'Delivery' : 'Deliveries' }} Need Immediate Attention!
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          <span v-for="row in overdueRows.slice(0, 5)" :key="row.delivery_id"
            class="text-[10px] font-black text-red-600 bg-red-100 border border-red-200 px-2 py-1 rounded-lg uppercase">
            {{ row.shop_name }} — Deadline {{ row.deadline_at ? new Date(row.deadline_at).toLocaleDateString() : '?' }}
          </span>
          <span v-if="overdueRows.length > 5" class="text-[10px] font-black text-red-400 italic px-2 py-1">
            +{{ overdueRows.length - 5 }} more
          </span>
        </div>
      </div>
      
      <button @click="filters.status = 'overdue'" 
        class="shrink-0 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all">
        View All
      </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
        <p class="text-2xl font-black text-slate-900">{{ kpi.total }}</p>
        <p class="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-widest">Total</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
        <p class="text-2xl font-black text-blue-600">{{ kpi.in_transit }}</p>
        <p class="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-widest">In Transit</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
        <p class="text-2xl font-black text-emerald-600">{{ kpi.delivered }}</p>
        <p class="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-widest">Delivered</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
        <p class="text-2xl font-black text-red-500">{{ kpi.overdue }}</p>
        <p class="text-[10px] text-slate-400 uppercase font-black mt-1 tracking-widest">Overdue</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="space-y-3">
      <div class="flex gap-3 flex-wrap lg:flex-nowrap">
        <div class="relative w-full lg:flex-1">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model="filters.search" type="text" placeholder="Search shop, SO#, customer ID..." class="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-sm" />
        </div>
        <div class="grid grid-cols-2 gap-3 w-full lg:w-auto">
          <select v-model="filters.status" class="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none min-w-[140px]">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="overdue">Overdue</option>
          </select>
          <select v-model="filters.courier_id" class="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none min-w-[140px]">
            <option value="">All Couriers</option>
            <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>
      
      <div class="flex gap-3 flex-wrap items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">
          <Icon name="heroicons:funnel" class="w-3.5 h-3.5" />
          Location & Date
        </div>
        
        <div class="flex-1 flex flex-wrap lg:flex-nowrap gap-3">
          <!-- Date Type Toggle -->
          <div class="flex items-center bg-white border border-slate-200 rounded-xl p-1 h-10 shadow-sm">
            <button v-for="type in [
              { id: 'created_at', label: 'Order' },
              { id: 'delivery_date', label: 'Request' },
              { id: 'planned_delivery_date', label: 'Plan' }
            ]" :key="type.id"
              @click="filters.date_type = type.id"
              :class="filters.date_type === type.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'"
              class="px-3 h-full rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
              {{ type.label }}
            </button>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
            <input type="date" v-model="filters.delivery_date" 
              class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm h-10" />
            
            <select v-model="filters.province" @change="filters.districts = []; filters.communes = []"
              class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm h-10 appearance-none">
              <option value="">All Provinces</option>
              <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
            </select>

            <!-- Multi-District -->
            <div class="relative">
              <button @click="showDistrictDropdown = !showDistrictDropdown" :disabled="!filters.province"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm h-10 flex items-center justify-between disabled:opacity-50">
                <span class="truncate">{{ filters.districts.length ? filters.districts.length + ' Dist.' : 'All Districts' }}</span>
                <Icon name="heroicons:chevron-down" class="w-3.5 h-3.5 text-slate-400" />
              </button>
              <div v-if="showDistrictDropdown" class="absolute top-full left-0 right-0 z-[60] mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 max-h-60 overflow-y-auto">
                <div class="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <span class="text-[9px] font-black uppercase text-slate-400">Select Districts</span>
                  <button @click="showDistrictDropdown = false" class="text-slate-400 hover:text-slate-600"><Icon name="heroicons:x-mark" class="w-4 h-4" /></button>
                </div>
                <div class="space-y-1.5">
                  <label v-for="d in districts" :key="d" class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input type="checkbox" :value="d" v-model="filters.districts" @change="filters.communes = []" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-xs font-bold text-slate-700">{{ d }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Multi-Commune -->
            <div class="relative">
              <button @click="showCommuneDropdown = !showCommuneDropdown" :disabled="!filters.districts.length"
                class="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm h-10 flex items-center justify-between disabled:opacity-50">
                <span class="truncate">{{ filters.communes.length ? filters.communes.length + ' Comm.' : 'All Communes' }}</span>
                <Icon name="heroicons:chevron-down" class="w-3.5 h-3.5 text-slate-400" />
              </button>
              <div v-if="showCommuneDropdown" class="absolute top-full left-0 right-0 z-[60] mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 max-h-60 overflow-y-auto">
                <div class="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                  <span class="text-[9px] font-black uppercase text-slate-400">Select Communes</span>
                  <button @click="showCommuneDropdown = false" class="text-slate-400 hover:text-slate-600"><Icon name="heroicons:x-mark" class="w-4 h-4" /></button>
                </div>
                <div class="space-y-1.5">
                  <label v-for="c in communes" :key="c" class="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input type="checkbox" :value="c" v-model="filters.communes" class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span class="text-xs font-bold text-slate-700">{{ c }}</span>
                  </label>
                </div>
              </div>
            </div>

            <select v-model="filters.delivery_plan_id"
              class="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm h-10 appearance-none">
              <option value="">All Plans</option>
              <option value="unplanned">Unplanned Only</option>
              <option v-for="p in plans" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>

        <button @click="resetFilters" class="text-[10px] font-black text-blue-600 uppercase hover:text-blue-700 px-2 transition-colors">
          Reset
        </button>
      </div>
    </div>

    <!-- MAIN GRID LAYOUT -->
    <div class="grid grid-cols-12 gap-6 items-start pt-4 pb-20">
      <!-- Left Column: Orders Table -->
      <div class="col-span-12 lg:col-span-8 xl:col-span-9 space-y-8">
        
        <!-- SECTION: NEED TO ASSIGN -->
        <div class="space-y-4">
          <div class="flex items-center justify-between px-2">
            <h2 class="text-xl font-black text-slate-900 flex items-center gap-3">
              <div class="bg-amber-400 w-2.5 h-7 rounded-full shadow-sm"></div>
              Need to Assign
              <span class="text-[10px] font-black bg-slate-100 text-slate-400 uppercase tracking-widest px-2.5 py-1 rounded-xl">
                {{ unassignedFiltered.length }} Items
              </span>
            </h2>
            
            <button @click="showAssigned = !showAssigned" 
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200"
              :class="showAssigned ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-white text-slate-500 hover:bg-slate-50'">
              <Icon :name="showAssigned ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
              {{ showAssigned ? 'Hide Assigned' : 'Show Assigned' }}
            </button>
          </div>

          <!-- MOBILE CARD VIEW -->
          <div class="lg:hidden space-y-4">
            <div v-for="row in unassignedFiltered" :key="row._key" 
              class="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm relative overflow-hidden transition-all active:scale-[0.98]"
              :class="stagedOrders.includes(row.order_id) ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''"
              @click="toggleStaged(row.order_id)">
              
              <div class="flex justify-between items-start mb-4">
                <div class="flex gap-3">
                  <input type="checkbox" :checked="stagedOrders.includes(row.order_id)" @change="toggleStaged(row.order_id)" class="w-6 h-6 rounded-lg border-slate-300 text-blue-600" @click.stop />
                  <div>
                    <h3 class="font-black text-slate-900 text-base leading-tight">{{ row.shop_name }}</h3>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">ORD #{{ row.order_custom_id || row.order_id }}</p>
                  </div>
                </div>
                <span v-if="row.status === 'shop_closed'" class="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">🏪 Shop Closed</span>
                <span v-else class="bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">Unassigned</span>
              </div>

              <div class="bg-slate-50/50 rounded-2xl p-4 mb-4 border border-slate-100">
                <div class="flex items-start gap-2 mb-3">
                  <Icon name="heroicons:map-pin" class="w-4 h-4 text-slate-400 mt-0.5" />
                  <p class="text-[11px] text-slate-600 font-medium leading-relaxed">{{ row.customer_address || 'No address' }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1.5">
                    <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-blue-400" />
                    <p class="text-[10px] text-slate-500 font-bold">Req: {{ fmtDate(row.delivery_date) }}</p>
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <button @click.stop="openEdit(row)" class="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">Edit</button>
                <button @click.stop="openAssign(row)" class="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">Assign</button>
              </div>
            </div>
            
            <div v-if="unassignedFiltered.length === 0" class="py-12 text-center">
              <p class="text-slate-300 font-black uppercase tracking-widest text-[10px]">No orders to assign</p>
            </div>
          </div>

          <!-- DESKTOP TABLE VIEW (Simplified) -->
          <div class="hidden lg:block bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm transition-all"
            :class="{ 'opacity-50 grayscale-[0.2]': stagedOrders.length > 0 && !stagedOrders.includes(unassignedFiltered[0]?.order_id) && false }">
            <div class="overflow-x-auto relative">
              <table class="w-full text-left text-sm border-separate border-spacing-0">
                <thead>
                  <tr class="bg-slate-50/95 backdrop-blur-sm">
                    <th class="px-4 py-5 border-b-2 border-slate-100 w-12 text-center">
                      <input type="checkbox" :checked="isAllStaged" @change="toggleAllStaged" class="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </th>
                    <th class="px-3 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">Order & Status</th>
                    <th class="px-3 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">Location</th>
                    <th class="px-3 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">Schedule</th>
                    <th class="px-3 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="row in unassignedFiltered" :key="row._key" 
                    class="transition-all cursor-pointer group"
                    :class="stagedOrders.includes(row.order_id) ? 'bg-blue-50/80 ring-1 ring-blue-200 shadow-inner' : 'hover:bg-slate-50/50'"
                    @click="toggleStaged(row.order_id)">
                    
                    <!-- Checkbox -->
                    <td class="px-4 py-5 text-center" @click.stop>
                      <input type="checkbox" :checked="stagedOrders.includes(row.order_id)" @change="toggleStaged(row.order_id)" class="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    </td>

                    <!-- Order & Status -->
                    <td class="px-5 py-5">
                      <div class="flex items-center gap-3">
                        <div class="w-1.5 h-10 rounded-full" :class="row.is_overdue ? 'bg-red-500' : 'bg-amber-400'"></div>
                        <div>
                          <div class="font-black text-slate-900 text-sm leading-tight">{{ row.shop_name }}</div>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ORD #{{ row.order_custom_id || row.order_id }}</span>
                            <span v-if="row.status === 'shop_closed'" class="bg-purple-50 text-purple-700 border-purple-200 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider">
                              🏪 Shop Closed (Unassigned)
                            </span>
                            <span v-else :class="row.is_overdue ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'" 
                              class="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider">
                              {{ row.is_overdue ? 'Overdue' : 'Unassigned' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Location -->
                    <td class="px-5 py-5">
                      <div class="flex flex-col">
                        <span class="text-[11px] font-black text-slate-700 leading-tight line-clamp-1">{{ row.customer_address || 'No address' }}</span>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                          {{ [row.province, row.district].filter(Boolean).join(' • ') }}
                        </span>
                      </div>
                    </td>

                    <!-- Schedule -->
                    <td class="px-5 py-5">
                      <div class="flex items-center gap-8">
                        <div class="shrink-0">
                          <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Submitted</p>
                          <p class="text-[11px] font-bold text-slate-600 whitespace-nowrap">{{ fmtDate(row.created_at) }}</p>
                        </div>
                        <div class="shrink-0">
                          <p class="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Required</p>
                          <p class="text-[11px] font-bold text-blue-600 whitespace-nowrap">{{ fmtDate(row.delivery_date) }}</p>
                        </div>
                      </div>
                    </td>

                    <!-- Actions -->
                    <td class="px-5 py-5" @click.stop>
                      <div class="flex items-center justify-center gap-2">
                        <button @click="openEdit(row)" class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm">
                          <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                        </button>
                        <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1 pr-2">
                          <select v-model="quickAssign[row.order_id]" class="bg-transparent border-none text-[10px] font-bold px-2 focus:outline-none min-w-[80px]">
                            <option value="" disabled>Select...</option>
                            <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                          </select>
                          <button @click="assignQuickly(row)" :disabled="!quickAssign[row.order_id]" 
                            class="bg-blue-600 text-white w-6 h-6 rounded-lg flex items-center justify-center disabled:opacity-20 transition-all">
                            <Icon name="heroicons:chevron-right" class="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="unassignedFiltered.length === 0">
                    <td colspan="5" class="px-6 py-20 text-center">
                      <Icon name="heroicons:check-circle" class="w-12 h-12 mx-auto text-emerald-100 mb-4" />
                      <p class="text-slate-300 font-black uppercase tracking-[0.2em] text-xs">All caught up! No orders to assign.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SECTION: ALREADY ASSIGNED (Toggleable) -->
        <div v-if="showAssigned" class="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 class="text-xl font-black text-slate-900 px-2 flex items-center gap-3">
            <div class="bg-blue-500 w-2.5 h-7 rounded-full shadow-sm"></div>
            Already Assigned
            <span class="text-[10px] font-black bg-slate-100 text-slate-400 uppercase tracking-widest px-2.5 py-1 rounded-xl">
              {{ assignedFiltered.length }} Items
            </span>
          </h2>

          <div class="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
            <div class="overflow-x-auto relative">
              <table class="w-full text-left text-sm border-separate border-spacing-0">
                <thead>
                  <tr class="bg-slate-50/95 backdrop-blur-sm">
                    <th class="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pl-8">Order</th>
                    <th class="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">Courier</th>
                    <th class="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100">Status</th>
                    <th class="px-3 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="row in assignedFiltered" :key="row._key" class="hover:bg-slate-50/50 transition-colors group">
                    <td class="px-5 py-4 pl-8">
                      <div class="font-black text-slate-900 text-sm leading-tight">{{ row.shop_name }}</div>
                      <div class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">ORD #{{ row.order_custom_id || row.order_id }}</div>
                    </td>
                    <td class="px-5 py-4">
                      <div v-if="row.is_direct_sale" class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                          <Icon name="heroicons:bolt" class="w-4 h-4" />
                        </div>
                        <div>
                          <span class="text-xs font-black text-emerald-700 block">Direct Drop</span>
                          <span class="text-[9px] font-bold text-slate-400">{{ row.courier_name }}</span>
                        </div>
                      </div>
                      <div v-else class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <Icon name="heroicons:truck" class="w-4 h-4" />
                        </div>
                        <span class="text-xs font-black text-slate-700">{{ row.courier_name || 'Unassigned' }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span :class="{
                          'bg-blue-50 text-blue-600 border-blue-200': row.status === 'in_transit',
                          'bg-emerald-50 text-emerald-600 border-emerald-200': row.status === 'delivered',
                          'bg-red-50 text-red-600 border-red-200': row.status === 'shop_closed' || row.is_overdue,
                          'bg-rose-50 text-rose-600 border-rose-200': row.status === 'customer_cancelled',
                        }" class="px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider">
                          {{ (row.status || '').replace(/_/g, ' ') }}
                        </span>
                        <span v-if="row.is_direct_sale" class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[8px] font-black uppercase tracking-wider">
                          ⚡ Direct
                        </span>
                      </div>
                    </td>
                    <td class="px-5 py-4">
                      <div v-if="row.is_direct_sale" class="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Completed
                      </div>
                      <div v-else class="flex items-center justify-center gap-2">
                        <button @click="openAssign(row)" class="text-[9px] font-black uppercase text-blue-600 hover:underline">Reassign</button>
                        <button @click="removeDelivery(row.delivery_id)" class="text-red-400 hover:text-red-600 transition-colors">
                          <Icon name="heroicons:trash" class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Route Builder Sidebar -->
      <aside class="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6 sticky top-6">
        <div class="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
          <!-- Ambient Glow -->
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div class="relative z-10 space-y-8">
            <div>
              <h3 class="text-2xl font-black tracking-tight">Route Builder</h3>
              <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">Optimize Your Dispatch</p>
            </div>

            <!-- STEP 1: SELECTION -->
            <div class="space-y-4" @click="cartStep = 1">
              <div class="flex items-center gap-3 cursor-pointer">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all"
                  :class="cartStep === 1 ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800 border-white/10 text-slate-500'">1</div>
                <h4 class="text-[10px] font-black uppercase tracking-widest" :class="cartStep === 1 ? 'text-white' : 'text-slate-500'">Select Orders</h4>
              </div>
              
              <div v-if="cartStep === 1" class="animate-in fade-in zoom-in-95 duration-300">
                <div v-if="stagedOrders.length === 0" class="bg-white/5 border border-dashed border-white/10 rounded-3xl p-8 text-center">
                  <Icon name="heroicons:cursor-arrow-ripple" class="w-8 h-8 mx-auto text-slate-600 mb-3 animate-bounce" />
                  <p class="text-[10px] font-black text-slate-500 uppercase leading-relaxed tracking-widest">
                    Tap rows or checkboxes<br>to stage orders here
                  </p>
                </div>

                <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                  <div v-for="orderId in stagedOrders" :key="orderId" 
                    class="flex justify-between items-center bg-white/5 hover:bg-white/10 rounded-2xl p-3 border border-white/5 transition-all">
                    <div class="min-w-0 pr-4">
                      <p class="text-[11px] font-black text-white truncate">{{ getOrderDetails(orderId)?.shop_name }}</p>
                      <p class="text-[8px] font-bold text-slate-500 uppercase mt-0.5 truncate">{{ getOrderDetails(orderId)?.district }}</p>
                    </div>
                    <button @click.stop="toggleStaged(orderId)" class="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shrink-0">
                      <Icon name="heroicons:minus-small" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: CONFIGURE -->
            <div class="space-y-4 transition-all" :class="{ 'opacity-20 grayscale pointer-events-none': stagedOrders.length === 0 }" @click="cartStep = 2">
              <div class="flex items-center gap-3 cursor-pointer">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all"
                  :class="cartStep === 2 ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-800 border-white/10 text-slate-500'">2</div>
                <h4 class="text-[10px] font-black uppercase tracking-widest" :class="cartStep === 2 ? 'text-white' : 'text-slate-500'">Route Info</h4>
              </div>
              
              <div v-if="cartStep === 2" class="space-y-4 bg-white/5 p-5 rounded-3xl border border-white/5 animate-in fade-in zoom-in-95 duration-300">
                <div class="space-y-1.5">
                  <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Plan Name</label>
                  <input v-model="stagedRouteName" placeholder="e.g. Morning Route #1" 
                    class="w-full bg-slate-800/50 border border-white/10 text-white text-xs font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" />
                </div>
                <div class="space-y-1.5">
                  <div class="flex justify-between items-center ml-1">
                    <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Courier (Optional)</label>
                    <span v-if="!stagedCourier" class="text-[8px] font-black text-amber-500 uppercase tracking-tighter">Draft Mode</span>
                  </div>
                  <select v-model="stagedCourier" 
                    class="w-full bg-slate-800/50 border border-white/10 text-white text-xs font-bold rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer">
                    <option value="">Decide Later (Draft)</option>
                    <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- STEP 3: DISPATCH / SAVE -->
            <div class="space-y-4 pt-4" :class="{ 'opacity-20 grayscale pointer-events-none': stagedOrders.length === 0 || !stagedRouteName }">
              <button @click="dispatchCartRoute" :disabled="cartLoading"
                class="w-full group relative overflow-hidden py-4 rounded-[24px] text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl"
                :class="cartLoading ? 'bg-slate-800' : (!stagedCourier ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20' : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20 hover:from-emerald-300 hover:to-emerald-500')">
                <div class="relative z-10 flex items-center justify-center gap-3">
                  <Icon v-if="cartLoading" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                  <template v-else>
                    <Icon v-if="!stagedCourier" name="heroicons:folder-plus" class="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <Icon v-else name="heroicons:paper-airplane" class="w-5 h-5 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    {{ cartLoading ? 'Processing...' : (!stagedCourier ? 'Save Draft Route' : 'Dispatch Route') }}
                  </template>
                </div>
              </button>
              <p v-if="!stagedCourier && stagedRouteName" class="text-[8px] font-black text-center text-slate-500 uppercase tracking-widest opacity-60">You can assign a courier later in Map view</p>
            </div>
          </div>
        </div>

        <!-- Mini Analytics -->
        <div class="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
            <span class="text-xs font-black text-emerald-600">{{ Math.round((kpi.delivered / kpi.total) * 100) || 0 }}%</span>
          </div>
          <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div class="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :style="{ width: ((kpi.delivered / kpi.total) * 100 || 0) + '%' }"></div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-slate-50 rounded-3xl border border-slate-100 text-center">
              <p class="text-lg font-black text-slate-900 leading-none mb-1">{{ kpi.in_transit }}</p>
              <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active</p>
            </div>
            <div class="p-4 bg-red-50 rounded-3xl border border-red-100 text-center">
              <p class="text-lg font-black text-red-600 leading-none mb-1">{{ kpi.overdue }}</p>
              <p class="text-[8px] font-black text-red-400 uppercase tracking-widest">Overdue</p>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- FLOATING SELECTION BAR (Sticky Bottom) -->
    <Transition name="fade-up">
      <div v-if="stagedOrders.length > 0" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[40] w-full max-w-2xl px-4 lg:pl-[15%]">
        <div class="bg-slate-900 text-white rounded-[32px] p-3 pl-8 flex items-center justify-between shadow-2xl ring-4 ring-white/10 backdrop-blur-xl">
          <div class="flex items-center gap-6">
            <div>
              <p class="text-sm font-black text-white leading-none">{{ stagedOrders.length }} Selected</p>
              <button @click="stagedOrders = []" class="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-red-400 transition-colors mt-1">Clear Cart</button>
            </div>
            <div class="w-px h-8 bg-white/10 hidden sm:block"></div>
            <div class="hidden sm:flex items-center gap-2">
              <div v-for="orderId in stagedOrders.slice(0, 3)" :key="orderId" class="w-8 h-8 rounded-lg bg-white/10 border border-white/5 flex items-center justify-center text-[10px] font-black overflow-hidden truncate px-1">
                {{ getOrderDetails(orderId)?.shop_name?.charAt(0) }}
              </div>
              <div v-if="stagedOrders.length > 3" class="text-[10px] font-black text-slate-500 ml-1">+{{ stagedOrders.length - 3 }} more</div>
            </div>
          </div>
          
          <button @click="cartStep = 2" 
            class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3">
            Build Route
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- MOBILE FAB FOR CART (Visible if orders selected) -->
    <div v-if="stagedOrders.length > 0" class="lg:hidden fixed bottom-6 right-6 z-50">
      <button @click="cartStep = 2" class="w-16 h-16 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center relative">
        <Icon name="heroicons:shopping-cart" class="w-7 h-7" />
        <span class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-4 border-white flex items-center justify-center text-[10px] font-black">
          {{ stagedOrders.length }}
        </span>
      </button>
    </div>



    <!-- Assign Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
          <h3 class="text-xl font-black text-slate-900 mb-6">{{ editing ? 'Reassign Delivery' : 'Assign Delivery' }}</h3>
          <form @submit.prevent="saveDelivery" class="space-y-5">
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Courier</label>
              <select v-model="form.courier_id" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-400" required>
                <option value="">Select courier...</option>
                <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div v-if="formError" class="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-xs">{{ formError }}</div>
            <div class="flex gap-4 pt-2">
              <button type="button" @click="showModal = false" class="h-12 flex-1 rounded-2xl text-sm font-black uppercase text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" class="h-12 flex-1 rounded-2xl text-sm font-black uppercase text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">{{ editing ? 'Update' : 'Assign' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[200]">
        <div class="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <Icon name="heroicons:check-circle" class="w-5 h-5 text-emerald-400" />
          <span class="text-sm font-black uppercase tracking-widest">{{ toast.message }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const api = useApi()
const authStore = useAuthStore()

// Robust date formatter that avoids timezone shifting for date-only fields
const fmtDate = (dateVal: any) => {
  if (!dateVal) return '—'
  const s = String(dateVal)
  // If it's already a plain YYYY-MM-DD string, just reformat it to MM/DD/YYYY or similar
  if (s.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const parts = s.split('-')
    if (parts.length === 3) {
      const [y, m, d] = parts
      return `${parseInt(m!)}/${parseInt(d!)}/${y}`
    }
  }
  // Otherwise parse as Date and use local methods
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return '—'
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
}

// Helper for filtering comparison (returns YYYY-MM-DD local)
const getLocalDateStr = (dateVal: any) => {
  if (!dateVal) return ''
  const s = String(dateVal)
  if (s.length === 10 && /^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const deliveries = ref<any[]>([])
const couriers = ref<any[]>([])
const unassignedOrders = ref<any[]>([])
const kpi = ref({ total: 0, delivered: 0, in_transit: 0, overdue: 0, on_time_rate: 0 })
const showModal = ref(false)
const editing = ref<any>(null)
const formError = ref('')
const form = reactive({ courier_id: '', order_id: '' })
const quickAssign = reactive<Record<number, string>>({})
const route = useRoute()
const router = useRouter()

const filters = reactive({ 
  search: (route.query.search as string) || '', 
  status: (route.query.status as string) || '', 
  courier_id: (route.query.courier_id as string) || '',
  date_type: (route.query.date_type as string) || 'delivery_date',
  delivery_date: (route.query.delivery_date as string) || '',
  province: (route.query.province as string) || '',
  districts: Array.isArray(route.query.districts) ? route.query.districts : (route.query.districts ? [route.query.districts] : []),
  communes: Array.isArray(route.query.communes) ? route.query.communes : (route.query.communes ? [route.query.communes] : []),
  delivery_plan_id: (route.query.delivery_plan_id as string) || ''
})

const showDistrictDropdown = ref(false)
const showCommuneDropdown = ref(false)
const draftPlans = computed(() => {
  return plans.value.filter(p => p.status === 'draft')
})
const plans = ref<any[]>([])
const quickPlanName = ref('')
const planLoading = ref(false)



const showPlanManager = ref(false)
const planForm = reactive({ id: null, name: '', date: '', description: '', courier_id: '', status: 'draft' })

watch(filters, (newVal) => {
  router.replace({ query: { ...route.query, ...newVal } })
}, { deep: true })

const bulkForm = reactive({ plan_id: '', courier_id: '', new_plan_name: '' })
const bulkLoading = ref(false)

const resetFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.courier_id = ''
  filters.date_type = 'delivery_date'
  filters.delivery_date = ''
  filters.province = ''
  filters.districts = []
  filters.communes = []
  filters.delivery_plan_id = ''
}

const toast = reactive({ show: false, message: '' })
const cancelConfirm = reactive<Record<string, boolean>>({})

// ==========================================
// ROUTE CART LOGIC
// ==========================================
const stagedOrders = ref<number[]>([])
const stagedCourier = ref('')
const stagedRouteName = ref('')
const cartLoading = ref(false)
const showAssigned = ref(false) // Toggle for "Already Assigned" section
const cartStep = ref(1) // 1: Select, 2: Configure, 3: Dispatch

const isAllStaged = computed(() => {
  if (unassignedFiltered.value.length === 0) return false
  return unassignedFiltered.value.every(row => stagedOrders.value.includes(row.order_id))
})

function toggleAllStaged() {
  if (isAllStaged.value) {
    // Deselect all filtered
    const filteredIds = unassignedFiltered.value.map(r => r.order_id)
    stagedOrders.value = stagedOrders.value.filter(id => !filteredIds.includes(id))
  } else {
    // Select all filtered
    const toAdd = unassignedFiltered.value.map(r => r.order_id).filter(id => !stagedOrders.value.includes(id))
    stagedOrders.value.push(...toAdd)
  }
}

function toggleStaged(orderId: number) {
  const idx = stagedOrders.value.indexOf(orderId)
  if (idx === -1) {
    stagedOrders.value.push(orderId)
  } else {
    stagedOrders.value.splice(idx, 1)
  }
}

function getOrderDetails(orderId: number) {
  return unassignedFiltered.value.find(r => r.order_id === orderId)
}

async function dispatchCartRoute() {
  if (!stagedRouteName.value || stagedOrders.value.length === 0) return
  cartLoading.value = true
  
  try {
    const today = new Date().toISOString().split('T')[0]
    const hasCourier = !!stagedCourier.value
    
    // 1. Create plan always as 'draft' first
    const plan = await api.post('/admin/delivery-plans', { 
      name: stagedRouteName.value, 
      date: today,
      status: 'draft',
      courier_id: stagedCourier.value || null
    }) as any
    
    // 2. Assign deliveries to the draft plan
    await api.post(`/admin/delivery-plans/${plan.id}/assign-orders`, { 
      order_ids: stagedOrders.value 
    })

    // 3. If a courier was assigned, apply (dispatch) the plan
    if (hasCourier) {
      await api.post(`/admin/delivery-plans/${plan.id}/apply`, {})
    }

    // Reset Cart
    stagedOrders.value = []
    stagedRouteName.value = ''
    stagedCourier.value = ''
    cartStep.value = 1
    
    // Refresh
    await Promise.all([
      fetchOrders(),
      fetchDeliveries(),
      fetchDeliveryPlans()
    ])
    
    showToast(hasCourier ? 'Route Dispatched Successfully! 🚚' : 'Draft Route Saved! 📁')
  } catch (e) {
    console.error(e)
    alert('Failed to process route')
  } finally {
    cartLoading.value = false
  }
}
// ==========================================
const cancelLoading = reactive<Record<string, boolean>>({})

// Separate reactive state for edit panels (keyed by row._key)
const editState = reactive<Record<string, { open: boolean; soNumber: string; customerId: string; plan: string }>>({})

function openEdit(row: any) {
  editState[row._key] = {
    open: true,
    soNumber: row.so_number || '',
    customerId: row.customer_id || '',
    plan: row.planned_delivery_date ? (new Date(row.planned_delivery_date).toISOString().split('T')[0] ?? '') : '',
  }
}
function closeEdit(key: string) {
  if (editState[key]) editState[key].open = false
}

const unassignedFiltered = computed(() => {
  const unassigned = unassignedOrders.value.map((o: any) => ({
    _key: `order-${o.id}`,
    order_id: o.id,
    delivery_id: o.delivery?.id ?? null,
    shop_name: o.shop_name,
    customer_name: o.customer_address,
    customer_address: o.customer_address,
    customer_id: o.customer_id,
    province: o.province,
    district: o.district,
    commune: o.commune,
    order_custom_id: o.order_custom_id,
    delivery_custom_id: o.delivery?.delivery_custom_id ?? null,
    planned_delivery_date: o.delivery?.planned_delivery_date ?? null,
    created_at: o.created_at,
    delivery_date: o.delivery_date,
    courier_id: null,
    courier_name: null,
    status: o.delivery?.status ?? null,
    is_overdue: false,
    _editIds: false, _editPlan: false,
    _tmpOrderId: o.order_custom_id || '',
    _tmpDelId: o.delivery?.delivery_custom_id || '',
    _tmpPlan: '',
    so_number: o.so_number,
    _isOrder: true,
    delivery_plan_id: o.delivery?.delivery_plan_id ?? null,
    _raw: o,
  }))

  return applyFilters(unassigned)
})

const assignedFiltered = computed(() => {
  const assigned = deliveries.value
    .filter((d: any) => (d.courier_id || d.delivery_plan_id || d.order?.is_direct_sale) && d.status !== 'shop_closed' && d.status !== 'customer_cancelled')
    .map((d: any) => ({
      _key: `del-${d.id}`,
      order_id: d.order_id,
      delivery_id: d.id,
      shop_name: d.order?.shop_name,
      customer_name: d.order?.customer_address,
      customer_address: d.order?.customer_address,
      customer_id: d.order?.customer_id,
      province: d.order?.province,
      district: d.order?.district,
      commune: d.order?.commune,
      order_custom_id: d.order?.order_custom_id,
      delivery_custom_id: d.delivery_custom_id,
      planned_delivery_date: d.planned_delivery_date,
      created_at: d.order?.created_at || d.created_at,
      delivery_date: d.order?.delivery_date,
      courier_id: d.courier_id,
      courier_name: d.order?.is_direct_sale ? (d.order?.user?.name || 'Sales Rep (Direct)') : d.courier?.name,
      status: d.status,
      is_direct_sale: !!d.order?.is_direct_sale,
      is_overdue: d.is_overdue,
      _editIds: false, _editPlan: false,
      _tmpOrderId: d.order?.order_custom_id || '',
      _tmpDelId: d.delivery_custom_id || '',
      _tmpPlan: '',
      so_number: d.order?.so_number,
      _isOrder: false,
      delivery_plan_id: d.delivery_plan_id ?? null,
      _raw: d,
    }))

  return applyFilters(assigned)
})

const provinces = computed(() => {
  const all = [...unassignedOrders.value, ...deliveries.value.map(d => d.order)].filter(Boolean)
  return [...new Set(all.map(o => o.province))].filter(Boolean).sort() as string[]
})

const districts = computed(() => {
  const all = [...unassignedOrders.value, ...deliveries.value.map(d => d.order)].filter(Boolean)
  let filtered = all
  if (filters.province) filtered = filtered.filter(o => o.province === filters.province)
  return [...new Set(filtered.map(o => o.district))].filter(Boolean).sort() as string[]
})

const communes = computed(() => {
  const all = [...unassignedOrders.value, ...deliveries.value.map(d => d.order)].filter(Boolean)
  let filtered = all
  if (filters.province) filtered = filtered.filter(o => o.province === filters.province)
  if (filters.districts && filters.districts.length) filtered = filtered.filter(o => filters.districts.includes(o.district))
  return [...new Set(filtered.map(o => o.commune))].filter(Boolean).sort() as string[]
})


const overdueRows = computed(() => {
  return deliveries.value
    .filter((d: any) => d.is_overdue)
    .map((d: any) => ({
      delivery_id: d.id,
      shop_name: d.order?.shop_name || '?',
      deadline_at: d.deadline_at,
    }))
})

function applyFilters(rows: any[]) {
  const q = filters.search.toLowerCase().trim()
  const cleanQ = q.replace(/^(del:|afcdo-|afc-)/i, '').replace(/\//g, '')
  let filtered = rows
  if (q) filtered = filtered.filter(r => {
    const delCustom = (r.delivery_custom_id || '').toLowerCase()
    const delNum = (r._raw?.delivery_number || r._raw?.order?.delivery_number || '').toLowerCase()
    const orderCustom = (r.order_custom_id || '').toLowerCase()
    const cleanDelCustom = delCustom.replace(/^(afcdo-|afc-)/i, '').replace(/\//g, '')
    const cleanDelNum = delNum.replace(/^(afcdo-|afc-)/i, '').replace(/\//g, '')

    return (
      r.shop_name?.toLowerCase().includes(q) ||
      r.customer_name?.toLowerCase().includes(q) ||
      r.courier_name?.toLowerCase().includes(q) ||
      r.so_number?.toLowerCase().includes(q) ||
      r.customer_id?.toLowerCase().includes(q) ||
      String(r.order_id).includes(q) ||
      orderCustom.includes(q) ||
      delCustom.includes(q) ||
      delNum.includes(q) ||
      (cleanQ && cleanDelCustom.includes(cleanQ)) ||
      (cleanQ && cleanDelNum.includes(cleanQ))
    )
  })
  if (filters.status) {
    if (filters.status === 'overdue') filtered = filtered.filter(r => r.is_overdue)
    else if (filters.status === 'pending') filtered = filtered.filter(r => !r.courier_id)
    else filtered = filtered.filter(r => r.status === filters.status)
  }
  if (filters.courier_id) filtered = filtered.filter(r => String(r.courier_id) === String(filters.courier_id))
  
  if (filters.delivery_date) {
    filtered = filtered.filter(r => {
      const field = filters.date_type as 'created_at' | 'delivery_date' | 'planned_delivery_date'
      const dateVal = r[field]
      if (!dateVal) return false
      return getLocalDateStr(dateVal) === filters.delivery_date
    })
  }
  if (filters.province) filtered = filtered.filter(r => (r.province || '').toLowerCase().trim() === filters.province.toLowerCase().trim())
  if (filters.districts && filters.districts.length > 0) {
    filtered = filtered.filter(r => filters.districts.includes(r.district))
  }
  if (filters.communes && filters.communes.length > 0) {
    filtered = filtered.filter(r => filters.communes.includes(r.commune))
  }
  if (filters.delivery_plan_id) {
    if (filters.delivery_plan_id === 'unplanned') {
      filtered = filtered.filter(r => !r.delivery_plan_id)
    } else {
      filtered = filtered.filter(r => String(r.delivery_plan_id) === String(filters.delivery_plan_id))
    }
  }

  return filtered
}



onMounted(async () => {
  if (authStore.isSaleAdmin) {
    navigateTo('/admin/products')
    return
  }
  if (!authStore.isAdmin && !authStore.isSuperAdmin && !authStore.isAdminDelivery) {
    navigateTo('/admin'); return
  }
  const load = async () => {
    await Promise.all([
      fetchDeliveries(),
      fetchCouriers(),
      fetchOrders(),
      fetchDeliveryPlans()
    ])
  }
  await load()
  setInterval(load, 30000) // Refresh all data every 30s
})

async function fetchDeliveryPlans() {
  plans.value = await api.get('/admin/delivery-plans') as any[]
}

async function submitDeliveryPlan() {
  planLoading.value = true
  try {
    if (planForm.id) {
      await api.put(`/admin/delivery-plans/${planForm.id}`, planForm)
    } else {
      await api.post('/admin/delivery-plans', planForm)
    }
    await fetchDeliveryPlans()
    showPlanManager.value = false
    showToast('Plan saved!')
  } catch (e) {
    alert('Failed to save plan')
  } finally {
    planLoading.value = false
  }
}

function openCreatePlan() {
  Object.assign(planForm, { id: null, name: '', date: '', description: '', courier_id: '', status: 'draft' })
  showPlanManager.value = true
}

function editPlan(plan: any) {
  Object.assign(planForm, plan)
  showPlanManager.value = true
}



async function updatePlanCourier(planId: number, courierId: string) {
  if (!courierId) return
  planLoading.value = true
  try {
    await api.put(`/admin/delivery-plans/${planId}`, { courier_id: courierId })
    await fetchDeliveryPlans()
    showToast('Courier assigned! Click Dispatch to apply.')
  } catch (e) {
    alert('Failed to assign courier')
  } finally {
    planLoading.value = false
  }
}

async function deleteDeliveryPlan(id: number) {
  if (!confirm('Are you sure you want to delete this plan?')) return
  try {
    await api.del(`/admin/delivery-plans/${id}`)
    
    // Clear filter if the deleted plan was being filtered
    if (String(filters.delivery_plan_id) === String(id)) {
      filters.delivery_plan_id = ''
    }

    await Promise.all([
      fetchOrders(),
      fetchDeliveries(),
      fetchDeliveryPlans()
    ])
    showPlanManager.value = false
    showToast('Plan deleted')
  } catch (e) {
    alert('Failed to delete plan')
  }
}



async function fetchDeliveries() {
  const data = await api.get('/admin/deliveries') as any
  deliveries.value = data.deliveries || []
  kpi.value = data.kpi || kpi.value

  // 🚨 Fire Telegram overdue alert if there are overdue deliveries
  if (kpi.value.overdue > 0) {
    try {
      await api.post('/admin/deliveries/alert-overdue', {})
    } catch (_) { /* silent fail — alert is non-critical */ }
  }
}
async function fetchCouriers() {
  const users = await api.get('/admin/users?active_only=1') as any[]
  couriers.value = users.filter((u: any) => u.role === 'delivery' && u.is_active !== false && u.is_active !== 0)
}
async function fetchOrders() {
  // Only fetch pending orders from the server to avoid confusion
  const data = await api.get('/orders?status=pending') as any
  const assigned = new Set(deliveries.value.filter((d: any) => d.status !== 'shop_closed' && d.status !== 'customer_cancelled').map((d: any) => d.order_id))
  // Still keep a safety filter on the frontend
  unassignedOrders.value = (data.orders || []).filter((o: any) => {
    return !assigned.has(o.id) && String(o.status).toLowerCase() === 'pending' && !o.is_direct_sale
  })
}

async function saveIds(row: any) {
  try {
    await api.put(`/admin/orders/${row.order_id}`, { order_custom_id: row._tmpOrderId })
    if (row.delivery_id) {
      await api.put(`/admin/deliveries/${row.delivery_id}`, { delivery_custom_id: row._tmpDelId })
    } else if (row._tmpDelId?.trim()) {
      await api.post('/admin/deliveries', { order_id: row.order_id, courier_id: null, delivery_custom_id: row._tmpDelId.trim() })
    }
    row._editIds = false
    await fetchDeliveries()
    await fetchOrders()
    showToast('IDs Saved!')
  } catch (e) { alert('Failed to save IDs') }
}

async function cancelOrder(row: any) {
  const key = row._key
  if (!cancelConfirm[key]) {
    cancelConfirm[key] = true
    return
  }
  // Confirmed — proceed
  cancelConfirm[key] = false
  cancelLoading[key] = true
  try {
    await api.put(`/admin/orders/${row.order_id}`, { status: 'cancelled' })
    await fetchDeliveries()
    await fetchOrders()
    showToast('Order Cancelled!')
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Unknown error'
    alert('Failed to cancel order: ' + msg)
  } finally {
    cancelLoading[key] = false
  }
}

function cancelOrderAbort(row: any) {
  cancelConfirm[row._key] = false
}

async function savePlan(row: any) {
  try {
    if (row.delivery_id) {
      await api.put(`/admin/deliveries/${row.delivery_id}`, { planned_delivery_date: row._tmpPlan })
    } else {
      await api.post('/admin/deliveries', { order_id: row.order_id, courier_id: null, planned_delivery_date: row._tmpPlan })
    }
    row._editPlan = false
    await fetchDeliveries()
    await fetchOrders()
    showToast('Schedule Saved!')
  } catch (e) { alert('Failed to save date') }
}

async function saveAll(row: any) {
  const state = editState[row._key]
  if (!state) return
  try {
    // 1. Save SO Number + Customer ID on the order
    await api.put(`/admin/orders/${row.order_id}`, { 
      so_number: state.soNumber || null,
      customer_id: state.customerId || null
    })

    // 2. Save Planned Date
    if (row.delivery_id) {
      await api.put(`/admin/deliveries/${row.delivery_id}`, {
        planned_delivery_date: state.plan || null,
      })
    } else if (state.plan) {
      await api.post('/admin/deliveries', {
        order_id: row.order_id,
        courier_id: null,
        planned_delivery_date: state.plan || null,
      })
    }

    closeEdit(row._key)
    await fetchDeliveries()
    await fetchOrders()
    showToast('Details Saved!')
  } catch (e: any) { alert('Failed to save: ' + (e?.data?.message || e?.message || 'Unknown error')) }
}


async function bulkApplyCourier() {
  if (!bulkForm.courier_id) return
  if (!confirm(`Assign selected courier to all ${unassignedFiltered.value.length} filtered items?`)) return
  
  bulkLoading.value = true
  try {
    const items = unassignedFiltered.value
    const batchSize = 5
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      await Promise.all(batch.map(row => {
        if (row.delivery_id) {
          return api.put(`/admin/deliveries/${row.delivery_id}`, { courier_id: bulkForm.courier_id, status: 'pending' })
        } else {
          return api.post('/admin/deliveries', { order_id: row.order_id, courier_id: bulkForm.courier_id, status: 'pending' })
        }
      }))
    }
    showToast('Bulk Assignment Complete!')
    await fetchDeliveries(); await fetchOrders()
    bulkForm.courier_id = ''
  } catch (e) {
    alert('Bulk assignment failed')
  } finally {
    bulkLoading.value = false
  }
}

function openAssign(row: any) {
  editing.value = row
  form.courier_id = String(row.courier_id || '')
  formError.value = ''
  showModal.value = true
}

async function saveDelivery() {
  formError.value = ''
  try {
    if (editing.value?.delivery_id) {
      await api.put(`/admin/deliveries/${editing.value.delivery_id}`, { courier_id: form.courier_id })
    } else {
      await api.post('/admin/deliveries', { order_id: editing.value?.order_id, courier_id: form.courier_id })
    }
    await fetchDeliveries(); await fetchOrders()
    showModal.value = false
    showToast('Delivery Assigned!')
  } catch (e: any) { formError.value = e?.data?.message || 'Failed' }
}

async function assignQuickly(row: any) {
  const courierId = quickAssign[row.order_id]
  if (!courierId) return
  try {
    await api.post('/admin/deliveries', {
      order_id: row.order_id,
      courier_id: courierId,
      order_custom_id: row.order_custom_id,
      delivery_custom_id: row.delivery_custom_id,
      planned_delivery_date: row.planned_delivery_date,
    })
    quickAssign[row.order_id] = ''
    await fetchDeliveries(); await fetchOrders()
    showToast('Assigned!')
  } catch (e: any) { alert(e?.data?.message || 'Failed') }
}

async function removeDelivery(id: number) {
  if (!confirm('Remove this delivery assignment?')) return
  await api.del(`/admin/deliveries/${id}`)
  await fetchDeliveries(); await fetchOrders()
}

function showToast(msg: string) {
  toast.message = msg; toast.show = true
  setTimeout(() => toast.show = false, 3000)
}
</script>
