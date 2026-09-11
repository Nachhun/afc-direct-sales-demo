<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-black text-slate-900">{{ authStore.isAdmin ? 'Active Deliveries' : 'My Deliveries' }}</h1>
        <p class="text-slate-500 text-sm mt-1">{{ authStore.isAdmin ? 'Track active deliveries assigned to couriers.' : 'Your assigned orders to deliver.' }}</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink to="/admin/stores" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all active:scale-95">
          <Icon name="heroicons:building-storefront" class="w-4 h-4" />
          <span>Stores</span>
        </NuxtLink>
        <button @click="fetchDeliveries" 
          class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 group" title="Refresh Deliveries">
          <Icon name="heroicons:arrow-path" class="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- 🚨 OVERDUE ALERT BANNER (Courier view) -->
    <div v-if="overdueCount > 0"
      class="relative overflow-hidden rounded-2xl border-2 border-red-300 bg-red-50 px-4 py-3 flex items-center gap-3 shadow-md shadow-red-100 mb-4">
      <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 rounded-l-2xl"></div>
      <div class="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0 ml-1.5">
        <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-black text-red-700 leading-tight">
          ⚠️ You have {{ overdueCount }} overdue {{ overdueCount === 1 ? 'delivery' : 'deliveries' }}!
        </p>
        <p class="text-[10px] text-red-500 font-bold mt-0.5">Please deliver these orders immediately.</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Delivery Groups (by Plan) -->
    <div v-else class="space-y-4">
      <div v-for="group in groupedDeliveries" :key="group.planId || 'unplanned'" 
        class="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm transition-all"
        :class="{ 'ring-2 ring-blue-500/20 shadow-md': expandedPlan === group.planId }">
        
        <!-- Plan Header (Click to Expand) -->
        <button @click="togglePlan(group.planId)" 
          class="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors text-left">
           <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                :class="expandedPlan === group.planId ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'">
                <Icon :name="group.planId ? 'heroicons:map' : 'heroicons:queue-list'" class="w-6 h-6" />
              </div>
              <div>
                <h2 class="font-black text-slate-900 leading-tight uppercase tracking-tight text-sm">{{ group.planName }}</h2>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ group.items.length }} Orders</p>
                  <span v-if="group.planDate" class="w-1 h-1 rounded-full bg-slate-300"></span>
                  <p v-if="group.planDate" class="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                    {{ new Date(group.planDate).toLocaleDateString() }}
                  </p>
                </div>
              </div>
           </div>
           <Icon :name="expandedPlan === group.planId ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" 
             class="w-5 h-5 text-slate-400" />
        </button>

        <!-- Orders in this Plan (Visible when expanded) -->
        <Transition name="expand">
          <div v-if="expandedPlan === group.planId" class="px-6 pb-6 space-y-4 border-t border-slate-50 pt-6 bg-slate-50/50">
            <div v-if="group.planId" class="mb-4">
              <NuxtLink :to="`/delivery/map?plan_id=${group.planId}`" class="w-full py-3 bg-white border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-blue-50 transition-all">
                <Icon name="heroicons:map" class="w-4 h-4" /> View Full Route Map
              </NuxtLink>
            </div>

            <div v-for="d in group.items" :key="d.id"
              class="bg-white border rounded-[24px] p-4 shadow-sm space-y-3"
              :class="d.is_overdue ? 'border-red-200' : 'border-slate-100'">

              <!-- Shop + Status -->
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <p class="font-black text-slate-900 truncate">{{ d.order?.shop_name }}</p>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">#{{ d.order_id }} · {{ d.order?.customer_address }}</p>
                </div>
                <span :class="{
                  'bg-amber-50 text-amber-600 border-amber-100': d.status === 'pending',
                  'bg-blue-50 text-blue-600 border-blue-100': d.status === 'in_transit',
                  'bg-emerald-50 text-emerald-600 border-emerald-100': d.status === 'delivered',
                  'bg-orange-50 text-orange-600 border-orange-100': d.status === 'delivered_with_issue',
                  'bg-red-50 text-red-600 border-red-100': d.status === 'shop_closed',
                }" class="px-2 py-0.5 rounded text-[8px] font-black uppercase border shrink-0">
                  {{ d.status.replace(/_/g, ' ') }}
                </span>
              </div>

              <!-- Location -->
              <div class="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mb-2">
                <Icon name="heroicons:map-pin" class="w-3.5 h-3.5" />
                <span class="truncate">{{ d.order?.customer_address }}</span>
              </div>

              <!-- Order Summary (Click for Pop-up) -->
              <div @click="openDetailModal(d)" class="bg-slate-50 rounded-xl p-3 mb-3 cursor-pointer hover:bg-slate-100 transition-all active:scale-[0.98]">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Items ({{ d.order?.items?.length || 0 }})</span>
                    <Icon name="heroicons:information-circle" class="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <span class="text-[11px] font-black text-blue-600">${{ d.order?.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
                </div>
                
                <!-- Quick Preview (First 2 items) -->
                <div class="space-y-1">
                  <div v-for="item in d.order?.items?.slice(0, 2)" :key="item.id" class="flex justify-between items-start gap-2 text-[9px] opacity-60">
                    <span class="text-slate-600 truncate">{{ item.product?.name }}</span>
                    <span class="text-slate-900 font-bold shrink-0">{{ item.qty }} {{ item.unit || 'pc' }}</span>
                  </div>
                  <p v-if="(d.order?.items?.length || 0) > 2" class="text-[8px] text-slate-400 font-bold italic mt-1">+ {{ (d.order?.items?.length || 0) - 2 }} more items... Tap to view</p>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <template v-if="['pending', 'in_transit'].includes(d.status)">
                  <button @click="completeDelivery(d.id)" :disabled="actionLoading === d.id" class="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-1">
                    <Icon v-if="actionLoading === d.id" name="heroicons:arrow-path" class="w-3 h-3 animate-spin" />
                    Complete
                  </button>
                  <button @click="markShopClosed(d.id)" :disabled="actionLoading === d.id" class="w-full bg-red-100 text-red-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-200 transition-all flex items-center justify-center gap-1">
                    <Icon v-if="actionLoading === d.id" name="heroicons:arrow-path" class="w-3 h-3 animate-spin" />
                    Closed
                  </button>
                  <button @click="openIssueModal(d)" class="w-full bg-orange-100 text-orange-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-200 transition-all flex items-center justify-center gap-1">
                    <Icon name="heroicons:exclamation-triangle" class="w-3 h-3" /> Issue
                  </button>
                  <button @click="openCancelModal(d)" :disabled="actionLoading === d.id" class="w-full bg-rose-100 text-rose-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-200 transition-all flex items-center justify-center gap-1">
                    <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button @click="openInGoogleMaps(d.order?.location)" class="col-span-2 w-full bg-blue-50 text-blue-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border border-blue-100">
                    <Icon name="logos:google-maps" class="w-4 h-4" /> Google Maps
                  </button>
                </template>

                <template v-else>
                   <NuxtLink :to="`/delivery/map/${d.id}`" class="col-span-2 w-full bg-slate-100 text-slate-700 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-1">
                    View Details
                  </NuxtLink>
                </template>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div v-if="deliveries.length === 0" class="text-center py-16 text-slate-300">
        <Icon name="heroicons:truck" class="w-12 h-12 mx-auto mb-3" />
        <p class="font-bold text-sm uppercase tracking-widest">No deliveries assigned</p>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-10" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-10">
        <div v-if="showDetailModal" class="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showDetailModal = false"></div>
          
          <div class="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-slide-up">
            <!-- Modal Header -->
            <div class="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
              <div>
                <h3 class="text-lg font-black text-slate-900">{{ selectedDelivery?.order?.shop_name }}</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Order #{{ selectedDelivery?.order_id }}</p>
              </div>
              <button @click="showDetailModal = false" class="p-2 hover:bg-slate-200 rounded-full transition-all">
                <Icon name="heroicons:x-mark" class="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto p-6 space-y-6">
              <!-- Info Section -->
              <div class="grid grid-cols-1 gap-4">
                <div v-if="selectedDelivery?.order?.contact" class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Icon name="heroicons:phone" class="w-5 h-5" />
                  </div>
                  <div class="flex-1">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</p>
                    <a :href="`tel:${selectedDelivery?.order?.contact}`" class="text-sm font-black text-blue-600 hover:underline">
                      {{ selectedDelivery?.order?.contact }}
                    </a>
                  </div>
                  <a :href="`tel:${selectedDelivery?.order?.contact}`" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-blue-200">Call</a>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                    <Icon name="heroicons:map-pin" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</p>
                    <p class="text-sm font-bold text-slate-700">{{ selectedDelivery?.order?.customer_address }}</p>
                  </div>
                </div>
              </div>

              <!-- Products Section -->
              <div>
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest">Product List</h4>
                  <span class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{{ selectedDelivery?.order?.items?.length }} Items</span>
                </div>
                <div class="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div v-for="item in selectedDelivery?.order?.items" :key="item.id" class="flex justify-between items-start gap-4">
                    <div class="flex-1">
                      <p class="text-sm font-bold text-slate-700 leading-tight">{{ item.product?.name }}</p>
                      <p v-if="item.product?.sku" class="text-[10px] text-slate-400 mt-0.5">SKU: {{ item.product.sku }}</p>
                    </div>
                    <div class="text-right shrink-0">
                      <p class="text-sm font-black text-slate-900">{{ item.qty }} {{ item.unit || 'pc' }}</p>
                      <p class="text-[10px] text-slate-400 font-bold">${{ (item.unit_price * item.qty).toLocaleString() }}</p>
                    </div>
                  </div>
                  
                  <div class="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span class="text-xs font-black text-slate-900 uppercase tracking-widest">Total Amount</span>
                    <span class="text-xl font-black text-blue-600">${{ selectedDelivery?.order?.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 bg-slate-50 border-t border-slate-100">
              <button @click="showDetailModal = false" class="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all">
                Close Details
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Issue Reporting Modal -->
    <Teleport to="body">
      <div v-if="showIssueModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-orange-50 rounded-[32px] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden relative animate-slide-up">
          
          <!-- Fixed Header -->
          <div class="p-6 pb-2 shrink-0 bg-orange-50 z-10 border-b border-orange-100/50">
            <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-orange-500" />
              Report Issue
            </h3>

            <!-- Issue Category Selection -->
            <div class="flex gap-4 mb-2 bg-white p-3 rounded-2xl border border-orange-100 shadow-sm">
              <label class="flex-1 flex items-center gap-2 cursor-pointer group">
                <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                  :class="issueType === 'shortage' ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 group-hover:border-orange-300'">
                  <Icon v-if="issueType === 'shortage'" name="heroicons:check" class="w-3.5 h-3.5" />
                </div>
                <input type="radio" v-model="issueType" value="shortage" class="hidden" />
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Under</span>
              </label>
              <div class="w-px h-5 bg-slate-100"></div>
              <label class="flex-1 flex items-center gap-2 cursor-pointer group">
                <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                  :class="issueType === 'partial' ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 group-hover:border-orange-300'">
                  <Icon v-if="issueType === 'partial'" name="heroicons:check" class="w-3.5 h-3.5" />
                </div>
                <input type="radio" v-model="issueType" value="partial" class="hidden" />
                <span class="text-[11px] font-black uppercase tracking-widest text-slate-700">Over</span>
              </label>
            </div>
          </div>

          <!-- Scrollable Body -->
          <div class="p-6 overflow-y-auto flex-1">
            <p class="text-[9px] font-black text-orange-600 uppercase mb-2">Adjust Quantities</p>
            
            <!-- Item Quantity Input -->
            <div class="space-y-3 mb-6">
               <div v-for="item in (selectedDelivery?.order?.items || [])" :key="item.id" 
                 class="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <div class="flex items-center justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <p class="text-[11px] font-black text-slate-800 truncate mb-0.5">{{ item.product?.name }}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Ordered: {{ item.qty }} {{ item.unit || 'pc' }}</p>
                    </div>
                    <div class="w-24">
                      <label class="text-[8px] font-black text-slate-400 uppercase block mb-1">Delivered Qty</label>
                      <input type="number" v-model.number="itemQuantities[item.id]" 
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 transition-all"
                        placeholder="0" />
                    </div>
                  </div>
               </div>
            </div>

            <p class="text-[9px] font-black text-orange-600 uppercase mb-1">Additional Note</p>
            <textarea v-model="issueNote" rows="3" class="w-full p-3 bg-white border border-orange-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-orange-400" placeholder="e.g. Broken packaging..."></textarea>
          </div>
          
          <!-- Fixed Footer Buttons -->
          <div class="p-6 pt-4 shrink-0 bg-white border-t border-orange-100 flex gap-3">
            <button @click="submitIssue" :disabled="actionLoading === selectedDelivery?.id" 
              class="flex-1 py-4 bg-orange-600 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center justify-center">
              <Icon v-if="actionLoading === selectedDelivery?.id" name="heroicons:arrow-path" class="w-4 h-4 animate-spin inline mr-2" />
              Submit Issue
            </button>
            <button @click="showIssueModal = false" 
              class="px-8 py-4 bg-white border border-orange-200 text-orange-600 text-[12px] font-black uppercase tracking-widest rounded-2xl active:bg-orange-50 transition-all">
              Cancel
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- Customer Cancel Modal -->
    <Teleport to="body">
      <div v-if="showCancelModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative animate-slide-up">
          
          <!-- Header -->
          <div class="p-6 pb-4 bg-rose-50 border-b border-rose-100 flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Icon name="heroicons:x-circle" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900">Customer Cancel</h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Order #{{ selectedDelivery?.order_id }} · {{ selectedDelivery?.order?.shop_name }}</p>
              </div>
            </div>
            <button @click="showCancelModal = false" class="p-2 hover:bg-rose-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <p class="text-xs font-bold text-slate-600">
              Please select or enter the reason why the customer is cancelling this order:
            </p>

            <!-- Quick Reasons -->
            <div class="space-y-2">
              <label v-for="r in cancelReasons" :key="r" 
                class="flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all"
                :class="cancelReason === r ? 'border-rose-500 bg-rose-50/50 ring-1 ring-rose-500/20' : 'border-slate-200 hover:border-rose-200 bg-white'">
                <input type="radio" v-model="cancelReason" :value="r" class="text-rose-600 focus:ring-rose-500 w-4 h-4" />
                <span class="text-xs font-bold text-slate-800">{{ r }}</span>
              </label>
            </div>

            <!-- Custom Note -->
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 pl-1">Additional Details (Optional)</label>
              <textarea v-model="customCancelNote" rows="2" 
                placeholder="e.g. Shop owner was not present and staff refused to accept..."
                class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-slate-400"></textarea>
            </div>

            <!-- Notice -->
            <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
              <Icon name="heroicons:information-circle" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p class="text-[10px] font-bold text-amber-800 leading-tight">
                Cancelling will return items back to inventory stock and notify administrators immediately.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 pt-2 border-t border-slate-100 flex gap-3 bg-slate-50/50">
            <button @click="submitCustomerCancel" :disabled="actionLoading === selectedDelivery?.id"
              class="flex-1 py-3.5 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all flex items-center justify-center gap-1.5">
              <Icon v-if="actionLoading === selectedDelivery?.id" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <span>Confirm Cancel</span>
            </button>
            <button @click="showCancelModal = false"
              class="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">
              Back
            </button>
          </div>

        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'delivery' })
