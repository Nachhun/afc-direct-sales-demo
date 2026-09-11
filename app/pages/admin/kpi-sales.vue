<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
        <Icon name="heroicons:currency-dollar" class="w-64 h-64 text-white" />
      </div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 text-blue-400 rounded-2xl flex items-center justify-center font-black shadow-inner">
              <Icon name="heroicons:currency-dollar" class="w-7 h-7" />
            </div>
            <div>
              <span class="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                Field Operations KPI
              </span>
              <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">Sales KPI Management</h1>
            </div>
          </div>
          <p class="text-slate-300 text-xs sm:text-sm font-medium mt-2 max-w-xl leading-relaxed">
            Audit, track, and record field sales performance, logged revenue, and location coordinates for sales representatives.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button
            @click="exportToCSV"
            class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
            title="Export filtered records to CSV"
          >
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            @click="fetchSales(1)"
            class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2"
            :disabled="loading"
          >
            <Icon name="heroicons:arrow-path" class="w-4 h-4 text-blue-400" :class="{ 'animate-spin': loading }" />
            <span>Refresh</span>
          </button>

          <button
            @click="openModal()"
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 group active:scale-95"
          >
            <Icon name="heroicons:plus-circle" class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-white" />
            <span>Log KPI Sale</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Date Preset Bar & Summary Metric Cards -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest">Performance Metrics Summary</h2>
        <div class="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl">
          <button
            v-for="preset in datePresets"
            :key="preset.id"
            @click="applyPreset(preset.id)"
            :class="activePreset === preset.id ? 'bg-white text-slate-900 shadow-sm font-black' : 'text-slate-500 hover:text-slate-900 font-bold'"
            class="px-3 py-1 rounded-xl text-[10px] uppercase tracking-wider transition-all"
          >
            {{ preset.label }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Total Sales Entries -->
        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total KPI Records</span>
            <div class="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="heroicons:clipboard-document-check" class="w-5 h-5" />
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-black text-slate-900 mt-3">{{ totalSalesCount }}</p>
          <div class="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold">
            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Filtered records loaded</span>
          </div>
        </div>

        <!-- Card 2: Total Revenue -->
        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Logged Revenue</span>
            <div class="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="heroicons:banknotes" class="w-5 h-5" />
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-black text-emerald-600 mt-3">${{ formatNumber(totalRevenue) }}</p>
          <div class="flex items-center gap-1.5 mt-1 text-[10px] text-emerald-600 font-bold">
            <Icon name="heroicons:arrow-trending-up" class="w-3.5 h-3.5" />
            <span>Sum of current dataset</span>
          </div>
        </div>

        <!-- Card 3: Top Sales Rep -->
        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Sales Agent</span>
            <div class="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="heroicons:trophy" class="w-5 h-5" />
            </div>
          </div>
          <p class="text-lg font-black text-slate-900 mt-3 truncate" :title="topAgentName">{{ topAgentName }}</p>
          <div class="flex items-center gap-1.5 mt-1 text-[10px] text-purple-600 font-bold">
            <span>${{ formatNumber(topAgentRevenue) }} total logged</span>
          </div>
        </div>

        <!-- Card 4: Average Sale Amount -->
        <div class="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Logged Value</span>
            <div class="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="heroicons:calculator" class="w-5 h-5" />
            </div>
          </div>
          <p class="text-2xl sm:text-3xl font-black text-amber-600 mt-3">${{ formatNumber(avgSaleAmount) }}</p>
          <div class="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-bold">
            <span>Average per sales entry</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Controls -->
    <div class="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div class="flex-1 flex flex-col sm:flex-row items-center gap-3">
          <!-- Search Input -->
          <div class="relative w-full sm:w-72">
            <Icon name="heroicons:magnifying-glass" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="filters.search"
              @input="debouncedFetch"
              type="text"
              placeholder="Search by agent name or note..."
              class="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            <button
              v-if="filters.search"
              @click="filters.search = ''; fetchSales(1)"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Sales Agent Dropdown -->
          <div class="w-full sm:w-64">
            <select
              v-model="filters.user_id"
              @change="fetchSales(1)"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            >
              <option :value="null">All Sales Representatives</option>
              <option v-for="user in salesRepresentatives" :key="user.id" :value="user.id">
                {{ user.name }}{{ user.salesman_type?.name ? ' · ' + user.salesman_type.name : '' }}
              </option>
            </select>
          </div>

          <!-- Custom Date Range -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input
              v-model="filters.start_date"
              @change="onCustomDateChange"
              type="date"
              class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
            />
            <span class="text-slate-400 text-xs font-bold">to</span>
            <input
              v-model="filters.end_date"
              @change="onCustomDateChange"
              type="date"
              class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 rounded-2xl transition-all border border-rose-100 shrink-0"
        >
          <Icon name="heroicons:arrow-path-reset" class="w-4 h-4" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50/70">
              <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">KPI Log Entry</th>
              <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Sales Representative</th>
              <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Sale Amount</th>
              <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">GPS Location</th>
              <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Note / Details</th>
              <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading && sales.length === 0">
              <td colspan="6" class="px-6 py-16 text-center text-slate-400">
                <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                <span class="text-xs font-bold uppercase tracking-wider">Fetching KPI Sales Database...</span>
              </td>
            </tr>

            <tr v-else-if="sales.length === 0">
              <td colspan="6" class="px-6 py-16 text-center">
                <div class="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="heroicons:currency-dollar" class="w-8 h-8" />
                </div>
                <p class="text-base font-black text-slate-700">No Sales KPI Records Found</p>
                <p class="text-xs text-slate-400 font-medium max-w-sm mx-auto mt-1">
                  There are no sales logged matching your current criteria. You can log a new KPI sale or clear filters.
                </p>
                <button
                  @click="openModal()"
                  class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Log First KPI Sale
                </button>
              </td>
            </tr>

            <tr v-for="sale in sales" :key="sale.id" class="hover:bg-slate-50/80 transition-colors group">
              <!-- ID & Date -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="font-black text-slate-900 text-sm">#{{ sale.id }}</span>
                  <span
                    v-if="isToday(sale.created_at)"
                    class="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[8px] font-black uppercase"
                  >
                    Today
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 font-bold mt-0.5">
                  {{ formatDate(sale.created_at) }}
                </div>
              </td>

              <!-- Sales Representative -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-xs font-black shrink-0 shadow-md shadow-blue-200">
                    {{ sale.user?.name?.charAt(0).toUpperCase() || 'U' }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-900 leading-tight truncate">
                      {{ sale.user?.name || 'Unknown User' }}
                    </p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span class="text-[9px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {{ sale.user?.role?.replace('_', ' ') || 'Salesman' }}
                      </span>
                      <span v-if="sale.user?.salesman_type?.name" class="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                        {{ sale.user.salesman_type.name }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Amount -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-base font-black" :class="Number(sale.amount) >= 500 ? 'text-emerald-600' : 'text-slate-900'">
                    ${{ formatNumber(sale.amount) }}
                  </span>
                  <span
                    v-if="Number(sale.amount) >= 500"
                    class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[8px] font-black uppercase"
                  >
                    High Value
                  </span>
                </div>
              </td>

              <!-- Coordinates -->
              <td class="px-6 py-4">
                <a
                  :href="getMapUrl(sale.latitude, sale.longitude)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-bold transition-colors group/map"
                  title="Open coordinates in map"
                >
                  <Icon name="heroicons:map-pin" class="w-3.5 h-3.5 text-rose-500 group-hover/map:scale-110 transition-transform" />
                  <span>{{ Number(sale.latitude).toFixed(4) }}, {{ Number(sale.longitude).toFixed(4) }}</span>
                </a>
              </td>

              <!-- Note -->
              <td class="px-6 py-4">
                <p class="text-xs text-slate-600 max-w-xs truncate" :title="sale.note">
                  {{ sale.note || '-' }}
                </p>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="viewDetail(sale)"
                    class="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-800 transition-colors"
                    title="View Full Details"
                  >
                    <Icon name="heroicons:eye" class="w-4 h-4" />
                  </button>

                  <button
                    @click="openModal(sale)"
                    class="p-2 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors"
                    title="Edit KPI Sale"
                  >
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>

                  <button
                    @click="confirmDelete(sale)"
                    class="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Record"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > pagination.per_page" class="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs text-slate-500 font-bold">
          Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} records
        </p>
        <div class="flex items-center gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Previous
          </button>
          <span class="text-xs font-black text-slate-800 px-3">Page {{ pagination.current_page }} of {{ pagination.last_page }}</span>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.last_page"
            class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- ===== CREATE / EDIT MODAL ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl relative">
          <button @click="showModal = false" class="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-3.5 mb-6">
            <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">
              <Icon :name="editingSale ? 'heroicons:pencil-square' : 'heroicons:plus-circle'" class="w-7 h-7" />
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900">{{ editingSale ? 'Edit KPI Sale Entry #' + editingSale.id : 'Log New KPI Sale' }}</h2>
              <p class="text-xs text-slate-400 font-medium">Record sales performance metrics into the system.</p>
            </div>
          </div>

          <form @submit.prevent="saveSale" class="space-y-4">
            <!-- Sales Representative Selector -->
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Sales Representative *</label>
              <select
                v-model="form.user_id"
                required
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              >
                <option :value="null" disabled>Select Sales Agent</option>
                <option v-for="user in formSalesRepresentatives" :key="user.id" :value="user.id">
                  {{ user.name }}{{ user.salesman_type?.name ? ' · ' + user.salesman_type.name : '' }}
                </option>
              </select>
            </div>

            <!-- Amount ($) & Quick Buttons -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-black uppercase tracking-wider text-slate-500">Sale Amount ($) *</label>
                <div class="flex gap-1">
                  <button
                    v-for="quick in [100, 250, 500, 1000]"
                    :key="quick"
                    type="button"
                    @click="form.amount = (form.amount || 0) + quick"
                    class="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded text-[9px] font-black text-slate-600 transition-colors"
                  >
                    +${{ quick }}
                  </button>
                </div>
              </div>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                <input
                  v-model.number="form.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  class="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>



            <!-- Note / Description -->
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Note / Description</label>
              <textarea
                v-model="form.note"
                rows="3"
                placeholder="Log details, store name, or promotion notes..."
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
              ></textarea>
            </div>

            <!-- Custom Created At Date -->
            <div>
              <label class="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Log Date & Time</label>
              <input
                v-model="form.created_at"
                type="datetime-local"
                class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            <div v-if="formError" class="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-600">
              {{ formError }}
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                @click="showModal = false"
                class="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
              >
                <Icon v-if="saving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                <span>{{ editingSale ? 'Update KPI Entry' : 'Save KPI Entry' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ===== DETAIL VIEW MODAL ===== -->
    <Teleport to="body">
      <div v-if="detailModal.show && detailModal.sale" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl relative">
          <button @click="detailModal.show = false" class="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
              <Icon name="heroicons:clipboard-document-text" class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900">KPI Log Entry #{{ detailModal.sale.id }}</h2>
              <p class="text-xs text-slate-400 font-medium">{{ formatDate(detailModal.sale.created_at) }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Amount</span>
                <span class="text-xl font-black text-emerald-600">${{ formatNumber(detailModal.sale.amount) }}</span>
              </div>
              <div class="flex justify-between items-center border-t border-slate-200/60 pt-2">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Sales Agent</span>
                <span class="text-xs font-bold text-slate-800">{{ detailModal.sale.user?.name || 'Unknown' }}</span>
              </div>
              <div class="flex justify-between items-center border-t border-slate-200/60 pt-2">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">Coordinates</span>
                <a
                  :href="getMapUrl(detailModal.sale.latitude, detailModal.sale.longitude)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Icon name="heroicons:map-pin" class="w-3.5 h-3.5 text-rose-500" />
                  {{ detailModal.sale.latitude }}, {{ detailModal.sale.longitude }}
                </a>
              </div>
            </div>

            <div>
              <span class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Full Note / Remarks</span>
              <p class="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl p-4 min-h-[80px] whitespace-pre-wrap leading-relaxed">
                {{ detailModal.sale.note || 'No notes attached to this record.' }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
            <button
              @click="openModal(detailModal.sale); detailModal.show = false"
              class="px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Edit Entry
            </button>
            <button
              @click="detailModal.show = false"
              class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
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
import { ref, reactive, computed, onMounted } from 'vue'

const api = useApi()
const authStore = useAuthStore()

// Data states
const sales = ref<any[]>([])
const users = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const activePreset = ref('all')

const datePresets = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: '7 Days' },
  { id: '30days', label: '30 Days' },
  { id: 'all', label: 'All Time' },
]

// Filters
const filters = reactive({
  search: '',
  user_id: null as number | null,
  start_date: '',
  end_date: '',
})

// Pagination
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  per_page: 50,
  total: 0,
  from: 0,
  to: 0,
})

