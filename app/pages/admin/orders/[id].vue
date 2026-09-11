<template>
  <div class="relative">
    <!-- Success Toast -->
    <Transition name="fade">
      <div v-if="toast.show" 
        class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/50 backdrop-blur-xl">
        <div class="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:check" class="w-4 h-4 text-white" />
        </div>
        <span class="text-sm font-black uppercase tracking-widest">{{ toast.message }}</span>
      </div>
    </Transition>
    <div class="flex items-center gap-3 mb-6">
      <button @click="navigateBack" class="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 hover:bg-slate-50 transition-colors shadow-sm">
        <Icon name="heroicons:arrow-left" class="w-4 h-4" />
      </button>
      <h1 class="page-title text-2xl font-black text-slate-900 flex items-center gap-4 flex-wrap">
        Order #{{ route.params.id }} 
        <div class="flex items-center gap-2">
          <div v-if="order?.delivery_number || order?.delivery?.delivery_custom_id" class="text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Icon name="heroicons:truck" class="w-3.5 h-3.5" />
            DEL: {{ order.delivery?.delivery_custom_id || order.delivery_number }}
          </div>
          <div v-if="order?.so_number" class="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Icon name="heroicons:document-text" class="w-3.5 h-3.5" />
            SO: {{ order.so_number }}
          </div>
          <div v-if="order?.is_direct_sale" class="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Icon name="heroicons:bolt" class="w-3.5 h-3.5 text-emerald-500" />
            Direct Sale
          </div>
          <div v-if="order?.customer_id" class="text-purple-600 bg-purple-50 px-3 py-1 rounded-xl border border-purple-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Icon name="heroicons:user" class="w-3.5 h-3.5" />
            CUST: {{ order.customer_id }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button v-if="order" @click="printInvoice" class="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2">
            <Icon name="heroicons:printer" class="w-4 h-4" />
            Print Invoice
          </button>
          <button v-if="order && canEdit && (isPending || isSuperAdmin) && !isEditing" @click="startEditing" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 animate-pulse">
            <Icon name="heroicons:pencil" class="w-4 h-4" />
            Edit Order
          </button>
        </div>
      </h1>
    </div>

    <div v-if="loading" class="text-center py-16">
      <div class="w-8 h-8 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
    </div>

    <div v-else-if="order">
      <!-- Edit Mode Form -->
      <div v-if="isEditing" class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
        <!-- Left Column: Customer & Order Information -->
        <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-4">
            <h3 class="text-base font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Icon name="heroicons:information-circle" class="w-5 h-5 text-indigo-600" />
              Edit Order Information
            </h3>
            <div class="flex flex-wrap gap-2 shrink-0">
              <label class="relative inline-flex items-center cursor-pointer group">
                <input type="checkbox" v-model="editForm.is_new_store" class="sr-only peer">
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                <span class="ms-2 text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">New Store</span>
              </label>
              <label class="relative inline-flex items-center cursor-pointer group">
                <input type="checkbox" v-model="editForm.is_wholesale" class="sr-only peer">
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                <span class="ms-2 text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Wholesale</span>
              </label>
              <label class="relative inline-flex items-center cursor-pointer group">
                <input type="checkbox" v-model="editForm.is_modern_trade" class="sr-only peer">
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                <span class="ms-2 text-[9px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">MT</span>
              </label>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Discount Opt-in Toggles (Wholesale/MT) -->
            <div v-if="editForm.is_wholesale || editForm.is_modern_trade" class="animate-slide-up mb-2">
              <label
                :class="editForm.is_modern_trade
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-purple-50/80 border-purple-200 text-purple-800 hover:bg-purple-100'"
                class="inline-flex items-center gap-2.5 cursor-pointer px-3.5 py-2.5 border rounded-xl transition-colors w-full"
              >
                <div
                  :class="editActiveDiscountEnabled
                    ? (editForm.is_modern_trade ? 'bg-emerald-600 border-emerald-600' : 'bg-purple-600 border-purple-600')
                    : (editForm.is_modern_trade ? 'border-emerald-300 bg-white' : 'border-purple-300 bg-white')"
                  class="w-4 h-4 border-2 rounded transition-all duration-200 flex items-center justify-center shrink-0"
                  @click="editActiveDiscountEnabled = !editActiveDiscountEnabled"
                >
                  <Icon v-if="editActiveDiscountEnabled" name="heroicons:check" class="w-2.5 h-2.5 text-white" />
                </div>
                <input
                  type="checkbox"
                  v-model="editActiveDiscountEnabled"
                  class="sr-only"
                />
                <span class="text-[10px] font-black uppercase tracking-widest">
                  Apply {{ editForm.is_modern_trade ? 'MT' : 'Wholesale' }} Discount
                </span>
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Shop Name *</label>
                <input v-model="editForm.shop_name" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Contact Phone *</label>
                <input v-model="editForm.contact" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Province *</label>
                <input v-model="editForm.province" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">District *</label>
                <input v-model="editForm.district" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Commune</label>
                <input v-model="editForm.commune" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div class="flex items-center justify-between pl-1 mb-1">
                  <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Location / GPS Coords *</label>
                  <button type="button" @click="getDeviceLocation" :disabled="gettingLocation" class="text-[9px] font-black text-blue-600 uppercase tracking-wider flex items-center gap-1 hover:text-blue-700 transition-colors disabled:opacity-50">
                    <Icon name="heroicons:map-pin" class="w-3.5 h-3.5" />
                    {{ gettingLocation ? 'Getting...' : 'Get GPS' }}
                  </button>
                </div>
                <input v-model="editForm.location" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Address *</label>
                <input v-model="editForm.customer_address" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">SO Number *</label>
                <input v-model="editForm.so_number" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Customer ID *</label>
                <input v-model="editForm.customer_id" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Store Profile</label>
                <select v-model="editForm.store_profile_id" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 appearance-none">
                  <option value="">None</option>
                  <option v-for="profile in ratingStoreProfiles" :key="profile.id" :value="profile.id">{{ profile.name }} ({{ profile.visit_frequency }})</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Trade Class</label>
                <select v-model="editForm.trade_class_l1" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 appearance-none">
                  <option value="">None</option>
                  <option v-for="opt in tradeClassL1Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Trade Type</label>
                <select v-model="editForm.trade_class_l2" :disabled="!editForm.trade_class_l1" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 appearance-none">
                  <option value="">None</option>
                  <option v-for="opt in editTradeClassL2Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Sub Type</label>
                <select v-model="editForm.trade_class_l3" :disabled="!editForm.trade_class_l2" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 appearance-none">
                  <option value="">None</option>
                  <option v-for="opt in editTradeClassL3Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Delivery Date *</label>
                <input type="date" v-model="editForm.delivery_date" required class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Payment Method</label>
                <select v-model="editForm.payment_method" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 appearance-none">
                  <option value="COD">COD</option>
                  <option value="Credit">Credit</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Internal Directive / Note</label>
              <textarea v-model="editForm.note" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"></textarea>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Items -->
        <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 class="text-base font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Icon name="heroicons:shopping-bag" class="w-5 h-5 text-indigo-600" />
              Edit Order Items
            </h3>
            
            <!-- Add Product Selector -->
            <!-- Custom Product Picker Dropdown with Images -->
            <div class="relative w-48 sm:w-64">
              <!-- Overlay to close dropdown -->
              <div v-if="pickerOpen" class="fixed inset-0 z-40" @click="pickerOpen = false"></div>
              
              <button 
                type="button"
                @click="togglePicker"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-10 py-2 text-xs font-bold text-slate-900 text-left hover:bg-slate-100 transition-all cursor-pointer shadow-sm flex items-center gap-2 relative z-50 animate-slide-up"
              >
                <Icon name="heroicons:plus" class="w-4 h-4 text-indigo-600 shrink-0" />
                <span class="truncate">Add Product</span>
                <Icon name="heroicons:chevron-down" class="w-4 h-4 text-slate-400 absolute right-3" />
              </button>

              <!-- Dropdown Panel -->
              <div 
                v-if="pickerOpen" 
                class="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2 animate-scale-in"
              >
                <!-- Search Input -->
                <div class="relative">
                  <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    v-model="pickerSearch" 
                    ref="pickerSearchInput"
                    class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none" 
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

          <!-- Items List -->
          <div class="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 minimal-scrollbar">
            <div v-for="(item, idx) in editForm.items" :key="idx" class="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-3">
              <div class="flex gap-4">
                <!-- Product Thumbnail -->
                <div class="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  <img v-if="products.find(p => p.id === Number(item.product_id))?.image" 
                       :src="`${config.public.apiBase}/storage/${products.find(p => p.id === Number(item.product_id))?.image}`" 
                       class="w-full h-full object-contain p-0.5" />
                  <Icon v-else name="heroicons:cube" class="w-6 h-6 text-slate-300" />
                </div>

                <!-- Detail Panel -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <h4 class="font-black text-slate-900 text-sm truncate">
                        {{ products.find(p => p.id === Number(item.product_id))?.name || 'Product' }}
                      </h4>
                      <span v-if="products.find(p => p.id === Number(item.product_id))?.sku" class="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider inline-block mt-1">
                        {{ products.find(p => p.id === Number(item.product_id))?.sku }}
                      </span>
                    </div>
                    <button type="button" @click="removeEditItem(idx)" class="w-8 h-8 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl flex items-center justify-center transition-colors border border-slate-100 shadow-sm shrink-0">
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Inputs Panel -->
              <div class="grid grid-cols-3 gap-3 border-t border-slate-200/50 pt-3">
                <div>
                  <label class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">QTY</label>
                  <input type="number" step="0.01" min="0.01" v-model="item.qty" class="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-center text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-400 transition-colors" />
                </div>
                <div>
                  <label class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit</label>
                  <div class="relative">
                    <select v-model="item.unit" class="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:outline-none appearance-none pr-6 focus:border-indigo-400 transition-colors">
                      <option v-for="u in getAvailableUnits(item.product_id)" :key="u.name" :value="u.name">{{ u.name }}</option>
                    </select>
                    <Icon name="heroicons:chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label class="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Discount ($)</label>
                  <input type="number" step="0.01" min="0" v-model="item.manual_discount" class="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-center text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-400 transition-colors" />
                </div>
              </div>

              <!-- Promo Option Choice -->
              <div v-if="categoryPromotions.find(cp => cp.category_id === products.find(x => x.id == item.product_id)?.category_id)?.has_options" class="flex flex-col gap-1 select-none pt-2 border-t border-slate-200/50">
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1">Promo Choice</span>
                <div class="flex bg-white p-0.5 rounded-lg border border-slate-200/50 w-fit">
                  <button 
                    type="button"
                    @click="setEditCategoryPromoChoice(products.find(x => x.id == item.product_id)?.category_id, 'foc')"
                    :class="[
                      'px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all',
                      getEditCategoryPromoChoice(products.find(x => x.id == item.product_id)?.category_id) === 'foc'
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    ]"
                  >
                    FOC
                  </button>
                  <button 
                    type="button"
                    @click="setEditCategoryPromoChoice(products.find(x => x.id == item.product_id)?.category_id, 'discount')"
                    :class="[
                      'px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all',
                      getEditCategoryPromoChoice(products.find(x => x.id == item.product_id)?.category_id) === 'discount'
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    ]"
                  >
                    Discount
                  </button>
                </div>
              </div>
            </div>

            <div v-if="editForm.items.length === 0" class="text-center py-8 text-slate-400 italic">
              No products added to this order.
            </div>
          </div>

          <!-- Live Summary -->
          <div class="mt-4 pt-4 border-t border-slate-100 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-slide-up">
            <!-- Disconnect All Promotions Toggle Box -->
            <div 
              class="p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 mb-3"
              :class="editForm.disable_promotions ? 'bg-red-50/80 border-red-200 text-red-900 shadow-2xs' : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-100/60'"
            >
              <label class="flex items-center gap-3 cursor-pointer select-none min-w-0 flex-1">
                <input 
                  v-model="editForm.disable_promotions" 
                  type="checkbox" 
                  class="w-5 h-5 rounded-md text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer shrink-0" 
                />
                <div class="min-w-0">
                  <span class="text-xs font-black uppercase tracking-wider block" :class="editForm.disable_promotions ? 'text-red-900' : 'text-slate-800'">
                    🚫 Do Not Apply Promotions
                  </span>
                  <span class="text-[10px] font-semibold block mt-0.5" :class="editForm.disable_promotions ? 'text-red-600' : 'text-slate-500'">
                    Tick this box to disconnect all category discounts, combo promotions, and free FOC gifts for this order.
                  </span>
                </div>
              </label>
              <span v-if="editForm.disable_promotions" class="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 shadow-xs">
                PROMOTIONS OFF
              </span>
            </div>

            <!-- Bundle Selection UI -->
            <div v-if="!editForm.disable_promotions && (activePromotionSystem === 'bundle' || activePromotionSystem === 'both') && editQualifyingBundles.length > 0" class="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <div class="flex items-center justify-between text-xs font-black text-blue-900 uppercase tracking-wider mb-2">
                <span class="flex items-center gap-1.5">
                  <Icon name="heroicons:gift" class="w-4 h-4 text-blue-600" />
                  Bundle Promotion Selection
                </span>
                <span v-if="editQualifyingBundles.length > 1" class="text-[10px] text-blue-600 font-semibold normal-case">
                  (Select 1 Bundle)
                </span>
              </div>
              <div class="space-y-1.5">
                <label 
                  v-for="b in editQualifyingBundles" 
                  :key="b.id" 
                  class="flex items-center gap-2.5 p-2 bg-white rounded-xl border cursor-pointer transition-all hover:border-blue-300"
                  :class="String(editForm.selected_bundle_id) === String(b.id) ? 'border-blue-500 ring-2 ring-blue-200/60 bg-blue-50/30' : 'border-slate-200'"
                >
                  <input 
                    type="radio" 
                    :name="'bundle-choice-edit'" 
                    :value="b.id" 
                    v-model="editForm.selected_bundle_id" 
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

            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-500 font-bold uppercase tracking-wider">Subtotal</span>
              <span class="text-slate-950 font-black">${{ editSubtotal.toFixed(2) }}</span>
            </div>

            <!-- Promo Discount -->
            <div v-if="editTotalCategoryDiscount > 0" class="flex items-center justify-between text-xs text-emerald-600 font-bold">
              <span class="uppercase tracking-wider flex items-center gap-1">
                <Icon name="heroicons:ticket" class="w-3.5 h-3.5" />
                Promo Discount <span v-if="editCategoryDiscountLabels">({{ editCategoryDiscountLabels }})</span>
              </span>
              <span>-${{ editTotalCategoryDiscount.toFixed(2) }}</span>
            </div>

            <!-- Wholesale Discount -->
            <div v-if="editWholesaleDiscountAmount > 0" class="flex items-center justify-between text-xs text-pink-600 font-bold">
              <span class="uppercase tracking-wider flex items-center gap-1">
                <Icon name="heroicons:ticket" class="w-3.5 h-3.5" />
                {{ editForm.is_modern_trade ? 'Modern Trade Discount' : (editForm.is_wholesale ? 'Wholesale Discount' : 'Store Discount') }} ({{ getEditWholesaleDiscountPercent() }}%)
              </span>
              <span>-${{ editWholesaleDiscountAmount.toFixed(2) }}</span>
            </div>

            <!-- FOC items -->
            <div v-if="activePromotionSystem === 'category' || activePromotionSystem === 'both'">
              <template v-for="(stat, catId) in editPromotionStatus" :key="'foc-' + catId">
                <template v-if="stat.applied?.free_gifts && stat.applied.free_gifts.length > 0">
                  <div v-for="(gift, gIdx) in stat.applied.free_gifts" :key="gIdx" class="flex items-center justify-between text-[11px] text-blue-600 font-bold">
                    <span class="flex items-center gap-1">
                      <Icon name="heroicons:gift" class="w-3.5 h-3.5" />
                      Free Gift ({{ stat.category_name }})
                    </span>
                    <span>
                      {{ gift.free_product?.name || 'Free Product' }} ({{ 
                        gift.calculated_qty !== undefined ? gift.calculated_qty : (
                          (gift.is_multiply === true || gift.is_multiply === 'true' || gift.is_multiply == 1)
                            ? (Math.floor(Number(stat.cartons || 0) / (Number(stat.applied?.min_cartons) || 1)) * Number(gift.free_qty || 1) + Number(gift.extra_foc || 0))
                            : (Number(gift.free_qty || 0) + Number(gift.extra_foc || 0))
                        )
                      }} {{ gift.free_unit }})
                    </span>
                  </div>
                </template>
              </template>
            </div>

            <div v-if="activePromotionSystem === 'bundle' || activePromotionSystem === 'both'">
              <div v-for="(foc, idx) in editBundleFocItems" :key="'bfoc-' + idx" class="flex items-center justify-between text-[11px] text-blue-600 font-bold">
                <span class="flex items-center gap-1">
                  <Icon name="heroicons:gift" class="w-3.5 h-3.5" />
                  Free Gift ({{ foc.bundle_name }})
                </span>
                <span>{{ foc.name }} ({{ foc.qty }} {{ foc.unit }})</span>
              </div>
            </div>

            <div v-for="(foc, idx) in editGlobalFocItems" :key="'gfoc-' + idx" class="flex items-center justify-between text-[11px] text-indigo-600 font-bold">
              <span class="flex items-center gap-1">
                <Icon name="heroicons:gift" class="w-3.5 h-3.5" />
                Free Gift ({{ foc.bundle_name }})
              </span>
              <span>{{ foc.name }} ({{ foc.qty }} {{ foc.unit }})</span>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-slate-200">
              <span class="text-xs font-black uppercase text-slate-500 tracking-wider">Grand Total</span>
              <span class="text-xl font-black text-slate-900">${{ editGrandTotal.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button @click="isEditing = false" class="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all">
              Cancel
            </button>
            <button @click="submitEdit" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div v-else>
        <!-- Status Change -->
        <div class="bg-white border border-slate-200 rounded-3xl p-6 mb-4 shadow-sm">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <h2 class="font-black text-slate-900 text-xl">{{ order.shop_name }}</h2>
                <span v-if="order.is_new_store" class="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-blue-500/20">New Store</span>
                <span v-if="order.is_direct_sale" class="px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-emerald-500/20 flex items-center gap-1">
                  <Icon name="heroicons:bolt" class="w-2.5 h-2.5" /> Direct Sale (លក់ផ្ទាល់ដៃ)
                </span>
                <span v-if="order.store_type" class="px-2 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-purple-500/20">{{ order.store_type }}</span>
                <span v-if="order.visit_frequency" class="px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-emerald-500/20">{{ order.visit_frequency }}</span>
                <span v-if="order.disable_promotions" class="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-red-500/20">No Promos</span>
                <span :class="statusClass(order.status)" class="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border">{{ order.status }}</span>
              </div>
              <p class="text-slate-500 text-sm">Sales Rep: <span class="text-slate-900 font-bold">{{ order.user?.name }}</span></p>
            </div>

            <!-- Quick Assignment / ID Management -->
            <div class="flex flex-col sm:flex-row flex-wrap items-end sm:items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div class="flex flex-col gap-1 w-full sm:w-32">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">SO Number</label>
                <input v-model="order.so_number" placeholder="SO#" 
                  class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
              </div>
              <div class="flex flex-col gap-1 w-full sm:w-32">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Customer ID</label>
                <input v-model="order.customer_id" placeholder="CUST#" 
                  class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
              </div>
              <div class="flex flex-col gap-1 w-full sm:w-32">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Store Profile</label>
                <select v-model="order.store_profile_id" class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm appearance-none">
                  <option value="">None</option>
                  <option v-for="profile in ratingStoreProfiles" :key="profile.id" :value="profile.id">{{ profile.name }} ({{ profile.visit_frequency }})</option>
                </select>
              </div>
              <div class="flex flex-col gap-1 w-full sm:w-32">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Trade Class</label>
                <select v-model="order.trade_class_l1" class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm appearance-none">
                  <option value="">None</option>
                  <option v-for="opt in tradeClassL1Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-1 w-full sm:w-32">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Trade Type</label>
                <select v-model="order.trade_class_l2" :disabled="!order.trade_class_l1" class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm appearance-none">
                  <option value="">None</option>
                  <option v-for="opt in tradeClassL2Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-1 w-full sm:w-32">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Sub Type</label>
                <select v-model="order.trade_class_l3" :disabled="!order.trade_class_l2" class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm appearance-none">
                  <option value="">None</option>
                  <option v-for="opt in tradeClassL3Options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <div class="flex flex-col gap-1 w-full sm:w-32">
                <label class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Planned Date</label>
                <input type="date" 
                  :value="order.delivery?.planned_delivery_date ? new Date(order.delivery.planned_delivery_date).toISOString().split('T')[0] : (order._temp_planned_date || '')" 
                  @input="(e: any) => order._temp_planned_date = e.target.value"
                  class="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-black text-slate-900 focus:outline-none focus:border-blue-500 transition-all shadow-sm" />
              </div>
              <button @click="saveCustomIds" 
                class="w-full sm:w-auto bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10">
                <Icon name="heroicons:cloud-arrow-up" class="w-4 h-4" />
                Save
              </button>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex gap-2">
                <button v-if="order.status === 'pending'" @click="updateStatus('completed')"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10">✓ Complete</button>
                <button v-if="order.status === 'pending'" @click="updateStatus('cancelled')"
                  class="bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all border border-red-100">✗ Cancel</button>
                <button v-if="order.status === 'cancelled'" @click="restoreOrder"
                  class="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95">
                  <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" /> ↩ Restore / Reactivate Order
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Info -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Icon name="heroicons:information-circle" class="w-3 h-3" />
              Merchant Profile
            </h3>
            <dl class="space-y-4 text-sm">
              <div class="flex flex-col border-b border-slate-50 pb-2">
                <dt class="text-slate-400 font-medium">Address</dt>
                <dd class="text-slate-900 font-bold mt-1">{{ order.customer_address || '—' }}</dd>
                <div v-if="order.province" class="flex gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                  <span>{{ order.province }}</span>
                  <span v-if="order.district">› {{ order.district }}</span>
                  <span v-if="order.commune">› {{ order.commune }}</span>
                </div>
              </div>
              <div class="flex justify-between border-b border-slate-50 pb-2"><dt class="text-slate-400 font-medium">Contact</dt><dd class="text-slate-900 font-bold">{{ order.contact || '—' }}</dd></div>
              <div class="flex justify-between items-start border-b border-slate-50 pb-2">
                <dt class="text-slate-400 font-medium">Location</dt>
                <dd class="text-slate-900 font-bold text-right">
                  {{ order.location || '—' }}
                  <div v-if="isValidCoords(order.location)" class="mt-2">
                    <a :href="'https://www.google.com/maps?q=' + order.location" target="_blank" 
                      class="bg-blue-50 text-blue-600 hover:bg-blue-100 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all border border-blue-100">
                      <Icon name="heroicons:map" class="w-3 h-3" />
                      Open Coordinates
                    </a>
                  </div>
                </dd>
              </div>
              <div class="flex justify-between border-b border-slate-50 pb-2"><dt class="text-slate-400 font-medium">Request Delivery Date</dt><dd class="text-slate-900 font-bold">{{ order.delivery_date || '—' }}</dd></div>
              <div v-if="order.delivery?.planned_delivery_date" class="flex justify-between border-b border-blue-50 pb-2 bg-blue-50/30 -mx-6 px-6 py-2">
                <dt class="text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-1">
                  <Icon name="heroicons:calendar" class="w-3 h-3" />
                  Planned Date
                </dt>
                <dd class="text-blue-700 font-black">{{ new Date(order.delivery.planned_delivery_date).toLocaleDateString() }}</dd>
              </div>
              <div class="flex justify-between border-b border-slate-50 pb-2"><dt class="text-slate-400 font-medium">Payment</dt><dd class="text-slate-900 font-bold uppercase tracking-widest text-[10px]">{{ order.payment_method }}</dd></div>
              <div class="flex justify-between"><dt class="text-slate-400 font-medium">Created</dt><dd class="text-slate-900 font-bold">{{ formatDate(order.created_at) }}</dd></div>
            </dl>
            <div v-if="order.note" class="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p class="text-amber-800 text-[9px] font-black uppercase tracking-widest mb-1.5">Internal Directive</p>
              <p class="text-amber-900 text-sm italic">"{{ order.note }}"</p>
            </div>
          </div>

          <!-- Items -->
          <div class="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Icon name="heroicons:shopping-bag" class="w-3 h-3" />
              Consolidated Items
            </h3>
            <div class="space-y-4 flex-1">
              <div v-for="item in order.items" :key="item.id"
                class="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 group">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                    <Icon name="heroicons:cube" class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="text-slate-900 font-bold text-base">
                        {{ item.product?.name || '[Deleted Product]' }}
                        <span v-if="item.is_promo" class="ml-2 text-[8px] font-black text-white bg-blue-600 px-1.5 py-0.5 rounded-md uppercase tracking-widest shadow-sm shadow-blue-500/20">Free Gift</span>
                      </p>
                      <span v-if="item.product?.sku" class="text-[10px] font-black text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-widest shrink-0">{{ item.product.sku }}</span>
                    </div>
                    <p class="text-slate-500 text-xs font-black uppercase tracking-wider mt-1">{{ item.qty }} {{ item.unit }} × <span class="text-slate-600 font-bold">${{ Number(item.unit_price).toFixed(2) }}</span></p>
                  </div>
                </div>
                <p class="text-slate-900 font-black text-base">${{ Number(item.subtotal).toFixed(2) }}</p>
              </div>
            </div>
            <div class="mt-6 pt-6 border-t-2 border-slate-900 space-y-4">
              <div v-if="Number(order.discount) > 0" class="flex justify-between items-center px-2">
                <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                <span class="text-slate-900 font-bold">${{ (Number(order.total_amount) + Number(order.discount)).toFixed(2) }}</span>
              </div>
              <div v-if="Number(order.discount) > 0" class="flex justify-between items-center px-2">
                <div class="flex flex-col">
                  <span class="text-slate-500 text-[10px] font-black uppercase tracking-widest">Promo Discount</span>
                  <span v-if="viewAppliedPromotionLabels" class="text-[10px] font-bold text-emerald-600 mt-0.5">({{ viewAppliedPromotionLabels }})</span>
                </div>
                <span class="text-red-600 font-black">-${{ Number(order.discount).toFixed(2) }}</span>
              </div>
              <div class="flex justify-between items-center bg-slate-50 -mx-6 px-6 py-6 -mb-6">
                <span class="text-slate-500 text-xs font-black uppercase tracking-widest">Revenue Impact</span>
                <span class="text-2xl font-black text-slate-900">${{ Number(order.total_amount).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete -->
        <button @click="deleteOrder" class="w-full sm:w-auto bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all flex items-center justify-center gap-2">
          <Icon name="heroicons:trash" class="w-4 h-4" /> Terminate Order
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px) translateX(-50%);
}
</style>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const route = useRoute()
const router = useRouter()
const api = useApi()
const order = ref<any>(null)
const loading = ref(true)

import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()
const config = useRuntimeConfig()
const pickerOpen = ref(false)
const pickerSearch = ref('')
const pickerSearchInput = ref<HTMLInputElement | null>(null)

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
    editForm.value.items.push({
      product_id: String(p.id),
      qty: 1,
      unit: u.name,
      manual_discount: 0,
      promo_option: 'foc'
    })
  }
  pickerOpen.value = false
  pickerSearch.value = ''
}

