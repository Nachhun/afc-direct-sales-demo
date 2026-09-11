<template>
  <div class="space-y-8 animate-fade-in">
    
    <!-- Top Filter & Controls Banner -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
          <Icon name="heroicons:cpu-chip" class="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-base font-black text-slate-900 uppercase tracking-wide">
              AI Store Performance Analyst
            </h2>
            <span class="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
              Machine Intelligence
            </span>
          </div>
          <p class="text-slate-500 text-xs font-semibold mt-0.5">
            Predictive churn detection, store network health scoring, and supervisor sales rep dispatch
          </p>
        </div>
      </div>

      <!-- Date Range Filter & Action Controls -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Date Pickers -->
        <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
          <Icon name="heroicons:calendar" class="w-4 h-4 text-slate-400" />
          <input 
            type="date" 
            v-model="startDate" 
            @change="fetchAiPerformance" 
            class="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          />
          <span class="text-slate-400 text-xs font-bold">to</span>
          <input 
            type="date" 
            v-model="endDate" 
            @change="fetchAiPerformance" 
            class="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          />
        </div>

        <button 
          @click="resetFilters" 
          class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          title="Reset to current month"
        >
          <Icon name="heroicons:arrow-path" class="w-4 h-4" />
        </button>

        <!-- Generate Full Report Button -->
        <button 
          @click="openFullReportModal"
          class="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <Icon name="heroicons:document-text" class="w-4 h-4" />
          <span>Generate Full Report</span>
        </button>
      </div>
    </div>

    <!-- Interactive "Ask AI" Question Assistant Bar -->
    <div class="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white border border-indigo-800/40 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Icon name="heroicons:chat-bubble-bottom-center-text" class="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Ask AI Store Analyst</span>
              <span class="text-[9.5px] font-normal bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">Instant Intelligence</span>
            </h3>
            <p class="text-[11px] text-slate-300">Type any question about stores, sales representatives, or revenue at risk</p>
          </div>
        </div>

        <button 
          v-if="aiAnswer"
          @click="clearAiAnswer"
          class="text-xs text-indigo-300 hover:text-white font-bold underline cursor-pointer self-start sm:self-auto"
        >
          Clear Answer
        </button>
      </div>

      <!-- Question Input Form -->
      <form @submit.prevent="handleAskQuestion(userQuestion)" class="relative flex items-center">
        <input 
          v-model="userQuestion" 
          type="text" 
          placeholder="Ask e.g. Which salesman has the most dormant stores? or Who is at critical risk?"
          class="w-full bg-white/10 border border-white/20 rounded-2xl pl-11 pr-28 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-400 outline-none focus:border-indigo-400 focus:bg-white/15 transition-all shadow-inner"
        />
        <Icon name="heroicons:sparkles" class="w-5 h-5 text-indigo-400 absolute left-3.5 pointer-events-none" />

        <button 
          type="submit"
          :disabled="!userQuestion.trim() || isAnswering"
          class="absolute right-2 px-4 py-1.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Icon v-if="isAnswering" name="heroicons:arrow-path" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isAnswering ? 'Analyzing...' : 'Ask AI' }}</span>
        </button>
      </form>

      <!-- Preset Quick Prompt Pills -->
      <div class="flex items-center gap-2 flex-wrap pt-1">
        <span class="text-[10px] font-black uppercase text-indigo-300 tracking-wider">Quick Prompts:</span>
        <button 
          v-for="preset in presetQuestions" 
          :key="preset.text"
          @click="handleAskQuestion(preset.text)"
          class="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white rounded-lg text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1"
        >
          <span>{{ preset.icon }}</span>
          <span>{{ preset.text }}</span>
        </button>
      </div>

      <!-- AI Response Card -->
      <div v-if="aiAnswer" class="bg-white text-slate-900 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in border border-indigo-100">
        <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
            <span class="text-xs font-black uppercase tracking-wider text-indigo-900">{{ aiAnswer.title }}</span>
          </div>
          <span class="text-[10px] font-bold text-slate-400">Answered by Built-in AI Engine</span>
        </div>

        <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
          {{ aiAnswer.summary }}
        </p>

        <!-- Interactive Store Contact Cards (if stores provided) -->
        <div v-if="aiAnswer.stores?.length" class="space-y-2 bg-indigo-50/50 p-3 sm:p-4 rounded-2xl border border-indigo-100">
          <div 
            v-for="st in aiAnswer.stores" 
            :key="'ans-st-' + st.store_id"
            class="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition-colors"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-black text-xs sm:text-sm text-slate-900 truncate">{{ st.shop_name }}</span>
                <span class="text-[10px] font-mono text-slate-400 font-bold">({{ st.customer_id }})</span>
                <span 
                  class="text-[8.5px] font-black uppercase px-2 py-0.5 rounded border"
                  :class="getSeverityBadgeClass(st.risk_level)"
                >
                  {{ st.risk_level }}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                <span>{{ st.province }}</span>
                <span>•</span>
                <span>Rep: <strong class="text-slate-700">{{ st.salesman_name }}</strong></span>
                <span>•</span>
                <span class="text-rose-600 font-bold font-mono">{{ st.days_since_last_order }}d late</span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <a 
                v-if="st.store_contact"
                :href="'tel:' + st.store_contact"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors shadow-2xs cursor-pointer"
                title="Call Store"
              >
                <Icon name="heroicons:phone" class="w-3.5 h-3.5" />
                <span>{{ st.store_contact }}</span>
              </a>
              <span v-else class="text-xs text-slate-400 italic">No phone</span>

              <button 
                @click="openStoreDetailsModal(st)"
                class="p-1.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl transition-colors cursor-pointer text-xs"
                title="View Orders History"
              >
                <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Bullet Highlights (fallback when no store list) -->
        <div v-else-if="aiAnswer.points?.length" class="space-y-1.5 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100/60">
          <div 
            v-for="(point, pIdx) in aiAnswer.points" 
            :key="'pt-' + pIdx"
            class="text-xs font-bold text-slate-800 flex items-start gap-2"
          >
            <span class="text-indigo-600 font-black shrink-0">•</span>
            <span>{{ point }}</span>
          </div>
        </div>

        <!-- Action Directive -->
        <div v-if="aiAnswer.action" class="pt-2 flex items-center justify-between text-xs font-bold text-slate-600">
          <span class="text-slate-400 text-[10.5px] uppercase tracking-wider">Recommended Action:</span>
          <span class="text-indigo-700 font-extrabold">{{ aiAnswer.action }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="border border-indigo-100 bg-white rounded-3xl p-12 text-center space-y-3 shadow-xs">
      <div class="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      <p class="text-xs font-bold text-slate-600">AI Analyst is calculating store cadence & churn risk models...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!activeAiData" class="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest shadow-xs">
      No AI analysis data available for the selected period.
    </div>

    <!-- Main Content Container -->
    <div v-else class="space-y-6">

      <!-- TOP SECTION: Health Score Card + Executive AI Briefing -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        <!-- Score Card (4 cols on large) -->
        <div class="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none"></div>

          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-[10.5px] font-black uppercase tracking-wider text-slate-400">Network Health Score</span>
            <span 
              class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border"
              :class="healthBadgeStyle"
            >
              {{ activeAiData.health_status }}
            </span>
          </div>

          <div class="flex items-baseline gap-2 my-2">
            <span class="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono">
              {{ activeAiData.health_score }}
            </span>
            <span class="text-slate-400 text-sm font-bold">/ 100</span>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-1.5 mt-2">
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
              <div 
                class="h-full rounded-full transition-all duration-1000"
                :class="healthProgressColor"
                :style="{ width: `${Math.min(100, Math.max(10, activeAiData.health_score))}%` }"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] font-bold text-slate-400">
              <span>Critical</span>
              <span>Needs Attention</span>
              <span>Optimal (85+)</span>
            </div>
          </div>

          <!-- Bottom Micro Tag -->
          <div class="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Period Growth vs Prior:</span>
            <span 
              class="font-mono font-black"
              :class="(activeAiData.kpis?.revenue_growth_pct || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ (activeAiData.kpis?.revenue_growth_pct || 0) >= 0 ? '+' : '' }}{{ activeAiData.kpis?.revenue_growth_pct || 0 }}%
            </span>
          </div>
        </div>

        <!-- Executive Summary Briefing + Mini Metrics (8 cols on large) -->
        <div class="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <Icon name="heroicons:sparkles" class="w-5 h-5 text-indigo-600" />
              <span class="text-xs font-black uppercase tracking-wider text-indigo-700">Executive AI Briefing</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {{ activeAiData.executive_summary }}
            </p>
          </div>

          <!-- 4 Fast Diagnostic Indicators Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <!-- Active Rate -->
            <div class="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
              <div class="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 truncate">Active Rate</div>
              <div class="text-base font-black text-slate-900 mt-0.5 font-mono">{{ activeAiData.kpis?.active_store_rate || 0 }}%</div>
              <div class="text-[10px] text-slate-500 mt-0.5">of registered stores</div>
            </div>

            <!-- Retention Rate -->
            <div class="bg-slate-50/80 rounded-2xl p-3 border border-slate-100">
              <div class="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 truncate">Store Retention</div>
              <div class="text-base font-black text-slate-900 mt-0.5 font-mono">{{ activeAiData.kpis?.retention_rate || 0 }}%</div>
              <div class="text-[10px] text-slate-500 mt-0.5">retained vs prior period</div>
            </div>

            <!-- Overdue Accounts -->
            <div class="bg-rose-50/60 rounded-2xl p-3 border border-rose-100">
              <div class="text-[9.5px] font-bold uppercase tracking-wider text-rose-500 truncate">At-Risk Churn</div>
              <div class="text-base font-black text-rose-700 mt-0.5 font-mono">{{ activeAiData.kpis?.at_risk_stores_count || 0 }} Stores</div>
              <div class="text-[10px] text-rose-600 mt-0.5">exceeding cycle</div>
            </div>

            <!-- Revenue at Risk -->
            <div class="bg-amber-50/60 rounded-2xl p-3 border border-amber-100">
              <div class="text-[9.5px] font-bold uppercase tracking-wider text-amber-600 truncate">Volume at Risk</div>
              <div class="text-base font-black text-amber-800 mt-0.5 font-mono">${{ Math.round(activeAiData.kpis?.total_at_risk_revenue || 0).toLocaleString() }}</div>
              <div class="text-[10px] text-amber-700 mt-0.5">stalled re-orders</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3 Dynamic Executive Insight Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          v-for="(insight, idx) in (activeAiData.insights || [])" 
          :key="'ins-' + idx"
          class="bg-white border rounded-3xl p-5 sm:p-6 shadow-xs space-y-3 flex flex-col justify-between relative overflow-hidden"
          :class="getInsightBorderClass(insight.type)"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <span 
                class="text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border"
                :class="getInsightBadgeClass(insight.type)"
              >
                {{ insight.badge }}
              </span>
              <Icon :name="getInsightIcon(insight.type)" class="w-4 h-4 opacity-70" :class="getInsightIconColor(insight.type)" />
            </div>
            <h4 class="text-sm font-black text-slate-900 leading-snug">
              {{ insight.title }}
            </h4>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">
              {{ insight.description }}
            </p>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span class="text-slate-400 text-[10px] uppercase tracking-wider">Priority Action:</span>
            <span class="text-indigo-600 text-xs font-black">{{ insight.action_label }}</span>
          </div>
        </div>
      </div>

      <!-- SECTION: At-Risk & Churn Early-Warning Table -->
      <div class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <h3 class="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                Dormancy & Churn Early-Warning List ({{ filteredAtRiskStores.length }})
              </h3>
            </div>
            <p class="text-slate-500 text-xs font-medium mt-0.5">
              Accounts overdue past their normal ordering cycle (ranked by severity & volume at risk)
            </p>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            <!-- Severity Filter Tabs -->
            <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-[10px] font-bold">
              <button 
                @click="riskFilter = 'all'"
                :class="riskFilter === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'"
                class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                All ({{ activeAiData.at_risk_stores?.length || 0 }})
              </button>
              <button 
                @click="riskFilter = 'Critical'"
                :class="riskFilter === 'Critical' ? 'bg-rose-600 text-white shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'"
                class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                Critical
              </button>
              <button 
                @click="riskFilter = 'High'"
                :class="riskFilter === 'High' ? 'bg-amber-500 text-white shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'"
                class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                High
              </button>
              <button 
                @click="riskFilter = 'Moderate'"
                :class="riskFilter === 'Moderate' ? 'bg-blue-600 text-white shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'"
                class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                Moderate
              </button>
            </div>

            <!-- Refresh Data Button -->
            <button 
              @click="fetchAiPerformance"
              :disabled="isLoading"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Refresh At-Risk Accounts List"
            >
              <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
              <span>Refresh</span>
            </button>

            <!-- Export Excel Button -->
            <button 
              @click="exportAtRiskStoresToExcel"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95"
              title="Export At-Risk Stores to Excel"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <!-- Empty state if no at risk stores -->
        <div v-if="filteredAtRiskStores.length === 0" class="py-12 text-center text-slate-400 text-xs font-medium">
          <Icon name="heroicons:check-badge" class="w-10 h-10 text-emerald-500 mx-auto mb-1.5" />
          <span class="font-bold text-slate-700 block">No overdue accounts matching this filter.</span>
          <span class="text-[11px] text-slate-400">All registered store ordering rhythms are within normal bounds!</span>
        </div>

        <!-- At-Risk Stores Table -->
        <div v-else class="overflow-x-auto custom-scrollbar border border-slate-200/80 rounded-2xl">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-slate-50 text-slate-400 text-[9.5px] uppercase font-black tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-3.5">Store Name & Code</th>
                <th class="py-3 px-3.5">Trade Class & Location</th>
                <th class="py-3 px-3.5 text-center">Last Order Date</th>
                <th class="py-3 px-3.5 text-center">Cadence vs Overdue</th>
                <th class="py-3 px-3.5 text-right">Est. Volume at Risk</th>
                <th class="py-3 px-3.5">Assigned Sales Rep</th>
                <th class="py-3 px-3.5 text-center">Severity</th>
                <th class="py-3 px-3.5 text-center">Quick Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 font-bold">
              <tr 
                v-for="st in filteredAtRiskStores" 
                :key="'risk-' + st.store_id"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <!-- Store Name & ID -->
                <td class="py-3 px-3.5">
                  <button 
                    @click="openStoreDetailsModal(st)"
                    class="text-left font-black text-slate-900 hover:text-indigo-600 hover:underline transition-colors block truncate max-w-[210px] cursor-pointer"
                  >
                    {{ st.shop_name }}
                  </button>
                  <span class="text-[10.5px] font-mono text-slate-400 font-bold block">
                    {{ st.customer_id }}
                  </span>
                </td>

                <!-- Trade Class & Location -->
                <td class="py-3 px-3.5 text-slate-600">
                  <span class="font-bold text-slate-800 text-xs block truncate max-w-[140px]">{{ st.trade_class }}</span>
                  <span class="text-[10.5px] text-slate-400 block">{{ st.province }}</span>
                </td>

                <!-- Last Order Date -->
                <td class="py-3 px-3.5 text-center">
                  <div class="inline-flex flex-col items-center">
                    <span class="font-mono text-xs font-black text-slate-900">
                      {{ st.last_order_date || 'N/A' }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-bold">
                      {{ st.days_since_last_order }}d ago
                    </span>
                  </div>
                </td>

                <!-- Cadence & Overdue Ratio -->
                <td class="py-3 px-3.5 text-center">
                  <div class="inline-flex flex-col items-center">
                    <span class="font-mono text-xs font-black text-rose-600">
                      {{ st.days_since_last_order }} days late
                    </span>
                    <span class="text-[10px] text-slate-400">
                      Norm: {{ st.avg_cycle_days }}d ({{ st.overdue_ratio }}x)
                    </span>
                  </div>
                </td>

                <!-- Est Revenue at Risk -->
                <td class="py-3 px-3.5 text-right font-mono font-black text-amber-700">
                  ${{ Number(st.estimated_revenue_risk || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </td>

                <!-- Salesman -->
                <td class="py-3 px-3.5 text-slate-700">
                  <div class="flex items-center gap-1.5">
                    <Icon name="heroicons:user" class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span class="truncate max-w-[130px] font-bold text-xs">{{ st.salesman_name }}</span>
                  </div>
                </td>

                <!-- Severity Badge -->
                <td class="py-3 px-3.5 text-center">
                  <span 
                    class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border"
                    :class="getSeverityBadgeClass(st.risk_level)"
                  >
                    {{ st.risk_level }}
                  </span>
                </td>

                <!-- Quick Action Buttons -->
                <td class="py-3 px-3.5 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <!-- Phone Call -->
                    <a 
                      v-if="st.store_contact"
                      :href="'tel:' + st.store_contact"
                      class="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors"
                      title="Call Store Owner"
                    >
                      <Icon name="heroicons:phone" class="w-3.5 h-3.5" />
                    </a>

                    <!-- View Orders History -->
                    <button 
                      @click="openStoreDetailsModal(st)"
                      class="px-2.5 py-1 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer"
                      title="View Store Orders"
                    >
                      Details
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION: Supervisor Field Sales Rep Dispatch Queue -->
      <div v-if="activeAiData.salesman_dispatch?.length" class="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Icon name="heroicons:bolt" class="w-5 h-5 text-indigo-600" />
          <h3 class="text-sm sm:text-base font-black uppercase text-slate-900 tracking-wider">
            Field Sales Rep Action Priorities (Supervisor Dispatch)
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div 
            v-for="rep in activeAiData.salesman_dispatch" 
            :key="'rep-' + rep.salesman_name"
            class="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-2.5"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                  {{ rep.salesman_name.charAt(0) }}
                </div>
                <span class="font-black text-xs sm:text-sm text-slate-900 truncate">{{ rep.salesman_name }}</span>
              </div>
              <span class="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {{ rep.at_risk_count }} Overdue
              </span>
            </div>

            <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
              <span class="text-slate-400 text-xs">Volume at Risk:</span>
              <span class="font-mono font-black text-amber-700">${{ Math.round(rep.total_revenue_risk).toLocaleString() }}</span>
            </div>

            <div v-if="rep.store_names?.length" class="text-[11px] text-slate-500 pt-0.5 truncate">
              <strong class="text-slate-700">Accounts:</strong> {{ rep.store_names.join(', ') }}
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Teleport: Full Executive Audit Report Document Modal -->
    <Teleport to="body">
      <div v-if="isFullReportModalOpen" class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[110] p-3 sm:p-6 animate-fade-in overflow-y-auto">
        <div class="bg-white border border-slate-200 w-full max-w-6xl rounded-3xl shadow-2xl relative flex flex-col max-h-[94vh] overflow-hidden">
          
          <!-- Modal Top Header & Actions -->
          <div class="px-6 py-4.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shrink-0 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                <Icon name="heroicons:document-chart-bar" class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  Executive Store Network Audit Report
                </h3>
                <p class="text-[11px] text-slate-400">
                  Period: {{ startDate }} to {{ endDate }} • Generated by AI Store Analyst
                </p>
              </div>
            </div>

            <!-- Header Buttons -->
            <div class="flex items-center gap-2">
              <button 
                @click="printReport"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/15"
                title="Print or Save to PDF"
              >
                <Icon name="heroicons:printer" class="w-4 h-4 text-indigo-300" />
                <span>Print / PDF</span>
              </button>

              <button 
                @click="copyReportSummary"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Copy markdown text for Telegram/Email"
              >
                <Icon :name="copiedReport ? 'heroicons:check' : 'heroicons:clipboard-document'" class="w-4 h-4" />
                <span>{{ copiedReport ? 'Copied!' : 'Copy Summary' }}</span>
              </button>

              <button 
                @click="isFullReportModalOpen = false"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              >
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Printable Executive Report Body -->
          <div id="ai-executive-report-content" class="p-6 sm:p-8 overflow-y-auto space-y-8 custom-scrollbar bg-slate-50/40 text-slate-900">
            
            <!-- Document Header Banner -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="text-[10px] font-black uppercase tracking-widest text-indigo-600">AFC DIRECT SALES • EXECUTIVE BRIEFING</div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  Store Performance, Churn & Territory Risk Audit
                </h2>
                <p class="text-xs text-slate-500 mt-1">
                  Automated diagnosis of {{ rawReportData?.kpis?.total_registered_stores || 0 }} registered distribution accounts across Cambodia.
                </p>
              </div>

              <div class="text-right sm:border-l sm:border-slate-100 sm:pl-6 shrink-0">
                <div class="text-[10px] uppercase font-black tracking-wider text-slate-400">Health Index</div>
                <div class="text-3xl font-black font-mono text-indigo-600 mt-0.5">
                  {{ activeAiData.health_score }} / 100
                </div>
                <div class="text-xs font-bold text-slate-600 mt-0.5">
                  Rating: <span class="uppercase font-black text-indigo-700">{{ activeAiData.health_status }}</span>
                </div>
              </div>
            </div>

            <!-- Section 1: Executive Summary -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Icon name="heroicons:sparkles" class="w-4 h-4 text-indigo-600" />
                <span>1. Executive Summary & Diagnostic Indicators</span>
              </h4>

              <p class="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {{ activeAiData.executive_summary }}
              </p>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Total Active Stores</div>
                  <div class="text-base font-black text-slate-900 font-mono mt-0.5">{{ rawReportData?.kpis?.active_stores_count || 0 }} Stores</div>
                  <div class="text-[10.5px] text-slate-500 mt-0.5">{{ activeAiData.kpis?.active_store_rate }}% active rate</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="text-[10px] uppercase font-bold text-slate-400">Store Retention Rate</div>
                  <div class="text-base font-black text-slate-900 font-mono mt-0.5">{{ activeAiData.kpis?.retention_rate || 0 }}%</div>
                  <div class="text-[10.5px] text-slate-500 mt-0.5">retained vs prior period</div>
                </div>
                <div class="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
                  <div class="text-[10px] uppercase font-bold text-rose-500">At-Risk Overdue Accounts</div>
                  <div class="text-base font-black text-rose-700 font-mono mt-0.5">{{ activeAiData.kpis?.at_risk_stores_count || 0 }} Stores</div>
                  <div class="text-[10.5px] text-rose-600 mt-0.5">missed 2x+ cadence</div>
                </div>
                <div class="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div class="text-[10px] uppercase font-bold text-amber-600">Total Volume at Risk</div>
                  <div class="text-base font-black text-amber-800 font-mono mt-0.5">${{ Math.round(activeAiData.kpis?.total_at_risk_revenue || 0).toLocaleString() }}</div>
                  <div class="text-[10.5px] text-amber-700 mt-0.5">estimated re-order loss</div>
                </div>
              </div>
            </div>

            <!-- Section 2: Channel Dynamics & Pareto Concentration -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Icon name="heroicons:chart-pie" class="w-4 h-4 text-indigo-600" />
                <span>2. Channel Breakdown & Concentration Vulnerability</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Channel Mix Table -->
                <div class="border border-slate-200 rounded-xl overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 text-slate-400 text-[9.5px] font-black uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-3">Trade Channel</th>
                        <th class="py-2.5 px-3 text-center">Stores</th>
                        <th class="py-2.5 px-3 text-right">Revenue ($)</th>
                        <th class="py-2.5 px-3 text-right">Share %</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-bold">
                      <tr v-for="ch in (rawReportData?.rt_vs_ws || [])" :key="ch.code" class="hover:bg-slate-50">
                        <td class="py-2 px-3 flex items-center gap-2">
                          <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: ch.color }"></span>
                          <span>{{ ch.name }}</span>
                        </td>
                        <td class="py-2 px-3 text-center text-slate-500 font-mono">{{ ch.store_count }}</td>
                        <td class="py-2 px-3 text-right font-black text-emerald-700 font-mono">${{ Number(ch.revenue).toLocaleString() }}</td>
                        <td class="py-2 px-3 text-right font-black text-indigo-700 font-mono">{{ ch.percentage }}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Pareto Concentration Box -->
                <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3">
                  <div>
                    <div class="text-[10px] font-black uppercase text-slate-400 tracking-wider">Pareto 80/20 Concentration Risk</div>
                    <div class="text-xl font-black text-slate-900 mt-1">
                      Top 10 Stores = <span class="text-indigo-600">{{ activeAiData.kpis?.pareto_top10_share || 0 }}%</span> of Sales
                    </div>
                    <p class="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      Risk Level: <strong class="uppercase text-slate-800">{{ activeAiData.kpis?.pareto_risk_level }}</strong>. 
                      {{ activeAiData.kpis?.pareto_risk_level === 'Critical' ? 'High vulnerability to a single top customer churn. Aggressive expansion in mid-tier retail stores recommended.' : 'Healthy revenue distribution across network accounts.' }}
                    </p>
                  </div>
                  <div class="text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-200/80">
                    Top Store: <strong class="text-slate-900">{{ rawReportData?.kpis?.top_store_name || 'N/A' }}</strong> (${{ Number(rawReportData?.kpis?.top_store_revenue || 0).toLocaleString() }})
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Full At-Risk Accounts Roster Table -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 text-rose-600" />
                  <span>3. Complete Dormant & Churn Early-Warning Roster ({{ filteredAtRiskStores.length }} Accounts)</span>
                </h4>
                <span class="text-[10.5px] font-mono text-amber-700 font-bold">
                  Total At-Risk: ${{ Math.round(activeAiData.kpis?.total_at_risk_revenue || 0).toLocaleString() }}
                </span>
              </div>

              <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-400 text-[9.5px] font-black uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3">Store Name & Customer ID</th>
                      <th class="py-2.5 px-3">Trade Class</th>
                      <th class="py-2.5 px-3">Province</th>
                      <th class="py-2.5 px-3 text-center">Last Order</th>
                      <th class="py-2.5 px-3 text-center">Days Overdue</th>
                      <th class="py-2.5 px-3 text-right">Vol at Risk ($)</th>
                      <th class="py-2.5 px-3">Assigned Sales Rep</th>
                      <th class="py-2.5 px-3 text-center">Severity</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                    <tr v-for="st in filteredAtRiskStores" :key="'rpt-' + st.store_id" class="hover:bg-slate-50">
                      <td class="py-2 px-3">
                        <div class="font-black text-slate-900">{{ st.shop_name }}</div>
                        <div class="text-[10px] font-mono text-slate-400">{{ st.customer_id }}</div>
                      </td>
                      <td class="py-2 px-3 text-slate-600 text-[11px]">{{ st.trade_class }}</td>
                      <td class="py-2 px-3 text-slate-600 text-[11px]">{{ st.province }}</td>
                      <td class="py-2 px-3 text-center font-mono text-slate-800 text-[11px]">{{ st.last_order_date }}</td>
                      <td class="py-2 px-3 text-center font-mono text-rose-600 font-black text-xs">
                        {{ st.days_since_last_order }}d ({{ st.overdue_ratio }}x)
                      </td>
                      <td class="py-2 px-3 text-right font-black font-mono text-amber-700">${{ Number(st.estimated_revenue_risk || 0).toLocaleString() }}</td>
                      <td class="py-2 px-3 text-slate-800 text-[11px]">{{ st.salesman_name }}</td>
                      <td class="py-2 px-3 text-center">
                        <span 
                          class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md border"
                          :class="getSeverityBadgeClass(st.risk_level)"
                        >
                          {{ st.risk_level }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Section 4: Supervisor Sales Rep Dispatch Schedule -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Icon name="heroicons:bolt" class="w-4 h-4 text-indigo-600" />
                <span>4. Supervisor Field Sales Rep Dispatch Schedule</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div 
                  v-for="rep in (activeAiData.salesman_dispatch || [])" 
                  :key="'rpt-rep-' + rep.salesman_name"
                  class="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-black text-xs text-slate-900">{{ rep.salesman_name }}</span>
                    <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                      {{ rep.at_risk_count }} Overdue
                    </span>
                  </div>
                  <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                    <span class="text-slate-400 text-[11px]">Volume at Risk:</span>
                    <span class="font-mono font-black text-amber-700">${{ Math.round(rep.total_revenue_risk).toLocaleString() }}</span>
                  </div>
                  <div v-if="rep.store_names?.length" class="text-[10.5px] text-slate-600 pt-0.5 truncate">
                    <strong>Accounts:</strong> {{ rep.store_names.join(', ') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 5: Strategic Next Steps -->
            <div class="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs space-y-4">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Icon name="heroicons:clipboard-document-check" class="w-4 h-4 text-indigo-600" />
                <span>5. Key Supervisor Tactical Directives</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
                  <div class="text-[10px] font-black uppercase text-rose-700">Priority 1: Re-activate Top 5</div>
                  <p class="text-[11.5px] text-slate-700 font-medium">
                    Schedule in-person supervisor visits to top 5 dormant accounts within 48 hours to prevent competitor stock switch.
                  </p>
                </div>
                <div class="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                  <div class="text-[10px] font-black uppercase text-indigo-700">Priority 2: Volume Promotion</div>
                  <p class="text-[11.5px] text-slate-700 font-medium">
                    Deploy targeted carton bundle promotions for Wholesale accounts that are exceeding 20+ days late.
                  </p>
                </div>
                <div class="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                  <div class="text-[10px] font-black uppercase text-emerald-700">Priority 3: Retail Diversification</div>
                  <p class="text-[11.5px] text-slate-700 font-medium">
                    Push secondary category SKUs (e.g. wipes, tissue) to active retail stores to lift average basket size.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Report generated for: AFC Direct Sales Management</span>
            <button 
              @click="isFullReportModalOpen = false" 
              class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </div>
      </div>
    </Teleport>

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
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Orders History</div>
                <div class="text-sm font-black text-indigo-600 font-mono">{{ storeOrdersModalData.length }} Orders</div>
              </div>
              <div class="bg-white border border-slate-200/80 p-3.5 rounded-2xl">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Revenue at Risk</div>
                <div class="text-sm font-black text-amber-700 font-mono">${{ Number(selectedStoreForModal?.estimated_revenue_risk || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</div>
              </div>
              <div class="bg-white border border-slate-200/80 p-3.5 rounded-2xl">
                <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Days Overdue</div>
                <div class="text-sm font-black text-rose-600 font-mono">{{ selectedStoreForModal?.days_since_last_order || 0 }} days</div>
              </div>
            </div>

            <div v-if="storeProfileModalData" class="bg-white border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
              <div class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Icon name="heroicons:map-pin" class="w-4 h-4 text-indigo-600" />
                <span>Store Information</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600 pt-1 font-medium">
                <div><span class="text-slate-400 font-bold">Contact:</span> {{ storeProfileModalData.contact || selectedStoreForModal?.store_contact || 'N/A' }}</div>
                <div><span class="text-slate-400 font-bold">Location:</span> {{ [storeProfileModalData.subdistrict, storeProfileModalData.district, storeProfileModalData.province].filter(Boolean).join(', ') || selectedStoreForModal?.province || 'N/A' }}</div>
                <div><span class="text-slate-400 font-bold">Salesman:</span> {{ storeProfileModalData.salesman || selectedStoreForModal?.salesman_name || 'Unassigned' }}</div>
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
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-bold text-slate-700">
                    <tr 
                      v-for="order in filteredStoreOrdersModalList" 
                      :key="'ord-' + order.id"
                      class="hover:bg-slate-50/80 transition-colors"
                    >
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
                          v-if="order.invoice_url"
                          @click="openInvoice(order)"
                          class="text-indigo-600 hover:text-indigo-900 text-[11px] font-bold underline cursor-pointer"
                        >
                          Invoice
                        </button>
                        <span v-else class="text-slate-400 text-[10px]">-</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Customer ID: {{ selectedStoreForModal?.customer_id }}</span>
            <button 
              @click="closeStoreDetailsModal" 
              class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl transition-colors cursor-pointer"
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
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { exportStyledExcel } from '~/utils/excelExport'

// Props (optional when embedded, not required when used as standalone tab)
const props = defineProps<{
  aiData?: any
  loading?: boolean
}>()

const api = useApi()

// Date range states
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

function toLocalDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startDate = ref(toLocalDateString(firstDay))
const endDate = ref(toLocalDateString(lastDay))
const internalLoading = ref(false)
const internalAiData = ref<any>(null)
const rawReportData = ref<any>(null)

// Combined loading & data states (props take precedence if provided)
const isLoading = computed(() => props.loading !== undefined ? props.loading : internalLoading.value)
const activeAiData = computed(() => props.aiData || internalAiData.value)

// Filter for at-risk stores
const riskFilter = ref<'all' | 'Critical' | 'High' | 'Moderate'>('all')

const filteredAtRiskStores = computed(() => {
  const list = activeAiData.value?.at_risk_stores || []
  if (riskFilter.value === 'all') return list
  return list.filter((s: any) => s.risk_level === riskFilter.value)
})

async function fetchAiPerformance() {
  internalLoading.value = true
  try {
    const params = {
      start_date: startDate.value,
      end_date: endDate.value
    }
    const res = await api.get('/admin/reports/store-performance', { params }) as any
    rawReportData.value = res
    internalAiData.value = res.ai_analyst || null
  } catch (err) {
    console.error('Failed to load AI Store Analyst data:', err)
  } finally {
    internalLoading.value = false
  }
}

async function resetFilters() {
  startDate.value = toLocalDateString(firstDay)
  endDate.value = toLocalDateString(lastDay)
  await fetchAiPerformance()
}

onMounted(() => {
  if (!props.aiData) {
    fetchAiPerformance()
  }
})

// ==========================================
// INTERACTIVE "ASK AI" QUESTION ASSISTANT
// ==========================================
const userQuestion = ref('')
const isAnswering = ref(false)
const aiAnswer = ref<{
  title: string
  summary: string
  points?: string[]
  stores?: any[]
  action?: string
} | null>(null)

const presetQuestions = [
  { icon: '👨‍💼', text: 'Which salesman has the most dormant stores?' },
  { icon: '⚠️', text: 'Show critical risk stores' },
  { icon: '📞', text: 'Give me phone number of store critical risk' },
  { icon: '🏢', text: 'What is our wholesale vs retail balance?' },
  { icon: '💰', text: 'How much revenue is at risk?' },
  { icon: '📋', text: 'Summarize priorities for this week' }
]

function clearAiAnswer() {
  aiAnswer.value = null
  userQuestion.value = ''
}

async function handleAskQuestion(query: string) {
  if (!query || !query.trim()) return
  userQuestion.value = query
  isAnswering.value = true

  try {
    const res = await api.post('/admin/reports/store-ai-query', {
      question: query.trim(),
      start_date: startDate.value,
      end_date: endDate.value
    }) as any

    aiAnswer.value = res
  } catch (err) {
    console.error('Failed to query backend AI:', err)
    // Fallback to client-side heuristic engine if network issue
    aiAnswer.value = generateAiAnswer(query.trim())
  } finally {
    isAnswering.value = false
  }
}

function generateAiAnswer(q: string) {
  const lower = q.toLowerCase()
  const atRisk = activeAiData.value?.at_risk_stores || []
  const dispatch = activeAiData.value?.salesman_dispatch || []
  const kpis = activeAiData.value?.kpis || {}
  const rawKpis = rawReportData.value?.kpis || {}
  const rtVsWs = rawReportData.value?.rt_vs_ws || []

  // 1. Direct Phone Number & Contact Queries (e.g. "give me phone number of store critical risk", "store contacts")
  if (lower.includes('phone') || lower.includes('contact') || lower.includes('call') || lower.includes('number') || lower.includes('tel')) {
    let targetStores = atRisk
    let filterLabel = 'At-Risk'

    if (lower.includes('critical')) {
      targetStores = atRisk.filter((s: any) => s.risk_level === 'Critical')
      filterLabel = 'Critical Risk'
    } else if (lower.includes('high')) {
      targetStores = atRisk.filter((s: any) => s.risk_level === 'High')
      filterLabel = 'High Risk'
    } else if (lower.includes('wholesale')) {
      targetStores = atRisk.filter((s: any) => String(s.trade_class).toUpperCase().includes('WHOLESALE') || String(s.trade_class).toUpperCase().includes('WS'))
      filterLabel = 'Overdue Wholesale'
    }

    // Check if user specified a salesman's name
    const foundRep = dispatch.find((d: any) => lower.includes(d.salesman_name?.toLowerCase()))
    if (foundRep) {
      targetStores = atRisk.filter((s: any) => s.salesman_name === foundRep.salesman_name)
      filterLabel = `${foundRep.salesman_name}'s Overdue`
    }

    // Check if user asked about a specific store name
    const specificStore = atRisk.find((s: any) => s.shop_name?.toLowerCase().includes(lower) || s.customer_id?.toLowerCase().includes(lower))
    if (specificStore) {
      targetStores = [specificStore]
      filterLabel = specificStore.shop_name
    }

    const count = targetStores.length
    if (count > 0) {
      return {
        title: `Direct Phone Contacts: ${count} ${filterLabel} Account${count !== 1 ? 's' : ''}`,
        summary: `Here are the phone numbers and contact details for the ${count} account${count !== 1 ? 's' : ''} requiring immediate supervisor or salesman call:`,
        stores: targetStores.slice(0, 15),
        points: targetStores.slice(0, 10).map((s: any) => 
          `📞 ${s.shop_name} (${s.customer_id}): ${s.store_contact || 'No phone recorded'} • ${s.province} • Rep: ${s.salesman_name} (${s.days_since_last_order} days late)`
        ),
        action: 'Click the green phone button to call the store owner directly via your device.'
      }
    } else {
      return {
        title: 'No Matching Store Contacts Found',
        summary: 'No overdue accounts matching your filter have registered phone contacts.',
        action: 'Verify customer contact information in the Stores module.'
      }
    }
  }

  // 2. Salesman / Rep questions
  if (lower.includes('salesman') || lower.includes('rep') || lower.includes('staff')) {
    if (dispatch.length > 0) {
      const topRep = dispatch[0]
      const topRepStores = atRisk.filter((s: any) => s.salesman_name === topRep.salesman_name)
      return {
        title: `Sales Rep Priority: ${topRep.salesman_name}`,
        summary: `${topRep.salesman_name} has the highest churn exposure with ${topRep.at_risk_count} overdue accounts totaling $${Math.round(topRep.total_revenue_risk).toLocaleString()} in potential volume at risk.`,
        stores: topRepStores.slice(0, 8),
        points: dispatch.map((r: any) => `${r.salesman_name}: ${r.at_risk_count} accounts overdue ($${Math.round(r.total_revenue_risk).toLocaleString()} risk) — Accounts: ${(r.store_names || []).join(', ')}`),
        action: `Assign sales supervisor to shadow ${topRep.salesman_name} on customer visits this week.`
      }
    }
    return {
      title: 'Sales Rep Dispatch',
      summary: 'All assigned field representatives currently have accounts operating within normal order cadence.',
      action: 'Maintain routine territory route schedules.'
    }
  }

  // 3. Critical stores / Churn Risk questions
  if (lower.includes('critical') || lower.includes('urgent') || lower.includes('churn')) {
    const criticalList = atRisk.filter((s: any) => s.risk_level === 'Critical')
    if (criticalList.length > 0) {
      return {
        title: `${criticalList.length} Accounts in Critical Risk of Churn`,
        summary: `These accounts have exceeded 3x their standard ordering cadence or are past 30 days dormant, putting $${Math.round(criticalList.reduce((acc: number, cur: any) => acc + Number(cur.estimated_revenue_risk || 0), 0)).toLocaleString()} at immediate risk.`,
        stores: criticalList.slice(0, 8),
        points: criticalList.slice(0, 6).map((s: any) => `${s.shop_name} (📞 ${s.store_contact || 'N/A'}, ${s.province}) — ${s.days_since_last_order} days late (Norm: ${s.avg_cycle_days}d). Rep: ${s.salesman_name}`),
        action: 'Schedule in-person supervisor interventions within 48 hours.'
      }
    }
    return {
      title: 'Critical Churn Status',
      summary: 'There are currently zero stores classified at Critical risk level.',
      action: 'Continue monitoring regular re-stock cycles.'
    }
  }

  // 4. Trade Class: Wholesale vs Retail
  if (lower.includes('wholesale') || lower.includes('retail') || lower.includes('channel') || lower.includes('rt') || lower.includes('ws')) {
    const ws = rtVsWs.find((c: any) => c.code === 'WS') || { percentage: 0, revenue: 0, store_count: 0 }
    const rt = rtVsWs.find((c: any) => c.code === 'RT') || { percentage: 0, revenue: 0, store_count: 0 }
    const wsAtRisk = atRisk.filter((s: any) => String(s.trade_class).toUpperCase().includes('WHOLESALE') || String(s.trade_class).toUpperCase().includes('WS'))
    
    return {
      title: 'Trade Channel Balance & Dynamics',
      summary: `Wholesale (WS) represents ${ws.percentage}% of total sales ($${Number(ws.revenue).toLocaleString()}) across ${ws.store_count} stores. Retail (RT) accounts for ${rt.percentage}% ($${Number(rt.revenue).toLocaleString()}) across ${rt.store_count} stores.`,
      stores: wsAtRisk.slice(0, 6),
      points: [
        `Wholesale Exposure: ${wsAtRisk.length} wholesale accounts are currently overdue past their normal cadence.`,
        `Retail Stability: Small retail stores order more frequently with lower individual churn exposure.`,
        `Recommendation: Offer carton volume rebates to wholesale depots while cross-selling secondary SKUs to retail.`
      ],
      action: 'Protect core wholesale depot cashflow and bundle retail diaper packs.'
    }
  }

  // 5. Revenue at Risk questions
  if (lower.includes('revenue') || lower.includes('money') || lower.includes('risk') || lower.includes('cost') || lower.includes('dollar') || lower.includes('$')) {
    return {
      title: `Total Volume at Risk: $${Math.round(kpis.total_at_risk_revenue || 0).toLocaleString()}`,
      summary: `Approximately $${Math.round(kpis.total_at_risk_revenue || 0).toLocaleString()} across ${kpis.at_risk_stores_count || 0} stores is stalled due to missed re-order cycles.`,
      stores: atRisk.slice(0, 6),
      points: [
        `Top concentration: Top 10 stores generate ${kpis.pareto_top10_share || 0}% of total company sales.`,
        `Recovery potential: 65% of this volume can be secured within 7 days by dispatching field reps.`,
        `Retention rate is currently ${kpis.retention_rate || 0}% compared to the prior timeframe.`
      ],
      action: 'Target the top 5 highest-value overdue accounts first for immediate cashflow recovery.'
    }
  }

  // 6. Priorities / Actions for this week
  if (lower.includes('priorit') || lower.includes('action') || lower.includes('week') || lower.includes('todo') || lower.includes('summary')) {
    return {
      title: 'Supervisor Priority Action Plan (Next 7 Days)',
      summary: `With a Network Health Score of ${activeAiData.value?.health_score}/100 (${activeAiData.value?.health_status}), here is the recommended supervisory roadmap:`,
      points: [
        `1. High-Touch Visits: Dispatch reps to ${dispatch[0]?.salesman_name || 'key reps'} accounts (${dispatch[0]?.at_risk_count || 0} overdue stores).`,
        `2. Churn Prevention: Contact top dormant wholesale stores (${atRisk.slice(0, 3).map((s: any) => s.shop_name).join(', ')}).`,
        `3. Margin Protection: Verify that pricing agreements and shelf availability in core 80% accounts are intact.`
      ],
      action: 'Review dispatch list daily during morning sales alignment.'
    }
  }

  // 7. Specific store name search
  const foundStore = atRisk.find((s: any) => s.shop_name?.toLowerCase().includes(lower) || s.customer_id?.toLowerCase().includes(lower))
  if (foundStore) {
    return {
      title: `Store Analysis: ${foundStore.shop_name}`,
      summary: `${foundStore.shop_name} (${foundStore.customer_id}) is currently ${foundStore.days_since_last_order} days late vs their historical ${foundStore.avg_cycle_days}-day reorder interval (${foundStore.overdue_ratio}x cycle overrun). Severity: ${foundStore.risk_level}.`,
      stores: [foundStore],
      points: [
        `Contact Phone: ${foundStore.store_contact || 'No phone recorded'}`,
        `Location: ${foundStore.province} • Trade Class: ${foundStore.trade_class}`,
        `Assigned Sales Representative: ${foundStore.salesman_name}`,
        `Estimated Volume at Risk: $${Number(foundStore.estimated_revenue_risk || 0).toLocaleString()}`,
        `Recommendation: ${foundStore.recommendation}`
      ],
      action: `Contact ${foundStore.shop_name} directly at ${foundStore.store_contact || 'their registered phone'} or dispatch ${foundStore.salesman_name}.`
    }
  }

  // Default synthesis
  return {
    title: `AI Network Synthesis (Score: ${activeAiData.value?.health_score}/100)`,
    summary: `${activeAiData.value?.executive_summary}`,
    stores: atRisk.slice(0, 5),
    points: [
      `Active Stores: ${rawKpis.active_stores_count || 0} (${kpis.active_store_rate}% of registered)`,
      `At-Risk Accounts: ${kpis.at_risk_stores_count || 0} stores ($${Math.round(kpis.total_at_risk_revenue || 0).toLocaleString()} volume at risk)`,
      `Concentration: Top 10 stores contribute ${kpis.pareto_top10_share || 0}% of sales`
    ],
    action: 'Click "Generate Full Report" for an exhaustive breakdown.'
  }
}

// ==========================================
// FULL EXECUTIVE REPORT DOCUMENT MODAL
// ==========================================
const isFullReportModalOpen = ref(false)
const copiedReport = ref(false)

function openFullReportModal() {
  isFullReportModalOpen.value = true
}

function printReport() {
  window.print()
}

function copyReportSummary() {
  const data = activeAiData.value
  if (!data) return

  const text = `*AFC DIRECT SALES — STORE NETWORK AUDIT REPORT*
Period: ${startDate.value} to ${endDate.value}
Health Score: ${data.health_score}/100 (${data.health_status})

EXECUTIVE SUMMARY:
${data.executive_summary}

KEY DIAGNOSTICS:
• Active Stores: ${rawReportData.value?.kpis?.active_stores_count || 0} (${data.kpis?.active_store_rate}% rate)
• Retention Rate: ${data.kpis?.retention_rate}%
• Overdue Accounts: ${data.kpis?.at_risk_stores_count} stores
• Volume at Risk: $${Math.round(data.kpis?.total_at_risk_revenue || 0).toLocaleString()}
• Top 10 Pareto Share: ${data.kpis?.pareto_top10_share}%

TOP AT-RISK ACCOUNTS:
${(data.at_risk_stores || []).slice(0, 6).map((s: any) => `- ${s.shop_name} (${s.province}): ${s.days_since_last_order}d late ($${Math.round(s.estimated_revenue_risk)}) | Rep: ${s.salesman_name}`).join('\n')}

Generated by Built-in AI Store Analyst`

  navigator.clipboard.writeText(text).then(() => {
    copiedReport.value = true
    setTimeout(() => {
      copiedReport.value = false
    }, 2000)
  })
}

async function exportAtRiskStoresToExcel() {
  const stores = filteredAtRiskStores.value
  if (!stores.length) {
    alert('No at-risk stores to export.')
    return
  }

  const columns = [
    { header: 'Customer ID', key: 'customer_id', width: 16, isCenter: true },
    { header: 'Name Shop', key: 'shop_name', width: 28 },
    { header: 'Location (Province)', key: 'province', width: 22 },
    { header: 'Phone Number', key: 'store_contact', width: 18, isCenter: true },
    { header: 'Last Order Date', key: 'last_order_date', width: 18, isDate: true },
    { header: 'Days Overdue', key: 'days_overdue', width: 15, isCenter: true },
    { header: 'Cadence Norm (Days)', key: 'avg_cycle_days', width: 20, isCenter: true },
    { header: 'Amount History ($ At Risk)', key: 'estimated_revenue_risk', width: 24, isCurrency: true },
    { header: 'Average Order Value ($)', key: 'avg_order_value', width: 22, isCurrency: true },
    { header: 'Trade Class', key: 'trade_class', width: 18, isCenter: true },
    { header: 'Assigned Sales Rep', key: 'salesman_name', width: 24 },
    { header: 'Risk Severity', key: 'risk_level', width: 16, isStatusBadge: true }
  ]

  const data = stores.map((st: any) => ({
    customer_id: st.customer_id || ('STORE-' + st.store_id),
    shop_name: st.shop_name,
    province: st.province || 'Phnom Penh',
    store_contact: st.store_contact || 'N/A',
    last_order_date: st.last_order_date || 'N/A',
    days_overdue: st.days_since_last_order || 0,
    avg_cycle_days: st.avg_cycle_days || 0,
    estimated_revenue_risk: Number(st.estimated_revenue_risk || 0),
    avg_order_value: Number(st.avg_order_value || 0),
    trade_class: st.trade_class || 'General',
    salesman_name: st.salesman_name || 'Unassigned',
    risk_level: st.risk_level || 'Moderate'
  }))

  const dateStr = new Date().toISOString().slice(0, 10)
  await exportStyledExcel({
    title: 'AFC Direct Sales — At-Risk Accounts & Churn Early-Warning Report',
    subtitle: `Period: ${startDate.value} to ${endDate.value} • Severity: ${riskFilter.value.toUpperCase()}`,
    sheetName: 'At-Risk Accounts',
    filename: `at_risk_stores_audit_${dateStr}`,
    columns,
    data
  })
}

// ==========================================
// STORE DETAILS MODAL
// ==========================================
const isStoreDetailModalOpen = ref(false)
const selectedStoreForModal = ref<any>(null)
const loadingStoreOrdersModal = ref(false)
const storeOrdersModalData = ref<any[]>([])
const storeProfileModalData = ref<any>(null)
const storeOrdersSearchQuery = ref('')

async function openStoreDetailsModal(store: any) {
  if (!store) return
  selectedStoreForModal.value = store
  isStoreDetailModalOpen.value = true
  loadingStoreOrdersModal.value = true
  storeOrdersModalData.value = []
  storeProfileModalData.value = null

  try {
    const storeId = store.store_id || store.id
    // Fetch store past orders history without restricting to current month
    // because at-risk stores have not ordered in the current month
    const res = await api.get(`/stores/${storeId}/orders`) as any
    storeProfileModalData.value = res.store || {}
    storeOrdersModalData.value = res.orders || []
  } catch (err) {
    console.error('Failed to load store orders details:', err)
  } finally {
    loadingStoreOrdersModal.value = false
  }
}

function openInvoice(order: any) {
  if (order.invoice_url) {
    window.open(order.invoice_url, '_blank')
  } else if (order.id || order.order_id) {
    navigateTo(`/admin/orders/${order.id || order.order_id}`)
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
      String(o.so_number || '').toLowerCase().includes(q) ||
      String(o.id || '').toLowerCase().includes(q) ||
      String(o.user?.name || '').toLowerCase().includes(q)
    )
  }
  return list
})

// Visual badge & progress helpers
const healthBadgeStyle = computed(() => {
  const status = activeAiData.value?.health_status || ''
  if (status === 'Excellent') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'Good') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (status === 'Needs Attention') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
})

const healthProgressColor = computed(() => {
  const score = activeAiData.value?.health_score || 0
  if (score >= 82) return 'bg-emerald-500'
  if (score >= 70) return 'bg-blue-500'
  if (score >= 52) return 'bg-amber-500'
  return 'bg-rose-500'
})

function getSeverityBadgeClass(level: string): string {
  if (level === 'Critical') return 'bg-rose-50 text-rose-700 border-rose-200'
  if (level === 'High') return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-blue-50 text-blue-700 border-blue-200'
}

function getInsightBorderClass(type: string): string {
  if (type === 'risk') return 'border-rose-200/80 bg-rose-50/20'
  if (type === 'growth') return 'border-emerald-200/80 bg-emerald-50/20'
  return 'border-indigo-200/80 bg-indigo-50/20'
}

function getInsightBadgeClass(type: string): string {
  if (type === 'risk') return 'bg-rose-50 text-rose-700 border-rose-200'
  if (type === 'growth') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return 'bg-indigo-50 text-indigo-700 border-indigo-200'
}

function getInsightIcon(type: string): string {
  if (type === 'risk') return 'heroicons:exclamation-triangle'
  if (type === 'growth') return 'heroicons:arrow-trending-up'
  return 'heroicons:light-bulb'
}

function getInsightIconColor(type: string): string {
  if (type === 'risk') return 'text-rose-600'
  if (type === 'growth') return 'text-emerald-600'
  return 'text-indigo-600'
}
</script>

<style>
@media print {
  body * {
    visibility: hidden;
  }
  #ai-executive-report-content,
  #ai-executive-report-content * {
    visibility: visible;
  }
  #ai-executive-report-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20px;
    background: white !important;
  }
}
</style>
