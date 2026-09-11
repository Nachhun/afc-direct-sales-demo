<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Date & Product Filters Row -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Start Date -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-blue-500 shrink-0" />
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">From</span>
          <input type="date" v-model="productStartDate" @change="fetchProductPerformance" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <!-- End Date -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-blue-500 shrink-0" />
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">To</span>
          <input type="date" v-model="productEndDate" @change="fetchProductPerformance" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" />
        </div>

        <!-- SKU Filter Dropdown -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 min-w-[200px]">
          <Icon name="heroicons:cube" class="w-4 h-4 text-indigo-500 shrink-0" />
          <select v-model="selectedProductId" @change="fetchProductPerformance" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 w-full cursor-pointer">
            <option :value="null">All Product SKUs</option>
            <option v-for="prod in productPerformanceData.all_products" :key="prod.id" :value="prod.id">
              {{ prod.name }}
            </option>
          </select>
        </div>
      </div>

      <button 
        @click="resetProductFilters"
        class="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm"
      >
        <Icon name="heroicons:arrow-path" class="w-4 h-4" />
        Reset Filters
      </button>
    </div>

    <!-- Loading Spinner -->
    <div v-if="loadingProduct" class="flex flex-col items-center justify-center py-24 space-y-4 bg-white border border-slate-200 rounded-3xl">
      <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Aggregating Product Metrics...</p>
    </div>

    <div v-else class="space-y-6">
      <!-- 4 KPI Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Sales Revenue -->
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:banknotes" class="w-14 h-14 text-blue-600" />
          </div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Revenue ($)</p>
          <p class="text-2xl font-black text-slate-900 mt-2">
            ${{ Number(productPerformanceData.kpis?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
          <div class="mt-3 flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase tracking-wider">
            <Icon name="heroicons:chart-bar" class="w-3.5 h-3.5" />
            <span>Consolidated Net Earnings</span>
          </div>
        </div>

        <!-- Card 2: Total Volume (Cartons) -->
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:rectangle-stack" class="w-14 h-14 text-indigo-600" />
          </div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Volume (CTN)</p>
          <p class="text-2xl font-black text-slate-900 mt-2">
            {{ Number(productPerformanceData.kpis?.total_cartons || 0).toLocaleString() }} CTN
          </p>
          <div class="mt-3 flex items-center gap-1 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
            <Icon name="heroicons:shopping-cart" class="w-3.5 h-3.5" />
            <span>Total Cartons Dispatched</span>
          </div>
        </div>

        <!-- Card 3: Top SKU -->
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:trophy" class="w-14 h-14 text-amber-500" />
          </div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Top Selling SKU Revenue</p>
          <p class="text-2xl font-black text-slate-900 mt-2">
            ${{ Number(productPerformanceData.kpis?.top_sku_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
          <div class="mt-3 flex items-center gap-1.5 text-xs text-amber-700 font-extrabold truncate" :title="productPerformanceData.kpis?.top_sku">
            <Icon name="heroicons:trophy" class="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span class="truncate">{{ productPerformanceData.kpis?.top_sku || 'N/A' }}</span>
          </div>
        </div>

        <!-- Card 4: Active SKUs -->
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:cube" class="w-14 h-14 text-emerald-600" />
          </div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active SKUs Sold</p>
          <p class="text-2xl font-black text-slate-900 mt-2">
            {{ productPerformanceData.kpis?.active_sku_count || 0 }} SKUs
          </p>
          <div class="mt-3 flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            <Icon name="heroicons:tag" class="w-3.5 h-3.5" />
            <span>Products With Sales</span>
          </div>
        </div>
      </div>

      <!-- Layout Grid for Sketch Chart 1 and Chart 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        <!-- SKETCH CHART 1: Sales by SKU -->
        <div class="lg:col-span-3 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between h-full">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Icon name="heroicons:chart-bar-square" class="w-5 h-5 text-blue-600" />
                1. Sales by SKU — Revenue Bar Chart
              </h3>
              <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                Product revenue ($) sorted from highest to lowest
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/80 px-3 py-1 rounded-xl uppercase tracking-wider shadow-2xs">
                Total: ${{ Number(productPerformanceData.kpis?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
              <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xl">
                {{ productPerformanceData.sales_by_sku?.length || 0 }} SKUs
              </span>
            </div>
          </div>

          <div v-if="!productPerformanceData.sales_by_sku?.length" class="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
            No SKU sales recorded for this period.
          </div>

          <div v-else ref="skuListContainer" class="space-y-2.5 max-h-[550px] overflow-y-auto p-1.5 custom-scrollbar flex-1">
            <div 
              v-for="(item, idx) in productPerformanceData.sales_by_sku" 
              :key="item.product_id" 
              @mouseenter="activePieSlice = productPieSlices.find((s: any) => s.name === item.product_name) || { name: item.product_name, percentage: item.contribution_pct, revenue: item.total_revenue, color: getProductColor(idx) }"
              @mouseleave="activePieSlice = null"
              :class="[
                'p-2.5 rounded-xl transition-all duration-200 group space-y-1.5 border cursor-pointer relative',
                activePieSlice && activePieSlice.name === item.product_name 
                  ? 'bg-blue-50/95 border-blue-500 ring-2 ring-blue-400/80 shadow-md z-10' 
                  : activePieSlice 
                    ? 'opacity-45 border-slate-200/50 bg-slate-50/40' 
                    : 'bg-slate-50/80 hover:bg-white border-slate-200/70 hover:border-blue-300 shadow-2xs'
              ]"
            >
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 min-w-0 w-44 sm:w-56 shrink-0">
                  <span 
                    :class="[
                      'w-4 h-4 rounded text-[9px] font-black flex items-center justify-center shrink-0 transition-transform',
                      activePieSlice && activePieSlice.name === item.product_name ? 'scale-110' : '',
                      idx === 0 ? 'bg-amber-400 text-amber-950 ring-1 ring-amber-300' :
                      idx === 1 ? 'bg-indigo-100 text-indigo-800' :
                      idx === 2 ? 'bg-violet-100 text-violet-800' :
                      'bg-slate-200 text-slate-700'
                    ]"
                  >
                    #{{ Number(idx) + 1 }}
                  </span>
                  <span 
                    :class="[
                      'font-black text-xs truncate transition-colors',
                      activePieSlice && activePieSlice.name === item.product_name ? 'text-blue-700 font-extrabold' : 'text-slate-900 group-hover:text-blue-600'
                    ]"
                    :title="item.product_name"
                  >
                    {{ item.product_name }}
                  </span>
                </div>

                <div class="flex-1 bg-slate-200/70 rounded-full h-3 overflow-hidden p-0.5 relative shadow-inner">
                  <div 
                    :class="[
                      'h-full rounded-full transition-all duration-700',
                      activePieSlice && activePieSlice.name === item.product_name
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 saturate-150 brightness-110 shadow-sm'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:brightness-110'
                    ]"
                    :style="{ width: `${maxProductPerformanceRevenue > 0 ? Math.max(6, (item.total_revenue / maxProductPerformanceRevenue) * 100) : 0}%` }"
                  ></div>
                </div>

                <div class="flex items-center gap-2 shrink-0 text-right">
                  <span class="text-[10px] font-extrabold text-slate-500 hidden md:inline">
                    {{ Number(item.total_qty.toFixed(1)).toLocaleString() }} CTN
                  </span>
                  <span 
                    :class="[
                      'font-black text-xs sm:text-sm min-w-[75px] transition-colors',
                      activePieSlice && activePieSlice.name === item.product_name ? 'text-blue-700 scale-105' : 'text-slate-900'
                    ]"
                  >
                    ${{ Number(item.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </span>
                </div>
              </div>

              <div class="flex items-center justify-between text-[9px] font-extrabold text-slate-400 px-1 pt-0.5 border-t border-slate-100/60">
                <span class="text-slate-500">
                  Share: <strong :class="activePieSlice && activePieSlice.name === item.product_name ? 'text-blue-700 font-black' : 'text-blue-600'">{{ item.contribution_pct }}%</strong>
                </span>
                <span v-if="item.total_qty_promo > 0" class="text-indigo-600 font-bold">
                  Paid: {{ item.total_qty_paid }} CTN | Promo: {{ item.total_qty_promo }} CTN FOC
                </span>
                <span v-else class="text-slate-400">
                  Paid: {{ item.total_qty_paid }} CTN
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sales % Contribution — Pie Chart -->
        <div class="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 class="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Icon name="heroicons:chart-pie" class="w-5 h-5 text-indigo-600" />
              2. Sales % Contribution — Pie Chart
            </h3>
            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Percentage breakdown of revenue by product SKU
            </p>
          </div>

          <div class="relative flex items-center justify-center py-4 min-h-[220px]">
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 p-4 transition-all duration-300">
              <template v-if="activePieSlice">
                <span class="w-2.5 h-2.5 rounded-full mb-1 animate-pulse" :style="{ backgroundColor: activePieSlice.color }"></span>
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[130px]">
                  {{ activePieSlice.name }}
                </span>
                <span class="text-xl font-black text-slate-900 leading-none mt-1" :style="{ color: activePieSlice.color }">
                  {{ activePieSlice.percentage }}%
                </span>
                <span class="text-[10px] font-extrabold text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  ${{ Number(activePieSlice.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </template>

              <template v-else>
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Sales</span>
                <span class="text-lg font-black text-slate-900 mt-0.5">
                  ${{ Number(productPerformanceData.kpis?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
                <span class="text-[9px] font-bold text-slate-400 mt-0.5">
                  {{ productPieSlices.length }} Active SKUs
                </span>
              </template>
            </div>

            <svg class="w-56 h-56 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#f1f5f9" stroke-width="16" />
              <circle 
                v-for="(slice, sIdx) in productPieSlices" 
                :key="sIdx"
                cx="60" 
                cy="60" 
                r="45" 
                fill="none" 
                :stroke="slice.color" 
                :stroke-width="activePieSlice && activePieSlice.name === slice.name ? 22 : 16" 
                stroke-linecap="butt"
                :stroke-dasharray="`${slice.dashArray}, 282.74`"
                :stroke-dashoffset="slice.dashOffset"
                :class="[
                  'transition-all duration-300 cursor-pointer',
                  activePieSlice && activePieSlice.name !== slice.name ? 'opacity-35' : 'opacity-100 drop-shadow-md'
                ]"
                @mouseenter="activePieSlice = slice"
                @mouseleave="activePieSlice = null"
                @click="slice.name === 'Others' ? openOthersModal(null, 'Others') : null"
              >
              </circle>
            </svg>
          </div>

          <div class="space-y-1.5 border-t border-slate-100 pt-3">
            <div 
              v-for="slice in productPieSlices" 
              :key="slice.name" 
              @mouseenter="activePieSlice = slice"
              @mouseleave="activePieSlice = null"
              @click="slice.name === 'Others' ? openOthersModal(null, 'Others') : null"
              :class="[
                'flex items-center justify-between text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer',
                slice.name === 'Others' ? 'bg-amber-50/90 border border-amber-200 hover:bg-amber-100/80 shadow-2xs' : (activePieSlice && activePieSlice.name === slice.name ? 'bg-slate-100 border border-indigo-200/80 shadow-xs scale-[1.01]' : 'hover:bg-slate-50 border border-transparent')
              ]"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-3 h-3 rounded-full shrink-0 shadow-2xs" :style="{ backgroundColor: slice.color }"></span>
                <span :class="slice.name === 'Others' ? 'text-amber-900 font-black' : 'text-slate-700'" class="truncate" :title="slice.name">{{ slice.name }}</span>
                <span v-if="slice.name === 'Others'" class="text-[9px] font-black uppercase text-amber-600 bg-white border border-amber-200 px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-1 shadow-2xs">
                  <Icon name="heroicons:eye" class="w-3 h-3 text-amber-500" />
                  <span>View Products</span>
                </span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span :class="slice.name === 'Others' ? 'text-amber-900 font-black' : 'text-slate-900 font-black'">{{ slice.percentage }}%</span>
                <span :class="slice.name === 'Others' ? 'bg-amber-100 text-amber-800 border border-amber-200/80' : 'bg-slate-100/80 text-slate-500'" class="text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  ${{ Number(slice.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CHART 3: Daily Sales Trend -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">3. Order Trend — Daily Sales</h3>
            </div>
            <p class="text-slate-400 text-[11px] font-medium mt-0.5 ml-4">
              Daily product breakdown ({{ productStartDate }} to {{ productEndDate }})
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div 
              v-for="(pName, pIdx) in productPerformanceData.top_products_list" 
              :key="pName"
              @click="pName === 'Others' ? openOthersModal(null, 'Others') : null"
              :class="[
                'flex items-center gap-1.5 text-xs font-semibold transition-all rounded-lg px-2 py-1',
                pName === 'Others' ? 'cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 shadow-2xs' : 'text-slate-600'
              ]"
            >
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: getProductColor(pIdx) }"></span>
              <span class="truncate max-w-[130px]">{{ pName }}</span>
              <span v-if="pName === 'Others'" class="text-[9px] font-black uppercase text-amber-600 bg-white border border-amber-200 px-1 py-0.2 rounded">View</span>
            </div>
          </div>
        </div>

        <div class="bg-slate-50/80 border border-slate-100 p-3.5 rounded-xl flex items-center justify-between gap-4 min-h-[52px]">
          <div v-if="activeHoverDay" class="flex items-center gap-4 animate-fade-in">
            <span class="text-xs font-extrabold text-slate-500 uppercase tracking-widest bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
              {{ activeHoverDay.formatted_date }}
            </span>
            <div class="flex items-baseline gap-1.5">
              <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue:</span>
              <span class="text-base font-black text-slate-900">
                ${{ Number(activeHoverDay.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
          <div v-else class="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Icon name="heroicons:cursor-arrow-rays" class="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Hover over a daily bar to view total & product breakdown</span>
          </div>

          <div class="flex items-center gap-3 shrink-0 text-xs">
            <span class="text-slate-400 font-medium">Period Total:</span>
            <span class="font-black text-slate-900">${{ Number(productPerformanceData.kpis?.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <div v-if="!productPerformanceData.daily_trend?.length" class="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
          No daily trend data available for this range.
        </div>

        <div class="overflow-x-auto custom-scrollbar" v-else>
          <div class="min-w-[700px] flex flex-col justify-between relative pt-6 pb-2">
            
            <div class="absolute inset-x-0 top-8 bottom-8 flex flex-col justify-between pointer-events-none z-0">
              <div v-for="i in 5" :key="i" class="flex items-center gap-3">
                <span class="text-[10px] text-slate-400 font-mono w-10 text-right shrink-0 leading-none">
                  ${{ maxDailyRevenue > 0 ? Number((maxDailyRevenue / 4) * (5 - i)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0 }}
                </span>
                <div class="flex-1 border-b border-slate-100"></div>
              </div>
            </div>

            <div class="relative h-64 w-full flex items-end justify-between gap-1 pt-10 pl-14 z-10">
              <div 
                v-for="(day, dayIdx) in productPerformanceData.daily_trend" 
                :key="day.date" 
                @mouseenter="activeHoverDay = day"
                @mouseleave="activeHoverDay = null"
                :class="[
                  'flex-1 flex flex-col items-center justify-end h-full group/trend relative cursor-pointer transition-colors duration-150 rounded-md',
                  activeHoverDay?.date === day.date ? 'bg-slate-100/70' : 'hover:bg-slate-50/50'
                ]"
              >
                <div class="mb-1 shrink-0 z-10 h-4 flex items-end justify-center">
                  <span 
                    v-if="day.total_revenue > 0"
                    :class="[
                      'text-[9.5px] font-extrabold leading-tight transition-colors',
                      activeHoverDay?.date === day.date ? 'text-indigo-600' : 'text-slate-600'
                    ]"
                  >
                    ${{ Number(day.total_revenue).toLocaleString(undefined, { maximumFractionDigits: 0 }) }}
                  </span>
                </div>

                <div 
                  class="w-full max-w-[20px] rounded-t-sm overflow-visible flex flex-col-reverse relative transition-all"
                  :style="{ height: maxDailyRevenue > 0 ? `${Math.max(3, (day.total_revenue / maxDailyRevenue) * 72)}%` : '3px' }"
                >
                  <div 
                    v-for="(pName, pIdx) in productPerformanceData.top_products_list" 
                    :key="pName"
                    v-show="(day.products?.[pName]?.revenue || 0) > 0"
                    @mouseenter="activeHoverDay = day; hoveredSegment = { day, pName, revenue: day.products?.[pName]?.revenue, qty: day.products?.[pName]?.qty, color: getProductColor(pIdx), pct: day.total_revenue > 0 ? ((day.products?.[pName]?.revenue || 0) / day.total_revenue * 100).toFixed(1) : 0 }"
                    @mouseleave="hoveredSegment = null"
                    @click="pName === 'Others' ? openOthersModal(day, 'Others') : null"
                    :style="{ 
                      height: day.total_revenue > 0 ? `${((day.products?.[pName]?.revenue || 0) / day.total_revenue) * 100}%` : '0%',
                      backgroundColor: getProductColor(pIdx)
                    }"
                    :class="[
                      'w-full transition-opacity cursor-pointer relative',
                      hoveredSegment && hoveredSegment.day?.date === day.date && hoveredSegment.pName === pName
                        ? 'opacity-100 ring-2 ring-white z-40'
                        : 'hover:opacity-90'
                    ]"
                  >
                    <template v-if="hoveredSegment && hoveredSegment.day?.date === day.date && hoveredSegment.pName === pName">
                      <svg 
                        class="absolute inset-0 w-[200px] h-[180px] pointer-events-none z-50 overflow-visible"
                        :class="Number(dayIdx) > (productPerformanceData.daily_trend?.length || 0) / 2 ? 'right-0 -translate-x-full' : 'left-full'"
                      >
                        <path 
                          :d="Number(dayIdx) > (productPerformanceData.daily_trend?.length || 0) / 2
                            ? 'M 200 10 L 165 -65 L 115 -65'
                            : 'M 0 10 L 35 -65 L 85 -65'"
                          :stroke="hoveredSegment.color || '#3b82f6'" 
                          stroke-width="2.5" 
                          fill="none" 
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="animate-fade-in"
                        />
                        <circle 
                          :cx="Number(dayIdx) > (productPerformanceData.daily_trend?.length || 0) / 2 ? '200' : '0'" 
                          cy="10" 
                          r="3" 
                          :fill="hoveredSegment.color || '#3b82f6'" 
                        />
                      </svg>

                      <div 
                        :class="[
                          'absolute -top-24 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-xl z-50 whitespace-nowrap animate-fade-in pointer-events-none min-w-[190px] space-y-1.5 text-slate-900',
                          Number(dayIdx) > (productPerformanceData.daily_trend?.length || 0) / 2 ? 'right-full mr-20' : 'left-full ml-20'
                        ]"
                      >
                        <div class="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                          <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" :style="{ backgroundColor: hoveredSegment.color }"></span>
                          <span class="text-[11px] font-black truncate max-w-[150px] text-slate-900 leading-tight">{{ hoveredSegment.pName }}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-1 text-[10px] font-bold">
                          <div class="bg-slate-50 border border-slate-100 px-1.5 py-1 rounded-lg">
                            <span class="text-[8px] font-extrabold text-slate-400 block uppercase tracking-wider leading-none mb-0.5">Volume</span>
                            <span class="text-slate-800 font-black leading-none">{{ Number(hoveredSegment.qty || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }) }} CTN</span>
                          </div>
                          <div class="bg-indigo-50/80 border border-indigo-100 px-1.5 py-1 rounded-lg text-indigo-700">
                            <span class="text-[8px] font-extrabold text-indigo-400 block uppercase tracking-wider leading-none mb-0.5">Share</span>
                            <span class="font-black leading-none">{{ hoveredSegment.pct }}%</span>
                          </div>
                        </div>
                        <div class="bg-emerald-50/80 border border-emerald-100 px-2 py-1 rounded-lg flex items-center justify-between text-[11px] font-black">
                          <span class="text-[8px] font-extrabold text-emerald-600 uppercase tracking-wider">Revenue</span>
                          <span class="text-xs font-black text-emerald-700">${{ Number(hoveredSegment.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                        </div>

                        <button 
                          v-if="hoveredSegment.pName === 'Others'"
                          @click.stop="openOthersModal(hoveredSegment.day, 'Others')"
                          class="w-full mt-1 bg-amber-500 hover:bg-amber-600 text-white text-[9.5px] font-black py-1 px-2 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs pointer-events-auto"
                        >
                          <Icon name="heroicons:eye" class="w-3 h-3" />
                          <span>View Products in Others</span>
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between w-full mt-3 pt-2 border-t border-slate-100 pl-14">
              <div v-for="day in productPerformanceData.daily_trend" :key="day.date" class="flex-1 text-center">
                <span 
                  :class="[
                    'text-[9px] font-medium block truncate transition-colors',
                    day.total_revenue > 0 ? 'text-slate-700 font-bold' : 'text-slate-300'
                  ]"
                >
                  {{ day.formatted_date }}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Others Category Breakdown Modal Teleported -->
    <Teleport to="body">
      <div v-if="isOthersModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-3xl p-6 sm:p-8 rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
          <button @click="isOthersModalOpen = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>

          <div class="flex items-center gap-3.5 mb-5">
            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
              <Icon name="heroicons:squares-plus" class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-xl font-black text-slate-900 tracking-tight">{{ othersModalTitle }}</h3>
                <span class="bg-amber-100 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-amber-200">Others Category</span>
              </div>
              <p class="text-slate-500 text-xs font-medium mt-0.5">
                {{ othersModalSubTitle }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div class="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
              <span class="text-lg font-black text-slate-900">${{ Number(othersModalTotalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="bg-amber-50/60 border border-amber-100 p-3 rounded-2xl">
              <span class="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">Total Volume</span>
              <span class="text-lg font-black text-amber-900">{{ Number(othersModalTotalQty).toLocaleString(undefined, { maximumFractionDigits: 1 }) }} CTN</span>
            </div>
            <div class="bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl">
              <span class="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Products Count</span>
              <span class="text-lg font-black text-indigo-900">{{ othersModalItems.length }} Products</span>
            </div>
          </div>

          <div class="relative mb-4">
            <input 
              v-model="othersSearchQuery" 
              type="text" 
              placeholder="Search product in 'Others' category..." 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl">
            <div v-if="!filteredOthersItems.length" class="text-center py-12 text-slate-400 text-xs font-bold uppercase tracking-wider">
              No products recorded under 'Others'.
            </div>

            <table v-else class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-wider sticky top-0 border-b border-slate-100 z-10">
                <tr>
                  <th class="py-3 px-4 w-12">#</th>
                  <th class="py-3 px-4">Product Name</th>
                  <th class="py-3 px-4 text-right">Volume (CTN)</th>
                  <th class="py-3 px-4 text-right">Revenue ($)</th>
                  <th class="py-3 px-4 text-right">Contribution</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                <tr 
                  v-for="(item, idx) in filteredOthersItems" 
                  :key="item.product_id || item.product_name"
                  class="hover:bg-amber-50/40 transition-colors"
                >
                  <td class="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{{ idx + 1 }}</td>
                  <td class="py-3.5 px-4 font-black text-slate-900">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                      <span class="truncate max-w-[280px]">{{ item.product_name || item.name }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right font-black text-slate-800">
                    {{ Number(item.total_qty || item.qty || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }) }} CTN
                  </td>
                  <td class="py-3.5 px-4 text-right font-black text-emerald-700">
                    ${{ Number(item.total_revenue || item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <span v-if="item.contribution_pct !== undefined" class="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-black">
                      {{ item.contribution_pct }}%
                    </span>
                    <span v-else class="text-slate-400 text-[10px]">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button @click="isOthersModalOpen = false" class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer">
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
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

// Tab 4: Product Performance State & Computeds
const loadingProduct = ref(false)
const activeHoverDay = ref<any>(null)
const activePieSlice = ref<any>(null)
const hoveredSegment = ref<any>(null)
const skuListContainer = ref<HTMLElement | null>(null)

// Others Category Breakdown Modal State
const isOthersModalOpen = ref(false)
const othersModalTitle = ref('')
const othersModalSubTitle = ref('')
const othersModalItems = ref<any[]>([])
const othersModalTotalRevenue = ref(0)
const othersModalTotalQty = ref(0)
const othersSearchQuery = ref('')

function openOthersModal(day: any = null, pName: string = 'Others') {
  othersSearchQuery.value = ''
  if (day) {
    othersModalTitle.value = `Daily 'Others' Breakdown`
    othersModalSubTitle.value = `Order items in 'Others' category for ${day.formatted_date}`
    const othersData = day.products?.Others
    othersModalItems.value = othersData?.items || []
    othersModalTotalRevenue.value = othersData?.revenue || 0
    othersModalTotalQty.value = othersData?.qty || 0
  } else {
    othersModalTitle.value = `'Others' Category Breakdown`
    othersModalSubTitle.value = `All products in 'Others' category from ${productStartDate.value} to ${productEndDate.value}`
    const items = productPerformanceData.value?.others_breakdown || []
    othersModalItems.value = items
    othersModalTotalRevenue.value = items.reduce((sum: number, i: any) => sum + (Number(i.total_revenue) || Number(i.revenue) || 0), 0)
    othersModalTotalQty.value = items.reduce((sum: number, i: any) => sum + (Number(i.total_qty) || Number(i.qty) || 0), 0)
  }
  isOthersModalOpen.value = true
}

const filteredOthersItems = computed(() => {
  let list = othersModalItems.value || []
  if (othersSearchQuery.value.trim()) {
    const q = othersSearchQuery.value.trim().toLowerCase()
    list = list.filter((i: any) => (i.product_name || i.name || '').toLowerCase().includes(q))
  }
  return list
})

watch(activePieSlice, (newSlice) => {
  if (newSlice && newSlice.name && skuListContainer.value) {
    const list = productPerformanceData.value?.sales_by_sku || []
    const idx = list.findIndex((item: any) => item.product_name === newSlice.name)
    if (idx !== -1) {
      const container = skuListContainer.value
      const children = container.children
      if (children && children[idx]) {
        const targetEl = children[idx] as HTMLElement
        const elementTop = targetEl.offsetTop - container.offsetTop
        const elementBottom = elementTop + targetEl.offsetHeight
        const containerTop = container.scrollTop
        const containerBottom = containerTop + container.clientHeight

        if (elementTop < containerTop) {
          container.scrollTo({ top: Math.max(0, elementTop - 12), behavior: 'smooth' })
        } else if (elementBottom > containerBottom) {
          container.scrollTo({ top: elementBottom - container.clientHeight + 12, behavior: 'smooth' })
        }
      }
    }
  }
})

const productStartDate = ref(toLocalDateString(firstDay))
const productEndDate = ref(toLocalDateString(lastDay))
const selectedProductId = ref<number | null>(null)
const productPerformanceData = ref<any>({
  kpis: {
    total_revenue: 0,
    total_cartons: 0,
    top_sku: 'N/A',
    top_sku_revenue: 0,
    active_sku_count: 0
  },
  all_products: [],
  sales_by_sku: [],
  sales_contribution: [],
  daily_trend: [],
  top_products_list: []
})

const productColors = [
  '#2563eb', // blue-600
  '#4f46e5', // indigo-600
  '#7c3aed', // violet-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#e11d48', // rose-600
  '#0891b2', // cyan-600
]

function getProductColor(idx: number | string): string {
  const i = typeof idx === 'number' ? idx : (parseInt(String(idx), 10) || 0)
  return productColors[i % productColors.length] ?? '#2563eb'
}

const maxProductPerformanceRevenue = computed(() => {
  const list = productPerformanceData.value?.sales_by_sku || []
  if (list.length === 0) return 1
  return Math.max(...list.map((item: any) => Number(item.total_revenue)), 1)
})

const maxDailyRevenue = computed(() => {
  const list = productPerformanceData.value?.daily_trend || []
  if (list.length === 0) return 1
  return Math.max(...list.map((item: any) => Number(item.total_revenue)), 1)
})

const productPieSlices = computed(() => {
  const list = productPerformanceData.value?.sales_contribution || []
  if (!list.length) return []
  
  const circumference = 2 * Math.PI * 45 // ~282.74
  let accumulatedPct = 0

  return list.map((item: any, idx: number) => {
    const pct = Number(item.contribution_pct || 0)
    const dashArray = (pct / 100) * circumference
    const dashOffset = -((accumulatedPct / 100) * circumference)
    accumulatedPct += pct

    return {
      name: item.product_name,
      revenue: item.total_revenue,
      percentage: pct.toFixed(1),
      color: productColors[idx % productColors.length],
      dashArray,
      dashOffset
    }
  })
})

async function fetchProductPerformance() {
  loadingProduct.value = true
  try {
    const params: any = {
      start_date: productStartDate.value,
      end_date: productEndDate.value
    }
    if (selectedProductId.value) {
      params.product_id = selectedProductId.value
    }
    const res = await api.get('/admin/reports/product-performance', { params }) as any
    productPerformanceData.value = res
  } catch (err) {
    console.error('Failed to load product performance:', err)
  } finally {
    loadingProduct.value = false
  }
}

async function resetProductFilters() {
  productStartDate.value = toLocalDateString(firstDay)
  productEndDate.value = toLocalDateString(lastDay)
  selectedProductId.value = null
  await fetchProductPerformance()
}

onMounted(() => {
  fetchProductPerformance()
})
</script>