const isEditing = ref(false)
const editForm = ref<any>({
  shop_name: '',
  contact: '',
  customer_address: '',
  province: '',
  district: '',
  commune: '',
  location: '',
  delivery_date: '',
  payment_method: '',
  note: '',
  so_number: '',
  customer_id: '',
  store_profile_id: '',
  trade_class_l1: '',
  trade_class_l2: '',
  trade_class_l3: '',
  is_new_store: false,
  is_wholesale: false,
  is_modern_trade: false,
  ws_discount_enabled: true,
  mt_discount_enabled: true,
  disable_promotions: false,
  selected_bundle_id: null,
  items: []
})

const canEdit = computed(() => {
  const role = authStore.user?.role?.toLowerCase() || ''
  return ['admin', 'super_admin', 'super admin', 'superadmin', 'administrator', 'sale_admin', 'sale admin', 'admin_delivery', 'admin delivery', 'delivery', 'asm'].includes(role)
})

const isPending = computed(() => order.value?.status?.toLowerCase() === 'pending')
const isSuperAdmin = computed(() => authStore.isSuperAdmin)
const isCompleted = computed(() => order.value?.status?.toLowerCase() === 'completed')

const products = ref<any[]>([])
const categories = ref<any[]>([])
const categoryPromotions = ref<any[]>([])
const bundlePromotions = ref<any[]>([])
const activePromotionSystem = ref('category')
const mtPromoActive = ref(true)
const mtCodActive = ref(true)
const globalSettings = ref<any>({})

