<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Store Directory</h1>
          <span v-if="!loading" class="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">Total: {{ totalStores }}</span>
        </div>
        <p class="text-slate-500 text-sm mt-1">Manage and view all registered stores and customer profiles.</p>
      </div>
      <div class="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
        <div class="relative max-w-sm w-full">
          <input 
            v-model="searchQuery" 
            @input="debounceSearch"
            type="text" 
            placeholder="Search stores, ID, phone..." 
            class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
          >
          <Icon name="heroicons:magnifying-glass" class="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <button @click="exportExcel" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0">
          <Icon name="heroicons:document-arrow-down" class="w-4 h-4" />
          Export Excel
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[60vh]">
      <div v-if="loading" class="flex-1 flex flex-col items-center justify-center py-20">
        <div class="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Stores...</p>
      </div>
      
      <div v-else-if="stores.length === 0" class="flex-1 flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
          <Icon name="heroicons:building-storefront" class="w-8 h-8" />
        </div>
        <h3 class="text-slate-900 font-black text-lg">No stores found</h3>
        <p class="text-slate-500 text-sm mt-1">We couldn't find any stores matching your criteria.</p>
        <button v-if="searchQuery" @click="clearSearch" class="mt-4 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
          Clear Search
        </button>
      </div>

      <div v-else class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Main Store Info</th>
              <th class="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Main Location</th>
              <th class="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Contact & ID</th>
              <th class="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Store Settings</th>
              <th class="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Orders</th>
              <th class="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(store, idx) in stores" :key="idx" class="hover:bg-slate-50/50 transition-colors group">
              <td class="py-4 px-6 align-top">
                <NuxtLink :to="`/admin/stores/${store.id}/orders`" class="flex items-start gap-3 cursor-pointer group/store">
                  <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover/store:bg-blue-600 group-hover/store:text-white transition-all shadow-sm">
                    <Icon name="heroicons:building-storefront" class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="text-slate-900 font-black text-sm group-hover/store:text-blue-600 transition-colors">
                      {{ store.shop_name }}
                    </h4>
                    <div class="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span v-if="store.is_new_store" class="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded shadow-sm">New Store</span>
                      <span class="text-[9px] font-black text-blue-600 bg-blue-50 group-hover/store:bg-blue-100 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest inline-flex items-center gap-1">
                        <Icon name="heroicons:document-text" class="w-3 h-3" /> View Invoices
                      </span>
                    </div>
                  </div>
                </NuxtLink>
              </td>
              
              <td class="py-4 px-6 align-top max-w-[220px]">
                <span class="inline-block text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 tracking-wider mb-1">📍 Main Location</span>
                <p class="text-slate-900 font-bold text-xs truncate">{{ store.province }} {{ store.district ? '› ' + store.district : '' }}</p>
                <p class="text-slate-500 text-[10px] mt-0.5 truncate" :title="store.customer_address">{{ store.customer_address || 'Address not specified' }}</p>
                <a v-if="isValidCoords(store.location)" :href="`https://www.google.com/maps?q=${store.location}`" target="_blank" 
                   class="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">
                  <Icon name="heroicons:map" class="w-3 h-3" /> GPS Map
                </a>
              </td>

              <td class="py-4 px-6 align-top">
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center gap-1.5">
                    <Icon name="heroicons:phone" class="w-3.5 h-3.5 text-slate-400" />
                    <span class="text-slate-900 font-bold text-xs">{{ store.contact || 'N/A' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <Icon name="heroicons:identification" class="w-3.5 h-3.5 text-slate-400" />
                    <span class="text-slate-600 font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{{ store.customer_id || 'N/A' }}</span>
                  </div>
                </div>
              </td>

              <td class="py-4 px-6 align-top">
                <div class="flex flex-col gap-1.5">
                  <span v-if="store.store_type" class="w-max px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded">{{ store.store_type }}</span>
                  <span v-else class="text-slate-400 text-[10px] font-bold italic">No Type</span>

                  <span v-if="store.visit_frequency" class="w-max px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded">Freq: {{ store.visit_frequency }}</span>
                  <span v-else class="text-slate-400 text-[10px] font-bold italic">No Freq</span>

                  <div v-if="store.trade_class_l1 || store.trade_class_l2 || store.trade_class_l3" class="mt-1 flex flex-col gap-1">
                    <span v-if="store.trade_class_l1" class="w-max px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded" :title="store.trade_class_l1">L1: {{ store.trade_class_l1.substring(0, 15) }}{{ store.trade_class_l1.length > 15 ? '...' : '' }}</span>
                    <span v-if="store.trade_class_l2" class="w-max px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded" :title="store.trade_class_l2">L2: {{ store.trade_class_l2.substring(0, 15) }}{{ store.trade_class_l2.length > 15 ? '...' : '' }}</span>
                    <span v-if="store.trade_class_l3" class="w-max px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded" :title="store.trade_class_l3">L3: {{ store.trade_class_l3.substring(0, 15) }}{{ store.trade_class_l3.length > 15 ? '...' : '' }}</span>
                  </div>
                </div>
              </td>

              <td class="py-4 px-6 align-top text-right">
                <NuxtLink :to="`/admin/stores/${store.id}/orders`" class="flex flex-col items-end gap-1 cursor-pointer group/orders">
                  <span class="text-slate-900 group-hover/orders:text-blue-600 font-black text-lg bg-slate-50 group-hover/orders:bg-blue-50 px-3 py-1 rounded-xl border border-slate-200 group-hover/orders:border-blue-200 transition-all flex items-center gap-1.5">
                    <Icon name="heroicons:document-text" class="w-4.5 h-4.5 text-blue-600" />
                    {{ store.total_orders }}
                  </span>
                  <p class="text-slate-400 text-[9px] uppercase font-bold tracking-widest flex items-center gap-1">
                    Last: {{ new Date(store.last_order_date).toLocaleDateString() }}
                  </p>
                </NuxtLink>
              </td>
              <td class="py-4 px-6 align-top text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink :to="`/admin/stores/${store.id}/orders`" class="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="View Store Orders & Invoices">
                    <Icon name="heroicons:document-text" class="w-5 h-5" />
                  </NuxtLink>
                  <NuxtLink :to="`/order/new?store_id=${store.id}`" class="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Create New Order for this Store">
                    <Icon name="heroicons:plus-circle" class="w-5 h-5" />
                  </NuxtLink>
                  <button @click="openEditModal(store)" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors" title="Edit Store Profile">
                    <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="border-t border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
        <p class="text-xs text-slate-500 font-bold hidden sm:block">
          Showing <span class="text-slate-900">{{ (currentPage - 1) * 20 + 1 }}</span> to <span class="text-slate-900">{{ Math.min(currentPage * 20, totalStores) }}</span> of <span class="text-slate-900">{{ totalStores }}</span> stores
        </p>
        <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            @click="fetchStores(currentPage - 1)" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Prev
          </button>
          <div class="flex items-center gap-1">
            <span class="text-xs font-bold text-slate-900 mx-2">Page {{ currentPage }} of {{ totalPages }}</span>
          </div>
          <button 
            @click="fetchStores(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
    <!-- Edit Store Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-2xl p-8 rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
          <button @click="showModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
          
          <h3 class="text-xl font-black text-slate-900 mb-2">Edit Store Profile</h3>
          <p class="text-slate-500 text-xs mb-6">Modify store identity, contact info, location details and settings.</p>
          
          <form @submit.prevent="submitEditStore" class="space-y-5 overflow-y-auto pr-1 flex-1">
            <!-- Shop Name & Customer ID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Shop Name *</label>
                <input v-model="editForm.shop_name" class="input-field" required placeholder="e.g. Pharmacy Norea" />
              </div>
              <div>
                <label class="label">Customer ID (SO Account #)</label>
                <input v-model="editForm.customer_id" class="input-field" placeholder="e.g. AFC-0002028" />
              </div>
            </div>

            <!-- Contact & Is New Store -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label class="label">Contact Phone</label>
                <input v-model="editForm.contact" class="input-field" placeholder="e.g. 012345678" />
              </div>
              <div class="flex items-center gap-3 pt-6">
                <input type="checkbox" id="is_new_store" v-model="editForm.is_new_store" class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <label for="is_new_store" class="text-xs font-bold text-slate-700 select-none">New Store Tag</label>
              </div>
            </div>

            <!-- Location Coordinates & Geocoding -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label">Location / GPS Coordinates</label>
                <div class="relative group">
                  <input v-model="editForm.location" class="input-field pr-12" placeholder="Latitude, Longitude" />
                  <button 
                    type="button" 
                    @click="getDeviceLocation"
                    :disabled="gettingLocation"
                    class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 group/gps"
                  >
                    <Icon v-if="gettingLocation" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                    <Icon v-else name="heroicons:map-pin" class="w-4 h-4 group-hover/gps:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
              <div>
                <label class="label">Address Description</label>
                <input v-model="editForm.customer_address" class="input-field" placeholder="e.g. Street 105, Boeung Trabek" />
              </div>
            </div>

            <!-- Province, District, Commune -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="label">Province</label>
                <input v-model="editForm.province" class="input-field" placeholder="e.g. Phnom Penh" />
              </div>
              <div>
                <label class="label">District</label>
                <input v-model="editForm.district" class="input-field" placeholder="e.g. Chamkar Mon" />
              </div>
              <div>
                <label class="label">Commune</label>
                <input v-model="editForm.commune" class="input-field" placeholder="e.g. Boeung Trabek" />
              </div>
            </div>

            <!-- Store Profile & Visit Freq -->
            <div>
              <label class="label">Store Profile Settings</label>
              <select v-model="editForm.store_profile_id" class="input-field">
                <option value="">None</option>
                <option v-for="profile in ratingStoreProfiles" :key="profile.id" :value="profile.id">
                  {{ profile.name }} ({{ profile.visit_frequency }})
                </option>
              </select>
            </div>

            <!-- Trade Class hierarchy -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="label">Trade Class (L1)</label>
                <select v-model="editForm.trade_class_l1" class="input-field">
                  <option value="">None</option>
                  <option v-for="opt in tradeClassL1Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div>
                <label class="label">Trade Type (L2)</label>
                <select v-model="editForm.trade_class_l2" :disabled="!editForm.trade_class_l1" class="input-field">
                  <option value="">None</option>
                  <option v-for="opt in editTradeClassL2Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div>
                <label class="label">Sub Type (L3)</label>
                <select v-model="editForm.trade_class_l3" :disabled="!editForm.trade_class_l2" class="input-field">
                  <option value="">None</option>
                  <option v-for="opt in editTradeClassL3Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
            </div>

            <div v-if="formError" class="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-xs font-bold leading-relaxed">{{ formError }}</div>
            
            <div class="flex gap-4 pt-4 border-t border-slate-100">
              <button type="button" @click="showModal = false" class="btn-secondary flex-1 py-3">Discard</button>
              <button type="submit" class="btn-primary flex-1 py-3" :disabled="submitLoading">
                {{ submitLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Store Orders & Invoices Modal -->
    <Teleport to="body">
      <div v-if="showOrdersModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-4xl p-6 sm:p-8 rounded-3xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
          <button @click="showOrdersModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 pr-8">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                <Icon name="heroicons:building-storefront" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                  {{ selectedStore?.shop_name }}
                  <span class="text-[9px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Main Location</span>
                </h3>
                <p class="text-slate-500 text-xs flex items-center gap-3 flex-wrap mt-0.5">
                  <span v-if="selectedStore?.customer_id" class="font-bold text-slate-700">ID: {{ selectedStore.customer_id }}</span>
                  <span v-if="selectedStore?.contact" class="font-bold text-slate-700">Tel: {{ selectedStore.contact }}</span>
                  <span v-if="selectedStore?.customer_address || selectedStore?.province" class="text-slate-600 font-medium">📍 {{ selectedStore?.customer_address || (selectedStore?.province + ' ' + (selectedStore?.district || '')) }}</span>
                  <span v-if="selectedStore?.location" class="bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded text-[10px]">GPS: {{ selectedStore.location }}</span>
                </p>
              </div>
            </div>

            <NuxtLink
              :to="`/order/new?store_id=${selectedStore?.id}`"
              class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 shrink-0 active:scale-95 self-start sm:self-center"
            >
              <Icon name="heroicons:plus-circle" class="w-4 h-4" />
              + Create New Order
            </NuxtLink>
          </div>

          <div class="border-t border-slate-100 my-4"></div>

          <!-- Modal Body -->
          <div class="flex-1 overflow-y-auto pr-1 space-y-4">
            <div v-if="ordersLoading" class="text-center py-16">
              <div class="w-8 h-8 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading Invoices & Orders...</p>
            </div>

            <div v-else-if="storeOrders.length === 0" class="text-center py-16 text-slate-400">
              <Icon name="heroicons:document-text" class="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p class="text-sm font-bold">No orders found for this store</p>
            </div>

            <div v-else class="space-y-4">
              <div v-for="order in storeOrders" :key="order.id" class="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 hover:border-blue-300 transition-all space-y-3">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                      <span class="text-slate-900 font-black text-sm">Order #{{ order.id }}</span>
                      <span v-if="order.delivery_number || order.delivery?.delivery_custom_id" class="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                        DEL: {{ order.delivery?.delivery_custom_id || order.delivery_number }}
                      </span>
                      <span v-if="order.so_number" class="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[10px] font-black uppercase tracking-widest">
                        SO: {{ order.so_number }}
                      </span>
                      <span v-if="order.customer_id" class="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 text-[10px] font-black uppercase tracking-widest">
                        CUST: {{ order.customer_id }}
                      </span>
                    </div>
                    <p class="text-slate-500 text-xs">
                      Date: <strong class="text-slate-700">{{ new Date(order.created_at).toLocaleDateString() }}</strong>
                      <span v-if="order.delivery_date" class="ml-3">Delivery Date: <strong class="text-slate-700">{{ new Date(order.delivery_date).toLocaleDateString() }}</strong></span>
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <span :class="`badge-${order.status} text-[10px] px-2.5 py-1`">{{ order.status }}</span>
                    <span class="text-slate-900 font-black text-base">${{ Number(order.total_amount || 0).toFixed(2) }}</span>
                  </div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/50">
                  <div class="text-[11px] text-slate-500 font-bold">
                    <span v-if="order.items?.length">{{ order.items.length }} Items</span>
                    <span v-if="order.user?.name" class="ml-2">• Rep: {{ order.user.name }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button 
                      @click="printOrderInvoice(order)" 
                      class="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                    >
                      <Icon name="heroicons:printer" class="w-3.5 h-3.5" />
                      View / Print Invoice
                    </button>

                    <NuxtLink 
                      :to="`/admin/orders/${order.id}`" 
                      class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Icon name="heroicons:arrow-top-right-on-square" class="w-3.5 h-3.5" />
                      Order Details
                    </NuxtLink>
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
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'admin' })

const authStore = useAuthStore()
const api = useApi()
const route = useRoute()
const router = useRouter()

const stores = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref((route.query.search as string) || '')
const currentPage = ref(1)
const totalPages = ref(1)
const totalStores = ref(0)
let searchTimeout: any = null

// Modal & dropdown lists state
const showModal = ref(false)
const editingStoreId = ref<number | null>(null)
const submitLoading = ref(false)
const formError = ref('')
const gettingLocation = ref(false)

// Store Orders Modal State
const showOrdersModal = ref(false)
const selectedStore = ref<any>(null)
const storeOrders = ref<any[]>([])
const ordersLoading = ref(false)

async function openStoreOrdersModal(store: any) {
  selectedStore.value = store
  storeOrders.value = []
  showOrdersModal.value = true
  ordersLoading.value = true
  try {
    const res = await api.get(`/stores/${store.id}/orders`) as any
    storeOrders.value = res.orders || []
  } catch (e) {
    console.error('Failed to load store orders', e)
  } finally {
    ordersLoading.value = false
  }
}

function printOrderInvoice(order: any) {
  if (!order?.invoice_url) return
  window.open(order.invoice_url, '_blank')
}

const storeProfiles = ref<any[]>([])
const ratingStoreProfiles = computed(() => {
  return storeProfiles.value.filter(s => {
    const name = (s.name || '').toLowerCase()
    return s.type_category === 'profile' || name.includes('$') || name.includes('profile')
  })
})
const tradeClassHierarchy = ref<any>({})

const editForm = reactive({
  shop_name: '',
  customer_id: '',
  contact: '',
  location: '',
  customer_address: '',
  province: '',
  district: '',
  commune: '',
  is_new_store: false,
  store_profile_id: '',
  trade_class_l1: '',
  trade_class_l2: '',
  trade_class_l3: ''
})

const tradeClassL1Options = computed(() => Object.keys(tradeClassHierarchy.value))

const editTradeClassL2Options = computed(() => {
  if (!editForm.trade_class_l1) return []
  return Object.keys(tradeClassHierarchy.value[editForm.trade_class_l1] || {})
})
const editTradeClassL3Options = computed(() => {
  if (!editForm.trade_class_l1 || !editForm.trade_class_l2) return []
  return tradeClassHierarchy.value[editForm.trade_class_l1]?.[editForm.trade_class_l2] || []
})

watch(() => editForm.trade_class_l1, (newVal, oldVal) => {
  if (oldVal !== undefined) {
    editForm.trade_class_l2 = ''
    editForm.trade_class_l3 = ''
  }
})
watch(() => editForm.trade_class_l2, (newVal, oldVal) => {
  if (oldVal !== undefined) {
    editForm.trade_class_l3 = ''
  }
})

watch(searchQuery, (newVal) => {
  router.replace({
    query: {
      ...route.query,
      search: newVal || undefined
    }
  })
})

async function fetchDropdownOptions() {
  try {
    const [spRes, tcRes] = await Promise.all([
      api.get('/store-types'),
      api.get('/trade-classes/hierarchy')
    ])
    storeProfiles.value = spRes as any[]
    tradeClassHierarchy.value = tcRes as any
  } catch (e) {
    console.error('Failed to fetch dropdown options', e)
  }
}

async function fetchStores(page = 1) {
  loading.value = true
  try {
    const res = await api.get(`/stores?page=${page}&search=${encodeURIComponent(searchQuery.value)}`) as any
    stores.value = res.data || []
    currentPage.value = res.current_page || 1
    totalPages.value = res.last_page || 1
    totalStores.value = res.total || 0
  } catch (e) {
    console.error('Failed to fetch stores', e)
  } finally {
    loading.value = false
  }
}

function debounceSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchStores(1)
  }, 500)
}

function clearSearch() {
  searchQuery.value = ''
  fetchStores(1)
}

async function exportExcel() {
  try {
    const search = encodeURIComponent(searchQuery.value)
    const blob = await api.get(`/stores/export?search=${search}`, { responseType: 'blob' }) as Blob
    
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `stores_export_${new Date().toISOString().slice(0,10)}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    console.error('Export failed', e)
    alert('Failed to export data')
  }
}

function isValidCoords(loc?: string) {
  if (!loc) return false
  return /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/.test(loc.trim())
}

async function geocodeLocation(locStr: string) {
  const match = locStr.trim().match(/^(-?\d+\.\d+)(?:\s*,\s*|\s+)(-?\d+\.\d+)$/)
  if (!match) return
  const lat = parseFloat(match[1] || '')
  const lon = parseFloat(match[2] || '')
  if (isNaN(lat) || isNaN(lon)) return

  gettingLocation.value = true
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`)
    const data = await res.json()
    if (data && data.address) {
      const addr = data.address
      editForm.province = addr.state || addr.province || addr.city || ''
      editForm.district = addr.district || addr.city_district || addr.city || addr.town || ''
      editForm.commune = addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || ''
      editForm.customer_address = data.display_name
    }
  } catch (e) {
    console.error('Reverse geocoding failed:', e)
  } finally {
    gettingLocation.value = false
  }
}

