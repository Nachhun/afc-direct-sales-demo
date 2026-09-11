<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Top Compact Horizontal Filters Bar -->
    <div class="bg-white border border-slate-200 rounded-2xl px-3 py-2.5 flex flex-wrap items-center gap-2 animate-slide-up shadow-sm">
      <Icon name="heroicons:funnel" class="w-3 h-3 text-slate-400 shrink-0" />
      
      <!-- Start Date -->
      <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm">
        <Icon name="heroicons:calendar" class="w-3 h-3 text-blue-500 shrink-0" />
        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">From</span>
        <input type="date" v-model="deliveryStartDate" @change="fetchDeliveryData" 
          class="bg-transparent text-slate-900 text-[10px] font-bold focus:outline-none border-none p-0 cursor-pointer w-[100px]" />
      </div>

      <!-- End Date -->
      <div class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 shadow-sm">
        <Icon name="heroicons:calendar" class="w-3 h-3 text-blue-500 shrink-0" />
        <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">To</span>
        <input type="date" v-model="deliveryEndDate" @change="fetchDeliveryData" 
          class="bg-transparent text-slate-900 text-[10px] font-bold focus:outline-none border-none p-0 cursor-pointer w-[100px]" />
      </div>

      <!-- Delivery Staff Custom Dropdown -->
      <div class="relative z-50">
        <!-- Backdrop overlay to close when clicking outside -->
        <div v-if="showStaffDropdown" @click="showStaffDropdown = false" class="fixed inset-0 bg-transparent z-40"></div>

        <!-- Dropdown Toggle Button -->
        <button 
          @click="showStaffDropdown = !showStaffDropdown"
          class="relative z-50 flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-sm hover:bg-slate-100 transition-all focus:outline-none"
        >
          <Icon name="heroicons:users" class="w-3 h-3 text-blue-500 shrink-0" />
          <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest hidden sm:inline">Staff:</span>
          <span class="uppercase text-[10px] tracking-wider font-black"
            :class="selectedCouriers.length > 0 ? 'text-blue-600' : 'text-slate-700'"
          >
            {{ selectedCouriers.length === 0 ? 'All Staff' : `${selectedCouriers.length} Selected` }}
          </span>
          <Icon name="heroicons:chevron-down" class="w-3 h-3 text-slate-400 shrink-0 transition-transform duration-200" :class="{ 'rotate-180': showStaffDropdown }" />
        </button>

        <!-- Dropdown List Overlay -->
        <div v-if="showStaffDropdown" 
          class="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 space-y-2 animate-fade-in"
        >
          <div class="flex justify-between items-center pb-1.5 border-b border-slate-100">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Staff</span>
            <button v-if="selectedCouriers.length > 0" @click="clearCourierSelection" class="text-[9px] text-blue-500 font-bold hover:underline">Clear All</button>
          </div>

          <div class="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar">
            <div v-for="c in deliveryKPI.couriers" :key="c.id" 
              @click="toggleCourierSelection(c.id)"
              class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input type="checkbox" :id="'drop-courier-' + c.id"
                :checked="selectedCouriers.includes(c.id)"
                @click.stop
                @change="toggleCourierSelection(c.id)"
                class="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer border-slate-300"
              />
              <span class="text-[11px] font-black text-slate-700 select-none uppercase tracking-wider">
                {{ c.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Button -->
      <button 
        @click="resetDeliveryFilters"
        class="ml-auto flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
      >
        <Icon name="heroicons:arrow-path" class="w-3 h-3" />
        <span class="hidden sm:inline">Reset</span>
      </button>
    </div>

    <!-- Main Content Area (Full Width) -->
    <div v-if="loadingDelivery" class="flex flex-col items-center justify-center py-24 space-y-4 bg-white border border-slate-200 rounded-3xl">
      <div class="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Analyzing Delivery Performance...</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Stats & OTIF Grid (5-column split layout matching Sales Performance tab) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        <!-- OTIF Progress Bars Box -->
        <div class="lg:col-span-3 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="heroicons:clock" class="w-4 h-4 text-blue-500" />
              On-Time In-Full (OTIF)
            </h4>
            <p class="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">OTIF = { On-time: Done within Req Date + 1 Day, Excludes Shop Closed, Cancelled & Issues }</p>
          </div>

          <div class="space-y-2">
            <!-- Bar 1: Total Deliveries -->
            <div @click="openOtifModal('all')" class="space-y-1 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-slate-200">
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-600">
                <span class="group-hover:text-slate-900 flex items-center gap-1">
                  TOTAL DELIVERIES
                  <Icon name="heroicons:arrow-up-right" class="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span class="font-black text-slate-900">{{ deliveryKPI.total_orders }} orders</span>
              </div>
              <div class="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-slate-400 rounded-full" :style="{ width: '100%' }"></div>
              </div>
            </div>

            <!-- Bar 2: Meet OTIF -->
            <div @click="openOtifModal('meet')" class="space-y-1 cursor-pointer group hover:bg-emerald-50/50 p-1.5 rounded-xl transition-all border border-transparent hover:border-emerald-200">
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-600">
                <span class="group-hover:text-emerald-700 flex items-center gap-1">
                  MEET OTIF
                  <Icon name="heroicons:arrow-up-right" class="w-3 h-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span class="font-black text-emerald-600">{{ deliveryKPI.meet_otif }} orders</span>
              </div>
              <div class="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                  :style="{ width: `${deliveryKPI.total_orders > 0 ? (deliveryKPI.meet_otif / deliveryKPI.total_orders) * 100 : 0}%` }"></div>
              </div>
            </div>

            <!-- Bar 3: Failed OTIF -->
            <div @click="openOtifModal('failed')" class="space-y-1 cursor-pointer group hover:bg-red-50/70 p-1.5 rounded-xl transition-all border border-transparent hover:border-red-200">
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-600">
                <span class="group-hover:text-red-700 flex items-center gap-1 font-black text-red-600">
                  FAILED OTIF ⚡
                  <Icon name="heroicons:arrow-up-right" class="w-3 h-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span class="font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">{{ deliveryKPI.failed_otif }} orders</span>
              </div>
              <div class="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all duration-1000"
                  :style="{ width: `${deliveryKPI.total_orders > 0 ? (deliveryKPI.failed_otif / deliveryKPI.total_orders) * 100 : 0}%` }"></div>
              </div>
            </div>

            <!-- Bar 4: Shop Closed (Carried Over) -->
            <div @click="openOtifModal('shop_closed')" class="space-y-1 cursor-pointer group hover:bg-purple-50/70 p-1.5 rounded-xl transition-all border border-transparent hover:border-purple-200">
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-600">
                <span class="group-hover:text-purple-700 flex items-center gap-1 font-black text-purple-600">
                  🏪 SHOP CLOSED (CARRIED OVER)
                  <Icon name="heroicons:arrow-up-right" class="w-3 h-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span class="font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">{{ deliveryKPI.shop_closed_count || 0 }} orders</span>
              </div>
              <div class="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-1000"
                  :style="{ width: `${deliveryKPI.total_orders > 0 ? ((deliveryKPI.shop_closed_count || 0) / deliveryKPI.total_orders) * 100 : 0}%` }"></div>
              </div>
            </div>

            <!-- Bar 5: On Time -->
            <div @click="openOtifModal('all')" class="space-y-1 cursor-pointer group hover:bg-blue-50/50 p-1.5 rounded-xl transition-all border border-transparent hover:border-blue-200">
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-600">
                <span class="group-hover:text-blue-700 flex items-center gap-1">
                  ON TIME (MET)
                  <Icon name="heroicons:arrow-up-right" class="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span class="font-black text-blue-600">{{ deliveryKPI.on_time_count }} orders</span>
              </div>
              <div class="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                  :style="{ width: `${deliveryKPI.total_orders > 0 ? (deliveryKPI.on_time_count / deliveryKPI.total_orders) * 100 : 0}%` }"></div>
              </div>
            </div>

            <!-- Bar 6: In Full -->
            <div @click="openOtifModal('all')" class="space-y-1 cursor-pointer group hover:bg-indigo-50/50 p-1.5 rounded-xl transition-all border border-transparent hover:border-indigo-200">
              <div class="flex justify-between items-center text-[10px] font-bold text-slate-600">
                <span class="group-hover:text-indigo-700 flex items-center gap-1">
                  IN FULL (MET)
                  <Icon name="heroicons:arrow-up-right" class="w-3 h-3 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span class="font-black text-indigo-600">{{ deliveryKPI.in_full_count }} orders</span>
              </div>
              <div class="h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                  :style="{ width: `${deliveryKPI.total_orders > 0 ? (deliveryKPI.in_full_count / deliveryKPI.total_orders) * 100 : 0}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- OTIF Percentage Circular Card -->
        <div class="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[180px]">
          <div>
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block">OTIF Rate</span>
            <span class="text-[8px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full"
              :class="selectedCouriers.length === 0 ? 'text-slate-500 bg-slate-50' : 'text-blue-600 bg-blue-50'"
            >
              {{ selectedCouriers.length === 0 ? 'All Couriers' : `${selectedCouriers.length} Selected` }}
            </span>
          </div>

          <!-- SVG Ring -->
          <div class="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path class="text-slate-100" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path stroke-width="3.2" stroke-linecap="round" stroke="currentColor" fill="none"
                :class="(deliveryKPI.otif_rate ?? 0) >= 80 ? 'text-emerald-500' : (deliveryKPI.otif_rate ?? 0) >= 50 ? 'text-amber-500' : 'text-red-500'"
                class="transition-all duration-1000"
                :stroke-dasharray="`${Math.min(deliveryKPI.otif_rate ?? 0, 100)}, 100`"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div class="absolute flex flex-col items-center justify-center">
              <span class="text-lg font-black leading-none"
                :class="(deliveryKPI.otif_rate ?? 0) >= 80 ? 'text-emerald-600' : (deliveryKPI.otif_rate ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'"
              >{{ deliveryKPI.otif_rate ?? 0 }}%</span>
              <span class="text-[7px] font-black text-slate-400 uppercase tracking-wider mt-0.5">OTIF</span>
            </div>
          </div>

          <!-- Met / Failed / Closed / Issues / Cancelled pill row -->
          <div class="flex items-center gap-1.5 text-[9px] font-bold flex-wrap justify-center">
            <button @click="openOtifModal('meet')" type="button" class="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 px-2 py-0.5 rounded-full transition-colors active:scale-95">
              ✓ {{ deliveryKPI.meet_otif ?? 0 }} Met
            </button>
            <button @click="openOtifModal('failed')" type="button" class="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full font-black transition-colors active:scale-95 shadow-xs">
              ✗ {{ deliveryKPI.failed_otif ?? 0 }} Failed
            </button>
            <button @click="openOtifModal('shop_closed')" type="button" class="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full font-bold transition-colors active:scale-95">
              🏪 {{ deliveryKPI.shop_closed_count ?? 0 }} Closed
            </button>
            <button @click="openOtifModal('issues')" type="button" class="bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full font-bold transition-colors active:scale-95">
              ⚠️ {{ deliveryKPI.with_issue_count ?? (deliveryKPI.deliveries || []).filter((d: any) => d.status === 'delivered_with_issue').length }} Issues
            </button>
            <button @click="openOtifModal('cancelled')" type="button" class="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full font-bold transition-colors active:scale-95">
              🚫 {{ (deliveryKPI.deliveries || []).filter((d: any) => d.is_cancelled || d.status === 'customer_cancelled' || d.status === 'cancelled').length }} Cancelled
            </button>
          </div>
        </div>

      </div>

      <!-- Daily Plan Completion Trend (Vertical Bar Chart) -->
      <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4">
        <div class="flex items-start justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div>
            <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="heroicons:chart-bar" class="w-3.5 h-3.5 text-indigo-500" />
              Daily Plan Completion Trend
            </h4>
            <p class="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Daily target achievement rate per courier</p>
          </div>

          <!-- Legend Indicator -->
          <div class="flex items-center gap-2 flex-wrap">
            <div v-for="c in deliveryKPI.couriers" :key="c.id" 
              v-show="selectedCouriers.length === 0 || selectedCouriers.includes(c.id)"
              class="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-500"
            >
              <span class="w-2 h-2 rounded-full bg-gradient-to-tr shrink-0" :class="getCourierColor(c.id).fill"></span>
              <span>{{ c.name }}</span>
            </div>
          </div>
        </div>

        <!-- Daily Chart Box (Scrollable horizontally if many days) -->
        <div class="overflow-x-auto custom-scrollbar pb-2">
          <div class="min-w-[600px] flex flex-col justify-between relative pt-16 border-b border-slate-100 px-1">
            
            <!-- Shared Height Container for Target Line & Bars -->
            <div class="relative h-44 w-full z-20">
              <!-- 100% Target Reference Line -->
              <div class="absolute left-0 right-0 border-t border-dashed border-red-400 z-10" style="top: 28px;">
                <span class="absolute left-2 -top-2.5 bg-white px-1.5 text-[8px] font-black text-red-500 uppercase tracking-widest">100% Target</span>
              </div>

              <!-- Bars Row Layout -->
              <div class="flex items-end justify-between h-full w-full">
                <div v-for="day in deliveryKPI.daily_trend" :key="day.date" 
                  class="flex flex-col items-center flex-1 min-w-[50px] relative px-1 border-r border-slate-50 last:border-r-0 h-full justify-end"
                >
                  <!-- Grouped Bars side by side -->
                  <div class="flex items-end justify-center gap-1 w-full h-full">
                    <div v-for="cStats in day.couriers" :key="cStats.courier_id"
                      v-show="(selectedCouriers.length === 0 || selectedCouriers.includes(cStats.courier_id)) && cStats.has_work"
                      class="group/bar cursor-pointer flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <!-- Dynamic Height Wrapper -->
                      <div class="relative w-full flex flex-col items-center justify-end"
                        :style="{ height: cStats.has_work ? (cStats.rate >= 100 ? '100%' : `${cStats.rate * 0.84}%`) : '2%' }"
                      >
                        <!-- Bar Value Tooltip on Hover -->
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-black px-2.5 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-all duration-200 shadow-xl text-center z-50 whitespace-nowrap">
                          <p class="text-[10px] font-black text-slate-100 uppercase tracking-wider">{{ cStats.courier_name }}</p>
                          <p class="text-[9px] font-bold mt-0.5 text-slate-300">
                            {{ cStats.completed }}/{{ cStats.total }} ({{ cStats.rate }}%) • 
                            <span :class="[cStats.rate >= 100 ? 'text-emerald-400' : 'text-amber-400']">
                              {{ !cStats.has_work ? 'No Plan ➖' : (cStats.rate >= 100 ? 'Achieved ✅' : 'Not Achieved ❌') }}
                            </span>
                          </p>
                        </div>

                        <!-- The Vertical Bar for this Courier -->
                        <div class="w-2.5 sm:w-3.5 h-full bg-slate-50 border border-slate-100 rounded-t-sm overflow-hidden transition-all duration-500 group-hover/bar:shadow-md flex items-end">
                          <!-- Completion Fill Gradient -->
                          <div v-if="cStats.has_work" 
                            class="w-full bg-gradient-to-t rounded-t-sm transition-all duration-1000"
                            :class="getCourierColor(cStats.courier_id).fill"
                            :style="{ height: '100%' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Labels Row below bars -->
            <div class="flex justify-between w-full mt-1.5 pt-1 border-t border-slate-100 z-10">
              <div v-for="day in deliveryKPI.daily_trend" :key="day.date" class="flex-1 min-w-[40px] text-center">
                <span class="text-[7px] font-black text-slate-400 uppercase tracking-widest block truncate w-full">
                  {{ day.formatted_date }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Staff comparison chart -->
      <div class="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4">
        <div>
          <h4 class="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="heroicons:truck" class="w-3.5 h-3.5 text-indigo-500" />
            Delivery Staff Performance
          </h4>
          <p class="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Plan completion % based on assigned deliveries</p>
        </div>

        <!-- Bar list -->
        <div class="space-y-3">
          <div v-for="staff in deliveryKPI.staff_performance" :key="staff.id"
            v-show="selectedCouriers.length === 0 || selectedCouriers.includes(staff.id)"
            class="space-y-1">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <span class="font-bold text-slate-700 text-xs truncate">{{ staff.name }}</span>
                <span class="text-[9px] font-bold text-slate-400 shrink-0">{{ staff.completed }}/{{ staff.total }}</span>
              </div>
              <span class="font-black text-slate-900 text-xs shrink-0 ml-2"
                :class="staff.rate >= 100 ? 'text-emerald-600' : staff.rate >= 50 ? 'text-amber-600' : 'text-red-600'"
              >{{ staff.rate }}%</span>
            </div>
            
            <div class="relative h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
              <div class="absolute right-0 top-0 bottom-0 w-px bg-slate-300 z-10" title="100% Target"></div>
              <!-- Progress Fill with dynamic color -->
              <div class="h-full rounded-full transition-all duration-1000"
                :class="staff.rate >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : staff.rate >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-red-400 to-rose-500'"
                :style="{ width: `${Math.min(staff.rate, 100)}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- OTIF Delivery Breakdown Table -->
      <div class="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 animate-slide-up">
        <div>
          <h4 class="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
            <Icon name="heroicons:list-bullet" class="w-5 h-5 text-blue-600" />
            OTIF Delivery Breakdown
          </h4>
          <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">View and audit individual deliveries, on-time status, and issues</p>
        </div>

        <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID / SO</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Store / Shop</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Courier</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">On Time</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">In Full</th>
                  <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="d in deliveryKPI.deliveries" :key="d.id" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <span class="block text-slate-900 font-bold text-xs">#{{ d.order_id }}</span>
                    <span class="block text-[10px] text-slate-500 font-medium mt-0.5">{{ d.so_number || 'N/A' }}</span>
                    <span v-if="d.order_date_short" class="block text-[9px] text-indigo-600 font-bold mt-0.5">📅 {{ d.order_date_short }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-slate-900 font-bold text-xs truncate max-w-[150px] block" :title="d.shop_name">{{ d.shop_name }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-slate-700 text-xs font-semibold">{{ d.courier_name }}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span :class="statusClass(d.status)" class="inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border">
                      {{ d.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span v-if="d.is_on_time" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100" title="Delivered on or before deadline">
                      <Icon name="heroicons:check" class="w-3.5 h-3.5" />
                    </span>
                    <span v-else-if="['delivered', 'delivered_with_issue'].includes(d.status)" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 border border-red-100" title="Delivered late">
                      <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                    </span>
                    <span v-else class="text-slate-300 font-bold text-[10px] uppercase">Pending</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span v-if="d.is_in_full" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100" title="No shortage or loss">
                      <Icon name="heroicons:check" class="w-3.5 h-3.5" />
                    </span>
                    <span v-else-if="['delivered', 'delivered_with_issue'].includes(d.status)" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-50 text-red-600 border border-red-100" title="Has quantity shortage or issues">
                      <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                    </span>
                    <span v-else class="text-slate-300 font-bold text-[10px] uppercase">Pending</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <NuxtLink :to="`/admin/orders/${d.order_id}`" class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                      <Icon name="heroicons:eye" class="w-3.5 h-3.5" />
                      View
                    </NuxtLink>
                  </td>
                </tr>
                <tr v-if="!deliveryKPI.deliveries || deliveryKPI.deliveries.length === 0">
                  <td colspan="7" class="px-6 py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                    No deliveries found in this period
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- OTIF Drilldown Modal Teleported -->
    <Teleport to="body">
      <div v-if="otifModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-5xl p-6 sm:p-8 rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
          <button @click="otifModalOpen = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>

          <!-- Header -->
          <div class="flex items-center gap-3.5 mb-4">
            <div class="w-11 h-11 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-100 shadow-sm">
              <Icon name="heroicons:truck" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-900 tracking-tight">OTIF & Delivery Performance Drilldown</h3>
              <p class="text-slate-500 text-xs font-medium">
                Showing delivery orders for period <strong class="text-slate-700">{{ deliveryStartDate }}</strong> to <strong class="text-slate-700">{{ deliveryEndDate }}</strong>
              </p>
            </div>
          </div>

          <!-- Quick Filter Tabs & Search Bar -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 mb-4">
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button 
                @click="otifFilterType = 'failed'" 
                :class="otifFilterType === 'failed' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'"
                class="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>🔴 Failed OTIF</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="otifFilterType === 'failed' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'">
                  {{ (deliveryKPI.deliveries || []).filter((d: any) => d.is_failed_otif).length }}
                </span>
              </button>

              <button 
                @click="otifFilterType = 'shop_closed'" 
                :class="otifFilterType === 'shop_closed' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'"
                class="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>🏪 Shop Closed</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="otifFilterType === 'shop_closed' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'">
                  {{ (deliveryKPI.deliveries || []).filter((d: any) => d.is_shop_closed || d.status === 'shop_closed').length }}
                </span>
              </button>

              <button 
                @click="otifFilterType = 'issues'" 
                :class="otifFilterType === 'issues' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'"
                class="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>⚠️ Order Issues</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="otifFilterType === 'issues' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'">
                  {{ (deliveryKPI.deliveries || []).filter((d: any) => d.status === 'delivered_with_issue' || d.is_with_issue).length }}
                </span>
              </button>

              <button 
                @click="otifFilterType = 'cancelled'" 
                :class="otifFilterType === 'cancelled' ? 'bg-rose-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'"
                class="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>🚫 Cancelled</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="otifFilterType === 'cancelled' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'">
                  {{ (deliveryKPI.deliveries || []).filter((d: any) => d.is_cancelled || d.status === 'customer_cancelled' || d.status === 'cancelled').length }}
                </span>
              </button>

              <button 
                @click="otifFilterType = 'meet'" 
                :class="otifFilterType === 'meet' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'"
                class="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>🟢 Meet OTIF</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="otifFilterType === 'meet' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'">
                  {{ (deliveryKPI.deliveries || []).filter((d: any) => d.is_meet_otif).length }}
                </span>
              </button>

              <button 
                @click="otifFilterType = 'all'" 
                :class="otifFilterType === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'"
                class="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5"
              >
                <span>📦 All Deliveries</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold" :class="otifFilterType === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
                  {{ (deliveryKPI.deliveries || []).length }}
                </span>
              </button>
            </div>

            <!-- Search box -->
            <div class="relative min-w-[200px]">
              <input 
                v-model="otifSearchQuery" 
                placeholder="Search shop, SO#, DEL#..." 
                class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold pl-9 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
              <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <!-- Modal Body (Orders List) -->
          <div class="flex-1 overflow-y-auto pr-1 space-y-3">
            <div v-if="filteredOtifDeliveries.length === 0" class="text-center py-16 text-slate-400">
              <Icon name="heroicons:document-magnifying-glass" class="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p class="text-xs font-bold uppercase tracking-widest">No matching orders found</p>
            </div>

            <div v-else class="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
              <div v-for="d in filteredOtifDeliveries" :key="d.id" class="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-black text-slate-900 uppercase tracking-wide">{{ d.shop_name }}</span>
                    
                    <span class="text-[9px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">
                      DEL: {{ d.delivery_number || 'N/A' }}
                    </span>

                    <span v-if="d.so_number" class="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      SO# {{ d.so_number }}
                    </span>

                    <span v-if="d.order_date" class="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Icon name="heroicons:calendar" class="w-3 h-3 text-indigo-500" />
                      Order: {{ d.order_date }}
                    </span>
                  </div>

                  <p class="text-slate-500 text-[11px] font-medium flex items-center gap-2 flex-wrap">
                    <span>🚚 Courier: <strong class="text-slate-800">{{ d.courier_name }}</strong></span>
                    <span>•</span>
                    <span v-if="d.request_delivery_date">📅 Req Date: <strong class="text-blue-700">{{ d.request_delivery_date }}</strong></span>
                    <span v-else>⏰ Deadline: <strong class="text-slate-800">{{ d.deadline_at || 'N/A' }}</strong></span>
                    <span v-if="d.completed_at">• Done: <strong class="text-slate-800">{{ d.completed_at }}</strong></span>
                  </p>

                  <!-- Failure / Issue Reason / Detailed Status -->
                  <div class="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span v-if="d.is_shop_closed" class="text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      🏪 Shop Closed (Carried over to next day)
                    </span>
                    <span v-else-if="d.status === 'delivered_with_issue'" class="text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      ⚠️ Delivery Issue / Discrepancy
                    </span>
                    <span v-else-if="d.is_late" class="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      {{ d.fail_reason_text || '⏰ Delivered Late' }}
                    </span>
                    <span v-else-if="d.is_overdue" class="text-[10px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      {{ d.fail_reason_text || '⏳ Overdue / Delayed' }}
                    </span>
                    <span v-else-if="d.status === 'customer_cancelled'" class="text-[10px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      🚫 Customer Cancelled
                    </span>
                    <span v-else-if="d.is_meet_otif" class="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      ✅ Delivered On Time & In Full
                    </span>
                    <span v-else class="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      {{ d.fail_reason_text || '🚚 In Progress / Scheduled' }}
                    </span>

                    <!-- Delivery Issue Note Quote (only for delivered_with_issue or customer_cancelled) -->
                    <span v-if="d.delivery_note && (d.status === 'delivered_with_issue' || d.status === 'customer_cancelled')" class="text-[10px] font-bold text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/60 italic">
                      "{{ d.delivery_note }}"
                    </span>

                    <!-- Salesman / Order remarks (if present) -->
                    <span v-else-if="d.order_note" class="text-[9px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      Note: {{ d.order_note }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
                  <div class="text-left sm:text-right">
                    <span class="text-xs font-black text-slate-900 block">${{ Number(d.grand_total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
                    <span 
                      v-if="d.is_meet_otif"
                      class="text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest inline-block mt-0.5 text-emerald-600 bg-emerald-50 border-emerald-100"
                    >
                      MEET OTIF
                    </span>
                    <span 
                      v-else-if="d.is_shop_closed || d.status === 'shop_closed'"
                      class="text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest inline-block mt-0.5 text-purple-700 bg-purple-50 border-purple-200"
                    >
                      SHOP CLOSED
                    </span>
                    <span 
                      v-else-if="d.is_cancelled || d.status === 'customer_cancelled' || d.status === 'cancelled'"
                      class="text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest inline-block mt-0.5 text-rose-700 bg-rose-50 border-rose-200"
                    >
                      CANCELLED
                    </span>
                    <span 
                      v-else-if="d.is_with_issue || d.status === 'delivered_with_issue'"
                      class="text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest inline-block mt-0.5 text-amber-800 bg-amber-50 border-amber-200"
                    >
                      WITH ISSUE
                    </span>
                    <span 
                      v-else-if="d.is_failed_otif"
                      class="text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest inline-block mt-0.5 text-red-600 bg-red-50 border-red-100"
                    >
                      FAILED OTIF
                    </span>
                    <span 
                      v-else
                      class="text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest inline-block mt-0.5 text-blue-600 bg-blue-50 border-blue-100"
                    >
                      IN PROGRESS
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <button 
                      @click="openInvoice(d)" 
                      class="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                      title="Open Invoice"
                    >
                      <Icon name="heroicons:document-text" class="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>

                    <button 
                      @click="openOrderDetail(d)" 
                      class="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                      title="View Order & Delivery Details"
                    >
                      <Icon name="heroicons:eye" class="w-3.5 h-3.5 text-slate-500" />
                      <span>Detail</span>
                    </button>
                  </div>
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
import { ref, computed, onMounted } from 'vue'
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

interface CourierColor {
  border: string
  bg: string
  text: string
  fill: string
}

const courierColorSets: CourierColor[] = [
  { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-600', fill: 'from-blue-500 to-indigo-600' },
  { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', fill: 'from-emerald-500 to-teal-600' },
  { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-600', fill: 'from-amber-500 to-orange-600' },
  { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-600', fill: 'from-purple-500 to-fuchsia-600' },
  { border: 'border-rose-200', bg: 'bg-rose-50', text: 'text-rose-600', fill: 'from-rose-500 to-pink-600' },
  { border: 'border-cyan-200', bg: 'bg-cyan-50', text: 'text-cyan-600', fill: 'from-cyan-500 to-blue-600' },
]

function getCourierColor(id: number): CourierColor {
  const index = id % courierColorSets.length
  return courierColorSets[index] ?? courierColorSets[0]!
}

// Tab 3: Delivery Performance State
const loadingDelivery = ref(false)
const deliveryStartDate = ref(toLocalDateString(firstDay))
const deliveryEndDate = ref(toLocalDateString(lastDay))
const selectedCouriers = ref<number[]>([])
const showStaffDropdown = ref(false)
const deliveryKPI = ref<any>({
  total_orders: 0,
  meet_otif: 0,
  failed_otif: 0,
  shop_closed_count: 0,
  customer_cancelled_count: 0,
  otif_rate: 100.0,
  on_time_count: 0,
  in_full_count: 0,
  staff_performance: [],
  daily_trend: [],
  couriers: [],
  deliveries: []
})

const otifModalOpen = ref(false)
const otifFilterType = ref<'all' | 'failed' | 'meet' | 'issues' | 'shop_closed' | 'cancelled'>('failed')
const otifSearchQuery = ref('')

function openOtifModal(filterType: 'all' | 'failed' | 'meet' | 'issues' | 'shop_closed' | 'cancelled' = 'failed') {
  otifFilterType.value = filterType
  otifSearchQuery.value = ''
  otifModalOpen.value = true
}

const filteredOtifDeliveries = computed(() => {
  if (!deliveryKPI.value || !deliveryKPI.value.deliveries) return []
  
  let list = deliveryKPI.value.deliveries
  
  if (otifFilterType.value === 'failed') {
    list = list.filter((d: any) => d.is_failed_otif)
  } else if (otifFilterType.value === 'shop_closed') {
    list = list.filter((d: any) => d.is_shop_closed || d.status === 'shop_closed')
  } else if (otifFilterType.value === 'cancelled') {
    list = list.filter((d: any) => d.is_cancelled || d.status === 'customer_cancelled' || d.status === 'cancelled')
  } else if (otifFilterType.value === 'meet') {
    list = list.filter((d: any) => d.is_meet_otif)
  } else if (otifFilterType.value === 'issues') {
    list = list.filter((d: any) => d.status === 'delivered_with_issue' || d.is_with_issue)
  }
  
  if (otifSearchQuery.value.trim()) {
    const q = otifSearchQuery.value.trim().toLowerCase()
    list = list.filter((d: any) => 
      (d.shop_name && d.shop_name.toLowerCase().includes(q)) ||
      (d.so_number && d.so_number.toLowerCase().includes(q)) ||
      (d.delivery_number && d.delivery_number.toLowerCase().includes(q)) ||
      (d.courier_name && d.courier_name.toLowerCase().includes(q)) ||
      (d.reason && d.reason.toLowerCase().includes(q)) ||
      (d.fail_reason_text && d.fail_reason_text.toLowerCase().includes(q))
    )
  }
  
  return list
})

function openInvoice(d: any) {
  if (d.invoice_url) {
    window.open(d.invoice_url, '_blank')
  } else if (d.order_id) {
    navigateTo(`/admin/orders/${d.order_id}`)
  }
}

function openOrderDetail(d: any) {
  if (d.order_id) {
    navigateTo(`/admin/orders/${d.order_id}`)
  }
}

// Fetch Logic
async function fetchDeliveryData() {
  loadingDelivery.value = true
  try {
    const params: any = {
      start_date: deliveryStartDate.value,
      end_date: deliveryEndDate.value
    }
    if (selectedCouriers.value.length > 0) {
      params.courier_ids = selectedCouriers.value.join(',')
    }
    const res = await api.get('/admin/reports/delivery-performance', { params }) as any
    deliveryKPI.value = res
  } catch (error) {
    console.error('Failed to load delivery performance:', error)
  } finally {
    loadingDelivery.value = false
  }
}

function toggleCourierSelection(courierId: number) {
  const index = selectedCouriers.value.indexOf(courierId)
  if (index > -1) {
    selectedCouriers.value.splice(index, 1)
  } else {
    selectedCouriers.value.push(courierId)
  }
  fetchDeliveryData()
}

function clearCourierSelection() {
  selectedCouriers.value = []
  fetchDeliveryData()
}

async function resetDeliveryFilters() {
  deliveryStartDate.value = toLocalDateString(firstDay)
  deliveryEndDate.value = toLocalDateString(lastDay)
  selectedCouriers.value = []
  await fetchDeliveryData()
}

onMounted(() => {
  fetchDeliveryData()
})

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'completed': return 'text-emerald-700 bg-emerald-50 border-emerald-200'
    case 'shop_closed': return 'text-purple-700 bg-purple-50 border-purple-200'
    case 'delivered_with_issue': return 'text-orange-700 bg-orange-50 border-orange-200'
    case 'in_transit': return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200'
    case 'customer_cancelled': return 'text-slate-700 bg-slate-100 border-slate-200'
    case 'cancelled': return 'text-red-700 bg-red-50 border-red-200'
    default: return 'text-slate-600 bg-slate-50 border-slate-200'
  }
}
</script>