async function loadProducts() {
  if (products.value.length === 0) {
    try {
      products.value = await api.get('/products') as any[]
    } catch (e) {
      console.error('Failed to load products', e)
    }
  }
}

async function startEditing() {
  if (!order.value) return
  await loadProducts()
  
  let profileId = order.value.store_profile_id || ''
  if (!profileId && order.value.store_type) {
    const matchedProfile = storeProfiles.value.find((p: any) => p.name === order.value.store_type)
    if (matchedProfile) {
      profileId = matchedProfile.id
    }
  }

  editForm.value = {
    shop_name: order.value.shop_name || '',
    contact: order.value.contact || '',
    customer_address: order.value.customer_address || '',
    province: order.value.province || '',
    district: order.value.district || '',
    commune: order.value.commune || '',
    location: order.value.location || '',
    delivery_date: order.value.delivery_date ? new Date(order.value.delivery_date).toISOString().split('T')[0] : '',
    payment_method: order.value.payment_method || 'COD',
    note: order.value.note || '',
    so_number: order.value.so_number || '',
    customer_id: order.value.customer_id || '',
    store_profile_id: profileId,
    trade_class_l1: order.value.trade_class_l1 || '',
    trade_class_l2: order.value.trade_class_l2 || '',
    trade_class_l3: order.value.trade_class_l3 || '',
    is_new_store: !!order.value.is_new_store,
    is_wholesale: !!order.value.is_wholesale,
    is_modern_trade: !!order.value.is_modern_trade,
    ws_discount_enabled: order.value.ws_discount_enabled !== undefined ? !!order.value.ws_discount_enabled : true,
    mt_discount_enabled: order.value.mt_discount_enabled !== undefined ? !!order.value.mt_discount_enabled : true,
    disable_promotions: !!order.value.disable_promotions,
    selected_bundle_id: order.value.selected_bundle_id || null,
    items: (order.value.items || [])
      .filter((item: any) => !item.is_promo)
      .map((item: any) => ({
        product_id: String(item.product_id),
        qty: Number(item.qty),
        unit: item.unit,
        manual_discount: Number(item.discount || 0),
        promo_option: item.promo_option || 'foc'
      }))
  }
  isEditing.value = true
}