const api = useApi()
const authStore = useAuthStore()
const expandedPlan = ref<number | null | string>(null)
const actionLoading = ref<number | null>(null)

// Issue Modal State
const showIssueModal = ref(false)
const showDetailModal = ref(false)
const showCancelModal = ref(false)
const selectedDelivery = ref<any>(null)
const issueNote = ref('')
const issueType = ref<'shortage' | 'partial'>('shortage')
const itemQuantities = ref<Record<number, number>>({})

// Customer Cancel State
const cancelReasons = [
  'Customer changed mind / refused order',
  'Out of budget / Cannot pay COD',
  'Wrong order / already received before',
  'Shop closed permanently / relocated',
  'Other reason'
]
const cancelReason = ref('Customer changed mind / refused order')
const customCancelNote = ref('')

function openCancelModal(d: any) {
  selectedDelivery.value = d
  cancelReason.value = 'Customer changed mind / refused order'
  customCancelNote.value = ''
  showCancelModal.value = true
}

async function submitCustomerCancel() {
  if (!selectedDelivery.value) return

  const fullReason = customCancelNote.value.trim()
    ? `${cancelReason.value} - ${customCancelNote.value.trim()}`
    : cancelReason.value

  actionLoading.value = selectedDelivery.value.id
  try {
    await api.put(`/deliveries/${selectedDelivery.value.id}/customer-cancel`, {
      reason: fullReason
    })
    showCancelModal.value = false
    await fetchDeliveries()
  } catch (e: any) {
    alert(e.message || e.data?.message || 'Failed to cancel order')
  } finally {
    actionLoading.value = null
  }
}

