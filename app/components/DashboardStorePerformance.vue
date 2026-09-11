<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header Controls Banner -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
          <Icon name="heroicons:building-storefront" class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-base font-black text-slate-900 uppercase tracking-wide">Store Performance & Contribution</h2>
          <p class="text-slate-500 text-xs font-semibold">
            Pareto 80/20 store sales analysis, active store count trends, and RT vs WS trade class distribution
          </p>
        </div>
      </div>

      <!-- Date Range Filter & Reset Button -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-slate-400" />
          <input 
            type="date" 
            v-model="storeStartDate" 
            @change="fetchStorePerformance" 
            class="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          />
          <span class="text-slate-400 text-xs font-bold">to</span>
          <input 
            type="date" 
            v-model="storeEndDate" 
            @change="fetchStorePerformance" 
            class="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          />
        </div>

        <button 
          @click="resetStoreFilters" 
          class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
          title="Reset Filters"
        >
          <Icon name="heroicons:arrow-path" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- CHART 1: Store Contribution (PARETO CHART) -->
    <div class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <div class="text-[11px] tracking-wider uppercase font-bold text-slate-400 mb-1">STORE PERFORMANCE</div>
          <h3 class="text-lg font-bold text-slate-900">Store contribution — Pareto (80/20)</h3>
          <p class="text-xs text-slate-500 mt-0.5">Each bar = one store's revenue · ranked highest to lowest</p>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 whitespace-nowrap self-start">
          <div class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
          <span>{{ storePerformanceData.store_contribution?.length || 0 }} active stores</span>
        </div>
      </div>

      <!-- 4 KPI Cards Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- KPI 1: TOTAL REVENUE -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#2a78d6]"></div>
          <div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">TOTAL REVENUE</div>
          <div class="text-xl font-bold text-slate-900 tracking-tight">${{ Math.round(paretoTotalRevenue).toLocaleString() }}</div>
          <div class="text-xs text-slate-500 mt-1">all {{ storePerformanceData.store_contribution?.length || 0 }} stores</div>
        </div>

        <!-- KPI 2: TOP STORE -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#1baf7a]"></div>
          <div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">TOP STORE</div>
          <div class="text-xl font-bold text-slate-900 tracking-tight">${{ Number(storePerformanceData.kpis?.top_store_revenue || 0).toLocaleString() }}</div>
          <div class="text-xs text-slate-500 mt-1 truncate">{{ storePerformanceData.kpis?.top_store_name || 'N/A' }}</div>
        </div>

        <!-- KPI 3: STORES -> 80% -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#eda100]"></div>
          <div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">STORES → 80%</div>
          <div class="text-xl font-bold text-slate-900 tracking-tight">{{ paretoCutoffStoreCount }}</div>
          <div class="text-xs text-slate-500 mt-1">{{ ((paretoCutoffStoreCount / Math.max(1, storePerformanceData.store_contribution?.length || 1)) * 100).toFixed(0) }}% of store count</div>
        </div>

        <!-- KPI 4: LONG-TAIL STORES -->
        <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-[#d3d1c7]"></div>
          <div class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1.5">LONG-TAIL STORES</div>
          <div class="text-xl font-bold text-slate-900 tracking-tight">{{ Math.max(0, (storePerformanceData.store_contribution?.length || 0) - paretoCutoffStoreCount) }}</div>
          <div class="text-xs text-slate-500 mt-1">remaining 20% revenue</div>
        </div>
      </div>

      <!-- Chart Card Container -->
      <div class="border border-slate-200/80 rounded-3xl p-5 sm:p-6 bg-white shadow-2xs space-y-4 text-slate-900">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <span class="text-xs font-semibold text-slate-500">Thin bars · hover to inspect each store</span>

          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shrink-0">
              <span class="text-[10px] font-bold uppercase text-slate-400 px-2 tracking-wider">Display:</span>
              <button 
                v-for="opt in [{ label: 'Top 15', val: 15 }, { label: 'Top 30', val: 30 }, { label: '🎯 80% Pareto', val: '80%' }, { label: 'All (' + (storePerformanceData.store_contribution?.length || 0) + ')', val: 'all' }]"
                :key="opt.label"
                @click="paretoViewLimit = opt.val"
                :class="[
                  'px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  paretoViewLimit === opt.val ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                ]"
              >
                {{ opt.label }}
              </button>
            </div>

            <div class="flex items-center gap-1.5 text-xs text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
              <div class="w-2.5 h-2.5 rounded-xs bg-[#2a78d6]"></div>
              <span>Core stores</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
              <div class="w-2.5 h-2.5 rounded-xs bg-[#d3d1c7]"></div>
              <span>Long tail</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
              <div class="w-4 h-[2px] bg-[#10b981]"></div>
              <span>Cumulative %</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
              <div class="w-3.5 h-0 border-t-2 border-dashed border-[#eda100]"></div>
              <span>80% cutoff</span>
            </div>

            <button 
              @click="isFullParetoTableOpen = !isFullParetoTableOpen"
              class="ml-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Icon name="heroicons:table-cells" class="w-3.5 h-3.5 text-white" />
              <span>{{ isFullParetoTableOpen ? 'Hide Table' : 'View Full Table' }}</span>
            </button>
          </div>
        </div>

        <div class="relative w-full h-[320px] pt-1">
          <canvas ref="paretoCanvasRef" role="img" aria-label="Thin sleek bar chart of stores by revenue with cumulative percentage line and 80% Pareto cutoff"></canvas>
        </div>

        <!-- Info Strip Below Chart -->
        <div 
          class="px-4 py-3 rounded-2xl border min-h-[48px] flex items-center gap-3 flex-wrap text-xs transition-colors"
          :class="activeHoverStore && Number(activeHoverStore.cumulative_pct || 0) <= 80 ? 'bg-blue-50/80 border-blue-200 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-600'"
        >
          <template v-if="activeHoverStore">
            <div 
              @click="openStoreDetailsModal(activeHoverStore)"
              class="flex items-center gap-2 cursor-pointer group"
              title="Click to view Store Details & Orders"
            >
              <span class="font-bold text-slate-900 text-sm group-hover:text-indigo-600 group-hover:underline transition-colors">
                #{{ activeHoverStore.rank || (paretoHoverIndex !== null ? paretoHoverIndex + 1 : 1) }} {{ activeHoverStore.shop_name }}
              </span>
              <span class="px-2 py-0.5 bg-indigo-100/80 text-indigo-700 font-mono text-[10px] font-bold rounded-md border border-indigo-200/80 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                ID: {{ activeHoverStore.customer_id || ('STORE-' + activeHoverStore.store_id) }}
              </span>
            </div>

            <div class="w-px h-3.5 bg-slate-300"></div>
            <span class="text-slate-600">Revenue <b class="text-slate-900">${{ Number(activeHoverStore.revenue).toLocaleString() }}</b></span>
            <span class="text-slate-500">({{ ((Number(activeHoverStore.revenue) / Math.max(1, paretoTotalRevenue)) * 100).toFixed(1) }}% of total)</span>
            <template v-if="paretoDropPct !== null">
              <div class="w-px h-3.5 bg-slate-300"></div>
              <span class="text-slate-500">↓ {{ paretoDropPct }}% vs prev</span>
            </template>
            <div class="w-px h-3.5 bg-slate-300"></div>
            <span class="text-slate-600">Cumulative <b class="text-[#2a78d6] font-bold">{{ Number(activeHoverStore.cumulative_pct).toFixed(1) }}%</b></span>
            <div class="w-px h-3.5 bg-slate-300"></div>
            <span 
              :class="Number(activeHoverStore.cumulative_pct) <= 80 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-200 text-slate-700 border-slate-300'"
              class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
            >
              {{ Number(activeHoverStore.cumulative_pct) <= 80 ? 'Core store' : 'Long tail' }}
            </span>

            <button 
              @click="openStoreDetailsModal(activeHoverStore)"
              class="ml-auto px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Icon name="heroicons:eye" class="w-3.5 h-3.5" />
              <span>View Details & Orders</span>
            </button>
          </template>
          <template v-else>
            <span class="text-slate-400 font-medium">Hover a bar to see store details</span>
          </template>
        </div>
      </div>

      <!-- Expandable Full Store Ranks Table -->
      <div v-if="isFullParetoTableOpen" class="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-3 animate-fade-in mt-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-2">
            <Icon name="heroicons:list-bullet" class="w-4 h-4 text-indigo-600" />
            <span>Full Store Pareto Ranking Table ({{ storePerformanceData.store_contribution?.length || 0 }} Stores)</span>
          </h4>

          <div class="relative min-w-[220px]">
            <input 
              v-model="storeTableSearchQuery"
              type="text" 
              placeholder="Search store name, ID, trade class..." 
              class="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
            />
            <Icon name="heroicons:magnifying-glass" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div class="max-h-72 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl bg-white">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-400 text-[9.5px] uppercase font-black tracking-wider sticky top-0 border-b border-slate-100 z-10">
              <tr>
                <th class="py-2.5 px-3.5 w-12">Rank</th>
                <th class="py-2.5 px-3.5">Store Name</th>
                <th class="py-2.5 px-3.5">Customer ID</th>
                <th class="py-2.5 px-3.5">Trade Class</th>
                <th class="py-2.5 px-3.5 text-right">Orders</th>
                <th class="py-2.5 px-3.5 text-right">Revenue ($)</th>
                <th class="py-2.5 px-3.5 text-right">Share %</th>
                <th class="py-2.5 px-3.5 text-right">Cumulative %</th>
                <th class="py-2.5 px-3.5 text-center">Status</th>
                <th class="py-2.5 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
              <tr 
                v-for="s in filteredFullStoreTable" 
                :key="'tbl-' + s.store_id"
                @mouseenter="activeHoverStore = s"
                @mouseleave="activeHoverStore = null"
                :class="[
                  'hover:bg-slate-50/90 transition-colors',
                  activeHoverStore?.store_id === s.store_id ? 'bg-indigo-50/60' : ''
                ]"
              >
                <td class="py-2.5 px-3.5 font-mono text-[11px] text-slate-400">#{{ s.rank }}</td>
                <td class="py-2.5 px-3.5 font-black text-slate-900">
                  <button 
                    @click="openStoreDetailsModal(s)"
                    class="text-left font-black text-slate-900 hover:text-indigo-600 hover:underline transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{{ s.shop_name }}</span>
                  </button>
                </td>
                <td class="py-2.5 px-3.5 text-slate-500 font-mono text-[10.5px]">
                  <button 
                    @click="openStoreDetailsModal(s)"
                    class="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded font-mono text-[10.5px] font-bold transition-colors cursor-pointer"
                  >
                    {{ s.customer_id || ('STORE-' + s.store_id) }}
                  </button>
                </td>
                <td class="py-2.5 px-3.5 text-slate-600">{{ s.trade_class }}</td>
                <td class="py-2.5 px-3.5 text-right font-mono text-slate-700">{{ s.order_count }}</td>
                <td class="py-2.5 px-3.5 text-right font-black text-emerald-700">${{ Number(s.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</td>
                <td class="py-2.5 px-3.5 text-right text-slate-800">{{ s.share_pct }}%</td>
                <td class="py-2.5 px-3.5 text-right font-black text-indigo-700">{{ s.cumulative_pct }}%</td>
                <td class="py-2.5 px-3.5 text-center">
                  <span 
                    :class="s.cumulative_pct <= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'"
                    class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border"
                  >
                    {{ s.cumulative_pct <= 80 ? 'Core 80%' : 'Long Tail' }}
                  </span>
                </td>
                <td class="py-2.5 px-3.5 text-center">
                  <button 
                    @click="openStoreDetailsModal(s)"
                    class="px-2.5 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                  >
                    <Icon name="heroicons:shopping-bag" class="w-3 h-3" />
                    <span>Orders</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- GRID: Chart 2 & Chart 3 Side-by-Side -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- CHART 2: Active Store Trend -->
      <div class="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5 flex flex-col justify-between h-full">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-sm bg-blue-600"></span>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">2. Trend Active Store & Sales</h3>
            </div>
            <p class="text-slate-400 text-[11px] font-medium mt-0.5 ml-4">
              Daily activity ({{ storeStartDate }} to {{ storeEndDate }})
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap">
            <div class="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-[10px] font-bold">
              <button 
                @click="storeTrendMetric = 'stores'"
                :class="storeTrendMetric === 'stores' ? 'bg-white text-blue-700 shadow-2xs border border-slate-200 font-black' : 'text-slate-500 hover:text-slate-800'"
                class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                Stores Count
              </button>
              <button 
                @click="storeTrendMetric = 'revenue'"
                :class="storeTrendMetric === 'revenue' ? 'bg-white text-emerald-700 shadow-2xs border border-slate-200 font-black' : 'text-slate-500 hover:text-slate-800'"
                class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                Revenue ($)
              </button>
            </div>

            <div v-if="activeHoverActiveStoreDay" class="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
              <span>{{ activeHoverActiveStoreDay.formatted_date }}: </span>
              <strong class="text-blue-600">{{ activeHoverActiveStoreDay.active_stores_count }} Stores</strong>
              <span class="text-emerald-700 font-extrabold ml-2">${{ Number(activeHoverActiveStoreDay.daily_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
          </div>
        </div>

        <div v-if="!storePerformanceData.active_store_trend?.length" class="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
          No daily store trend data available.
        </div>

        <div v-else class="overflow-x-auto custom-scrollbar flex-1 flex flex-col justify-end">
          <div class="min-w-[600px] relative pt-6 pb-2">
            <div class="relative h-56 w-full flex items-end justify-between gap-1 pt-6 px-2 z-10">
              <div 
                v-for="day in storePerformanceData.active_store_trend" 
                :key="day.date"
                @mouseenter="activeHoverActiveStoreDay = day"
                @mouseleave="activeHoverActiveStoreDay = null"
                class="flex-1 flex flex-col items-center justify-end h-full group/trend cursor-pointer relative"
              >
                <span 
                  class="text-[9px] font-extrabold mb-1 leading-none transition-colors truncate max-w-full"
                  :class="storeTrendMetric === 'revenue' ? 'text-emerald-700 font-mono text-[8.5px]' : 'text-blue-700'"
                >
                  <template v-if="storeTrendMetric === 'revenue'">
                    {{ day.daily_revenue > 0 ? (day.daily_revenue >= 1000 ? '$' + (day.daily_revenue / 1000).toFixed(1) + 'k' : '$' + Math.round(day.daily_revenue)) : '' }}
                  </template>
                  <template v-else>
                    {{ day.active_stores_count > 0 ? day.active_stores_count : '' }}
                  </template>
                </span>

                <div 
                  class="w-full max-w-[22px] rounded-t-sm transition-all"
                  :style="{ 
                    height: maxActiveStoreTrendValue > 0 
                      ? `${Math.max(4, ((storeTrendMetric === 'revenue' ? Number(day.daily_revenue || 0) : Number(day.active_stores_count || 0)) / maxActiveStoreTrendValue) * 82)}%` 
                      : '4px' 
                  }"
                  :class="[
                    storeTrendMetric === 'revenue' 
                      ? (activeHoverActiveStoreDay?.date === day.date ? 'bg-emerald-600 ring-2 ring-emerald-300 shadow-md' : 'bg-emerald-500/80 hover:bg-emerald-600')
                      : (activeHoverActiveStoreDay?.date === day.date ? 'bg-blue-600 ring-2 ring-blue-300 shadow-md' : 'bg-blue-500/80 hover:bg-blue-600')
                  ]"
                ></div>
              </div>
            </div>

            <div class="flex justify-between w-full mt-3 pt-2 border-t border-slate-100 px-2">
              <div 
                v-for="(day, idx) in storePerformanceData.active_store_trend" 
                :key="'dt-' + day.date" 
                class="flex-1 text-center min-w-0"
              >
                <span 
                  v-if="shouldShowTrendDateLabel(idx, storePerformanceData.active_store_trend.length)"
                  class="text-[9.5px] font-extrabold text-slate-500 block truncate whitespace-nowrap"
                >
                  {{ day.formatted_date }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CHART 3: RT vs WS Share -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5 flex flex-col justify-between">
        <div class="border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-sm bg-violet-600"></span>
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">3. Pie Chart — RT / WS / MT</h3>
          </div>
          <p class="text-slate-400 text-[11px] font-medium mt-0.5 ml-4">
            Retail (RT), Wholesale (WS), and Modern Trade (MT) Sales Share
          </p>
        </div>

        <div class="relative flex items-center justify-center py-4 min-h-[220px]">
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 p-4">
            <template v-if="activeRtWsSlice">
              <span class="w-2.5 h-2.5 rounded-full mb-1 animate-pulse" :style="{ backgroundColor: activeRtWsSlice.color }"></span>
              <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[130px]">
                {{ activeRtWsSlice.name }}
              </span>
              <span class="text-xl font-black text-slate-900 leading-none mt-1" :style="{ color: activeRtWsSlice.color }">
                {{ activeRtWsSlice.percentage }}%
              </span>
              <span class="text-[10px] font-extrabold text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                ${{ Number(activeRtWsSlice.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
            </template>

            <template v-else>
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Sales</span>
              <span class="text-lg font-black text-slate-900 mt-0.5">
                ${{ Number(storePerformanceData.kpis?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
              <span class="text-[9px] font-bold text-slate-400 mt-0.5">
                {{ storePerformanceData.rt_vs_ws?.length || 0 }} Trade Classes
              </span>
            </template>
          </div>

          <svg class="w-56 h-56 transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="45" fill="none" stroke="#f1f5f9" stroke-width="16" />
            <circle 
              v-for="slice in rtWsPieSlices" 
              :key="slice.code"
              cx="60" 
              cy="60" 
              r="45" 
              fill="none" 
              :stroke="slice.color" 
              :stroke-width="activeRtWsSlice && activeRtWsSlice.code === slice.code ? 22 : 16" 
              stroke-linecap="butt"
              :stroke-dasharray="`${slice.dashArray}, 282.74`"
              :stroke-dashoffset="slice.dashOffset"
              :class="[
                'transition-all duration-300 cursor-pointer',
                activeRtWsSlice && activeRtWsSlice.code !== slice.code ? 'opacity-35' : 'opacity-100 drop-shadow-md'
              ]"
              @mouseenter="activeRtWsSlice = slice"
              @mouseleave="activeRtWsSlice = null"
            >
            </circle>
          </svg>
        </div>

        <div class="space-y-2 border-t border-slate-100 pt-3">
          <div 
            v-for="slice in rtWsPieSlices" 
            :key="'lg-' + slice.code"
            @mouseenter="activeRtWsSlice = slice"
            @mouseleave="activeRtWsSlice = null"
            :class="[
              'flex items-center justify-between text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer border',
              activeRtWsSlice && activeRtWsSlice.code === slice.code ? 'bg-slate-100 border-indigo-200 shadow-xs scale-[1.01]' : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/80'
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-3 h-3 rounded-full shrink-0 shadow-2xs" :style="{ backgroundColor: slice.color }"></span>
              <span class="text-slate-800 font-extrabold truncate">{{ slice.name }}</span>
              <span class="text-[9px] font-extrabold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.2 rounded-md">
                {{ slice.store_count }} Stores
              </span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-slate-900 font-black">{{ slice.percentage }}%</span>
              <span class="text-[10px] text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                ${{ Number(slice.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Store Details & Orders Modal Teleported -->
    <Teleport to="body">
      <div v-if="isStoreDetailModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4 sm:p-6 animate-fade-in overflow-y-auto">
        <div class="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden">
          
          <div class="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                <Icon name="heroicons:building-storefront" class="w-6 h-6 text-indigo-300" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base sm:text-lg font-black text-white truncate">
                    {{ selectedStoreForModal?.shop_name || storeProfileModalData?.shop_name || 'Store Details' }}
                  </h3>
                  <span class="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full text-xs font-mono font-bold">
                    ID: {{ selectedStoreForModal?.customer_id || storeProfileModalData?.customer_id || ('STORE-' + (selectedStoreForModal?.store_id || selectedStoreForModal?.id)) }}
                  </span>
                </div>
                <p class="text-xs text-slate-300 mt-0.5 flex items-center gap-2 truncate">
                  <span>Rank #{{ selectedStoreForModal?.rank || 'N/A' }}</span>
                  <span>•</span>
                  <span>{{ selectedStoreForModal?.trade_class || storeProfileModalData?.trade_class_l1 || 'General Store' }}</span>
                  <span>•</span>
                  <span>{{ selectedStoreForModal?.province || storeProfileModalData?.province || 'Phnom Penh' }}</span>
                </p>
              </div>
            </div>

            <button 
              @click="closeStoreDetailsModal" 
              class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/50">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-white border border-slate-200/80 p-3.5 rounded-2xl">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer ID</div>
                <div class="text-sm font-black text-slate-900 font-mono">{{ selectedStoreForModal?.customer_id || storeProfileModalData?.customer_id || 'N/A' }}</div>
              </div>
              <div class="bg-white border border-slate-200/80 p-3.5 rounded-2xl">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Orders</div>
                <div class="text-sm font-black text-indigo-600 font-mono">{{ storeOrdersModalData.length || selectedStoreForModal?.order_count || 0 }} Orders</div>
              </div>
              <div class="bg-white border border-slate-200/80 p-3.5 rounded-2xl">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Period Revenue</div>
                <div class="text-sm font-black text-emerald-700 font-mono">${{ Number(selectedStoreForModal?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
              </div>
              <div class="bg-white border border-slate-200/80 p-3.5 rounded-2xl">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pareto Share</div>
                <div class="text-sm font-black text-slate-900 font-mono">{{ selectedStoreForModal?.share_pct || 0 }}% <span class="text-xs font-normal text-slate-400">({{ selectedStoreForModal?.cumulative_pct || 0 }}% cum)</span></div>
              </div>
            </div>

            <div v-if="storeProfileModalData" class="bg-white border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
              <div class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Icon name="heroicons:map-pin" class="w-4 h-4 text-indigo-600" />
                <span>Store Information</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600 pt-1 font-medium">
                <div><span class="text-slate-400 font-bold">Contact:</span> {{ storeProfileModalData.contact || 'N/A' }}</div>
                <div><span class="text-slate-400 font-bold">Location:</span> {{ [storeProfileModalData.subdistrict, storeProfileModalData.district, storeProfileModalData.province].filter(Boolean).join(', ') || 'N/A' }}</div>
                <div><span class="text-slate-400 font-bold">Salesman:</span> {{ storeProfileModalData.salesman || 'Unassigned' }}</div>
              </div>
            </div>

            <div class="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 class="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-2">
                  <Icon name="heroicons:shopping-bag" class="w-4 h-4 text-indigo-600" />
                  <span>Store Orders History ({{ storeOrdersModalData.length }})</span>
                </h4>

                <div class="relative min-w-[200px]">
                  <input 
                    v-model="storeOrdersSearchQuery"
                    type="text" 
                    placeholder="Search SO#, ID, salesman..." 
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                  />
                  <Icon name="heroicons:magnifying-glass" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div v-if="loadingStoreOrdersModal" class="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Icon name="heroicons:arrow-path" class="w-7 h-7 animate-spin text-indigo-600" />
                <span class="text-xs font-bold">Loading store orders...</span>
              </div>

              <div v-else-if="filteredStoreOrdersModalList.length === 0" class="py-10 text-center text-slate-400 text-xs font-medium">
                No orders found for this store.
              </div>

              <div v-else class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-400 text-[9.5px] uppercase font-black tracking-wider border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3">SO # / Order ID</th>
                      <th class="py-2.5 px-3">Date</th>
                      <th class="py-2.5 px-3">Sales Representative</th>
                      <th class="py-2.5 px-3 text-right">Grand Total ($)</th>
                      <th class="py-2.5 px-3 text-center">Status</th>
                      <th class="py-2.5 px-3 text-center">Invoice</th>
                      <th class="py-2.5 px-3 text-center">Items</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                    <template v-for="order in filteredStoreOrdersModalList" :key="'ord-' + order.id">
                      <tr class="hover:bg-slate-50/80 transition-colors">
                        <td class="py-2.5 px-3 font-mono text-slate-900 font-black">
                          {{ order.so_number || ('#ORD-' + order.id) }}
                        </td>
                        <td class="py-2.5 px-3 text-slate-500 font-medium">
                          {{ order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A' }}
                        </td>
                        <td class="py-2.5 px-3 text-slate-800">
                          {{ order.user?.name || 'Unknown' }}
                        </td>
                        <td class="py-2.5 px-3 text-right font-black text-emerald-700 font-mono">
                          ${{ Number(order.grand_total || order.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                        </td>
                        <td class="py-2.5 px-3 text-center">
                          <span 
                            :class="[
                              'text-[9px] font-black uppercase px-2 py-0.5 rounded-md border',
                              order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                            ]"
                          >
                            {{ order.status || 'completed' }}
                          </span>
                        </td>
                        <td class="py-2.5 px-3 text-center">
                          <button 
                            @click="openInvoice(order)"
                            class="text-indigo-600 hover:text-indigo-900 text-[11px] font-bold underline cursor-pointer"
                          >
                            Invoice
                          </button>
                        </td>
                        <td class="py-2.5 px-3 text-center">
                          <button 
                            @click="expandedStoreOrderId = expandedStoreOrderId === order.id ? null : order.id"
                            class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                          >
                            {{ expandedStoreOrderId === order.id ? 'Hide (' + (order.items?.length || 0) + ')' : 'View (' + (order.items?.length || 0) + ')' }}
                          </button>
                        </td>
                      </tr>

                      <tr v-if="expandedStoreOrderId === order.id" class="bg-indigo-50/40 border-t border-b border-indigo-100">
                        <td colspan="7" class="p-3">
                          <div class="text-[10px] font-black text-indigo-900 uppercase tracking-wider mb-1.5">Purchased Order Items:</div>
                          <div class="space-y-1">
                            <div 
                              v-for="item in order.items" 
                              :key="'it-' + item.id"
                              class="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-indigo-100/80 font-bold"
                            >
                              <div class="flex items-center gap-2">
                                <span class="text-slate-900 font-extrabold">{{ item.product?.name || item.product_name || 'Product' }}</span>
                                <span class="text-slate-400 text-[10px]">x{{ item.qty }} {{ item.unit }}</span>
                              </div>
                              <div class="text-emerald-700 font-mono font-black">
                                ${{ Number(item.subtotal || (item.qty * item.price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
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
          </div>

          <div class="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex justify-end shrink-0">
            <button 
              @click="closeStoreDetailsModal" 
              class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useApi } from '~/composables/useApi'
import Chart from 'chart.js/auto'

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

// Tab 5: Store Performance State & Computeds
const loadingStore = ref(false)
const storeStartDate = ref(toLocalDateString(firstDay))
const storeEndDate = ref(toLocalDateString(lastDay))
const storePerformanceData = ref<any>({
  kpis: {
    total_registered_stores: 0,
    active_stores_count: 0,
    total_revenue: 0,
    total_cartons: 0,
    top_store_name: 'N/A',
    top_store_revenue: 0
  },
  store_contribution: [],
  active_store_trend: [],
  rt_vs_ws: []
})

const activeHoverStore = ref<any>(null)
const activeHoverActiveStoreDay = ref<any>(null)
const activeRtWsSlice = ref<any>(null)

// Pareto View Scope Limit State
const paretoViewLimit = ref<number | string>(15)
const isFullParetoTableOpen = ref(false)
const storeTableSearchQuery = ref('')

// Store Details & Orders Modal State
const isStoreDetailModalOpen = ref(false)
const selectedStoreForModal = ref<any>(null)
const loadingStoreOrdersModal = ref(false)
const storeOrdersModalData = ref<any[]>([])
const storeProfileModalData = ref<any>(null)
const storeOrdersSearchQuery = ref('')
const expandedStoreOrderId = ref<number | null>(null)

async function openStoreDetailsModal(store: any) {
  if (!store) return
  selectedStoreForModal.value = store
  isStoreDetailModalOpen.value = true
  loadingStoreOrdersModal.value = true
  storeOrdersModalData.value = []
  storeProfileModalData.value = null
  expandedStoreOrderId.value = null

  try {
    const storeId = store.store_id || store.id
    const res = await api.get(`/stores/${storeId}/orders`, {
      params: {
        start_date: storeStartDate.value,
        end_date: storeEndDate.value
      }
    }) as any
    storeProfileModalData.value = res.store || {}
    storeOrdersModalData.value = res.orders || []
  } catch (err) {
    console.error('Failed to load store orders details:', err)
  } finally {
    loadingStoreOrdersModal.value = false
  }
}

function closeStoreDetailsModal() {
  isStoreDetailModalOpen.value = false
  selectedStoreForModal.value = null
  storeOrdersModalData.value = []
  storeProfileModalData.value = null
}

const filteredStoreOrdersModalList = computed(() => {
  let list = storeOrdersModalData.value || []
  if (storeOrdersSearchQuery.value.trim()) {
    const q = storeOrdersSearchQuery.value.trim().toLowerCase()
    list = list.filter((o: any) => 
      (o.so_number && o.so_number.toLowerCase().includes(q)) ||
      (o.id && o.id.toString().includes(q)) ||
      (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
      (o.status && o.status.toLowerCase().includes(q))
    )
  }
  return list
})

const displayedStoreContribution = computed(() => {
  const full = storePerformanceData.value?.store_contribution || []
  if (paretoViewLimit.value === 'all') return full
  if (paretoViewLimit.value === '80%') {
    const cutoffIndex = full.findIndex((s: any) => Number(s.cumulative_pct) >= 80)
    return cutoffIndex !== -1 ? full.slice(0, cutoffIndex + 1) : full.slice(0, 15)
  }
  const limit = Number(paretoViewLimit.value) || 15
  return full.slice(0, limit)
})

const paretoCutoffStoreCount = computed(() => {
  const full = storePerformanceData.value?.store_contribution || []
  if (!full.length) return 0
  const idx = full.findIndex((s: any) => Number(s.cumulative_pct) >= 80)
  return idx !== -1 ? idx + 1 : full.length
})

const filteredFullStoreTable = computed(() => {
  let list = storePerformanceData.value?.store_contribution || []
  if (storeTableSearchQuery.value.trim()) {
    const q = storeTableSearchQuery.value.trim().toLowerCase()
    list = list.filter((s: any) => 
      (s.shop_name || '').toLowerCase().includes(q) ||
      (s.customer_id || '').toLowerCase().includes(q) ||
      (s.trade_class || '').toLowerCase().includes(q)
    )
  }
  return list
})

const maxStoreRevenue = computed(() => {
  const list = displayedStoreContribution.value || []
  if (list.length === 0) return 1
  return Math.max(...list.map((item: any) => Number(item.revenue)), 1)
})

const paretoCanvasRef = ref<HTMLCanvasElement | null>(null)
let paretoChartInstance: any = null
const paretoHoverIndex = ref<number | null>(null)

const paretoTotalRevenue = computed(() => {
  const full = storePerformanceData.value?.store_contribution || []
  return full.reduce((sum: number, s: any) => sum + Number(s.revenue || 0), 0)
})

const paretoDropPct = computed(() => {
  if (paretoHoverIndex.value === null || paretoHoverIndex.value <= 0) return null
  const list = displayedStoreContribution.value || []
  const prevRev = Number(list[paretoHoverIndex.value - 1]?.revenue || 0)
  const currRev = Number(list[paretoHoverIndex.value]?.revenue || 0)
  if (prevRev <= 0) return null
  return (((prevRev - currRev) / prevRev) * 100).toFixed(1)
})

function renderParetoChart() {
  if (!paretoCanvasRef.value) return
  if (paretoChartInstance) {
    paretoChartInstance.destroy()
    paretoChartInstance = null
  }

  const raw = displayedStoreContribution.value || []
  if (!raw.length) return

  const cutoffIndex = raw.findIndex((s: any) => Number(s.cumulative_pct || 0) >= 80)

  const labels = raw.map((s: any, i: number) => `#${s.rank || i + 1}`)
  const revenues = raw.map((s: any) => Number(s.revenue || 0))
  const cumPcts = raw.map((s: any) => Number(s.cumulative_pct || 0))

  const coreC = '#2a78d6'
  const tailC = '#d3d1c7'
  const axisC = '#898781'
  const gridC = 'rgba(0, 0, 0, 0.05)'

  const cutoffPlugin = {
    id: 'cutoffLine',
    afterDraw(chart: any) {
      if (cutoffIndex < 0) return
      const { ctx, chartArea, scales } = chart
      if (!scales.x) return
      const x0 = scales.x.getPixelForValue(0)
      const x1 = scales.x.getPixelForValue(1)
      const bw = x1 - x0
      const xPx = scales.x.getPixelForValue(cutoffIndex) + (bw > 0 ? bw * 0.5 : 0)

      ctx.save()
      ctx.strokeStyle = '#eda100'
      ctx.lineWidth = 1.5
      ctx.setLineDash([5, 3])
      ctx.beginPath()
      ctx.moveTo(xPx, chartArea.top)
      ctx.lineTo(xPx, chartArea.bottom)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#eda100'
      ctx.font = '500 10px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('80%', xPx + 4, chartArea.top + 13)
      ctx.restore()
    }
  }

  const topBarLabelsPlugin = {
    id: 'topBarLabels',
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart
      const meta = chart.getDatasetMeta(0)
      if (!meta || !meta.data) return

      const totalRev = Math.max(1, paretoTotalRevenue.value)
      const count = raw.length

      ctx.save()

      meta.data.forEach((bar: any, index: number) => {
        const store = raw[index]
        if (!store) return

        const isHovered = paretoHoverIndex.value === index

        if (count > 35 && !isHovered && index >= 10 && index % 5 !== 0) return

        const revVal = '$' + Math.round(Number(store.revenue || 0)).toLocaleString()
        const pctVal = ((Number(store.revenue || 0) / totalRev) * 100).toFixed(1) + '%'
        const labelText = `${revVal} (${pctVal})`

        const x = bar.x
        const y = bar.y - 6

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(-Math.PI / 4)

        ctx.font = isHovered ? '900 10.5px sans-serif' : '700 9px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = isHovered ? '#1e1b4b' : (Number(store.cumulative_pct || 0) <= 80 ? '#2a78d6' : '#64748b')

        ctx.fillText(labelText, 0, 0)
        ctx.restore()
      })
      ctx.restore()
    }
  }

  const cumLineColor = '#10b981'

  paretoChartInstance = new Chart(paretoCanvasRef.value, {
    type: 'bar',
    plugins: [cutoffPlugin, topBarLabelsPlugin],
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Revenue',
          data: revenues,
          backgroundColor: raw.map((s: any) => Number(s.cumulative_pct || 0) <= 80 ? coreC : tailC),
          hoverBackgroundColor: raw.map((s: any) => Number(s.cumulative_pct || 0) <= 80 ? '#185FA5' : '#888780'),
          borderRadius: { topLeft: 10, topRight: 10 },
          borderSkipped: 'bottom',
          maxBarThickness: raw.length <= 15 ? 42 : (raw.length <= 30 ? 24 : 14),
          barPercentage: 0.88,
          categoryPercentage: 0.94,
          order: 2,
          yAxisID: 'y'
        },
        {
          type: 'line',
          label: 'Cumulative %',
          data: cumPcts,
          borderColor: cumLineColor,
          borderWidth: 2,
          pointRadius: raw.map((_: any, i: number) => i === cutoffIndex ? 5 : 0),
          pointBackgroundColor: '#ffffff',
          pointBorderColor: cumLineColor,
          pointBorderWidth: 2,
          tension: 0.35,
          fill: false,
          order: 1,
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      onHover: (event: any, elements: any[]) => {
        if (elements && elements.length > 0) {
          const idx = elements[0].index
          paretoHoverIndex.value = idx
          activeHoverStore.value = raw[idx]
        } else {
          paretoHoverIndex.value = null
          activeHoverStore.value = null
        }
      },
      onClick: (event: any, elements: any[]) => {
        if (elements && elements.length > 0) {
          const idx = elements[0].index
          const store = raw[idx]
          if (store) {
            openStoreDetailsModal(store)
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: {
          ticks: {
            color: axisC,
            font: { size: 10 },
            maxRotation: 0,
            callback: (val: any, index: number) => {
              const totalLen = raw.length
              if (index === 0 || index === cutoffIndex || index === totalLen - 1 || index % 15 === 0) {
                return `#${raw[index]?.rank || index + 1}`
              }
              return ''
            }
          },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          position: 'left',
          min: 0,
          max: maxStoreRevenue.value > 0 ? Math.ceil((maxStoreRevenue.value * 1.35) / 1000) * 1000 : undefined,
          grid: { color: gridC, lineWidth: 0.5 },
          border: { display: false },
          ticks: {
            color: axisC,
            font: { size: 10 },
            callback: (v: any) => '$' + Number(v).toLocaleString()
          }
        },
        y2: {
          position: 'right',
          min: 0,
          max: 100,
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: axisC,
            font: { size: 10 },
            callback: (v: any) => v + '%',
            stepSize: 25
          }
        }
      }
    }
  })
}

watch(displayedStoreContribution, () => {
  nextTick(() => {
    renderParetoChart()
  })
}, { deep: true })

const storeTrendMetric = ref<'stores' | 'revenue'>('stores')

function shouldShowTrendDateLabel(index: number | string, total: number | string): boolean {
  const idx = typeof index === 'number' ? index : parseInt(String(index), 10) || 0
  const tot = typeof total === 'number' ? total : parseInt(String(total), 10) || 0
  if (tot <= 12) return true
  const step = Math.ceil(tot / 8)
  return idx === 0 || idx === tot - 1 || idx % step === 0
}

const maxActiveStoreTrendValue = computed(() => {
  const list = storePerformanceData.value?.active_store_trend || []
  if (list.length === 0) return 1
  if (storeTrendMetric.value === 'revenue') {
    return Math.max(...list.map((item: any) => Number(item.daily_revenue || 0)), 1)
  }
  return Math.max(...list.map((item: any) => Number(item.active_stores_count || 0)), 1)
})

const rtWsPieSlices = computed(() => {
  const list = storePerformanceData.value?.rt_vs_ws || []
  if (!list.length) return []
  
  const circumference = 2 * Math.PI * 45 // ~282.74
  let accumulatedPct = 0

  return list.map((item: any) => {
    const pct = Number(item.percentage || 0)
    const dashArray = (pct / 100) * circumference
    const dashOffset = -((accumulatedPct / 100) * circumference)
    accumulatedPct += pct

    return {
      name: item.name,
      code: item.code,
      revenue: item.revenue,
      percentage: pct.toFixed(1),
      store_count: item.store_count,
      color: item.color,
      dashArray,
      dashOffset
    }
  })
})

async function fetchStorePerformance() {
  loadingStore.value = true
  try {
    const params = {
      start_date: storeStartDate.value,
      end_date: storeEndDate.value
    }
    const res = await api.get('/admin/reports/store-performance', { params }) as any
    storePerformanceData.value = res
  } catch (err) {
    console.error('Failed to load store performance:', err)
  } finally {
    loadingStore.value = false
  }
}

async function resetStoreFilters() {
  storeStartDate.value = toLocalDateString(firstDay)
  storeEndDate.value = toLocalDateString(lastDay)
  await fetchStorePerformance()
}

function openInvoice(order: any) {
  if (order.invoice_url) {
    window.open(order.invoice_url, '_blank')
  } else if (order.id || order.order_id) {
    navigateTo(`/admin/orders/${order.id || order.order_id}`)
  }
}

onMounted(() => {
  fetchStorePerformance()
  nextTick(() => {
    renderParetoChart()
  })
})

onBeforeUnmount(() => {
  if (paretoChartInstance) {
    paretoChartInstance.destroy()
    paretoChartInstance = null
  }
})
</script>