const editTradeClassL2Options = computed(() => {
  if (!editForm.value.trade_class_l1) return []
  return Object.keys(tradeClassHierarchy.value[editForm.value.trade_class_l1] || {})
})
const editTradeClassL3Options = computed(() => {
  if (!editForm.value.trade_class_l1 || !editForm.value.trade_class_l2) return []
  return tradeClassHierarchy.value[editForm.value.trade_class_l1]?.[editForm.value.trade_class_l2] || []
})

function getEditItemEffectivePrice(item: any) {
  const p = products.value.find(x => x.id == item.product_id)
  if (!p) return 0
  const units = getAvailableUnits(p.id)
  const u = units.find(x => x.name === item.unit)
  let basePrice = u ? Number(u.price) : Number(p.price || 0)
  
  if (editForm.value.is_modern_trade) {
    if ((!item.unit || item.unit === p.unit) && p.mt_price != null) {
      basePrice = Number(p.mt_price)
    }
    if (u && u.mt_price != null) {
      basePrice = Number(u.mt_price)
    }
  }

  const disc = Number(item.manual_discount || 0)
  return Math.max(0, basePrice - disc)
}

const editSubtotal = computed(() => {
  return editForm.value.items.reduce((sum: number, item: any) => sum + (getEditItemEffectivePrice(item) * (item.qty || 0)), 0)
})

