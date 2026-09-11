<template>
  <div class="flex gap-6 min-h-[calc(100vh-12rem)] animate-fade-in">
    <!-- Sidebar -->
    <aside class="w-52 shrink-0 hidden lg:flex flex-col gap-1">
      <div class="flex items-center justify-between mb-3 px-1">
        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categories</span>
        <button @click="openCategoryModal()" class="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
          <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
        </button>
      </div>
      <button @click="selectedCategory = null"
        class="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
        :class="selectedCategory === null ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'">
        <div class="flex items-center gap-2"><Icon name="heroicons:squares-2x2" class="w-4 h-4" />All</div>
        <span class="text-[10px]">{{ products.length }}</span>
      </button>
      <div v-for="c in categories" :key="c.id" class="group relative">
        <button @click="selectedCategory = c.id"
          class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-left"
          :class="selectedCategory === c.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100'">
          <Icon name="heroicons:tag" class="w-4 h-4 shrink-0" />
          <span class="truncate">{{ c.name }}</span>
        </button>
        <div class="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button @click.stop="openCategoryModal(c)" class="p-1 text-slate-400 hover:text-blue-600"><Icon name="heroicons:pencil" class="w-3 h-3" /></button>
          <button @click.stop="deleteCategory(c.id)" class="p-1 text-slate-400 hover:text-red-500"><Icon name="heroicons:trash" class="w-3 h-3" /></button>
        </div>
      </div>
    </aside>

    <!-- Main Inventory Grid -->
    <div class="flex-1 space-y-5">
      <div v-if="filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="p in filteredProducts" :key="p.id" class="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
          <div class="h-48 bg-slate-50/50 flex items-center justify-center relative overflow-hidden">
            <img v-if="p.image" :src="`${config.public.apiBase}/storage/${p.image}`" class="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
            <Icon v-else name="heroicons:cube" class="w-12 h-12 text-slate-200 group-hover:text-blue-200 transition-colors duration-300" />
            <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span v-if="p.category" class="bg-white/80 backdrop-blur text-slate-600 border border-slate-200 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest">{{ p.category.name }}</span>
              <span class="bg-blue-600 text-white px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ml-auto">{{ p.unit }}: {{ p.stock }}</span>
            </div>
          </div>
          <div class="p-4">
            <div class="flex items-start justify-between mb-1 gap-2">
              <h3 class="text-sm font-black text-slate-900 truncate">{{ p.name }}</h3>
              <span v-if="p.sku" class="text-[9px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">{{ p.sku }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mb-2.5">
              <span v-for="u in p.units" :key="u.id" class="text-[9px] text-slate-500 font-bold bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                {{ u.name }}: ${{ u.price }} | MT: ${{ u.mt_price || u.price }}
              </span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-slate-50">
              <p class="text-lg font-black text-slate-900">${{ Number(p.price).toLocaleString() }}</p>
              <div v-if="authStore.isAdmin || authStore.isSuperAdmin || authStore.isAdminDelivery" class="flex gap-1">
                <button @click="openPriceHistoryModal(p)" title="Price History & Status" class="w-8 h-8 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"><Icon name="heroicons:currency-dollar" class="w-4 h-4" /></button>
                <button @click="openModal(p)" class="w-8 h-8 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Icon name="heroicons:pencil-square" class="w-4 h-4" /></button>
                <button @click="deleteProduct(p.id)" class="w-8 h-8 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Icon name="heroicons:trash" class="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-24 flex flex-col items-center gap-4 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
        <Icon name="heroicons:archive-box-x-mark" class="w-12 h-12 text-slate-200" />
        <div>
          <p class="font-black text-slate-900 text-lg">No products found</p>
          <p class="text-slate-400 text-sm">Adjust your search or category filter</p>
        </div>
      </div>
    </div>

    <!-- Modals Teleported -->
    <Teleport to="body">
      <!-- Product Add/Edit Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] px-4">
        <div class="bg-white border border-slate-200 w-full max-w-md p-8 rounded-[2rem] shadow-2xl relative overflow-y-auto max-h-[95vh] scrollbar-hide">
          <button @click="showModal = false" class="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 p-2 rounded-full">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
          
          <div class="mb-8">
            <h3 class="text-2xl font-black text-slate-900 leading-none mb-2">{{ editing ? 'Edit Product' : 'Add Product' }}</h3>
            <p class="text-slate-500 text-xs font-medium uppercase tracking-widest leading-none">Configure your catalog entry.</p>
          </div>
          
          <form @submit.prevent="saveProduct" class="space-y-6">
            <!-- Tab Switcher -->
            <div class="flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                type="button" 
                @click="activeTab = 'general'"
                :class="`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`"
              >
                Pricing & Units
              </button>
              <button 
                type="button" 
                @click="activeTab = 'image'"
                :class="`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'image' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`"
              >
                Product Image
              </button>
            </div>

            <!-- General Tab Content -->
            <div v-if="activeTab === 'general'" class="space-y-6">
              <div class="space-y-5">
                <div class="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50 mb-2">
                  <label class="label text-[10px] text-blue-600">Product SKU (Identification)</label>
                  <input v-model="form.sku" class="input-field-modern-admin !bg-white border-blue-200" placeholder="e.g. AFC-PRD-001" />
                </div>

                <div>
                  <label class="label text-[10px] text-slate-500">Product Name</label>
                  <input v-model="form.name" class="input-field-modern-admin" required placeholder="Aprati milk STW" />
                </div>

                <div>
                  <label class="label text-[10px] text-blue-600">Category</label>
                  <div class="flex gap-2">
                    <select v-model="form.category_id" class="input-field-modern-admin flex-1 appearance-none">
                      <option :value="null">Uncategorized</option>
                      <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <button type="button" @click="openCategoryModal()" class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 border border-blue-100 transition-all shadow-sm">
                      <Icon name="heroicons:plus" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Units Section -->
              <div class="space-y-4">
                <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                  <label class="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Inventory Tiers</label>
                  <button type="button" @click="addUnit" class="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Icon name="heroicons:plus-circle" class="w-4 h-4" /> Add Unit
                  </button>
                </div>

                <div class="space-y-3">
                  <div v-for="(u, idx) in form.units" :key="idx" class="relative group/unit">
                    <button v-if="form.units.length > 1" type="button" @click="form.units.splice(idx, 1)" class="absolute -top-2 -right-2 w-6 h-6 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all z-10">
                      <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                    </button>
                    <div class="flex flex-col sm:flex-row gap-3 items-stretch">
                      <!-- Normal Pricing -->
                      <div class="flex-1 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col">
                        <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Normal Price</div>
                        <div class="grid grid-cols-12 gap-2 items-end mt-auto">
                          <div class="col-span-3 space-y-1">
                            <span class="text-[8px] font-black text-slate-400 uppercase ml-1">Unit</span>
                            <input v-model="u.name" class="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-black uppercase outline-none focus:border-slate-400 transition-colors" placeholder="BOX" />
                          </div>
                          <div class="col-span-3 space-y-1">
                            <span class="text-[8px] font-black text-slate-400 uppercase ml-1">Price</span>
                            <input v-model.number="u.price" type="number" step="0.00001" class="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-black text-center outline-none focus:border-slate-400 transition-colors" />
                          </div>
                          <div class="col-span-3 space-y-1 relative">
                            <span class="text-[8px] font-black text-slate-400 uppercase ml-1">Factor</span>
                            <input v-model.number="u.carton_factor" type="number" step="0.0001" class="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-black text-center outline-none focus:border-slate-400 transition-colors" title="Conversion to Carton" />
                          </div>
                          <div class="col-span-3 space-y-1">
                            <span class="text-[8px] font-black text-slate-400 uppercase ml-1">Stock</span>
                            <input v-model.number="u.stock" type="number" class="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-black text-center outline-none focus:border-slate-400 transition-colors" />
                          </div>
                        </div>
                      </div>

                      <!-- MT Pricing -->
                      <div class="w-full sm:w-[25%] bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 flex flex-col shrink-0">
                        <div class="flex items-center gap-1.5 mb-2 px-1">
                          <Icon name="heroicons:building-storefront" class="w-3.5 h-3.5 text-indigo-400" />
                          <div class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Modern Trade</div>
                        </div>
                        <div class="space-y-1 mt-auto">
                          <span class="text-[8px] font-black text-indigo-400 uppercase ml-1">MT Price</span>
                          <div class="relative">
                            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-300 font-black text-xs">$</span>
                            <input v-model.number="u.mt_price" type="number" step="0.00001" class="w-full bg-white border border-indigo-200 rounded-xl pl-6 pr-2 py-2 text-xs font-black outline-none focus:border-indigo-400 focus:ring-[3px] focus:ring-indigo-400/20 transition-all shadow-sm" placeholder="0.00" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Unit Price History Link (If unit already saved) -->
                    <div v-if="u.id && editing" class="flex items-center justify-end mt-2">
                      <button 
                        type="button" 
                        @click="openPriceHistoryModalForUnit(editing, u)" 
                        class="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                      >
                        <Icon name="heroicons:clock" class="w-3.5 h-3.5 text-emerald-600" />
                        <span>Price History & Status</span>
                        <span v-if="u.prices?.length" class="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-black">
                          {{ u.prices.length }}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Image Tab Content -->
            <div v-if="activeTab === 'image'" class="space-y-6">
              <div class="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden group/img">
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleImageChange"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                
                <div v-if="imagePreview || form.image" class="absolute inset-0 bg-white z-0">
                  <img :src="imagePreview || `${config.public.apiBase}/storage/${form.image}`" class="w-full h-full object-contain" />
                  <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <p class="text-white text-xs font-black uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-xl backdrop-blur-sm">Change Image</p>
                  </div>
                  <button @click.stop="clearImage" type="button" class="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-red-500 shadow-lg z-20 hover:bg-red-50 transition-all">
                    <Icon name="heroicons:trash" class="w-5 h-5" />
                  </button>
                </div>
                
                <div v-else class="flex flex-col items-center gap-4 text-center">
                  <div class="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm">
                    <Icon name="heroicons:photo" class="w-10 h-10" />
                  </div>
                  <div>
                    <p class="text-sm font-black text-slate-900">Upload Product Photo</p>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PNG, JPG or WEBP (Max 2MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-4 pt-4 border-t border-slate-100">
              <button type="button" @click="showModal = false" class="h-14 flex-1 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" class="h-14 flex-1 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                {{ editing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Category Modal -->
      <div v-if="showCategoryModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[110] px-4">
        <div class="bg-white border border-slate-200 w-full max-w-sm p-8 rounded-3xl shadow-2xl relative">
          <button @click="showCategoryModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
          
          <h3 class="text-xl font-black text-slate-900 mb-2">{{ editingCategory ? 'Edit Category' : 'New Category' }}</h3>
          <p class="text-slate-500 text-xs mb-8">Group your products effectively.</p>
          
          <form @submit.prevent="saveCategory" class="space-y-5">
            <div>
              <label class="label">Name</label>
              <input v-model="categoryForm.name" class="input-field" required placeholder="Milk Products" />
            </div>
            <div class="flex gap-4 pt-4">
              <button type="button" @click="showCategoryModal = false" class="btn-secondary flex-1">Cancel</button>
              <button type="submit" class="btn-primary flex-1">{{ editingCategory ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Price History & Active/Inactive Management Modal -->
      <div v-if="showPriceModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110] px-4">
        <div class="bg-white border border-slate-200 w-full max-w-2xl p-6 sm:p-8 rounded-[2rem] shadow-2xl relative overflow-y-auto max-h-[92vh] custom-scrollbar">
          <button @click="showPriceModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 p-2 rounded-full">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>

          <!-- Header -->
          <div class="mb-6">
            <div class="flex items-center gap-2 mb-1">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Price Management & Audit</span>
            </div>
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {{ selectedProductForPrice?.name }}
            </h3>
            <p class="text-xs font-bold text-slate-400 mt-0.5">
              Unit: <span class="text-slate-800 font-black uppercase">{{ selectedUnitForPrice?.name }}</span> 
              • Carton Factor: <span class="text-slate-800 font-bold">{{ selectedUnitForPrice?.carton_factor || 1.0 }}</span>
            </p>
          </div>

          <!-- Unit Selector (if multiple units) -->
          <div v-if="selectedProductForPrice?.units?.length > 1" class="flex gap-2 mb-6 overflow-x-auto pb-1">
            <button 
              v-for="unit in selectedProductForPrice.units" 
              :key="unit.id"
              @click="switchPriceUnit(unit)"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0',
                selectedUnitForPrice?.id === unit.id ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              {{ unit.name }} (${{ unit.price }})
            </button>
          </div>

          <!-- Price Guarantee Info Banner -->
          <div class="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 mb-6 flex items-start gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="heroicons:shield-check" class="w-5 h-5 text-emerald-700" />
            </div>
            <div class="text-xs">
              <p class="font-black text-emerald-900 leading-tight mb-0.5">Report Price Integrity Guaranteed</p>
              <p class="text-emerald-700 font-medium text-[11px] leading-relaxed">
                When you activate a new price, the old price is deactivated for <strong>future orders</strong> only. All <strong>past orders and historical reports stay locked</strong> with their original prices.
              </p>
            </div>
          </div>

          <!-- Add New Price Form Card -->
          <div class="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <div class="flex items-center gap-2">
                <Icon name="heroicons:plus-circle" class="w-4 h-4 text-blue-600" />
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-800">Add New Price</h4>
              </div>
              <span class="text-[10px] font-bold text-slate-400">Step 1: Set price • Step 2: Choose active status</span>
            </div>

            <form @submit.prevent="submitNewPrice" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 ml-1">
                    New Normal Price ($) *
                  </label>
                  <input 
                    v-model.number="newPriceForm.price" 
                    type="number" 
                    step="0.0001" 
                    required 
                    min="0"
                    placeholder="e.g. 28.50" 
                    class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-1 ml-1">
                    New Modern Trade MT Price ($)
                  </label>
                  <input 
                    v-model.number="newPriceForm.mt_price" 
                    type="number" 
                    step="0.0001" 
                    min="0"
                    placeholder="e.g. 27.00 (optional)" 
                    class="w-full bg-white border border-indigo-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1 ml-1">
                  Reason / Notes for Price Change
                </label>
                <input 
                  v-model="newPriceForm.notes" 
                  type="text" 
                  placeholder="e.g. Cost revision effective Sept 2026" 
                  class="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-slate-400 transition-all"
                />
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label class="flex items-center gap-2.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    v-model="newPriceForm.activate_now" 
                    class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span class="text-xs font-bold text-slate-700">
                    Activate immediately (deactivate current old price)
                  </span>
                </label>

                <button 
                  type="submit" 
                  :disabled="isSavingPrice"
                  class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Icon name="heroicons:check-badge" class="w-4 h-4" />
                  <span>{{ newPriceForm.activate_now ? 'Save & Activate Price' : 'Save as Draft Price' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Price History Table -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-800">Price History Records</h4>
              <span class="text-[10px] font-bold text-slate-400">{{ unitPricesList.length }} record(s)</span>
            </div>

            <div v-if="unitPricesList.length === 0" class="text-center py-8 text-slate-400 text-xs font-bold bg-slate-50 border border-slate-100 rounded-2xl">
              No price history recorded yet. Add your first price above.
            </div>

            <div v-else class="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
              <div 
                v-for="item in unitPricesList" 
                :key="item.id"
                :class="[
                  'p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors',
                  item.is_active ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'
                ]"
              >
                <!-- Price Info -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-base font-black text-slate-900">
                      ${{ Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) }}
                    </span>
                    <span v-if="item.mt_price" class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                      MT: ${{ Number(item.mt_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) }}
                    </span>

                    <span 
                      :class="[
                        'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1',
                        item.is_active ? 'bg-emerald-500 text-white shadow-2xs' : 'bg-slate-100 text-slate-500'
                      ]"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="item.is_active ? 'bg-white' : 'bg-slate-400'"></span>
                      {{ item.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>

                  <p class="text-[11px] text-slate-500 font-medium">
                    {{ item.notes || 'Catalog pricing' }}
                  </p>

                  <p class="text-[10px] text-slate-400 font-mono">
                    <span v-if="item.activated_at">Activated: {{ formatDateTime(item.activated_at) }}</span>
                    <span v-if="item.deactivated_at" class="ml-2 text-rose-400">• Deactivated: {{ formatDateTime(item.deactivated_at) }}</span>
                  </p>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 shrink-0">
                  <button 
                    v-if="!item.is_active" 
                    @click="activatePriceRecord(item)" 
                    :disabled="isSavingPrice"
                    class="px-3.5 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-300 hover:border-emerald-400 text-emerald-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
                    <span>Activate</span>
                  </button>

                  <span v-else class="text-xs font-black text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <Icon name="heroicons:check" class="w-3.5 h-3.5 stroke-2" />
                    <span>Current Active</span>
                  </span>

                  <button 
                    v-if="!item.is_active" 
                    @click="deletePriceRecord(item)" 
                    :disabled="isSavingPrice"
                    title="Delete inactive price"
                    class="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="button" 
              @click="showPriceModal = false" 
              class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
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
import { ref, reactive, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

const config = useRuntimeConfig()
const api = useApi()
const authStore = useAuthStore()

const props = defineProps<{
  products: any[]
  categories: any[]
  searchQuery: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const selectedCategory = ref<number | null>(null)
const activeTab = ref('general')

// Modals State
const showModal = ref(false)
const showCategoryModal = ref(false)
const showPriceModal = ref(false)
const editing = ref<any>(null)
const editingCategory = ref<any>(null)

// Price History Management State
const selectedProductForPrice = ref<any>(null)
const selectedUnitForPrice = ref<any>(null)
const isSavingPrice = ref(false)
const newPriceForm = reactive({
  price: 0,
  mt_price: 0,
  notes: '',
  activate_now: true
})

const unitPricesList = computed(() => {
  if (!selectedUnitForPrice.value) return []
  const list = selectedUnitForPrice.value.prices || []
  return list.slice().sort((a: any, b: any) => {
    if (a.is_active && !b.is_active) return -1
    if (!a.is_active && b.is_active) return 1
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  })
})

function formatDateTime(val?: string) {
  if (!val) return ''
  try {
    const d = new Date(val)
    return d.toLocaleString(undefined, { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return val
  }
}

function openPriceHistoryModal(product: any) {
  selectedProductForPrice.value = product
  const unit = product.units?.find((u: any) => u.name === product.unit) || product.units?.[0] || null
  selectedUnitForPrice.value = unit
  if (unit) {
    newPriceForm.price = Number(unit.price || 0)
    newPriceForm.mt_price = Number(unit.mt_price || 0)
  } else {
    newPriceForm.price = Number(product.price || 0)
    newPriceForm.mt_price = Number(product.mt_price || 0)
  }
  newPriceForm.notes = ''
  newPriceForm.activate_now = true
  showPriceModal.value = true
}

function openPriceHistoryModalForUnit(product: any, unit: any) {
  selectedProductForPrice.value = product
  selectedUnitForPrice.value = unit
  newPriceForm.price = Number(unit.price || 0)
  newPriceForm.mt_price = Number(unit.mt_price || 0)
  newPriceForm.notes = ''
  newPriceForm.activate_now = true
  showPriceModal.value = true
}

function switchPriceUnit(unit: any) {
  selectedUnitForPrice.value = unit
  newPriceForm.price = Number(unit.price || 0)
  newPriceForm.mt_price = Number(unit.mt_price || 0)
  newPriceForm.notes = ''
  newPriceForm.activate_now = true
}

async function submitNewPrice() {
  if (!selectedProductForPrice.value || !selectedUnitForPrice.value) return
  try {
    isSavingPrice.value = true
    const pId = selectedProductForPrice.value.id
    const uId = selectedUnitForPrice.value.id
    const res: any = await api.post(`/admin/products/${pId}/units/${uId}/prices`, {
      price: newPriceForm.price,
      mt_price: newPriceForm.mt_price || null,
      activate_now: newPriceForm.activate_now,
      notes: newPriceForm.notes || (newPriceForm.activate_now ? 'Active price updated' : 'Price entry')
    })
    
    // Update local product and unit state
    if (res.product) {
      selectedProductForPrice.value = res.product
      const updatedUnit = res.product.units?.find((u: any) => u.id === uId)
      if (updatedUnit) {
        selectedUnitForPrice.value = updatedUnit
        if (newPriceForm.activate_now) {
          newPriceForm.price = Number(updatedUnit.price || 0)
          newPriceForm.mt_price = Number(updatedUnit.mt_price || 0)
        }
      }
      
      // Also update editing product and form.units if opened from edit modal
      if (editing.value && editing.value.id === pId) {
        editing.value = res.product
        if (newPriceForm.activate_now) {
          const formUnit = form.units.find((u: any) => u.id === uId)
          if (formUnit) {
            formUnit.price = Number(newPriceForm.price || 0)
            formUnit.mt_price = Number(newPriceForm.mt_price || 0)
            formUnit.prices = updatedUnit?.prices || []
          }
        }
      }
    }
    emit('refresh')
    alert(res.message || 'Price saved successfully!')
    newPriceForm.notes = ''
  } catch (e: any) {
    console.error('Failed to add price:', e)
    alert(e.data?.message || e.message || 'Failed to save new price')
  } finally {
    isSavingPrice.value = false
  }
}

async function activatePriceRecord(priceItem: any) {
  if (!confirm(`Activate $${priceItem.price} as current price? Previous price will be deactivated and future orders will use this price.`)) {
    return
  }
  try {
    isSavingPrice.value = true
    const pId = selectedProductForPrice.value.id
    const uId = selectedUnitForPrice.value.id
    const res: any = await api.post(`/admin/products/${pId}/units/${uId}/prices/${priceItem.id}/activate`)
    if (res.product) {
      selectedProductForPrice.value = res.product
      const updatedUnit = res.product.units?.find((u: any) => u.id === uId)
      if (updatedUnit) {
        selectedUnitForPrice.value = updatedUnit
        newPriceForm.price = Number(updatedUnit.price || 0)
        newPriceForm.mt_price = Number(updatedUnit.mt_price || 0)
      }
      if (editing.value && editing.value.id === pId) {
        editing.value = res.product
        const formUnit = form.units.find((u: any) => u.id === uId)
        if (formUnit) {
          formUnit.price = Number(priceItem.price || 0)
          formUnit.mt_price = Number(priceItem.mt_price || 0)
          formUnit.prices = updatedUnit?.prices || []
        }
      }
    }
    emit('refresh')
    alert(res.message || 'Price activated!')
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Failed to activate price')
  } finally {
    isSavingPrice.value = false
  }
}

async function deletePriceRecord(priceItem: any) {
  if (!confirm('Delete this inactive price record?')) return
  try {
    isSavingPrice.value = true
    const pId = selectedProductForPrice.value.id
    const uId = selectedUnitForPrice.value.id
    const res: any = await api.del(`/admin/products/${pId}/units/${uId}/prices/${priceItem.id}`)
    if (res.product) {
      selectedProductForPrice.value = res.product
      const updatedUnit = res.product.units?.find((u: any) => u.id === uId)
      if (updatedUnit) selectedUnitForPrice.value = updatedUnit
      if (editing.value && editing.value.id === pId) {
        editing.value = res.product
        const formUnit = form.units.find((u: any) => u.id === uId)
        if (formUnit && updatedUnit) {
          formUnit.prices = updatedUnit.prices || []
        }
      }
    }
    emit('refresh')
  } catch (e: any) {
    alert(e.data?.message || e.message || 'Failed to delete price record')
  } finally {
    isSavingPrice.value = false
  }
}

// Forms state
const form = reactive({ 
  name: '', 
  sku: '',
  unit: '', 
  price: null as number | null, 
  stock: 0,
  image: null as string | null,
  category_id: null as number | null,
  units: [] as { id?: number | null; name: string; price: number; mt_price?: number; carton_factor: number; stock: number; prices?: any[] }[]
})
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const categoryForm = reactive({ name: '' })

const filteredProducts = computed(() => {
  return props.products.filter(p => {
    const matchesCategory = selectedCategory.value === null || p.category_id === selectedCategory.value
    const matchesSearch = p.name.toLowerCase().includes(props.searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

function openModal(p?: any) {
  editing.value = p || null
  activeTab.value = 'general'
  form.name = p?.name || ''
  form.sku = p?.sku || ''
  form.image = p?.image || null
  form.category_id = p?.category_id || null
  imageFile.value = null
  imagePreview.value = null
  
  if (p?.units && p.units.length > 0) {
    form.units = JSON.parse(JSON.stringify(p.units))
  } else {
    form.units = [{ id: null, name: 'CTN', price: 0, carton_factor: 1.0, stock: 0 }]
  }
  showModal.value = true
}

function openCategoryModal(c?: any) {
  editingCategory.value = c || null
  categoryForm.name = c?.name || ''
  showCategoryModal.value = true
}

function addUnit() { 
  form.units.push({ id: null, name: '', price: 0, mt_price: 0, carton_factor: 1.0, stock: 0 }) 
}

async function saveProduct() {
  try {
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('sku', form.sku || '')
    formData.append('category_id', form.category_id ? String(form.category_id) : '')
    
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    const firstUnit = form.units[0]
    if (firstUnit) {
      formData.append('unit', firstUnit.name)
      formData.append('price', String(firstUnit.price))
      if (firstUnit.mt_price) formData.append('mt_price', String(firstUnit.mt_price))
      formData.append('stock', String(firstUnit.stock))
    }

    form.units.forEach((u, idx) => {
      if (u.id) formData.append(`units[${idx}][id]`, String(u.id))
      formData.append(`units[${idx}][name]`, u.name)
      formData.append(`units[${idx}][price]`, String(u.price))
      if (u.mt_price) formData.append(`units[${idx}][mt_price]`, String(u.mt_price))
      formData.append(`units[${idx}][stock]`, String(u.stock))
      formData.append(`units[${idx}][carton_factor]`, String(u.carton_factor))
    })

    if (editing.value) {
      formData.append('_method', 'PUT')
      await api.post(`/admin/products/${editing.value.id}`, formData)
    } else {
      await api.post('/admin/products', formData)
    }
    emit('refresh')
    showModal.value = false
  } catch (e: any) { 
    console.error('Save failed:', e)
    alert(e.data?.message || e.message || 'Error saving product') 
  }
}

async function saveCategory() {
  try {
    if (editingCategory.value) {
      await api.put(`/admin/categories/${editingCategory.value.id}`, categoryForm)
    } else {
      await api.post('/admin/categories', categoryForm)
    }
    emit('refresh')
    showCategoryModal.value = false
  } catch (e: any) { 
    alert(e.data?.message || 'Error saving category') 
  }
}

async function deleteCategory(id: number) {
  if (!confirm('Delete this collection? Items will be moved to Uncategorized.')) return
  try {
    await api.del(`/admin/categories/${id}`)
    if (selectedCategory.value === id) selectedCategory.value = null
    emit('refresh')
  } catch (e) {
    alert('Failed to delete category')
  }
}

async function deleteProduct(id: number) {
  if (!confirm('Permanently delete this product?')) return
  try {
    await api.del(`/admin/products/${id}`)
    emit('refresh')
  } catch (e) {
    alert('Failed to delete product')
  }
}

function handleImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

function clearImage() {
  imageFile.value = null
  imagePreview.value = null
  form.image = null
}

defineExpose({
  openModal,
  openCategoryModal
})
</script>

<style scoped>
.input-field-modern-admin {
  @apply w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 transition-all 
         placeholder:text-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none tracking-wide;
}

.input-field {
  @apply w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-all;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors;
}

.btn-secondary {
  @apply px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.label {
  @apply font-black uppercase tracking-[0.2em] mb-2 block;
}
</style>
