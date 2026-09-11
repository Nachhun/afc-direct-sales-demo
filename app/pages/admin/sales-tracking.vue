<template>
  <div class="h-[calc(100vh-20px)] flex flex-col pb-2 gap-2">
    <!-- Header Controls -->
    <div class="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
          <Icon name="heroicons:map" class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-800 leading-none">Sales Agent Tracking</h1>
          <p class="text-[9px] font-black uppercase text-slate-400 tracking-wider mt-1">Real-time Location & Sales Activity</p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Dashboard Toggle Button -->
        <button
          @click="openAnalyticsDrawer"
          class="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <Icon name="heroicons:chart-bar" class="w-3.5 h-3.5 text-slate-500" />
          Analytics
        </button>

        <!-- Heatmap Toggle Button -->
        <button
          @click="toggleHeatmap"
          :class="showHeatmap ? 'bg-amber-500 text-white border-amber-500 shadow-amber-200' : 'bg-slate-50 border border-slate-200 text-slate-700'"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
        >
          <Icon name="heroicons:fire" class="w-3.5 h-3.5" :class="showHeatmap ? 'text-white' : 'text-slate-500'" />
          Heatmap
        </button>

        <!-- Satellite Toggle Button -->
        <button
          @click="toggleSatellite"
          :class="showSatellite ? 'bg-sky-600 text-white border-sky-600 shadow-sky-200' : 'bg-slate-50 border border-slate-200 text-slate-700'"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
        >
          <Icon name="heroicons:globe-europe-africa" class="w-3.5 h-3.5" :class="showSatellite ? 'text-white' : 'text-slate-500'" />
          Satellite
        </button>

        <!-- Geofence Toggle Button -->
        <button
          @click="showGeofenceForm = !showGeofenceForm"
          :class="showGeofenceForm ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' : 'bg-slate-50 border border-slate-200 text-slate-700'"
          class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
        >
          <Icon name="heroicons:globe-alt" class="w-3.5 h-3.5" :class="showGeofenceForm ? 'text-white' : 'text-slate-500'" />
          Add Geofence
        </button>

        <!-- Manage KPI Sales Button -->
        <NuxtLink
          to="/admin/kpi-sales"
          class="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
        >
          <Icon name="heroicons:currency-dollar" class="w-3.5 h-3.5 text-emerald-600" />
          KPI Sales CRUD
        </NuxtLink>

        <!-- Sync Button -->
        <button
          @click="fetchAgentsData"
          class="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          Sync
        </button>
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="flex-1 relative min-h-0">

      <!-- Full-Width Map Container -->
      <div class="absolute inset-0 rounded-3xl overflow-hidden border border-slate-200 shadow-sm z-0">
        <div id="sales-tracking-map" class="absolute inset-0"></div>

        <!-- Active Trail Indicator -->
        <div v-if="activeTrail" class="absolute bottom-6 left-6 z-[1000]">
          <div class="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
            <Icon name="heroicons:sparkles" class="text-blue-400 w-4 h-4" />
            <span class="text-[10px] font-black uppercase tracking-widest">Active Trail: {{ selectedAgent?.name }}</span>
            <button
              @click="clearActiveTrail"
              class="text-[9px] font-black uppercase text-red-400 hover:text-red-300 border-l border-white/10 pl-3 ml-1"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Active Daily Route & Stops Overlay Indicator -->
        <div v-if="activeDailyRouteRep" class="absolute bottom-6 left-6 z-[1000] flex flex-col gap-2">
          <div class="bg-indigo-950 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-500/30 backdrop-blur-md">
            <Icon name="heroicons:map-pin" class="text-indigo-400 w-4 h-4" />
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest block">{{ activeDailyRouteRep.name }} · {{ activeDailyRouteRep.total_stops_count }} Stops</span>
              <span class="text-[9px] text-indigo-300 font-bold">Move: {{ activeDailyRouteRep.moving_duration_formatted }} ({{ activeDailyRouteRep.total_distance_km }}km) · Stop: {{ activeDailyRouteRep.stopped_duration_formatted }}</span>
            </div>
            <button
              @click="clearDailyStopsAndRoute"
              class="text-[9px] font-black uppercase text-red-400 hover:text-red-300 border-l border-white/10 pl-3 ml-1"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Float Info Panel (Real-Time notification logger) -->
        <div class="absolute bottom-6 right-6 z-[1000] w-72 pointer-events-none hidden sm:block">
          <div class="flex flex-col gap-2">
            <div
              v-for="log in notificationLogs.slice(-3)"
              :key="log.id"
              class="bg-slate-900/90 backdrop-blur-md text-white border border-white/15 px-4 py-3 rounded-2xl shadow-xl flex items-start gap-3 animate-slide-up pointer-events-auto"
            >
              <div class="p-1 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
                <Icon name="heroicons:bell" class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[8px] font-black text-amber-400 uppercase tracking-widest">Notification</p>
                <p class="text-[10px] font-bold mt-0.5 leading-snug">{{ log.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== FLOATING AGENT PANEL ===== -->
        <div class="absolute top-4 left-4 z-[1000]">

          <!-- Pill Toggle Button -->
          <button
            @click="agentPanelOpen = !agentPanelOpen"
            class="flex items-center gap-2 bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 px-3.5 py-2 rounded-2xl transition-all duration-200 hover:shadow-2xl hover:border-slate-300 group"
          >
            <!-- Online pulse indicator -->
            <div class="relative shrink-0">
              <div class="w-2.5 h-2.5 rounded-full" :class="agents.filter(a => a.is_online).length > 0 ? 'bg-emerald-500' : 'bg-slate-300'"></div>
              <div v-if="agents.filter(a => a.is_online).length > 0" class="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-700">
              Agents
              <span class="ml-1 text-emerald-600">{{ agents.filter(a => a.is_online).length }}</span>
              <span class="text-slate-400">/{{ agents.length }}</span>
            </span>
            <Icon
              name="heroicons:chevron-down"
              class="w-3.5 h-3.5 text-slate-400 transition-transform duration-300"
              :class="agentPanelOpen ? 'rotate-180' : ''"
            />
          </button>

          <!-- Dropdown Panel -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 -translate-y-2 scale-95"
          >
            <div
              v-if="agentPanelOpen"
              class="mt-2 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
            >
              <!-- Panel Header -->
              <div class="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-slate-600">Sales Agents</p>
                  <p class="text-[9px] text-slate-400 mt-0.5">
                    <span class="text-emerald-600 font-black">{{ agents.filter(a => a.is_online).length }} online</span>
                    · {{ agents.filter(a => !a.is_online).length }} offline
                  </p>
                </div>
                <button @click="agentPanelOpen = false" class="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                  <Icon name="heroicons:x-mark" class="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <!-- Agent List (scrollable) -->
              <div class="max-h-80 overflow-y-auto minimal-scrollbar divide-y divide-slate-50">
                <div
                  v-for="agent in agents"
                  :key="agent.id"
                  @click="focusAgent(agent); agentPanelOpen = false"
                  :class="selectedAgent?.id === agent.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-50'"
                  class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all group relative"
                >
                  <!-- Avatar Circle -->
                  <div
                    class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-[11px] relative"
                    :class="selectedAgent?.id === agent.id
                      ? (agent.is_online ? 'bg-emerald-400 text-emerald-900' : 'bg-slate-600 text-slate-300')
                      : (agent.is_online ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')"
                  >
                    {{ agent.name.charAt(0).toUpperCase() }}
                    <!-- Online dot -->
                    <span
                      v-if="agent.is_online"
                      class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"
                    ></span>
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-black uppercase tracking-wide truncate" :class="selectedAgent?.id === agent.id ? 'text-white' : 'text-slate-800'">
                      {{ agent.name }}
                    </p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-[8px] font-bold uppercase tracking-wider" :class="selectedAgent?.id === agent.id ? 'text-slate-300' : 'text-slate-400'">
                        {{ agent.role }}
                      </span>
                      <span v-if="agent.is_online" class="text-[8px] font-black text-emerald-500 uppercase flex items-center gap-1">
                        ● Live
                        <span 
                          v-if="agent.location_source" 
                          :class="agent.location_source === 'telegram' 
                            ? 'text-sky-400 bg-sky-500/10 border-sky-400/20' 
                            : 'text-blue-400 bg-blue-500/10 border-blue-400/20'" 
                          class="px-1 py-0.5 rounded-[4px] border text-[7px] font-extrabold uppercase leading-none"
                        >
                          {{ agent.location_source === 'telegram' ? 'Telegram' : 'Mini App' }}
                        </span>
                      </span>
                      <span v-else-if="agent.last_seen_at" class="text-[8px] text-slate-400">{{ formatLastSeen(agent.last_seen_at) }}</span>
                    </div>
                  </div>

                  <!-- Focus icon -->
                  <Icon
                    name="heroicons:map-pin"
                    class="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    :class="selectedAgent?.id === agent.id ? 'text-slate-300' : 'text-slate-400'"
                  />

                  <!-- Export Button -->
                  <button
                    @click.stop="openExportModal(agent)"
                    class="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    :class="selectedAgent?.id === agent.id ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-400'"
                    title="Export history"
                  >
                    <Icon name="heroicons:arrow-down-tray" class="w-3 h-3" />
                  </button>
                </div>

                <div v-if="agents.length === 0" class="px-4 py-8 text-center">
                  <Icon name="heroicons:users" class="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p class="text-[10px] text-slate-400 font-bold">No agents found</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        <!-- ===== END FLOATING AGENT PANEL ===== -->

      </div>
    </div>

    <!-- Analytics Stats Drawer -->
    <div
      v-if="showStatsDrawer"
      class="fixed inset-0 z-[1200] flex justify-end bg-slate-900/15 transition-all duration-300"
      @click.self="showStatsDrawer = false"
    >
      <div class="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col p-5 sm:p-6 overflow-y-auto animate-slide-left">
        <!-- Drawer Header -->
        <div class="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Icon name="heroicons:chart-bar-square" class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 uppercase tracking-wider leading-none">Activity Analytics</h3>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Work Time · Live Duration · Stop Action</p>
            </div>
          </div>
          <button @click="showStatsDrawer = false" class="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex border-b border-slate-200 mb-5 gap-2">
          <button
            @click="analyticsTab = 'rep_activity'"
            :class="analyticsTab === 'rep_activity' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-400 hover:text-slate-700 font-bold'"
            class="pb-2.5 px-3 text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5"
          >
            <Icon name="heroicons:user-group" class="w-4 h-4" />
            <span>Rep Work & Stops</span>
            <span v-if="repActivityData.summary?.active_reps" class="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[9px] font-black">
              {{ repActivityData.summary.active_reps }}
            </span>
          </button>
          <button
            @click="analyticsTab = 'macro_trends'"
            :class="analyticsTab === 'macro_trends' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-400 hover:text-slate-700 font-bold'"
            class="pb-2.5 px-3 text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5"
          >
            <Icon name="heroicons:presentation-chart-line" class="w-4 h-4" />
            <span>30-Day Trends</span>
          </button>
        </div>

        <!-- TAB 1: REP WORK & STOP ACTION -->
        <div v-if="analyticsTab === 'rep_activity'" class="flex-1 flex flex-col space-y-5">
          <!-- Date Filter Toolbar -->
          <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Date:</span>
              <input
                type="date"
                v-model="activityDate"
                @change="fetchRepActivity"
                class="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
            </div>

            <div class="flex items-center gap-1.5">
              <button
                @click="setActivityDateQuick('today')"
                :class="isActivityDateToday ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'"
                class="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
              >
                Today
              </button>
              <button
                @click="setActivityDateQuick('yesterday')"
                class="px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all"
              >
                Yesterday
              </button>
              <button
                @click="fetchRepActivity"
                class="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all"
                title="Refresh Rep Activity"
              >
                <Icon name="heroicons:arrow-path" class="w-4 h-4" :class="{ 'animate-spin': loadingActivity }" />
              </button>
            </div>
          </div>

          <!-- Overview Summary Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="bg-indigo-50/60 border border-indigo-100 p-3 rounded-2xl">
              <p class="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Active Reps</p>
              <p class="text-xl font-black text-indigo-900 mt-1">
                {{ repActivityData.summary?.active_reps || 0 }} <span class="text-xs text-indigo-400 font-bold">/ {{ repActivityData.summary?.total_reps || 0 }}</span>
              </p>
            </div>
            <div class="bg-emerald-50/60 border border-emerald-100 p-3 rounded-2xl">
              <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Total Distance</p>
              <p class="text-xl font-black text-emerald-900 mt-1">
                {{ repActivityData.summary?.total_distance_km || 0 }} <span class="text-xs text-emerald-500 font-bold">km</span>
              </p>
            </div>
            <div class="bg-amber-50/60 border border-amber-100 p-3 rounded-2xl">
              <p class="text-[8px] font-black text-amber-600 uppercase tracking-widest">Total Stops</p>
              <p class="text-xl font-black text-amber-900 mt-1">
                {{ repActivityData.summary?.total_stops || 0 }} <span class="text-xs text-amber-500 font-bold">stops</span>
              </p>
            </div>
            <div class="bg-purple-50/60 border border-purple-100 p-3 rounded-2xl">
              <p class="text-[8px] font-black text-purple-600 uppercase tracking-widest">Avg Move / Stop</p>
              <p class="text-sm font-black text-purple-900 mt-1.5">
                {{ formatMinutesHelper(repActivityData.summary?.avg_moving_minutes) }} <span class="text-purple-300">/</span> {{ formatMinutesHelper(repActivityData.summary?.avg_stopped_minutes) }}
              </p>
            </div>
          </div>

          <!-- Loading state for rep activity -->
          <div v-if="loadingActivity" class="py-16 text-center">
            <Icon name="heroicons:arrow-path" class="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p class="text-xs font-black uppercase tracking-wider text-slate-500">Calculating Rep Work Hours & Stops...</p>
          </div>

          <!-- VIEW A: ALL REPS LIST (When no single rep is selected) -->
          <div v-else-if="!selectedRepActivity" class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Sales Reps ({{ repActivityData.reps?.length || 0 }})
              </p>
              <span class="text-[9px] text-slate-400 font-bold">Click a rep to view detailed stops & timeline</span>
            </div>

            <div class="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              <div
                v-for="rep in repActivityData.reps"
                :key="rep.user_id"
                @click="selectRepForDeepDive(rep)"
                class="bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-indigo-200 rounded-2xl p-4 transition-all duration-200 shadow-sm cursor-pointer group hover:-translate-y-0.5"
              >
                <!-- Rep Header -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-sm"
                      :class="rep.is_online ? 'bg-emerald-500' : 'bg-slate-600'"
                    >
                      {{ rep.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">
                          {{ rep.name }}
                        </p>
                        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-wider">
                          {{ rep.role }}
                        </span>
                      </div>
                      <p class="text-[9px] text-slate-400 font-bold mt-0.5 flex items-center gap-1.5">
                        <span v-if="rep.is_online" class="text-emerald-600 font-black flex items-center gap-1">● Live Broadcasting</span>
                        <span v-else-if="rep.last_seen_at">Last seen: {{ formatLastSeen(rep.last_seen_at) }}</span>
                        <span v-else>No activity</span>
                      </p>
                    </div>
                  </div>

                  <!-- Quick Map Action Button -->
                  <button
                    v-if="rep.total_points > 0"
                    @click.stop="plotRepDailyStopsAndRoute(rep)"
                    class="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-xs"
                    title="Plot on Map"
                  >
                    <Icon name="heroicons:map" class="w-3.5 h-3.5" />
                    <span>Plot Stops</span>
                  </button>
                </div>

                <!-- Active Day Stats (if points exist) -->
                <div v-if="rep.total_points > 0" class="space-y-2.5">
                  <!-- Metrics Row -->
                  <div class="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl text-center border border-slate-100">
                    <div>
                      <p class="text-[8px] font-black uppercase text-slate-400">Shift Window</p>
                      <p class="text-[11px] font-black text-slate-800 mt-0.5">
                        {{ rep.first_seen_at }} - {{ rep.last_seen_at_day }}
                      </p>
                      <p class="text-[8px] font-bold text-slate-400">({{ rep.shift_duration_formatted }})</p>
                    </div>
                    <div>
                      <p class="text-[8px] font-black uppercase text-emerald-600">Moving Time</p>
                      <p class="text-[11px] font-black text-emerald-700 mt-0.5">{{ rep.moving_duration_formatted }}</p>
                      <p class="text-[8px] font-bold text-emerald-600">{{ rep.total_distance_km }} km</p>
                    </div>
                    <div>
                      <p class="text-[8px] font-black uppercase text-amber-600">Stop (No-Move)</p>
                      <p class="text-[11px] font-black text-amber-700 mt-0.5">{{ rep.stopped_duration_formatted }}</p>
                      <p class="text-[8px] font-bold text-amber-600">{{ rep.total_stops_count }} stops</p>
                    </div>
                  </div>

                  <!-- Moving vs Stopped Ratio Bar -->
                  <div>
                    <div class="flex justify-between text-[8px] font-black uppercase tracking-wider mb-1 text-slate-500">
                      <span class="text-emerald-600">Moving: {{ getMovingPct(rep) }}%</span>
                      <span class="text-amber-600">Stationary / Stop: {{ getStoppedPct(rep) }}%</span>
                    </div>
                    <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div :style="{ width: getMovingPct(rep) + '%' }" class="h-full bg-emerald-500"></div>
                      <div :style="{ width: getStoppedPct(rep) + '%' }" class="h-full bg-amber-500"></div>
                    </div>
                  </div>

                  <!-- Sales footer -->
                  <div class="flex items-center justify-between text-[9px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                    <span class="flex items-center gap-1 text-indigo-600 font-black">
                      <Icon name="heroicons:shopping-cart" class="w-3.5 h-3.5" />
                      {{ rep.orders_count }} Orders (${{ rep.total_sales_amount.toFixed(2) }})
                    </span>
                    <span class="text-indigo-600 font-black group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      View Stops & Timeline →
                    </span>
                  </div>
                </div>

                <!-- Empty state for rep on this date -->
                <div v-else class="py-2 text-center text-slate-400 text-[10px] font-bold">
                  No location pings recorded on this date.
                </div>
              </div>
            </div>
          </div>

          <!-- VIEW B: SINGLE REP DEEP DIVE (Selected Rep with Stop Actions Timeline) -->
          <div v-else class="space-y-4 animate-fade-in">
            <!-- Back Button & Rep Header -->
            <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <button
                @click="selectedRepActivity = null"
                class="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1 mb-3"
              >
                <Icon name="heroicons:arrow-left" class="w-3.5 h-3.5" />
                <span>Back to All Sales Reps</span>
              </button>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20">
                    {{ selectedRepActivity.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <h4 class="text-base font-black text-slate-900 uppercase">{{ selectedRepActivity.name }}</h4>
                    <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      {{ selectedRepActivity.role }} · Date: {{ activityDate }}
                    </p>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-2">
                  <button
                    @click="plotRepDailyStopsAndRoute(selectedRepActivity)"
                    class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                  >
                    <Icon name="heroicons:map-pin" class="w-3.5 h-3.5" />
                    <span>Plot Stops on Map</span>
                  </button>
                  <button
                    @click="openExportModal({ id: selectedRepActivity.user_id, name: selectedRepActivity.name })"
                    class="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all"
                    title="Export Excel Report"
                  >
                    <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Deep Dive Stats Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div class="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
                <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Shift Window</p>
                <p class="text-sm font-black text-slate-800 mt-1">
                  {{ selectedRepActivity.first_seen_at || '--' }} - {{ selectedRepActivity.last_seen_at_day || '--' }}
                </p>
                <p class="text-[9px] font-bold text-indigo-600 mt-0.5">Duration: {{ selectedRepActivity.shift_duration_formatted }}</p>
              </div>

              <div class="bg-sky-50 border border-sky-100 p-3 rounded-2xl">
                <p class="text-[8px] font-black text-sky-600 uppercase tracking-widest">Live Broadcast</p>
                <p class="text-lg font-black text-sky-900 mt-1">{{ selectedRepActivity.live_duration_formatted }}</p>
                <p class="text-[8px] font-bold text-sky-500 mt-0.5">{{ selectedRepActivity.total_points }} location pings</p>
              </div>

              <div class="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Moving Time</p>
                <p class="text-lg font-black text-emerald-900 mt-1">{{ selectedRepActivity.moving_duration_formatted }}</p>
                <p class="text-[8px] font-bold text-emerald-600 mt-0.5">Distance: {{ selectedRepActivity.total_distance_km }} km</p>
              </div>

              <div class="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
                <p class="text-[8px] font-black text-amber-600 uppercase tracking-widest">Stop (No-Move)</p>
                <p class="text-lg font-black text-amber-900 mt-1">{{ selectedRepActivity.stopped_duration_formatted }}</p>
                <p class="text-[8px] font-bold text-amber-600 mt-0.5">{{ selectedRepActivity.total_stops_count }} stationary stops</p>
              </div>
            </div>

            <!-- Moving vs Stationary Bar -->
            <div class="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-2">
              <div class="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-600">
                <span class="flex items-center gap-1 text-emerald-600">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Moving: {{ getMovingPct(selectedRepActivity) }}% ({{ selectedRepActivity.moving_duration_formatted }})
                </span>
                <span class="flex items-center gap-1 text-amber-600">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  Stop / Idle: {{ getStoppedPct(selectedRepActivity) }}% ({{ selectedRepActivity.stopped_duration_formatted }})
                </span>
              </div>
              <div class="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <div :style="{ width: getMovingPct(selectedRepActivity) + '%' }" class="h-full bg-emerald-500"></div>
                <div :style="{ width: getStoppedPct(selectedRepActivity) + '%' }" class="h-full bg-amber-500"></div>
              </div>
            </div>

            <!-- Stops Timeline (Stop Action Breakdown) -->
            <div class="space-y-3">
              <div class="flex items-center justify-between px-1">
                <div class="flex items-center gap-2">
                  <Icon name="heroicons:map-pin" class="w-4 h-4 text-amber-500" />
                  <h5 class="text-xs font-black uppercase tracking-wider text-slate-800">
                    Stationary Stop Actions ({{ selectedRepActivity.stops?.length || 0 }})
                  </h5>
                </div>
                <span class="text-[9px] text-slate-400 font-bold">Stops with no movement (&ge;3 mins)</span>
              </div>

              <!-- List of Stops -->
              <div v-if="selectedRepActivity.stops?.length > 0" class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                <div
                  v-for="stop in selectedRepActivity.stops"
                  :key="stop.stop_number"
                  class="bg-white border rounded-2xl p-3.5 transition-all shadow-xs space-y-2"
                  :class="stop.has_sales ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400' : 'border-slate-200/80 hover:border-amber-300'"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-start gap-3">
                      <div 
                        class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5"
                        :class="stop.has_sales ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                      >
                        #{{ stop.stop_number }}
                      </div>
                      <div>
                        <div class="flex flex-wrap items-center gap-1.5">
                          <span class="text-xs font-black text-slate-800">
                            {{ stop.start_time }} - {{ stop.end_time }}
                          </span>
                          <span 
                            class="px-2 py-0.5 rounded-full text-white text-[9px] font-black"
                            :class="stop.has_sales ? 'bg-emerald-500' : 'bg-amber-500'"
                          >
                            {{ stop.duration_formatted }} stop
                          </span>
                          <span 
                            v-if="stop.has_sales" 
                            class="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[9px] font-black flex items-center gap-1"
                          >
                            <Icon name="heroicons:shopping-bag" class="w-3 h-3 text-emerald-600" />
                            <span>{{ stop.sales_count }} Sold (${{ Number(stop.sales_amount || 0).toFixed(2) }})</span>
                          </span>
                        </div>

                        <!-- Geofence / Area -->
                        <p v-if="stop.geofence_name" class="text-[10px] font-bold text-indigo-600 mt-1 flex items-center gap-1">
                          <Icon name="heroicons:globe-alt" class="w-3 h-3" />
                          <span>Area: {{ stop.geofence_name }}</span>
                        </p>
                        <p v-else class="text-[9px] text-slate-400 font-mono mt-1">
                          Coords: {{ stop.latitude }}, {{ stop.longitude }}
                        </p>
                      </div>
                    </div>

                    <!-- Focus Stop Button -->
                    <button
                      @click="focusStopOnMap(stop)"
                      class="p-2 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0"
                      :class="stop.has_sales ? 'bg-emerald-50 hover:bg-emerald-600' : 'bg-slate-50 hover:bg-amber-500'"
                      title="Focus stop on map"
                    >
                      <Icon name="heroicons:eye" class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Matched Sales / Orders list at this stop -->
                  <div v-if="stop.has_sales" class="pt-2 border-t border-emerald-100 space-y-1.5">
                    <div 
                      v-for="ord in stop.orders" 
                      :key="ord.id" 
                      class="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-2.5 py-1.5 text-[11px]"
                    >
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="w-5 h-5 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[9px] shrink-0">🛒</span>
                        <div class="truncate">
                          <span class="font-black text-slate-800">{{ ord.shop_name }}</span>
                          <span v-if="ord.so_number" class="text-[10px] font-mono text-emerald-700 ml-1 font-bold">({{ ord.so_number }})</span>
                        </div>
                      </div>
                      <div class="text-right shrink-0 ml-2">
                        <span class="font-black text-emerald-800 font-mono text-xs">${{ Number(ord.total_amount || 0).toFixed(2) }}</span>
                        <span class="text-[9px] text-slate-400 block">{{ ord.order_time }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No stops state -->
              <div v-else class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
                <Icon name="heroicons:check-circle" class="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p class="text-xs font-bold text-slate-500">No stationary dwell stops (&ge;3 mins) detected.</p>
                <p class="text-[9px] text-slate-400 mt-0.5">Rep remained in motion or location pings were continuous.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: MACRO TRENDS (30-Day Revenue & Sales Charts) -->
        <div v-else-if="analyticsTab === 'macro_trends'" class="flex-1 flex flex-col space-y-6 animate-fade-in">
          <!-- Stats Cards Grid -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Agents</p>
              <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.total_agents }}</p>
            </div>
            <div class="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
              <p class="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Online Agents</p>
              <p class="text-2xl font-black text-emerald-700 mt-1">{{ stats.online_agents }}</p>
            </div>
            <div class="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
              <p class="text-[8px] font-black text-blue-600 uppercase tracking-widest">Sales Today</p>
              <p class="text-2xl font-black text-blue-700 mt-1">{{ stats.total_sales }}</p>
            </div>
            <div class="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
              <p class="text-[8px] font-black text-purple-600 uppercase tracking-widest">Revenue Today</p>
              <p class="text-2xl font-black text-purple-700 mt-1">${{ stats.total_revenue.toFixed(2) }}</p>
            </div>
          </div>

          <!-- Charts Rendering Section -->
          <div class="space-y-6 flex-1 min-h-[300px]">
            <!-- Revenue Line Chart -->
            <div class="bg-slate-50 border border-slate-100 p-4 rounded-3xl">
              <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Revenue Trend (30 Days)</p>
              <div class="h-48 relative">
                <Line :data="revenueChartData" :options="chartOptions" />
              </div>
            </div>

            <!-- Sales Count Bar Chart -->
            <div class="bg-slate-50 border border-slate-100 p-4 rounded-3xl">
              <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Sales Event Count (30 Days)</p>
              <div class="h-48 relative">
                <Bar :data="salesChartData" :options="chartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Date Range Picker Modal -->
    <div
      v-if="exportModal.show"
      class="fixed inset-0 z-[1300] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="exportModal.show = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl p-6 w-96 border border-slate-100 animate-scale-in">
        <h3 class="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Export History for {{ exportModal.agentName }}</h3>
        
        <div class="space-y-4">
          <div>
            <label class="text-[9px] font-black text-slate-400 uppercase block mb-1">Date From</label>
            <input type="date" v-model="exportModal.dateFrom" class="input-field-modern w-full" />
          </div>
          <div>
            <label class="text-[9px] font-black text-slate-400 uppercase block mb-1">Date To</label>
            <input type="date" v-model="exportModal.dateTo" class="input-field-modern w-full" />
          </div>
          
          <div class="flex gap-2 pt-2">
            <button
              @click="exportModal.show = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              @click="confirmExport"
              class="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Geofence Addition Modal -->
    <div
      v-if="showGeofenceForm"
      class="fixed inset-0 z-[1250] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      @click.self="showGeofenceForm = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl p-6 w-96 border border-slate-100 animate-scale-in">
        <h3 class="text-sm font-black uppercase tracking-widest text-indigo-700 mb-2">Create New Geofence</h3>
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Double click on the map to autofill coordinates</p>

        <div class="space-y-4">
          <div>
            <label class="text-[9px] font-black text-slate-400 uppercase block mb-1">Geofence Name</label>
            <input type="text" v-model="geofenceForm.name" placeholder="e.g. Headquarters Office" class="input-field-modern w-full" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase block mb-1">Latitude</label>
              <input type="number" step="any" v-model.number="geofenceForm.center_lat" placeholder="11.556" class="input-field-modern w-full" />
            </div>
            <div>
              <label class="text-[9px] font-black text-slate-400 uppercase block mb-1">Longitude</label>
              <input type="number" step="any" v-model.number="geofenceForm.center_lng" placeholder="104.928" class="input-field-modern w-full" />
            </div>
          </div>
          <div>
            <label class="text-[9px] font-black text-slate-400 uppercase block mb-1">Radius (Meters)</label>
            <input type="number" v-model.number="geofenceForm.radius_meters" placeholder="200" class="input-field-modern w-full" />
          </div>
          
          <div class="flex gap-2 pt-2">
            <button
              @click="showGeofenceForm = false"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-wider hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              @click="submitGeofence"
              :disabled="!geofenceForm.name || !geofenceForm.center_lat || !geofenceForm.center_lng || !geofenceForm.radius_meters"
              class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Alerts -->
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
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import { useAuthStore } from '~/stores/auth'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale, BarElement)

definePageMeta({
  layout: 'admin',
  fullWidth: true
})

const api = useApi()
const authStore = useAuthStore()
const config = useRuntimeConfig()

// Leaflet
let L: any = null
let map: any = null
let activeTileLayer: any = null
let agentMarkers: Map<number, any> = new Map()
let saleMarkers: any[] = []
let geofenceCircles: any[] = []
let activeTrailPolyline: any = null
let heatmapLayer: any = null

// State variables
const loading = ref(false)
const agents = ref<any[]>([])
const geofences = ref<any[]>([])
const selectedAgent = ref<any>(null)
const activeTrail = ref(false)
const showHeatmap = ref(false)
const showSatellite = ref(false)
const showGeofenceForm = ref(false)
const showStatsDrawer = ref(false)
const agentPanelOpen = ref(false)
const notificationLogs = ref<any[]>([])

// Live trail data: Map<agentId, [{lat, lng, bearing, ts}]>
const agentTrails = new Map<number, Array<{lat: number, lng: number, bearing: number|null, ts: number}>>()
// Leaflet polylines for trails: Map<agentId, polyline>
let trailPolylines = new Map<number, any>()
// Turn indicator markers: Map<agentId, marker>
let turnMarkers = new Map<number, any>()

// Helper for local date string YYYY-MM-DD
function getLocalDateString(d = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Rep Activity & Stop Action Analytics
const analyticsTab = ref<'rep_activity' | 'macro_trends'>('rep_activity')
const activityDate = ref<string>(getLocalDateString())
const loadingActivity = ref(false)
const repActivityData = ref<{ summary: any, reps: any[] }>({
  summary: { total_reps: 0, active_reps: 0, total_distance_km: 0, total_stops: 0, avg_moving_minutes: 0, avg_stopped_minutes: 0 },
  reps: []
})
const selectedRepActivity = ref<any | null>(null)
const activeDailyRouteRep = ref<any | null>(null)

const isActivityDateToday = computed(() => {
  return activityDate.value === getLocalDateString()
})

// Leaflet daily route polyline and stop markers
let dailyRoutePolyline: any = null
let dailyStopMarkers: any[] = []

const toast = reactive({
  show: false,
  message: '',
  success: true
})

const exportModal = reactive({
  show: false,
  userId: null as number | null,
  agentName: '',
  dateFrom: '',
  dateTo: ''
})

const geofenceForm = reactive({
  name: '',
  center_lat: null as number | null,
  center_lng: null as number | null,
  radius_meters: 200
})

const stats = reactive({
  total_agents: 0,
  online_agents: 0,
  total_sales: 0,
  total_revenue: 0,
  sales_per_day: [] as any[]
})

// Interval for polling agent locations
let pollInterval: any = null

onMounted(async () => {
  await loadMap()
  await fetchAgentsData()
  await fetchGeofences()
  await fetchStats()

  // Set up periodic locations poll (every 12 seconds)
  pollInterval = setInterval(fetchAgentsData, 12000)

  // Listen to Echo real-time broadcasts
  setupEchoListeners()
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  
  // Unbind echo listeners
  if (window.Echo) {
    window.Echo.leaveChannel('sales')
    window.Echo.leaveChannel('agent-locations')
    
    // Unsubscribe from agent geofence notifications
    const user = authStore.user
    if (user?.id) {
      window.Echo.leave(`App.Models.User.${user.id}`)
    }
  }

  if (map) {
    clearDailyStopsAndRoute()
    map.remove()
  }
})

// Toast notification trigger
function showToast(message: string, success = true) {
  toast.message = message
  toast.success = success
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 4000)
}

// Format timestamp to localized string
function formatLastSeen(ts?: string | null) {
  if (!ts) return ''
  let safeTs = ts
  if (typeof safeTs === 'string' && safeTs.includes(' ') && !safeTs.includes('Z') && !safeTs.includes('+')) {
    safeTs = safeTs.replace(' ', 'T') + 'Z'
  }
  const date = new Date(safeTs)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// Chart Options configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: '#f1f5f9'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}

// Compute daily revenue dataset
const revenueChartData = computed(() => {
  const labels = stats.sales_per_day.map(d => d.date)
  const data = stats.sales_per_day.map(d => d.revenue)
  return {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data,
        borderColor: '#8b5cf6',
        backgroundColor: '#c084fc',
        tension: 0.3,
        fill: false
      }
    ]
  }
})

// Compute daily sales counts dataset
const salesChartData = computed(() => {
  const labels = stats.sales_per_day.map(d => d.date)
  const data = stats.sales_per_day.map(d => d.count)
  return {
    labels,
    datasets: [
      {
        label: 'Sales count',
        data,
        backgroundColor: '#10b981',
        borderRadius: 8
      }
    ]
  }
})

// Setup Laravel Echo Broadcasting listeners
function setupEchoListeners() {
  if (!window.Echo) {
    console.warn('Echo plugin not loaded. Real-time features disabled.')
    return
  }

  // 1. Listen for new Sales
  window.Echo.channel('sales')
    .listen('.SaleCreated', (e: any) => {
      const sale = e.sale
      if (sale) {
        notificationLogs.value.push({
          id: Date.now(),
          message: `Sale of $${sale.amount} logged by agent ${sale.user?.name || 'Unknown'}`
        })
        plotSalePin(sale)
        showToast(`New sale of $${sale.amount} submitted by ${sale.user?.name || 'Agent'}`)
        fetchStats()
      }
    })

  // 2. Listen for live agent location updates → draw trail + detect turns
  window.Echo.channel('agent-locations')
    .listen('.AgentLocationUpdated', (e: any) => {
      updateAgentLiveLocation(e)
    })

  // 3. Listen to geofence notification for active user
  const user = authStore.user
  if (user?.id) {
    window.Echo.private(`App.Models.User.${user.id}`)
      .notification((notification: any) => {
        if (notification.type === 'App\\Notifications\\AgentEnteredGeofence' || notification.message) {
          notificationLogs.value.push({
            id: Date.now(),
            message: notification.message
          })
          showToast(notification.message)
        }
      })
  }
}

/**
 * Handle a live location update from an agent.
 * Updates their map pin, draws/extends their trail polyline,
 * and detects left/right turns from bearing changes.
 */
function updateAgentLiveLocation(e: any) {
  if (!L || !map) return

  const agentId = e.user_id
  const lat = parseFloat(e.lat)
  const lng = parseFloat(e.lng)
  const bearing: number | null = e.bearing !== null && e.bearing !== undefined ? parseFloat(e.bearing) : null

  // 1. Update agent in agents list
  const agent = agents.value.find(a => a.id === agentId)
  if (agent) {
    agent.location = `${lat},${lng}`
    agent.is_online = true
    agent.last_seen_at = new Date().toISOString()
    agent.location_source = e.source || 'app'
  } else {
    // Agent appeared for first time - add minimal entry
    agents.value.push({
      id: agentId,
      name: e.name,
      role: e.role,
      location: `${lat},${lng}`,
      is_online: true,
      last_seen_at: new Date().toISOString(),
      location_source: e.source || 'app'
    })
  }

  // 2. Append point to trail history (keep last 60 points)
  if (!agentTrails.has(agentId)) {
    agentTrails.set(agentId, [])
  }
  const trail = agentTrails.get(agentId)!
  trail.push({ lat, lng, bearing, ts: Date.now() })
  if (trail.length > 60) trail.shift()

  // 3. Build directional triangle above the agent pin (matches reference screenshot)
  // The triangle rotates to point in the direction of movement
  const agentColor = e.role === 'delivery' ? '#3b82f6' : '#10b981'
  const initial = (e.name || '?').charAt(0).toUpperCase()

  const directionHtml = bearing !== null ? `
    <div style="
      position: absolute;
      top: -22px;
      left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 16px solid ${agentColor};
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      transform-origin: center 100%;
      transform: translateX(-50%) rotate(${bearing}deg);
    "></div>
  ` : ''

  const customIcon = L.divIcon({
    html: `
      <div style="position:relative; width:36px; height:54px; display:flex; flex-direction:column; align-items:center;">
        ${directionHtml}
        <div style="
          width:36px; height:36px; border-radius:50%;
          background:${agentColor};
          border:3px solid white;
          box-shadow:0 4px 16px rgba(0,0,0,0.25);
          display:flex; align-items:center; justify-content:center;
          font-size:14px; font-weight:900; color:white;
          position:relative;
        ">
          ${initial}
          <div style="
            position:absolute; bottom:-1px; right:-1px;
            width:11px; height:11px;
            background:#10b981; border:2px solid white;
            border-radius:50%;
          "></div>
        </div>
      </div>`,
    className: '',
    iconSize: [36, 54],
    iconAnchor: [18, 36]
  })

  if (agentMarkers.has(agentId)) {
    const marker = agentMarkers.get(agentId)
    const oldLatLng = marker.getLatLng()
    const oldLat = oldLatLng.lat
    const oldLng = oldLatLng.lng

    // Animate smoothly to new position over 2.5 seconds if position changed
    if (oldLat !== lat || oldLng !== lng) {
      animateMarker(marker, [oldLat, oldLng], [lat, lng], 2500)
    }
    marker.setIcon(customIcon)
  } else {
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
    marker.bindPopup(`
      <div style="padding:4px 2px; min-width:120px;">
        <p style="font-size:11px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:0.05em;">${e.name}</p>
        <p style="font-size:9px; font-weight:700; color:#94a3b8; margin-top:2px; text-transform:uppercase;">${e.role}</p>
        <p style="font-size:9px; font-weight:700; color:#10b981; margin-top:6px;">● Live Now (${e.source === 'telegram' ? 'Telegram' : 'Mini App'})</p>
        ${bearing !== null ? `<p style="font-size:9px; color:#64748b; margin-top:2px;">Heading: ${Math.round(bearing)}°</p>` : ''}
      </div>
    `)
    agentMarkers.set(agentId, marker)
  }

  // 4. Draw / update trail polyline — solid smooth line like the reference screenshot
  const trailLatLngs = trail.map(p => [p.lat, p.lng])

  if (trailPolylines.has(agentId)) {
    trailPolylines.get(agentId).setLatLngs(trailLatLngs)
  } else {
    // Agent-specific color (same as their pin)
    const trailColor = e.role === 'delivery' ? '#3b82f6' : '#10b981'
    const polyline = L.polyline(trailLatLngs, {
      color: trailColor,
      weight: 4,
      opacity: 0.7,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map)
    trailPolylines.set(agentId, polyline)
  }

  // 5. Turn detection — compare last 2 bearings
  if (trail.length >= 2) {
    const prevPoint = trail[trail.length - 2]
    const currPoint = trail[trail.length - 1]
    const prev = prevPoint?.bearing ?? null
    const curr = currPoint?.bearing ?? null
    if (prev !== null && curr !== null) {
      let delta = curr - prev
      // Normalize to -180..180
      if (delta > 180) delta -= 360
      if (delta < -180) delta += 360

      const TURN_THRESHOLD = 25 // degrees
      if (Math.abs(delta) >= TURN_THRESHOLD) {
        const direction = delta > 0 ? '➡️ Right Turn' : '⬅️ Left Turn'
        const turnIcon = L.divIcon({
          html: `<div style="background:white; border:2px solid #f59e0b; border-radius:8px; padding:2px 6px; font-size:10px; font-weight:900; color:#92400e; box-shadow:0 2px 8px rgba(0,0,0,0.2); white-space:nowrap;">${direction}</div>`,
          className: '',
          iconSize: [90, 24],
          iconAnchor: [45, 28]
        })

        // Remove previous turn marker for this agent
        if (turnMarkers.has(agentId)) {
          map.removeLayer(turnMarkers.get(agentId))
        }
        const turnMarker = L.marker([lat, lng], { icon: turnIcon }).addTo(map)
        turnMarkers.set(agentId, turnMarker)

        // Auto-remove turn label after 4 seconds
        setTimeout(() => {
          if (turnMarkers.get(agentId) === turnMarker) {
            map.removeLayer(turnMarker)
            turnMarkers.delete(agentId)
          }
        }, 4000)

        // Log to notification feed
        notificationLogs.value.push({
          id: Date.now(),
          message: `${e.name} made a ${direction.replace(/[^ \w]/g, '').trim()} (${Math.abs(Math.round(delta))}°)`
        })
        if (notificationLogs.value.length > 20) notificationLogs.value.shift()
      }
    }
  }
}

// Fetch general dashboard statistics
async function fetchStats() {
  try {
    const data = await api.get('/admin/stats') as any
    if (data) {
      stats.total_agents = data.total_agents
      stats.online_agents = data.online_agents
      stats.total_sales = data.total_sales
      stats.total_revenue = data.total_revenue
      stats.sales_per_day = data.sales_per_day || []
    }
  } catch (e) {
    console.error('Failed to load activity statistics', e)
  }
}

// Fetch list of agents (Salesmen / Deliveries)
async function fetchAgentsData() {
  loading.value = true
  try {
    const users = await api.get('/admin/users?active_only=1') as any[]
    // Filter down to active salesman and delivery roles
    agents.value = (Array.isArray(users) ? users : []).filter(u => (u.role === 'salesman' || u.role === 'delivery') && u.is_active !== false && u.is_active !== 0)
    
    // Refresh markers on the map
    plotAgentMarkers()
  } catch (e) {
    console.error('Failed to load tracking agents', e)
  } finally {
    loading.value = false
  }
}

// Load geofences
async function fetchGeofences() {
  try {
    const data = await api.get('/geofences') as any[]
    geofences.value = data || []
    plotGeofenceCircles()
  } catch (e) {
    console.error('Failed to fetch geofences', e)
  }
}

// Initialize Leaflet Map
async function loadMap() {
  const leafletModule = await import('leaflet') as any
  L = leafletModule.default || leafletModule

  if (typeof window !== 'undefined') {
    (window as any).L = L
  }

  await import('leaflet/dist/leaflet.css')

  if (!map) {
    map = L.map('sales-tracking-map').setView([11.5564, 104.9282], 12) // Default to Phnom Penh
    activeTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Setup map double click event to trigger Geofence center point allocation
    map.on('dblclick', (e: any) => {
      geofenceForm.center_lat = e.latlng.lat
      geofenceForm.center_lng = e.latlng.lng
      showGeofenceForm.value = true
      showToast('Coordinates selected on map')
    })
    
    // Invalidate size helper
    setTimeout(() => {
      if (map) map.invalidateSize()
    }, 500)
  }
}

// Plot geofence circles on the map
function plotGeofenceCircles() {
  if (!L || !map) return

  // Clear existing circles
  geofenceCircles.forEach(c => c.remove())
  geofenceCircles = []

  geofences.value.forEach(g => {
    if (g.center_lat && g.center_lng) {
      const circle = L.circle([g.center_lat, g.center_lng], {
        color: '#6366f1',
        fillColor: '#818cf8',
        fillOpacity: 0.1,
        radius: g.radius_meters
      }).addTo(map)

      circle.bindPopup(`
        <div class="p-1">
          <p class="text-xs font-black uppercase text-indigo-700 leading-none">${g.name}</p>
          <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Radius: ${g.radius_meters}m</p>
        </div>
      `)
      geofenceCircles.push(circle)
    }
  })
}

// Toggle satellite / street tile layer
function toggleSatellite() {
  showSatellite.value = !showSatellite.value
  if (!map || !L) return

  if (activeTileLayer) {
    map.removeLayer(activeTileLayer)
  }

  if (showSatellite.value) {
    activeTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    }).addTo(map)
  } else {
    activeTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)
  }
}

// Helper to calculate compass bearing angle on frontend
function calculateBearingAngle(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * Math.PI / 180
  const rLat1 = lat1 * Math.PI / 180
  const rLat2 = lat2 * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(rLat2)
  const x = Math.cos(rLat1) * Math.sin(rLat2) - Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon)
  const bearing = Math.atan2(y, x) * 180 / Math.PI
  return (bearing + 360) % 360
}

// Animate marker transition smoothly between two coordinates using requestAnimationFrame
function animateMarker(marker: any, fromLatLng: [number, number], toLatLng: [number, number], durationMs: number = 2500) {
  const start = performance.now()
  
  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / durationMs, 1)
    
    // Ease-in-out ease function
    const easeProgress = progress < 0.5 
      ? 2 * progress * progress 
      : -1 + (4 - 2 * progress) * progress

    const currentLat = fromLatLng[0] + (toLatLng[0] - fromLatLng[0]) * easeProgress
    const currentLng = fromLatLng[1] + (toLatLng[1] - fromLatLng[1]) * easeProgress
    
    if (marker && typeof marker.setLatLng === 'function') {
      marker.setLatLng([currentLat, currentLng])
    }

    if (progress < 1) {
      requestAnimationFrame(tick)
    }
  }
  
  requestAnimationFrame(tick)
}

