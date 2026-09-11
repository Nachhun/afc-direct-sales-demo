<template>
  <div class="space-y-6 animate-fade-in">
    <!-- 1. HEADER & FILTER CONTROLS (Matching Product Performance Filter Bar Style) -->
    <div class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Start Date -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-blue-500 shrink-0" />
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">From</span>
          <input 
            type="date" 
            v-model="startDate" 
            @change="fetchStoreSkuData" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" 
          />
        </div>

        <!-- End Date -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-blue-500 shrink-0" />
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">To</span>
          <input 
            type="date" 
            v-model="endDate" 
            @change="fetchStoreSkuData" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 cursor-pointer" 
          />
        </div>

        <!-- Store Filter Dropdown -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 min-w-[200px] max-w-[240px]">
          <Icon name="heroicons:building-storefront" class="w-4 h-4 text-purple-600 shrink-0" />
          <select 
            v-model="selectedStoreId" 
            @change="fetchStoreSkuData" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 w-full cursor-pointer truncate"
          >
            <option :value="null">All Stores ({{ availableStoresForDropdown.length }})</option>
            <option v-for="st in availableStoresForDropdown" :key="st.id" :value="st.id">
              {{ st.shop_name }} ({{ st.customer_id || ('#' + st.id) }})
            </option>
          </select>
        </div>

        <!-- Product SKU Filter Dropdown -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 min-w-[200px] max-w-[240px]">
          <Icon name="heroicons:cube" class="w-4 h-4 text-indigo-500 shrink-0" />
          <select 
            v-model="selectedProductId" 
            @change="fetchStoreSkuData" 
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 w-full cursor-pointer truncate"
          >
            <option :value="null">All Product SKUs</option>
            <option v-for="prod in reportData.all_products" :key="prod.id" :value="prod.id">
              {{ prod.name }}
            </option>
          </select>
        </div>

        <!-- Quick Search input -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 min-w-[170px]">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            v-model="searchQuery" 
            @input="debounceFetch"
            placeholder="Search store, SO#..."
            class="bg-transparent text-slate-900 text-xs font-bold focus:outline-none border-none p-0 w-full"
          />
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="exportStoreSkuExcel"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          title="Export data to styled Excel (.xlsx)"
        >
          <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
          <span>Export Excel</span>
        </button>

        <button 
          @click="resetFilters"
          class="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm cursor-pointer"
          title="Reset Filters"
        >
          <Icon name="heroicons:arrow-path" class="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>

    <!-- Quick Store Selector Horizontal Strip -->
    <div class="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs space-y-2">
      <div class="flex items-center justify-between text-xs font-bold px-1">
        <span class="flex items-center gap-1.5 text-slate-600 font-black uppercase text-[10px] tracking-wider">
          <Icon name="heroicons:cursor-arrow-rays" class="w-3.5 h-3.5 text-indigo-600" />
          Quick Select Store:
        </span>
        <span class="text-[10px] text-slate-400 font-semibold">{{ storesList.length }} {{ selectedProductId ? 'stores with product' : 'stores active' }}</span>
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        <!-- All Stores Pill -->
        <button 
          @click="selectStore(null)"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 shadow-2xs',
            !selectedStoreId 
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          ]"
        >
          <Icon name="heroicons:squares-2x2" class="w-3.5 h-3.5" />
          <span>All Stores</span>
          <span :class="['text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold', !selectedStoreId ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600']">
            {{ flattenedInvoicesList.length }}
          </span>
        </button>

        <!-- Store Pills -->
        <button 
          v-for="st in storesList" 
          :key="st.store_id"
          @click="selectStore(st.store_id)"
          :class="[
            'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 shadow-2xs',
            selectedStoreId === st.store_id 
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
          ]"
        >
          <Icon name="heroicons:building-storefront" class="w-3.5 h-3.5" :class="selectedStoreId === st.store_id ? 'text-white' : 'text-purple-600'" />
          <span class="truncate max-w-[140px]">{{ st.shop_name }}</span>
          <span 
            :class="[
              'text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold',
              selectedStoreId === st.store_id ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
            ]"
          >
            {{ getStoreInvoiceCount(st) }} inv
          </span>
        </button>
      </div>
    </div>

    <!-- Active Store Focus Card (If single store selected) -->
    <div v-if="selectedStoreObj" class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-800/40">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 shrink-0 border border-white/10 shadow-inner">
          <Icon name="heroicons:building-storefront" class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-black text-white tracking-wide">{{ selectedStoreObj.shop_name }}</h3>
            <span class="text-[9.5px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-lg">
              ID: {{ selectedStoreObj.customer_id }}
            </span>
            <span v-if="selectedStoreObj.trade_class" class="text-[9.5px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-lg">
              {{ selectedStoreObj.trade_class }}
            </span>
            <span v-if="selectedStoreObj.province" class="text-[9.5px] font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-lg">
              📍 {{ selectedStoreObj.province }}
            </span>
          </div>
          <p class="text-xs text-indigo-200/80 font-medium mt-1">
            Showing <strong class="text-white">{{ getStoreInvoiceCount(selectedStoreObj) }} {{ getStoreInvoiceCount(selectedStoreObj) === 1 ? 'invoice' : 'invoices' }}</strong> · Sales Rep: {{ selectedStoreObj.salesman }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <div class="bg-white/10 border border-white/10 rounded-xl px-3.5 py-1.5 text-right">
          <p class="text-[8.5px] font-black uppercase text-indigo-200 tracking-wider">
            {{ selectedProductId ? 'Store Product CTN' : 'Store Total CTN' }}
          </p>
          <p class="text-base font-black text-white font-mono">
            {{ Number(selectedStoreProductCartons).toFixed(1) }} <span class="text-[10px] font-normal text-slate-300">CTN</span>
          </p>
        </div>
        <div class="bg-emerald-500/20 border border-emerald-400/30 rounded-xl px-3.5 py-1.5 text-right">
          <p class="text-[8.5px] font-black uppercase text-emerald-300 tracking-wider">
            {{ selectedProductId ? 'Store Product Revenue' : 'Store Revenue' }}
          </p>
          <p class="text-base font-black text-emerald-400 font-mono">
            ${{ Number(selectedStoreProductRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
        </div>
        <button 
          @click="selectStore(null)" 
          class="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          title="Show all stores"
        >
          ✕ Clear
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4 bg-white border border-slate-200 rounded-3xl">
      <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Aggregating Store & SKU Analytics...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- 4 KPI SUMMARY CARDS (Exact match to Product Performance style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Sales Revenue -->
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:banknotes" class="w-14 h-14 text-blue-600" />
          </div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Revenue ($)</p>
          <p class="text-2xl font-black text-slate-900 mt-2">
            ${{ Number(filteredTotalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
          <div class="mt-3 flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase tracking-wider">
            <Icon name="heroicons:chart-bar" class="w-3.5 h-3.5" />
            <span>Across {{ flattenedInvoicesList.length }} Invoices</span>
          </div>
        </div>

        <!-- Card 2: Total Volume (Cartons) -->
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:rectangle-stack" class="w-14 h-14 text-indigo-600" />
          </div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Volume (CTN)</p>
          <p class="text-2xl font-black text-slate-900 mt-2">
            {{ Number(filteredTotalCartons).toLocaleString(undefined, { maximumFractionDigits: 1 }) }} CTN
          </p>
          <div class="mt-3 flex items-center gap-1 text-[10px] text-indigo-600 font-bold uppercase tracking-wider truncate">
            <Icon name="heroicons:cube" class="w-3.5 h-3.5 shrink-0" />
            <span class="truncate">{{ selectedProductObj ? selectedProductObj.name : 'All Product SKUs' }}</span>
          </div>
        </div>

        <!-- Card 3: Top Performing Store -->
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:trophy" class="w-14 h-14 text-amber-500" />
          </div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Top Store Volume</p>
          <p class="text-2xl font-black text-slate-900 mt-2">
            {{ Number(topStoreCartons).toLocaleString(undefined, { maximumFractionDigits: 1 }) }} CTN
          </p>
          <div class="mt-3 flex items-center gap-1.5 text-xs text-amber-700 font-extrabold truncate" :title="topStoreName">
            <Icon name="heroicons:trophy" class="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span class="truncate">{{ topStoreName }}</span>
          </div>
        </div>

        <!-- Card 4: Active Store Count -->
        <div class="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon name="heroicons:building-storefront" class="w-14 h-14 text-emerald-600" />
          </div>
          <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active Stores</p>
          <p class="text-2xl font-black text-slate-900 mt-2">
            {{ storesList.length }} Stores
          </p>
          <div class="mt-3 flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            <Icon name="heroicons:check-badge" class="w-3.5 h-3.5" />
            <span>Stores With Orders</span>
          </div>
        </div>
      </div>

      <!-- MAIN CHARTS ROW (Exact 5-Column Grid Match to Product Performance: Left Bar Chart Col-3, Right Pie/Donut Col-2) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        <!-- CHART 1: Invoices Volume & Revenue Bar Chart (Col-span 3) -->
        <div class="lg:col-span-3 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between h-full">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 class="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Icon name="heroicons:chart-bar-square" class="w-5 h-5 text-blue-600" />
                <span>1. Invoices Breakdown — Volume Bar Chart</span>
              </h3>
              <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                {{ selectedProductObj ? `Volume of ${selectedProductObj.name} per invoice ranked highest to lowest` : 'Invoice volume (CTN) and revenue sorted from highest to lowest' }}
              </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs font-black bg-blue-50 text-blue-700 border border-blue-200/80 px-3 py-1 rounded-xl uppercase tracking-wider shadow-2xs">
                Total: ${{ Number(filteredTotalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              </span>
              <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-xl">
                {{ flattenedInvoicesList.length }} Invoices
              </span>
            </div>
          </div>

          <div v-if="flattenedInvoicesList.length === 0" class="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest space-y-2">
            <Icon name="heroicons:document-magnifying-glass" class="w-10 h-10 mx-auto text-slate-300" />
            <p>No invoices recorded for this period.</p>
          </div>

          <div v-else ref="invoicesListContainer" class="space-y-2.5 max-h-[550px] overflow-y-auto p-1.5 custom-scrollbar flex-1">
            <div 
              v-for="(inv, idx) in flattenedInvoicesList" 
              :key="inv.order_id"
              @mouseenter="activeInvoiceSlice = invoiceDonutSlices.find((s: any) => s.id === inv.order_id) || { id: inv.order_id, so_number: inv.so_number, store_name: inv.store_name, cartons: inv.display_cartons, revenue: inv.display_revenue, percentage: getInvoiceShare(inv.display_cartons), color: getProductColor(idx) }"
              @mouseleave="activeInvoiceSlice = null"
              :class="[
                'p-2.5 rounded-xl transition-all duration-200 group space-y-1.5 border cursor-pointer relative',
                activeInvoiceSlice && activeInvoiceSlice.id === inv.order_id 
                  ? 'bg-blue-50/95 border-blue-500 ring-2 ring-blue-400/80 shadow-md z-10' 
                  : activeInvoiceSlice 
                    ? 'opacity-45 border-slate-200/50 bg-slate-50/40' 
                    : 'bg-slate-50/80 hover:bg-white border-slate-200/70 hover:border-blue-300 shadow-2xs'
              ]"
              @click="toggleInvoiceModal(inv)"
            >
              <div class="flex items-center gap-3">
                <!-- Rank and Store / SO Label -->
                <div class="flex items-center gap-2 min-w-0 w-44 sm:w-56 shrink-0">
                  <span 
                    :class="[
                      'w-4 h-4 rounded text-[9px] font-black flex items-center justify-center shrink-0 transition-transform',
                      activeInvoiceSlice && activeInvoiceSlice.id === inv.order_id ? 'scale-110' : '',
                      idx === 0 ? 'bg-amber-400 text-amber-950 ring-1 ring-amber-300' :
                      idx === 1 ? 'bg-indigo-100 text-indigo-800' :
                      idx === 2 ? 'bg-violet-100 text-violet-800' :
                      'bg-slate-200 text-slate-700'
                    ]"
                  >
                    #{{ Number(idx) + 1 }}
                  </span>

                  <div class="min-w-0 flex-1 truncate">
                    <div class="flex items-center gap-1.5 truncate">
                      <span class="font-black text-xs text-blue-700 font-mono">{{ inv.so_number }}</span>
                      <span class="text-slate-300 text-xs">·</span>
                      <span 
                        :class="[
                          'font-black text-xs truncate transition-colors',
                          activeInvoiceSlice && activeInvoiceSlice.id === inv.order_id ? 'text-blue-700 font-extrabold' : 'text-slate-900 group-hover:text-blue-600'
                        ]"
                        :title="inv.store_name"
                      >
                        {{ inv.store_name }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Horizontal Proportional Bar -->
                <div class="flex-1 bg-slate-200/70 rounded-full h-3 overflow-hidden p-0.5 relative shadow-inner">
                  <div 
                    :class="[
                      'h-full rounded-full transition-all duration-700',
                      activeInvoiceSlice && activeInvoiceSlice.id === inv.order_id
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 saturate-150 brightness-110 shadow-sm'
                        : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 group-hover:brightness-110'
                    ]"
                    :style="{ width: `${maxInvoiceCartons > 0 ? Math.max(6, (inv.display_cartons / maxInvoiceCartons) * 100) : 0}%` }"
                  ></div>
                </div>

                <!-- CTN & Revenue -->
                <div class="flex items-center gap-2 shrink-0 text-right">
                  <span class="text-[10px] font-extrabold text-slate-500 hidden md:inline">
                    {{ Number(inv.display_cartons).toFixed(1) }} CTN
                  </span>
                  <span 
                    :class="[
                      'font-black text-xs sm:text-sm min-w-[75px] transition-colors',
                      activeInvoiceSlice && activeInvoiceSlice.id === inv.order_id ? 'text-blue-700 scale-105' : 'text-slate-900'
                    ]"
                  >
                    ${{ Number(inv.display_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </span>
                </div>
              </div>

              <!-- Bottom Row: Meta and Products Preview -->
              <div class="flex items-center justify-between text-[9px] font-extrabold text-slate-400 px-1 pt-0.5 border-t border-slate-100/60">
                <div class="flex items-center gap-2 truncate">
                  <span class="text-slate-500 font-medium">📅 {{ inv.order_date }} · 👤 {{ inv.salesman_name }}</span>
                  <span class="text-slate-300">|</span>
                  <span class="truncate text-slate-600">
                    <strong class="text-indigo-600">{{ inv.items.length }} {{ inv.items.length === 1 ? 'Item' : 'Items' }}:</strong> {{ inv.items.map((it: any) => `${it.product_name} (${it.qty} ${it.unit})`).join(', ') }}
                  </span>
                </div>
                <span class="text-blue-600 font-extrabold shrink-0 hover:underline flex items-center gap-0.5 ml-2">
                  <span>View</span>
                  <Icon name="heroicons:chevron-right" class="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- CHART 2: Volume & Sales % Contribution — Pie Chart (Col-span 2) -->
        <div class="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 class="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Icon name="heroicons:chart-pie" class="w-5 h-5 text-indigo-600" />
              <span>2. Volume Contribution — Pie Chart</span>
            </h3>
            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Percentage share of invoices in current selection
            </p>
          </div>

          <!-- SVG Donut Chart with Center Text (Matching Product Performance style) -->
          <div class="relative flex items-center justify-center py-4 min-h-[220px]">
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 p-4 transition-all duration-300">
              <template v-if="activeInvoiceSlice">
                <span class="w-2.5 h-2.5 rounded-full mb-1 animate-pulse" :style="{ backgroundColor: activeInvoiceSlice.color }"></span>
                <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[130px]">
                  {{ activeInvoiceSlice.so_number }}
                </span>
                <span class="text-xl font-black text-slate-900 leading-none mt-1" :style="{ color: activeInvoiceSlice.color }">
                  {{ activeInvoiceSlice.percentage }}%
                </span>
                <span class="text-[10px] font-extrabold text-slate-700 mt-1">
                  {{ activeInvoiceSlice.cartons }} CTN
                </span>
                <span class="text-[10px] font-extrabold text-emerald-600 mt-0.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  ${{ Number(activeInvoiceSlice.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
              </template>

              <template v-else>
                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Cartons</span>
                <span class="text-lg font-black text-slate-900 mt-0.5">
                  {{ Number(filteredTotalCartons).toLocaleString(undefined, { maximumFractionDigits: 1 }) }} CTN
                </span>
                <span class="text-[10px] font-black text-emerald-600 mt-0.5">
                  ${{ Number(filteredTotalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </span>
                <span class="text-[9px] font-bold text-slate-400 mt-0.5">
                  {{ flattenedInvoicesList.length }} Invoices
                </span>
              </template>
            </div>

            <!-- Donut SVG -->
            <svg class="w-56 h-56 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#f1f5f9" stroke-width="16" />
              <circle 
                v-for="(slice, sIdx) in invoiceDonutSlices" 
                :key="sIdx"
                cx="60" 
                cy="60" 
                r="45" 
                fill="none" 
                :stroke="slice.color" 
                :stroke-width="activeInvoiceSlice && activeInvoiceSlice.id === slice.id ? 22 : 16" 
                stroke-linecap="butt"
                :stroke-dasharray="`${slice.dashArray}, 282.74`"
                :stroke-dashoffset="slice.dashOffset"
                :class="[
                  'transition-all duration-300 cursor-pointer',
                  activeInvoiceSlice && activeInvoiceSlice.id !== slice.id ? 'opacity-35' : 'opacity-100 drop-shadow-md'
                ]"
                @mouseenter="activeInvoiceSlice = slice"
                @mouseleave="activeInvoiceSlice = null"
              >
              </circle>
            </svg>
          </div>

          <!-- Pie/Donut Legend List -->
          <div class="space-y-1.5 border-t border-slate-100 pt-3 max-h-[220px] overflow-y-auto custom-scrollbar">
            <div 
              v-for="slice in invoiceDonutSlices" 
              :key="slice.id"
              @mouseenter="activeInvoiceSlice = slice"
              @mouseleave="activeInvoiceSlice = null"
              :class="[
                'flex items-center justify-between text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer',
                activeInvoiceSlice && activeInvoiceSlice.id === slice.id ? 'bg-slate-100 border border-indigo-200/80 shadow-xs scale-[1.01]' : 'hover:bg-slate-50 border border-transparent'
              ]"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-3 h-3 rounded-full shrink-0 shadow-2xs" :style="{ backgroundColor: slice.color }"></span>
                <span class="text-slate-700 font-mono font-bold truncate max-w-[100px]" :title="slice.so_number">{{ slice.so_number }}</span>
                <span class="text-[9.5px] text-slate-400 truncate max-w-[90px]">({{ slice.store_name }})</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-slate-900 font-black">{{ slice.percentage }}%</span>
                <span class="bg-slate-100/80 text-slate-500 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  {{ slice.cartons }} CTN
                </span>
                <span class="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  ${{ Number(slice.revenue).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CHART 3: Daily Sales Trend (Matching Product Performance) -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">3. Order Trend — Daily Sales</h3>
            </div>
            <p class="text-slate-400 text-[11px] font-medium mt-0.5 ml-4">
              {{ selectedProductObj ? `Daily sales for ${selectedProductObj.name} (${startDate} to ${endDate})` : `Daily product breakdown (${startDate} to ${endDate})` }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div 
              v-for="(pName, pIdx) in computedTopProductsList" 
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
            <span class="font-black text-slate-900">${{ Number(filteredTotalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
          </div>
        </div>

        <div v-if="!computedDailyTrend?.length" class="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
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
                v-for="(day, dayIdx) in computedDailyTrend" 
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
                    v-for="(pName, pIdx) in computedTopProductsList" 
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
                        :class="Number(dayIdx) > (computedDailyTrend?.length || 0) / 2 ? 'right-0 -translate-x-full' : 'left-full'"
                      >
                        <path 
                          :d="Number(dayIdx) > (computedDailyTrend?.length || 0) / 2
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
                          :cx="Number(dayIdx) > (computedDailyTrend?.length || 0) / 2 ? '200' : '0'" 
                          cy="10" 
                          r="3" 
                          :fill="hoveredSegment.color || '#3b82f6'" 
                        />
                      </svg>

                      <div 
                        :class="[
                          'absolute -top-24 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-xl z-50 whitespace-nowrap animate-fade-in pointer-events-none min-w-[190px] space-y-1.5 text-slate-900',
                          Number(dayIdx) > (computedDailyTrend?.length || 0) / 2 ? 'right-full mr-20' : 'left-full ml-20'
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
              <div v-for="day in computedDailyTrend" :key="day.date" class="flex-1 text-center">
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

      <!-- SECTION 4 / MATRIX SECTION: Product SKU Breakdown across Stores -->
      <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-5">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">4. Store SKU Matrix & Breakdown Table</h3>
            </div>
            <p class="text-slate-400 text-[11px] font-medium mt-0.5 ml-4">
              Detailed SKU volume and purchase metrics for each store ({{ startDate }} to {{ endDate }})
            </p>
          </div>

          <div class="flex items-center gap-3">
            <div class="relative min-w-[220px]">
              <input 
                v-model="tableSearchQuery" 
                type="text" 
                placeholder="Search store, product..." 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <Icon name="heroicons:magnifying-glass" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <button 
              @click="toggleAllStoresAccordion"
              class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {{ areAllStoresExpanded ? 'Collapse All' : 'Expand All' }}
            </button>
          </div>
        </div>

        <!-- Store & SKU Table Accordion -->
        <div class="space-y-3">
          <div v-if="filteredStoreMatrix.length === 0" class="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
            No stores or products match your search.
          </div>

          <div 
            v-for="st in filteredStoreMatrix" 
            :key="'store-' + st.store_id"
            class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all"
          >
            <!-- Store Row Header (Click to Expand / Collapse SKUs) -->
            <div 
              @click="toggleStoreExpansion(st.store_id)"
              class="p-4 bg-slate-50/70 hover:bg-slate-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors select-none"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                  <Icon name="heroicons:building-storefront" class="w-4 h-4" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-black text-sm text-slate-900">{{ st.shop_name }}</span>
                    <span class="text-[9.5px] font-mono font-bold bg-white text-slate-600 border border-slate-200 px-2 py-0.2 rounded-md">
                      {{ st.customer_id || ('#' + st.store_id) }}
                    </span>
                    <span v-if="st.trade_class" class="text-[9.5px] font-bold bg-slate-200/80 text-slate-700 px-2 py-0.2 rounded-md">
                      {{ st.trade_class }}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Sales Rep: {{ st.salesman }} · {{ st.total_invoices_count }} Invoices · {{ st.sku_breakdown.length }} {{ st.sku_breakdown.length === 1 ? 'distinct SKU' : 'distinct SKUs' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-4 shrink-0">
                <div class="text-right">
                  <span class="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Volume</span>
                  <span class="text-xs font-black text-slate-900 font-mono">{{ Number(st.display_cartons ?? st.total_cartons).toFixed(1) }} CTN</span>
                </div>
                <div class="text-right">
                  <span class="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider block">Revenue</span>
                  <span class="text-xs font-black text-emerald-700 font-mono">${{ Number(st.display_revenue ?? st.total_revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                </div>
                <div class="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 transition-transform" :class="expandedStoreIds.includes(st.store_id) ? 'rotate-180 text-indigo-600' : ''">
                  <Icon name="heroicons:chevron-down" class="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <!-- Expanded Store SKU Breakdown Table -->
            <div v-if="expandedStoreIds.includes(st.store_id)" class="border-t border-slate-100 p-3 bg-white animate-fade-in">
              <div class="overflow-x-auto custom-scrollbar">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-wider border-b border-slate-100">
                    <tr>
                      <th class="py-2.5 px-3">Product SKU</th>
                      <th class="py-2.5 px-3">Category</th>
                      <th class="py-2.5 px-3 text-right">Total CTN</th>
                      <th class="py-2.5 px-3 text-right">Paid CTN</th>
                      <th class="py-2.5 px-3 text-right">Promo (FOC)</th>
                      <th class="py-2.5 px-3 text-right">Revenue ($)</th>
                      <th class="py-2.5 px-3 text-right">Store Share</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                    <tr 
                      v-for="sku in st.sku_breakdown" 
                      :key="'sku-' + sku.product_id"
                      :class="selectedProductId && sku.product_id === selectedProductId ? 'bg-indigo-50/70 text-indigo-950 font-black' : 'hover:bg-slate-50/50'"
                    >
                      <td class="py-2.5 px-3">
                        <div class="flex items-center gap-1.5">
                          <span v-if="selectedProductId && sku.product_id === selectedProductId" class="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                          <span class="font-black text-slate-900">{{ sku.product_name }}</span>
                        </div>
                      </td>
                      <td class="py-2.5 px-3 text-slate-500 text-[11px]">{{ sku.category_name || '-' }}</td>
                      <td class="py-2.5 px-3 text-right font-mono font-black text-slate-900">{{ Number(sku.total_qty_cartons).toFixed(1) }} CTN</td>
                      <td class="py-2.5 px-3 text-right font-mono text-slate-600">{{ Number(sku.total_qty_paid_cartons).toFixed(1) }}</td>
                      <td class="py-2.5 px-3 text-right font-mono">
                        <span v-if="sku.total_qty_promo_cartons > 0" class="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded text-[10px]">
                          {{ Number(sku.total_qty_promo_cartons).toFixed(1) }} FOC
                        </span>
                        <span v-else class="text-slate-400">-</span>
                      </td>
                      <td class="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                        ${{ Number(sku.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                      </td>
                      <td class="py-2.5 px-3 text-right">
                        <span class="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-black">
                          {{ sku.store_share_pct }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Items Detail Modal (Matching Product Performance Others Modal style) -->
    <Teleport to="body">
      <div v-if="selectedInvoiceForModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-3xl p-6 sm:p-8 rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden">
          <button 
            @click="selectedInvoiceForModal = null" 
            class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>

          <div class="flex items-center gap-3.5 mb-5">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
              <Icon name="heroicons:document-text" class="w-6 h-6" />
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-xl font-black text-slate-900 tracking-tight">{{ selectedInvoiceForModal.so_number }}</h3>
                <span class="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-blue-200">
                  Invoice Breakdown
                </span>
                <span v-if="selectedProductId && selectedProductObj" class="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider border border-indigo-200 flex items-center gap-1">
                  <Icon name="heroicons:funnel" class="w-3 h-3" />
                  Filtered: {{ selectedProductObj.name }}
                </span>
              </div>
              <p class="text-slate-500 text-xs font-medium mt-0.5">
                {{ selectedInvoiceForModal.store_name }} · {{ selectedInvoiceForModal.order_date }} · Rep: {{ selectedInvoiceForModal.salesman_name }}
              </p>
            </div>
          </div>

          <!-- 3 KPI Cards inside modal -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div class="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                {{ selectedProductId ? 'Filtered Revenue' : 'Grand Total' }}
              </span>
              <span class="text-lg font-black text-emerald-700">${{ Number(selectedInvoiceForModal.display_revenue ?? selectedInvoiceForModal.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
            </div>
            <div class="bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl">
              <span class="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">
                {{ selectedProductId ? 'Filtered Volume' : 'Total Volume' }}
              </span>
              <span class="text-lg font-black text-indigo-900">{{ Number(selectedInvoiceForModal.display_cartons ?? selectedInvoiceForModal.total_cartons).toLocaleString(undefined, { maximumFractionDigits: 1 }) }} CTN</span>
            </div>
            <div class="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Line Items</span>
              <span class="text-lg font-black text-slate-900">{{ selectedInvoiceForModal.items.length }} {{ selectedInvoiceForModal.items.length === 1 ? 'Item' : 'Items' }}</span>
            </div>
          </div>

          <!-- Items Table -->
          <div class="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-wider sticky top-0 border-b border-slate-100 z-10">
                <tr>
                  <th class="py-3 px-4 w-12">#</th>
                  <th class="py-3 px-4">Product Name</th>
                  <th class="py-3 px-4 text-right">Quantity</th>
                  <th class="py-3 px-4 text-right">Cartons</th>
                  <th class="py-3 px-4 text-right">Unit Price</th>
                  <th class="py-3 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                <tr 
                  v-for="(item, idx) in selectedInvoiceForModal.items" 
                  :key="item.id"
                  :class="selectedProductId && item.product_id === selectedProductId ? 'bg-indigo-50/70 font-black text-indigo-950' : 'hover:bg-slate-50/60'"
                >
                  <td class="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{{ Number(idx) + 1 }}</td>
                  <td class="py-3.5 px-4 font-black text-slate-900">
                    <div class="flex items-center gap-2">
                      <span v-if="selectedProductId && item.product_id === selectedProductId" class="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                      <span class="truncate max-w-[280px]">{{ item.product_name }}</span>
                      <span v-if="item.is_promo" class="text-[8.5px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded border border-amber-200">FOC</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right font-mono">{{ item.qty }} {{ item.unit }}</td>
                  <td class="py-3.5 px-4 text-right font-mono text-slate-600">{{ item.carton_qty }} CTN</td>
                  <td class="py-3.5 px-4 text-right font-mono text-slate-600">${{ Number(item.price).toFixed(2) }}</td>
                  <td class="py-3.5 px-4 text-right font-mono font-black text-slate-900">${{ Number(item.subtotal).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button 
              @click="selectedInvoiceForModal = null" 
              class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
                  <td class="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{{ Number(idx) + 1 }}</td>
                  <td class="py-3.5 px-4 font-black text-slate-900">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                      <span class="truncate max-w-[280px]">{{ item.product_name || item.name }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-right font-black text-slate-800">
                    {{ Number(item.total_qty_cartons || item.total_qty || item.qty || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }) }} CTN
                  </td>
                  <td class="py-3.5 px-4 text-right font-black text-emerald-700">
                    ${{ Number(item.total_amount || item.total_revenue || item.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <span v-if="filteredTotalRevenue > 0" class="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[10px] font-black">
                      {{ (((Number(item.total_amount || item.total_revenue || item.revenue || 0)) / filteredTotalRevenue) * 100).toFixed(1) }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button 
              @click="isOthersModalOpen = false" 
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
import { ref, computed, onMounted, watch } from 'vue'
import { exportStyledExcel } from '~/utils/excelExport'

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

const startDate = ref(toLocalDateString(firstDay))
const endDate = ref(toLocalDateString(lastDay))
const selectedStoreId = ref<number | null>(null)
const selectedProductId = ref<number | null>(null)
const searchQuery = ref('')
const tableSearchQuery = ref('')

const loading = ref(false)
const activeInvoiceSlice = ref<any>(null)
const selectedInvoiceForModal = ref<any>(null)
const invoicesListContainer = ref<HTMLElement | null>(null)
const expandedStoreIds = ref<number[]>([])

// Daily trend & hover state
const activeHoverDay = ref<any>(null)
const hoveredSegment = ref<any>(null)

// Others Modal State
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
    othersModalSubTitle.value = `All products in 'Others' category from ${startDate.value} to ${endDate.value}`
    const items = reportData.value?.others_breakdown || []
    othersModalItems.value = items
    othersModalTotalRevenue.value = items.reduce((sum: number, i: any) => sum + (Number(i.total_revenue || i.total_amount) || 0), 0)
    othersModalTotalQty.value = items.reduce((sum: number, i: any) => sum + (Number(i.total_qty || i.total_qty_cartons) || 0), 0)
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

const computedTopProductsList = computed(() => {
  if (selectedProductId.value && selectedProductObj.value) {
    return [selectedProductObj.value.name]
  }
  return reportData.value.top_products_list || []
})

const computedDailyTrend = computed(() => {
  const trend = reportData.value.daily_trend || []
  if (!selectedProductId.value || !selectedProductObj.value) {
    return trend
  }

  const pName = selectedProductObj.value.name
  const targetId = selectedProductId.value

  return trend.map((day: any) => {
    let rev = 0
    let qty = 0

    if (day.products?.[pName]) {
      rev = Number(day.products[pName].revenue || 0)
      qty = Number(day.products[pName].qty || 0)
    } else if (day.products?.Others?.items) {
      const match = day.products.Others.items.find((it: any) => it.product_id === targetId || it.product_name === pName)
      if (match) {
        rev = Number(match.revenue || 0)
        qty = Number(match.qty || 0)
      }
    }

    return {
      date: day.date,
      formatted_date: day.formatted_date,
      total_revenue: rev,
      total_qty: qty,
      products: {
        [pName]: {
          revenue: rev,
          qty: qty
        }
      }
    }
  })
})

const maxDailyRevenue = computed(() => {
  const list = computedDailyTrend.value || []
  if (list.length === 0) return 1
  return Math.max(...list.map((item: any) => Number(item.total_revenue)), 1)
})

const reportData = ref<any>({
  kpis: {},
  all_products: [],
  all_stores: [],
  product_summary: [],
  top_products_list: [],
  daily_trend: [],
  others_breakdown: [],
  stores: []
})

// Exact same palette as Product Performance
const productColors = [
  '#2563eb', // blue-600
  '#4f46e5', // indigo-600
  '#7c3aed', // violet-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#e11d48', // rose-600
  '#0891b2', // cyan-600
  '#475569', // slate-600
  '#65a30d', // lime-600
  '#9333ea', // purple-600
  '#db2777', // pink-600
  '#0284c7', // sky-600
]

function getProductColor(idx: number | string): string {
  const i = typeof idx === 'number' ? idx : (parseInt(String(idx), 10) || 0)
  return productColors[i % productColors.length] ?? '#2563eb'
}

function initDates() {
  startDate.value = toLocalDateString(firstDay)
  endDate.value = toLocalDateString(lastDay)
}

async function fetchStoreSkuData() {
  loading.value = true
  try {
    const params: any = {
      start_date: startDate.value,
      end_date: endDate.value,
    }
    if (selectedStoreId.value) params.store_id = selectedStoreId.value
    if (selectedProductId.value) params.product_id = selectedProductId.value
    if (searchQuery.value) params.search = searchQuery.value

    const res: any = await api.get('/admin/reports/store-sku-performance', { params })
    if (res) {
      reportData.value = res
    }
  } catch (err) {
    console.error('Failed to fetch store SKU performance:', err)
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  initDates()
  selectedStoreId.value = null
  selectedProductId.value = null
  searchQuery.value = ''
  tableSearchQuery.value = ''
  fetchStoreSkuData()
}

let debounceTimer: any = null
function debounceFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchStoreSkuData()
  }, 400)
}

function selectStore(sId: number | null) {
  selectedStoreId.value = sId
  fetchStoreSkuData()
}

const selectedStoreObj = computed(() => {
  if (!selectedStoreId.value) return null
  return (reportData.value.stores || []).find((s: any) => s.store_id === selectedStoreId.value) || null
})

const selectedStoreProductCartons = computed(() => {
  if (!selectedStoreObj.value) return 0
  if (!selectedProductId.value) return selectedStoreObj.value.total_cartons
  const matching = (selectedStoreObj.value.sku_breakdown || []).filter((s: any) => s.product_id === selectedProductId.value)
  return matching.reduce((acc: number, s: any) => acc + Number(s.total_qty_cartons || 0), 0)
})

const selectedStoreProductRevenue = computed(() => {
  if (!selectedStoreObj.value) return 0
  if (!selectedProductId.value) return selectedStoreObj.value.total_revenue
  const matching = (selectedStoreObj.value.sku_breakdown || []).filter((s: any) => s.product_id === selectedProductId.value)
  return matching.reduce((acc: number, s: any) => acc + Number(s.total_amount || 0), 0)
})

function getStoreInvoiceCount(st: any): number {
  if (!st) return 0
  if (!selectedProductId.value) {
    return st.total_invoices_count || (st.invoices || []).length
  }
  const matchingSku = (st.sku_breakdown || []).find((s: any) => s.product_id === selectedProductId.value)
  if (matchingSku && typeof matchingSku.invoice_count === 'number') {
    return matchingSku.invoice_count
  }
  return (st.invoices || []).filter((inv: any) => 
    (inv.items || []).some((it: any) => it.product_id === selectedProductId.value)
  ).length
}

const storesList = computed(() => {
  const all = reportData.value.stores || []
  if (!selectedProductId.value) return all
  return all.filter((st: any) => getStoreInvoiceCount(st) > 0)
})

const availableStoresForDropdown = computed(() => {
  if (!selectedProductId.value) return reportData.value.all_stores || []
  const activeIds = new Set(storesList.value.map((s: any) => s.store_id))
  return (reportData.value.all_stores || []).filter((st: any) => activeIds.has(st.id))
})

const selectedProductObj = computed(() => {
  if (!selectedProductId.value) return null
  return (reportData.value.all_products || []).find((p: any) => p.id === selectedProductId.value) || null
})

// Flatten all invoices from the filtered stores
const flattenedInvoicesList = computed(() => {
  const list: any[] = []
  storesList.value.forEach((st: any) => {
    (st.invoices || []).forEach((inv: any) => {
      let invCartons = inv.total_cartons
      let invRevenue = inv.total_amount
      let displayItems = inv.items || []

      if (selectedProductId.value) {
        const matchingItems = (inv.items || []).filter((it: any) => it.product_id === selectedProductId.value)
        if (matchingItems.length === 0) return
        invCartons = matchingItems.reduce((acc: number, it: any) => acc + Number(it.carton_qty || 0), 0)
        invRevenue = matchingItems.reduce((acc: number, it: any) => acc + Number(it.subtotal || 0), 0)
        displayItems = matchingItems
      }

      list.push({
        ...inv,
        items: displayItems,
        all_items: inv.items || [],
        store_name: st.shop_name,
        customer_id: st.customer_id,
        trade_class: st.trade_class,
        display_cartons: Number(invCartons.toFixed(2)),
        display_revenue: Number(invRevenue.toFixed(2)),
      })
    })
  })

  // Sort by volume descending
  return list.sort((a, b) => b.display_cartons - a.display_cartons)
})

const maxInvoiceCartons = computed(() => {
  if (flattenedInvoicesList.value.length === 0) return 0
  return Math.max(...flattenedInvoicesList.value.map(i => i.display_cartons), 1)
})

const filteredTotalRevenue = computed(() => {
  return flattenedInvoicesList.value.reduce((acc, i) => acc + i.display_revenue, 0)
})

const filteredTotalCartons = computed(() => {
  return flattenedInvoicesList.value.reduce((acc, i) => acc + i.display_cartons, 0)
})

const topStoreCartons = computed(() => {
  if (storesList.value.length === 0) return 0
  return storesList.value[0]?.total_cartons || 0
})

const topStoreName = computed(() => {
  if (storesList.value.length === 0) return 'N/A'
  return storesList.value[0]?.shop_name || 'N/A'
})

function getInvoiceShare(cartons: number): string {
  if (filteredTotalCartons.value <= 0) return '0.0'
  return ((cartons / filteredTotalCartons.value) * 100).toFixed(1)
}

// Compute Donut SVG Slices matching Product Performance
const CIRCUMFERENCE = 2 * Math.PI * 45 // ~282.74
const invoiceDonutSlices = computed(() => {
  const invoices = flattenedInvoicesList.value
  const total = filteredTotalCartons.value
  if (total <= 0 || invoices.length === 0) return []

  const topInvoices = invoices.slice(0, 6)
  const otherInvoices = invoices.slice(6)

  const slices: any[] = []
  let cumulativePct = 0

  topInvoices.forEach((inv, idx) => {
    const pct = (inv.display_cartons / total) * 100
    const dashArray = (pct / 100) * CIRCUMFERENCE
    const dashOffset = -((cumulativePct / 100) * CIRCUMFERENCE)

    slices.push({
      id: inv.order_id,
      so_number: inv.so_number,
      store_name: inv.store_name,
      cartons: inv.display_cartons,
      revenue: inv.display_revenue,
      percentage: Number(pct.toFixed(1)),
      color: productColors[idx % productColors.length],
      dashArray: dashArray.toFixed(2),
      dashOffset: dashOffset.toFixed(2)
    })
    cumulativePct += pct
  })

  if (otherInvoices.length > 0) {
    const otherCartons = otherInvoices.reduce((acc, i) => acc + i.display_cartons, 0)
    const otherRev = otherInvoices.reduce((acc, i) => acc + i.display_revenue, 0)
    const otherPct = (otherCartons / total) * 100
    const dashArray = (otherPct / 100) * CIRCUMFERENCE
    const dashOffset = -((cumulativePct / 100) * CIRCUMFERENCE)

    slices.push({
      id: 999999,
      so_number: `Others (${otherInvoices.length} Inv)`,
      store_name: 'Multiple Stores',
      cartons: Number(otherCartons.toFixed(1)),
      revenue: Number(otherRev.toFixed(2)),
      percentage: Number(otherPct.toFixed(1)),
      color: '#94a3b8',
      dashArray: dashArray.toFixed(2),
      dashOffset: dashOffset.toFixed(2)
    })
  }

  return slices
})

// Auto scroll left bar list when donut slice is active (Exact behavior as Product Performance)
watch(activeInvoiceSlice, (newSlice) => {
  if (newSlice && newSlice.id && invoicesListContainer.value) {
    const list = flattenedInvoicesList.value
    const idx = list.findIndex((item: any) => item.order_id === newSlice.id)
    if (idx !== -1) {
      const container = invoicesListContainer.value
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

// Store & SKU Matrix Table Filtering & Expansion
const filteredStoreMatrix = computed(() => {
  let list = storesList.value

  if (selectedProductId.value) {
    list = list.map((s: any) => {
      const matchingSkus = (s.sku_breakdown || []).filter((sku: any) => sku.product_id === selectedProductId.value)
      const matchingCartons = matchingSkus.reduce((acc: number, sku: any) => acc + Number(sku.total_qty_cartons || 0), 0)
      const matchingRevenue = matchingSkus.reduce((acc: number, sku: any) => acc + Number(sku.total_amount || 0), 0)
      return {
        ...s,
        display_cartons: Number(matchingCartons.toFixed(2)),
        display_revenue: Number(matchingRevenue.toFixed(2)),
        sku_breakdown: matchingSkus,
        skus_count: matchingSkus.length,
      }
    })
  }

  if (tableSearchQuery.value.trim()) {
    const q = tableSearchQuery.value.trim().toLowerCase()
    list = list.filter((s: any) => {
      const matchStore = (s.shop_name || '').toLowerCase().includes(q) || (s.customer_id || '').toLowerCase().includes(q)
      const matchSku = (s.sku_breakdown || []).some((sku: any) => (sku.product_name || '').toLowerCase().includes(q))
      return matchStore || matchSku
    })
  }
  return list
})

const areAllStoresExpanded = computed(() => {
  return filteredStoreMatrix.value.length > 0 && expandedStoreIds.value.length >= filteredStoreMatrix.value.length
})

function toggleStoreExpansion(storeId: number) {
  const idx = expandedStoreIds.value.indexOf(storeId)
  if (idx > -1) {
    expandedStoreIds.value.splice(idx, 1)
  } else {
    expandedStoreIds.value.push(storeId)
  }
}

function toggleAllStoresAccordion() {
  if (areAllStoresExpanded.value) {
    expandedStoreIds.value = []
  } else {
    expandedStoreIds.value = filteredStoreMatrix.value.map((s: any) => s.store_id)
  }
}

function toggleInvoiceModal(inv: any) {
  selectedInvoiceForModal.value = inv
}

async function exportStoreSkuExcel() {
  const invoices = flattenedInvoicesList.value
  if (invoices.length === 0) {
    alert('No invoices to export.')
    return
  }

  const columns = [
    { header: 'SO Number', key: 'so_number', width: 16, isCenter: true },
    { header: 'Store Name', key: 'store_name', width: 28 },
    { header: 'Customer ID', key: 'customer_id', width: 16, isCenter: true },
    { header: 'Order Date', key: 'order_date', width: 16, isDate: true },
    { header: 'Sales Representative', key: 'salesman_name', width: 24 },
    { header: 'Product / SKU Name', key: 'product_name', width: 30 },
    { header: 'Quantity (Units)', key: 'qty', width: 16, isCenter: true },
    { header: 'Unit', key: 'unit', width: 12, isCenter: true },
    { header: 'Cartons (CTN)', key: 'carton_qty', width: 16, isCenter: true },
    { header: 'Unit Price ($)', key: 'price', width: 16, isCurrency: true },
    { header: 'Subtotal ($)', key: 'subtotal', width: 18, isCurrency: true }
  ]

  const data: any[] = []
  invoices.forEach((inv: any) => {
    inv.items.forEach((item: any) => {
      data.push({
        so_number: inv.so_number || 'N/A',
        store_name: inv.store_name || '',
        customer_id: inv.customer_id || '',
        order_date: inv.order_date || '',
        salesman_name: inv.salesman_name || 'Unassigned',
        product_name: item.product_name || '',
        qty: Number(item.qty || 0),
        unit: item.unit || 'pcs',
        carton_qty: Number(item.carton_qty || 0),
        price: Number(item.price || 0),
        subtotal: Number(item.subtotal || 0)
      })
    })
  })

  await exportStyledExcel({
    title: 'AFC Direct Sales — Store SKU & Invoice Items Performance Report',
    subtitle: `Period: ${startDate.value} to ${endDate.value} • Total Line Items: ${data.length}`,
    sheetName: 'Store SKU Report',
    filename: `store_sku_performance_${startDate.value}_to_${endDate.value}`,
    columns,
    data
  })
}

onMounted(() => {
  initDates()
  fetchStoreSkuData()
})
</script>
