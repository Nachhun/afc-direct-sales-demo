<template>
  <div class="space-y-4 animate-fade-in">
    <!-- Sub-tab row -->
    <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
      <button
        @click="salesSubTab = 'rep'"
        :class="['px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all', salesSubTab === 'rep' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800']"
      >
        Rep Performance
      </button>
      <button
        @click="salesSubTab = 'team'"
        :class="['px-4 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all', salesSubTab === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800']"
      >
        Team Performance
      </button>
    </div>

    <!-- Sub-tab: Rep Performance -->
    <div v-if="salesSubTab === 'rep'" class="space-y-4 animate-fade-in">
      <!-- Compact Filters Row -->
      <div class="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 animate-slide-up shadow-sm">
        <Icon name="heroicons:funnel" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        
        <!-- Start Date -->
        <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</span>
          <input type="date" v-model="repStartDate" @change="handleDateChange" 
            class="bg-transparent text-slate-900 text-[11px] font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <!-- End Date -->
        <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</span>
          <input type="date" v-model="repEndDate" @change="handleDateChange" 
            class="bg-transparent text-slate-900 text-[11px] font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <!-- Representative Select -->
        <div class="relative flex-1 min-w-[160px]">
          <select v-model="selectedRepId" @change="onRepChange" 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-6 py-1.5 text-[11px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer truncate">
            <option value="">All Representatives</option>
            <option v-for="rep in repsList" :key="rep.id" :value="rep.id">{{ rep.name }}</option>
          </select>
          <Icon name="heroicons:user" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 pointer-events-none" />
          <Icon name="heroicons:chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>

        <!-- Store Select -->
        <div class="relative flex-1 min-w-[160px]">
          <select v-model="selectedStoreId" @change="fetchRepData" 
            class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-6 py-1.5 text-[11px] font-bold text-slate-900 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer truncate">
            <option value="">All Stores</option>
            <option v-for="store in storesList" :key="store.id" :value="store.id">{{ store.shop_name }} {{ store.customer_id ? `(${store.customer_id})` : '' }}</option>
          </select>
          <Icon name="heroicons:building-storefront" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 pointer-events-none" />
          <Icon name="heroicons:chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <!-- Main Loader for Rep Performance -->
      <div v-if="loadingRep" class="flex flex-col items-center justify-center py-24 space-y-4">
        <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Analyzing Rep Performance...</p>
      </div>

      <!-- Content after loading -->
      <div v-else class="space-y-8 animate-fade-in">
        <!-- Compact KPI Strip -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Representative Stats Card (Compact) -->
          <div class="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
            <div class="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Icon name="heroicons:user" class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Representative Results</p>
              <p class="text-sm font-black text-slate-900 truncate">{{ repStats?.name || 'All Representatives' }}</p>
            </div>
            <!-- Revenue -->
            <div class="text-right shrink-0">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
              <p class="text-lg font-black text-slate-900">${{ (repStats?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
            </div>
            <div class="h-10 w-px bg-slate-100 shrink-0"></div>
            <!-- Completed -->
            <div class="text-center shrink-0">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Done</p>
              <p class="text-lg font-black text-emerald-600 flex items-center gap-1">
                <Icon name="heroicons:check-circle" class="w-4 h-4" /> {{ repStats?.order_count || 0 }}
              </p>
            </div>
            <!-- Cancelled -->
            <div class="text-center shrink-0">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cancel</p>
              <p class="text-lg font-black text-red-500 flex items-center gap-1">
                <Icon name="heroicons:x-circle" class="w-4 h-4" /> {{ repStats?.cancelled_count || 0 }}
              </p>
            </div>
          </div>

          <!-- Store Stats Card (Compact) -->
          <div class="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
            <div class="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <Icon name="heroicons:building-storefront" class="w-4 h-4" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Store Results</p>
              <p class="text-sm font-black text-slate-900 truncate">{{ storeStats?.shop_name || 'All Stores' }}</p>
            </div>
            <!-- Main Metric -->
            <div class="text-right shrink-0">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ storeStats?.id ? 'Purchased' : 'Active Stores' }}</p>
              <p class="text-lg font-black text-slate-900">
                <template v-if="storeStats?.id">${{ (storeStats?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</template>
                <template v-else>{{ storeStats?.unique_stores_count || 0 }}</template>
              </p>
            </div>
            <div class="h-10 w-px bg-slate-100 shrink-0"></div>
            <!-- Sales Ops -->
            <div class="text-center shrink-0">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Orders</p>
              <p class="text-lg font-black text-indigo-600 flex items-center gap-1">
                <Icon name="heroicons:shopping-cart" class="w-4 h-4" /> {{ storeStats?.order_count || 0 }}
              </p>
            </div>
            <!-- Cancelled -->
            <div class="text-center shrink-0">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cancel</p>
              <p class="text-lg font-black text-red-500 flex items-center gap-1">
                <Icon name="heroicons:receipt-refund" class="w-4 h-4" /> {{ storeStats?.cancelled_count || 0 }}
              </p>
            </div>
          </div>
        </div>

        <!-- Bar by Product Chart -->
        <div class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Icon name="heroicons:shopping-bag" class="w-5 h-5 text-blue-600" />
                Bar by Product
              </h2>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">SKU Sales Breakdown & Revenue Contribution</p>
            </div>
            
            <span class="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
              {{ productSales.length }} SKUs Sold
            </span>
          </div>

          <!-- No data state -->
          <div v-if="productSales.length === 0" class="text-center py-20">
            <div class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
              <Icon name="heroicons:chart-bar" class="w-8 h-8" />
            </div>
            <p class="text-slate-500 text-sm font-medium">No sales data found for the selected parameters.</p>
            <p class="text-slate-400 text-xs mt-1">Try resetting the filters or modifying the date range.</p>
          </div>

          <!-- Horizontal Bar Chart -->
          <div v-else class="max-h-[380px] overflow-y-auto pr-2 divide-y divide-slate-100 custom-scrollbar">
            <div v-for="product in productSales" :key="product.product_id" 
              class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-3 hover:bg-slate-50/50 px-2 rounded-xl transition-all duration-300 group">
              <!-- SKU Name -->
              <span class="font-bold text-slate-700 text-xs sm:w-1/3 truncate group-hover:text-blue-600 transition-colors" :title="product.product_name">
                {{ product.product_name }}
              </span>
              
              <!-- Bar wrapper -->
              <div class="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden p-[1px] relative">
                <div 
                  class="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 group-hover:from-blue-600 group-hover:to-indigo-700 shadow-sm"
                  :style="{ width: `${maxProductRevenue > 0 ? (Number(product.total_revenue) / maxProductRevenue) * 100 : 0}%` }"
                ></div>
              </div>

              <!-- Metrics -->
              <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 sm:w-64 text-right">
                <div class="flex flex-col items-end">
                  <div class="flex items-center gap-1.5 justify-end">
                    <span class="text-[10px] text-slate-900 font-black uppercase tracking-widest">
                      {{ Number((Number(product.total_qty) || (Number(product.total_qty_paid) + Number(product.total_qty_promo))).toFixed(2)).toLocaleString() }} ctn
                    </span>
                    <span v-if="Number(product.total_qty_promo) > 0" class="text-[9px] text-blue-600 font-bold uppercase tracking-widest">
                      ({{ Number(Number(product.total_qty_paid).toFixed(2)).toLocaleString() }} + {{ Number(Number(product.total_qty_promo).toFixed(2)).toLocaleString() }} FOC)
                    </span>
                  </div>
                  <div v-if="product.total_qty_completed !== undefined || Number(product.total_qty_cancelled) > 0" class="mt-0.5 flex flex-col items-end gap-0.5">
                    <span v-if="product.total_qty_completed !== undefined" class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100/80 inline-flex items-center gap-1">
                      <Icon name="heroicons:check-circle" class="w-3 h-3 text-emerald-600" />
                      {{ Number(Number(product.total_qty_completed || 0).toFixed(2)).toLocaleString() }} CTN Completed
                      <template v-if="Number(product.total_qty_completed_promo) > 0">
                        (+{{ Number(Number(product.total_qty_completed_promo).toFixed(2)).toLocaleString() }} FOC)
                      </template>
                    </span>
                    <span v-if="Number(product.total_qty_cancelled) > 0" class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 inline-flex items-center gap-1">
                      <Icon name="heroicons:x-circle" class="w-3 h-3 text-red-500" />
                      {{ Number(Number(product.total_qty_cancelled).toFixed(2)).toLocaleString() }} CTN Cancelled / Refused
                    </span>
                  </div>
                </div>
                
                <div class="flex flex-col items-end sm:w-20 shrink-0">
                  <span class="font-black text-slate-900 text-xs">
                    ${{ Number(product.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </span>
                  <span v-if="Number(product.total_discount) > 0" class="text-[8px] text-emerald-600 font-black uppercase tracking-widest mt-0.5">
                    -${{ Number(product.total_discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} disc
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sub-tab: Team Performance -->
    <div v-else-if="salesSubTab === 'team'" class="space-y-6 animate-fade-in">
      <!-- Date Filters Row -->
      <div class="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 animate-slide-up shadow-sm">
        <Icon name="heroicons:funnel" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
        
        <!-- Start Date -->
        <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">From</span>
          <input type="date" v-model="repStartDate" @change="handleDateChange" 
            class="bg-transparent text-slate-900 text-[11px] font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <!-- End Date -->
        <div class="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Icon name="heroicons:calendar" class="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">To</span>
          <input type="date" v-model="repEndDate" @change="handleDateChange" 
            class="bg-transparent text-slate-900 text-[11px] font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <button 
          @click="resetRepFilters"
          class="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
        >
          <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <!-- Loader for Team Performance -->
      <div v-if="loadingTeam" class="flex flex-col items-center justify-center py-24 space-y-4">
        <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Loading Team Performance...</p>
      </div>

      <!-- Team Stats Content -->
      <div v-else class="space-y-6">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Total Revenue -->
          <div class="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
            <div class="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Icon name="heroicons:banknotes" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
              <p class="text-lg font-black text-slate-900">${{ (teamStats.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
            </div>
          </div>

          <!-- Active Stores -->
          <div class="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
            <div class="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <Icon name="heroicons:building-storefront" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Stores</p>
              <p class="text-lg font-black text-slate-900">{{ teamStats.total_stores || 0 }}</p>
            </div>
          </div>

          <!-- Operations / Orders -->
          <div class="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
            <div class="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <Icon name="heroicons:shopping-cart" class="w-4 h-4" />
            </div>
            <div>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operations</p>
              <p class="text-lg font-black text-emerald-600">{{ teamStats.total_orders || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!teamStats.team || teamStats.team.length === 0" class="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <div class="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
            <Icon name="heroicons:chart-bar" class="w-8 h-8" />
          </div>
          <p class="text-slate-500 text-sm font-medium">No sales data found for the selected dates.</p>
        </div>

        <!-- Main Layout Grid -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- Left Chart Card: Revenue + Store Count Bar Charts (Col span 3) -->
          <div class="lg:col-span-3 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-6">
            <!-- Side-by-side charts layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <!-- Chart 1: Revenue per Rep -->
              <div class="space-y-4">
                <div>
                  <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="heroicons:currency-dollar" class="w-4 h-4 text-blue-500" />
                    Team Performance + Revenue
                  </h4>
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Revenue contributions per representative</p>
                </div>
                
                <div class="space-y-3.5">
                  <div v-for="rep in teamStats.team" :key="rep.id" class="space-y-1.5">
                    <div class="flex justify-between items-center text-xs">
                      <span class="font-bold text-slate-700 truncate max-w-[120px]">{{ rep.name }}</span>
                      <div class="flex items-center gap-1.5">
                        <span
                          v-if="rep.kpi_revenue > 0"
                          class="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shrink-0"
                          :title="`Logged KPI Target: $${Number(rep.kpi_revenue).toFixed(2)} (${getKpiStatusBadge(rep.revenue, rep.kpi_revenue).pct}% achieved)`"
                        >
                          KPI Log: ${{ Number(rep.kpi_revenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}
                        </span>
                        <span
                          class="font-black"
                          :class="rep.kpi_revenue > 0 ? getKpiStatusBadge(rep.revenue, rep.kpi_revenue).textClass : 'text-slate-900'"
                        >
                          ${{ Number(rep.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                        </span>
                      </div>
                    </div>
                    <div class="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                      <div
                        :class="`bg-gradient-to-r ${rep.kpi_revenue > 0 ? getKpiStatusBadge(rep.revenue, rep.kpi_revenue).barGradient : getRepColorClass(rep.salesman_type)}`"
                        class="h-full rounded-full transition-all duration-1000"
                        :style="{ width: `${maxRepRevenue > 0 ? (rep.revenue / maxRepRevenue) * 100 : 0}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Chart 2: Store Count per Rep -->
              <div class="space-y-4 md:pl-6">
                <div>
                  <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="heroicons:building-storefront" class="w-4 h-4 text-indigo-500" />
                    Store Coverage
                  </h4>
                  <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Active stores visited/ordered per representative</p>
                </div>
                
                <div class="space-y-3.5">
                  <div v-for="rep in teamStats.team" :key="rep.id" class="space-y-1.5">
                    <div class="flex justify-between items-center text-xs">
                      <span class="font-bold text-slate-700 truncate max-w-[120px]">{{ rep.name }}</span>
                      <span class="font-black text-indigo-600">{{ rep.unique_stores }} {{ rep.unique_stores === 1 ? 'store' : 'stores' }}</span>
                    </div>
                    <div class="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                      <div :class="`bg-gradient-to-r ${getRepColorClass(rep.salesman_type)}`" class="h-full rounded-full transition-all duration-1000"
                        :style="{ width: `${(rep.unique_stores / maxRepStores) * 100}%` }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Dynamic Color Legend (Salesman Classifications) -->
            <div v-if="salesmanTypes && salesmanTypes.length > 0" class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span class="text-slate-500 font-bold mr-1">Rep Classifications:</span>
              <span v-for="t in salesmanTypes" :key="t.id" class="flex items-center gap-1.5">
                <span :class="getRepSolidColor(t.name)" class="w-2.5 h-2.5 rounded-sm"></span>
                {{ t.name }}
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-sm bg-slate-400"></span> Other / General
              </span>
            </div>
          </div>

          <!-- Right Chart Card: Pie Chart for Revenue Distribution (Col span 2) -->
          <div class="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[340px]">
            <div>
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="heroicons:chart-pie" class="w-4 h-4 text-purple-500" />
                  Revenue Distribution
                </h4>
                <span class="text-[9px] font-extrabold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  {{ pieSlices.length }} Sales Reps
                </span>
              </div>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Share of total team revenue per representative</p>
            </div>

            <!-- Layout for Chart & All Reps Legend -->
            <div class="flex flex-col sm:flex-row items-center gap-5 my-auto py-3">
              <!-- SVG Donut Chart Container -->
              <div class="relative flex items-center justify-center shrink-0">
                <svg viewBox="0 0 120 120" class="w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52">
                  <!-- Slices -->
                  <path v-for="(slice, idx) in pieSlices" :key="idx"
                    :d="slice.path"
                    :fill="slice.color"
                    @mouseenter="hoveredSlice = slice"
                    @mouseleave="hoveredSlice = null"
                    :class="[
                      'transition-all duration-300 origin-center cursor-pointer',
                      hoveredSlice && hoveredSlice.name === slice.name ? 'scale-105 opacity-100 drop-shadow-md' : (hoveredSlice ? 'opacity-35' : 'hover:opacity-90')
                    ]"
                  >
                    <title>{{ slice.name }}: {{ slice.percentage }}% (${{ Number(slice.revenue).toLocaleString() }})</title>
                  </path>
                  
                  <!-- Slice Labels (Direct percentage display) -->
                  <template v-for="(slice, idx) in pieSlices" :key="'lbl-' + idx">
                    <text
                      v-if="Number(slice.percentage) > 6"
                      :x="slice.lx"
                      :y="slice.ly"
                      fill="white"
                      font-size="4.5"
                      font-weight="black"
                      text-anchor="middle"
                      dominant-baseline="central"
                      class="pointer-events-none animate-fade-in"
                    >
                      {{ Math.round(Number(slice.percentage)) }}%
                    </text>
                  </template>

                  <!-- Donut Hole Center Circle -->
                  <circle cx="60" cy="60" r="23" fill="white" />
                  
                  <!-- Donut Hole Center Text -->
                  <text x="60" y="52" text-anchor="middle" font-size="4.5" font-weight="black" fill="#94a3b8">
                    {{ hoveredSlice ? 'REVENUE SHARE' : 'TOTAL REVENUE' }}
                  </text>
                  <text x="60" y="64" text-anchor="middle" font-size="9" font-weight="black" fill="#0f172a">
                    {{ hoveredSlice?.percentage ? hoveredSlice.percentage + '%' : '100%' }}
                  </text>
                  <text x="60" y="74" text-anchor="middle" font-size="5" font-weight="bold" fill="#64748b" class="opacity-80">
                    {{ hoveredSlice?.name ? hoveredSlice.name : `$${(teamStats.total_revenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` }}
                  </text>
                </svg>
              </div>

              <!-- Complete Rep Legend (Displays ALL Sales Representatives) -->
              <div class="flex-1 w-full space-y-1 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
                <div 
                  v-for="(slice, idx) in pieSlices" 
                  :key="idx" 
                  @mouseenter="hoveredSlice = slice"
                  @mouseleave="hoveredSlice = null"
                  :class="[
                    'flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border',
                    hoveredSlice && hoveredSlice.name === slice.name ? 'bg-slate-100 border-indigo-200 shadow-2xs scale-[1.01]' : 'bg-slate-50/50 border-slate-100/70 hover:bg-slate-100/60'
                  ]"
                >
                  <div class="flex items-center gap-2 min-w-0 flex-1">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" :style="{ backgroundColor: slice.color }"></span>
                    <span class="font-extrabold text-slate-800 text-[11px] truncate" :title="slice.name">{{ slice.name }}</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0 ml-2">
                    <span class="font-mono text-[10px] font-bold text-slate-500">${{ Math.round(slice.revenue).toLocaleString() }}</span>
                    <span class="font-black text-xs text-slate-900 min-w-[36px] text-right" :style="{ color: slice.color }">{{ slice.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()

// Shared Date Utils
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Tab State
const salesSubTab = ref('rep')

// Tab 2: Rep Performance State
const loadingRep = ref(false)
const repStartDate = ref(toLocalDateString(firstDay))
const repEndDate = ref(toLocalDateString(lastDay))
const selectedRepId = ref('')
const selectedStoreId = ref('')

const repsList = ref<any[]>([])
const storesList = ref<any[]>([])
const repStats = ref<any>(null)
const storeStats = ref<any>(null)
const productSales = ref<any[]>([])

const maxProductRevenue = computed(() => {
  if (productSales.value.length === 0) return 1
  return Math.max(...productSales.value.map(p => Number(p.total_revenue)), 1)
})

// Tab 2: Team Performance State
const loadingTeam = ref(false)
const teamStats = ref<any>({ team: [], total_revenue: 0, total_stores: 0, total_orders: 0 })
const salesmanTypes = ref<any[]>([])

const maxRepRevenue = computed(() => {
  const team = teamStats.value?.team || []
  if (team.length === 0) return 1
  return Math.max(...team.map((r: any) => Number(r.revenue)), 1)
})

const maxRepStores = computed(() => {
  const team = teamStats.value?.team || []
  if (team.length === 0) return 1
  return Math.max(...team.map((r: any) => Number(r.unique_stores)), 1)
})

function getKpiStatusBadge(revenue: number, kpiRevenue: number) {
  if (!kpiRevenue || kpiRevenue <= 0) {
    return {
      textClass: 'text-slate-900',
      barGradient: 'from-blue-500 to-indigo-600',
      pct: 0
    }
  }
  const ratio = Number(revenue || 0) / Number(kpiRevenue)
  const pct = Math.round(ratio * 100)
  if (ratio >= 1.0) {
    return {
      textClass: 'text-emerald-600',
      barGradient: 'from-emerald-500 to-teal-600',
      pct
    }
  } else if (ratio >= 0.5) {
    return {
      textClass: 'text-amber-600',
      barGradient: 'from-amber-400 to-amber-500',
      pct
    }
  } else {
    return {
      textClass: 'text-rose-600',
      barGradient: 'from-rose-500 to-red-600',
      pct
    }
  }
}

const pieSlices = computed(() => {
  const reps = teamStats.value?.team || []
  const total = teamStats.value?.total_revenue || 0
  if (total <= 0 || reps.length === 0) return []

  let accumulatedAngle = 0
  const colors = [
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#f43f5e', // rose-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#06b6d4', // cyan-500
  ]

  return reps.map((rep: any, idx: number) => {
    const percentage = (rep.revenue / total) * 100
    const angle = (rep.revenue / total) * 360
    
    const r = 50
    const cx = 60
    const cy = 60
    
    const startAngle = accumulatedAngle
    const endAngle = accumulatedAngle + angle
    
    const x1 = cx + r * Math.sin(startAngle * Math.PI / 180)
    const y1 = cy - r * Math.cos(startAngle * Math.PI / 180)
    
    const x2 = cx + r * Math.sin(endAngle * Math.PI / 180)
    const y2 = cy - r * Math.cos(endAngle * Math.PI / 180)
    
    // Label coordinate calculation
    const middleAngle = startAngle + angle / 2
    const labelRadius = 37
    const lx = cx + labelRadius * Math.sin(middleAngle * Math.PI / 180)
    const ly = cy - labelRadius * Math.cos(middleAngle * Math.PI / 180)

    accumulatedAngle += angle
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    let pathData = ''
    if (angle >= 359.9) {
      pathData = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
    } else {
      pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    }
    
    const color = colors[idx % colors.length]
    
    return {
      name: rep.name,
      revenue: rep.revenue,
      percentage: percentage.toFixed(1),
      path: pathData,
      color,
      lx,
      ly
    }
  })
})

const hoveredSlice = ref<any>(null)

// API Fetchers
async function fetchRepData() {
  loadingRep.value = true
  try {
    const params: any = {
      start_date: repStartDate.value,
      end_date: repEndDate.value
    }
    if (selectedRepId.value) {
      params.rep_id = selectedRepId.value
    }
    if (selectedStoreId.value) {
      params.store_id = selectedStoreId.value
    }

    const res = await api.get('/admin/reports/rep-results', { params }) as any
    repsList.value = res.reps || []
    storesList.value = res.stores || []
    repStats.value = res.rep_stats
    storeStats.value = res.store_stats
    productSales.value = res.product_sales || []
  } catch (error) {
    console.error('Failed to load rep performance:', error)
  } finally {
    loadingRep.value = false
  }
}

async function onRepChange() {
  await fetchRepData()
  if (selectedStoreId.value && !storesList.value.some(s => s.id === Number(selectedStoreId.value))) {
    selectedStoreId.value = ""
    await fetchRepData()
  }
}

async function fetchTeamData() {
  loadingTeam.value = true
  try {
    const params = {
      start_date: repStartDate.value,
      end_date: repEndDate.value
    }
    const res = await api.get('/admin/reports/team-performance', { params }) as any
    teamStats.value = res
  } catch (error) {
    console.error('Failed to load team performance:', error)
  } finally {
    loadingTeam.value = false
  }
}

async function handleDateChange() {
  if (salesSubTab.value === 'rep') {
    await fetchRepData()
  } else {
    await fetchTeamData()
  }
}

async function resetRepFilters() {
  repStartDate.value = toLocalDateString(firstDay)
  repEndDate.value = toLocalDateString(lastDay)
  selectedRepId.value = ""
  selectedStoreId.value = ""
  if (salesSubTab.value === 'rep') {
    await fetchRepData()
  } else {
    await fetchTeamData()
  }
}

async function fetchSalesmanTypes() {
  try {
    salesmanTypes.value = await api.get('/admin/salesman-types') as any[]
  } catch (e) {
    console.error('Failed to load salesman types', e)
  }
}

// Watch subtab changes
watch(salesSubTab, (newSubTab) => {
  if (newSubTab === 'rep') {
    fetchRepData()
  } else {
    fetchTeamData()
  }
})

onMounted(() => {
  fetchRepData()
  fetchSalesmanTypes()
})

// CSS and Style helper mapping functions
function getRepColorClass(typeName?: string) {
  const normalized = typeName?.toLowerCase().trim() || ''
  if (normalized.includes('wholesale')) {
    return 'from-blue-500 to-indigo-600'
  } else if (normalized.includes('pharmacy')) {
    return 'from-rose-500 to-pink-600'
  } else if (normalized.includes('key account')) {
    return 'from-purple-600 to-fuchsia-600'
  } else if (normalized.includes('tele')) {
    return 'from-emerald-500 to-teal-600'
  } else if (normalized.includes('sd') || normalized.includes('sub-distributor') || normalized.includes('sub distributor')) {
    return 'from-orange-500 to-amber-600'
  }
  return 'from-slate-500 to-slate-600'
}

function getRepSolidColor(typeName?: string) {
  const normalized = typeName?.toLowerCase().trim() || ''
  if (normalized.includes('wholesale')) return 'bg-blue-600'
  if (normalized.includes('pharmacy')) return 'bg-rose-500'
  if (normalized.includes('key account')) return 'bg-purple-600'
  if (normalized.includes('tele')) return 'bg-emerald-600'
  if (normalized.includes('sd') || normalized.includes('sub-distributor') || normalized.includes('sub distributor')) return 'bg-orange-500'
  return 'bg-slate-400'
}
</script>