// Plot active agent markers
function plotAgentMarkers() {
  if (!L || !map) return

  agents.value.forEach(agent => {
    const agentId = agent.id

    // ── Offline agents: remove their marker, trail, and turn indicator ──────────
    if (!agent.is_online) {
      if (agentMarkers.has(agentId)) {
        agentMarkers.get(agentId).remove()
        agentMarkers.delete(agentId)
      }
      if (trailPolylines.has(agentId)) {
        trailPolylines.get(agentId).remove()
        trailPolylines.delete(agentId)
      }
      if (turnMarkers.has(agentId)) {
        map.removeLayer(turnMarkers.get(agentId))
        turnMarkers.delete(agentId)
      }
      agentTrails.delete(agentId)
      return // skip rendering
    }

    // ── Online agents only below ──────────────────────────────────────────────

    let lat: number | null = null
    let lng: number | null = null

    // Extract lat/lng from user location string (e.g. "11.556,104.928")
    if (agent.location && agent.location.includes(',')) {
      const parts = agent.location.split(',').map(Number)
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        lat = parts[0]
        lng = parts[1]
      }
    }

    // No location yet — skip but keep online status
    if (lat === null || lng === null) return

    const agentColor = agent.role === 'delivery' ? '#3b82f6' : '#10b981'
    const initial = (agent.name || '?').charAt(0).toUpperCase()

    // Track trail history in memory for polling
    if (!agentTrails.has(agentId)) {
      agentTrails.set(agentId, [])
    }
    const trail = agentTrails.get(agentId)!
    
    // Only append if the location has actually changed from the last point
    const lastPoint = trail[trail.length - 1]
    let bearing: number | null = null

    if (!lastPoint || lastPoint.lat !== lat || lastPoint.lng !== lng) {
      if (lastPoint) {
        bearing = calculateBearingAngle(lastPoint.lat, lastPoint.lng, lat, lng)
      }
      trail.push({ lat, lng, bearing, ts: Date.now() })
      if (trail.length > 60) trail.shift()
    } else {
      bearing = lastPoint.bearing
    }

    // Build directional triangle if bearing is present
    const directionHtml = bearing !== null ? `
      <div style="
        position: absolute;
        top: -22px;
        left: 50%;
        transform: translateX(-50%);
        width: 0; height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 16px solid ${agentColor};
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        transform-origin: center 100%;
        transform: translateX(-50%) rotate(${bearing}deg);
      "></div>
    ` : ''

    const customIcon = L.divIcon({
      html: `
        <div style="position:relative; width:36px; height:54px; display:flex; flex-direction:column; align-items:center;">
          ${directionHtml}
          <div style="
            width:36px; height:36px; border-radius:50%;
            background:${agentColor};
            border:3px solid white;
            box-shadow:0 4px 16px rgba(0,0,0,0.25);
            display:flex; align-items:center; justify-content:center;
            font-size:14px; font-weight:900; color:white;
            position:relative;
          ">
            ${initial}
            <div style="
              position:absolute; bottom:-1px; right:-1px;
              width:11px; height:11px;
              background:#10b981; border:2px solid white;
              border-radius:50%;
            "></div>
          </div>
        </div>`,
      className: '',
      iconSize: [36, 54],
      iconAnchor: [18, 36]
    })

    // Update or create marker
    if (agentMarkers.has(agentId)) {
      const marker = agentMarkers.get(agentId)
      const oldLatLng = marker.getLatLng()
      const oldLat = oldLatLng.lat
      const oldLng = oldLatLng.lng

      if (oldLat !== lat || oldLng !== lng) {
        animateMarker(marker, [oldLat, oldLng], [lat, lng], 2500)
      }
      marker.setIcon(customIcon)
    } else {
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
      marker.bindPopup(`
        <div style="padding:4px 2px; min-width:120px;">
          <p style="font-size:11px; font-weight:900; color:#1e293b; text-transform:uppercase; letter-spacing:0.05em;">${agent.name}</p>
          <p style="font-size:9px; font-weight:700; color:#94a3b8; margin-top:2px; text-transform:uppercase;">${agent.role}</p>
          <p style="font-size:9px; font-weight:700; color:#10b981; margin-top:6px;">● Live Now (${agent.location_source === 'telegram' ? 'Telegram' : 'Mini App'})</p>
          <p style="font-size:9px; color:#64748b; margin-top:2px;">Seen: ${formatLastSeen(agent.last_seen_at)}</p>
        </div>
      `)
      agentMarkers.set(agentId, marker)
    }

    // Draw / update trail polyline (if we have more than 1 point)
    if (trail.length >= 2) {
      const trailLatLngs = trail.map(p => [p.lat, p.lng])
      if (trailPolylines.has(agentId)) {
        trailPolylines.get(agentId).setLatLngs(trailLatLngs)
      } else {
        const trailColor = agent.role === 'delivery' ? '#3b82f6' : '#10b981'
        const polyline = L.polyline(trailLatLngs, {
          color: trailColor,
          weight: 4,
          opacity: 0.7,
          lineJoin: 'round',
          lineCap: 'round'
        }).addTo(map)
        trailPolylines.set(agentId, polyline)
      }
    }
  })

  // Also clean up any stale markers for agents no longer in the list at all
  agentMarkers.forEach((marker, agentId) => {
    const stillExists = agents.value.some(a => a.id === agentId)
    if (!stillExists) {
      marker.remove()
      agentMarkers.delete(agentId)
      if (trailPolylines.has(agentId)) {
        trailPolylines.get(agentId).remove()
        trailPolylines.delete(agentId)
      }
      if (turnMarkers.has(agentId)) {
        map.removeLayer(turnMarkers.get(agentId))
        turnMarkers.delete(agentId)
      }
      agentTrails.delete(agentId)
    }
  })
}

