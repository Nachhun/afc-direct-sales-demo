<template>
  <NuxtLayout :name="authStore.isAdmin ? 'admin' : 'default'">

    <!-- Submitting Order Motion Splash Screen Overlay (helo.mov / helo.gif) -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="loading" 
          class="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-center animate-fade-in"
        >
          <div class="bg-white rounded-[2rem] p-6 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center space-y-4 animate-scale-in">
            <!-- Animated Motion Avatar Ring -->
            <div class="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 shadow-xl animate-pulse">
              <div class="w-full h-full bg-white rounded-full overflow-hidden p-1 flex items-center justify-center">
                <img src="/helo.gif" alt="Submitting Motion Avatar" class="w-full h-full object-contain p-0.5 rounded-full bg-white" />
              </div>
            </div>

            <!-- Status & Khmer Text -->
            <div class="space-y-1.5 w-full">
              <h3 class="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                <span>កំពុងផ្ញើទិន្នន័យ...</span>
                <Icon name="heroicons:arrow-path" class="w-5 h-5 text-blue-600 animate-spin" />
              </h3>
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Submitting Order & Applying...
              </p>
              <p class="text-[11px] font-bold text-rose-700 bg-rose-50 rounded-2xl px-3 py-1.5 border border-rose-200/80 mt-2 animate-bounce">
                សូមរង់ចាំបន្តិច! Please wait moment
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="max-w-xl mx-auto space-y-4 px-2 sm:px-0 py-6 w-full min-w-0">
      <!-- Section header -->
      <div class="flex items-center gap-5 mb-2">
        <div :class="`w-14 h-14 ${brandColorLight} rounded-2xl flex items-center justify-center shadow-sm border border-blue-100 text-blue-600`">
          <Icon name="heroicons:plus-circle" class="w-7 h-7" />
        </div>
        <div>
          <h1 class="text-3xl font-black tracking-tight text-slate-900">New Order</h1>
          <p class="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-slate-500">{{ today }}</p>
        </div>
      </div>

      <form @submit.prevent="submitOrder" class="space-y-6">
        <!-- Telegram Location Background Tracking Helper Banner -->
        <div v-if="isTelegramWebApp && !authStore.isAdmin" class="bg-indigo-50 border border-indigo-100 rounded-3xl p-4 flex items-center justify-between gap-4 animate-fade-in my-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Icon name="heroicons:paper-airplane" class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs font-black text-slate-800 uppercase tracking-wider">Keep Location Live (Screen Off)</p>
              <p class="text-[11px] text-slate-500 font-bold mt-0.5">
                To keep tracking your location when you lock your screen or close this app:
              </p>
            </div>
          </div>
          
          <button 
            type="button" 
            @click="showTelegramGuide = true"
            class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-md shadow-indigo-600/10 active:scale-95 shrink-0"
          >
            <span>How to Share?</span>
          </button>
        </div>

        <!-- Customer Info -->
        <div :class="[cardClass, 'p-3.5 sm:p-6 space-y-4']">
          <div class="flex items-center gap-2 mb-2 pb-2.5 border-b border-slate-100">
             <div class="w-1 h-4 bg-blue-600 rounded-full"></div>
             <h3 class="text-[11px] text-blue-600 uppercase font-black tracking-[0.2em]">Customer Information</h3>
          </div>

          <!-- Auto-Filled Store & Main Location Banner (New Compact Style) -->
          <div v-if="autoFilledStore" class="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in my-1">
            <div class="flex items-start sm:items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
                <Icon name="heroicons:building-storefront" class="w-5 h-5" />
              </div>
              <div class="min-w-0 space-y-0.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-black text-slate-900 truncate tracking-tight">{{ autoFilledStore.shop_name }}</span>
                  <span class="text-[8px] bg-emerald-700 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-xs">Main Location Locked</span>
                </div>
                <p class="text-[10px] text-slate-600 font-bold truncate flex items-center gap-1.5 flex-wrap">
                  <span class="truncate">📍 {{ autoFilledStore.customer_address || (autoFilledStore.province + ' ' + (autoFilledStore.district || '')) }}</span>
                  <span v-if="autoFilledStore.location" class="text-[9px] text-emerald-800 font-black shrink-0 bg-emerald-100/90 px-1.5 py-0.2 rounded border border-emerald-200/50">GPS: {{ autoFilledStore.location }}</span>
                </p>
              </div>
            </div>
            
            <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button 
                v-if="hasLastOrderItems" 
                type="button" 
                @click="loadLastOrderItems" 
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1 active:scale-95"
                title="Load items from previous invoice"
              >
                <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
                <span>Load Last Order</span>
              </button>
              <button @click="clearAutoFill" type="button" class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-emerald-100/60 rounded-lg transition-colors" title="Reset / Clear Store">
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Store Order Frequency Notification -->
          <div v-else-if="matchedStoreOrdersCount !== null" class="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in my-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Icon name="heroicons:shopping-bag" class="w-5 h-5" />
              </div>
              <div>
                <p class="text-xs font-black text-slate-800 uppercase tracking-wider">Purchase History Tracked</p>
                <p class="text-[11px] text-slate-655 font-bold mt-0.5">
                  This store has successfully purchased <span class="text-blue-600 font-black">{{ matchedStoreOrdersCount }} times</span> in our system.
                </p>
              </div>
            </div>
            
            <button 
              v-if="hasLastOrderItems" 
              type="button" 
              @click="loadLastOrderItems" 
              class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-md shadow-blue-600/10 flex items-center gap-1.5 active:scale-95 shrink-0 self-start sm:self-center"
            >
              <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
              <span>Load Last Items</span>
            </button>
          </div>
          
          <div class="space-y-5">
            <div class="space-y-2">
              <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Location / GPS <span v-if="!authStore.isAdmin" class="text-red-500">*</span></label>
              <div class="relative group">
                <input v-model="form.location" class="input-field-modern w-full pr-12" placeholder="Click icon for GPS" :required="!authStore.isAdmin" id="location" />
                <button 
                  type="button" 
                  @click="getLocation"
                  :disabled="gettingLocation"
                  class="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90"
                  title="Get GPS Location"
                >
                  <Icon v-if="gettingLocation" name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                  <Icon v-else name="heroicons:map-pin" class="w-5 h-5" />
                </button>
              </div>
              <div v-if="isValidCoords(form.location)" class="flex justify-end pr-1 mt-1">
                <a :href="`https://www.google.com/maps?q=${form.location}`" target="_blank" 
                  class="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors">
                  <Icon name="heroicons:map" class="w-3 h-3" /> View Map
                </a>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-2 sm:gap-3">
              <div class="space-y-1">
                <label class="text-[10px] text-slate-600 font-black uppercase tracking-wider pl-0.5">Province <span class="text-red-500">*</span></label>
                <input v-model="form.province" class="input-field-modern w-full !px-2.5 !py-2 text-xs" placeholder="Province" id="province" required />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] text-slate-600 font-black uppercase tracking-wider pl-0.5">District <span class="text-red-500">*</span></label>
                <input v-model="form.district" class="input-field-modern w-full !px-2.5 !py-2 text-xs" placeholder="District" id="district" required />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] text-slate-600 font-black uppercase tracking-wider pl-0.5">Commune</label>
                <input v-model="form.commune" class="input-field-modern w-full !px-2.5 !py-2 text-xs" placeholder="Commune" id="commune" />
              </div>
            </div>

            <!-- Shop Name + Store Type -->
            <div class="space-y-3">
              <div class="space-y-2">
                <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Shop Name <span class="text-red-500">*</span></label>
                <input v-model="form.shop_name" class="input-field-modern w-full" placeholder="Enter shop name" required id="shop-name" />
              </div>

              <!-- Store Type Custom Dropdown -->
              <div class="space-y-2">
                <label class="text-[11px] text-slate-500 font-black uppercase tracking-widest pl-1">Store Type</label>

                <!-- Overlay to close dropdown on outside click -->
                <div v-if="storeTypeOpen" class="fixed inset-0 z-30" @click="storeTypeOpen = false"></div>

                <div class="relative z-40">
                  <!-- Trigger Button -->
                  <button
                    type="button"
                    id="store-type-trigger"
                    @click="storeTypeOpen = !storeTypeOpen"
                    class="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div class="flex items-center gap-2.5">
                      <!-- Colored dot indicator -->
                      <div
                        :class="{
                          'bg-slate-700': storeTypeValue === '',
                          'bg-blue-500': storeTypeValue === 'new_store',
                          'bg-purple-500': storeTypeValue === 'wholesale',
                          'bg-emerald-500': storeTypeValue === 'modern_trade',
                        }"
                        class="w-2 h-2 rounded-full shrink-0"
                      ></div>
                      <Icon
                        :name="{
                          '': 'heroicons:building-storefront',
                          'new_store': 'heroicons:sparkles',
                          'wholesale': 'heroicons:cube',
                          'modern_trade': 'heroicons:tag',
                        }[storeTypeValue] || 'heroicons:building-storefront'"
                        :class="{
                          'text-slate-600': storeTypeValue === '',
                          'text-blue-600': storeTypeValue === 'new_store',
                          'text-purple-600': storeTypeValue === 'wholesale',
                          'text-emerald-600': storeTypeValue === 'modern_trade',
                        }"
                        class="w-4 h-4 shrink-0"
                      />
                      <span
                        :class="{
                          'text-slate-700': storeTypeValue === '',
                          'text-blue-700': storeTypeValue === 'new_store',
                          'text-purple-700': storeTypeValue === 'wholesale',
                          'text-emerald-700': storeTypeValue === 'modern_trade',
                        }"
                        class="text-xs font-black uppercase tracking-widest"
                      >
                        {{ { '': 'Regular Store', 'new_store': 'New Store', 'wholesale': 'Wholesale', 'modern_trade': 'Modern Trade' }[storeTypeValue] }}
                      </span>
                    </div>
                    <Icon
                      name="heroicons:chevron-down"
                      :class="storeTypeOpen ? 'rotate-180' : ''"
                      class="w-4 h-4 text-slate-400 transition-transform duration-200"
                    />
                  </button>

                  <!-- Dropdown Panel -->
                  <div
                    v-if="storeTypeOpen"
                    class="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-scale-in max-h-72 overflow-y-auto"
                  >
                    <button
                      v-for="st in activeStoreTypes"
                      :key="st.id"
                      type="button"
                      @click="selectStoreTypeItem(st); storeTypeOpen = false"
                      :class="isStoreTypeSelected(st) ? 'bg-slate-50' : 'hover:bg-slate-50'"
                      class="w-full flex items-center gap-3 px-4 py-3 transition-colors border-b border-slate-50 group cursor-pointer"
                    >
                      <div :class="getStoreTypeIconBg(st)" class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Icon :name="st.icon || 'heroicons:building-storefront'" class="w-4 h-4" />
                      </div>
                      <div class="text-left flex-1 min-w-0">
                        <p class="text-xs font-black uppercase tracking-widest text-slate-800">{{ st.name }}</p>
                        <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 truncate">{{ st.description || (st.type_category ? st.type_category.replace('_', ' ') : 'Standard Store') }}</p>
                      </div>
                      <Icon v-if="isStoreTypeSelected(st)" name="heroicons:check-circle" class="w-4 h-4 text-indigo-600 ml-auto shrink-0" />
                    </button>
                  </div>
                </div>

                <!-- Discount opt-in — slides in for Wholesale or MT -->
                <div v-if="form.is_wholesale || form.is_modern_trade" class="animate-slide-up">
                  <label
                    :class="form.is_modern_trade
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-purple-50/80 border-purple-200 text-purple-800 hover:bg-purple-100'"
                    class="inline-flex items-center gap-2.5 cursor-pointer px-3.5 py-2.5 border rounded-xl transition-colors w-full"
                  >
                    <div
                      :class="activeDiscountEnabled
                        ? (form.is_modern_trade ? 'bg-emerald-600 border-emerald-600' : 'bg-purple-600 border-purple-600')
                        : (form.is_modern_trade ? 'border-emerald-300 bg-white' : 'border-purple-300 bg-white')"
                      class="w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center shrink-0"
                      @click="activeDiscountEnabled = !activeDiscountEnabled"
                    >
                      <Icon v-if="activeDiscountEnabled" name="heroicons:check" class="w-2.5 h-2.5 text-white" />
                    </div>
                    <input
                      type="checkbox"
                      :id="form.is_modern_trade ? 'mt-discount-checkbox' : 'ws-discount-checkbox'"
                      v-model="activeDiscountEnabled"
                      class="sr-only"
                    />
                    <span class="text-[10px] font-black uppercase tracking-widest">
                      Apply {{ form.is_modern_trade ? 'MT' : 'Wholesale' }} Discount
                    </span>
                  </label>
                </div>
              </div>
            </div>


            <div v-if="form.is_new_store" class="space-y-4 animate-slide-up bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <!-- Store Profile (Combines Type & Frequency) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Store Profile <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <select v-model="form.store_profile_id" class="input-field-modern w-full appearance-none !pl-5 !pr-8 text-ellipsis whitespace-nowrap" required id="store-profile">
                      <option value="" disabled selected>Select store profile</option>
                      <option v-for="profile in ratingStoreProfiles" :key="profile.id" :value="profile.id">
                        {{ profile.name }} ({{ profile.visit_frequency }})
                      </option>
                    </select>
                    <Icon name="heroicons:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="space-y-2">
                  <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Trade Class <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <select v-model="form.trade_class_l1" class="input-field-modern w-full appearance-none !pl-5 !pr-8 text-ellipsis whitespace-nowrap" required id="trade-class-l1">
                      <option value="" disabled selected>Select Trade Class</option>
                      <option v-for="opt in tradeClassL1Options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <Icon name="heroicons:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Trade Type <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <select v-model="form.trade_class_l2" class="input-field-modern w-full appearance-none !pl-5 !pr-8 text-ellipsis whitespace-nowrap" required id="trade-class-l2" :disabled="!form.trade_class_l1">
                      <option value="" disabled selected>Select Trade Type</option>
                      <option v-for="opt in tradeClassL2Options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <Icon name="heroicons:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Sub Type <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <select v-model="form.trade_class_l3" class="input-field-modern w-full appearance-none !pl-5 !pr-8 text-ellipsis whitespace-nowrap" required id="trade-class-l3" :disabled="!form.trade_class_l2">
                      <option value="" disabled selected>Select Sub Type</option>
                      <option v-for="opt in tradeClassL3Options" :key="opt" :value="opt">{{ opt }}</option>
                    </select>
                    <Icon name="heroicons:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 sm:gap-3">
              <div class="space-y-1">
                <label class="text-[10px] text-slate-600 font-black uppercase tracking-wider pl-0.5">SO Number <span class="text-red-500">*</span></label>
                <input v-model="form.so_number" class="input-field-modern w-full !px-3 !py-2 text-xs" placeholder="SO#" required id="so-number" />
              </div>
              <div class="space-y-1">
                <label class="text-[10px] text-slate-600 font-black uppercase tracking-wider pl-0.5">Customer ID <span v-if="!form.is_new_store" class="text-red-500">*</span></label>
                <div class="flex gap-1.5">
                  <input v-model="form.customer_id" class="input-field-modern flex-1 min-w-0 !px-3 !py-2 text-xs" placeholder="ID" :required="!form.is_new_store" id="customer-id" />
                  <button type="button" @click="searchStores(form.customer_id)" class="bg-blue-50 text-blue-600 px-2.5 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center shrink-0 border border-blue-100" title="Search by ID">
                    <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Customer Suggestion Banner -->
            <div v-if="customerSuggestion" class="animate-fade-in bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="heroicons:building-storefront" class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black text-slate-900 truncate">{{ customerSuggestion.shop_name }}</p>
                  <p class="text-[10px] text-slate-500 font-bold flex items-center gap-2 flex-wrap mt-0.5">
                    <span v-if="customerSuggestion.customer_id" class="text-purple-600">ID: {{ customerSuggestion.customer_id }}</span>
                    <span v-if="customerSuggestion.contact"><Icon name="heroicons:phone" class="w-3 h-3 inline -mt-0.5 mr-0.5" />{{ customerSuggestion.contact }}</span>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button type="button" @click="applyStore(customerSuggestion); customerSuggestion = null" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95">
                  Select
                </button>
                <button type="button" @click="customerSuggestion = null" class="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-blue-100 rounded-lg transition-colors">
                  <Icon name="heroicons:x-mark" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Contact & Phone <span class="text-red-500">*</span></label>
              <div class="flex gap-2">
                <input v-model="form.contact" type="tel" inputmode="numeric" pattern="[0-9]*" class="input-field-modern flex-1 min-w-0" placeholder="012 345 678" required id="contact" />
                <button type="button" @click="searchStores(form.contact)" class="bg-blue-50 text-blue-600 px-3 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center shrink-0 border border-blue-100" title="Search by Phone">
                  <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Address Details <span class="text-red-500">*</span></label>
              <textarea v-model="form.customer_address" class="input-field-modern w-full min-h-[80px]" rows="2" placeholder="Full address..." required id="customer-address"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-2.5 sm:gap-3 pt-2 border-t border-slate-100">
              <!-- Fulfillment Method Dropdown -->
              <div class="space-y-1 col-span-2 sm:col-span-1">
                <label class="text-[10px] text-slate-600 font-black uppercase tracking-wider pl-0.5 flex items-center justify-between">
                  <span>Fulfillment</span>
                  <span v-if="form.is_direct_sale" class="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black">
                    ⚡ Auto Complete
                  </span>
                </label>
                <div class="relative">
                  <select
                    :value="form.is_direct_sale ? 'direct' : 'standard'"
                    @change="(e: any) => {
                      const val = e.target.value;
                      if (val === 'direct') {
                        form.is_direct_sale = true;
                        form.delivery_date = getTodayDate();
                      } else {
                        form.is_direct_sale = false;
                        form.delivery_date = getDefaultDeliveryDate();
                      }
                    }"
                    class="input-field-modern w-full !pl-9 !pr-7 !py-2.5 text-xs appearance-none font-bold"
                    :class="form.is_direct_sale ? 'border-emerald-400 bg-emerald-50/50 text-emerald-800' : ''"
                    id="fulfillment-method"
                  >
                    <option value="standard">Standard Delivery</option>
                    <option value="direct">Direct Sale (លក់ផ្ទាល់ដៃ)</option>
                  </select>
                  <Icon :name="form.is_direct_sale ? 'heroicons:bolt' : 'heroicons:truck'" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" :class="form.is_direct_sale ? '!text-emerald-600' : ''" />
                  <Icon name="heroicons:chevron-down" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <!-- Payment Method Dropdown -->
              <div class="space-y-1 col-span-1">
                <label class="text-[10px] text-slate-600 font-black uppercase tracking-wider pl-0.5">Payment</label>
                <div class="relative">
                  <select v-model="form.payment_method" class="input-field-modern w-full !pl-9 !pr-7 !py-2.5 text-xs appearance-none font-bold" id="payment-method">
                    <option value="COD">COD</option>
                    <option value="Credit">Credit</option>
                    <option value="Paid">Paid</option>
                  </select>
                  <Icon name="heroicons:credit-card" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Icon name="heroicons:chevron-down" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <!-- Delivery / Drop-off Date -->
              <div class="space-y-1 col-span-1 sm:col-span-1">
                <label class="text-[10px] text-slate-600 font-black uppercase tracking-wider pl-0.5">
                  {{ form.is_direct_sale ? 'Drop-off Date' : 'Delivery Date' }} <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input v-model="form.delivery_date" type="date" :min="form.is_direct_sale ? getTodayDate() : getDefaultDeliveryDate()" class="input-field-modern w-full !pl-9 !pr-2 !py-2.5 text-xs font-bold" required id="delivery-date" />
                  <Icon name="heroicons:calendar" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Tiny info banner if direct sale is selected -->
            <div v-if="form.is_direct_sale" class="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 animate-slide-up text-emerald-800 text-[11px] font-bold">
              <Icon name="heroicons:check-badge" class="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <b>Direct Sale Active:</b> Order will auto-complete immediately upon submit (no delivery dispatch).
              </span>
            </div>
          </div>
        </div>

        <!-- Product Selection -->
        <div :class="[cardClass, 'p-3 sm:p-8 space-y-6']">
          <div class="flex items-center justify-between border-b border-slate-100 pb-5">
             <div class="flex items-center gap-2">
                <div class="w-1 h-4 bg-blue-600 rounded-full"></div>
                <h3 class="text-lg font-black text-slate-900 tracking-tight">Order Items</h3>
             </div>
            
            <!-- Custom Product Picker Dropdown with Images -->
            <div class="relative w-48 sm:w-64">
              <!-- Overlay to close dropdown -->
              <div v-if="pickerOpen" class="fixed inset-0 z-40" @click="pickerOpen = false"></div>
              
              <button 
                type="button"
                @click="togglePicker"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2.5 text-xs font-bold text-slate-900 text-left hover:bg-slate-100 transition-all cursor-pointer shadow-sm flex items-center gap-2 relative z-50 animate-slide-up"
              >
                <Icon name="heroicons:plus" class="w-4 h-4 text-blue-600 shrink-0" />
                <span class="truncate">Add Product</span>
                <Icon name="heroicons:chevron-down" class="w-4 h-4 text-slate-400 absolute right-3" />
              </button>

              <!-- Dropdown Panel -->
              <div 
                v-if="pickerOpen" 
                class="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-scale-in"
              >
                <!-- Search Input -->
                <div class="relative">
                  <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    v-model="pickerSearch" 
                    ref="pickerSearchInput"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    placeholder="Search SKU or name..." 
                  />
                </div>

                <!-- Products List -->
                <div class="max-h-60 overflow-y-auto pr-1 minimal-scrollbar space-y-1">
                  <button 
                    v-for="p in filteredPickerProducts" 
                    :key="p.id"
                    type="button"
                    @click="addSelectedProduct(p)"
                    class="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <!-- Product Thumbnail -->
                    <div class="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      <img v-if="p.image" :src="`${config.public.apiBase}/storage/${p.image}`" class="w-full h-full object-contain p-0.5" />
                      <Icon v-else name="heroicons:cube" class="w-5 h-5 text-slate-300" />
                    </div>

                    <!-- Product Meta -->
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-black text-slate-900 truncate leading-snug">{{ p.name }}</p>
                      <p v-if="p.sku" class="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{{ p.sku }}</p>
                    </div>
                  </button>

                  <!-- Empty State -->
                  <div v-if="filteredPickerProducts.length === 0" class="text-center py-6 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    No matching products
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Line Items List -->
          <div :class="form.items.length > 3 ? 'max-h-[460px] overflow-y-auto pr-1 minimal-scrollbar' : ''" class="space-y-4">
            <div v-for="(item, idx) in form.items" :key="idx" class="flex flex-col gap-3 bg-white p-3 sm:p-5 rounded-2xl border border-slate-100 shadow-sm animate-slide-up hover:border-blue-200 hover:shadow-md transition-all group/item overflow-hidden">
              <div class="flex gap-4">
                <!-- Product Thumbnail -->
                <div class="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                  <img v-if="products.find(x => x.id == item.product_id)?.image" 
                       :src="`${config.public.apiBase}/storage/${products.find(x => x.id == item.product_id)?.image}`" 
                       class="w-full h-full object-contain p-0.5" />
                  <Icon v-else name="heroicons:cube" class="w-6 h-6 text-slate-300" />
                </div>

                <!-- Product Information & Actions -->
                <div class="flex-1 min-w-0 space-y-2">
                  <!-- Row 1: Product Label + Remove -->
                  <div class="flex items-start justify-between gap-2 min-w-0">
                    <div class="flex-1 min-w-0 overflow-hidden">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <p class="text-sm font-black text-slate-900 uppercase tracking-tight leading-snug break-words">{{ products.find(x => x.id == item.product_id)?.name }}</p>
                        <span v-if="products.find(x => x.id == item.product_id)?.sku" class="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-widest shrink-0">
                          {{ products.find(x => x.id == item.product_id)?.sku }}
                        </span>
                      </div>
                    </div>
                    
                    <button type="button" @click="removeItem(idx)"
                      class="w-8 h-8 shrink-0 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all active:scale-90 border border-slate-100 shadow-sm" 
                      title="Remove Item"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Row 2: QTY + Unit + Amount -->
                  <div class="flex items-end gap-2 sm:gap-3 min-w-0">
                    <div class="flex flex-col gap-1 shrink-0">
                      <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Quantity</span>
                      <input
                        v-model="item.qty"
                        type="number"
                        step="0.01"
                        min="0.01"
                        inputmode="decimal"
                        class="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-black text-slate-900 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none shadow-sm transition-all"
                      />
                    </div>

                    <div class="flex flex-col gap-1 shrink-0">
                      <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest pl-1">Unit</span>
                      <div class="relative">
                        <select v-model="item.unit" @change="onUnitChange(item)"
                          class="bg-slate-50 text-[10px] font-black uppercase text-slate-900 border border-slate-200 rounded-lg pl-1.5 pr-5 py-1.5 appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-sm min-w-[60px]">
                          <option v-for="u in getAvailableUnits(item.product_id)" :key="u.name" :value="u.name">{{ u.name }}</option>
                        </select>
                        <Icon name="heroicons:chevron-down" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div class="flex-1 text-right min-w-0">
                      <div class="flex flex-col items-end">
                        <p class="text-base font-black text-blue-600 whitespace-nowrap">
                          ${{ ((item.qty || 0) * (getItemEffectivePrice(item))).toFixed(2) }}
                        </p>
                        <div v-if="item.unit !== 'CTN'" class="mt-0.5 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">
                          <p class="text-[8px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                            ≈ {{ getItemCtnEquivalent(item).toFixed(2) }} CTN
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Row 3: Promotion Selection/Status (Product or Category) -->
              <div v-if="getPromoForItem(item)" class="mt-2 pt-2 border-t border-slate-50 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5" :class="getPromoForItem(item).promo_level === 'product' ? 'text-purple-600' : 'text-blue-600'">
                  <Icon :name="getItemPromoChoice(item) === 'discount' ? 'heroicons:ticket' : 'heroicons:gift'" class="w-4 h-4 shrink-0" />
                  <span class="text-[9px] font-black uppercase tracking-widest">
                    {{ getPromoForItem(item).name }}
                    <span v-if="getPromoForItem(item).promo_level === 'product'" class="ml-1 text-[8px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Product Deal</span>
                  </span>
                </div>

                <!-- Dual-option toggle -->
                <div v-if="getPromoForItem(item).has_options" class="flex items-center gap-2">
                  <span class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Option:</span>
                  <div class="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                    <button 
                      type="button" 
                      @click="setItemPromoChoice(item, 'foc')" 
                      :class="[
                        'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all',
                        getItemPromoChoice(item) === 'foc'
                          ? (getPromoForItem(item).promo_level === 'product' ? 'bg-purple-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm')
                          : 'text-slate-500 hover:text-slate-700'
                      ]"
                    >
                      FOC
                    </button>
                    <button 
                      v-if="!bundleConsumedProductIds.includes(String(item.product_id))"
                      type="button" 
                      @click="setItemPromoChoice(item, 'discount')" 
                      :class="[
                        'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider transition-all',
                        getItemPromoChoice(item) === 'discount'
                          ? (getPromoForItem(item).promo_level === 'product' ? 'bg-purple-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm')
                          : 'text-slate-500 hover:text-slate-700'
                      ]"
                    >
                      Discount
                    </button>
                  </div>
                </div>
                <div v-else class="text-[9px] font-bold text-slate-500 uppercase">
                  <span v-if="bundleConsumedProductIds.includes(String(item.product_id))">
                    Promo Discount Disabled by Bundle
                  </span>
                  <span v-else-if="getPromoForItem(item)?.rewards?.some((r: any) => r.reward_type !== 'foc')">
                    Auto Discount Applied
                  </span>
                  <span v-else>
                    Auto FOC Applied
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="form.items.length === 0" class="py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
              <div class="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="heroicons:shopping-cart" class="w-8 h-8 text-slate-200" />
              </div>
              <p class="text-slate-500 font-bold text-sm">No products added yet</p>
              <p class="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Select a product above to start</p>
            </div>
          </div>

          <!-- Totals Section -->
          <div class="mt-8 pt-8 border-t border-slate-100 space-y-4">
            <!-- Disconnect All Promotions Toggle Box -->
            <div 
              class="p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3"
              :class="form.disable_promotions ? 'bg-red-50/80 border-red-200 text-red-900 shadow-2xs' : 'bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-slate-100/60'"
            >
              <label class="flex items-center gap-3 cursor-pointer select-none min-w-0 flex-1">
                <input 
                  v-model="form.disable_promotions" 
                  type="checkbox" 
                  class="w-5 h-5 rounded-md text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer shrink-0" 
                />
                <div class="min-w-0">
                  <span class="text-xs font-black uppercase tracking-wider block" :class="form.disable_promotions ? 'text-red-900' : 'text-slate-800'">
                    🚫 Do Not Apply Promotions
                  </span>
                  <span class="text-[10px] font-semibold block mt-0.5" :class="form.disable_promotions ? 'text-red-600' : 'text-slate-500'">
                    Tick this box to disconnect all category discounts, combo promotions, and free FOC gifts for this order.
                  </span>
                </div>
              </label>
              <span v-if="form.disable_promotions" class="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 shadow-xs">
                PROMOTIONS OFF
              </span>
            </div>

            <!-- Subtotal -->
            <div class="flex items-center justify-between gap-4 px-1">
              <span class="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] shrink-0">Items Subtotal</span>
              <span class="text-lg font-bold text-slate-900 tracking-tight">${{ subtotal.toFixed(2) }}</span>
            </div>

            <!-- Category Discount -->
            <div v-if="totalCategoryDiscount > 0" class="flex items-center justify-between gap-4 px-1 py-2 bg-emerald-50 rounded-xl border border-emerald-100 animate-slide-up">
              <div class="flex items-center gap-2 pl-2">
                <Icon name="heroicons:ticket" class="w-4 h-4 text-emerald-600" />
                <span class="text-[10px] font-black text-emerald-600 uppercase tracking-wider shrink-0">Promo Discount <span v-if="categoryDiscountLabels">({{ categoryDiscountLabels }})</span></span>
              </div>
              <span class="text-lg font-bold text-emerald-600 pr-2">-${{ totalCategoryDiscount.toFixed(2) }}</span>
            </div>

            <!-- Product Promo Discount -->
            <div v-if="productPromotionsDiscount > 0" class="flex items-center justify-between gap-4 px-1 py-2 bg-purple-50 rounded-xl border border-purple-100 animate-slide-up">
              <div class="flex items-center gap-2 pl-2 min-w-0">
                <Icon name="heroicons:ticket" class="w-4 h-4 text-purple-600 shrink-0" />
                <span class="text-[10px] font-black text-purple-600 uppercase tracking-wider truncate">Product Promo Disc <span v-if="productDiscountLabels">({{ productDiscountLabels }})</span></span>
              </div>
              <span class="text-lg font-bold text-purple-600 pr-2 shrink-0">-${{ productPromotionsDiscount.toFixed(2) }}</span>
            </div>

            <!-- Wholesale Discount -->
            <div v-if="wholesaleDiscountAmount > 0" class="flex items-center justify-between gap-4 px-1 py-2 bg-pink-50 rounded-xl border border-pink-100 animate-slide-up">
              <div class="flex items-center gap-2 pl-2">
                <Icon name="heroicons:ticket" class="w-4 h-4 text-pink-600" />
                <span class="text-[10px] font-black text-pink-600 uppercase tracking-wider shrink-0">{{ form.is_modern_trade ? 'Modern Trade Discount' : (form.is_wholesale ? 'Wholesale Discount' : 'Store Discount') }} ({{ getWholesaleDiscountPercent() }}%)</span>
              </div>
              <span class="text-lg font-bold text-pink-600 pr-2">-${{ wholesaleDiscountAmount.toFixed(2) }}</span>
            </div>

            <!-- Product FOC Products Summary -->
            <div>
              <div v-for="(foc, idx) in productFocItems" :key="'pfoc-' + idx" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 bg-purple-50 rounded-xl border border-purple-100 animate-slide-up mb-2">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <Icon name="heroicons:gift" class="w-4 h-4 text-purple-600 shrink-0" />
                  <span class="text-[10px] font-black text-purple-600 uppercase tracking-wider truncate" :title="foc.bundle_name">Free Gift ({{ foc.bundle_name }})</span>
                </div>
                <div class="text-left sm:text-right shrink-0 pl-6 sm:pl-0">
                   <p class="text-[11px] font-black text-slate-900 leading-tight">{{ foc.name }}</p>
                    <p class="text-[10px] font-bold text-purple-600 uppercase leading-none mt-1">
                        {{ foc.qty }} {{ foc.unit }} @ $0.00
                    </p>
                </div>
              </div>
            </div>

            <!-- Category FOC Products Summary -->
            <template v-if="activePromotionSystem === 'category' || activePromotionSystem === 'both'">
              <template v-for="(stat, catId) in promotionStatus" :key="'foc-' + catId">
                <div v-if="stat.applied?.free_gifts && stat.applied.free_gifts.length > 0">
                  <div v-for="(gift, gIdx) in stat.applied.free_gifts" :key="gIdx" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 bg-blue-50 rounded-xl border border-blue-100 animate-slide-up mb-2">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <Icon name="heroicons:gift" class="w-4 h-4 text-blue-600 shrink-0" />
                      <span class="text-[10px] font-black text-blue-600 uppercase tracking-wider truncate" :title="stat.category_name">Free Gift ({{ stat.category_name }})</span>
                    </div>
                    <div class="text-left sm:text-right shrink-0 pl-6 sm:pl-0">
                       <p class="text-[11px] font-black text-slate-900 leading-tight">{{ gift.free_product?.name || products.find(p => p.id == gift.free_product_id)?.name || 'Free Product' }}</p>
                        <p class="text-[10px] font-bold text-blue-600 uppercase leading-none mt-1">
                            {{ gift.calculated_qty !== undefined ? gift.calculated_qty : (
                              (gift.is_multiply === true || gift.is_multiply === 'true' || gift.is_multiply == 1)
                                ? (Math.floor(Number(stat.cartons || 0) / (Number(stat.applied?.min_cartons) || 1)) * Number(gift.free_qty || 1) + Number(gift.extra_foc || 0))
                                : (Number(gift.free_qty || 0) + Number(gift.extra_foc || 0))
                            ) }}
                            {{ gift.free_unit }} @ $0.00
                        </p>
                    </div>
                  </div>
                </div>
              </template>
            </template>

            <!-- Bundle Selection UI -->
            <div v-if="!form.disable_promotions && (activePromotionSystem === 'bundle' || activePromotionSystem === 'both') && qualifyingBundles.length > 0" class="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl mb-3">
              <div class="flex items-center justify-between text-xs font-black text-blue-900 uppercase tracking-wider mb-2">
                <span class="flex items-center gap-1.5">
                  <Icon name="heroicons:gift" class="w-4 h-4 text-blue-600" />
                  Bundle Promotion Selection
                </span>
                <span v-if="qualifyingBundles.length > 1" class="text-[10px] text-blue-600 font-semibold normal-case">
                  (Select 1 Bundle)
                </span>
              </div>
              <div class="space-y-1.5">
                <label 
                  v-for="b in qualifyingBundles" 
                  :key="b.id" 
                  class="flex items-center gap-2.5 p-2 bg-white rounded-xl border cursor-pointer transition-all hover:border-blue-300"
                  :class="String(form.selected_bundle_id) === String(b.id) ? 'border-blue-500 ring-2 ring-blue-200/60 bg-blue-50/30' : 'border-slate-200'"
                >
                  <input 
                    type="radio" 
                    :name="'bundle-choice-new'" 
                    :value="b.id" 
                    v-model="form.selected_bundle_id" 
                    class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div class="flex-1 text-xs">
                    <div class="font-bold text-slate-800 flex items-center justify-between">
                      <span>{{ b.name }}</span>
                      <span class="text-[10px] font-black text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-md">
                        {{ b.maxBundlesPossible }} x
                      </span>
                    </div>
                    <span class="text-slate-500 text-[10px] block mt-0.5">
                      Free: {{ b.focs.map((f: any) => `${f.product?.name || 'Free Gift'} (${f.qty * b.maxBundlesPossible} ${f.unit || 'BOX'})`).join(', ') }}
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Bundle FOC Products Summary -->
            <div v-if="activePromotionSystem === 'bundle' || activePromotionSystem === 'both'">
              <div v-for="(foc, idx) in bundleFocItems" :key="'bfoc-' + idx" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 bg-blue-50 rounded-xl border border-blue-100 animate-slide-up mb-2">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <Icon name="heroicons:gift" class="w-4 h-4 text-blue-600 shrink-0" />
                  <span class="text-[10px] font-black text-blue-600 uppercase tracking-wider truncate" :title="foc.bundle_name">Free Gift ({{ foc.bundle_name }})</span>
                </div>
                <div class="text-left sm:text-right shrink-0 pl-6 sm:pl-0">
                   <p class="text-[11px] font-black text-slate-900 leading-tight">{{ foc.name }}</p>
                    <p class="text-[10px] font-bold text-blue-600 uppercase leading-none mt-1">
                        {{ foc.qty }} {{ foc.unit }} @ $0.00
                    </p>
                </div>
              </div>
            </div>

            <!-- Global FOC Products Summary -->
            <div>
              <div v-for="(foc, idx) in globalFocItems" :key="'gfoc-' + idx" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-3 bg-indigo-50 rounded-xl border border-indigo-100 animate-slide-up mb-2">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <Icon name="heroicons:gift" class="w-4 h-4 text-indigo-600 shrink-0" />
                  <span class="text-[10px] font-black text-indigo-600 uppercase tracking-wider truncate" :title="foc.bundle_name">Free Gift ({{ foc.bundle_name }})</span>
                </div>
                <div class="text-left sm:text-right shrink-0 pl-6 sm:pl-0">
                   <p class="text-[11px] font-black text-slate-900 leading-tight">{{ foc.name }}</p>
                    <p class="text-[10px] font-bold text-indigo-600 uppercase leading-none mt-1">
                        {{ foc.qty }} {{ foc.unit }} @ $0.00
                    </p>
                </div>
              </div>
            </div>

            <!-- Grand Total -->
            <div class="flex items-center justify-between gap-2 sm:gap-4 pt-4 mt-2">
              <div class="flex flex-col">
                <span class="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-1">Grand Total</span>
                <span class="text-[10px] sm:text-xs font-bold text-slate-500 italic leading-none">Net Payable</span>
              </div>
              <div class="bg-blue-600 rounded-2xl px-4 py-3 sm:px-8 sm:py-4 text-right shadow-lg shadow-blue-600/20 border border-blue-500 shrink-0">
                <span class="text-2xl sm:text-4xl font-black text-white tracking-tighter">${{ grandTotal.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="pt-8">
            <div class="space-y-2">
              <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Order Remark / Instructions</label>
              <textarea v-model="form.note" class="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none resize-none transition-all shadow-sm" rows="3" placeholder="Special delivery instructions..."></textarea>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-sm font-bold flex items-center gap-3 animate-slide-up">
          <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 shrink-0" />
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button type="submit" id="submit-order" :disabled="loading || form.items.length === 0"
          class="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 sm:py-5 rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 group">
          <span v-if="loading" class="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></span>
          <Icon v-else name="heroicons:paper-airplane" class="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <span>{{ loading ? 'Processing Order...' : 'Confirm Order' }}</span>
        </button>
      </form>

      <!-- Order Success Celebration Splash Modal -->
      <Teleport to="body">
        <Transition name="fade">
          <div 
            v-if="success" 
            class="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 text-center animate-fade-in"
          >
            <div class="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-xs sm:max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center space-y-4 animate-scale-in relative overflow-hidden">
              <!-- Top decorative gradient line -->
              <div class="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600"></div>

              <!-- Floating Surprise Icons -->
              <div class="absolute top-3 left-4 text-xl animate-bounce" style="animation-duration: 2s;">🎉</div>
              <div class="absolute top-3 right-4 text-xl animate-bounce" style="animation-duration: 2.3s;">✨</div>

              <!-- Animated Motion Avatar Ring with Surprise Badging -->
              <div class="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 shadow-2xl animate-pulse mt-1">
                <div class="w-full h-full bg-white rounded-full overflow-hidden p-1 flex items-center justify-center relative">
                  <img src="/helo.gif" alt="Order Success Motion Avatar" class="w-full h-full object-contain p-0.5 rounded-full bg-white" />
                </div>
                <div class="absolute -bottom-1 -right-1 w-9 h-9 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center text-lg shadow-md border-2 border-white animate-bounce">
                  🎁
                </div>
              </div>

              <!-- Celebration Greeting Text -->
              <div class="space-y-2 w-full">
                <div class="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md shadow-rose-500/20">
                  <Icon name="heroicons:sparkles" class="w-4 h-4 animate-spin text-amber-200" />
                  <span>SURPRISE NEW ORDER! 🎉</span>
                </div>
                <h3 class="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight">
                  អបអរសាទរ <span class="text-blue-600 font-black underline decoration-blue-300">{{ repName }}</span> ទទួលបានការបញ្ជាទិញ ថ្មី! 🥳
                </h3>
                <p class="text-[11px] font-bold text-slate-500">
                  ការបញ្ជាទិញត្រូវបានកត់ត្រា និងជូនដំណឹងទៅ Telegram រួចរាល់!
                </p>
              </div>

              <!-- Action buttons -->
              <div class="w-full space-y-2.5 pt-1">
                <button 
                  type="button"
                  @click="resetForm" 
                  class="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icon name="heroicons:plus-circle" class="w-4 h-4" />
                  <span>ចាប់ផ្តើមការបញ្ជាទិញថ្មី (New Order)</span>
                </button>
                <div class="flex gap-2">
                  <NuxtLink 
                    :to="authStore.isAdmin ? '/admin/orders' : '/order/history'" 
                    class="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Icon name="heroicons:clock" class="w-4 h-4 text-slate-500" />
                    <span>History</span>
                  </NuxtLink>
                  <a 
                    v-if="submittedOrder?.invoice_url" 
                    :href="submittedOrder?.invoice_url" 
                    target="_blank"
                    class="flex-1 py-3 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 border border-emerald-200"
                  >
                    <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                    <span>Invoice</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
      <!-- Store Search Results Modal -->
      <Teleport to="body">
        <div v-if="searchModalOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-fade-in" @click.self="searchModalOpen = false">
          <div class="bg-white shadow-2xl max-w-lg w-full p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 animate-scale-in max-h-[80vh] flex flex-col">
            <div class="flex items-center justify-between mb-6 shrink-0">
              <h3 class="text-xl font-black text-slate-900 tracking-tight">Select Store</h3>
              <button type="button" @click="searchModalOpen = false" class="w-8 h-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
            
            <div v-if="searchingStores" class="py-12 flex flex-col items-center justify-center space-y-3">
              <div class="w-8 h-8 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p class="text-slate-400 text-xs font-black uppercase tracking-widest">Searching...</p>
            </div>
            
            <div v-else-if="searchResults.length === 0" class="py-12 text-center">
              <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-300">
                <Icon name="heroicons:magnifying-glass" class="w-6 h-6" />
              </div>
              <p class="text-slate-500 font-bold text-sm">No stores found</p>
              <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Try a different phone or ID</p>
            </div>
            
            <div v-else class="overflow-y-auto pr-2 space-y-3 flex-1 minimal-scrollbar">
              <div v-for="(store, idx) in searchResults" :key="idx" 
                @click="applyStore(store)"
                class="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group flex items-start gap-4">
                <div class="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="heroicons:building-storefront" class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-slate-900 font-black truncate group-hover:text-blue-600 transition-colors">{{ store.shop_name }}</h4>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-if="store.customer_id" class="text-[9px] font-black text-purple-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded uppercase tracking-widest">ID: {{ store.customer_id }}</span>
                    <span v-if="store.contact" class="text-[9px] font-black text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded uppercase tracking-widest"><Icon name="heroicons:phone" class="w-2.5 h-2.5 inline -mt-0.5 mr-0.5"/>{{ store.contact }}</span>
                  </div>
                  <p class="text-slate-500 text-xs mt-2 truncate">{{ store.customer_address || (store.province + (store.district ? ', ' + store.district : '')) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Telegram Live Location Share Guide Modal -->
      <Teleport to="body">
        <div v-if="showTelegramGuide" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] px-4 animate-fade-in" @click.self="showTelegramGuide = false">
          <div class="bg-white shadow-2xl max-w-sm w-full p-8 rounded-[2.5rem] border border-slate-100 animate-scale-in text-center">
            <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-100 shadow-sm text-indigo-600">
              <Icon name="heroicons:map-pin" class="w-8 h-8" />
            </div>
            <h3 class="text-lg font-black text-slate-900 mb-2 tracking-tight uppercase">Telegram Live Location</h3>
            <p class="text-slate-500 text-xs mb-6">Follow these 3 quick steps to activate continuous background tracking:</p>
            
            <div class="space-y-4 text-left text-xs mb-8">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700 shrink-0">1</div>
                <p class="text-slate-600 font-bold mt-0.5">Go back to the Telegram chat screen.</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700 shrink-0">2</div>
                <p class="text-slate-600 font-bold mt-0.5">Tap the paperclip 📎 (Attachment) button and select 📍 <b>Location</b>.</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-700 shrink-0">3</div>
                <p class="text-slate-600 font-bold mt-0.5">Choose <b>Share My Live Location</b> and select <b>8 Hours</b>.</p>
              </div>
            </div>
            
            <button @click="showTelegramGuide = false" class="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
              Got it
            </button>
          </div>
        </div>
      </Teleport>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'
import confetti from 'canvas-confetti'
definePageMeta({ layout: false })
const authStore = useAuthStore()
const api = useApi()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const pickerOpen = ref(false)
const pickerSearch = ref('')
const pickerSearchInput = ref<HTMLInputElement | null>(null)
const storeTypeOpen = ref(false)
const showTelegramGuide = ref(false)

const isTelegramWebApp = computed(() => {
  if (typeof window === 'undefined') return false
  return !!(window as any).Telegram?.WebApp
})

function togglePicker() {
  pickerOpen.value = !pickerOpen.value
  if (pickerOpen.value) {
    pickerSearch.value = ''
    nextTick(() => {
      pickerSearchInput.value?.focus()
    })
  }
}

const filteredPickerProducts = computed(() => {
  const query = pickerSearch.value.toLowerCase().trim()
  if (!query) return products.value
  return products.value.filter(p => 
    p.name.toLowerCase().includes(query) || 
    (p.sku && p.sku.toLowerCase().includes(query))
  )
})

function addSelectedProduct(p: any) {
  const units = getAvailableUnits(p.id)
  const u = units[0]
  if (u) {
    const itemPrice = (form.is_modern_trade && u.mt_price != null) ? Number(u.mt_price) : Number(u.price)
    form.items.push({
      product_id: String(p.id),
      qty: 1,
      unit: u.name,
      unit_price: itemPrice,
      manual_discount: 0,
      promo_option: 'foc',
      editing: false
    })
  }
  pickerOpen.value = false
  pickerSearch.value = ''
}

// Design Palette
const brandColor = computed(() => 'text-blue-600')
const brandColorLight = computed(() => 'bg-blue-50')
const brandBg = computed(() => 'bg-blue-600')
const brandBgLight = computed(() => 'bg-blue-50')
const brandBorder = computed(() => 'border-blue-100')
const cardClass = computed(() => 'minimal-card')

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const products = ref<any[]>([])
const categories = ref<any[]>([])
const activeCategory = ref<number | null>(null)
const searchQuery = ref('')
const loading = ref(false)
const repName = computed(() => {
  if (authStore.user?.name) return authStore.user.name
  if (authStore.user?.username) return authStore.user.username
  return 'Representative'
})
const gettingLocation = ref(false)
const error = ref('')
const success = ref(false)
const submittedOrder = ref<any>(null)

const searchResults = ref<any[]>([])
const searchModalOpen = ref(false)
const searchingStores = ref(false)
const customerSuggestion = ref<any>(null)

async function searchStores(query: string) {
  if (!query || query.length < 2) return
  searchModalOpen.value = true
  searchingStores.value = true
  searchResults.value = []
  try {
    const res = await api.get(`/stores/search?q=${encodeURIComponent(query)}`) as any[]
    searchResults.value = res
  } catch (e) {
    console.error('Search error', e)
  } finally {
    searchingStores.value = false
  }
}

const isProgrammaticUpdate = ref(false)
const matchedStoreOrdersCount = ref<number | null>(null)
const lastOrderItems = ref<any[]>([])
const hasLastOrderItems = computed(() => lastOrderItems.value && lastOrderItems.value.length > 0)

function loadLastOrderItems() {
  if (!lastOrderItems.value || lastOrderItems.value.length === 0) return
  form.items = lastOrderItems.value.map((item: any) => ({
    product_id: String(item.product_id),
    qty: Number(item.qty),
    unit: item.unit,
    unit_price: Number(item.unit_price),
    manual_discount: Number(item.manual_discount || 0),
    promo_option: item.promo_option || 'foc',
    editing: false
  }))
}

const autoFilledStore = ref<any>(null)

function clearAutoFill() {
  isProgrammaticUpdate.value = true
  autoFilledStore.value = null
  matchedStoreOrdersCount.value = null
  lastOrderItems.value = []
  form.shop_name = ''
  form.customer_address = ''
  form.province = ''
  form.district = ''
  form.commune = ''
  form.contact = ''
  form.location = ''
  form.customer_id = ''
  nextTick(() => {
    isProgrammaticUpdate.value = false
  })
}

function applyStore(store: any) {
  isProgrammaticUpdate.value = true
  autoFilledStore.value = store
  
  form.shop_name = store.shop_name || ''
  form.customer_address = store.customer_address || ''
  form.province = store.province || ''
  form.district = store.district || ''
  form.commune = store.commune || ''
  form.contact = store.contact || ''
  form.location = store.location || ''
  form.customer_id = store.customer_id || ''
  selectedStoreType.value = store.store_type || ''
  form.is_wholesale = store.store_type === 'Wholesale'
  form.is_modern_trade = !!store.is_modern_trade
  
  if (store.is_new_store || store.store_type) {
    form.is_new_store = !!store.is_new_store
    form.store_profile_id = store.store_profile_id || ''
    form.trade_class_l1 = store.trade_class_l1 || ''
    form.trade_class_l2 = store.trade_class_l2 || ''
    form.trade_class_l3 = store.trade_class_l3 || ''
  } else {
    form.is_new_store = false
    form.store_profile_id = ''
    form.trade_class_l1 = ''
    form.trade_class_l2 = ''
    form.trade_class_l3 = ''
  }
  
  matchedStoreOrdersCount.value = store.orders_count !== undefined ? store.orders_count : (store.total_orders || null)
  
  if (store.orders && store.orders.length > 0) {
    const lastOrder = store.orders[0]
    if (lastOrder.items && lastOrder.items.length > 0) {
      lastOrderItems.value = lastOrder.items
    } else {
      lastOrderItems.value = []
    }
  } else {
    lastOrderItems.value = []
  }
  
  searchModalOpen.value = false
  
  nextTick(() => {
    isProgrammaticUpdate.value = false
  })
}


function getPhnomPenhNow() {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23'
  })
  const parts = formatter.formatToParts(now)
  const getVal = (t: string) => parseInt(parts.find(p => p.type === t)?.value || '0', 10)
  return {
    year: getVal('year'),
    month: getVal('month'), // 1-12
    day: getVal('day'),
    hour: getVal('hour'),
    minute: getVal('minute')
  }
}

function formatDateString(year: number, month: number, day: number, daysToAdd = 0): string {
  const d = new Date(Date.UTC(year, month - 1, day + daysToAdd))
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dateNum = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${dateNum}`
}

function getTodayDate(): string {
  const pp = getPhnomPenhNow()
  return formatDateString(pp.year, pp.month, pp.day, 0)
}

function getDefaultDeliveryDate(): string {
  const pp = getPhnomPenhNow()
  // Cutoff at 12:00 PM (noon):
  // If order is placed before 12:00 PM (hour < 12) -> Tomorrow (+1 day)
  // If order is placed at or after 12:00 PM (hour >= 12) -> Day after tomorrow (+2 days)
  const daysToAdd = pp.hour < 12 ? 1 : 2
  return formatDateString(pp.year, pp.month, pp.day, daysToAdd)
}

function defaultForm() {
  return {
    shop_name: '',
    customer_address: '',
    province: '',
    district: '',
    commune: '',
    is_new_store: false,
    is_direct_sale: false,
    is_wholesale: false,
    is_modern_trade: false,
    disable_promotions: false,
    selected_bundle_id: null as number | string | null,
    mt_discount_enabled: false,
    ws_discount_enabled: false,
    store_profile_id: '',
    trade_class_l1: '',
    trade_class_l2: '',
    trade_class_l3: '',
    so_number: '',
    customer_id: '',
    contact: '',
    location: '',
    items: [] as { product_id: string; qty: number; unit: string; unit_price: number; manual_discount: number; promo_option?: string; editing?: boolean }[],
    delivery_date: getDefaultDeliveryDate(),
    payment_method: 'COD',
    note: ''
  }
}
const form = reactive(defaultForm())

// Fetch Trade Classes and Store Profiles
const tradeClassHierarchy = ref<Record<string, Record<string, string[]>>>({})
const storeProfiles = ref<any[]>([])
const ratingStoreProfiles = computed(() => {
  return storeProfiles.value.filter(s => {
    const name = (s.name || '').toLowerCase()
    return s.type_category === 'profile' || name.includes('$') || name.includes('profile')
  })
})

async function fetchTradeClasses() {
  try {
    const [tcRes, spRes] = await Promise.all([
      api.get('/trade-classes/hierarchy'),
      api.get('/store-types') // which are now Store Profiles
    ])
    tradeClassHierarchy.value = tcRes as Record<string, Record<string, string[]>>
    storeProfiles.value = (spRes as any[]) || []
  } catch (e) {
    console.error('Failed to load classes or profiles:', e)
  }
}

const tradeClassL1Options = computed(() => Object.keys(tradeClassHierarchy.value))
const tradeClassL2Options = computed(() => {
  if (!form.trade_class_l1) return []
  return Object.keys(tradeClassHierarchy.value[form.trade_class_l1] || {})
})
const tradeClassL3Options = computed(() => {
  if (!form.trade_class_l1 || !form.trade_class_l2) return []
  return tradeClassHierarchy.value[form.trade_class_l1]?.[form.trade_class_l2] || []
})

watch(() => form.trade_class_l1, () => {
  form.trade_class_l2 = ''
  form.trade_class_l3 = ''
})
watch(() => form.trade_class_l2, () => {
  form.trade_class_l3 = ''
})

// Reset MT discount opt-in whenever Modern Trade is toggled off
watch(() => form.is_modern_trade, (val) => {
  if (!val) {
    form.mt_discount_enabled = false
  }
})

// Reset Wholesale discount opt-in whenever Wholesale is toggled off
watch(() => form.is_wholesale, (val) => {
  if (!val) {
    form.ws_discount_enabled = false
  }
})

// ── Store Type Dropdown helpers ──────────────────────────────────────────────
const selectedStoreTypeId = ref<number | string | null>(null)
const storeTypes = ref<any[]>([])

const defaultStoreTypes = [
  { id: 'regular', name: 'Regular Store', description: 'Standard retail customer', icon: 'heroicons:building-storefront', type_category: 'regular', code: 'retail' },
  { id: 'new_store', name: 'New Store', description: 'First-time registration', icon: 'heroicons:sparkles', type_category: 'new_store', code: 'new_store' },
  { id: 'wholesale', name: 'Wholesale', description: 'Bulk buyer · opt-in discount', icon: 'heroicons:cube', type_category: 'wholesale', code: 'wholesale' },
  { id: 'modern_trade', name: 'Modern Trade', description: 'MT pricing · opt-in discount', icon: 'heroicons:tag', type_category: 'modern_trade', code: 'mt' }
]

const activeStoreTypes = computed(() => {
  if (!storeTypes.value || !storeTypes.value.length) {
    return defaultStoreTypes
  }
  const filtered = storeTypes.value.filter(s => {
    const name = (s.name || '').toLowerCase()
    if (name.includes('$') || name.includes('profile')) return false
    if (s.is_active === false || s.is_active === 0 || s.is_active === '0') return false
    return true
  })
  
  return filtered.length ? filtered : defaultStoreTypes
})

function selectStoreTypeItem(st: any) {
  selectedStoreTypeId.value = st.id
  if (typeof st.id === 'number') {
    form.store_profile_id = st.id
  }
  const cat = st.type_category || st.code || ''
  if (cat === 'wholesale' || st.name.toLowerCase().includes('wholesale')) {
    onStoreTypeChange('wholesale')
  } else if (cat === 'modern_trade' || st.name.toLowerCase().includes('modern trade') || st.name.toLowerCase().includes('mt')) {
    onStoreTypeChange('modern_trade')
  } else if (cat === 'new_store' || st.name.toLowerCase().includes('new store')) {
    onStoreTypeChange('new_store')
  } else {
    onStoreTypeChange('')
  }
}

function isStoreTypeSelected(st: any): boolean {
  if (selectedStoreTypeId.value && selectedStoreTypeId.value === st.id) return true
  const cat = st.type_category || st.code || ''
  if (storeTypeValue.value === 'wholesale' && (cat === 'wholesale' || st.name.toLowerCase().includes('wholesale'))) return true
  if (storeTypeValue.value === 'modern_trade' && (cat === 'modern_trade' || st.name.toLowerCase().includes('modern trade') || st.name.toLowerCase().includes('mt'))) return true
  if (storeTypeValue.value === 'new_store' && (cat === 'new_store' || st.name.toLowerCase().includes('new store'))) return true
  if (storeTypeValue.value === '' && (cat === 'regular' || (!cat && !form.is_wholesale && !form.is_modern_trade && !form.is_new_store))) return true
  return false
}

function getStoreTypeIconBg(st: any): string {
  const cat = st.type_category || st.code || ''
  if (cat === 'wholesale' || st.name.toLowerCase().includes('wholesale')) return 'bg-purple-100 text-purple-600'
  if (cat === 'modern_trade' || st.name.toLowerCase().includes('modern trade') || st.name.toLowerCase().includes('mt')) return 'bg-emerald-100 text-emerald-600'
  if (cat === 'new_store' || st.name.toLowerCase().includes('new store')) return 'bg-blue-100 text-blue-600'
  return 'bg-slate-100 text-slate-600'
}

// Computed string value for the <select> binding
const storeTypeValue = computed(() => {
  if (form.is_modern_trade) return 'modern_trade'
  if (form.is_wholesale) return 'wholesale'
  if (form.is_new_store) return 'new_store'
  return ''
})

// Mutate the three boolean flags based on dropdown selection
function onStoreTypeChange(val: string) {
  form.is_new_store = val === 'new_store'
  form.is_wholesale = val === 'wholesale'
  form.is_modern_trade = val === 'modern_trade'
  // Reset discount opt-ins on type change
  form.mt_discount_enabled = false
  form.ws_discount_enabled = false
}

// Single v-model bridge for the combined discount checkbox
const activeDiscountEnabled = computed({
  get() {
    if (form.is_modern_trade) return form.mt_discount_enabled
    if (form.is_wholesale) return form.ws_discount_enabled
    return false
  },
  set(val: boolean) {
    if (form.is_modern_trade) form.mt_discount_enabled = val
    else if (form.is_wholesale) form.ws_discount_enabled = val
  }
})

const subtotal = computed(() => {
  return form.items.reduce((sum, item) => sum + (getItemEffectivePrice(item) * (item.qty || 0)), 0)
})

function getItemEffectivePrice(item: any) {
  let price = item.unit_price || 0;
  if (form.is_modern_trade) {
    const product = products.value.find(p => String(p.id) === String(item.product_id));
    if (product) {
      if (item.unit === product.unit && product.mt_price != null) {
        price = Number(product.mt_price);
      }
      if (product.units) {
        const u = product.units.find((u: any) => u.name === item.unit);
        if (u && u.mt_price != null) {
          price = Number(u.mt_price);
        }
      }
    }
  }
  return price;
}

function getItemCtnEquivalent(item: any) {
  const unit = getAvailableUnits(item.product_id).find(u => u.name === item.unit)
  const rawFactor = unit ? ((unit as any).carton_factor ?? 0) : 0
  let factor = 0
  if (rawFactor > 0) {
    factor = rawFactor >= 1 ? (1 / rawFactor) : rawFactor
  }
  return (item.qty || 0) * factor
}

// ── Promotion system state refs (declared before computeds that use them) ──
const categoryPromotions = ref<any[]>([])
const productPromotions = ref<any[]>([])
const activePromotionSystem = ref('category')
const mtPromoActive = ref(true)
const mtCodActive = ref(true)
const bundlePromotions = ref<any[]>([])
const globalSettings = ref<any>({})

const activeProductPromoProductIds = computed(() => {
  const pids = new Set<number>()
  productPromotions.value.forEach((promo: any) => {
    (promo.target_product_ids || []).forEach((pid: number) => pids.add(Number(pid)))
    if (promo.product_id) pids.add(Number(promo.product_id))
  })
  return pids
})

const promotionStatus = computed(() => {
  const status: any = {}
  
  if (form.disable_promotions) return status
  if (form.is_modern_trade && !mtPromoActive.value) return status
  
  form.items.forEach(item => {
    const pIdNum = Number(item.product_id)
    if (activeProductPromoProductIds.value.has(pIdNum)) return // Product has dedicated deal; excluded from category tiering

    const product = products.value.find(p => String(p.id) === String(item.product_id))
    if (!product || !product.category_id) return
    
    const catId = product.category_id
    if (!status[catId]) {
      status[catId] = { cartons: 0, subtotal: 0, category_name: product.category?.name || 'Category' }
    }
    
    const unit = getAvailableUnits(item.product_id).find(u => u.name.toUpperCase() === (item.unit || '').toUpperCase())
    const rawFactor = unit ? ((unit as any).carton_factor ?? 0) : 0
    let factor = 0
    if (rawFactor > 0) {
      factor = rawFactor >= 1 ? (1 / rawFactor) : rawFactor
    }
    status[catId].cartons += (item.qty || 0) * factor
    status[catId].subtotal += (item.qty || 0) * getItemEffectivePrice(item)
  })

  const getQualifyingVolumeForPromo = (promo: any, targetUnit: string) => {
    targetUnit = targetUnit.toUpperCase()
    let totalQty = 0.0
    const catIds = (promo.target_category_ids || [promo.category_id]).map(Number)
    const prodIds = (promo.target_product_ids || []).map(Number)
    const isCatPromo = promo.promotion_type === 'category_tiered' || promo.promotion_type === 'mixed_tiered'

    form.items.forEach(item => {
      if (bundleConsumedProductIds.value.includes(String(item.product_id))) return
      const pIdNum = Number(item.product_id)
      if (isCatPromo && activeProductPromoProductIds.value.has(pIdNum)) return // Product has dedicated deal; excluded from category volume

      const product = products.value.find(p => String(p.id) === String(item.product_id))
      if (!product) return

      const matchesCat = product.category_id !== null && catIds.includes(Number(product.category_id))
      const matchesProd = prodIds.includes(Number(item.product_id))
      if (!matchesCat && !matchesProd) return

      const unit = getAvailableUnits(item.product_id).find(u => u.name.toUpperCase() === (item.unit || '').toUpperCase())
      const rawFactor = unit ? ((unit as any).carton_factor ?? 0) : 0
      let factor = 0
      if (rawFactor > 0) {
        factor = rawFactor >= 1 ? (1 / rawFactor) : rawFactor
      }
      const ctnQty = (item.qty || 0) * factor

      if (targetUnit === 'CTN') {
        totalQty += ctnQty
      } else {
        const availUnits = getAvailableUnits(item.product_id)
        const targetProductUnit = availUnits.find(u => u.name.toUpperCase() === targetUnit)
        const rawTargetFactor = (targetProductUnit as any)?.carton_factor || 0.1
        let targetFactor = 0.1
        if (rawTargetFactor > 0) {
          targetFactor = rawTargetFactor >= 1 ? (1 / rawTargetFactor) : rawTargetFactor
        }
        totalQty += ctnQty / targetFactor
      }
    })
    return totalQty
  }

  Object.keys(status).forEach(catId => {
    const catIdNum = Number(catId)
    const rules = (categoryPromotions.value || []).filter(p => p.category_id === catIdNum || (p.target_category_ids && p.target_category_ids.includes(catIdNum)))
    
    const applicableRules = rules.filter(r => {
      const triggerUnit = (r.trigger_unit || 'CTN').toUpperCase()
      const volume = getQualifyingVolumeForPromo(r, triggerUnit)
      ;(r as any)._tempVolume = volume
      
      // Round to 2 decimal places to handle carton factor precision (e.g. 12 * 0.083 = 0.996 -> 1.00)
      const roundedVolume = Math.round(volume * 100) / 100
      return roundedVolume > 0 && (roundedVolume + 0.0001) >= r.min_cartons
    })

    const applied = applicableRules.sort((a, b) => (b._ctn_eq || 0) - (a._ctn_eq || 0))[0] || null
    
    if (applied) {
      const choice = getCategoryPromoChoice(catIdNum)
      const chosenGroup = applied.has_options ? (choice === 'discount' ? 1 : 2) : 1
      
      // Collect all rewards across all applicable tier rules for this category/promotion
      const allTierRewards: any[] = []
      applicableRules.forEach(r => {
        if (r.rewards && Array.isArray(r.rewards)) {
          r.rewards.forEach((rw: any) => {
            if (rw.option_group === chosenGroup) {
              allTierRewards.push({
                ...rw,
                _promo_temp_volume: (r as any)._tempVolume
              })
            }
          })
        }
      })

      const discountRewards = allTierRewards.filter((r: any) => {
        const isType = r.reward_type === 'discount_pct' || r.reward_type === 'discount_flat'
        if (!isType) return false
        const minTrig = r.min_qty_trigger !== null ? Number(r.min_qty_trigger) : 0
        const maxTrig = r.max_qty_trigger !== null ? Number(r.max_qty_trigger) : 999999
        const triggerUnit = r.trigger_unit || 'CTN'
        const vol = getQualifyingVolumeForPromo(applied, triggerUnit)
        const roundedVol = Math.round(vol * 100) / 100
        return (roundedVol + 0.0001) >= minTrig && roundedVol <= maxTrig
      })

      // For cascading FOC: include ALL FOC tiers where the total volume >= minTrig.
      // Do NOT filter by max_qty_trigger here — the cascade step algorithm handles
      // which tier fires based on remaining qty. Filtering by max would break 6 CTN
      // (total > Tier1.max=4) causing Tier1 to be excluded and remainder ignored.
      const focRewards = allTierRewards.filter((r: any) => {
        const isType = r.reward_type === 'foc' && r.foc_product_id
        if (!isType) return false
        const minTrig = r.min_qty_trigger !== null ? Number(r.min_qty_trigger) : 0
        const triggerUnit = r.trigger_unit || 'CTN'
        const vol = getQualifyingVolumeForPromo(applied, triggerUnit)
        const roundedVol = Math.round(vol * 100) / 100
        // Only check min threshold — cascade handles the max range internally
        return (roundedVol + 0.0001) >= minTrig
      })

      const sampleProd = products.value.find(p => p.category_id === catIdNum)
      const getFocUnitFactor = (unitName: string) => {
        if (!unitName || unitName.toUpperCase() === 'CTN') return 1.0
        if (sampleProd) {
          const u = getAvailableUnits(sampleProd.id).find((x: any) => x.name.toUpperCase() === unitName.toUpperCase())
          if (u && (u as any).carton_factor > 0) {
            const raw = (u as any).carton_factor
            return raw >= 1 ? (1 / raw) : raw
          }
        }
        return 0.1
      }

      // Group FOC rewards by foc_product_id to compute mixed remainder cascading per gift product
      const focByProduct: { [pid: string]: any[] } = {}
      focRewards.forEach((r: any) => {
        const pid = String(r.foc_product_id)
        if (!focByProduct[pid]) focByProduct[pid] = []
        focByProduct[pid].push(r)
      })

      const freeGiftsList: any[] = []
      Object.entries(focByProduct).forEach(([pid, tierList]) => {
        tierList.sort((a: any, b: any) => {
          const aUnit = a.trigger_unit || 'CTN'
          const bUnit = b.trigger_unit || 'CTN'
          const aFactor = getFocUnitFactor(aUnit)
          const bFactor = getFocUnitFactor(bUnit)
          const aCtnEq = Number(a.min_qty_trigger || 0) * aFactor
          const bCtnEq = Number(b.min_qty_trigger || 0) * bFactor
          return bCtnEq - aCtnEq
        })

        const primaryReward = tierList[0]
        const triggerUnit = primaryReward.trigger_unit || 'CTN'
        const totalVolume = getQualifyingVolumeForPromo(applied, triggerUnit)
        const hasMultiply = tierList.some((r: any) => !!r.is_multiply)

        let calculatedQty = 0
        if (hasMultiply) {
          let remainingQty = totalVolume
          tierList.forEach((r: any) => {
            const step = Number(r.min_qty_trigger || 1)
            const isMultiply = !!r.is_multiply
            if (isMultiply) {
              if (step > 0 && remainingQty >= (step - 0.0001)) {
                const sets = Math.floor(remainingQty / step)
                // extra_foc is a flat fixed bonus — only added from the primaryReward
                // once after the loop, NOT per-tier, to avoid double-counting
                calculatedQty += sets * Number(r.foc_qty || 0)
                remainingQty = remainingQty - (sets * step)
              }
            } else {
              if (remainingQty >= (step - 0.0001)) {
                calculatedQty += Number(r.foc_qty || 0)
                remainingQty = Math.max(0, remainingQty - step)
              }
            }
          })
          // Add extra_foc once from primaryReward (the highest-tier flat bonus)
          calculatedQty += Number(primaryReward.extra_foc || 0)
        } else {
          calculatedQty = Number(primaryReward.foc_qty || 0) + Number(primaryReward.extra_foc || 0)
        }

        freeGiftsList.push({
          free_product_id: primaryReward.foc_product_id,
          free_qty: calculatedQty,
          calculated_qty: calculatedQty,
          free_unit: primaryReward.foc_unit || 'box',
          free_product: primaryReward.foc_product || primaryReward.focProduct || null,
          is_multiply: !!primaryReward.is_multiply,
          extra_foc: Number(primaryReward.extra_foc || 0)
        })
      })
      
      status[catIdNum].applied = {
        ...applied,
        discount_amount: discountRewards[0] && discountRewards[0].reward_type === 'discount_flat' ? Number(discountRewards[0].discount_value) : 0,
        discount_pct: discountRewards[0] && discountRewards[0].reward_type === 'discount_pct' ? Number(discountRewards[0].discount_value) : 0,
        free_product_id: freeGiftsList[0]?.free_product_id || null,
        free_qty: freeGiftsList[0]?.free_qty || 0,
        free_unit: freeGiftsList[0]?.free_unit || '',
        free_product: freeGiftsList[0]?.free_product || null,
        is_multiply: discountRewards[0] ? !!discountRewards[0].is_multiply : (freeGiftsList[0] ? !!freeGiftsList[0].is_multiply : false),
        extra_foc: discountRewards[0] ? Number(discountRewards[0].extra_foc || 0) : (freeGiftsList[0] ? Number(freeGiftsList[0].extra_foc || 0) : 0),
        free_gifts: freeGiftsList
      }
      status[catIdNum].cartons = (applied as any)._tempVolume
    } else {
      status[catIdNum].applied = null
    }

    status[catIdNum].next = rules.find(r => r.min_cartons > ((r as any)._tempVolume || 0))
  })

  return status
})

const totalCategoryDiscount = computed(() => {
  if (form.disable_promotions) return 0
  if (form.is_modern_trade && !mtPromoActive.value) return 0;
  
  const consumedIds = bundleConsumedProductIds.value
  let totalDiscount = 0

  Object.entries(promotionStatus.value).forEach(([catIdStr, s]: [string, any]) => {
    if (!s.applied) return
    const promo = s.applied
    const catId = Number(catIdStr)

    const targetCatIds = (promo.target_category_ids || [promo.category_id]).map(Number)
    const targetProdIds = (promo.target_product_ids || []).map(Number)

    // Check if salesperson chose discount option
    let isDiscountChosen = !promo.has_options
    if (promo.has_options) {
      const catChoice = getCategoryPromoChoice(catId)
      if (catChoice === 'discount') isDiscountChosen = true
    }

    if (!isDiscountChosen) return

    let eligibleSubtotal = 0
    let eligibleCartons = 0
    let hasEligibleItems = false

    form.items.forEach(item => {
      if (consumedIds.includes(String(item.product_id))) return
      const pIdNum = Number(item.product_id)
      if (activeProductPromoProductIds.value.has(pIdNum)) return // Excluded from category discount

      const product = products.value.find(p => String(p.id) === String(item.product_id))
      if (!product) return

      const matches = product.category_id !== null && Number(product.category_id) === catId
      if (matches) {
        eligibleSubtotal += (item.qty || 0) * getItemEffectivePrice(item)
        eligibleCartons += getItemCtnEquivalent(item)
        hasEligibleItems = true
      }
    })

    if (!hasEligibleItems) return

    let baseDiscount = Number(promo.discount_amount) || 0
    let pctDiscount = Number(promo.discount_pct) || 0

    if (baseDiscount > 0) {
      const isMultiply = promo.is_multiply === true || promo.is_multiply === 'true' || promo.is_multiply == 1
      let multiplier = isMultiply ? eligibleCartons : 1
      totalDiscount += baseDiscount * multiplier
    }

    if (pctDiscount > 0) {
      totalDiscount += eligibleSubtotal * (pctDiscount / 100)
    }
  })

  return totalDiscount
})

const categoryDiscountLabels = computed(() => {
  if (form.disable_promotions) return ''
  if (form.is_modern_trade && !mtPromoActive.value) return ''
  const consumedIds = bundleConsumedProductIds.value
  const labels: string[] = []

  Object.entries(promotionStatus.value).forEach(([catIdStr, s]: [string, any]) => {
    if (!s.applied) return
    const catId = Number(catIdStr)
    const catChoice = getCategoryPromoChoice(catId)
    if (s.applied.has_options && catChoice !== 'discount') return
    
    let hasEligibleItems = false
    form.items.forEach(item => {
      if (consumedIds.includes(String(item.product_id))) return
      const pIdNum = Number(item.product_id)
      if (activeProductPromoProductIds.value.has(pIdNum)) return

      const product = products.value.find(p => String(p.id) === String(item.product_id))
      if (product && product.category_id === catId) hasEligibleItems = true
    })
    
    if (!hasEligibleItems) return
    
    let baseDiscount = Number(s.applied.discount_amount) || 0
    let pctDiscount = Number(s.applied.discount_pct) || 0
    const promoName = s.applied.name || ''

    let discStr = ''
    if (pctDiscount > 0 && baseDiscount > 0) discStr = `${pctDiscount}% + $${baseDiscount}`
    else if (pctDiscount > 0) discStr = `${pctDiscount}%`
    else if (baseDiscount > 0) discStr = `$${baseDiscount}`
    
    if (discStr) {
      labels.push(promoName ? `${promoName} (${discStr})` : discStr)
    }
  })
  return Array.from(new Set(labels)).join(', ')
})

const selectedStoreType = ref('')

const currentChannelType = computed(() => {
  let typeStr = ''
  if (form.is_new_store && form.store_profile_id) {
    const profile = storeProfiles.value.find(p => p.id == form.store_profile_id)
    if (profile) typeStr = profile.name || ''
  } else {
    typeStr = selectedStoreType.value || ''
  }
  
  if (typeStr && typeStr.toLowerCase().includes('specialty')) {
    return 'specialty'
  }
  return 'general'
})

function getPromoForCategory(categoryId: number | null) {
  if (form.disable_promotions) return null
  if (!categoryId) return null
  const stat = promotionStatus.value[categoryId]
  return stat?.applied || null
}

function getCategoryPromoChoice(categoryId: number | null) {
  if (!categoryId) return 'foc'
  const firstItem = form.items.find(item => {
    const pIdNum = Number(item.product_id)
    if (activeProductPromoProductIds.value.has(pIdNum)) return false

    const p = products.value.find(x => x.id == item.product_id)
    return p && p.category_id === categoryId && !bundleConsumedProductIds.value.includes(String(item.product_id))
  })
  return firstItem?.promo_option || 'foc'
}

function setCategoryPromoChoice(categoryId: number | null, choice: 'foc' | 'discount') {
  if (!categoryId) return
  form.items.forEach(item => {
    const p = products.value.find(x => x.id == item.product_id)
    if (p && p.category_id === categoryId) {
      item.promo_option = choice
    }
  })
}

const productPromotionStatus = computed(() => {
  const status: any = {}
  if (form.disable_promotions) return status
  if (form.is_modern_trade && !mtPromoActive.value) return status

  const activeProductIds = Array.from(activeProductPromoProductIds.value)

  activeProductIds.forEach(prodIdNum => {
    const rules = (productPromotions.value || []).filter(p => Number(p.product_id) === prodIdNum || (p.target_product_ids && p.target_product_ids.includes(prodIdNum)))
    if (rules.length === 0) return

    const prodObj = products.value.find(p => Number(p.id) === prodIdNum)
    status[prodIdNum] = { cartons: 0, subtotal: 0, product_name: prodObj?.name || 'Product' }

    const getQualifyingVolumeForProduct = (promo: any, targetUnit: string) => {
      targetUnit = targetUnit.toUpperCase()
      let totalQty = 0.0
      form.items.forEach(item => {
        if (bundleConsumedProductIds.value.includes(String(item.product_id))) return
        if (Number(item.product_id) !== prodIdNum) return

        const unit = getAvailableUnits(item.product_id).find(u => u.name.toUpperCase() === (item.unit || '').toUpperCase())
        const rawFactor = unit ? ((unit as any).carton_factor ?? 0) : 0
        let factor = 0
        if (rawFactor > 0) factor = rawFactor >= 1 ? (1 / rawFactor) : rawFactor
        const ctnQty = (item.qty || 0) * factor

        if (targetUnit === 'CTN') {
          totalQty += ctnQty
        } else {
          const availUnits = getAvailableUnits(item.product_id)
          const targetProductUnit = availUnits.find(u => u.name.toUpperCase() === targetUnit)
          const rawTargetFactor = (targetProductUnit as any)?.carton_factor || 0.1
          let targetFactor = 0.1
          if (rawTargetFactor > 0) targetFactor = rawTargetFactor >= 1 ? (1 / rawTargetFactor) : rawTargetFactor
          totalQty += ctnQty / targetFactor
        }
      })
      return totalQty
    }

    const applicableRules = rules.filter(r => {
      const triggerUnit = (r.trigger_unit || 'CTN').toUpperCase()
      const volume = getQualifyingVolumeForProduct(r, triggerUnit)
      ;(r as any)._tempVolume = volume
      const roundedVolume = Math.round(volume * 100) / 100
      return roundedVolume > 0 && (roundedVolume + 0.0001) >= r.min_cartons
    })

    const applied = applicableRules.sort((a, b) => (b._ctn_eq || 0) - (a._ctn_eq || 0))[0] || null

    if (applied) {
      const itemChoice = form.items.find(it => Number(it.product_id) === prodIdNum)?.promo_option || 'foc'
      const chosenGroup = applied.has_options ? (itemChoice === 'discount' ? 1 : 2) : 1

      const allTierRewards: any[] = []
      applicableRules.forEach(r => {
        if (r.rewards && Array.isArray(r.rewards)) {
          r.rewards.forEach((rw: any) => {
            if (rw.option_group === chosenGroup) {
              allTierRewards.push({
                ...rw,
                _promo_temp_volume: (r as any)._tempVolume
              })
            }
          })
        }
      })

      const discountRewards = allTierRewards.filter((r: any) => {
        const isType = r.reward_type === 'discount_pct' || r.reward_type === 'discount_flat'
        if (!isType) return false
        const minTrig = r.min_qty_trigger !== null ? Number(r.min_qty_trigger) : 0
        const maxTrig = r.max_qty_trigger !== null ? Number(r.max_qty_trigger) : 999999
        const triggerUnit = r.trigger_unit || 'CTN'
        const vol = getQualifyingVolumeForProduct(applied, triggerUnit)
        const roundedVol = Math.round(vol * 100) / 100
        return (roundedVol + 0.0001) >= minTrig && roundedVol <= maxTrig
      })

      const focRewards = allTierRewards.filter((r: any) => {
        const isType = r.reward_type === 'foc' && r.foc_product_id
        if (!isType) return false
        const minTrig = r.min_qty_trigger !== null ? Number(r.min_qty_trigger) : 0
        const triggerUnit = r.trigger_unit || 'CTN'
        const vol = getQualifyingVolumeForProduct(applied, triggerUnit)
        const roundedVol = Math.round(vol * 100) / 100
        return (roundedVol + 0.0001) >= minTrig
      })

      const getFocUnitFactor = (unitName: string) => {
        if (!unitName || unitName.toUpperCase() === 'CTN') return 1.0
        if (prodObj) {
          const u = getAvailableUnits(prodObj.id).find((x: any) => x.name.toUpperCase() === unitName.toUpperCase())
          if (u && (u as any).carton_factor > 0) {
            const raw = (u as any).carton_factor
            return raw >= 1 ? (1 / raw) : raw
          }
        }
        return 0.1
      }

      const focByProduct: { [pid: string]: any[] } = {}
      focRewards.forEach((r: any) => {
        const pid = String(r.foc_product_id)
        if (!focByProduct[pid]) focByProduct[pid] = []
        focByProduct[pid].push(r)
      })

      const freeGiftsList: any[] = []
      Object.entries(focByProduct).forEach(([pid, tierList]) => {
        tierList.sort((a: any, b: any) => {
          const aUnit = a.trigger_unit || 'CTN'
          const bUnit = b.trigger_unit || 'CTN'
          const aFactor = getFocUnitFactor(aUnit)
          const bFactor = getFocUnitFactor(bUnit)
          const aCtnEq = Number(a.min_qty_trigger || 0) * aFactor
          const bCtnEq = Number(b.min_qty_trigger || 0) * bFactor
          return bCtnEq - aCtnEq
        })

        const primaryReward = tierList[0]
        const triggerUnit = primaryReward.trigger_unit || 'CTN'
        const totalVolume = getQualifyingVolumeForProduct(applied, triggerUnit)
        const hasMultiply = tierList.some((r: any) => !!r.is_multiply)

        let calculatedQty = 0
        if (hasMultiply) {
          let remainingQty = totalVolume
          tierList.forEach((r: any) => {
            const step = Number(r.min_qty_trigger || 1)
            const isMultiply = !!r.is_multiply
            if (isMultiply) {
              if (step > 0 && remainingQty >= (step - 0.0001)) {
                const sets = Math.floor(remainingQty / step)
                calculatedQty += sets * Number(r.foc_qty || 0)
                remainingQty = remainingQty - (sets * step)
              }
            } else {
              if (remainingQty >= (step - 0.0001)) {
                calculatedQty += Number(r.foc_qty || 0)
                remainingQty = Math.max(0, remainingQty - step)
              }
            }
          })
          calculatedQty += Number(primaryReward.extra_foc || 0)
        } else {
          calculatedQty = Number(primaryReward.foc_qty || 0) + Number(primaryReward.extra_foc || 0)
        }

        const giftProdObj = products.value.find(p => p.id == primaryReward.foc_product_id)

        freeGiftsList.push({
          free_product_id: primaryReward.foc_product_id,
          free_qty: calculatedQty,
          calculated_qty: calculatedQty,
          free_unit: primaryReward.foc_unit || (giftProdObj as any)?.unit || 'box',
          free_product: primaryReward.foc_product || primaryReward.focProduct || giftProdObj || null,
          is_multiply: !!primaryReward.is_multiply,
          extra_foc: Number(primaryReward.extra_foc || 0)
        })
      })

      status[prodIdNum].applied = {
        ...applied,
        discount_amount: discountRewards[0] && discountRewards[0].reward_type === 'discount_flat' ? Number(discountRewards[0].discount_value) : 0,
        discount_pct: discountRewards[0] && discountRewards[0].reward_type === 'discount_pct' ? Number(discountRewards[0].discount_value) : 0,
        free_product_id: freeGiftsList[0]?.free_product_id || null,
        free_qty: freeGiftsList[0]?.free_qty || 0,
        free_unit: freeGiftsList[0]?.free_unit || '',
        free_product: freeGiftsList[0]?.free_product || null,
        is_multiply: discountRewards[0] ? !!discountRewards[0].is_multiply : (freeGiftsList[0] ? !!freeGiftsList[0].is_multiply : false),
        extra_foc: discountRewards[0] ? Number(discountRewards[0].extra_foc || 0) : (freeGiftsList[0] ? Number(freeGiftsList[0].extra_foc || 0) : 0),
        free_gifts: freeGiftsList
      }
      status[prodIdNum].cartons = (applied as any)._tempVolume
    } else {
      status[prodIdNum].applied = null
    }

    status[prodIdNum].next = rules.find(r => r.min_cartons > ((r as any)._tempVolume || 0))
  })

  return status
})

const applicableProductPromotions = computed(() => {
  return Object.values(productPromotionStatus.value).map((s: any) => s.applied).filter(Boolean)
})

const productPromotionsDiscount = computed(() => {
  if (form.disable_promotions) return 0
  if (form.is_modern_trade && !mtPromoActive.value) return 0

  let totalDiscount = 0
  const consumedIds = bundleConsumedProductIds.value

  Object.entries(productPromotionStatus.value).forEach(([prodIdStr, s]: [string, any]) => {
    if (!s.applied) return
    const promo = s.applied
    const prodIdNum = Number(prodIdStr)

    let isDiscountChosen = !promo.has_options
    if (promo.has_options) {
      const itemChoice = form.items.find(it => Number(it.product_id) === prodIdNum)?.promo_option || 'foc'
      if (itemChoice === 'discount') isDiscountChosen = true
    }
    if (!isDiscountChosen) return

    let eligibleSubtotal = 0
    let eligibleCartons = 0
    let hasEligibleItems = false

    form.items.forEach(item => {
      if (consumedIds.includes(String(item.product_id))) return
      if (Number(item.product_id) !== prodIdNum) return

      eligibleSubtotal += (item.qty || 0) * getItemEffectivePrice(item)
      eligibleCartons += getItemCtnEquivalent(item)
      hasEligibleItems = true
    })

    if (!hasEligibleItems) return

    let baseDiscount = Number(promo.discount_amount) || 0
    let pctDiscount = Number(promo.discount_pct) || 0

    if (baseDiscount > 0) {
      const isMultiply = promo.is_multiply === true || promo.is_multiply === 'true' || promo.is_multiply == 1
      let multiplier = isMultiply ? eligibleCartons : 1
      totalDiscount += baseDiscount * multiplier
    }

    if (pctDiscount > 0) {
      totalDiscount += eligibleSubtotal * (pctDiscount / 100)
    }
  })

  return totalDiscount
})

const productFocItems = computed(() => {
  if (form.disable_promotions) return []
  if (form.is_modern_trade && !mtPromoActive.value) return []

  const focs: any[] = []
  Object.entries(productPromotionStatus.value).forEach(([prodIdStr, s]: [string, any]) => {
    if (!s.applied) return
    const promo = s.applied
    const prodIdNum = Number(prodIdStr)

    if (promo.has_options) {
      const itemChoice = form.items.find(it => Number(it.product_id) === prodIdNum)?.promo_option || 'foc'
      if (itemChoice === 'discount') return
    }

    if (promo.free_gifts && promo.free_gifts.length > 0) {
      promo.free_gifts.forEach((gift: any) => {
        if (gift.free_qty > 0) {
          const matchedProd = products.value.find(p => p.id == gift.free_product_id)
          const prodName = gift.free_product?.name || matchedProd?.name || 'Free Product'
          focs.push({
            product_id: gift.free_product_id,
            name: prodName,
            qty: gift.calculated_qty !== undefined ? gift.calculated_qty : gift.free_qty,
            unit: gift.free_unit || matchedProd?.unit || 'BOX',
            bundle_name: s.product_name || promo.name || 'Product Deal'
          })
        }
      })
    }
  })
  return focs
})

const productDiscountLabels = computed(() => {
  if (form.disable_promotions) return ''
  if (form.is_modern_trade && !mtPromoActive.value) return ''
  const consumedIds = bundleConsumedProductIds.value
  const labels: string[] = []

  Object.entries(productPromotionStatus.value).forEach(([prodIdStr, s]: [string, any]) => {
    if (!s.applied) return
    const prodIdNum = Number(prodIdStr)
    const item = form.items.find(it => Number(it.product_id) === prodIdNum)
    if (!item) return
    if (s.applied.has_options && (item.promo_option || 'foc') !== 'discount') return

    let baseDiscount = Number(s.applied.discount_amount) || 0
    let pctDiscount = Number(s.applied.discount_pct) || 0
    const promoName = s.applied.name || ''

    let discStr = ''
    if (pctDiscount > 0 && baseDiscount > 0) discStr = `${pctDiscount}% + $${baseDiscount}`
    else if (pctDiscount > 0) discStr = `${pctDiscount}%`
    else if (baseDiscount > 0) discStr = `$${baseDiscount}`
    
    if (discStr) {
      labels.push(promoName ? `${promoName} (${discStr})` : discStr)
    }
  })
  return Array.from(new Set(labels)).join(', ')
})

function getPromoForItem(item: any) {
  if (form.disable_promotions) return null
  const pIdNum = Number(item.product_id)
  if (activeProductPromoProductIds.value.has(pIdNum)) {
    const stat = productPromotionStatus.value[pIdNum]
    if (stat?.applied) {
      return { ...stat.applied, promo_level: 'product' }
    }
    return null
  }
  const p = products.value.find(x => x.id == item.product_id)
  if (p && p.category_id) {
    const promo = getPromoForCategory(p.category_id)
    if (promo) return { ...promo, promo_level: 'category' }
  }
  return null
}

function getItemPromoChoice(item: any) {
  const pIdNum = Number(item.product_id)
  if (activeProductPromoProductIds.value.has(pIdNum)) {
    return item.promo_option || 'foc'
  }
  const p = products.value.find(x => x.id == item.product_id)
  return getCategoryPromoChoice(p?.category_id ?? null)
}

function setItemPromoChoice(item: any, choice: 'foc' | 'discount') {
  const pIdNum = Number(item.product_id)
  if (activeProductPromoProductIds.value.has(pIdNum)) {
    item.promo_option = choice
    return
  }
  const p = products.value.find(x => x.id == item.product_id)
  setCategoryPromoChoice(p?.category_id ?? null, choice)
}

function getWholesaleDiscountPercent() {
  // MT discount is only applied if the salesperson explicitly ticked the MT Discount checkbox
  if (form.is_modern_trade && !form.mt_discount_enabled) {
    return 0
  }

  if (form.is_modern_trade && !mtCodActive.value) {
    return 0
  }

  if (form.is_wholesale) {
    // Wholesale discount also requires explicit opt-in
    if (!form.ws_discount_enabled) return 0

    const wholesaleProfile = storeProfiles.value.find(p => p.name === 'Wholesale')
    if (wholesaleProfile) {
      if (form.payment_method === 'COD') return Number(wholesaleProfile.cod_discount_percent) || 0
      if (form.payment_method === 'Credit') return Number(wholesaleProfile.credit_discount_percent) || 0
    }
    return form.payment_method === 'COD' ? 5.00 : 0.00
  }
  
  let profileName = ''
  if (form.is_new_store && form.store_profile_id) {
    const profile = storeProfiles.value.find(p => p.id == form.store_profile_id)
    if (profile) profileName = profile.name
  } else {
    profileName = selectedStoreType.value
  }
  
  let percent = 0
  if (profileName) {
    const profile = storeProfiles.value.find(p => p.name === profileName)
    if (profile) {
      if (form.payment_method === 'COD') percent = Number(profile.cod_discount_percent) || 0
      if (form.payment_method === 'Credit') percent = Number(profile.credit_discount_percent) || 0
    }
  }
  
  if (form.is_modern_trade && form.mt_discount_enabled && mtCodActive.value && percent === 0) {
    if (form.payment_method === 'COD') return globalSettings.value?.mt_cod_discount_percent !== undefined ? Number(globalSettings.value.mt_cod_discount_percent) : 5.00
    if (form.payment_method === 'Credit') return globalSettings.value?.mt_credit_discount_percent !== undefined ? Number(globalSettings.value.mt_credit_discount_percent) : 0.00
  }
  
  return percent
}

const wholesaleDiscountAmount = computed(() => {
  const discountPercent = getWholesaleDiscountPercent()
  if (discountPercent <= 0) return 0
  
  let total = subtotal.value
  if (activePromotionSystem.value === 'category' || activePromotionSystem.value === 'both') {
    total -= totalCategoryDiscount.value
  }
  total -= productPromotionsDiscount.value
  return Math.max(0, total * (discountPercent / 100))
})

const grandTotal = computed(() => {
  let total = subtotal.value
  if (activePromotionSystem.value === 'category' || activePromotionSystem.value === 'both') {
    total -= totalCategoryDiscount.value
  }
  total -= productPromotionsDiscount.value
  total -= wholesaleDiscountAmount.value
  return Math.max(0, total)
})

const filteredBundles = computed(() => {
  if (form.disable_promotions) return []
  if (form.is_modern_trade) return []
  const targetType = form.is_new_store ? 'new' : 'existing'
  const valid = bundlePromotions.value.filter(b => (b.is_active !== false && b.is_active !== 0 && b.is_active !== '0') && (b.target_outlet_type === 'all' || b.target_outlet_type === targetType))
  
  // Group by signature
  const groups: { [key: string]: any[] } = {}
  valid.forEach(b => {
    const sigParts = (b.requirements || []).map((r: any) => {
      const type = r.product_id ? 'product' : 'category'
      const id = r.product_id || r.category_id || 0
      return `${type}:${id}:${Number(r.required_qty)}:${r.required_unit || ''}`
    })
    sigParts.sort()
    const sig = sigParts.join('|')
    if (!groups[sig]) groups[sig] = []
    groups[sig].push(b)
  })
  
  const result: any[] = []
  Object.values(groups).forEach(group => {
    if (form.is_new_store) {
      const hasNew = group.some(b => b.target_outlet_type === 'new')
      if (hasNew) {
        result.push(...group.filter(b => b.target_outlet_type === 'new'))
        return
      }
    } else {
      const hasExisting = group.some(b => b.target_outlet_type === 'existing')
      if (hasExisting) {
        result.push(...group.filter(b => b.target_outlet_type === 'existing'))
        return
      }
    }
    result.push(...group)
  })
  
  return result
})

const qualifyingBundles = computed(() => {
  if (form.disable_promotions) return []
  if (form.is_modern_trade && !mtPromoActive.value) return []
  if (activePromotionSystem.value !== 'bundle' && activePromotionSystem.value !== 'both') return []
  
  const validBundles = filteredBundles.value
  const qualifying: any[] = []

  validBundles.forEach(bundle => {
    let maxBundlesPossible = 999999
    
    bundle.requirements.forEach((req: any) => {
      const targetUnit = req.required_unit
      let inCart = 0
      
      if (req.category_id) {
        const catProducts = products.value.filter(x => x.category_id === req.category_id)
        form.items.forEach(item => {
          const isMatch = catProducts.some(p => String(p.id) === String(item.product_id))
          if (isMatch) {
            if (!targetUnit || item.unit === targetUnit) {
              inCart += (item.qty || 0)
            }
          }
        })
      } else if (req.product_id) {
        form.items.forEach(item => {
          if (String(item.product_id) === String(req.product_id)) {
            if (!targetUnit || item.unit === targetUnit) {
              inCart += (item.qty || 0)
            }
          }
        })
      }
      
      const possibleWithThisItem = Math.floor(inCart / req.required_qty)
      if (possibleWithThisItem < maxBundlesPossible) {
        maxBundlesPossible = possibleWithThisItem
      }
    })

    if (maxBundlesPossible > 0 && bundle.requirements.length > 0) {
      qualifying.push({
        ...bundle,
        maxBundlesPossible
      })
    }
  })

  return qualifying
})

watch(qualifyingBundles, (qualifying) => {
  if (qualifying.length === 0) {
    form.selected_bundle_id = null
  } else if (!form.selected_bundle_id || !qualifying.some(b => String(b.id) === String(form.selected_bundle_id))) {
    form.selected_bundle_id = qualifying[0].id
  }
}, { immediate: true })

const activeBundle = computed(() => {
  const qualifying = qualifyingBundles.value
  if (qualifying.length === 0) return null
  return qualifying.find(b => String(b.id) === String(form.selected_bundle_id)) || qualifying[0]
})

const totalBundleSets = computed(() => {
  const b = activeBundle.value
  return b ? b.maxBundlesPossible : 0
})

const bundleConsumedProductIds = computed(() => {
  const b = activeBundle.value
  if (!b) return []
  
  const consumed = new Set<string>()
  const potentialConsumed = new Set<string>()

  b.requirements.forEach((req: any) => {
    const targetUnit = req.required_unit
    let inCart = 0
    
    if (req.category_id) {
      const catProducts = products.value.filter(x => x.category_id === req.category_id)
      form.items.forEach(item => {
        const isMatch = catProducts.some(p => String(p.id) === String(item.product_id))
        if (isMatch) {
          if (!targetUnit || item.unit === targetUnit) {
            inCart += (item.qty || 0)
            potentialConsumed.add(String(item.product_id))
          }
        }
      })
    } else if (req.product_id) {
      form.items.forEach(item => {
        if (String(item.product_id) === String(req.product_id)) {
          if (!targetUnit || item.unit === targetUnit) {
            inCart += (item.qty || 0)
            potentialConsumed.add(String(item.product_id))
          }
        }
      })
    }
  })

  potentialConsumed.forEach(id => consumed.add(id))
  return Array.from(consumed)
})

const bundleFocItems = computed(() => {
  const b = activeBundle.value
  if (!b) return []

  const freeItems: any[] = []
  b.focs.forEach((foc: any) => {
    freeItems.push({
      product_id: foc.product_id,
      name: foc.product?.name || 'Free Gift',
      qty: foc.qty * b.maxBundlesPossible,
      unit: foc.unit || 'BOX',
      bundle_name: b.name
    })
  })

  return freeItems
})

const globalFocItems = computed(() => {
  if (form.disable_promotions) return []
  if (form.is_modern_trade && !mtPromoActive.value) return []
  
  const freeItems: any[] = []
  const totalBundleSetsPurchased = totalBundleSets.value

  // Global FOC rules from settings
  const totalValue = subtotal.value
  const globalRulesJson = globalSettings.value.global_foc_rules
  if (globalRulesJson) {
    try {
      const globalRules = JSON.parse(globalRulesJson)
      if (Array.isArray(globalRules)) {
        globalRules.forEach((rule: any) => {
          if (rule.disabled || rule.is_active === false) return

          // Filter by channel (Multi-select Store Types supported)
          const targetChan = rule.channel_target || rule.selected_channels
          if (targetChan && targetChan !== 'all') {
            const chans = Array.isArray(targetChan) ? targetChan : String(targetChan).split(',').map(s => s.trim())
            if (!chans.includes('all')) {
              if (form.is_modern_trade && !chans.includes('mt') && !chans.includes('modern_trade')) return
              if (form.is_wholesale && !chans.includes('wholesale')) return
              if (form.is_new_store && !chans.includes('new_store')) return
              if (!form.is_modern_trade && !form.is_wholesale && !form.is_new_store && !chans.includes('retail') && !chans.includes('regular')) return
            }
          } else {
            if (form.is_modern_trade) {
              if (!rule.apply_mt) return
            } else if (form.is_wholesale) {
              if (!rule.apply_wholesale) return
            } else {
              if (rule.apply_retail === false) return
            }
          }

          const ruleType = rule.type
          const threshold = Number(rule.threshold || 0)
          const productId = rule.product_id
          const qty = Number(rule.qty || 0)
          const unit = rule.unit || ''

          if (!productId || qty <= 0) return

          const p = products.value.find(x => x.id == productId)
          if (!p) return

          if (ruleType === 'min_order_value' && totalValue >= threshold) {
            freeItems.push({
              product_id: p.id,
              name: p.name,
              qty: qty,
              unit: unit,
              bundle_name: `Order Total >= $${threshold.toFixed(2)}`
            })
          }

          if (ruleType === 'bundle_sets' && totalBundleSetsPurchased >= threshold && threshold > 0) {
            const multiplier = Math.floor(totalBundleSetsPurchased / threshold)
            if (multiplier > 0) {
              freeItems.push({
                product_id: p.id,
                name: p.name,
                qty: qty * multiplier,
                unit: unit,
                bundle_name: `Bundle Sets >= ${threshold} (x${multiplier})`
              })
            }
          }
        })
      }
    } catch (e) {
      console.error('Error parsing global FOC rules:', e)
    }
  }

  return freeItems
})

onMounted(async () => {
  if (process.client) {
    const savedForm = localStorage.getItem('draft_order_form')
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm)
        const hasContent = (parsed.items && parsed.items.length > 0) || parsed.shop_name || parsed.customer_id || parsed.so_number || parsed.contact
        if (!hasContent) {
          localStorage.removeItem('draft_order_form')
        } else {
          Object.assign(form, parsed)
        }
      } catch (e) {
        console.error('Failed to parse saved form:', e)
      }
    }
    const savedStoreType = localStorage.getItem('draft_selected_store_type')
    if (savedStoreType) {
      selectedStoreType.value = savedStoreType
    }
    // Always enforce the minimum allowed delivery date based on 12:00 PM cutoff rule
    const minDeliveryDate = form.is_direct_sale ? getTodayDate() : getDefaultDeliveryDate()
    if (!form.delivery_date || form.delivery_date < minDeliveryDate) {
      form.delivery_date = minDeliveryDate
    }
  }
  try {
    const [p, c, s, activePromos, stRes] = await Promise.all([
      api.get('/products'),
      api.get('/categories'),
      api.get('/global-settings').catch(() => ({})),
      api.get('/promotions/active').catch(() => []),
      api.get('/store-types').catch(() => [])
    ])
    products.value = p as any[]
    categories.value = c as any[]
    globalSettings.value = s || {}
    const rawSt = (stRes as any)?.data || stRes
    storeTypes.value = Array.isArray(rawSt) ? rawSt : []

    rawActivePromotions.value = (activePromos as any[]) || []
    processActivePromotions(rawActivePromotions.value)

    if (s && (s as any).active_promotion_system) {
      activePromotionSystem.value = (s as any).active_promotion_system
      mtPromoActive.value = (s as any).mt_promo_active === 'true'
      mtCodActive.value = (s as any).mt_cod_active !== 'false'
    }
  } catch (e) {
    console.error('Error fetching promotions or active system:', e)
    categoryPromotions.value = []
    productPromotions.value = []
    bundlePromotions.value = []
  }
  await fetchTradeClasses()
})

const rawActivePromotions = ref<any[]>([])

function processActivePromotions(pp: any[] = rawActivePromotions.value) {
  if (!pp || !Array.isArray(pp)) return

  // 1. Map category & mixed promotions
  const catPromos: any[] = []
  pp.forEach((promo: any) => {
    if (promo.promotion_type !== 'category_tiered' && promo.promotion_type !== 'mixed_tiered') return
    
    // Filter by Channel Target — uses the same logic as backend scopeForCart:
    // channel_type values are 'all', 'general', 'specialty'
    // A promotion with channel_type='general' applies to all store types (not just specialty)
    const ch = (promo.channel_type || 'all').trim().toLowerCase()
    if (ch !== 'all') {
      const chans = ch.split(',').map((s: string) => s.trim())
      if (!chans.includes('all')) {
        const isSpecialtyStore = !!(form as any).store_type && String((form as any).store_type).toLowerCase().includes('specialty')
        if (isSpecialtyStore && chans.includes('general')) return
        if (!isSpecialtyStore && chans.includes('specialty')) return

        if (form.is_modern_trade && !chans.includes('mt') && !chans.includes('modern_trade')) return
        if (form.is_wholesale && !chans.includes('wholesale')) return
        if (!form.is_modern_trade && !form.is_wholesale && !chans.includes('retail') && !chans.includes('regular') && !chans.includes('general')) return
      }
    }

    const targetCatIds = (promo.rules || []).filter((r: any) => r.rule_type === 'category').map((r: any) => Number(r.target_id)).filter(Boolean)
    const targetProdIds = (promo.rules || []).filter((r: any) => r.rule_type === 'product').map((r: any) => Number(r.target_id)).filter(Boolean)
    if (targetCatIds.length === 0 && targetProdIds.length === 0) return
    
    const primaryCatId = targetCatIds[0] || (products.value.find(p => targetProdIds.includes(Number(p.id)))?.category_id ?? null)
    if (!primaryCatId) return
    
    const rewards = promo.rewards || []

    const uniqueTiers: any[] = []
    const seenTiers = new Set()

    rewards.forEach((r: any) => {
      const trigVal = Number(r.min_qty_trigger || 0)
      const trigUnit = r.trigger_unit || 'CTN'
      const key = `${trigVal}-${trigUnit}`
      if (!seenTiers.has(key)) {
        seenTiers.add(key)
        uniqueTiers.push({ triggerQty: trigVal, triggerUnit: trigUnit })
      }
    })
    
    const sampleProd = products.value.find(p => targetCatIds.includes(Number(p.category_id)) || targetProdIds.includes(Number(p.id)))
    const getTriggerUnitFactor = (unitName: string) => {
      if (!unitName || unitName.toUpperCase() === 'CTN') return 1.0
      if (sampleProd) {
        const u = getAvailableUnits(sampleProd.id).find((x: any) => x.name.toUpperCase() === unitName.toUpperCase())
        if (u && (u as any).carton_factor > 0) {
          const raw = (u as any).carton_factor
          return raw >= 1 ? (1 / raw) : raw
        }
      }
      return 0.1
    }
    
    uniqueTiers.forEach((ut: any) => {
      const factor = getTriggerUnitFactor(ut.triggerUnit)
      ut._ctn_eq = ut.triggerQty * factor
    })
    
    uniqueTiers.sort((a, b) => a._ctn_eq - b._ctn_eq)

    uniqueTiers.forEach((ut: any, idx: number) => {
      const nextUt = uniqueTiers[idx + 1]
      const triggerQty = ut.triggerQty
      const triggerUnit = ut.triggerUnit
      
      const tierGroup1Rewards = rewards.filter((r: any) => 
        r.option_group === 1 &&
        Number(r.min_qty_trigger) === triggerQty && 
        (r.trigger_unit || 'CTN') === triggerUnit
      )
      
      const tierGroup2Rewards = rewards.filter((r: any) => {
        if (r.option_group !== 2) return false
        
        const focUnit = r.trigger_unit || 'CTN'
        const focFactor = getTriggerUnitFactor(focUnit)
        const focCtnEq = Number(r.min_qty_trigger) * focFactor
        
        if (nextUt !== undefined) {
          return focCtnEq >= ut._ctn_eq && focCtnEq < nextUt._ctn_eq
        }
        return focCtnEq >= ut._ctn_eq
      })
      
      const tierRewards = [...tierGroup1Rewards, ...tierGroup2Rewards]
      const hasOptions = tierGroup2Rewards.length > 0
      
      catPromos.push({
        id: promo.id,
        name: promo.name,
        promotion_type: promo.promotion_type,
        category_id: primaryCatId,
        target_category_ids: targetCatIds,
        target_product_ids: targetProdIds,
        min_cartons: triggerQty,
        trigger_unit: triggerUnit,
        rewards: tierRewards,
        has_options: hasOptions,
        is_active: promo.is_active,
        _ctn_eq: ut._ctn_eq
      })
    })
  })
  categoryPromotions.value = catPromos

  // 1b. Map product promotions (product_tiered)
  const prodPromos: any[] = []
  pp.forEach((promo: any) => {
    if (promo.promotion_type !== 'product_tiered') return
    
    const ch = (promo.channel_type || 'all').trim().toLowerCase()
    if (ch !== 'all') {
      const chans = ch.split(',').map((s: string) => s.trim())
      if (!chans.includes('all')) {
        const isSpecialtyStore = !!(form as any).store_type && String((form as any).store_type).toLowerCase().includes('specialty')
        if (isSpecialtyStore && chans.includes('general')) return
        if (!isSpecialtyStore && chans.includes('specialty')) return

        if (form.is_modern_trade && !chans.includes('mt') && !chans.includes('modern_trade')) return
        if (form.is_wholesale && !chans.includes('wholesale')) return
        if (!form.is_modern_trade && !form.is_wholesale && !chans.includes('retail') && !chans.includes('regular') && !chans.includes('general')) return
      }
    }

    const targetProdIds = (promo.rules || []).filter((r: any) => r.rule_type === 'product').map((r: any) => Number(r.target_id)).filter(Boolean)
    if (targetProdIds.length === 0 && promo.product_id) {
      targetProdIds.push(Number(promo.product_id))
    }
    if (targetProdIds.length === 0) return
    
    const primaryProdId = targetProdIds[0]
    const sampleProd = products.value.find(p => Number(p.id) === primaryProdId)
    const rewards = promo.rewards || []

    const uniqueTiers: any[] = []
    const seenTiers = new Set()

    rewards.forEach((r: any) => {
      const trigVal = Number(r.min_qty_trigger || 0)
      const trigUnit = r.trigger_unit || 'CTN'
      const key = `${trigVal}-${trigUnit}`
      if (!seenTiers.has(key)) {
        seenTiers.add(key)
        uniqueTiers.push({ triggerQty: trigVal, triggerUnit: trigUnit })
      }
    })
    
    const getTriggerUnitFactor = (unitName: string) => {
      if (!unitName || unitName.toUpperCase() === 'CTN') return 1.0
      if (sampleProd) {
        const u = getAvailableUnits(sampleProd.id).find((x: any) => x.name.toUpperCase() === unitName.toUpperCase())
        if (u && (u as any).carton_factor > 0) {
          const raw = (u as any).carton_factor
          return raw >= 1 ? (1 / raw) : raw
        }
      }
      return 0.1
    }
    
    uniqueTiers.forEach((ut: any) => {
      const factor = getTriggerUnitFactor(ut.triggerUnit)
      ut._ctn_eq = ut.triggerQty * factor
    })
    
    uniqueTiers.sort((a, b) => a._ctn_eq - b._ctn_eq)

    uniqueTiers.forEach((ut: any, idx: number) => {
      const nextUt = uniqueTiers[idx + 1]
      const triggerQty = ut.triggerQty
      const triggerUnit = ut.triggerUnit
      
      const tierGroup1Rewards = rewards.filter((r: any) => 
        r.option_group === 1 &&
        Number(r.min_qty_trigger) === triggerQty && 
        (r.trigger_unit || 'CTN') === triggerUnit
      )
      
      const tierGroup2Rewards = rewards.filter((r: any) => {
        if (r.option_group !== 2) return false
        
        const focUnit = r.trigger_unit || 'CTN'
        const focFactor = getTriggerUnitFactor(focUnit)
        const focCtnEq = Number(r.min_qty_trigger) * focFactor
        
        if (nextUt !== undefined) {
          return focCtnEq >= ut._ctn_eq && focCtnEq < nextUt._ctn_eq
        }
        return focCtnEq >= ut._ctn_eq
      })
      
      const tierRewards = [...tierGroup1Rewards, ...tierGroup2Rewards]
      const hasOptions = tierGroup2Rewards.length > 0
      
      prodPromos.push({
        id: promo.id,
        name: promo.name,
        promotion_type: promo.promotion_type,
        product_id: primaryProdId,
        target_product_ids: targetProdIds,
        min_cartons: triggerQty,
        trigger_unit: triggerUnit,
        rewards: tierRewards,
        has_options: hasOptions,
        is_active: promo.is_active,
        _ctn_eq: ut._ctn_eq
      })
    })
  })
  productPromotions.value = prodPromos

  // 2. Map bundle promotions
  const bundPromos: any[] = []
  pp.forEach((promo: any) => {
    if (promo.promotion_type !== 'bundle') return
    
    const requirements = (promo.rules || []).map((rule: any) => ({
      product_id: rule.rule_type === 'product' ? Number(rule.target_id) : null,
      category_id: rule.rule_type === 'category' ? Number(rule.target_id) : null,
      required_qty: Number(rule.min_qty),
      required_unit: rule.unit
    }))
    
    const focs = (promo.rewards || []).filter((r: any) => r.reward_type === 'foc').map((reward: any) => ({
      product_id: reward.foc_product_id,
      qty: Number(reward.foc_qty || 0),
      unit: reward.foc_unit,
      product: reward.foc_product || null
    }))
    
    bundPromos.push({
      id: promo.id,
      name: promo.name,
      target_outlet_type: promo.outlet_type || 'all',
      is_active: promo.is_active,
      requirements,
      focs
    })
  })
  bundlePromotions.value = bundPromos
}

watch(
  () => [form.is_modern_trade, form.is_wholesale, form.is_new_store, form.customer_id],
  () => processActivePromotions()
)


function handlePickerSelect(event: any) {
  const pId = event.target.value
  if (!pId) return
  const p = products.value.find(x => x.id == pId)
  if (p) {
    const units = getAvailableUnits(p.id)
    const u = units[0]
    if (u) {
      const itemPrice = (form.is_modern_trade && u.mt_price != null) ? Number(u.mt_price) : Number(u.price)
      form.items.push({
        product_id: String(p.id),
        qty: 1,
        unit: u.name,
        unit_price: itemPrice,
        manual_discount: 0,
        promo_option: 'foc',
        editing: false
      })
    }
  }
  event.target.value = ""
}

function getAvailableUnits(productId: string) {
  const p = products.value.find(x => x.id == productId)
  if (!p) return []
  const units: any[] = []
  
  if (p.units && Array.isArray(p.units)) {
    p.units.forEach((u: any) => {
      const activePrice = u.prices?.find((pr: any) => pr.is_active)
      const price = activePrice ? Number(activePrice.price) : Number(u.price)
      const mt_price = activePrice && activePrice.mt_price != null ? Number(activePrice.mt_price) : (u.mt_price ?? null)
      units.push({ name: u.name, price: price, stock: u.stock || 0, carton_factor: u.carton_factor ?? null, mt_price: mt_price })
    })
  }

  if (p.unit && p.price !== null) {
    if (!units.find(existing => existing.name === p.unit)) {
      const activePrice = p.prices?.find((pr: any) => pr.is_active)
      const price = activePrice ? Number(activePrice.price) : Number(p.price)
      const mt_price = activePrice && activePrice.mt_price != null ? Number(activePrice.mt_price) : (p.mt_price ?? null)
      units.push({ name: p.unit, price: price, stock: p.stock || 0, carton_factor: 1.0, mt_price: mt_price })
    }
  }

  return units
}

function convertQty(productId: string | number, qty: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return qty
  
  const units = getAvailableUnits(String(productId))
  const uFrom = units.find(u => u.name === fromUnit)
  const uTo = units.find(u => u.name === toUnit)
  
  if (!uFrom || !uTo) return qty
  
  const qtyInCtn = qty * (uFrom.carton_factor || 1.0)
  return qtyInCtn / (uTo.carton_factor || 1.0)
}

function onUnitChange(item: any) {
  const units = getAvailableUnits(item.product_id)
  const u = units.find(x => x.name === item.unit)
  if (u) {
    item.unit_price = (form.is_modern_trade && u.mt_price != null) ? Number(u.mt_price) : Number(u.price)
    item.manual_discount = 0
  }
}

function removeItem(idx: number) { form.items.splice(idx, 1) }

async function geocodeLocation(locStr?: string) {
  if (!locStr) return
  const match = locStr.trim().match(/^(-?\d+\.\d+)(?:\s*,\s*|\s+)(-?\d+\.\d+)$/)
  if (!match) return
  const lat = parseFloat(match[1] || '')
  const lon = parseFloat(match[2] || '')
  if (isNaN(lat) || isNaN(lon)) return

  gettingLocation.value = true
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`);
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      form.province = addr.state || addr.province || addr.city || '';
      form.district = addr.district || addr.city_district || addr.city || addr.town || '';
      form.commune = addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || '';
      form.customer_address = data.display_name;
    }
  } catch (e) {
    console.error('Reverse geocoding failed:', e);
  } finally {
    gettingLocation.value = false
  }
}