// Modal & Form State
const showModal = ref(false)
const editingSale = ref<any>(null)
const formError = ref('')
const form = reactive({
  user_id: null as number | null,
  amount: 0,
  latitude: 11.5564,
  longitude: 104.9282,
  note: '',
  created_at: '',
})

// Detail modal
const detailModal = reactive({
  show: false,
  sale: null as any,
})

// Filtered active sales representatives
const salesRepresentatives = computed(() => {
  return users.value.filter((u: any) => {
    const isActive = u.is_active !== false && u.is_active !== 0 && u.is_active !== '0'
    if (!isActive) return false
    const role = String(u.role || '').toLowerCase().trim()
    const isSalesRole = ['salesman', 'asm', 'sale_admin', 'sale admin', 'sales_rep'].includes(role) || !!u.salesman_type_id || !!u.salesman_type
    return isSalesRole
  })
})

// Options list for form select (includes active sales reps + currently edited user if any)
const formSalesRepresentatives = computed(() => {
  const list = [...salesRepresentatives.value]
  if (editingSale.value && editingSale.value.user_id) {
    const exists = list.some(u => u.id === editingSale.value.user_id)
    if (!exists) {
      const u = users.value.find(x => x.id === editingSale.value.user_id) || editingSale.value.user
      if (u) {
        list.unshift(u)
      }
    }
  }
  return list
})