// Plot sale pin dynamically on map
function plotSalePin(sale: any) {
  if (!L || !map || !sale.latitude || !sale.longitude) return

  const customIcon = L.divIcon({
    html: `
      <div style="background:#10b981; width:28px; height:28px; border-radius:50%; border:2px solid white; box-shadow:0 4px 10px rgba(16,185,129,0.4); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:black; color:white;">
        $
      </div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  })

  const marker = L.marker([sale.latitude, sale.longitude], { icon: customIcon }).addTo(map)
  
  const popupContent = `
    <div class="p-1">
      <p class="text-xs font-black uppercase text-emerald-700 leading-none">Sale Captured</p>
      <p class="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">${sale.user?.name || 'Agent'}</p>
      <p class="text-sm font-black text-slate-800 mt-1.5">$${sale.amount}</p>
      ${sale.note ? `<p class="text-[9px] italic text-slate-500 mt-1">"${sale.note}"</p>` : ''}
      <p class="text-[8px] text-slate-400 mt-2 font-bold uppercase">${new Date(sale.created_at || Date.now()).toLocaleTimeString()}</p>
    </div>
  `
  marker.bindPopup(popupContent).openPopup()
  saleMarkers.push(marker)
}

// Focus map on selected agent and fetch history route trail
async function focusAgent(agent: any) {
  selectedAgent.value = agent

  // Check coordinates
  let lat: number | null = null
  let lng: number | null = null
  if (agent.location && agent.location.includes(',')) {
    const parts = agent.location.split(',').map(Number)
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      lat = parts[0]
      lng = parts[1]
    }
  }

  if (lat !== null && lng !== null && map) {
    map.setView([lat, lng], 14)
    
    // Open marker popup
    if (agentMarkers.has(agent.id)) {
      agentMarkers.get(agent.id).openPopup()
    }
  }

  // Draw trail (Feature 1)
  await fetchAgentTrail(agent.id)
}

// Fetch coordinates history and draw polyline trail
async function fetchAgentTrail(agentId: number) {
  try {
    const trailData = await api.get(`/admin/locations/${agentId}/history`) as any[]
    
    if (!L || !map) return
    
    // Clear previous polyline
    if (activeTrailPolyline) {
      activeTrailPolyline.remove()
      activeTrailPolyline = null
    }

    if (!trailData || trailData.length === 0) {
      activeTrail.value = false
      return
    }

    const latLngs = trailData.map(l => [Number(l.latitude), Number(l.longitude)])
    
    // Draw route trail (Blue weight 3, opacity 0.7)
    activeTrailPolyline = L.polyline(latLngs, {
      color: '#378ADD',
      weight: 3,
      opacity: 0.7
    }).addTo(map)

    activeTrail.value = true
  } catch (e) {
    console.error('Failed to load location history trail', e)
  }
}

// Clear polyline trail
function clearActiveTrail() {
  if (activeTrailPolyline) {
    activeTrailPolyline.remove()
    activeTrailPolyline = null
  }
  activeTrail.value = false
  selectedAgent.value = null
}

// Toggle Heatmap Layer (Feature 4)
async function toggleHeatmap() {
  showHeatmap.value = !showHeatmap.value

  if (!L || !map) return

  if (!showHeatmap.value) {
    // Remove heatmap layer
    if (heatmapLayer) {
      heatmapLayer.remove()
      heatmapLayer = null
    }
    return
  }

  loading.value = true
  try {
    const coords = await api.get('/admin/locations/all') as any[]
    if (coords && coords.length > 0) {
      const heatPoints = coords.map(c => [Number(c.latitude), Number(c.longitude), 0.5])
      
      // Render heatmap with requested gradient settings: 0.4 blue, 0.6 amber, 1.0 red
      heatmapLayer = (L as any).heatLayer(heatPoints, {
        radius: 25,
        blur: 15,
        gradient: {
          0.4: 'blue',
          0.6: '#f59e0b', // Amber
          1.0: 'red'
        }
      }).addTo(map)
    } else {
      showToast('No heatmap history found', false)
      showHeatmap.value = false
    }
  } catch (e) {
    console.error('Failed to load heatmap data', e)
    showHeatmap.value = false
  } finally {
    loading.value = false
  }
}

// Create new geofence
async function submitGeofence() {
  try {
    await api.post('/admin/geofences', geofenceForm)
    showToast('Geofence created successfully')
    showGeofenceForm.value = false
    
    // Reset form
    geofenceForm.name = ''
    geofenceForm.center_lat = null
    geofenceForm.center_lng = null
    geofenceForm.radius_meters = 200

    // Reload geofences
    await fetchGeofences()
  } catch (e) {
    showToast('Failed to create geofence', false)
  }
}

// Open Export range modal
function openExportModal(agent: any) {
  exportModal.userId = agent.id
  exportModal.agentName = agent.name
  const dFrom = new Date()
  dFrom.setDate(dFrom.getDate() - 30)
  exportModal.dateFrom = getLocalDateString(dFrom)
  exportModal.dateTo = getLocalDateString()
  exportModal.show = true
}

// Download Excel file
async function confirmExport() {
  if (!exportModal.userId) return
  
  try {
    showToast('Preparing location export download...')
    const response = await api.get('/admin/export/locations', {
      params: {
        user_id: exportModal.userId,
        date_from: exportModal.dateFrom,
        date_to: exportModal.dateTo
      },
      responseType: 'blob',
      headers: {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })
    
    const blob = (response instanceof Blob) ? response : new Blob([response as any])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const safeName = (exportModal.agentName || 'locations').toLowerCase().replace(/\s+/g, '_')
    link.setAttribute('download', `locations-${safeName}-${exportModal.dateFrom}-to-${exportModal.dateTo}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    exportModal.show = false
    showToast('Location export downloaded successfully!')
  } catch (error) {
    console.error('Location export failed:', error)
    showToast('Failed to export locations. Please try again.', false)
  }
}

// Open Analytics Drawer and auto-fetch daily activity
function openAnalyticsDrawer() {
  showStatsDrawer.value = true
  fetchRepActivity()
}

// Fetch sales rep activity metrics and stops breakdown
async function fetchRepActivity() {
  loadingActivity.value = true
  try {
    const res = await api.get(`/admin/stats/rep-activity?date=${activityDate.value}`) as any
    if (res) {
      repActivityData.value = res
      // If a rep was previously selected, update their selected object
      if (selectedRepActivity.value) {
        const found = res.reps?.find((r: any) => r.user_id === selectedRepActivity.value.user_id)
        selectedRepActivity.value = found || null
      }
    }
  } catch (e) {
    console.error('Failed to load rep activity metrics', e)
  } finally {
    loadingActivity.value = false
  }
}

// Quick date switch (today / yesterday)
function setActivityDateQuick(type: 'today' | 'yesterday') {
  if (type === 'today') {
    activityDate.value = getLocalDateString()
  } else {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    activityDate.value = getLocalDateString(d)
  }
  fetchRepActivity()
}

// Select a single rep to view deep dive stops breakdown
function selectRepForDeepDive(rep: any) {
  selectedRepActivity.value = rep
}

// Plot full day route trail and numbered Stop Action markers on map
function plotRepDailyStopsAndRoute(rep: any) {
  if (!L || !map) return
  
  clearDailyStopsAndRoute()
  activeDailyRouteRep.value = rep
  showStatsDrawer.value = false // close drawer to expose map

  const coords = rep.route_coordinates || []
  const stops = rep.stops || []

  // 1. Draw route polyline if coordinates exist
  if (coords.length > 0) {
    const latLngs = coords.map((c: any) => [c.lat, c.lng])
    dailyRoutePolyline = L.polyline(latLngs, {
      color: '#6366f1',
      weight: 4,
      opacity: 0.85,
      dashArray: '6, 6'
    }).addTo(map)
  }

  // 2. Plot numbered Stop markers
  stops.forEach((stop: any) => {
    const isSold = Boolean(stop.has_sales)
    const pinColor = isSold ? '#10b981' : '#f59e0b'
    const shadowColor = isSold ? 'rgba(16,185,129,0.45)' : 'rgba(245,158,11,0.45)'
    const labelHtml = isSold
      ? `<span>🛒 #${stop.stop_number}</span><span style="background:rgba(0,0,0,0.25); padding:1px 3px; border-radius:4px;">$${Number(stop.sales_amount || 0).toFixed(0)}</span>`
      : `<span>⏸️ #${stop.stop_number}</span><span style="background:rgba(0,0,0,0.25); padding:1px 3px; border-radius:4px;">${stop.duration_formatted}</span>`

    const stopIcon = L.divIcon({
      html: `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
          <div style="
            background:${pinColor}; color:white;
            font-size:10px; font-weight:900;
            padding:2px 6px; border-radius:8px;
            box-shadow:0 4px 12px ${shadowColor};
            border:2px solid white;
            white-space:nowrap;
            display:flex; align-items:center; gap:3px;
          ">
            ${labelHtml}
          </div>
          <div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid ${pinColor};"></div>
        </div>
      `,
      className: '',
      iconSize: [84, 30],
      iconAnchor: [42, 30]
    })

    let ordersHtml = ''
    if (isSold && Array.isArray(stop.orders) && stop.orders.length > 0) {
      ordersHtml = `
        <div style="margin-top:6px; padding-top:6px; border-top:1px solid #e2e8f0;">
          <div style="font-size:10px; font-weight:900; color:#059669; margin-bottom:3px;">🛒 Sold (${stop.sales_count} Orders · $${Number(stop.sales_amount || 0).toFixed(2)}):</div>
          ${stop.orders.map((o: any) => `
            <div style="font-size:10px; color:#1e293b; display:flex; justify-content:space-between; margin-bottom:2px;">
              <b>${o.shop_name}</b>
              <span style="color:#059669; font-weight:800; font-family:monospace;">$${Number(o.total_amount || 0).toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
      `
    }

    const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon }).addTo(map)
    marker.bindPopup(`
      <div style="padding:4px 2px; min-width:170px;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
          <span style="background:${pinColor}; color:white; font-size:10px; font-weight:900; padding:2px 6px; border-radius:6px;">Stop #${stop.stop_number}</span>
          <span style="font-size:11px; font-weight:800; color:#1e293b;">${stop.duration_formatted} stationary</span>
        </div>
        <p style="font-size:10px; color:#64748b; font-weight:700; margin-top:2px;">Time: ${stop.start_time} - ${stop.end_time}</p>
        ${stop.geofence_name ? `<p style="font-size:10px; color:#6366f1; font-weight:800; margin-top:3px;">📍 ${stop.geofence_name}</p>` : ''}
        <p style="font-size:9px; color:#94a3b8; margin-top:2px;">Coords: ${stop.latitude}, ${stop.longitude}</p>
        ${ordersHtml}
      </div>
    `)
    dailyStopMarkers.push(marker)
  })

  // Fit map bounds
  if (coords.length > 0) {
    const latLngs = coords.map((c: any) => [c.lat, c.lng])
    map.fitBounds(latLngs, { padding: [60, 60] })
  } else if (stops.length > 0) {
    const stopLatLngs = stops.map((s: any) => [s.latitude, s.longitude])
    map.fitBounds(stopLatLngs, { padding: [60, 60] })
  }

  showToast(`Showing route & ${stops.length} stop actions for ${rep.name}`)
}

// Clear plotted daily route and stop markers
function clearDailyStopsAndRoute() {
  if (dailyRoutePolyline) {
    dailyRoutePolyline.remove()
    dailyRoutePolyline = null
  }
  dailyStopMarkers.forEach(m => m.remove())
  dailyStopMarkers = []
  activeDailyRouteRep.value = null
}

// Focus a single stop on Leaflet map
function focusStopOnMap(stop: any) {
  if (!L || !map) return
  showStatsDrawer.value = false
  map.setView([stop.latitude, stop.longitude], 16)
  
  // Find marker popup if exists
  const existingMarker = dailyStopMarkers.find(m => {
    const pos = m.getLatLng()
    return Math.abs(pos.lat - stop.latitude) < 0.0001 && Math.abs(pos.lng - stop.longitude) < 0.0001
  })
  if (existingMarker) {
    existingMarker.openPopup()
  }
}

// Format minutes helper
function formatMinutesHelper(mins?: number | null): string {
  if (!mins || mins <= 0) return '0m'
  const m = Math.round(mins)
  if (m < 60) return `${m}m`
  const hours = Math.floor(m / 60)
  const remaining = m % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

// Calculate moving percentage for visual bar
function getMovingPct(rep: any): number {
  const move = rep.moving_minutes || 0
  const stop = rep.stopped_minutes || 0
  const total = move + stop
  if (total <= 0) return 0
  return Math.round((move / total) * 100)
}

// Calculate stopped percentage for visual bar
function getStoppedPct(rep: any): number {
  const move = rep.moving_minutes || 0
  const stop = rep.stopped_minutes || 0
  const total = move + stop
  if (total <= 0) return 0
  return Math.max(0, 100 - getMovingPct(rep))
}
</script>

<style scoped>
/* Animated layouts slide animations */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
.animate-slide-left {
  animation: slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.plan-pulse {
  position: relative;
}
.plan-pulse::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #6366f1;
  animation: pulse 1.8s infinite;
  opacity: 0;
}
@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}
</style>
