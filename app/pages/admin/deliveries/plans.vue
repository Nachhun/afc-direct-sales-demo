<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-black text-slate-900">Delivery Plans</h1>
          <span v-if="activeTab === 'active'" class="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-1 rounded-full border border-blue-200/60 uppercase tracking-wider">
            {{ activePlansCount }} Active
          </span>
          <span v-else class="bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200/60 uppercase tracking-wider">
            {{ historyPlansCount }} Archived
          </span>
        </div>
        <p class="text-slate-500 text-sm mt-1">Manage routes, dispatch orders, and inspect completed delivery history.</p>
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <!-- View Nav Pill -->
        <div class="flex items-center bg-slate-100 rounded-xl p-1 shrink-0">
          <NuxtLink to="/admin/deliveries/map" class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all">🗺 Map</NuxtLink>
          <span class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] font-black uppercase bg-white text-blue-600 shadow-sm">📁 Plans</span>
          <NuxtLink to="/admin/deliveries" class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all">📋 List</NuxtLink>
        </div>
        <button @click="openCreateModal" class="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest bg-blue-600 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 ring-2 ring-blue-600/10 shrink-0">
          <Icon name="heroicons:plus" class="w-4 h-4" /> New Plan
        </button>
      </div>
    </div>

    <!-- Main Navigation Tabs: Active Plans vs History Plans -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-1">
      <div class="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
        <button 
          @click="activeTab = 'active'" 
          :class="activeTab === 'active' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 font-bold'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all">
          <Icon name="heroicons:bolt" class="w-4 h-4" :class="activeTab === 'active' ? 'text-blue-600' : 'text-slate-400'" />
          <span>Active Plans</span>
          <span :class="activeTab === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'" class="text-[10px] px-2 py-0.5 rounded-full font-black">
            {{ activePlansCount }}
          </span>
        </button>

        <button 
          @click="activeTab = 'history'" 
          :class="activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 font-bold'"
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all">
          <Icon name="heroicons:archive-box" class="w-4 h-4" :class="activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400'" />
          <span>History Plans</span>
          <span :class="activeTab === 'history' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'" class="text-[10px] px-2 py-0.5 rounded-full font-black">
            {{ historyPlansCount }}
          </span>
        </button>
      </div>

      <!-- View Switcher (for History) -->
      <div v-if="activeTab === 'history'" class="flex items-center gap-2">
        <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">View Mode:</span>
        <div class="flex items-center bg-slate-100 rounded-xl p-1">
          <button 
            @click="historyViewMode = 'table'"
            :class="historyViewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
            title="Compact Table View (Saves Space)">
            <Icon name="heroicons:table-cells" class="w-3.5 h-3.5" /> Compact Table
          </button>
          <button 
            @click="historyViewMode = 'cards'"
            :class="historyViewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all"
            title="Card Grid View">
            <Icon name="heroicons:squares-2x2" class="w-3.5 h-3.5" /> Cards
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
      <div class="relative w-full sm:col-span-1 lg:col-span-2">
        <Icon name="heroicons:magnifying-glass" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="filters.search" 
          type="text" 
          :placeholder="activeTab === 'active' ? 'Search active plans or couriers...' : 'Search completed plans history...'" 
          class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm" />
      </div>
      
      <input type="date" v-model="filters.date" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm h-10" />
      
      <select v-if="activeTab === 'active'" v-model="filters.activeStatus" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm h-10 appearance-none min-w-[140px]">
        <option value="">All Active Statuses</option>
        <option value="draft">Draft Only</option>
        <option value="active">Active Only</option>
      </select>

      <select v-else v-model="filters.courierId" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm h-10 appearance-none min-w-[140px]">
        <option value="">All Couriers</option>
        <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white border border-slate-200 rounded-3xl p-6 h-48 animate-pulse">
        <div class="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
        <div class="h-3 bg-slate-50 rounded w-1/2 mb-2"></div>
        <div class="h-3 bg-slate-50 rounded w-1/3"></div>
      </div>
    </div>

    <!-- ==================== TAB 1: ACTIVE PLANS ==================== -->
    <div v-else-if="activeTab === 'active'">
      <div v-if="filteredActivePlans.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="plan in filteredActivePlans" :key="plan.id" 
          class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
          
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span :class="{
                  'bg-amber-100 text-amber-700 border-amber-200': plan.status === 'draft',
                  'bg-blue-100 text-blue-700 border-blue-200': plan.status === 'active'
                }" class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border">
                  {{ plan.status }}
                </span>
                <span v-if="isPlanDone(plan)" class="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                  All Done
                </span>
              </div>
              <div class="flex gap-1.5">
                <!-- Mark completed button -->
                <button @click="markPlanCompleted(plan)" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center" title="Mark as Completed & Move to History">
                  <Icon name="heroicons:check" class="w-4 h-4" />
                </button>
                <button @click="editPlan(plan)" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center" title="Edit Plan">
                  <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                </button>
                <button @click="deletePlan(plan.id)" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center" title="Delete Plan">
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 class="text-lg font-black text-slate-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{{ plan.name }}</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-slate-400" />
              {{ plan.date ? new Date(plan.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set' }}
            </p>

            <!-- Progress Bar -->
            <div class="mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div class="flex items-center justify-between text-[10px] font-black uppercase tracking-wider mb-1.5">
                <span class="text-slate-500">Progress</span>
                <span class="text-slate-700">{{ getPlanProgressPercent(plan) }}% ({{ (plan.completed_count || 0) + (plan.issue_count || 0) }}/{{ plan.deliveries_count }})</span>
              </div>
              <div class="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden flex">
                <div :style="{ width: `${getDonePercent(plan)}%` }" class="bg-emerald-500 h-full transition-all duration-500"></div>
                <div :style="{ width: `${getIssuePercent(plan)}%` }" class="bg-orange-400 h-full transition-all duration-500"></div>
                <div :style="{ width: `${getTransitPercent(plan)}%` }" class="bg-blue-500 h-full transition-all duration-500"></div>
              </div>
            </div>

            <!-- Stats Chips -->
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="bg-emerald-50/60 border border-emerald-100 rounded-xl py-2 px-2 text-center">
                <span class="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Done</span>
                <span class="text-sm font-black text-emerald-700">{{ plan.completed_count || 0 }}</span>
              </div>
              <div class="bg-blue-50/60 border border-blue-100 rounded-xl py-2 px-2 text-center">
                <span class="text-[8px] font-black text-blue-600 uppercase tracking-widest block">Transit</span>
                <span class="text-sm font-black text-blue-700">{{ plan.transit_count || 0 }}</span>
              </div>
              <div class="bg-orange-50/60 border border-orange-100 rounded-xl py-2 px-2 text-center">
                <span class="text-[8px] font-black text-orange-600 uppercase tracking-widest block">Issues</span>
                <span class="text-sm font-black text-orange-700">{{ plan.issue_count || 0 }}</span>
              </div>
            </div>

            <div v-if="plan.description" class="text-xs text-slate-500 mb-4 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              "{{ plan.description }}"
            </div>
          </div>

          <div class="space-y-4 pt-4 border-t border-slate-100 mt-auto">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black flex items-center justify-center text-xs">
                  {{ plan.courier?.name?.charAt(0) || '?' }}
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Assigned To</p>
                  <p class="text-xs font-black text-slate-800">{{ plan.courier?.name || 'Unassigned' }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Orders</p>
                <p class="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg inline-block">{{ plan.deliveries_count }}</p>
              </div>
            </div>

            <!-- Orders List (expandable) -->
            <div class="pt-2 border-t border-slate-100">
              <button @click="togglePlanOrders(plan.id)" class="flex items-center justify-between w-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors py-1">
                <span>{{ expandedPlan === plan.id ? 'Hide Orders' : 'View Orders' }} ({{ plan.deliveries_count }})</span>
                <Icon :name="expandedPlan === plan.id ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-3.5 h-3.5" />
              </button>
              <div v-if="expandedPlan === plan.id" class="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <div v-if="planOrdersLoading" class="text-center py-4">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin text-slate-400 mx-auto" />
                </div>
                <div v-else-if="planOrders.length === 0" class="text-[10px] text-slate-400 text-center py-3">No orders in this plan</div>
                <div v-for="d in planOrders" :key="d.id"
                  class="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-5 h-5 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-black shrink-0">{{ d.order?.shop_name?.charAt(0) }}</span>
                    <div class="min-w-0">
                      <p class="text-[10px] font-bold text-slate-700 truncate">{{ d.order?.shop_name }}</p>
                      <p class="text-[8px] text-slate-400 truncate">{{ d.order?.district }}</p>
                    </div>
                  </div>
                  <span :class="{
                    'bg-blue-50 text-blue-600 border-blue-100': d.status === 'in_transit',
                    'bg-emerald-50 text-emerald-600 border-emerald-100': d.status === 'delivered',
                    'bg-amber-50 text-amber-600 border-amber-100': d.status === 'pending',
                    'bg-red-50 text-red-600 border-red-100': d.status === 'shop_closed',
                    'bg-rose-50 text-rose-600 border-rose-100': d.status === 'customer_cancelled',
                    'bg-orange-50 text-orange-600 border-orange-100': d.status === 'delivered_with_issue',
                  }" class="text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ml-2">
                    {{ (d.status || '').replace(/_/g, ' ') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2">
              <button @click="applyPlan(plan)" :disabled="!plan.courier_id || applyingId === plan.id"
                :class="plan.status === 'active' ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'"
                class="flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
                <Icon :name="applyingId === plan.id ? 'heroicons:arrow-path' : 'heroicons:paper-airplane'" :class="{'animate-spin': applyingId === plan.id}" class="w-4 h-4" /> 
                {{ plan.status === 'active' ? 'Sync Dispatch' : 'Dispatch' }}
              </button>
              <NuxtLink :to="{ path: '/admin/deliveries/map', query: { delivery_plan_id: plan.id } }" 
                class="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest text-slate-600">
                <Icon name="heroicons:map" class="w-4 h-4" /> View Map
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
        <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:check-badge" class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1">No active delivery plans</h3>
        <p class="text-slate-400 text-sm mb-6 max-w-md mx-auto">All delivery plans have been completed and moved to the History tab, or you can create a new plan.</p>
        <div class="flex items-center justify-center gap-3">
          <button @click="openCreateModal" class="btn-primary">Create New Plan</button>
          <button @click="activeTab = 'history'" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
            View History Plans ({{ historyPlansCount }})
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: HISTORY PLANS (SPACE SAVING) ==================== -->
    <div v-else-if="activeTab === 'history'">
      
      <!-- Summary stats cards in history tab -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Icon name="heroicons:archive-box" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archived Plans</p>
            <p class="text-xl font-black text-slate-900">{{ historyPlansCount }}</p>
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Icon name="heroicons:truck" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivered Orders</p>
            <p class="text-xl font-black text-slate-900">{{ totalHistoryOrdersDelivered }}</p>
          </div>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Icon name="heroicons:check-badge" class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Completion Rate</p>
            <p class="text-xl font-black text-emerald-600">{{ averageHistoryCompletionRate }}%</p>
          </div>
        </div>
      </div>

      <!-- Compact List / Table View (Max Space Saver) -->
      <div v-if="historyViewMode === 'table' && filteredHistoryPlans.length > 0" class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-400">
                <th class="py-3.5 px-4">Plan Name</th>
                <th class="py-3.5 px-4">Date</th>
                <th class="py-3.5 px-4">Courier</th>
                <th class="py-3.5 px-4 text-center">Orders</th>
                <th class="py-3.5 px-4 text-center">Delivered</th>
                <th class="py-3.5 px-4 text-center">Issues</th>
                <th class="py-3.5 px-4">Completion</th>
                <th class="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <template v-for="plan in filteredHistoryPlans" :key="plan.id">
                <tr class="hover:bg-slate-50/80 transition-colors group">
                  <td class="py-3 px-4 font-bold text-slate-900">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span class="truncate max-w-xs">{{ plan.name }}</span>
                    </div>
                    <p v-if="plan.description" class="text-[10px] text-slate-400 truncate max-w-xs font-normal mt-0.5 italic">
                      {{ plan.description }}
                    </p>
                  </td>
                  <td class="py-3 px-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {{ plan.date ? new Date(plan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—' }}
                  </td>
                  <td class="py-3 px-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center">
                        {{ plan.courier?.name?.charAt(0) || '?' }}
                      </div>
                      <span class="text-xs font-bold text-slate-700">{{ plan.courier?.name || 'Unassigned' }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="bg-slate-100 text-slate-700 font-black text-xs px-2.5 py-0.5 rounded-lg">
                      {{ plan.deliveries_count }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span class="bg-emerald-50 text-emerald-700 font-black text-xs px-2.5 py-0.5 rounded-lg border border-emerald-100">
                      {{ plan.completed_count || 0 }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span :class="(plan.issue_count || 0) > 0 ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'text-slate-400'" class="font-black text-xs px-2 py-0.5 rounded-lg">
                      {{ plan.issue_count || 0 }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2 min-w-[100px]">
                      <div class="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div class="bg-emerald-500 h-full rounded-full" :style="{ width: `${getPlanProgressPercent(plan)}%` }"></div>
                      </div>
                      <span class="text-[10px] font-black text-slate-600">{{ getPlanProgressPercent(plan) }}%</span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <div class="flex items-center justify-end gap-1.5">
                      <button 
                        @click="togglePlanOrders(plan.id)" 
                        class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-xs font-bold flex items-center gap-1"
                        :title="expandedPlan === plan.id ? 'Hide orders' : 'View orders in this plan'">
                        <Icon :name="expandedPlan === plan.id ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-4 h-4" />
                      </button>
                      <NuxtLink 
                        :to="{ path: '/admin/deliveries/map', query: { delivery_plan_id: plan.id } }"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="View route map">
                        <Icon name="heroicons:map" class="w-4 h-4" />
                      </NuxtLink>
                      <button 
                        @click="reopenPlan(plan)" 
                        class="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title="Reopen Plan to Active">
                        <Icon name="heroicons:arrow-path" class="w-4 h-4" />
                      </button>
                      <button 
                        @click="editPlan(plan)" 
                        class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="Edit plan details">
                        <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                      </button>
                      <button 
                        @click="deletePlan(plan.id)" 
                        class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete from history">
                        <Icon name="heroicons:trash" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Expanded drawer for compact table row -->
                <tr v-if="expandedPlan === plan.id" class="bg-slate-50/50">
                  <td colspan="8" class="p-4 border-t border-b border-slate-100">
                    <div class="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                      <div class="flex items-center justify-between">
                        <h4 class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <Icon name="heroicons:clipboard-document-list" class="w-4 h-4 text-blue-600" />
                          Orders in {{ plan.name }} ({{ plan.deliveries_count }})
                        </h4>
                        <NuxtLink :to="{ path: '/admin/deliveries/map', query: { delivery_plan_id: plan.id } }" class="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">
                          Open Map View <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5" />
                        </NuxtLink>
                      </div>

                      <div v-if="planOrdersLoading" class="text-center py-4">
                        <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin text-slate-400 mx-auto" />
                      </div>
                      <div v-else-if="planOrders.length === 0" class="text-xs text-slate-400 text-center py-2">
                        No delivery order items recorded.
                      </div>
                      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        <div v-for="d in planOrders" :key="d.id" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div class="min-w-0">
                            <p class="text-xs font-bold text-slate-800 truncate">{{ d.order?.shop_name }}</p>
                            <p class="text-[10px] text-slate-400 truncate">{{ d.order?.district }}</p>
                          </div>
                          <span :class="{
                            'bg-emerald-50 text-emerald-600 border-emerald-100': d.status === 'delivered',
                            'bg-orange-50 text-orange-600 border-orange-100': d.status === 'delivered_with_issue',
                            'bg-blue-50 text-blue-600 border-blue-100': d.status === 'in_transit',
                            'bg-amber-50 text-amber-600 border-amber-100': d.status === 'pending',
                            'bg-red-50 text-red-600 border-red-100': d.status === 'shop_closed',
                            'bg-rose-50 text-rose-600 border-rose-100': d.status === 'customer_cancelled'
                          }" class="text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ml-2">
                            {{ (d.status || '').replace(/_/g, ' ') }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Compact Cards View (Alternative) -->
      <div v-else-if="historyViewMode === 'cards' && filteredHistoryPlans.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="plan in filteredHistoryPlans" :key="plan.id"
          class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                Completed
              </span>
              <div class="flex gap-1.5">
                <button @click="reopenPlan(plan)" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all flex items-center justify-center" title="Reopen Plan">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4" />
                </button>
                <button @click="editPlan(plan)" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center" title="Edit Plan">
                  <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                </button>
                <button @click="deletePlan(plan.id)" class="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center" title="Delete Plan">
                  <Icon name="heroicons:trash" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 class="text-lg font-black text-slate-900 mb-1 leading-tight">{{ plan.name }}</h3>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-slate-400" />
              {{ plan.date ? new Date(plan.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set' }}
            </p>

            <div class="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
              <div>
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Done</span>
                <span class="text-sm font-black text-emerald-600">{{ plan.completed_count || 0 }} / {{ plan.deliveries_count }}</span>
              </div>
              <div>
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Courier</span>
                <span class="text-xs font-black text-slate-700 truncate block">{{ plan.courier?.name || 'Unassigned' }}</span>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center gap-2">
            <button @click="togglePlanOrders(plan.id)" class="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all text-[9px] font-black uppercase tracking-widest">
              {{ expandedPlan === plan.id ? 'Hide' : 'Orders' }} ({{ plan.deliveries_count }})
            </button>
            <NuxtLink :to="{ path: '/admin/deliveries/map', query: { delivery_plan_id: plan.id } }" 
              class="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">
              <Icon name="heroicons:map" class="w-3.5 h-3.5" /> Map
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
        <div class="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="heroicons:archive-box" class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-black text-slate-900 mb-1">No completed plans in history</h3>
        <p class="text-slate-400 text-sm mb-4">When active plans finish their deliveries, they will automatically appear here.</p>
      </div>

    </div>

    <!-- Edit / Create Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-black text-slate-900">{{ form.id ? 'Edit Plan' : 'Create New Plan' }}</h3>
            <button @click="showModal = false" class="text-slate-400 hover:text-slate-600"><Icon name="heroicons:x-mark" class="w-6 h-6" /></button>
          </div>

          <form @submit.prevent="savePlan" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Plan Name</label>
                <input v-model="form.name" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-400" placeholder="e.g. Courier Sothea 19-Aug" required />
              </div>
              <div>
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Date</label>
                <input type="date" v-model="form.date" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Status</label>
                <select v-model="form.status" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-400">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed (History)</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Courier</label>
                <select v-model="form.courier_id" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-400">
                  <option value="">Unassigned</option>
                  <option v-for="c in couriers" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="col-span-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Description</label>
                <textarea v-model="form.description" rows="3" placeholder="Optional delivery notes or route instructions..." class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-400"></textarea>
              </div>
            </div>

            <div class="flex gap-4 pt-4">
              <button type="button" @click="showModal = false" class="flex-1 h-12 rounded-2xl text-sm font-black uppercase text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" :disabled="submitting" class="flex-1 h-12 rounded-2xl text-sm font-black uppercase text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                {{ submitting ? 'Saving...' : 'Save Plan' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notification -->
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
definePageMeta({
  layout: 'admin'
})

const api = useApi()

// Tabs state: 'active' or 'history'
const activeTab = ref<'active' | 'history'>('active')
const historyViewMode = ref<'table' | 'cards'>('table')

const expandedPlan = ref<number | null>(null)
const planOrders = ref<any[]>([])
const planOrdersLoading = ref(false)

async function togglePlanOrders(planId: number) {
  if (expandedPlan.value === planId) {
    expandedPlan.value = null
    planOrders.value = []
    return
  }
  expandedPlan.value = planId
  planOrders.value = []
  planOrdersLoading.value = true
  try {
    const res = await api.get(`/admin/delivery-plans/${planId}`) as any
    planOrders.value = res.deliveries || []
  } catch (e) {
    planOrders.value = []
  } finally {
    planOrdersLoading.value = false
  }
}

const plans = ref<any[]>([])
const couriers = ref<any[]>([])
const loading = ref(true)
const submitting = ref(false)
const showModal = ref(false)
const applyingId = ref<number | null>(null)
const toast = reactive({ show: false, message: '' })

function showToast(msg: string) {
  toast.message = msg
  toast.show = true
  setTimeout(() => toast.show = false, 3000)
}

const filters = reactive({
  search: '',
  date: '',
  activeStatus: '',
  courierId: ''
})

const form = reactive({
  id: null as number | null,
  name: '',
  date: '',
  courier_id: '',
  status: 'draft',
  description: ''
})

// Counts
const activePlansCount = computed(() => {
  return plans.value.filter(p => p.status !== 'completed').length
})

const historyPlansCount = computed(() => {
  return plans.value.filter(p => p.status === 'completed').length
})

// Filtered lists
const filteredActivePlans = computed(() => {
  return plans.value.filter(p => {
    if (p.status === 'completed') return false
    const matchSearch = !filters.search || 
      p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (p.courier?.name && p.courier.name.toLowerCase().includes(filters.search.toLowerCase()))
    const matchDate = !filters.date || p.date === filters.date
    const matchStatus = !filters.activeStatus || p.status === filters.activeStatus
    return matchSearch && matchDate && matchStatus
  })
})

const filteredHistoryPlans = computed(() => {
  return plans.value.filter(p => {
    if (p.status !== 'completed') return false
    const matchSearch = !filters.search || 
      p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      (p.courier?.name && p.courier.name.toLowerCase().includes(filters.search.toLowerCase()))
    const matchDate = !filters.date || p.date === filters.date
    const matchCourier = !filters.courierId || String(p.courier_id) === String(filters.courierId)
    return matchSearch && matchDate && matchCourier
  })
})

// History statistics
const totalHistoryOrdersDelivered = computed(() => {
  return plans.value
    .filter(p => p.status === 'completed')
    .reduce((acc, p) => acc + (p.completed_count || 0), 0)
})

const averageHistoryCompletionRate = computed(() => {
  const history = plans.value.filter(p => p.status === 'completed' && p.deliveries_count > 0)
  if (history.length === 0) return 100
  const totalPercent = history.reduce((acc, p) => {
    const rate = Math.min(100, Math.round(((p.completed_count || 0) + (p.issue_count || 0)) / p.deliveries_count * 100))
    return acc + rate
  }, 0)
  return Math.round(totalPercent / history.length)
})

function isPlanDone(plan: any) {
  if (!plan.deliveries_count || plan.deliveries_count === 0) return false
  const doneTotal = (plan.completed_count || 0) + (plan.issue_count || 0)
  return doneTotal >= plan.deliveries_count && (plan.transit_count || 0) === 0 && (plan.pending_count || 0) === 0
}

function getPlanProgressPercent(plan: any) {
  if (!plan.deliveries_count || plan.deliveries_count === 0) return 0
  const done = (plan.completed_count || 0) + (plan.issue_count || 0)
  return Math.min(100, Math.round((done / plan.deliveries_count) * 100))
}

function getDonePercent(plan: any) {
  if (!plan.deliveries_count) return 0
  return Math.round(((plan.completed_count || 0) / plan.deliveries_count) * 100)
}

function getIssuePercent(plan: any) {
  if (!plan.deliveries_count) return 0
  return Math.round(((plan.issue_count || 0) / plan.deliveries_count) * 100)
}

function getTransitPercent(plan: any) {
  if (!plan.deliveries_count) return 0
  return Math.round(((plan.transit_count || 0) / plan.deliveries_count) * 100)
}

onMounted(async () => {
  await Promise.all([
    fetchPlans(),
    fetchCouriers()
  ])
  loading.value = false
})

async function fetchPlans() {
  plans.value = await api.get('/admin/delivery-plans') as any[]
}

async function fetchCouriers() {
  const users = await api.get('/admin/users?active_only=1') as any[]
  couriers.value = users.filter((u: any) => u.role === 'delivery' && u.is_active !== false && u.is_active !== 0)
}

function openCreateModal() {
  Object.assign(form, { id: null, name: '', date: '', courier_id: '', status: 'draft', description: '' })
  showModal.value = true
}

function editPlan(plan: any) {
  Object.assign(form, { ...plan, courier_id: plan.courier_id || '' })
  showModal.value = true
}

async function savePlan() {
  submitting.value = true
  try {
    if (form.id) {
      await api.put(`/admin/delivery-plans/${form.id}`, form)
    } else {
      await api.post('/admin/delivery-plans', form)
    }
    await fetchPlans()
    showModal.value = false
    showToast('Plan saved successfully')
  } catch (e) {
    alert('Failed to save plan')
  } finally {
    submitting.value = false
  }
}

async function markPlanCompleted(plan: any) {
  try {
    await api.put(`/admin/delivery-plans/${plan.id}`, { status: 'completed' })
    await fetchPlans()
    showToast(`"${plan.name}" completed & moved to History`)
  } catch (e) {
    alert('Failed to complete plan')
  }
}

async function reopenPlan(plan: any) {
  if (!confirm(`Reopen "${plan.name}" back to Active Plans?`)) return
  try {
    await api.put(`/admin/delivery-plans/${plan.id}`, { status: 'active' })
    await fetchPlans()
    showToast(`"${plan.name}" reopened to Active Plans`)
  } catch (e) {
    alert('Failed to reopen plan')
  }
}

async function applyPlan(plan: any) {
  if (!plan.courier_id || plan.status === 'completed') return
  if (!confirm(`Sync dispatch to ${plan.courier.name}? This will assign any new unassigned orders in the plan.`)) return
  
  applyingId.value = plan.id
  try {
    const res = await api.post(`/admin/delivery-plans/${plan.id}/apply`, {}) as any
    showToast(res.message)
    await fetchPlans()
  } catch (e) {
    alert('Failed to apply plan')
  } finally {
    applyingId.value = null
  }
}

async function deletePlan(id: number) {
  if (!confirm('Are you sure you want to delete this plan?')) return
  try {
    await api.del(`/admin/delivery-plans/${id}`)
    await fetchPlans()
    showModal.value = false
    showToast('Plan deleted')
  } catch (e) {
    alert('Failed to delete plan')
  }
}
</script>