// Watch item quantities to prevent negative or over-delivery
watch(itemQuantities, (newVals) => {
  if (!selectedDelivery.value?.order?.items) return
  selectedDelivery.value.order.items.forEach((i: any) => {
    const val = newVals[i.id]
    if (val !== undefined) {
      if (val > i.qty) itemQuantities.value[i.id] = i.qty
      if (val < 0) itemQuantities.value[i.id] = 0
    }
  })
}, { deep: true })

function openDetailModal(d: any) {
  selectedDelivery.value = d
  showDetailModal.value = true
}

function openIssueModal(d: any) {
  selectedDelivery.value = d
  issueNote.value = ''
  issueType.value = 'shortage'
  itemQuantities.value = {}
  if (d.order?.items) {
    d.order.items.forEach((i: any) => {
      itemQuantities.value[i.id] = i.qty
    })
  }
  showIssueModal.value = true
}


function openInGoogleMaps(location: string | undefined) {
  if (!location) {
    alert('No GPS location available for this shop')
    return
  }
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.trim()}`, '_blank')
}

const togglePlan = (id: number | null | string) => {
  if (expandedPlan.value === id) expandedPlan.value = null
  else expandedPlan.value = id
}
const loading = ref(true)
const deliveries = ref<any[]>([])

async function fetchDeliveries() {
  try {
    loading.value = true
    deliveries.value = await api.get('/deliveries/my') as any[]
  } catch (e) {
    console.error('Failed to load active deliveries', e)
  } finally {
    loading.value = false
  }
}

async function completeDelivery(id: number) {
  if (!confirm('Mark this delivery as Complete?')) return
  actionLoading.value = id
  try {
    await api.put(`/deliveries/${id}/complete`, {})
    await fetchDeliveries()
  } catch (e: any) {
    alert(e.message || e.data?.message || 'Failed to complete delivery')
  } finally {
    actionLoading.value = null
  }
}

async function submitIssue() {
  if (!selectedDelivery.value) return
  
  if (!confirm('Submit this issue report? This will complete the delivery with discrepancies.')) return
  
  actionLoading.value = selectedDelivery.value.id
  
  const payload = {
    status: 'delivered_with_issue',
    note: `[${issueType.value.toUpperCase()}] ${issueNote.value}`,
    items: Object.entries(itemQuantities.value).map(([id, qty]) => ({
      id: Number(id),
      delivered_qty: qty
    }))
  }

  try {
    await api.put(`/deliveries/${selectedDelivery.value.id}/complete`, payload)
    showIssueModal.value = false
    await fetchDeliveries()
  } catch (e: any) {
    alert(e.message || e.data?.message || 'Failed to submit issue')
  } finally {
    actionLoading.value = null
  }
}

async function markShopClosed(id: number) {
  if (!confirm('Mark as Shop Closed? This will notify administrators that the delivery attempt failed because the outlet is closed.')) return
  actionLoading.value = id
  try {
    await api.put(`/deliveries/${id}/shop-closed`, {})
    await fetchDeliveries()
  } catch (e: any) {
    alert(e.message || e.data?.message || 'Failed to mark shop closed')
  } finally {
    actionLoading.value = null
  }
}

let interval: any
onMounted(() => {
  fetchDeliveries()
  interval = setInterval(fetchDeliveries, 30000) // Auto refresh every 30s
  onUnmounted(() => clearInterval(interval))
})

const overdueCount = computed(() => deliveries.value.filter((d: any) => d.is_overdue).length)

const groupedDeliveries = computed(() => {
  const groups: Record<string, { planId: number | null, planName: string, items: any[], planDate?: string | null }> = {}
  
  deliveries.value.forEach((d: any) => {
    const planId = d.delivery_plan_id || null
    const planName = d.plan?.name || 'Quick Assignments'
    const planDate = d.plan?.date || d.planned_delivery_date || null
    const key = planId ? `plan-${planId}` : 'unplanned'
    
    if (!groups[key]) {
      groups[key] = { planId, planName, planDate, items: [] }
    }
    groups[key]!.items.push(d)
  })
  
  // Sort so unplanned/direct assignments are ALWAYS at the top
  return Object.values(groups).sort((a, b) => {
    if (a.planId === null) return -1
    if (b.planId === null) return 1
    return b.planId - a.planId // Latest plans first
  })
})

// Removing duplicate onMounted
</script>
 
<style scoped>
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 2000px;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}
</style>
                         