function getEditCategoryPromoChoice(categoryId: number | null) {
  if (!categoryId) return 'foc'
  const firstItem = editForm.value.items.find((item: any) => {
    const p = products.value.find(x => x.id == item.product_id)
    return p && p.category_id === categoryId
  })
  return firstItem?.promo_option || 'foc'
}

function setEditCategoryPromoChoice(categoryId: number | null, choice: 'foc' | 'discount') {
  if (!categoryId) return
  editForm.value.items.forEach((item: any) => {
    const p = products.value.find(x => x.id == item.product_id)
    if (p && p.category_id === categoryId) {
      item.promo_option = choice
    }
  })
}

const editActiveDiscountEnabled = computed({
  get() {
    if (editForm.value.is_modern_trade) return editForm.value.mt_discount_enabled
    if (editForm.value.is_wholesale) return editForm.value.ws_discount_enabled
    return false
  },
  set(val: boolean) {
    if (editForm.value.is_modern_trade) editForm.value.mt_discount_enabled = val
    else if (editForm.value.is_wholesale) editForm.value.ws_discount_enabled = val
  }
})

function getEditWholesaleDiscountPercent() {
  if (editForm.value.is_modern_trade && !editForm.value.mt_discount_enabled) {
    return 0
  }

  if (editForm.value.is_modern_trade && !mtCodActive.value) {
    return 0
  }

  if (editForm.value.is_wholesale) {
    if (!editForm.value.ws_discount_enabled) {
      return 0
    }
    const wholesaleProfile = storeProfiles.value.find(p => p.name === 'Wholesale')
    if (wholesaleProfile) {
      if (editForm.value.payment_method === 'COD') return Number(wholesaleProfile.cod_discount_percent) || 0
      if (editForm.value.payment_method === 'Credit') return Number(wholesaleProfile.credit_discount_percent) || 0
    }
    return editForm.value.payment_method === 'COD' ? 5.00 : 0.00
  }
  
  let profileName = ''
  if (editForm.value.store_profile_id) {
    const profile = storeProfiles.value.find(p => p.id == editForm.value.store_profile_id)
    if (profile) profileName = profile.name
  }
  if (!profileName && order.value?.store_type) {
    profileName = order.value.store_type
  }
  
  let percent = 0
  if (profileName) {
    const profile = storeProfiles.value.find(p => p.name === profileName)
    if (profile) {
      if (editForm.value.payment_method === 'COD') percent = Number(profile.cod_discount_percent) || 0
      if (editForm.value.payment_method === 'Credit') percent = Number(profile.credit_discount_percent) || 0
    }
  }
  
  if (editForm.value.is_modern_trade && mtCodActive.value && percent === 0) {
    if (editForm.value.payment_method === 'COD') return globalSettings.value?.mt_cod_discount_percent !== undefined ? Number(globalSettings.value.mt_cod_discount_percent) : 5.00
    if (editForm.value.payment_method === 'Credit') return globalSettings.value?.mt_credit_discount_percent !== undefined ? Number(globalSettings.value.mt_credit_discount_percent) : 0.00
  }
  
  return percent
}

const editWholesaleDiscountAmount = computed(() => {
  const discountPercent = getEditWholesaleDiscountPercent()
  if (discountPercent <= 0) return 0
  
  let total = editSubtotal.value
  if (activePromotionSystem.value === 'category' || activePromotionSystem.value === 'both') {
    total -= editTotalCategoryDiscount.value
  }
  return Math.max(0, total * (discountPercent / 100))
})