let debounceTimer: any = null

const hasActiveFilters = computed(() => {
  return !!filters.search || filters.user_id !== null || !!filters.start_date || !!filters.end_date
})

const totalSalesCount = computed(() => pagination.total || sales.value.length)

const totalRevenue = computed(() => {
  return sales.value.reduce((sum, s) => sum + Number(s.amount || 0), 0)
})

const avgSaleAmount = computed(() => {
  if (sales.value.length === 0) return 0
  return totalRevenue.value / sales.value.length
})

const topAgentName = computed(() => {
  if (sales.value.length === 0) return 'N/A'
  const agentTotals: Record<string, number> = {}
  sales.value.forEach(s => {
    const name = s.user?.name || 'Unknown'
    agentTotals[name] = (agentTotals[name] || 0) + Number(s.amount || 0)
  })
  let topName = 'N/A'
  let max = 0
  Object.entries(agentTotals).forEach(([name, amt]) => {
    if (amt > max) {
      max = amt
      topName = name
    }
  })
  return topName
})

const topAgentRevenue = computed(() => {
  if (sales.value.length === 0) return 0
  const agentTotals: Record<string, number> = {}
  sales.value.forEach(s => {
    const name = s.user?.name || 'Unknown'
    agentTotals[name] = (agentTotals[name] || 0) + Number(s.amount || 0)
  })
  return Math.max(0, ...Object.values(agentTotals))
})

onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    fetchSales(1)
  ])
})

async function fetchUsers() {
  try {
    const res: any = await api.get('/admin/users?active_only=1')
    const raw = Array.isArray(res) ? res : (res.data || [])
    users.value = raw.filter((u: any) => u.is_active !== false && u.is_active !== 0)
  } catch (e) {
    console.error('Failed to fetch users', e)
  }
}

async function fetchSales(page = 1) {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', page.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.user_id) params.append('user_id', filters.user_id.toString())
    if (filters.start_date) params.append('start_date', filters.start_date)
    if (filters.end_date) params.append('end_date', filters.end_date)

    const res: any = await api.get(`/admin/sales?${params.toString()}`)
    if (res.data) {
      sales.value = res.data
      pagination.current_page = res.current_page
      pagination.last_page = res.last_page
      pagination.per_page = res.per_page
      pagination.total = res.total
      pagination.from = res.from || 1
      pagination.to = res.to || res.data.length
    } else {
      sales.value = Array.isArray(res) ? res : []
      pagination.total = sales.value.length
    }
  } catch (e: any) {
    console.error('Failed to fetch sales', e)
  } finally {
    loading.value = false
  }
}

function applyPreset(presetId: string) {
  activePreset.value = presetId
  const now = new Date()
  if (presetId === 'today') {
    const dStr = now.toISOString().slice(0, 10)
    filters.start_date = dStr
    filters.end_date = dStr
  } else if (presetId === '7days') {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    filters.start_date = start.toISOString().slice(0, 10)
    filters.end_date = now.toISOString().slice(0, 10)
  } else if (presetId === '30days') {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    filters.start_date = start.toISOString().slice(0, 10)
    filters.end_date = now.toISOString().slice(0, 10)
  } else {
    filters.start_date = ''
    filters.end_date = ''
  }
  fetchSales(1)
}