watch(() => form.location, (newVal) => {
  if (newVal) {
    geocodeLocation(newVal)
  }
})

async function getLocation() {
  if (!navigator.geolocation) {
    error.value = 'Geolocation is not supported'
    return
  }
  gettingLocation.value = true
  error.value = ''
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      form.location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      gettingLocation.value = false
    },
    (err) => {
      error.value = `Location error: ${err.message}`
      gettingLocation.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

async function submitOrder() {
  loading.value = true; error.value = ''
  try {
    const payload = {
      ...form,
      items: form.items.map(item => ({
        ...item,
        unit_price: getItemEffectivePrice(item)
      }))
    }
    const res = await api.post('/orders', payload)
    submittedOrder.value = res
    success.value = true
    if (process.client) {
      triggerFireworks()
      localStorage.removeItem('draft_order_form')
      localStorage.removeItem('draft_selected_store_type')
    }
  } catch (e: any) {
    const errorMsg = e?.message 
      || e?.data?.message 
      || (e?.errors ? Object.values(e.errors).flat().join('. ') : '') 
      || (typeof e === 'string' ? e : '') 
      || 'Failed to submit order'
    error.value = errorMsg
  } finally { loading.value = false }
}
function resetForm() { 
  Object.assign(form, defaultForm()); 
  success.value = false; 
  selectedStoreType.value = ''
  matchedStoreOrdersCount.value = null
  lastOrderItems.value = []
  if (process.client) {
    localStorage.removeItem('draft_order_form')
    localStorage.removeItem('draft_selected_store_type')
  }
}

function triggerFireworks() {
  if (typeof window === 'undefined') return
  try {
    // Initial center celebration burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899']
    })

    // Continuous fireworks cannons loop
    const duration = 2.5 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }
      const particleCount = 40 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
  } catch (e) {
    console.error('Fireworks animation error', e)
  }
}