const editPromotionStatus = computed(() => {
  const status: any = {}
  if (editForm.value.disable_promotions) return status
  if (editForm.value.is_modern_trade && !mtPromoActive.value) return status
  const consumedIds = editBundleConsumedProductIds.value
  
  editForm.value.items.forEach((item: any) => {
    if (consumedIds.includes(String(item.product_id))) return
    const product = products.value.find(p => String(p.id) === String(item.product_id))
    if (!product || !product.category_id) return
    
    const catId = product.category_id
    if (!status[catId]) {
      status[catId] = { cartons: 0, subtotal: 0, category_name: product.category?.name || 'Category', categoryId: Number(catId) }
    }
    
    const unit = getAvailableUnits(item.product_id).find(u => u.name.toUpperCase() === (item.unit || '').toUpperCase())
    const rawFactor = unit ? ((unit as any).carton_factor ?? 0) : 0
    let factor = 0
    if (rawFactor > 0) {
      factor = rawFactor >= 1 ? (1 / rawFactor) : rawFactor
    }
    status[catId].cartons += (item.qty || 0) * factor
    status[catId].subtotal += (item.qty || 0) * getEditItemEffectivePrice(item)
  })

  const getQualifyingVolumeForPromo = (promo: any, targetUnit: string) => {
    targetUnit = targetUnit.toUpperCase()
    let totalQty = 0.0
    const catIds = (promo.target_category_ids || [promo.category_id]).map(Number)
    const prodIds = (promo.target_product_ids || []).map(Number)

    editForm.value.items.forEach((item: any) => {
      if (consumedIds.includes(String(item.product_id))) return
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
      const choice = getEditCategoryPromoChoice(catIdNum)
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
      // which tier fires based on remaining qty. Filtering by max would break e.g. 6 CTN
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
                // extra_foc is a flat fixed bonus — only added from primaryReward
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

const editTotalCategoryDiscount = computed(() => {
  if (editForm.value.disable_promotions) return 0
  const consumedIds = editBundleConsumedProductIds.value
  let totalDiscount = 0

  Object.entries(editPromotionStatus.value).forEach(([catIdStr, s]: [string, any]) => {
    if (!s.applied) return
    const promo = s.applied
    const catId = Number(catIdStr)

    const targetCatIds = (promo.target_category_ids || [promo.category_id]).map(Number)
    const targetProdIds = (promo.target_product_ids || []).map(Number)

    let isDiscountChosen = !promo.has_options
    if (promo.has_options) {
      const catChoice = getEditCategoryPromoChoice(catId)
      if (catChoice === 'discount') isDiscountChosen = true
    }

    if (!isDiscountChosen) return

    let eligibleSubtotal = 0
    let eligibleCartons = 0
    let hasEligibleItems = false

    editForm.value.items.forEach((item: any) => {
      if (consumedIds.includes(String(item.product_id))) return
      const product = products.value.find(p => String(p.id) === String(item.product_id))
      if (!product) return

      const matches = product.category_id !== null && Number(product.category_id) === catId
      if (matches) {
        eligibleSubtotal += (item.qty || 0) * getEditItemEffectivePrice(item)
        const unit = getAvailableUnits(item.product_id).find(u => u.name.toUpperCase() === (item.unit || '').toUpperCase())
        const rawFactor = unit ? ((unit as any).carton_factor ?? 0) : 0
        let factor = 0
        if (rawFactor > 0) {
          factor = rawFactor >= 1 ? (1 / rawFactor) : rawFactor
        }
        eligibleCartons += (item.qty || 0) * factor
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

const editCategoryDiscountLabels = computed(() => {
  const consumedIds = editBundleConsumedProductIds.value
  const labels: string[] = []

  Object.entries(editPromotionStatus.value).forEach(([catIdStr, s]: [string, any]) => {
    if (!s.applied) return
    const catId = Number(catIdStr)
    const catChoice = getEditCategoryPromoChoice(catId)
    if (s.applied.has_options && catChoice !== 'discount') return
    
    let hasEligibleItems = false
    editForm.value.items.forEach((item: any) => {
      if (consumedIds.includes(String(item.product_id))) return
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

const viewAppliedPromotionLabels = computed(() => {
  if (!order.value || order.value.disable_promotions || !order.value.items) return ''
  const labels: string[] = []

  if (order.value.selected_bundle_id && bundlePromotions.value.length > 0) {
    const bundle = bundlePromotions.value.find((b: any) => Number(b.id) === Number(order.value.selected_bundle_id))
    if (bundle) {
      labels.push(`Bundle: ${bundle.name}`)
    }
  }

  const nonPromoItems = (order.value.items || []).filter((i: any) => !i.is_promo)
  const processedCatIds = new Set<number>()

  Object.entries(editPromotionStatus.value).forEach(([catIdStr, s]: [string, any]) => {
    if (!s.applied) return
    const catId = Number(catIdStr)
    if (processedCatIds.has(catId)) return
    
    let hasEligibleItems = false
    nonPromoItems.forEach((item: any) => {
      const product = products.value.find(p => String(p.id) === String(item.product_id))
      if (product && Number(product.category_id) === catId) hasEligibleItems = true
    })

    if (!hasEligibleItems) return
    processedCatIds.add(catId)

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

const editFilteredBundles = computed(() => {
  if (editForm.value.disable_promotions) return []
  if (editForm.value.is_modern_trade && !mtPromoActive.value) return []
  const targetType = editForm.value.is_new_store ? 'new' : 'existing'
  const valid = bundlePromotions.value.filter(b => b.target_outlet_type === 'all' || b.target_outlet_type === targetType)
  
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
    if (editForm.value.is_new_store) {
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

const editQualifyingBundles = computed(() => {
  if (editForm.value.disable_promotions) return []
  if (editForm.value.is_modern_trade && !mtPromoActive.value) return []
  if (activePromotionSystem.value !== 'bundle' && activePromotionSystem.value !== 'both') return []
  
  const validBundles = editFilteredBundles.value
  const qualifying: any[] = []

  validBundles.forEach(bundle => {
    let maxBundlesPossible = 999999
    
    bundle.requirements.forEach((req: any) => {
      const targetUnit = req.required_unit
      let inCart = 0
      
      if (req.category_id) {
        const catProducts = products.value.filter(x => x.category_id === req.category_id)
        editForm.value.items.forEach((item: any) => {
          const isMatch = catProducts.some(p => String(p.id) === String(item.product_id))
          if (isMatch) {
            if (!targetUnit || item.unit === targetUnit) {
              inCart += (item.qty || 0)
            }
          }
        })
      } else if (req.product_id) {
        editForm.value.items.forEach((item: any) => {
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

watch(editQualifyingBundles, (qualifying) => {
  if (qualifying.length === 0) {
    editForm.value.selected_bundle_id = null
  } else if (!editForm.value.selected_bundle_id || !qualifying.some(b => String(b.id) === String(editForm.value.selected_bundle_id))) {
    editForm.value.selected_bundle_id = qualifying[0].id
  }
}, { immediate: true })

const editActiveBundle = computed(() => {
  const qualifying = editQualifyingBundles.value
  if (qualifying.length === 0) return null
  return qualifying.find(b => String(b.id) === String(editForm.value.selected_bundle_id)) || qualifying[0]
})

const editTotalBundleSets = computed(() => {
  const b = editActiveBundle.value
  return b ? b.maxBundlesPossible : 0
})

const editBundleConsumedProductIds = computed(() => {
  const b = editActiveBundle.value
  if (!b) return []
  
  const consumed = new Set<string>()
  const potentialConsumed = new Set<string>()

  b.requirements.forEach((req: any) => {
    const targetUnit = req.required_unit
    let inCart = 0
    
    if (req.category_id) {
      const catProducts = products.value.filter(x => x.category_id === req.category_id)
      editForm.value.items.forEach((item: any) => {
        const isMatch = catProducts.some(p => String(p.id) === String(item.product_id))
        if (isMatch) {
          if (!targetUnit || item.unit === targetUnit) {
            inCart += (item.qty || 0)
            potentialConsumed.add(String(item.product_id))
          }
        }
      })
    } else if (req.product_id) {
      editForm.value.items.forEach((item: any) => {
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

const editBundleFocItems = computed(() => {
  const b = editActiveBundle.value
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

const editGlobalFocItems = computed(() => {
  const freeItems: any[] = []
  if (editForm.value.disable_promotions) return freeItems
  const totalBundleSetsPurchased = editTotalBundleSets.value

  const totalValue = editSubtotal.value
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
              if (editForm.value.is_modern_trade && !chans.includes('mt') && !chans.includes('modern_trade')) return
              if (editForm.value.is_wholesale && !chans.includes('wholesale')) return
              if (editForm.value.is_new_store && !chans.includes('new_store')) return
              if (!editForm.value.is_modern_trade && !editForm.value.is_wholesale && !editForm.value.is_new_store && !chans.includes('retail') && !chans.includes('regular')) return
            }
          } else {
            if (editForm.value.is_modern_trade) {
              if (!rule.apply_mt) return
            } else if (editForm.value.is_wholesale) {
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

const editGrandTotal = computed(() => {
  let total = editSubtotal.value
  if (activePromotionSystem.value === 'category' || activePromotionSystem.value === 'both') {
    total -= editTotalCategoryDiscount.value
  }
  total -= editWholesaleDiscountAmount.value
  return Math.max(0, total)
})

watch(() => editForm.value.store_profile_id, (newVal) => {
  if (newVal) {
    const profile = storeProfiles.value.find(p => p.id == newVal)
    if (profile) {
      if (profile.name === 'Wholesale') {
        editForm.value.is_wholesale = true
      }
    }
  }
})

const gettingLocation = ref(false)

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
      editForm.value.province = addr.state || addr.province || addr.city || ''
      editForm.value.district = addr.district || addr.city_district || addr.city || addr.town || ''
      editForm.value.commune = addr.suburb || addr.village || addr.neighbourhood || addr.hamlet || ''
      editForm.value.customer_address = data.display_name
    }
  } catch (e) {
    console.error('Reverse geocoding failed:', e)
  } finally {
    gettingLocation.value = false
  }
}

watch(() => editForm.value.location, (newVal) => {
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
      editForm.value.location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      gettingLocation.value = false
    },
    (err) => {
      alert(`Location error: ${err.message}`)
      gettingLocation.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

watch(() => editForm.value.trade_class_l1, (newVal, oldVal) => {
  if (oldVal !== undefined) {
    editForm.value.trade_class_l2 = ''
    editForm.value.trade_class_l3 = ''
  }
})
watch(() => editForm.value.trade_class_l2, (newVal, oldVal) => {
  if (oldVal !== undefined) {
    editForm.value.trade_class_l3 = ''
  }
})

function getAvailableUnits(productId: any) {
  const p = products.value.find(x => x.id == productId)
  if (!p) return []
  const units: any[] = []
  
  if (p.units && Array.isArray(p.units)) {
    p.units.forEach((u: any) => {
      // Use actual carton_factor (may be 0 for units without factor)
      units.push({ name: u.name, price: u.price, stock: u.stock || 0, carton_factor: u.carton_factor ?? null, mt_price: u.mt_price ?? null })
    })
  }

  if (p.unit && p.price !== null) {
    if (!units.find(existing => existing.name === p.unit)) {
      units.push({ name: p.unit, price: p.price, stock: p.stock || 0, carton_factor: 1.0, mt_price: p.mt_price ?? null })
    }
  }

  return units
}

function addEditItem(event: any) {
  const pId = event.target.value
  if (!pId) return
  const p = products.value.find(x => x.id == pId)
  if (p) {
    const units = getAvailableUnits(p.id)
    const u = units[0]
    if (u) {
      editForm.value.items.push({
        product_id: String(p.id),
        qty: 1,
        unit: u.name,
        manual_discount: 0,
        promo_option: 'foc'
      })
    }
  }
  event.target.value = ""
}

function removeEditItem(idx: string | number) {
  editForm.value.items.splice(Number(idx), 1)
}

async function submitEdit() {
  if (!editForm.value.shop_name || !editForm.value.contact || !editForm.value.province || !editForm.value.district || !editForm.value.location || !editForm.value.customer_address || !editForm.value.delivery_date || !editForm.value.so_number || !editForm.value.customer_id) {
    alert('Please fill in all required fields.')
    return
  }
  if (editForm.value.items.length === 0) {
    alert('Please add at least one product.')
    return
  }
  
  try {
    // If this is a completed order being edited by a super admin, skip Telegram notification
    const wasCompleted = isCompleted.value
    // Resolve store_type from store_profile_id so channel-type detection works correctly on backend
    const resolvedStoreProfile = storeProfiles.value.find((p: any) => p.id == editForm.value.store_profile_id)
    const resolvedStoreType = editForm.value.is_wholesale
      ? 'Wholesale'
      : (resolvedStoreProfile?.name || order.value?.store_type || null)

    const payload = {
      shop_name: editForm.value.shop_name,
      contact: editForm.value.contact,
      customer_address: editForm.value.customer_address,
      province: editForm.value.province,
      district: editForm.value.district,
      commune: editForm.value.commune,
      location: editForm.value.location,
      delivery_date: editForm.value.delivery_date,
      payment_method: editForm.value.payment_method,
      note: editForm.value.note,
      so_number: editForm.value.so_number,
      customer_id: editForm.value.customer_id,
      store_profile_id: editForm.value.store_profile_id,
      store_type: resolvedStoreType,
      trade_class_l1: editForm.value.trade_class_l1,
      trade_class_l2: editForm.value.trade_class_l2,
      trade_class_l3: editForm.value.trade_class_l3,
      is_new_store: editForm.value.is_new_store,
      is_wholesale: editForm.value.is_wholesale,
      is_modern_trade: editForm.value.is_modern_trade,
      ws_discount_enabled: editForm.value.ws_discount_enabled,
      mt_discount_enabled: editForm.value.mt_discount_enabled,
      disable_promotions: editForm.value.disable_promotions,
      selected_bundle_id: editForm.value.selected_bundle_id,
      items: editForm.value.items.map((item: any) => ({
        product_id: Number(item.product_id),
        qty: Number(item.qty),
        unit: item.unit,
        manual_discount: Number(item.manual_discount || 0),
        promo_option: item.promo_option || 'foc'
      })),
      // Suppress Telegram alert when super admin edits a completed order
      skip_telegram: wasCompleted && isSuperAdmin.value
    }
    
    loading.value = true
    await api.put(`/admin/orders/${order.value.id}`, payload)
    
    // Refresh data
    order.value = await api.get(`/orders/${route.params.id}`) as any
    isEditing.value = false
    showToast('Order Updated Successfully!')
  } catch (e: any) {
    console.error('Failed to update order', e)
    alert(`Failed to update order: ${e.response?.data?.message || e.message}`)
  } finally {
    loading.value = false
  }
}

const tradeClassHierarchy = ref<Record<string, Record<string, string[]>>>({})
const storeProfiles = ref<any[]>([])
const ratingStoreProfiles = computed(() => {
  return storeProfiles.value.filter(s => {
    const name = (s.name || '').toLowerCase()
    return s.type_category === 'profile' || name.includes('$') || name.includes('profile')
  })
})

const tradeClassL1Options = computed(() => Object.keys(tradeClassHierarchy.value))
const tradeClassL2Options = computed(() => {
  if (!order.value?.trade_class_l1) return []
  return Object.keys(tradeClassHierarchy.value[order.value.trade_class_l1] || {})
})
const tradeClassL3Options = computed(() => {
  if (!order.value?.trade_class_l1 || !order.value?.trade_class_l2) return []
  return tradeClassHierarchy.value[order.value.trade_class_l1]?.[order.value.trade_class_l2] || []
})

watch(() => order.value?.trade_class_l1, (newVal, oldVal) => {
  if (order.value && oldVal !== undefined) {
    order.value.trade_class_l2 = ''
    order.value.trade_class_l3 = ''
  }
})
watch(() => order.value?.trade_class_l2, (newVal, oldVal) => {
  if (order.value && oldVal !== undefined) {
    order.value.trade_class_l3 = ''
  }
})

onMounted(async () => {
  try { 
    const [oRes, tcRes, spRes, prodRes, catRes, settingsRes, activePromos] = await Promise.all([
      api.get(`/orders/${route.params.id}`),
      api.get('/trade-classes/hierarchy'),
      api.get('/store-types'),
      api.get('/products'),
      api.get('/categories'),
      api.get('/global-settings').catch(() => ({})),
      api.get('/promotions/active').catch(() => [])
    ])
    order.value = oRes
    tradeClassHierarchy.value = tcRes as any
    storeProfiles.value = spRes as any[]
    products.value = prodRes as any[]
    categories.value = catRes as any[]
    globalSettings.value = settingsRes || {}

    if (order.value.store_type && order.value.visit_frequency) {
      const match = storeProfiles.value.find(p => p.name === order.value.store_type && p.visit_frequency === order.value.visit_frequency)
      if (match) {
        order.value.store_profile_id = match.id
      }
    }

    const pp = (activePromos as any[]) || []
    rawActivePromotions.value = pp

    processActivePromotions(pp)

    if (globalSettings.value) {
      activePromotionSystem.value = globalSettings.value.active_promotion_system
      mtPromoActive.value = globalSettings.value.mt_promo_active === 'true'
      mtCodActive.value = globalSettings.value.mt_cod_active !== 'false'
    }
  } catch (e) {
    console.error(e)
  }
  finally { loading.value = false }
})

const rawActivePromotions = ref<any[]>([])

function processActivePromotions(pp: any[] = rawActivePromotions.value) {
  if (!pp || !Array.isArray(pp)) return

  // 1. Map category & mixed promotions
  const catPromos: any[] = []
  pp.forEach((promo: any) => {
    if (promo.promotion_type !== 'category_tiered' && promo.promotion_type !== 'mixed_tiered') return

    const ch = (promo.channel_type || 'all').trim().toLowerCase()
    if (ch !== 'all') {
      const chans = ch.split(',').map((s: string) => s.trim())
      if (!chans.includes('all')) {
        const storeTypeStr = editForm.value.is_wholesale ? 'Wholesale' : (order.value?.store_type || '')
        const isSpecialtyStore = String(storeTypeStr).toLowerCase().includes('specialty')
        if (isSpecialtyStore && chans.includes('general')) return
        if (!isSpecialtyStore && chans.includes('specialty')) return

        if (editForm.value.is_modern_trade && !chans.includes('mt') && !chans.includes('modern_trade')) return
        if (editForm.value.is_wholesale && !chans.includes('wholesale')) return
        if (!editForm.value.is_modern_trade && !editForm.value.is_wholesale && !chans.includes('retail') && !chans.includes('regular') && !chans.includes('general')) return
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
  () => [editForm.value.is_modern_trade, editForm.value.is_wholesale, editForm.value.is_new_store, editForm.value.store_profile_id],
  () => processActivePromotions()
)

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { dateStyle: 'medium' })

function isValidCoords(loc?: string) {
  if (!loc) return false
  return /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/.test(loc.trim())
}

async function updateStatus(status: string) {
  if (!confirm(`Mark this order as ${status}?`)) return
  try {
    await api.put(`/admin/orders/${order.value.id}`, { status })
    order.value.status = status
    showToast(`Order marked as ${status}`)
  } catch (e: any) {
    alert('Failed to update status: ' + (e?.data?.message || 'Unknown error'))
  }
}

const toast = reactive({ show: false, message: '' })
function showToast(msg: string) {
  toast.message = msg
  toast.show = true
  setTimeout(() => toast.show = false, 3000)
}

async function saveCustomIds() {
  try {
    // 1. Save Order ID
    const payload: any = { 
      order_custom_id: order.value.order_custom_id,
      so_number: order.value.so_number,
      customer_id: order.value.customer_id,
      trade_class_l1: order.value.trade_class_l1,
      trade_class_l2: order.value.trade_class_l2,
      trade_class_l3: order.value.trade_class_l3
    }
    
    if (order.value.store_profile_id) {
      const profile = storeProfiles.value.find(p => p.id === order.value.store_profile_id)
      if (profile) {
        payload.store_type = profile.name
        payload.visit_frequency = profile.visit_frequency
      }
    } else {
      payload.store_type = null
      payload.visit_frequency = null
    }

    await api.put(`/admin/orders/${order.value.id}`, payload)

    // 2. Save Delivery Data (ID and Planned Date)
    const delCustomId = order.value._temp_delivery_id !== undefined ? order.value._temp_delivery_id : (order.value.delivery?.delivery_custom_id || '')
    const plannedDate = order.value._temp_planned_date !== undefined ? order.value._temp_planned_date : (order.value.delivery?.planned_delivery_date ? new Date(order.value.delivery.planned_delivery_date).toISOString().split('T')[0] : '')
    
    if (order.value.delivery?.id) {
      await api.put(`/admin/deliveries/${order.value.delivery.id}`, { 
        delivery_custom_id: delCustomId,
        planned_delivery_date: plannedDate
      })
    } else if ((delCustomId && delCustomId.trim()) || (plannedDate && plannedDate.trim())) {
      await api.post('/admin/deliveries', { 
        order_id: Number(order.value.id),
        courier_id: null,
        delivery_custom_id: delCustomId.trim(),
        planned_delivery_date: plannedDate
      })
    }

    // Clear temp storage
    delete order.value._temp_delivery_id
    delete order.value._temp_planned_date

    // Refresh data
    order.value = await api.get(`/orders/${route.params.id}`) as any
    showToast('All Information Saved!')
  } catch (e: any) {
    console.error('Failed to save IDs', e)
    alert(`Failed to save IDs: ${e.response?.data?.message || e.message}`)
  }
}

async function restoreOrder() {
  if (!confirm('Restore this cancelled order back to Pending? This will re-deduct product stock and reactivate delivery dispatch.')) return
  try {
    await api.put(`/admin/orders/${order.value.id}`, { status: 'pending' })
    order.value = await api.get(`/orders/${route.params.id}`) as any
    showToast('Order restored successfully to Pending!')
  } catch (e: any) {
    alert(e.message || e.data?.message || 'Failed to restore order')
  }
}

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'pending': return 'text-amber-600 bg-amber-50 border-amber-100'
    case 'completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100'
    case 'cancelled': return 'text-red-600 bg-red-50 border-red-100'
    default: return 'text-slate-500 bg-slate-50 border-slate-100'
  }
}

async function deleteOrder() {
  if (!confirm('Delete this order?')) return
  await api.del(`/admin/orders/${order.value.id}`)
  router.push('/admin/orders')
}

function navigateBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/admin/orders')
  }
}

function printInvoice() {
  if (!order.value?.invoice_url) return
  window.open(order.value.invoice_url, '_blank')
}
</script>