function onCustomDateChange() {
  activePreset.value = 'custom'
  fetchSales(1)
}

function debouncedFetch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    fetchSales(1)
  }, 350)
}

function clearFilters() {
  filters.search = ''
  filters.user_id = null
  filters.start_date = ''
  filters.end_date = ''
  activePreset.value = 'all'
  fetchSales(1)
}

function changePage(page: number) {
  if (page < 1 || page > pagination.last_page) return
  fetchSales(page)
}

function openModal(sale?: any) {
  formError.value = ''
  if (sale) {
    editingSale.value = sale
    form.user_id = sale.user_id
    form.amount = Number(sale.amount || 0)
    form.latitude = sale.latitude ? Number(sale.latitude) : 11.5564
    form.longitude = sale.longitude ? Number(sale.longitude) : 104.9282
    form.note = sale.note || ''
    form.created_at = toLocalDatetimeInput(sale.created_at)
  } else {
    editingSale.value = null
    const defaultRep = salesRepresentatives.value.find(u => u.id === authStore.user?.id) || salesRepresentatives.value[0]
    form.user_id = defaultRep ? defaultRep.id : null
    form.amount = 0
    form.latitude = 11.5564
    form.longitude = 104.9282
    form.note = ''
    form.created_at = toLocalDatetimeInput()
  }
  showModal.value = true
}

function viewDetail(sale: any) {
  detailModal.sale = sale
  detailModal.show = true
}

function setPhnomPenhLocation() {
  form.latitude = 11.5564
  form.longitude = 104.9282
}

function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form.latitude = Number(pos.coords.latitude.toFixed(6))
        form.longitude = Number(pos.coords.longitude.toFixed(6))
      },
      (err) => {
        alert('Could not retrieve current position: ' + err.message)
      }
    )
  } else {
    alert('Geolocation is not supported by your browser.')
  }
}

async function saveSale() {
  formError.value = ''
  if (!form.user_id) {
    formError.value = 'Please select a Sales Representative'
    return
  }
  if (form.amount < 0) {
    formError.value = 'Amount cannot be negative'
    return
  }

  saving.value = true
  try {
    const payload = {
      user_id: form.user_id,
      amount: form.amount,
      latitude: form.latitude,
      longitude: form.longitude,
      note: form.note,
      created_at: form.created_at ? form.created_at.replace('T', ' ') : null,
    }

    if (editingSale.value) {
      await api.put(`/admin/sales/${editingSale.value.id}`, payload)
    } else {
      await api.post('/admin/sales', payload)
    }

    showModal.value = false
    await fetchSales(pagination.current_page)
  } catch (e: any) {
    formError.value = e?.data?.message || e?.message || 'Failed to save KPI sale record'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(sale: any) {
  if (!confirm(`Are you sure you want to delete KPI Sale record #${sale.id} ($${sale.amount}) for ${sale.user?.name || 'this agent'}?`)) {
    return
  }
  try {
    await api.del(`/admin/sales/${sale.id}`)
    await fetchSales(pagination.current_page)
  } catch (e: any) {
    alert(e?.data?.message || 'Failed to delete sale record')
  }
}

function exportToCSV() {
  if (sales.value.length === 0) {
    alert('No data available to export.')
    return
  }
  let csv = 'ID,Timestamp,Salesman,Role,Classification,Amount,Latitude,Longitude,Note\n'
  sales.value.forEach(s => {
    const name = `"${(s.user?.name || '').replace(/"/g, '""')}"`
    const role = `"${(s.user?.role || '').replace(/"/g, '""')}"`
    const type = `"${(s.user?.salesman_type?.name || '').replace(/"/g, '""')}"`
    const note = `"${(s.note || '').replace(/"/g, '""')}"`
    csv += `${s.id},${s.created_at},${name},${role},${type},${s.amount},${s.latitude},${s.longitude},${note}\n`
  })

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `kpi_sales_export_${new Date().toISOString().substring(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function formatNumber(val: any) {
  return Number(val || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toLocalDatetimeInput(dateStr?: string | Date): string {
  const d = dateStr ? new Date(dateStr) : new Date()
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function isToday(dateStr: string) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

function getMapUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
</script>
