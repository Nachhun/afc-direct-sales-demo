<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">Store Attributes</h1>
        <p class="text-slate-500 text-sm mt-1">Manage Trade Classes, Channels, and Store Profiles.</p>
      </div>
      <button v-if="activeTab === 'trade_classes'" @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all shadow-lg flex items-center gap-2">
        <Icon name="heroicons:plus" class="w-4 h-4" /> Add Class
      </button>
      <button v-else-if="activeTab === 'store_types'" @click="openSimpleModal(undefined, 'store_types')" class="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all shadow-lg flex items-center gap-2">
        <Icon name="heroicons:plus" class="w-4 h-4" /> Add Channel
      </button>
      <button v-else-if="activeTab === 'store_profiles'" @click="openSimpleModal(undefined, 'store_profiles')" class="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all shadow-lg flex items-center gap-2">
        <Icon name="heroicons:plus" class="w-4 h-4" /> Add Profile
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-6 p-1 bg-slate-100 rounded-2xl w-max overflow-x-auto">
      <button @click="activeTab = 'trade_classes'" :class="['px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap', activeTab === 'trade_classes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">Trade Classes</button>
      <button @click="activeTab = 'store_types'" :class="['px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap', activeTab === 'store_types' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">Channels</button>
      <button @click="activeTab = 'store_profiles'" :class="['px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap', activeTab === 'store_profiles' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']">Store Profiles</button>
    </div>

    <!-- Main Content -->
    <div class="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden min-h-[50vh] p-6">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
      <div v-else>
        
        <!-- Trade Classes -->
        <div v-if="activeTab === 'trade_classes'" class="space-y-6">
          <div v-for="l1 in sortedL1s" :key="l1.id" class="border border-slate-200 rounded-2xl p-4 bg-slate-50">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-black text-slate-900 flex items-center gap-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs">L1</span>
                {{ l1.name }} <span v-if="l1.value" class="text-xs text-slate-400 font-bold">(Val: {{ l1.value }})</span>
              </h2>
              <div class="flex items-center gap-2">
                <button @click="openModal(l1)" class="p-1.5 text-slate-400 hover:text-blue-600 bg-white rounded-lg border shadow-sm transition-colors"><Icon name="heroicons:pencil-square" class="w-4 h-4" /></button>
                <button @click="deleteClass(l1)" class="p-1.5 text-slate-400 hover:text-red-600 bg-white rounded-lg border shadow-sm transition-colors"><Icon name="heroicons:trash" class="w-4 h-4" /></button>
                <button @click="openModal(undefined, 2, l1.id)" class="ml-2 px-3 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase rounded-lg hover:bg-slate-100 transition-colors">Add L2</button>
              </div>
            </div>
            
            <!-- L2s -->
            <div v-if="getChildren(l1.id).length > 0" class="space-y-4 pl-8 border-l-2 border-slate-200 ml-4">
              <div v-for="l2 in getChildren(l1.id)" :key="l2.id" class="border border-slate-200 rounded-xl p-3 bg-white">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span class="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] uppercase font-black tracking-widest">L2</span>
                    {{ l2.name }} <span v-if="l2.value" class="text-[10px] text-slate-400 font-bold">(Val: {{ l2.value }})</span>
                  </h3>
                  <div class="flex items-center gap-2">
                    <button @click="openModal(l2)" class="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg border transition-colors"><Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" /></button>
                    <button @click="deleteClass(l2)" class="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg border transition-colors"><Icon name="heroicons:trash" class="w-3.5 h-3.5" /></button>
                    <button @click="openModal(undefined, 3, l2.id)" class="ml-2 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[9px] font-black uppercase rounded-lg hover:bg-slate-100 transition-colors">Add L3</button>
                  </div>
                </div>
                
                <!-- L3s -->
                <div v-if="getChildren(l2.id).length > 0" class="mt-3 flex flex-wrap gap-2 pl-6">
                  <div v-for="l3 in getChildren(l2.id)" :key="l3.id" class="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span class="text-xs font-bold text-slate-700">{{ l3.name }} <span v-if="l3.value" class="text-slate-400">({{ l3.value }})</span></span>
                    <div class="flex items-center gap-1 border-l border-slate-200 pl-2 ml-1">
                      <button @click="openModal(l3)" class="text-slate-400 hover:text-blue-600"><Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" /></button>
                      <button @click="deleteClass(l3)" class="text-slate-400 hover:text-red-600"><Icon name="heroicons:trash" class="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Store Types (Order Channels) -->
        <div v-else-if="activeTab === 'store_types'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="item in channelStoreTypes" :key="item.id" class="flex flex-col justify-between p-5 border border-slate-200 rounded-2xl bg-white hover:border-indigo-300 hover:shadow-md transition-all gap-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div :class="item.type_category === 'wholesale' ? 'bg-purple-100 text-purple-600' : (item.type_category === 'modern_trade' ? 'bg-emerald-100 text-emerald-600' : (item.type_category === 'new_store' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-700'))" class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                    <Icon :name="item.icon || 'heroicons:building-storefront'" class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-black text-slate-900 text-sm">{{ item.name }}</span>
                      <span :class="item.type_category === 'wholesale' ? 'bg-purple-100 text-purple-700' : (item.type_category === 'modern_trade' ? 'bg-emerald-100 text-emerald-700' : (item.type_category === 'new_store' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'))" class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        {{ (item.type_category || 'regular').replace('_', ' ') }}
                      </span>
                    </div>
                    <p class="text-[10px] text-slate-500 font-bold mt-0.5">{{ item.description || 'Order form channel store type' }}</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-1">
                  <button @click="openSimpleModal(item, 'store_types')" class="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-colors" title="Edit Channel"><Icon name="heroicons:pencil-square" class="w-4 h-4" /></button>
                  <button @click="deleteSimple(item)" class="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-colors" title="Delete Channel"><Icon name="heroicons:trash" class="w-4 h-4" /></button>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-100">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Icon name="heroicons:clock" class="w-3.5 h-3.5 text-emerald-500" />
                  Freq: {{ item.visit_frequency || 'F1' }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="channelStoreTypes.length === 0" class="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border border-dashed border-slate-200 rounded-2xl">No Channels found</div>
        </div>

        <!-- Store Profiles (Tiers) -->
        <div v-else-if="activeTab === 'store_profiles'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="item in ratingStoreProfiles" :key="item.id" class="flex flex-col justify-between p-5 border border-slate-200 rounded-2xl bg-slate-50 hover:border-purple-300 hover:shadow-md transition-all gap-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                    <Icon :name="item.icon || 'heroicons:building-storefront'" class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-black text-slate-900 text-sm">{{ item.name }}</span>
                      <span class="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        Rating Tier
                      </span>
                    </div>
                    <p class="text-[10px] text-slate-500 font-bold mt-0.5">{{ item.description || 'Store classification profile tier' }}</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-1">
                  <button @click="openSimpleModal(item, 'store_profiles')" class="p-2 text-slate-400 hover:text-purple-600 bg-white rounded-xl border border-slate-200 shadow-2xs transition-colors" title="Edit Profile Tier"><Icon name="heroicons:pencil-square" class="w-4 h-4" /></button>
                  <button @click="deleteSimple(item)" class="p-2 text-slate-400 hover:text-red-600 bg-white rounded-xl border border-slate-200 shadow-2xs transition-colors" title="Delete Profile Tier"><Icon name="heroicons:trash" class="w-4 h-4" /></button>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Icon name="heroicons:clock" class="w-3.5 h-3.5 text-emerald-500" />
                  Freq: {{ item.visit_frequency || 'F1' }}
                </span>
                <div class="flex gap-2">
                  <span v-if="Number(item.cod_discount_percent) > 0" class="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase tracking-wider">COD: {{ item.cod_discount_percent }}%</span>
                  <span v-if="Number(item.credit_discount_percent) > 0" class="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">Credit: {{ item.credit_discount_percent }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="ratingStoreProfiles.length === 0" class="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs border border-dashed border-slate-200 rounded-2xl">No Store Profiles found</div>
        </div>

      </div>
    </div>

    <!-- Trade Class Modal -->
    <div v-if="modal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="text-lg font-black text-slate-900">{{ modal.isEdit ? 'Edit' : 'Add' }} Trade Class</h3>
          <button @click="modal.show = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>
        <form @submit.prevent="saveClass" class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Level</label>
            <select v-model="modal.form.level" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none">
              <option :value="1">Level 1 (Category)</option>
              <option :value="2">Level 2 (Business Type)</option>
              <option :value="3">Level 3 (Sub Type)</option>
            </select>
          </div>
          
          <div v-if="modal.form.level > 1" class="space-y-2">
            <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Parent Class (L{{ modal.form.level - 1 }})</label>
            <select v-model="modal.form.parent_id" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none" required>
              <option value="" disabled>Select Parent</option>
              <option v-for="p in getParentOptions(modal.form.level - 1)" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Name *</label>
            <input v-model="modal.form.name" type="text" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium" placeholder="e.g. Baby Shop">
          </div>
          
          <div class="space-y-2">
            <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Value (Optional)</label>
            <input v-model="modal.form.value" type="number" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium" placeholder="e.g. 1">
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" @click="modal.show = false" class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors">Cancel</button>
            <button type="submit" :disabled="saving" class="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center">
              {{ saving ? 'Saving...' : 'Save Class' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Simple Modal (Store Profiles) -->
    <div v-if="simpleModal.show" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="text-lg font-black text-slate-900">{{ simpleModal.isEdit ? 'Edit' : 'Add' }} {{ activeTab === 'store_profiles' ? 'Store Profile' : 'Channel' }}</h3>
          <button @click="simpleModal.show = false" class="text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>
        <form @submit.prevent="saveSimple" class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">{{ activeTab === 'store_profiles' ? 'Profile Name *' : 'Channel Name *' }}</label>
            <input v-model="simpleModal.form.name" type="text" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium" :placeholder="activeTab === 'store_profiles' ? 'e.g. $5 Profile' : 'e.g. Pharmacy Retail'">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div v-if="activeTab !== 'store_profiles'" class="space-y-2">
              <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Type Category *</label>
              <select v-model="simpleModal.form.type_category" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer">
                <option value="regular">🏥 Regular / Pharmacy Retail</option>
                <option value="new_store">✨ New Store</option>
                <option value="wholesale">📦 Wholesale</option>
                <option value="modern_trade">🏪 Modern Trade (MT)</option>
              </select>
            </div>

            <div :class="activeTab === 'store_profiles' ? 'col-span-2' : ''" class="space-y-2">
              <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Visit Frequency *</label>
              <input v-model="simpleModal.form.visit_frequency" type="text" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium" placeholder="e.g. F1">
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Description / Subtitle</label>
            <input v-model="simpleModal.form.description" type="text" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 placeholder:font-medium" placeholder="e.g. Standard retail customer">
          </div>

          <div class="space-y-2">
            <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Icon</label>
            <select v-model="simpleModal.form.icon" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer">
              <option value="heroicons:building-storefront">🏬 Storefront (Building Storefront)</option>
              <option value="heroicons:sparkles">✨ Sparkles (New Store)</option>
              <option value="heroicons:cube">📦 Cube (Wholesale)</option>
              <option value="heroicons:tag">🏷️ Tag (Modern Trade)</option>
              <option value="heroicons:shopping-bag">🛍️ Shopping Bag</option>
            </select>
          </div>
          
          <div v-if="activeTab === 'store_profiles'" class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">COD Discount (%)</label>
              <input v-model.number="simpleModal.form.cod_discount_percent" type="number" step="0.01" min="0" max="100" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" placeholder="0.00">
            </div>
            <div class="space-y-2">
              <label class="text-[11px] text-slate-600 font-black uppercase tracking-widest pl-1">Credit Discount (%)</label>
              <input v-model.number="simpleModal.form.credit_discount_percent" type="number" step="0.01" min="0" max="100" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" placeholder="0.00">
            </div>
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" @click="simpleModal.show = false" class="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black uppercase tracking-widest rounded-xl transition-colors">Cancel</button>
            <button type="submit" :disabled="saving" class="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center">
              {{ saving ? 'Saving...' : (activeTab === 'store_profiles' ? 'Save Profile' : 'Save Channel') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

definePageMeta({ layout: 'admin' })
const api = useApi()

const activeTab = ref('trade_classes') // 'trade_classes', 'store_types', 'store_profiles'

const classes = ref<any[]>([])
const storeProfiles = ref<any[]>([])
const loading = ref(true)

const sortedL1s = computed(() => {
  return classes.value.filter(c => c.level === 1).sort((a, b) => a.name.localeCompare(b.name))
})

const channelStoreTypes = computed(() => {
  return storeProfiles.value.filter(s => {
    const name = (s.name || '').toLowerCase()
    return s.type_category !== 'profile' && !name.includes('$') && !name.includes('profile')
  })
})

const ratingStoreProfiles = computed(() => {
  return storeProfiles.value.filter(s => {
    const name = (s.name || '').toLowerCase()
    return s.type_category === 'profile' || name.includes('$') || name.includes('profile')
  })
})

function getChildren(parentId: number) {
  return classes.value.filter(c => c.parent_id === parentId).sort((a, b) => a.name.localeCompare(b.name))
}

function getParentOptions(level: number) {
  return classes.value.filter(c => c.level === level)
}

async function fetchData() {
  loading.value = true
  try {
    const [c, s] = await Promise.all([
      api.get('/admin/trade-classes'),
      api.get('/store-types')
    ])
    classes.value = (c as any[]) || []
    storeProfiles.value = (s as any[]) || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// --- Trade Classes Logic ---
const saving = ref(false)
const modal = reactive({
  show: false,
  isEdit: false,
  id: null as number | null,
  form: {
    name: '',
    level: 1,
    parent_id: null as number | null,
    value: null as number | null
  }
})

function openModal(item?: any, defaultLevel = 1, defaultParentId?: number) {
  if (item) {
    modal.isEdit = true
    modal.id = item.id
    modal.form = {
      name: item.name,
      level: item.level,
      parent_id: item.parent_id || null,
      value: item.value || null
    }
  } else {
    modal.isEdit = false
    modal.id = null
    modal.form = {
      name: '',
      level: defaultLevel,
      parent_id: defaultParentId || null,
      value: null
    }
  }
  modal.show = true
}

async function saveClass() {
  saving.value = true
  try {
    const payload: Record<string, any> = { ...modal.form }
    if (!payload.parent_id) payload.parent_id = null
    if (!payload.value) payload.value = null
    
    if (modal.isEdit && modal.id) {
      await api.put(`/admin/trade-classes/${modal.id}`, payload)
    } else {
      await api.post('/admin/trade-classes', payload)
    }
    await fetchData()
    modal.show = false
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

async function deleteClass(item: any) {
  if (!confirm(`Are you sure you want to delete ${item.name}? This will delete all its sub-classes.`)) return
  try {
    await api.del(`/admin/trade-classes/${item.id}`)
    await fetchData()
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to delete')
  }
}

// --- Store Profiles / Types Logic ---
const simpleModal = reactive({
  show: false,
  isEdit: false,
  id: null as number | null,
  form: {
    name: '',
    type_category: 'regular',
    description: '',
    icon: 'heroicons:building-storefront',
    visit_frequency: 'F1',
    cod_discount_percent: 0.00,
    credit_discount_percent: 0.00,
    is_active: true
  }
})

function openSimpleModal(item?: any, targetTab?: string) {
  const currentTab = targetTab || activeTab.value
  if (item) {
    simpleModal.isEdit = true
    simpleModal.id = item.id
    simpleModal.form.name = item.name
    simpleModal.form.type_category = currentTab === 'store_profiles' ? 'profile' : (item.type_category || 'regular')
    simpleModal.form.description = item.description || ''
    simpleModal.form.icon = item.icon || 'heroicons:building-storefront'
    simpleModal.form.visit_frequency = item.visit_frequency || 'F1'
    simpleModal.form.cod_discount_percent = Number(item.cod_discount_percent) || 0.00
    simpleModal.form.credit_discount_percent = Number(item.credit_discount_percent) || 0.00
    simpleModal.form.is_active = item.is_active !== false
  } else {
    simpleModal.isEdit = false
    simpleModal.id = null
    simpleModal.form.name = currentTab === 'store_profiles' ? '$5 Store' : ''
    simpleModal.form.type_category = currentTab === 'store_profiles' ? 'profile' : 'regular'
    simpleModal.form.description = currentTab === 'store_profiles' ? 'Store rating tier profile' : 'Order channel store type'
    simpleModal.form.icon = 'heroicons:building-storefront'
    simpleModal.form.visit_frequency = 'F1'
    simpleModal.form.cod_discount_percent = 0.00
    simpleModal.form.credit_discount_percent = 0.00
    simpleModal.form.is_active = true
  }
  simpleModal.show = true
}

async function saveSimple() {
  saving.value = true
  try {
    const payload = {
      ...simpleModal.form,
      cod_discount_percent: Number(simpleModal.form.cod_discount_percent) || 0,
      credit_discount_percent: Number(simpleModal.form.credit_discount_percent) || 0
    }
    if (simpleModal.isEdit && simpleModal.id) {
      await api.put(`/admin/store-types/${simpleModal.id}`, payload)
    } else {
      await api.post('/admin/store-types', payload)
    }
    await fetchData()
    simpleModal.show = false
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

async function deleteSimple(item: any) {
  if (!confirm(`Are you sure you want to delete ${item.name}?`)) return
  try {
    await api.del(`/admin/store-types/${item.id}`)
    await fetchData()
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to delete')
  }
}
</script>