onMounted(async () => {
  const storeId = route.query.store_id || route.query.store
  const customerId = route.query.customer_id
  const contact = route.query.contact
  
  if (storeId) {
    try {
      const res = await api.get(`/stores/${storeId}/orders`) as any
      if (res && res.store) {
        applyStore(res.store)
      }
    } catch (e) {
      console.error('Failed to load store for query store_id', e)
    }
  } else if (customerId) {
    form.customer_id = String(customerId)
  } else if (contact) {
    form.contact = String(contact)
  }
})

function isValidCoords(loc?: string) {
  if (!loc) return false
  return /^(-?\d+\.\d+)(?:\s*,\s*|\s+)(-?\d+\.\d+)$/.test(loc.trim())
}

// Watchers to auto-save form state to localStorage
watch(form, (newVal) => {
  if (process.client) {
    localStorage.setItem('draft_order_form', JSON.stringify(newVal))
  }
}, { deep: true })

watch(selectedStoreType, (newVal) => {
  if (process.client) {
    localStorage.setItem('draft_selected_store_type', newVal)
  }
})

// Debounced watchers for auto-filling store details
let customerIdTimeout: any = null
let contactTimeout: any = null

watch(() => form.customer_id, (newVal) => {
  if (isProgrammaticUpdate.value) return
  customerSuggestion.value = null

  // If customer_id is cleared and contact is also empty, clear auto-filled store info
  if (!newVal || newVal.trim().length < 2) {
    if (!form.contact || form.contact.trim().length < 3) {
      if (autoFilledStore.value) {
        clearAutoFill()
      }
    }
    return
  }

  if (customerIdTimeout) clearTimeout(customerIdTimeout)
  customerIdTimeout = setTimeout(async () => {
    try {
      const query = newVal.trim()
      const res = await api.get(`/stores/search?q=${encodeURIComponent(query)}`) as any[]
      if (!res || res.length === 0) return

      const cleanQuery = query.toLowerCase()
      const match = res.find((store: any) =>
        store.customer_id && store.customer_id.toLowerCase() === cleanQuery
      ) || (res.length === 1 ? res[0] : null)

      if (match && !autoFilledStore.value) {
        // Show suggestion — user must click Select to apply
        customerSuggestion.value = match
      }
    } catch (e) {
      console.error('Auto-fill customer_id search error', e)
    }
  }, 400)
})