watch(() => editForm.location, (newVal) => {
  if (newVal) {
    geocodeLocation(newVal)
  }
})

async function getDeviceLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }
  gettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      editForm.location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      gettingLocation.value = false
    },
    (err) => {
      alert(`Location error: ${err.message}`)
      gettingLocation.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

function openEditModal(store: any) {
  editingStoreId.value = store.id
  formError.value = ''
  
  let matchedProfileId = ''
  if (store.store_type && store.visit_frequency) {
    const match = storeProfiles.value.find(p => p.name === store.store_type && p.visit_frequency === store.visit_frequency)
    if (match) matchedProfileId = match.id
  }

  editForm.shop_name = store.shop_name || ''
  editForm.customer_id = store.customer_id || ''
  editForm.contact = store.contact || ''
  editForm.location = store.location || ''
  editForm.customer_address = store.customer_address || ''
  editForm.province = store.province || ''
  editForm.district = store.district || ''
  editForm.commune = store.commune || ''
  editForm.is_new_store = !!store.is_new_store
  editForm.store_profile_id = matchedProfileId
  editForm.trade_class_l1 = store.trade_class_l1 || ''
  
  nextTick(() => {
    editForm.trade_class_l2 = store.trade_class_l2 || ''
    nextTick(() => {
      editForm.trade_class_l3 = store.trade_class_l3 || ''
    })
  })

  showModal.value = true
}

async function submitEditStore() {
  submitLoading.value = true
  formError.value = ''
  try {
    const profile = storeProfiles.value.find(p => p.id == editForm.store_profile_id)
    const payload = {
      shop_name: editForm.shop_name,
      customer_id: editForm.customer_id || null,
      contact: editForm.contact || null,
      location: editForm.location || null,
      customer_address: editForm.customer_address || null,
      province: editForm.province || null,
      district: editForm.district || null,
      commune: editForm.commune || null,
      is_new_store: editForm.is_new_store,
      store_type: profile ? profile.name : null,
      visit_frequency: profile ? profile.visit_frequency : null,
      trade_class_l1: editForm.trade_class_l1 || null,
      trade_class_l2: editForm.trade_class_l2 || null,
      trade_class_l3: editForm.trade_class_l3 || null
    }

    await api.put(`/admin/stores/${editingStoreId.value}`, payload)
    showModal.value = false
    await fetchStores(currentPage.value)
  } catch (e: any) {
    formError.value = e?.data?.message || 'Failed to update store details.'
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchStores()
  fetchDropdownOptions()
})
</script>
