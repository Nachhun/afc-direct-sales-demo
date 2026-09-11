<template>
  <div class="space-y-6 animate-fade-in pb-12">
    <!-- Top Header & Live Radar -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
      <div class="flex items-center gap-4">
        <div class="relative flex items-center justify-center">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Icon name="heroicons:shield-check" class="w-7 h-7" />
          </div>
          <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
          </span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="page-title text-2xl sm:text-3xl">Threat Defense & System Monitor</h1>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Shield Active
            </span>
          </div>
          <p class="text-slate-500 text-xs sm:text-sm mt-0.5">Real-time intrusion detection, attacker scan interception, and automated firewall blacklist.</p>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- View Mode Switcher -->
        <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button 
            type="button"
            @click="switchViewMode('table')" 
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'"
            title="Standard Enterprise Table View"
          >
            <Icon name="heroicons:table-cells" class="w-4 h-4 text-slate-600" />
            <span>Table</span>
          </button>
          <button 
            type="button"
            @click="switchViewMode('terminal')" 
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="viewMode === 'terminal' ? 'bg-slate-950 text-emerald-400 shadow-xs border border-emerald-500/40' : 'text-slate-500 hover:text-slate-900'"
            title="Cyber SOC Hacker Terminal View"
          >
            <Icon name="heroicons:command-line" class="w-4 h-4 text-emerald-500" />
            <span class="flex items-center gap-1">
              <span>night Mode</span>
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
          </button>
          <button 
            type="button"
            @click="switchViewMode('map')" 
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            :class="viewMode === 'map' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'"
            title="Global Threat & Attacker World Map"
          >
            <Icon name="heroicons:globe-americas" class="w-4 h-4" :class="viewMode === 'map' ? 'text-white' : 'text-blue-500'" />
            <span class="flex items-center gap-1">
              <span>Threat Map</span>
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
            </span>
          </button>
        </div>

        <!-- Live Polling Toggle -->
        <button 
          @click="toggleLiveStream" 
          class="px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          :class="isLiveStreamActive ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'"
          title="Toggle 10-second automatic feed refresh"
        >
          <span class="w-2 h-2 rounded-full" :class="isLiveStreamActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'"></span>
          <span>Live Radar: {{ isLiveStreamActive ? 'ON (10s)' : 'PAUSED' }}</span>
        </button>

        <button 
          @click="showShieldConfig = !showShieldConfig" 
          class="px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
          :class="showShieldConfig ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'"
        >
          <Icon name="heroicons:adjustments-horizontal" class="w-4 h-4 text-blue-600" />
          <span>Auto-Ban Policy</span>
        </button>

        <button 
          @click="sendTestAlert" 
          :disabled="testingAlert"
          class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
          title="Send a verification ping to the Telegram bot"
        >
          <Icon v-if="testingAlert" name="heroicons:arrow-path" class="w-4 h-4 animate-spin text-blue-600" />
          <Icon v-else name="heroicons:paper-airplane" class="w-4 h-4 text-blue-600" />
          <span>Test Alert</span>
        </button>

        <button 
          @click="refreshData" 
          :disabled="loading"
          class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Icon name="heroicons:arrow-path" class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- AUTO-BLOCK & CATCH POLICY DRAWER / PANEL -->
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="showShieldConfig" class="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-slate-700 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h3 class="text-base font-black uppercase tracking-wider text-white">Automated Catch & Ban Policy</h3>
            </div>
            <p class="text-slate-300 text-xs mt-0.5">Configure how aggressively the system automatically catches attacker scanners and enforces IP bans.</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-slate-300">Auto-Ban Engine:</span>
            <button 
              type="button" 
              @click="shieldSettings.auto_block_enabled = !shieldSettings.auto_block_enabled" 
              class="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="shieldSettings.auto_block_enabled ? 'bg-emerald-500' : 'bg-slate-600'"
            >
              <span 
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                :class="shieldSettings.auto_block_enabled ? 'translate-x-6' : 'translate-x-0'"
              />
            </button>
            <span class="text-xs font-black uppercase" :class="shieldSettings.auto_block_enabled ? 'text-emerald-400' : 'text-slate-400'">
              {{ shieldSettings.auto_block_enabled ? 'ENABLED' : 'DISABLED' }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- Threshold -->
          <div class="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <label class="font-black uppercase tracking-wider text-slate-300 block mb-1">Sensitivity / Trigger Threshold</label>
            <p class="text-[11px] text-slate-400 mb-2">Ban IP after how many detected attack violations:</p>
            <select v-model.number="shieldSettings.auto_block_threshold" class="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-400">
              <option :value="1">⚡ Immediate Ban (1st Violation - Most Secure)</option>
              <option :value="2">🛡️ Standard Protection (2 Violations - Recommended)</option>
              <option :value="3">⚠️ Moderate (3 Violations)</option>
              <option :value="5">🔍 High Tolerance (5 Violations)</option>
            </select>
          </div>

          <!-- Duration -->
          <div class="bg-white/5 border border-white/10 p-4 rounded-2xl">
            <label class="font-black uppercase tracking-wider text-slate-300 block mb-1">Ban Duration</label>
            <p class="text-[11px] text-slate-400 mb-2">How long restricted attackers remain locked out:</p>
            <select v-model.number="shieldSettings.auto_block_duration" class="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-400">
              <option :value="24">24 Hours (1 Day)</option>
              <option :value="72">72 Hours (3 Days)</option>
              <option :value="168">7 Days (1 Week)</option>
              <option :value="720">30 Days (1 Month)</option>
              <option :value="0">🔒 Permanent Ban</option>
            </select>
          </div>

          <!-- Save Button -->
          <div class="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <label class="font-black uppercase tracking-wider text-slate-300 block mb-1">Telegram Instant Alerts</label>
              <p class="text-[11px] text-slate-400">Attacker IP, user agent, target URL and payload snippet are dispatched immediately.</p>
            </div>
            <button 
              @click="saveShieldSettings" 
              :disabled="savingSettings"
              class="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Icon v-if="savingSettings" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <Icon v-else name="heroicons:check" class="w-4 h-4" />
              <span>Save Policy</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- KPI Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Attacks Intercepted -->
      <div class="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs relative overflow-hidden group">
        <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon name="heroicons:shield-exclamation" class="w-20 h-20 text-rose-600" />
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attacks Intercepted</p>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl sm:text-3xl font-black text-rose-600">{{ stats.threats_blocked_total || 0 }}</h3>
          <span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">403 Blocked</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-2">SQLi, Traversal, Scanner probes</p>
      </div>

      <!-- Banned IPs -->
      <div class="bg-white p-5 rounded-3xl border border-purple-100 shadow-xs relative overflow-hidden group">
        <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon name="heroicons:no-symbol" class="w-20 h-20 text-purple-600" />
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Firewall Bans</p>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl sm:text-3xl font-black text-purple-700">{{ stats.active_blocked_ips || 0 }}</h3>
          <span class="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">Blacklisted</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-2">Restricted from all endpoints</p>
      </div>

      <!-- Errors Today -->
      <div class="bg-white p-5 rounded-3xl border border-amber-100 shadow-xs relative overflow-hidden group">
        <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon name="heroicons:exclamation-triangle" class="w-20 h-20 text-amber-600" />
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Errors Today</p>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl sm:text-3xl font-black text-amber-600">{{ stats.errors_today || 0 }}</h3>
          <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Past 24h</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-2">Backend exceptions captured</p>
      </div>

      <!-- Unresolved Issues -->
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden group">
        <div class="absolute -right-3 -bottom-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon name="heroicons:bell-alert" class="w-20 h-20 text-slate-600" />
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Open Incidents</p>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl sm:text-3xl font-black text-slate-900">{{ stats.unresolved_count || 0 }}</h3>
          <span class="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Requires Review</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-2">Unresolved error & threat logs</p>
      </div>
    </div>

    <!-- IP Restricted Emergency Self-Unlock Banner -->
    <div v-if="isIpRestricted" class="p-4 rounded-2xl bg-rose-600 text-white border border-rose-700 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-lg animate-pulse">
      <div class="flex items-center gap-2.5">
        <Icon name="heroicons:shield-exclamation" class="w-6 h-6 text-white shrink-0" />
        <div>
          <span class="font-black tracking-wide block">FIREWALL RESTRICTION DETECTED: Your IP address was restricted due to automated testing.</span>
          <span class="text-rose-100 text-[11px] font-medium">Click the button below to immediately unban your IP address from the firewall.</span>
        </div>
      </div>
      <button 
        @click="emergencyUnblockSelf"
        :disabled="unblockingIp"
        class="px-4 py-2 rounded-xl bg-white text-rose-700 hover:bg-rose-50 text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0 disabled:opacity-50"
      >
        <Icon name="heroicons:lock-open" class="w-4 h-4" :class="{ 'animate-spin': unblockingIp }" />
        <span>{{ unblockingIp ? 'Unblocking IP...' : '⚡ Unblock My IP Now' }}</span>
      </button>
    </div>

    <!-- Notification Banner -->
    <div v-if="bannerMessage" :class="bannerSuccess ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'" class="p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-xs">
      <div class="flex items-center gap-2">
        <Icon :name="bannerSuccess ? 'heroicons:check-circle' : 'heroicons:exclamation-circle'" class="w-5 h-5" />
        <span>{{ bannerMessage }}</span>
      </div>
      <button @click="bannerMessage = ''" class="text-slate-400 hover:text-slate-700">
        <Icon name="heroicons:x-mark" class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation Tabs & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
      <div class="flex flex-wrap items-center gap-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
          :class="activeTab === tab.id ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'"
        >
          <Icon :name="tab.icon" class="w-4 h-4" />
          <span>{{ tab.name }}</span>
          <span v-if="tab.badge" class="px-1.5 py-0.5 text-[9px] rounded-full" :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'">
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button 
          v-if="activeTab !== 'blocked_ips'"
          @click="resolveAllLogs"
          class="text-xs font-bold text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          title="Mark matching logs as resolved"
        >
          <Icon name="heroicons:check-badge" class="w-4 h-4" />
          <span>Resolve All</span>
        </button>

        <button 
          v-if="activeTab === 'blocked_ips'"
          @click="openBlockIpModal()"
          class="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Icon name="heroicons:plus" class="w-4 h-4" />
          <span>Add Firewall Ban</span>
        </button>

        <button 
          @click="showClearModal = true" 
          class="text-xs font-bold text-slate-500 hover:text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          title="Prune old resolved events"
        >
          <Icon name="heroicons:trash" class="w-4 h-4" />
          <span>Prune</span>
        </button>
      </div>
    </div>

    <!-- TAB: LOGS STREAM (All Events, Security & Attacks, System Errors) -->
    <div v-if="activeTab !== 'blocked_ips'" class="space-y-4">
      <!-- Search & Filters -->
      <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex-1 min-w-[240px] relative">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            v-model="filters.search" 
            @input="debounceSearch"
            type="text" 
            placeholder="Search by attacker IP, URL, exploit payload, or exception class..." 
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Status Filter -->
          <select 
            v-model="filters.status" 
            @change="fetchLogs(1)"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="unresolved">Unresolved</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>

          <!-- Level Filter (only if 'all' tab) -->
          <select 
            v-if="activeTab === 'all'"
            v-model="filters.level" 
            @change="fetchLogs(1)"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Severities</option>
            <option value="security">Security Attack / Probe</option>
            <option value="critical">Critical</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
          </select>

          <!-- Category Filter -->
          <select 
            v-model="filters.category" 
            @change="fetchLogs(1)"
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Vectors</option>
            <option value="security_scan">Vulnerability Scanner Probe</option>
            <option value="sql_injection">SQL / Command Injection</option>
            <option value="path_traversal">Directory Traversal</option>
            <option value="exception">Backend Exception</option>
          </select>

          <!-- Date Filter -->
          <input 
            v-model="filters.date" 
            @change="fetchLogs(1)"
            type="date" 
            class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
          />

          <button 
            v-if="filters.search || filters.status || filters.level || filters.category || filters.date"
            @click="clearFilters"
            class="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- VIEW 1: STANDARD TABLE VIEW -->
      <div v-if="viewMode === 'table'" class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs animate-fade-in">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50">
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Threat Level</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Target & Vector</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden md:table-cell">Attacker IP</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:table-cell">Time</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Defense Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loading && logs.length === 0" class="text-center">
                <td colspan="6" class="py-14 text-slate-400 text-xs font-bold">
                  <Icon name="heroicons:arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                  Scanning and loading audit stream...
                </td>
              </tr>
              <tr v-else-if="logs.length === 0" class="text-center">
                <td colspan="6" class="py-16 text-slate-400 text-xs font-bold">
                  <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-3 border border-emerald-100">
                    <Icon name="heroicons:shield-check" class="w-8 h-8" />
                  </div>
                  <p class="text-sm font-black text-slate-800">System is Secured</p>
                  <p class="text-slate-400 font-normal mt-1">No security violations or unhandled exceptions recorded for this filter.</p>
                </td>
              </tr>
              <tr v-for="log in logs" :key="log.id" class="hover:bg-slate-50/80 transition-colors group">
                <!-- Severity & Category -->
                <td class="px-5 py-4 whitespace-nowrap">
                  <div class="flex flex-col gap-1 items-start">
                    <span 
                      :class="levelBadgeClass(log.level)"
                      class="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border flex items-center gap-1"
                    >
                      <span v-if="log.level === 'security'" class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      {{ log.level }}
                    </span>
                    <span v-if="log.category" class="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {{ formatCategory(log.category) }}
                    </span>
                  </div>
                </td>

                <!-- Target URL & Message -->
                <td class="px-5 py-4 min-w-[280px]">
                  <div class="flex items-center gap-2 mb-1">
                    <span 
                      v-if="log.method"
                      :class="methodBadgeClass(log.method)"
                      class="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                    >
                      {{ log.method }}
                    </span>
                    <span class="text-xs font-bold text-slate-900 truncate max-w-xs font-mono" :title="log.url">
                      {{ log.url || 'Internal / CLI' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 line-clamp-1 group-hover:line-clamp-none transition-all">
                    {{ log.message }}
                  </p>
                </td>

                <!-- IP Address & User -->
                <td class="px-5 py-4 whitespace-nowrap hidden md:table-cell">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-800">
                      <span>{{ log.ip_address || 'N/A' }}</span>
                      <button 
                        v-if="log.ip_address"
                        type="button"
                        @click.stop="openIpMap(log.ip_address)"
                        class="p-0.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View IP on Geolocation Map"
                      >
                        <Icon name="heroicons:map-pin" class="w-3.5 h-3.5 text-blue-500" />
                      </button>
                      <span v-if="isIpBlocked(log.ip_address)" class="px-1.5 py-0.2 rounded text-[8px] font-black bg-purple-100 text-purple-800 border border-purple-200">
                        BANNED
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-400 mt-0.5">
                      {{ log.user ? log.user.name : 'Unauthenticated Guest' }}
                    </span>
                  </div>
                </td>

                <!-- Time -->
                <td class="px-5 py-4 whitespace-nowrap text-xs text-slate-500 hidden sm:table-cell">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-700">{{ formatRelativeTime(log.created_at) }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ formatDate(log.created_at) }}</span>
                  </div>
                </td>

                <!-- Status Select -->
                <td class="px-5 py-4 whitespace-nowrap">
                  <select 
                    :value="log.status" 
                    @change="updateLogStatus(log, ($event.target as HTMLSelectElement).value)"
                    class="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border focus:outline-none transition-colors"
                    :class="statusSelectClass(log.status)"
                  >
                    <option value="unresolved">Unresolved</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="ignored">Ignored</option>
                  </select>
                </td>

                <!-- Defense Actions -->
                <td class="px-5 py-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button 
                      v-if="log.ip_address && !isIpBlocked(log.ip_address)"
                      @click="catchAndBan(log.ip_address, log.message)"
                      class="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1"
                      title="Catch & Ban this attacker IP immediately"
                    >
                      <Icon name="heroicons:bolt" class="w-3.5 h-3.5" />
                      <span>Catch & Ban</span>
                    </button>

                    <button 
                      @click="inspectLog(log)" 
                      class="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1"
                    >
                      <Icon name="heroicons:eye" class="w-3.5 h-3.5 text-slate-400" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Pagination -->
        <div v-if="pagination.total > pagination.per_page" class="p-4 border-t border-slate-100 flex items-center justify-between">
          <p class="text-xs text-slate-500 font-medium">
            Showing <span class="font-bold text-slate-800">{{ pagination.from }}</span> to <span class="font-bold text-slate-800">{{ pagination.to }}</span> of <span class="font-bold text-slate-800">{{ pagination.total }}</span> events
          </p>
          <div class="flex items-center gap-2">
            <button 
              @click="fetchLogs(pagination.current_page - 1)" 
              :disabled="pagination.current_page <= 1"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <span class="text-xs font-black text-slate-700 px-2">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
            <button 
              @click="fetchLogs(pagination.current_page + 1)" 
              :disabled="pagination.current_page >= pagination.last_page"
              class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- VIEW 2: CYBER SOC HACKER TERMINAL CONSOLE -->
      <div v-else-if="viewMode === 'terminal'" class="rounded-3xl overflow-hidden border border-emerald-500/30 bg-[#030712] shadow-2xl shadow-emerald-950/40 text-emerald-400 font-mono text-xs relative select-text animate-fade-in">
        <!-- Scanline / Matrix Glow Overlay -->
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent bg-[length:100%_4px] opacity-60"></div>

        <!-- Terminal Top Bar -->
        <div class="bg-slate-900/90 border-b border-emerald-500/20 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
          <!-- Window Controls & Title -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600 inline-block shadow-xs shadow-rose-500/50"></span>
              <span class="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600 inline-block"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600 inline-block shadow-xs shadow-emerald-500/50"></span>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-slate-300 font-bold">
              <span class="text-emerald-400">root@afc-waf-matrix</span>
              <span class="text-slate-500">:</span>
              <span class="text-cyan-400">~/soc/threat-stream.log</span>
              <span class="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[9px] font-black tracking-wider border border-emerald-700/60 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE RADAR
              </span>
            </div>
          </div>

          <!-- Terminal Controls -->
          <div class="flex items-center gap-2 text-[11px]">
            <button 
              type="button"
              @click="terminalExpandPayloads = !terminalExpandPayloads" 
              class="px-2.5 py-1 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors flex items-center gap-1.5 cursor-pointer"
              :class="terminalExpandPayloads ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/60' : 'text-slate-400 hover:text-slate-200'"
            >
              <Icon name="heroicons:code-bracket" class="w-3.5 h-3.5" />
              <span>{{ terminalExpandPayloads ? 'Collapse Raw Payload' : 'Expand Raw Payload' }}</span>
            </button>

            <button 
              type="button"
              @click="copyAllTerminalLogs" 
              class="px-2.5 py-1 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Icon name="heroicons:clipboard-document" class="w-3.5 h-3.5" />
              <span>{{ terminalCopied ? 'Copied Feed!' : 'Copy Stream' }}</span>
            </button>

            <button 
              type="button"
              @click="switchViewMode('table')" 
              class="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Return to standard table view"
            >
              <Icon name="heroicons:table-cells" class="w-3.5 h-3.5" />
              <span>Exit Terminal</span>
            </button>
          </div>
        </div>

        <!-- Terminal Live Status Ticker -->
        <div class="bg-black/80 border-b border-emerald-500/15 px-4 sm:px-5 py-2.5 text-[10px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-4 flex-wrap">
            <span class="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              SHIELD DEFENSE: ACTIVE
            </span>
            <span>ATTACKS CAUGHT: <strong class="text-rose-400">{{ stats.threats_blocked_total || 0 }}</strong></span>
            <span>FIREWALL BANS: <strong class="text-purple-400">{{ stats.active_blocked_ips || 0 }}</strong></span>
            <span>EVENTS IN BUFFER: <strong class="text-slate-200">{{ logs.length }}</strong></span>
            <span>POLL CADENCE: <strong class="text-cyan-400">10s RECURRENT</strong></span>
          </div>
          <div class="text-[10px] text-slate-400 font-mono hidden md:block">
            CLICK ANY PACKET TO DEEP-INSPECT FULL PAYLOAD & STACKTRACE
          </div>
        </div>

        <!-- Terminal Log Body -->
        <div class="p-4 sm:p-5 max-h-[720px] overflow-y-auto space-y-3 custom-scrollbar text-[11px] leading-relaxed">
          <!-- ASCII Cyber Banner -->
          <div class="text-emerald-500/80 select-none pb-2 text-[9px] sm:text-[10px] font-mono leading-none overflow-x-auto">
<pre>
   ██████╗██╗   ██╗██████╗ ███████╗██████╗     ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗     
  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗    ██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║     
  ██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝    ███████╗█████╗  ██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║     
  ██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗    ╚════██║██╔══╝  ██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║     
  ╚██████╗   ██║   ██████╔╝███████╗██║  ██║    ███████║███████╗██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
   ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝    ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
  AFC DIRECT SALES — REALTIME CYBER INTRUSION & ZERO-DAY SURVEILLANCE CONSOLE [ACTIVE]
</pre>
          </div>

          <!-- Empty State in Terminal -->
          <div v-if="logs.length === 0" class="py-12 text-center text-slate-500">
            <p class="text-emerald-400 font-bold text-sm">[STATUS: RADAR CLEAN] No security violations recorded.</p>
            <p class="text-[11px] text-slate-500 mt-1">Listening on interface /api/* for inbound threat signatures...</p>
          </div>

          <!-- Packet Log Lines -->
          <div 
            v-for="(log, idx) in logs" 
            :key="log.id"
            @click="inspectLog(log)"
            class="p-4 rounded-2xl border transition-all duration-200 cursor-pointer group relative overflow-hidden backdrop-blur-xs"
            :class="terminalLogItemClass(log)"
          >
            <!-- Packet Header -->
            <div class="flex flex-wrap items-center justify-between gap-2 font-mono">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-slate-500 font-bold">#{{ logs.length - idx }}</span>
                <span class="text-slate-400 font-bold">[{{ formatTerminalDate(log.created_at) }}]</span>
                
                <!-- Badge Level -->
                <span 
                  class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border"
                  :class="terminalLevelBadgeClass(log.level)"
                >
                  {{ log.level }}
                </span>

                <span v-if="log.category" class="px-1.5 py-0.5 rounded text-[9px] font-bold border border-slate-700 bg-slate-800/90 text-cyan-300">
                  {{ formatCategory(log.category) }}
                </span>

                <!-- Intercept Code -->
                <span v-if="log.level === 'security'" class="text-rose-400 font-black tracking-wide flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  [403 SECURITY_INTERCEPT]
                </span>
                <span v-else-if="log.level === 'error'" class="text-amber-400 font-black tracking-wide">
                  [SYSTEM EXCEPTION]
                </span>
              </div>

              <!-- Attacker IP & Location -->
              <div class="flex items-center gap-2 text-[10px]">
                <span class="text-slate-500">SRC_IP:</span>
                <span class="text-rose-300 font-black bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-700/60 shadow-xs">
                  {{ log.ip_address || 'UNKNOWN' }}
                </span>
                <button 
                  v-if="log.ip_address"
                  type="button"
                  @click.stop="openIpMap(log.ip_address)"
                  class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950/80 text-blue-300 border border-blue-600/60 hover:bg-blue-900 transition-colors flex items-center gap-1 cursor-pointer"
                  title="View IP on Geolocation Map"
                >
                  <Icon name="heroicons:map-pin" class="w-3 h-3 text-blue-400" />
                  <span>GEO MAP</span>
                </button>
                <span v-if="isIpBlocked(log.ip_address)" class="px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-900 text-purple-200 border border-purple-400 animate-pulse">
                  BANNED
                </span>
              </div>
            </div>

            <!-- Target URL & Threat Vector Details -->
            <div class="mt-2.5 text-slate-200 font-mono space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-emerald-400 font-bold">TARGET:</span>
                <span v-if="log.method" class="px-1.5 py-0.2 rounded text-[9px] font-black bg-slate-800 text-cyan-300 border border-slate-700">
                  {{ log.method }}
                </span>
                <span class="text-cyan-300 font-bold underline decoration-slate-700 decoration-dotted underline-offset-2 break-all">
                  {{ log.url || 'Internal / CLI' }}
                </span>
              </div>

              <!-- Message / Exploit Signature -->
              <div class="text-xs text-slate-200 font-sans flex items-start gap-1.5 pt-0.5">
                <span class="text-rose-400 font-mono font-bold">►</span>
                <span class="font-medium">{{ log.message }}</span>
              </div>
            </div>

            <!-- Exploded Payload Tree View -->
            <div v-if="terminalExpandPayloads && log.payload" class="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 bg-black/60 p-3 rounded-xl border border-slate-800">
              <div class="text-emerald-400 font-bold mb-1 flex items-center justify-between">
                <span>// RAW INCOMING PAYLOAD BUFFER:</span>
                <span class="text-[9px] text-slate-500">INTERCEPTED SIGNATURE</span>
              </div>
              <pre class="text-rose-300 whitespace-pre-wrap break-all max-h-36 overflow-y-auto custom-scrollbar font-mono leading-relaxed">{{ formatTerminalPayload(log.payload) }}</pre>
            </div>

            <!-- Quick Action Controls bar -->
            <div class="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <div class="flex items-center gap-3">
                <span>STATUS: <strong :class="log.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'">{{ log.status?.toUpperCase() }}</strong></span>
                <span class="text-slate-800">|</span>
                <span>AGENT: <span class="text-slate-400">{{ log.user_agent ? (log.user_agent.length > 50 ? log.user_agent.substring(0, 50) + '...' : log.user_agent) : 'Unknown' }}</span></span>
              </div>
              
              <div class="flex items-center gap-2">
                <button 
                  v-if="log.ip_address && !isIpBlocked(log.ip_address)"
                  @click.stop="catchAndBan(log.ip_address, log.message)"
                  class="px-2.5 py-1 rounded-lg bg-rose-600/40 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/60 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Icon name="heroicons:bolt" class="w-3 h-3" />
                  <span>⚡ Catch & Ban</span>
                </button>
                <button 
                  @click.stop="inspectLog(log)"
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="heroicons:eye" class="w-3 h-3 text-slate-400" />
                  <span>Inspect Packet</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Blinking Cursor Terminal Prompt -->
          <div class="pt-4 flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <span class="text-emerald-500 font-bold">root@afc-shield:~$</span>
            <span class="text-slate-400 text-[11px]">monitoring live attack stream across 14 security vectors</span>
            <span class="inline-block w-2 h-4 bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        <!-- Terminal Footer Pagination Bar -->
        <div v-if="pagination.total > pagination.per_page" class="bg-slate-900/90 border-t border-emerald-500/20 px-4 sm:px-5 py-3 flex items-center justify-between text-slate-400 text-xs">
          <div>
            <span>PACKETS: <strong class="text-emerald-400">{{ pagination.from }}</strong> TO <strong class="text-emerald-400">{{ pagination.to }}</strong> OF <strong class="text-white">{{ pagination.total }}</strong></span>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="fetchLogs(pagination.current_page - 1)" 
              :disabled="pagination.current_page <= 1"
              class="px-3 py-1 rounded-lg border border-slate-700 bg-black/40 text-xs font-bold text-slate-300 disabled:opacity-40 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              &lt;&lt; PREV
            </button>
            <span class="text-xs font-black text-emerald-400 px-2 font-mono">[{{ pagination.current_page }} / {{ pagination.last_page }}]</span>
            <button 
              @click="fetchLogs(pagination.current_page + 1)" 
              :disabled="pagination.current_page >= pagination.last_page"
              class="px-3 py-1 rounded-lg border border-slate-700 bg-black/40 text-xs font-bold text-slate-300 disabled:opacity-40 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              NEXT &gt;&gt;
            </button>
          </div>
        </div>
      </div>

      <!-- VIEW 3: GLOBAL THREAT MAP VIEW -->
      <div v-else-if="viewMode === 'map'" class="space-y-4 animate-fade-in">
        <!-- Threat Map Header Stats -->
        <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h3 class="text-base font-black tracking-tight text-white uppercase font-mono flex items-center gap-2">
                <span>Global Threat Radar Map</span>
                <span class="text-xs text-rose-400 font-bold font-sans">({{ threatMapData?.total_threat_ips || 0 }} Origin Nodes Plotted)</span>
              </h3>
            </div>
            <p class="text-xs text-slate-400">
              Live geographic positioning of detected vulnerability scanners, probes, and banned attacker IPs.
            </p>
          </div>

          <!-- Top Attacker Countries -->
          <div v-if="threatMapData?.top_countries && Object.keys(threatMapData.top_countries).length > 0" class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px] font-mono text-slate-400 uppercase">Top Origins:</span>
            <span 
              v-for="(count, country) in threatMapData.top_countries" 
              :key="country"
              class="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-[11px] font-bold text-slate-200 flex items-center gap-1 shadow-xs"
            >
              <span>{{ country }}</span>
              <span class="px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">{{ count }}</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              type="button" 
              @click="fetchThreatMapData" 
              :disabled="threatMapLoading"
              class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" :class="{ 'animate-spin': threatMapLoading }" />
              <span>Refresh Map</span>
            </button>
          </div>
        </div>

        <!-- Leaflet World Map Container -->
        <div class="relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-[#030712] shadow-2xl">
          <div v-if="threatMapLoading && !worldMapInstance" class="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-slate-300">
            <div class="flex items-center gap-2 text-xs font-mono">
              <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin text-blue-400" />
              <span>Plotting Attacker Coordinates...</span>
            </div>
          </div>
          <div ref="threatMapContainerRef" class="h-[520px] sm:h-[580px] w-full z-0"></div>

          <!-- Bottom Legend Bar -->
          <div class="absolute bottom-4 left-4 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl flex items-center gap-4 text-xs font-mono shadow-xl text-white">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span class="text-rose-400 font-bold">Firewall Banned IP</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span class="text-amber-300 font-bold">Monitored Scanner</span>
            </div>
            <span class="text-slate-500 text-[10px] hidden sm:inline">| Click any beacon to inspect</span>
          </div>
        </div>

        <!-- Mapped Threat IPs Cards -->
        <div v-if="threatMapData?.markers && threatMapData.markers.length > 0" class="space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-500 px-1">
            <span class="font-bold uppercase tracking-wider text-[10px]">Detected Attack Origins:</span>
            <span>Click any card to inspect full IP intelligence</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div 
              v-for="marker in threatMapData.markers.slice(0, 8)" 
              :key="marker.ip"
              @click="openIpMap(marker.ip)"
              class="bg-white hover:bg-slate-50 border border-slate-200 p-3 rounded-2xl transition-all cursor-pointer shadow-2xs hover:shadow-xs group"
            >
              <div class="flex items-center justify-between gap-2 mb-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-base">{{ marker.flag }}</span>
                  <span class="font-mono text-xs font-black text-slate-800 group-hover:text-blue-600 transition-colors">{{ marker.ip }}</span>
                </div>
                <span 
                  class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider"
                  :class="marker.is_blocked ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'"
                >
                  {{ marker.is_blocked ? 'BANNED' : 'MONITORED' }}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 truncate">
                {{ marker.city ? marker.city + ', ' : '' }}{{ marker.country }}
              </div>
              <div class="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                {{ marker.org || marker.isp || 'Cloud Host' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: BANNED IPS & FIREWALL RULES -->
    <div v-if="activeTab === 'blocked_ips'" class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-black text-slate-900">Firewall IP Blacklist</h3>
            <p class="text-xs text-slate-400">All inbound HTTP/API requests from these IP addresses are terminated with 403 Forbidden.</p>
          </div>
          <button 
            @click="openBlockIpModal()"
            class="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Icon name="heroicons:plus" class="w-4 h-4" />
            <span>Add Manual IP Ban</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50">
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Restricted IP</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Interception Reason</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Ban Policy</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Banned At</th>
                <th class="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="blockedIpsList.length === 0" class="text-center">
                <td colspan="5" class="py-16 text-slate-400 text-xs font-bold">
                  <div class="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 mx-auto mb-3">
                    <Icon name="heroicons:shield-check" class="w-6 h-6" />
                  </div>
                  Firewall blacklist is empty. No IP addresses are currently banned.
                </td>
              </tr>
              <tr v-for="ip in blockedIpsList" :key="ip.id" class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <span class="font-mono text-xs font-bold text-slate-900">{{ ip.ip_address }}</span>
                    <button 
                      type="button"
                      @click.stop="openIpMap(ip.ip_address)"
                      class="p-0.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="View IP on Geolocation Map"
                    >
                      <Icon name="heroicons:map-pin" class="w-3.5 h-3.5 text-blue-500" />
                    </button>
                  </div>
                </td>
                <td class="px-5 py-4 text-xs text-slate-700 font-medium">
                  {{ ip.reason }}
                </td>
                <td class="px-5 py-4 whitespace-nowrap text-xs font-bold">
                  <span v-if="!ip.blocked_until" class="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 uppercase text-[10px]">
                    Permanent Ban
                  </span>
                  <span v-else class="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                    Until {{ formatDate(ip.blocked_until) }}
                  </span>
                </td>
                <td class="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                  {{ formatDate(ip.created_at) }}
                </td>
                <td class="px-5 py-4 text-right whitespace-nowrap">
                  <button 
                    @click="unblockIp(ip.id)"
                    class="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                  >
                    <Icon name="heroicons:lock-open" class="w-3.5 h-3.5" />
                    <span>Unban IP</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    <!-- INSPECTION MODAL -->
    <Teleport to="body">
      <div v-if="selectedLog" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-4xl p-6 sm:p-8 rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="flex items-start justify-between pb-4 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2 mb-1.5">
                <span :class="levelBadgeClass(selectedLog.level)" class="px-2.5 py-0.5 rounded text-[9px] font-black uppercase border">
                  {{ selectedLog.level }}
                </span>
                <span class="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded border">
                  {{ selectedLog.category }}
                </span>
                <span class="text-xs text-slate-400 font-medium">Log #{{ selectedLog.id }}</span>
              </div>
              <h3 class="text-lg font-black text-slate-900 leading-snug">{{ selectedLog.message }}</h3>
            </div>
            <button @click="selectedLog = null" class="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto custom-scrollbar py-5 space-y-5">
            <!-- Metadata Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Target URL</span>
                <span class="font-mono text-slate-800 break-all font-bold">{{ selectedLog.method }} {{ selectedLog.url }}</span>
              </div>
              <div>
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Client IP</span>
                <div class="flex items-center gap-1.5 font-mono text-slate-800 font-bold">
                  <span>{{ selectedLog.ip_address || 'N/A' }}</span>
                  <button 
                    v-if="selectedLog.ip_address"
                    type="button"
                    @click="openIpMap(selectedLog.ip_address)"
                    class="p-0.5 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View IP on Geolocation Map"
                  >
                    <Icon name="heroicons:map-pin" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">User Identity</span>
                <span class="text-slate-800 font-bold">{{ selectedLog.user ? selectedLog.user.name : 'Guest' }}</span>
              </div>
              <div>
                <span class="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">Timestamp</span>
                <span class="text-slate-800 font-bold">{{ formatDate(selectedLog.created_at) }}</span>
              </div>
            </div>

            <!-- Exception / Error File -->
            <div v-if="selectedLog.file" class="bg-rose-50/70 border border-rose-100 p-4 rounded-2xl text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-wider text-rose-600">Exception File & Line</span>
                <span class="font-mono text-[11px] font-bold text-rose-700">{{ selectedLog.exception_class }}</span>
              </div>
              <p class="font-mono text-rose-900 break-all">{{ selectedLog.file }}:{{ selectedLog.line }}</p>
            </div>

            <!-- User Agent -->
            <div v-if="selectedLog.user_agent" class="text-xs">
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">User-Agent Header</span>
              <p class="font-mono text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 break-all">
                {{ selectedLog.user_agent }}
              </p>
            </div>

            <!-- Payload / Offending Snippet -->
            <div v-if="selectedLog.payload" class="space-y-1">
              <span class="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Threat Payload / Request Context</span>
              <pre class="bg-slate-900 text-slate-100 p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-48 custom-scrollbar">{{ JSON.stringify(selectedLog.payload, null, 2) }}</pre>
            </div>

            <!-- Stack Trace -->
            <div v-if="selectedLog.trace" class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Stack Trace</span>
                <button 
                  @click="copyTrace"
                  class="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Icon name="heroicons:clipboard-document" class="w-3.5 h-3.5" />
                  <span>{{ copied ? 'Copied!' : 'Copy Trace' }}</span>
                </button>
              </div>
              <pre class="bg-slate-900 text-rose-300 p-4 rounded-2xl text-[10px] font-mono overflow-x-auto max-h-64 custom-scrollbar whitespace-pre-wrap">{{ selectedLog.trace }}</pre>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <button 
                v-if="selectedLog.ip_address"
                type="button"
                @click="openIpMap(selectedLog.ip_address)"
                class="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border border-blue-200 shadow-2xs"
              >
                <Icon name="heroicons:globe-americas" class="w-4 h-4 text-blue-600" />
                <span>View on Map</span>
              </button>
              <button 
                v-if="selectedLog.ip_address && !isIpBlocked(selectedLog.ip_address)"
                @click="catchAndBan(selectedLog.ip_address, selectedLog.message)"
                class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Icon name="heroicons:bolt" class="w-4 h-4" />
                <span>Catch & Ban ({{ selectedLog.ip_address }})</span>
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button 
                v-if="selectedLog.status !== 'resolved'"
                @click="updateLogStatus(selectedLog, 'resolved')"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Icon name="heroicons:check" class="w-4 h-4" />
                <span>Mark as Resolved</span>
              </button>
              <button 
                @click="selectedLog = null" 
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MANUAL BAN IP MODAL -->
    <Teleport to="body">
      <div v-if="showBlockModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative">
          <h3 class="text-lg font-black text-slate-900 mb-1">Add IP Restriction</h3>
          <p class="text-slate-500 text-xs mb-5">Restrict an attacker or scanner IP address from accessing the system.</p>

          <form @submit.prevent="submitBlockIp" class="space-y-4">
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400">IP Address</label>
              <input v-model="blockForm.ip_address" required placeholder="e.g. 192.168.1.100" class="input-field py-2 text-sm mt-1" />
            </div>

            <div>
              <label class="text-[10px] font-black uppercase text-slate-400">Reason</label>
              <input v-model="blockForm.reason" required placeholder="Malicious scanner bot / SQLi attempt" class="input-field py-2 text-sm mt-1" />
            </div>

            <div>
              <label class="text-[10px] font-black uppercase text-slate-400">Duration</label>
              <select v-model="blockForm.duration_hours" class="input-field py-2 text-sm mt-1 font-bold">
                <option :value="24">24 Hours (1 Day)</option>
                <option :value="72">72 Hours (3 Days)</option>
                <option :value="168">7 Days (1 Week)</option>
                <option :value="null">Permanent Ban</option>
              </select>
            </div>

            <div v-if="blockFormError" class="text-rose-600 text-xs font-bold leading-normal">{{ blockFormError }}</div>

            <div class="flex gap-2 justify-end pt-3">
              <button type="button" @click="showBlockModal = false" class="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">Cancel</button>
              <button type="submit" class="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs">Block IP</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- CLEAR RESOLVED LOGS MODAL -->
    <Teleport to="body">
      <div v-if="showClearModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative">
          <h3 class="text-lg font-black text-slate-900 mb-1">Prune Resolved Events</h3>
          <p class="text-slate-500 text-xs mb-5">Permanently remove resolved log events to free up database storage.</p>

          <div class="space-y-4">
            <div>
              <label class="text-[10px] font-black uppercase text-slate-400">Keep Logs From Last</label>
              <select v-model="clearDays" class="input-field py-2 text-sm mt-1 font-bold">
                <option :value="0">All Resolved Logs (Keep None)</option>
                <option :value="7">Older than 7 Days</option>
                <option :value="14">Older than 14 Days</option>
                <option :value="30">Older than 30 Days</option>
              </select>
            </div>

            <div class="flex gap-2 justify-end pt-3">
              <button type="button" @click="showClearModal = false" class="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl">Cancel</button>
              <button type="button" @click="pruneLogs" class="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs">Proceed</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- IP GEOLOCATION & THREAT INTELLIGENCE MAP MODAL -->
    <IpMapModal 
      v-model="showIpMapModal" 
      :ip="selectedMapIp" 
      @ban="onModalBanIp" 
      @unblock="onModalUnblockIp" 
      @filter="onModalFilterIp" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

definePageMeta({ layout: 'admin' })

const api = useApi()
const authStore = useAuthStore()

const loading = ref(false)
const testingAlert = ref(false)
const bannerMessage = ref('')
const bannerSuccess = ref(true)

// Emergency IP unblock state
const isIpRestricted = ref(false)
const unblockingIp = ref(false)
let autoUnblockAttempted = false

async function emergencyUnblockSelf() {
  unblockingIp.value = true
  try {
    const res = await api.get('/security/unblock-me') as any
    isIpRestricted.value = false
    bannerMessage.value = res.message || 'Your IP address has been unblocked from the firewall successfully.'
    bannerSuccess.value = true
    await refreshData()
  } catch (e: any) {
    try {
      await api.get('/security/unblock-all')
      isIpRestricted.value = false
      bannerMessage.value = 'Firewall blacklist cleared!'
      bannerSuccess.value = true
      await refreshData()
    } catch (err) {
      bannerMessage.value = 'Could not auto-unblock IP. Please refresh.'
      bannerSuccess.value = false
    }
  } finally {
    unblockingIp.value = false
  }
}

function checkRestrictedError(e: any) {
  const errMsg = String(e?.data?.error || e?.message || '')
  if (errMsg.toLowerCase().includes('restricted') || e?.status === 403) {
    isIpRestricted.value = true
    if (!autoUnblockAttempted) {
      autoUnblockAttempted = true
      emergencyUnblockSelf()
    }
  }
}

// View Mode: 'table' | 'terminal' | 'map' (Threat Map)
const viewMode = ref<'table' | 'terminal' | 'map'>('terminal')
const terminalExpandPayloads = ref(false)
const terminalCopied = ref(false)

// IP Geolocation Map Modal state
const showIpMapModal = ref(false)
const selectedMapIp = ref('')

function openIpMap(ip: string) {
  if (!ip || ip === 'N/A' || ip === 'UNKNOWN' || ip === 'Unknown') return
  selectedMapIp.value = ip
  showIpMapModal.value = true
}

function onModalBanIp(ip: string) {
  catchAndBan(ip, 'Manual Admin Ban from IP Geolocation Map')
}

function onModalUnblockIp(ip: string, blockedId?: number) {
  if (blockedId) {
    unblockIp(blockedId)
  } else {
    const record = blockedIpsList.value.find(b => b.ip_address === ip)
    if (record) {
      unblockIp(record.id)
    }
  }
}

function onModalFilterIp(ip: string) {
  filters.search = ip
  fetchLogs(1)
}

// World Threat Map state
const threatMapLoading = ref(false)
const threatMapData = ref<any>(null)
const threatMapContainerRef = ref<HTMLElement | null>(null)
let worldMapInstance: any = null
let worldMarkersGroup: any = null

function switchViewMode(mode: 'table' | 'terminal' | 'map') {
  viewMode.value = mode
  if (process.client) {
    try {
      localStorage.setItem('afc_logs_view_mode', mode)
    } catch (e) {}
  }
  if (mode === 'map') {
    fetchThreatMapData()
  }
}

async function fetchThreatMapData() {
  threatMapLoading.value = true
  try {
    const res = await api.get('/admin/system-logs/threat-map') as any
    threatMapData.value = res
    await nextTick()
    setTimeout(() => {
      if (viewMode.value === 'map') {
        initWorldMap()
      }
    }, 150)
  } catch (e) {
    console.error('Failed to fetch threat map data:', e)
  } finally {
    threatMapLoading.value = false
  }
}

async function initWorldMap() {
  if (!threatMapContainerRef.value || !threatMapData.value) return
  try {
    const LModule = await import('leaflet')
    const L = LModule.default || LModule
    await import('leaflet/dist/leaflet.css')

    if (worldMapInstance) {
      try {
        worldMapInstance.remove()
      } catch (e) {}
      worldMapInstance = null
      worldMarkersGroup = null
    }

    worldMapInstance = L.map(threatMapContainerRef.value, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: false,
    })

    // Clean Dark Theme Tiles (No API key required, zero watermarks)
    L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
    }).addTo(worldMapInstance)

    L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
    }).addTo(worldMapInstance)

    const markers = threatMapData.value.markers || []
    worldMarkersGroup = L.featureGroup().addTo(worldMapInstance)

    markers.forEach((m: any) => {
      const isBlocked = m.is_blocked
      const pulseColor = isBlocked ? 'bg-rose-500' : 'bg-amber-400'
      const pinColor = isBlocked ? 'bg-rose-600' : 'bg-amber-500'

      const customIcon = L.divIcon({
        className: 'threat-radar-icon',
        html: `
          <div class="relative flex items-center justify-center w-7 h-7 cursor-pointer">
            <span class="animate-ping absolute inline-flex h-7 w-7 rounded-full ${pulseColor} opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${pinColor} border-2 border-white shadow-lg"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      const marker = L.marker([m.lat, m.lon], { icon: customIcon }).addTo(worldMarkersGroup)

      const popupHtml = `
        <div style="font-family: inherit; font-size: 11px; color: #0f172a; min-width: 170px; padding: 4px;">
          <div style="font-weight: 800; font-size: 12px; margin-bottom: 3px; display: flex; items-center; gap: 4px;">
            <span>${m.flag || '🌐'}</span>
            <span style="font-family: monospace;">${m.ip}</span>
          </div>
          <div style="margin-bottom: 2px;"><b>Location:</b> ${m.city ? m.city + ', ' : ''}${m.country}</div>
          <div style="margin-bottom: 2px;"><b>ISP:</b> ${m.org || m.isp || 'N/A'}</div>
          <div style="margin-bottom: 4px;">
            <b>Status:</b> 
            <span style="color: ${isBlocked ? '#e11d48' : '#d97706'}; font-weight: bold;">
              ${isBlocked ? 'BANNED' : 'MONITORED'}
            </span>
            (${m.strikes || 0} strikes)
          </div>
        </div>
      `
      marker.bindPopup(popupHtml)
    })

    if (markers.length > 0) {
      try {
        worldMapInstance.fitBounds(worldMarkersGroup.getBounds().pad(0.2))
      } catch (e) {}
    }

    setTimeout(() => {
      worldMapInstance?.invalidateSize()
    }, 200)
  } catch (err) {
    console.error('Failed to init world threat map:', err)
  }
}

// Auto-Ban policy state
const showShieldConfig = ref(false)
const savingSettings = ref(false)
const shieldSettings = reactive({
  auto_block_enabled: true,
  auto_block_threshold: 2,
  auto_block_duration: 24,
})

// Live Radar stream state
const isLiveStreamActive = ref(true)
let streamInterval: any = null

const activeTab = ref<'all' | 'security' | 'exceptions' | 'blocked_ips'>('all')

const stats = reactive({
  errors_today: 0,
  threats_blocked_total: 0,
  unresolved_count: 0,
  active_blocked_ips: 0,
})

const tabs = computed(() => [
  { id: 'all' as const, name: 'Live Stream', icon: 'heroicons:squares-2x2', badge: null },
  { id: 'security' as const, name: 'Attacks & Scans', icon: 'heroicons:shield-exclamation', badge: stats.threats_blocked_total || null },
  { id: 'exceptions' as const, name: 'System Errors', icon: 'heroicons:exclamation-triangle', badge: stats.errors_today || null },
  { id: 'blocked_ips' as const, name: 'Firewall Blacklist', icon: 'heroicons:no-symbol', badge: stats.active_blocked_ips || null },
])

const logs = ref<any[]>([])
const blockedIpsList = ref<any[]>([])
const selectedLog = ref<any>(null)
const copied = ref(false)

const filters = reactive({
  search: '',
  level: '',
  category: '',
  status: '',
  date: '',
})

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0,
  from: 0,
  to: 0,
  per_page: 25,
})

// Ban IP Modal
const showBlockModal = ref(false)
const blockForm = reactive({
  ip_address: '',
  reason: '',
  duration_hours: 24 as number | null,
})
const blockFormError = ref('')

// Prune modal
const showClearModal = ref(false)
const clearDays = ref(14)

let searchTimeout: any = null
function debounceSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchLogs(1)
  }, 350)
}

watch(activeTab, () => {
  if (activeTab.value === 'blocked_ips') {
    fetchBlockedIps()
  } else {
    fetchLogs(1)
  }
})

onMounted(async () => {
  if (!authStore.isSuperAdmin && !authStore.isAdmin) {
    navigateTo('/admin')
    return
  }

  if (process.client) {
    const savedMode = localStorage.getItem('afc_logs_view_mode')
    if (savedMode === 'table' || savedMode === 'terminal' || savedMode === 'map') {
      viewMode.value = savedMode as any
    }
  }

  await Promise.all([
    fetchStats(),
    fetchShieldSettings(),
    fetchLogs(1),
    fetchBlockedIps(),
    viewMode.value === 'map' ? fetchThreatMapData() : Promise.resolve(),
  ])
  startLiveStream()
})

onUnmounted(() => {
  stopLiveStream()
  if (worldMapInstance) {
    try {
      worldMapInstance.remove()
    } catch (e) {}
    worldMapInstance = null
    worldMarkersGroup = null
  }
})

function toggleLiveStream() {
  isLiveStreamActive.value = !isLiveStreamActive.value
  if (isLiveStreamActive.value) {
    startLiveStream()
  } else {
    stopLiveStream()
  }
}

function startLiveStream() {
  stopLiveStream()
  streamInterval = setInterval(async () => {
    if (activeTab.value !== 'blocked_ips') {
      await Promise.all([fetchStats(), fetchLogs(pagination.current_page)])
    } else {
      await Promise.all([fetchStats(), fetchBlockedIps()])
    }
  }, 10000)
}

function stopLiveStream() {
  if (streamInterval) {
    clearInterval(streamInterval)
    streamInterval = null
  }
}

async function refreshData() {
  await Promise.all([
    fetchStats(),
    fetchShieldSettings(),
    activeTab.value === 'blocked_ips' ? fetchBlockedIps() : fetchLogs(pagination.current_page),
    fetchBlockedIps(),
  ])
}

async function fetchStats() {
  try {
    const res = await api.get('/admin/system-logs/stats') as any
    Object.assign(stats, res)
    isIpRestricted.value = false
  } catch (e) {
    console.error('Failed to load stats', e)
    checkRestrictedError(e)
  }
}

async function fetchShieldSettings() {
  try {
    const res = await api.get('/admin/system-logs/settings') as any
    Object.assign(shieldSettings, res)
  } catch (e) {
    console.error('Failed to fetch shield settings', e)
    checkRestrictedError(e)
  }
}

async function saveShieldSettings() {
  savingSettings.value = true
  try {
    await api.put('/admin/system-logs/settings', shieldSettings)
    bannerMessage.value = 'Security Shield Policy updated successfully.'
    bannerSuccess.value = true
  } catch (e: any) {
    bannerMessage.value = e.data?.message || 'Failed to update shield settings'
    bannerSuccess.value = false
    checkRestrictedError(e)
  } finally {
    savingSettings.value = false
  }
}

async function fetchLogs(page = 1) {
  loading.value = true
  try {
    const params: any = {
      page,
      per_page: pagination.per_page,
    }

    if (activeTab.value === 'security') {
      params.level = 'security'
    } else if (activeTab.value === 'exceptions') {
      params.category = 'exception'
    } else if (filters.level) {
      params.level = filters.level
    }

    if (filters.category && activeTab.value === 'all') {
      params.category = filters.category
    }
    if (filters.status) params.status = filters.status
    if (filters.search) params.search = filters.search
    if (filters.date) params.date = filters.date

    const res = await api.get('/admin/system-logs', { params }) as any
    logs.value = res.data || []
    pagination.current_page = res.current_page
    pagination.last_page = res.last_page
    pagination.total = res.total
    pagination.from = res.from || 0
    pagination.to = res.to || 0
    isIpRestricted.value = false
  } catch (e) {
    console.error('Failed to fetch logs', e)
    checkRestrictedError(e)
  } finally {
    loading.value = false
  }
}

async function fetchBlockedIps() {
  try {
    blockedIpsList.value = await api.get('/admin/blocked-ips') as any[]
    isIpRestricted.value = false
  } catch (e) {
    console.error('Failed to load blocked IPs', e)
    checkRestrictedError(e)
  }
}

function clearFilters() {
  filters.search = ''
  filters.level = ''
  filters.category = ''
  filters.status = ''
  filters.date = ''
  fetchLogs(1)
}

function isIpBlocked(ip: string): boolean {
  return blockedIpsList.value.some(b => b.ip_address === ip)
}

function inspectLog(log: any) {
  selectedLog.value = log
  copied.value = false
}

function copyTrace() {
  if (selectedLog.value?.trace) {
    navigator.clipboard.writeText(selectedLog.value.trace)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

async function updateLogStatus(log: any, newStatus: string) {
  try {
    await api.put(`/admin/system-logs/${log.id}/status`, { status: newStatus })
    log.status = newStatus
    fetchStats()
  } catch (e) {
    console.error('Failed to update log status', e)
  }
}

async function resolveAllLogs() {
  if (!confirm('Mark all currently matching unresolved events as resolved?')) return
  try {
    const res = await api.post('/admin/system-logs/resolve-all', {
      category: activeTab.value === 'exceptions' ? 'exception' : undefined
    }) as any
    bannerMessage.value = res.message || 'Logs resolved successfully.'
    bannerSuccess.value = true
    fetchStats()
    fetchLogs(1)
  } catch (e: any) {
    bannerMessage.value = e.data?.message || 'Failed to resolve logs'
    bannerSuccess.value = false
  }
}

async function pruneLogs() {
  try {
    const res = await api.del('/admin/system-logs/clear', {
      params: { days: clearDays.value }
    }) as any
    bannerMessage.value = res.message || 'Pruned resolved logs.'
    bannerSuccess.value = true
    showClearModal.value = false
    fetchStats()
    fetchLogs(1)
  } catch (e: any) {
    bannerMessage.value = e.data?.message || 'Failed to prune logs'
    bannerSuccess.value = false
  }
}

function openBlockIpModal(prefillIp = '') {
  blockForm.ip_address = prefillIp
  blockForm.reason = 'Malicious scanning / security violation'
  blockForm.duration_hours = 24
  blockFormError.value = ''
  showBlockModal.value = true
}

// ⚡ Immediate Catch & Ban Attacker IP
async function catchAndBan(ip: string, reasonText = '') {
  if (!confirm(`⚡ ENFORCE IMMEDIATE CATCH & BAN:\n\nAre you sure you want to catch and ban attacker IP ${ip} on the spot?`)) return
  try {
    const res = await api.post('/admin/system-logs/catch-and-ban', {
      ip_address: ip,
      reason: `Immediate Catch & Ban: ${reasonText || 'Malicious scanner probe'}`,
      duration_hours: shieldSettings.auto_block_duration,
    }) as any
    bannerMessage.value = res.message || `Attacker IP ${ip} caught and added to firewall blacklist.`
    bannerSuccess.value = true
    await Promise.all([fetchBlockedIps(), fetchStats(), fetchLogs(pagination.current_page)])
  } catch (e: any) {
    bannerMessage.value = e.data?.message || 'Failed to ban attacker IP'
    bannerSuccess.value = false
  }
}

async function submitBlockIp() {
  blockFormError.value = ''
  try {
    await api.post('/admin/blocked-ips', {
      ip_address: blockForm.ip_address,
      reason: blockForm.reason,
      duration_hours: blockForm.duration_hours,
    })
    bannerMessage.value = `IP ${blockForm.ip_address} has been banned.`
    bannerSuccess.value = true
    showBlockModal.value = false
    await fetchBlockedIps()
    fetchStats()
  } catch (e: any) {
    blockFormError.value = e.data?.message || 'Failed to ban IP. Verify the address format.'
  }
}

async function unblockIp(id: number) {
  try {
    await api.del(`/admin/blocked-ips/${id}`)
    bannerMessage.value = 'IP unblocked from firewall successfully.'
    bannerSuccess.value = true
    await fetchBlockedIps()
    fetchStats()
  } catch (e: any) {
    bannerMessage.value = e.data?.message || 'Failed to unblock IP'
    bannerSuccess.value = false
  }
}

async function sendTestAlert() {
  testingAlert.value = true
  bannerMessage.value = ''
  try {
    const res = await api.post('/admin/system-logs/test-alert') as any
    bannerMessage.value = res.message
    bannerSuccess.value = res.success !== false
  } catch (e: any) {
    bannerMessage.value = e.data?.message || 'Test alert delivery failed.'
    bannerSuccess.value = false
  } finally {
    testingAlert.value = false
  }
}

function formatDate(d: string): string {
  if (!d) return 'N/A'
  const date = new Date(d)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

function formatCategory(c: string): string {
  switch (c) {
    case 'security_scan': return 'Scanner Probe'
    case 'sql_injection': return 'SQL / Cmd Injection'
    case 'path_traversal': return 'Path Traversal'
    case 'manual_firewall_ban': return 'Admin Catch & Ban'
    case 'exception': return 'Backend Exception'
    default: return c.replace('_', ' ')
  }
}

function levelBadgeClass(level: string): string {
  switch (level) {
    case 'security':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-black'
    case 'critical':
      return 'bg-purple-50 text-purple-700 border-purple-200 font-black'
    case 'error':
      return 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200 font-bold'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

function methodBadgeClass(method: string): string {
  switch (method?.toUpperCase()) {
    case 'GET': return 'bg-sky-50 text-sky-700'
    case 'POST': return 'bg-emerald-50 text-emerald-700'
    case 'PUT': return 'bg-amber-50 text-amber-700'
    case 'DELETE': return 'bg-rose-50 text-rose-700'
    case 'BAN': return 'bg-rose-600 text-white font-black'
    default: return 'bg-slate-100 text-slate-700'
  }
}

function statusSelectClass(status: string): string {
  switch (status) {
    case 'resolved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'investigating':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'ignored':
      return 'bg-slate-100 text-slate-500 border-slate-200'
    default:
      return 'bg-rose-50 text-rose-700 border-rose-200'
  }
}

function formatRelativeTime(d: string): string {
  if (!d) return 'N/A'
  const date = new Date(d)
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSec < 5) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function formatTerminalDate(d: string): string {
  if (!d) return '--:--:--'
  const date = new Date(d)
  return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
}

function formatTerminalPayload(payload: any): string {
  if (!payload) return 'No payload captured.'
  if (typeof payload === 'string') {
    try {
      return JSON.stringify(JSON.parse(payload), null, 2)
    } catch (e) {
      return payload
    }
  }
  return JSON.stringify(payload, null, 2)
}

function terminalLogItemClass(log: any): string {
  if (log.level === 'security') {
    return 'bg-rose-950/25 hover:bg-rose-950/40 border-rose-900/40 hover:border-rose-600/70 shadow-xs'
  }
  if (log.level === 'critical') {
    return 'bg-purple-950/25 hover:bg-purple-950/40 border-purple-900/40 hover:border-purple-600/70'
  }
  if (log.level === 'error') {
    return 'bg-amber-950/25 hover:bg-amber-950/40 border-amber-900/40 hover:border-amber-600/70'
  }
  return 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800 hover:border-slate-700'
}

function terminalLevelBadgeClass(level: string): string {
  switch (level) {
    case 'security':
      return 'bg-rose-950 text-rose-300 border-rose-600/70 font-black shadow-xs shadow-rose-900/40'
    case 'critical':
      return 'bg-purple-950 text-purple-300 border-purple-600/70 font-black'
    case 'error':
      return 'bg-amber-950 text-amber-300 border-amber-600/70 font-bold'
    case 'warning':
      return 'bg-yellow-950 text-yellow-300 border-yellow-600/70 font-bold'
    default:
      return 'bg-slate-900 text-slate-400 border-slate-700'
  }
}

function copyAllTerminalLogs() {
  if (!logs.value || logs.value.length === 0) return
  const text = logs.value.map(l => {
    const dt = l.created_at ? new Date(l.created_at).toISOString() : 'N/A'
    return `[${dt}] [${(l.level || 'INFO').toUpperCase()}] [${l.category || 'GENERAL'}] [IP:${l.ip_address || 'UNKNOWN'}] [${l.method || 'REQ'} ${l.url || '/'}] => ${l.message}`
  }).join('\n')
  navigator.clipboard.writeText(text)
  terminalCopied.value = true
  setTimeout(() => { terminalCopied.value = false }, 2500)
}
</script>