watch(() => form.contact, (newVal) => {
  if (isProgrammaticUpdate.value) return
  customerSuggestion.value = null

  // If contact is cleared and customer_id is also empty, clear auto-filled store info
  if (!newVal || newVal.trim().length < 3) {
    if (!form.customer_id || form.customer_id.trim().length < 2) {
      if (autoFilledStore.value) {
        clearAutoFill()
      }
    }
    return
  }

  if (contactTimeout) clearTimeout(contactTimeout)
  contactTimeout = setTimeout(async () => {
    try {
      const query = newVal.trim()
      const res = await api.get(`/stores/search?q=${encodeURIComponent(query)}`) as any[]
      if (!res || res.length === 0) return

      const cleanDigits = query.replace(/[^0-9]/g, '')
      const match = res.find((store: any) => {
        if (!store.contact) return false
        const storeDigits = store.contact.replace(/[^0-9]/g, '')
        return storeDigits === cleanDigits || (cleanDigits.length >= 6 && storeDigits.endsWith(cleanDigits))
      }) || (res.length === 1 ? res[0] : null)

      if (match && !autoFilledStore.value) {
        // Show suggestion — user must click Select to apply
        customerSuggestion.value = match
      }
    } catch (e) {
      console.error('Auto-fill contact search error', e)
    }
  }, 400)
})
</script>

<style scoped>
.minimal-card {
  @apply bg-white border border-slate-100 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm transition-all duration-500 overflow-hidden;
}

.input-field-modern {
  @apply bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-900 transition-all 
         placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none tracking-wide shadow-sm;
}

select option {
  background-color: white;
  color: #0f172a;
}

/* Force padding for date and select inputs in all browsers */
input[type="date"]::-webkit-date-and-time-value {
  padding-left: 3.5rem !important;
  min-height: 1.5em;
}

select.input-field-modern {
  text-indent: 2.2rem;
}

.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.minimal-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.minimal-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.minimal-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.minimal-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
