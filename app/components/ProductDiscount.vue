<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Compact Global Controls Card -->
    <div class="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs space-y-3">
      <!-- Top Control Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- 1. NBC Exchange Rate -->
        <div class="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/80 flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-emerald-900 uppercase tracking-widest flex items-center gap-1.5">
              <Icon name="heroicons:currency-dollar" class="w-3.5 h-3.5 text-emerald-600" /> NBC Rate
            </span>
            <span class="text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-100">
              {{ customExchangeRate ? `1$ = ${Number(customExchangeRate).toLocaleString()} ៛` : 'Auto' }}
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="relative flex-1">
              <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">៛</span>
              <input v-model="customExchangeRate" type="number" class="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 text-xs font-black outline-none focus:border-emerald-500" placeholder="Manual Rate" />
            </div>
            <button @click="syncNbcRate" :disabled="syncingRate" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shrink-0">
              <Icon :name="syncingRate ? 'heroicons:arrow-path' : 'heroicons:arrow-down-tray'" class="w-3 h-3" :class="syncingRate ? 'animate-spin' : ''" />
              {{ syncingRate ? 'Sync...' : 'Sync' }}
            </button>
            <button @click="saveGlobalSettings" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0">
              Save
            </button>
          </div>
        </div>

        <!-- 2. Modern Trade Config -->
        <div class="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/80 flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
              <Icon name="heroicons:building-storefront" class="w-3.5 h-3.5 text-indigo-600" /> Modern Trade
            </span>
            <div class="flex items-center gap-2">
              <label class="inline-flex items-center cursor-pointer gap-1" title="Enable Promotions on MT">
                <input type="checkbox" v-model="mtPromoActive" @change="saveGlobalSettings()" class="w-3.5 h-3.5 text-indigo-600 rounded cursor-pointer">
                <span class="text-[10px] font-bold text-indigo-900">Promos</span>
              </label>
              <label class="inline-flex items-center cursor-pointer gap-1" title="Enable COD Discount on MT">
                <input type="checkbox" v-model="mtCodActive" @change="saveGlobalSettings()" class="w-3.5 h-3.5 text-pink-600 rounded cursor-pointer">
                <span class="text-[10px] font-bold text-pink-900">COD</span>
              </label>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 flex-1">
              <span class="text-[9px] font-black text-slate-500 uppercase">COD%</span>
              <input v-model.number="mtCodDiscountPercent" type="number" step="0.01" min="0" max="100" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none text-center focus:border-indigo-500" placeholder="5.00" @change="saveGlobalSettings()" />
            </div>
            <div class="flex items-center gap-1 flex-1">
              <span class="text-[9px] font-black text-slate-500 uppercase">Credit%</span>
              <input v-model.number="mtCreditDiscountPercent" type="number" step="0.01" min="0" max="100" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none text-center focus:border-indigo-500" placeholder="0.00" @change="saveGlobalSettings()" />
            </div>
          </div>
        </div>

        <!-- 3. Wholesale Discounts -->
        <div class="bg-pink-50/40 p-3 rounded-xl border border-pink-100/80 flex flex-col justify-between gap-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-black text-pink-900 uppercase tracking-widest flex items-center gap-1.5">
              <Icon name="heroicons:receipt-percent" class="w-3.5 h-3.5 text-pink-600" /> Wholesale Disc
            </span>
            <button @click="saveWholesaleSettings" :disabled="savingWholesale" class="bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all">
              {{ savingWholesale ? 'Saving...' : 'Save WS' }}
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 flex-1">
              <span class="text-[9px] font-black text-slate-500 uppercase">COD%</span>
              <input v-model.number="wholesaleSettings.cod_discount_percent" type="number" step="0.01" min="0" max="100" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none text-center focus:border-pink-500" placeholder="0.00" />
            </div>
            <div class="flex items-center gap-1 flex-1">
              <span class="text-[9px] font-black text-slate-500 uppercase">Credit%</span>
              <input v-model.number="wholesaleSettings.credit_discount_percent" type="number" step="0.01" min="0" max="100" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold outline-none text-center focus:border-pink-500" placeholder="0.00" />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Active Promotion Engine Toggle -->
      <div class="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2 pl-1">
          <Icon name="heroicons:cpu-chip" class="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <span class="text-[11px] font-black text-blue-900 uppercase tracking-widest">Active Promotion Engine</span>
            <span class="text-[9px] font-semibold text-blue-600/80 block sm:inline sm:ml-2">System applied to new orders</span>
          </div>
        </div>
        <div class="flex flex-wrap bg-white p-0.5 rounded-lg border border-slate-200/60 shadow-2xs gap-0.5 shrink-0">
          <button @click="activeSystem = 'mixed'; saveGlobalSettings()" :class="activeSystem === 'mixed' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'" class="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all">Mixed / Group Logic</button>
          <button @click="activeSystem = 'category'; saveGlobalSettings()" :class="activeSystem === 'category' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'" class="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all">Category Logic</button>
          <button @click="activeSystem = 'bundle'; saveGlobalSettings()" :class="activeSystem === 'bundle' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'" class="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all">Bundle Logic</button>
          <button @click="activeSystem = 'both'; saveGlobalSettings()" :class="activeSystem === 'both' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'" class="px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all">All Active</button>
        </div>
      </div>
    </div>

    <!-- Global FOC Rules CRUD Card -->
    <div class="bg-white border border-slate-200/80 rounded-xl shadow-2xs relative z-20 overflow-visible">
      <!-- Header toggle -->
      <button
        type="button"
        @click="showGlobalFocRules = !showGlobalFocRules"
        class="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-slate-50/60 transition-colors rounded-t-xl"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs shrink-0">
            <Icon name="heroicons:gift-top" class="w-3.5 h-3.5" />
          </div>
          <div class="flex items-center gap-2">
            <h2 class="font-black text-[11px] text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              Global FOC Rules
              <span v-if="globalFocRules.length > 0" class="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-bold">{{ globalFocRules.length }} rule{{ globalFocRules.length !== 1 ? 's' : '' }}</span>
            </h2>
            <span class="text-[9px] font-semibold text-slate-400 hidden sm:inline">&bull; Auto free gifts by order value or bundle sets</span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">{{ showGlobalFocRules ? 'Collapse' : 'Expand / Edit' }}</span>
          <Icon
            name="heroicons:chevron-down"
            class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0"
            :class="showGlobalFocRules ? 'rotate-180' : ''"
          />
        </div>
      </button>

      <!-- Collapsible body -->
      <div v-show="showGlobalFocRules" class="border-t border-slate-100 p-3 space-y-2.5 bg-slate-50/30 rounded-b-xl overflow-visible">
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-wider">Configured Global Rules</span>
          <button type="button" @click="addGlobalFocRule" class="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all shadow-xs">
            <Icon name="heroicons:plus" class="w-3 h-3" /> Add Rule
          </button>
        </div>

        <div class="space-y-2 overflow-visible">
          <div v-for="(rule, idx) in globalFocRules" :key="idx" class="bg-white p-2.5 rounded-xl border border-slate-200/80 flex flex-col lg:flex-row gap-2.5 items-start lg:items-center shadow-2xs relative overflow-visible">
            <!-- Trigger Condition -->
            <div class="flex-1 w-full">
              <label class="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Trigger Condition</label>
              <div class="relative">
                <select v-model="rule.type" class="w-full bg-white border border-slate-200 rounded-lg pl-2.5 pr-7 py-1 text-[11px] font-semibold text-slate-800 appearance-none outline-none focus:border-indigo-400 cursor-pointer">
                  <option value="min_order_value">💰 Min Order Total Value</option>
                  <option value="bundle_sets">🎁 Min Bundle Sets Purchased</option>
                </select>
                <Icon name="heroicons:chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- Threshold -->
            <div class="w-full lg:w-28">
              <label class="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Threshold</label>
              <div class="relative">
                <span v-if="rule.type === 'min_order_value'" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] font-bold">$</span>
                <input v-model.number="rule.threshold" type="number" step="0.01" class="w-full bg-white border border-slate-200 rounded-lg pl-6 pr-2 py-1 text-[11px] font-bold outline-none focus:border-indigo-400 text-center" />
              </div>
            </div>

            <!-- FOC Product Select -->
            <div class="flex-[1.5] w-full">
              <label class="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">FOC Reward Product</label>
              <div class="relative">
                <select v-model="rule.product_id" @change="onFocProductChange(rule)" class="w-full bg-white border border-slate-200 rounded-lg pl-2.5 pr-7 py-1 text-[11px] font-semibold text-slate-800 appearance-none outline-none focus:border-indigo-400 cursor-pointer" required>
                  <option value="">Select FOC Product...</option>
                  <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
                <Icon name="heroicons:chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- FOC Qty -->
            <div class="w-full lg:w-20">
              <label class="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">FOC Qty</label>
              <input v-model.number="rule.qty" type="number" min="0.01" step="0.01" class="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold outline-none focus:border-indigo-400 text-center" required />
            </div>

            <!-- FOC Unit -->
            <div class="w-full lg:w-24">
              <label class="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">FOC Unit</label>
              <div class="relative">
                <select v-model="rule.unit" class="w-full bg-white border border-slate-200 rounded-lg pl-2.5 pr-7 py-1 text-[11px] font-semibold text-slate-800 appearance-none outline-none focus:border-indigo-400 cursor-pointer" required>
                  <option v-for="u in getFocUnits(rule)" :key="u" :value="u">{{ u }}</option>
                </select>
                <Icon name="heroicons:chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- Channels Multi-Select Popover -->
            <div class="w-full lg:w-56 relative">
              <label class="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Apply To Channels</label>
              <button
                type="button"
                @click="rule._showChannelPopover = !rule._showChannelPopover"
                class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-800 text-left flex items-center justify-between shadow-2xs hover:border-indigo-400 cursor-pointer transition-all"
              >
                <span class="truncate font-medium text-slate-800">{{ getChannelSelectionSummary(rule.selected_channels || rule.channel_target) }}</span>
                <Icon name="heroicons:chevron-down" class="w-3 h-3 text-slate-400 shrink-0 ml-1 transition-transform" :class="rule._showChannelPopover ? 'rotate-180' : ''" />
              </button>

              <div v-if="rule._showChannelPopover" @click="rule._showChannelPopover = false" class="fixed inset-0 z-[998] cursor-default bg-transparent"></div>

              <div
                v-if="rule._showChannelPopover"
                class="absolute right-0 top-full mt-1.5 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-[999] p-3 space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
              >
                <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
                  <div class="flex items-center gap-1.5">
                    <Icon name="heroicons:building-storefront" class="w-3.5 h-3.5 text-indigo-600" />
                    <span class="text-[10px] font-black text-slate-700 uppercase tracking-wider">Select Store Channels</span>
                  </div>
                  <button type="button" @click="rule._showChannelPopover = false" class="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors">
                    <Icon name="heroicons:x-mark" class="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                <div
                  @click.stop="toggleChannelSelection(rule, 'all')"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer text-xs font-bold select-none transition-all"
                  :class="isChannelSelected(rule.selected_channels || rule.channel_target, 'all') ? 'bg-indigo-50/80 text-indigo-900 border border-indigo-200/60 shadow-2xs' : 'text-slate-700 hover:bg-slate-50'"
                >
                  <input
                    type="checkbox"
                    :checked="isChannelSelected(rule.selected_channels || rule.channel_target, 'all')"
                    class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 pointer-events-none cursor-pointer"
                  />
                  <span class="flex-1 font-extrabold text-xs">🌐 All Channels</span>
                </div>

                <div class="border-t border-slate-100 my-1"></div>

                <div
                  v-for="st in activeChannelStoreTypes"
                  :key="st.id"
                  @click.stop="toggleChannelSelection(rule, getStoreTypeCode(st))"
                  class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer text-xs font-semibold select-none transition-all"
                  :class="isChannelSelected(rule.selected_channels || rule.channel_target, getStoreTypeCode(st)) ? 'bg-indigo-50/50 text-indigo-900 font-bold' : 'text-slate-600 hover:bg-slate-50'"
                >
                  <input
                    type="checkbox"
                    :checked="isChannelSelected(rule.selected_channels || rule.channel_target, getStoreTypeCode(st))"
                    class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 pointer-events-none cursor-pointer"
                  />
                  <span class="flex-1 text-xs">{{ getStoreTypeIconEmoji(st) }} {{ st.name }}</span>
                </div>
              </div>
            </div>

            <!-- Delete & Toggle Buttons -->
            <div class="pt-2 lg:pt-0 flex items-center gap-1.5 shrink-0 self-end lg:self-center">
              <button 
                type="button"
                @click="rule.disabled = !rule.disabled; saveGlobalSettings()"
                :class="!rule.disabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'" 
                class="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
              >
                <Icon :name="!rule.disabled ? 'heroicons:check-circle' : 'heroicons:pause-circle'" class="w-3.5 h-3.5" />
                <span>{{ !rule.disabled ? 'Active' : 'Disabled' }}</span>
              </button>
              <button type="button" @click="removeGlobalFocRule(idx)" class="w-7 h-7 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-slate-200 bg-white shadow-2xs" title="Delete rule">
                <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div v-if="!globalFocRules.length" class="text-center py-2 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
            No global FOC rules configured.
          </div>

          <div v-if="globalFocRules.length > 0" class="flex justify-end pt-0.5">
            <button type="button" @click="saveGlobalSettings" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition-all shadow-xs">
              Save FOC Rules
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 1. Mixed / Group Combo promotions -->
    <div v-if="activeSystem === 'mixed' || activeSystem === 'both'" class="space-y-3 pt-1">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-purple-50/70 px-3.5 py-2.5 rounded-xl border border-purple-100 shadow-2xs">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-2xs shrink-0">
            <Icon name="heroicons:arrows-right-left" class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-[11px] font-black text-purple-950 uppercase tracking-widest flex items-center gap-1.5">
              Mixed / Group Combo Promotions (Multi-Category)
            </h3>
            <p class="text-[9.5px] font-semibold text-purple-700/80">Combine carton volumes across multiple categories (e.g. Category 1 + Category 2)</p>
          </div>
        </div>
        <button @click="openPromoModal(null, true)" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0">
          <Icon name="heroicons:plus-circle" class="w-3.5 h-3.5" />
          + New Mixed Combo
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="promo in mixedComboPromos" :key="promo.id" class="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3">
          <div>
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-2xs shrink-0" :class="promo.is_active ? 'bg-purple-600' : 'bg-slate-400'">
                  <Icon name="heroicons:arrows-right-left" class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <h3 class="text-xs font-black text-slate-900 truncate" :title="promo.name">{{ promo.name }}</h3>
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="text-[8px] font-black text-purple-600 uppercase tracking-wider bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                      P:{{ promo.priority || 0 }}
                    </span>
                    <button 
                      type="button"
                      @click="togglePromoActive(promo)" 
                      :disabled="promoToggling === promo.id"
                      :class="promo.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'" 
                      class="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Icon :name="promo.is_active ? 'heroicons:check-circle' : 'heroicons:pause-circle'" class="w-3 h-3" />
                      <span>{{ promo.is_active ? 'Active' : 'Disabled' }}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div class="flex gap-1 shrink-0">
                <button @click="openPromoModal(promo, true)" class="w-7 h-7 bg-slate-50 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-md flex items-center justify-center transition-all border border-slate-200/60">
                  <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" />
                </button>
                <button @click="deletePromotion(promo)" class="w-7 h-7 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-md flex items-center justify-center transition-all border border-red-100">
                  <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div class="bg-purple-50/50 p-2.5 rounded-lg border border-purple-100/80 mb-2">
              <p class="text-[8px] font-black text-purple-800 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Icon name="heroicons:squares-2x2" class="w-3 h-3 text-purple-600" /> Target Categories
              </p>
              <div class="flex flex-wrap gap-1">
                <span v-for="rule in promo.rules" :key="rule.id" class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-purple-200/80 rounded-md text-[10px] font-bold text-purple-900 shadow-2xs">
                  <Icon name="heroicons:folder" class="w-3 h-3 text-purple-500" />
                  {{ getRuleTargetName(rule) }}
                </span>
              </div>
            </div>

            <!-- Target Channels -->
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2">
              <p class="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Icon name="heroicons:building-storefront" class="w-3 h-3 text-slate-400" /> Apply To Channels
              </p>
              <div class="flex flex-wrap gap-1">
                <span v-for="ch in getChannelBadgesList(promo.channel_type)" :key="ch.code" class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[9.5px] font-bold text-slate-700 shadow-2xs">
                  <span>{{ ch.icon }}</span>
                  <span>{{ ch.label }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Configured Reward Tiers</p>
            <div class="flex flex-wrap gap-1.5">
              <div v-for="reward in promo.rewards" :key="reward.id" class="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 flex items-center gap-1.5 shadow-2xs">
                <span>&ge; <strong>{{ reward.min_qty_trigger ?? 1 }} {{ reward.trigger_unit || 'CTN' }}</strong></span>
                <span class="font-black text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100">
                  {{ reward.reward_type === 'foc' ? `🎁 ${reward.foc_qty} ${reward.foc_unit || 'box'} ${reward.focProduct?.name || 'FOC'}` : (reward.reward_type === 'discount_pct' ? `🏷️ ${reward.discount_value}% OFF` : `🏷️ $${reward.discount_value} OFF`) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="mixedComboPromos.length === 0" class="col-span-full text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Icon name="heroicons:arrows-right-left" class="w-6 h-6" />
          </div>
          <div>
            <p class="font-black text-slate-900 text-sm">No Mixed / Group Combo Promotions Configured</p>
            <p class="text-slate-400 text-xs mt-1">Combine carton totals across multiple categories.</p>
          </div>
          <button @click="openPromoModal(null, true)" class="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-purple-200 inline-flex items-center gap-2">
            <Icon name="heroicons:plus-circle" class="w-4 h-4" /> + Create Mixed Combo Promo
          </button>
        </div>
      </div>
    </div>

    <!-- 2. Category Logic promotions -->
    <!-- 2. Category & Product Logic promotions -->
    <div v-if="activeSystem === 'category' || activeSystem === 'both'" class="space-y-4 pt-2">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-blue-50/70 p-4 rounded-2xl border border-blue-100 shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Icon name="heroicons:tag" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-xs font-black text-blue-950 uppercase tracking-[0.2em] flex items-center gap-2">
              Category & Product Discounts & Tiers
            </h3>
            <p class="text-[11px] font-semibold text-blue-700/80 mt-0.5">Configure tiered volume discounts and FOC gifts per category or specific products. Product promotions automatically take precedence.</p>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Filter Tabs -->
          <div class="flex items-center bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
            <button 
              type="button" 
              @click="promoTab = 'all'"
              class="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
              :class="promoTab === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'"
            >
              All ({{ categories.length + productPromos.length }})
            </button>
            <button 
              type="button" 
              @click="promoTab = 'category'"
              class="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
              :class="promoTab === 'category' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'"
            >
              Categories ({{ categories.length }})
            </button>
            <button 
              type="button" 
              @click="promoTab = 'product'"
              class="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
              :class="promoTab === 'product' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:bg-slate-50'"
            >
              Product Deals ({{ productPromos.length }})
            </button>
          </div>

          <button @click="openPromoModal()" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 shrink-0">
            <Icon name="heroicons:plus-circle" class="w-4 h-4" /> + Add Promo
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <!-- Category Promo Cards -->
        <template v-if="promoTab === 'all' || promoTab === 'category'">
          <div v-for="(group, catId) in groupedPromos" :key="'cat-' + catId"
            class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col"
            :class="{ 'opacity-60 bg-slate-50/50': group.length > 0 && !group[0].is_active }">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                  :class="group.length > 0 && group[0].is_active ? 'bg-blue-600 shadow-blue-200' : 'bg-slate-400 shadow-slate-200'">
                  <Icon name="heroicons:ticket" class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <p class="text-[9px] font-black uppercase tracking-widest" :class="group.length > 0 ? (group[0].is_active ? 'text-blue-500' : 'text-slate-400') : 'text-slate-400'">
                    {{ group.length > 0 ? (group[0].is_active ? 'Category Discount' : 'Category Discount (Disabled)') : 'No Promotion' }}
                  </p>
                  <h3 class="text-sm font-black text-slate-900 truncate max-w-[140px] sm:max-w-[160px]">{{ getCategoryName(Number(catId)) }}</h3>
                  <div v-if="getCategoryOverriddenCount(Number(catId)) > 0" class="mt-1 flex items-center gap-1 text-[9.5px] font-bold text-amber-700 bg-amber-50/90 border border-amber-200/80 px-2 py-0.5 rounded-md w-fit">
                    <Icon name="heroicons:bolt" class="w-3 h-3 text-amber-500" />
                    <span>{{ getCategoryOverriddenCount(Number(catId)) }} product override active</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button 
                  v-if="group.length > 0"
                  type="button"
                  @click="togglePromoActive(group[0])"
                  :disabled="promoToggling === group[0].id"
                  :class="group[0].is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'" 
                  class="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Icon :name="group[0].is_active ? 'heroicons:check-circle' : 'heroicons:pause-circle'" class="w-3.5 h-3.5" />
                  <span>{{ group[0].is_active ? 'Active' : 'Disabled' }}</span>
                </button>

                <div v-if="categoryHasOptions(group)" class="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-sm shrink-0" title="Choice of FOC / Discount is enabled for this category">
                  <Icon name="heroicons:check" class="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between py-2.5 border-y border-slate-100 mb-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ getTiersCountForGroup(group) }} Tiers Defined</span>
              <div class="flex gap-1">
                <div v-for="i in 4" :key="i" class="w-2 h-2 rounded-full" :class="(i as number) <= getTiersCountForGroup(group) ? 'bg-emerald-400' : 'bg-slate-100'"></div>
              </div>
            </div>

            <!-- Target Channels -->
            <div v-if="group.length > 0" class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
              <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Icon name="heroicons:building-storefront" class="w-3 h-3 text-slate-400" /> Apply To Channels
              </p>
              <div class="flex flex-wrap gap-1">
                <span v-for="ch in getChannelBadgesList(group[0]?.channel_type)" :key="ch.code" class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-[9.5px] font-bold text-slate-700 shadow-2xs">
                  <span>{{ ch.icon }}</span>
                  <span>{{ ch.label }}</span>
                </span>
              </div>
            </div>

            <div class="mt-auto flex gap-2">
              <button @click="openPromoModal(group[0] || { category_id: Number(catId) })"
                class="flex-1 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all">
                <Icon :name="group.length > 0 ? 'heroicons:pencil-square' : 'heroicons:plus-circle'" class="w-4 h-4" />
                {{ group.length > 0 ? 'Manage' : 'Create' }}
              </button>
              <button v-if="group.length > 0" @click="deleteCategoryPromos(Number(catId))" class="w-11 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all">
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </template>

        <!-- Product Promo Cards -->
        <template v-if="promoTab === 'all' || promoTab === 'product'">
          <div v-for="promo in productPromos" :key="'prod-' + promo.id"
            class="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 flex flex-col relative overflow-hidden"
            :class="{ 'opacity-60 bg-slate-50/50': !promo.is_active }">
            <div class="flex items-start justify-between gap-3 mb-4">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                  :class="promo.is_active ? 'bg-purple-600 shadow-purple-200' : 'bg-slate-400 shadow-slate-200'">
                  <Icon name="heroicons:cube" class="w-5 h-5" />
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      Product Deal
                    </span>
                    <span class="text-[8.5px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 flex items-center gap-0.5">
                      <Icon name="heroicons:bolt" class="w-2.5 h-2.5" /> Overrides Category
                    </span>
                  </div>
                  <h3 class="text-sm font-black text-slate-900 truncate mt-1">
                    {{ getProductForPromo(promo)?.name || promo.name }}
                  </h3>
                  <p class="text-[10px] font-semibold text-slate-400 truncate">
                    Category: {{ getCategoryName(getProductForPromo(promo)?.category_id) }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button 
                  type="button"
                  @click="togglePromoActive(promo)"
                  :disabled="promoToggling === promo.id"
                  :class="promo.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'" 
                  class="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Icon :name="promo.is_active ? 'heroicons:check-circle' : 'heroicons:pause-circle'" class="w-3.5 h-3.5" />
                  <span>{{ promo.is_active ? 'Active' : 'Disabled' }}</span>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between py-2.5 border-y border-slate-100 mb-3">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ getTiersCountForGroup([promo]) }} Tiers Defined</span>
              <div class="flex gap-1">
                <div v-for="i in 4" :key="i" class="w-2 h-2 rounded-full" :class="(i as number) <= getTiersCountForGroup([promo]) ? 'bg-purple-500' : 'bg-slate-100'"></div>
              </div>
            </div>

            <!-- Target Channels -->
            <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4">
              <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Icon name="heroicons:building-storefront" class="w-3 h-3 text-slate-400" /> Apply To Channels
              </p>
              <div class="flex flex-wrap gap-1">
                <span v-for="ch in getChannelBadgesList(promo?.channel_type)" :key="ch.code" class="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200/80 rounded-md text-[9.5px] font-bold text-slate-700 shadow-2xs">
                  <span>{{ ch.icon }}</span>
                  <span>{{ ch.label }}</span>
                </span>
              </div>
            </div>

            <div class="mt-auto flex gap-2">
              <button @click="openPromoModal(promo)"
                class="flex-1 py-3 bg-purple-900 hover:bg-purple-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all">
                <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                Manage Deal
              </button>
              <button @click="deleteProductPromo(promo.id)" class="w-11 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all">
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Empty state when no product promos -->
          <div v-if="promoTab === 'product' && productPromos.length === 0" class="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8">
            <div class="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Icon name="heroicons:cube" class="w-6 h-6" />
            </div>
            <p class="font-black text-slate-900 text-sm">No Dedicated Product Promotions Yet</p>
            <p class="text-slate-400 text-xs mt-1 max-w-md mx-auto">Create a promotion for a specific product to give it special volume discounts or FOC gifts that override category rules.</p>
            <button @click="openPromoModal({ product_id: products[0]?.id })" class="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-purple-200 inline-flex items-center gap-2">
              <Icon name="heroicons:plus-circle" class="w-4 h-4" /> + Create Product Deal
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- 3. Bundle Logic promotions -->
    <div v-if="activeSystem === 'bundle' || activeSystem === 'both'" class="space-y-4 pt-2">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 shadow-xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Icon name="heroicons:rectangle-group" class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-xs font-black text-indigo-950 uppercase tracking-[0.2em] flex items-center gap-2">
              Bundle Promotions
            </h3>
            <p class="text-[11px] font-semibold text-indigo-700/80 mt-0.5">Define required product bundles and automatic rewards</p>
          </div>
        </div>
        <button @click="openBundleModal()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-200 shrink-0">
          <Icon name="heroicons:plus-circle" class="w-4 h-4" /> + Add Bundle Promo
        </button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div v-for="bundle in bundles" :key="bundle.id" 
          class="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
          :class="{ 'opacity-60 bg-slate-50/50': !bundle.is_active }">
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                :class="bundle.is_active ? 'bg-indigo-600 shadow-indigo-200' : 'bg-slate-400 shadow-slate-200'">
                <Icon name="heroicons:rectangle-group" class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-sm font-black text-slate-900 truncate">{{ bundle.name }}</h3>
                  <button 
                    type="button"
                    @click="togglePromoActive(bundle)"
                    :disabled="promoToggling === bundle.id"
                    :class="bundle.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'" 
                    class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border transition-all flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Icon :name="bundle.is_active ? 'heroicons:check-circle' : 'heroicons:pause-circle'" class="w-3 h-3" />
                    <span>{{ bundle.is_active ? 'Active' : 'Disabled' }}</span>
                  </button>
                </div>
                <p class="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">Target: {{ bundle.target_outlet_type }}</p>
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button @click="openBundleModal(bundle)" class="w-8 h-8 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all"><Icon name="heroicons:pencil-square" class="w-4 h-4" /></button>
              <button @click="deleteBundle(bundle.id)" class="w-8 h-8 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all"><Icon name="heroicons:trash" class="w-4 h-4" /></button>
            </div>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Icon name="heroicons:shopping-cart" class="w-3 h-3"/> Required Cart</p>
              <ul class="space-y-1.5">
                <li v-for="req in bundle.requirements" :key="req.id" class="flex items-start gap-2 text-xs font-bold text-slate-700">
                  <span v-if="req.category_id" class="flex items-center gap-1 flex-1 min-w-0 text-indigo-600">
                    <Icon name="heroicons:folder" class="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span class="truncate">{{ req.category?.name }}</span>
                  </span>
                  <span v-else class="flex-1 min-w-0 truncate text-slate-700">{{ req.product?.name }}</span>
                  <span class="shrink-0 bg-white px-2 py-0.5 rounded shadow-sm text-slate-900 text-[10px] font-black whitespace-nowrap">{{ req.required_qty }} {{ req.required_unit || 'x' }}</span>
                </li>
              </ul>
            </div>
            
            <div class="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/60">
              <p class="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Icon name="heroicons:gift" class="w-3 h-3"/> Free FOC Items</p>
              <ul class="space-y-1.5">
                <li v-for="foc in bundle.focs" :key="foc.id" class="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span class="truncate">{{ foc.product?.name }}</span>
                  <span class="shrink-0 bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-black ml-2">+{{ foc.free_qty }} {{ foc.free_unit || 'box' }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="bundles.length === 0" class="col-span-full text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Icon name="heroicons:rectangle-group" class="w-6 h-6" />
          </div>
          <div>
            <p class="font-black text-slate-900 text-sm">No Bundle Promotions Configured</p>
            <p class="text-slate-400 text-xs mt-1">Define required product purchases to award automatic FOC gifts.</p>
          </div>
          <button @click="openBundleModal()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo-200 inline-flex items-center gap-2">
            <Icon name="heroicons:plus-circle" class="w-4 h-4" /> + Add Bundle Promo
          </button>
        </div>
      </div>
    </div>

    <!-- Modals Teleported -->
    <Teleport to="body">
      <!-- Category Promo Modal -->
      <div v-if="showPromoModal" class="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[150] px-6">
        <div class="bg-slate-50 border border-white/20 w-full max-w-5xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-500">
          <div class="bg-white px-8 sm:px-12 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-slate-100">
            <div>
              <h3 class="text-2xl sm:text-4xl font-black text-slate-900 italic tracking-tighter leading-none mb-2 sm:mb-3">
                {{ promoForm.is_mixed_mode ? 'Mixed / Group Combo Discounts' : (promoForm.target_type === 'product' ? 'Product Volume Promotion' : 'Category Discounts') }}
              </h3>
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full" :class="promoForm.target_type === 'product' ? 'bg-purple-600 animate-pulse' : 'bg-blue-600 animate-pulse'"></span>
                <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Promotion Strategy Engine</p>
              </div>
            </div>

            <div class="flex items-center gap-2 sm:gap-3 shrink-0">
              <button type="button" @click="showPromoModal = false" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer">Discard</button>
              <button type="button" @click="savePromo" class="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-2 group cursor-pointer">
                <span>Apply Promotion Schema</span>
                <Icon name="heroicons:bolt" class="w-4 h-4 group-hover:scale-125 transition-transform" />
              </button>
              <button type="button" @click="showPromoModal = false" class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all group shrink-0">
                <Icon name="heroicons:x-mark" class="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </div>

          <div class="p-12 overflow-y-auto custom-scrollbar flex-1">
            <form @submit.prevent="savePromo" class="space-y-12">
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                <!-- Target Categories (Mixed mode) -->
                <div v-if="promoForm.is_mixed_mode" class="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                  <div class="flex items-center justify-between">
                    <label class="text-[10px] font-black text-purple-600 uppercase tracking-widest block">1. Select Target Categories</label>
                    <button type="button" @click="addCategoryToPromoForm" class="text-xs font-black uppercase tracking-wider text-purple-600 hover:text-purple-800 flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl transition-all">
                      <Icon name="heroicons:plus-circle" class="w-3.5 h-3.5" /> Add Category
                    </button>
                  </div>

                  <div class="space-y-2">
                    <div v-for="(catId, idx) in promoForm.category_ids" :key="idx" class="flex items-center gap-2">
                      <span class="text-xs font-black text-slate-400 shrink-0 w-5 text-center">{{ idx === 0 ? '📂' : '+' }}</span>
                      <div class="relative flex-1">
                        <Icon name="heroicons:tag" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                        <select v-model="promoForm.category_ids[idx]" class="w-full bg-slate-50 border-2 border-slate-50 rounded-xl pl-10 pr-8 py-2.5 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-purple-500 transition-all appearance-none cursor-pointer" required>
                          <option :value="null" disabled>Choose a category...</option>
                          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                        </select>
                        <Icon name="heroicons:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      <button v-if="promoForm.category_ids.length > 1" type="button" @click="removeCategoryFromPromoForm(idx)" class="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shrink-0">
                        <Icon name="heroicons:trash" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Target Scope & Selection (Category or Product) -->
                <div v-else class="md:col-span-5 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between gap-3">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="text-[10px] font-black uppercase tracking-widest" :class="promoForm.target_type === 'product' ? 'text-purple-600' : 'text-blue-600'">
                        1. Promotion Scope
                      </label>
                      <div class="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/60">
                        <button 
                          type="button" 
                          @click="setPromoTargetType('category')"
                          class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                          :class="promoForm.target_type === 'category' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'"
                        >
                          Category
                        </button>
                        <button 
                          type="button" 
                          @click="setPromoTargetType('product')"
                          class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                          :class="promoForm.target_type === 'product' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'"
                        >
                          Product
                        </button>
                      </div>
                    </div>

                    <!-- Category Mode Dropdown -->
                    <div v-if="promoForm.target_type === 'category'" class="space-y-2">
                      <div class="relative">
                        <Icon name="heroicons:tag" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                        <select v-model="promoForm.category_id" @change="onPromoCategoryChange" class="w-full bg-slate-50 border-2 border-slate-50 rounded-xl pl-10 pr-8 py-2.5 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-blue-500 transition-all appearance-none cursor-pointer" required>
                          <option :value="null" disabled>Choose a category...</option>
                          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                        </select>
                        <Icon name="heroicons:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      <div v-if="promoForm.category_id && getCategoryOverriddenCount(promoForm.category_id) > 0" class="p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[10.5px] font-semibold text-amber-800 flex items-start gap-1.5 leading-tight">
                        <Icon name="heroicons:information-circle" class="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span><strong>Note:</strong> {{ getCategoryOverriddenCount(promoForm.category_id) }} product(s) in this category have dedicated promotions and will be excluded from this category tier.</span>
                      </div>
                    </div>

                    <!-- Product Mode Dropdown -->
                    <div v-else class="space-y-2">
                      <div class="relative">
                        <Icon name="heroicons:cube" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                        <select v-model="promoForm.product_id" @change="onPromoProductChange" class="w-full bg-slate-50 border-2 border-slate-50 rounded-xl pl-10 pr-8 py-2.5 text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-purple-500 transition-all appearance-none cursor-pointer" required>
                          <option :value="null" disabled>Choose a product...</option>
                          <option v-for="p in products" :key="p.id" :value="p.id">
                            [{{ getCategoryName(p.category_id) }}] {{ p.name }}
                          </option>
                        </select>
                        <Icon name="heroicons:chevron-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      <div class="p-2 rounded-xl bg-purple-50/70 border border-purple-100/80 text-[10.5px] font-semibold text-purple-900 flex items-start gap-1.5 leading-tight">
                        <Icon name="heroicons:bolt" class="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span><strong>Precedence Override:</strong> This product deal takes priority and will be excluded from category deals when ordered.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Apply to Channels -->
                <div class="md:col-span-4 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-center">
                  <label class="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-2">2. Apply To Channels</label>
                  <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar border border-slate-100 rounded-2xl p-2.5 bg-slate-50/50">
                    <label @click.prevent="toggleChannelSelection(promoForm, 'all')" class="flex items-center gap-2.5 px-2.5 py-1 rounded-xl hover:bg-white cursor-pointer text-xs font-black text-slate-800 select-none transition-colors">
                      <input type="checkbox" :checked="isChannelSelected(promoForm.selected_channels || promoForm.channel_type, 'all')" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 pointer-events-none" />
                      <span>🌐 All Channels</span>
                    </label>
                    <label v-for="st in activeChannelStoreTypes" :key="st.id" @click.prevent="toggleChannelSelection(promoForm, getStoreTypeCode(st))" class="flex items-center gap-2.5 px-2.5 py-1 rounded-xl hover:bg-white cursor-pointer text-xs font-bold text-slate-700 select-none transition-colors">
                      <input type="checkbox" :checked="isChannelSelected(promoForm.selected_channels || promoForm.channel_type, getStoreTypeCode(st))" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 pointer-events-none" />
                      <span>{{ getStoreTypeIconEmoji(st) }} {{ st.name }}</span>
                    </label>
                  </div>
                </div>

                <div class="md:col-span-3 flex items-center">
                  <button type="button" @click="addTier" class="w-full h-full min-h-[72px] bg-blue-600 hover:bg-blue-700 text-white rounded-3xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-200 group p-4">
                    <Icon name="heroicons:plus-circle" class="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span class="text-[10px] font-black uppercase tracking-widest">Add New Tier</span>
                  </button>
                </div>
              </div>

              <!-- Tiers List -->
              <div class="space-y-10">
                <div v-if="promoForm.tiers.length === 0" class="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Icon name="heroicons:sparkles" class="w-16 h-16 text-slate-100 mb-4" />
                  <p class="text-slate-400 font-black uppercase tracking-widest">No tiers defined for this category yet</p>
                </div>

                <div v-for="(tier, idx) in promoForm.tiers" :key="idx" class="relative animate-in slide-in-from-bottom-10 duration-500" :style="{ transitionDelay: `${idx * 50}ms` }">
                  <div class="absolute -top-4 -left-4 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic text-xl shadow-xl z-10 border-4 border-slate-50">
                    {{ idx + 1 }}
                  </div>

                  <div class="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 relative group">
                    <button type="button" @click="removeTier(idx)" class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all flex items-center justify-center shadow-lg z-20 group/del">
                      <Icon name="heroicons:trash" class="w-4 h-4 transition-transform group-hover/del:scale-110" />
                    </button>

                    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
                      <!-- Volume range -->
                      <div v-if="!tier.is_option_choice" class="xl:col-span-4 space-y-5">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-[10px] bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                              <Icon name="heroicons:shopping-cart" class="w-4 h-4 stroke-[1.5]" />
                            </div>
                            <label class="text-[11px] font-bold text-slate-700 uppercase tracking-[0.15em]">Volume Range</label>
                          </div>
                          
                          <div class="relative">
                            <select v-model="tier.trigger_unit" class="bg-blue-50 text-[9px] font-black uppercase tracking-widest rounded-lg pl-2 pr-6 py-1 text-blue-600 border border-blue-100 appearance-none cursor-pointer hover:bg-blue-100 transition-colors">
                              <option v-for="u in getCategoryTriggerUnits()" :key="u" :value="u">{{ u }}</option>
                            </select>
                            <Icon name="heroicons:chevron-down" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-blue-400 pointer-events-none" />
                          </div>
                        </div>
                        
                        <div class="flex items-center gap-3">
                          <div class="flex-1 relative group/input">
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Min {{ tier.trigger_unit || 'Units' }}</p>
                            <input v-model.number="tier.min_cartons" type="number" step="0.01" class="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-[3px] focus:ring-blue-400/10 transition-all text-center shadow-sm" required />
                          </div>
                          <div class="flex items-center justify-center mt-6 px-1">
                            <Icon name="heroicons:arrow-right" class="w-4 h-4 text-slate-300" />
                          </div>
                          <div class="flex-1 relative group/input">
                            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Max {{ tier.trigger_unit || 'Units' }}</p>
                            <input v-model.number="tier.max_cartons" type="number" step="0.01" class="w-full bg-white border border-slate-200/80 rounded-xl px-4 py-3 text-base font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-[3px] focus:ring-blue-400/10 transition-all text-center shadow-sm" :placeholder="getMaxCartonsPlaceholder(tier)" />
                          </div>
                        </div>
                      </div>

                      <!-- Benefits -->
                      <div :class="tier.is_option_choice ? 'xl:col-span-12' : 'xl:col-span-8 border-t xl:border-t-0 xl:border-l border-slate-100 pt-6 xl:pt-0 xl:pl-8'" class="space-y-5">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-[10px] bg-indigo-50/80 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                              <Icon name="heroicons:sparkles" class="w-4 h-4 stroke-[1.5]" />
                            </div>
                            <label class="text-[11px] font-bold text-slate-700 uppercase tracking-[0.15em]">Reward Strategy</label>
                          </div>
                          
                          <div class="flex flex-col gap-2 w-full sm:w-[260px]">
                            <div class="relative w-full">
                              <select v-model="tier._reward_type" 
                                      @change="() => {
                                        if (tier._reward_type === 'none') { tier.discount_amount = 0; tier.free_product_id = null; tier.is_option_choice = false; }
                                        else if (tier._reward_type === 'cash') { tier.free_product_id = null; }
                                        else if (tier._reward_type === 'gift') { tier.discount_amount = 0; }
                                      }"
                                      class="w-full bg-white border border-slate-200/80 rounded-xl pl-4 pr-10 py-2.5 text-[13px] font-semibold text-slate-700 outline-none focus:border-indigo-400 appearance-none shadow-sm cursor-pointer hover:border-slate-300">
                                <option value="none">No Reward</option>
                                <option value="cash">💰 Cash Discount</option>
                                <option value="gift">🎁 Free Product Gift</option>
                              </select>
                              <Icon name="heroicons:chevron-up-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                            <div v-if="tier._reward_type !== 'none'" class="flex items-center justify-between gap-1.5 mt-1 px-1">
                              <div class="flex items-center gap-1.5">
                                <input type="checkbox" v-model="tier.is_option_choice" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" :id="'opt-choice-' + idx" />
                                <label class="text-[10px] font-black text-slate-500 uppercase tracking-wider select-none cursor-pointer" :for="'opt-choice-' + idx">FOC & Discount Choice</label>
                              </div>
                              <div v-if="tier.is_option_choice" class="relative">
                                <select v-model="tier.trigger_unit" class="bg-blue-50 text-[9px] font-black uppercase tracking-widest rounded-lg pl-2 pr-6 py-0.5 text-blue-600 border border-blue-100 appearance-none cursor-pointer hover:bg-blue-100 transition-colors">
                                  <option v-for="u in getCategoryTriggerUnits()" :key="u" :value="u">{{ u }}</option>
                                </select>
                                <Icon name="heroicons:chevron-down" class="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-blue-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Cash Config -->
                        <div v-if="tier._reward_type === 'cash' || tier.is_option_choice" class="animate-in fade-in slide-in-from-top-2 duration-300">
                          <div class="bg-white rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-100/30 overflow-hidden">
                            <button type="button" @click="tier.cash_expanded = !tier.cash_expanded" class="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-50/20 border-b border-emerald-100/50 hover:bg-emerald-50/40 transition-all select-none">
                              <div class="flex items-center gap-3">
                                <div class="w-7 h-7 rounded-[8px] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                  <Icon name="heroicons:currency-dollar" class="w-4 h-4 stroke-[1.5]" />
                                </div>
                                <span class="text-[10px] font-black uppercase text-emerald-800 tracking-wider">💰 Cash Discount Settings</span>
                              </div>
                              <Icon name="heroicons:chevron-down" class="w-4 h-4 text-emerald-500 transition-transform duration-300" :class="tier.cash_expanded ? 'rotate-180' : ''" />
                            </button>

                            <div v-show="tier.cash_expanded !== false" class="p-5 sm:p-6 space-y-6">
                              <div class="flex items-center gap-5 relative z-10">
                                <div class="w-12 h-12 rounded-[14px] bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                                  <Icon name="heroicons:currency-dollar" class="w-6 h-6 stroke-[1.5]" />
                                </div>
                                <div class="flex-1">
                                  <p class="text-[10px] font-bold text-emerald-700/80 uppercase tracking-widest mb-1.5">Base Discount Amount</p>
                                  <div class="relative w-full max-w-[280px] flex items-stretch">
                                    <div class="relative flex-1">
                                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                                        {{ (tier.discount_type || 'discount_flat') === 'discount_pct' ? '%' : '$' }}
                                      </span>
                                      <input v-model.number="tier.discount_amount" type="number" step="0.01" class="w-full bg-slate-50/50 border border-slate-200/60 rounded-l-xl pl-9 pr-4 py-3 text-lg font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-400 transition-all placeholder:text-slate-300" placeholder="0.00" />
                                    </div>
                                    <div class="relative flex shrink-0">
                                      <select v-model="tier.discount_type" class="bg-slate-100 border border-slate-200 border-l-0 rounded-r-xl pl-3 pr-8 py-3 text-xs font-black text-slate-600 outline-none hover:bg-slate-200 cursor-pointer transition-all appearance-none">
                                        <option value="discount_flat">USD ($)</option>
                                        <option value="discount_pct">Percent (%)</option>
                                      </select>
                                      <Icon name="heroicons:chevron-down" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div class="mt-6 pt-5 border-t border-emerald-100/50 grid grid-cols-2 sm:grid-cols-3 gap-4 items-end relative z-10">
                                <div class="bg-emerald-50/50 rounded-xl p-2.5 border border-emerald-200/60 flex flex-col items-center justify-center h-[42px] shadow-sm">
                                  <p class="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Scaling</p>
                                  <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" :checked="!!tier.is_multiply" @change="tier.is_multiply = ($event.target as any).checked ? 1 : 0" class="sr-only peer">
                                    <div class="w-8 h-4 bg-emerald-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                                  </label>
                                </div>
                                <div class="space-y-1.5 group/input sm:col-span-2">
                                  <p class="text-[9px] font-bold text-emerald-700/80 uppercase tracking-widest ml-1">Extra Cash (+)</p>
                                  <div class="relative w-full">
                                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
                                    <input v-model.number="tier.extra_foc" type="number" step="0.01" class="w-full bg-white border border-emerald-200/60 rounded-xl pl-9 pr-4 py-2.5 text-[13px] font-semibold text-slate-800 outline-none focus:border-emerald-400 transition-all shadow-sm" placeholder="0.00" />
                                  </div>
                                </div>
                              </div>

                              <div v-if="tier.is_option_choice" class="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div class="space-y-1.5 group/input">
                                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min {{ tier.trigger_unit || 'Units' }} for Discount</p>
                                  <input v-model.number="tier.cash_min_cartons" type="number" step="0.01" class="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-400" required />
                                </div>
                                <div class="space-y-1.5 group/input">
                                  <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max {{ tier.trigger_unit || 'Units' }} for Discount</p>
                                  <input v-model.number="tier.cash_max_cartons" type="number" step="0.01" class="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-400" placeholder="No Limit" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Gift Config -->
                        <div v-if="tier._reward_type === 'gift' || tier.is_option_choice" class="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div class="bg-white rounded-2xl border border-blue-100 shadow-sm shadow-blue-100/30 overflow-hidden">
                            <button type="button" @click="tier.foc_expanded = !tier.foc_expanded" class="w-full flex items-center justify-between px-5 py-3.5 bg-blue-50/20 border-b border-blue-100/50 hover:bg-blue-50/40 transition-all select-none">
                              <div class="flex items-center gap-3">
                                <div class="w-7 h-7 rounded-[8px] bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                  <Icon name="heroicons:gift" class="w-4 h-4 stroke-[1.5]" />
                                </div>
                                <span class="text-[10px] font-black uppercase text-blue-800 tracking-wider">🎁 FOC Gift Settings</span>
                              </div>
                              <Icon name="heroicons:chevron-down" class="w-4 h-4 text-blue-500 transition-transform duration-300" :class="tier.foc_expanded ? 'rotate-180' : ''" />
                            </button>

                            <div v-show="tier.foc_expanded !== false" class="p-5 sm:p-6 space-y-6">
                              <div v-for="(foc, fIdx) in tier.focs" :key="fIdx" class="relative z-10 p-4 border border-blue-50 bg-slate-50/20 rounded-2xl space-y-4">
                                <div class="flex items-center justify-between pb-2 border-b border-dashed border-slate-100">
                                  <span class="text-[9px] font-black uppercase text-blue-600 tracking-wider">Gift Product #{{ Number(fIdx) + 1 }}</span>
                                  <button v-if="tier.focs.length > 1" type="button" @click="removeFocItem(tier, Number(fIdx))" class="text-[9px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest flex items-center gap-0.5 transition-all">
                                    <Icon name="heroicons:trash" class="w-3.5 h-3.5" /> Remove Gift
                                  </button>
                                </div>

                                <div class="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                  <div class="w-12 h-12 rounded-[14px] bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                    <Icon name="heroicons:gift" class="w-6 h-6 stroke-[1.5]" />
                                  </div>
                                  <div class="flex-1 w-full">
                                    <p class="text-[10px] font-bold text-blue-700/80 uppercase tracking-widest mb-1.5">Select Gift Product</p>
                                    <div class="relative">
                                      <select v-model="foc.free_product_id" @change="onCategoryFocProductChange(foc)" class="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-400 transition-all appearance-none cursor-pointer">
                                        <option :value="null">-- Choose Product --</option>
                                        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                                      </select>
                                      <Icon name="heroicons:chevron-up-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>

                                <div class="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                  <div class="space-y-1.5 group/input">
                                    <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Base Qty</p>
                                    <input v-model.number="foc.free_qty" type="number" step="0.01" class="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-400 transition-all shadow-sm" />
                                  </div>
                                  
                                  <div class="bg-white rounded-xl p-2.5 border border-slate-200/60 flex flex-col items-center justify-center h-[42px] shadow-sm">
                                    <p class="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scaling</p>
                                    <label class="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" :checked="!!foc.is_multiply" @change="foc.is_multiply = ($event.target as any).checked ? 1 : 0" class="sr-only peer">
                                      <div class="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                                    </label>
                                  </div>
                                  
                                  <div class="space-y-1.5 group/input">
                                    <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Extra (+)</p>
                                    <input v-model.number="foc.extra_foc" type="number" step="0.01" class="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-800 outline-none focus:border-blue-400 transition-all shadow-sm" placeholder="0" />
                                  </div>
                                  
                                  <div class="space-y-1.5 group/input">
                                    <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Unit</p>
                                    <div class="relative">
                                      <select v-model="foc.free_unit" class="w-full bg-white border border-slate-200/60 rounded-xl pl-4 pr-8 py-2.5 text-[12px] font-semibold text-slate-800 outline-none focus:border-blue-400 transition-all uppercase cursor-pointer shadow-sm appearance-none">
                                        <option v-for="u in getFocProductUnits(foc)" :key="u.name" :value="u.name">{{ u.name }}</option>
                                      </select>
                                      <Icon name="heroicons:chevron-up-down" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>

                                <div v-if="tier.is_option_choice" class="mt-4 pt-3 border-t border-dashed border-slate-100 grid grid-cols-2 gap-4">
                                  <div class="space-y-1.5 group/input">
                                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Min {{ tier.trigger_unit || 'Units' }} for this Gift</p>
                                    <input v-model.number="foc.min_cartons" type="number" step="0.01" class="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-400" required />
                                  </div>
                                  <div class="space-y-1.5 group/input">
                                    <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Max {{ tier.trigger_unit || 'Units' }} for this Gift</p>
                                    <input v-model.number="foc.max_cartons" type="number" step="0.01" class="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-400" placeholder="No Limit" />
                                  </div>
                                </div>
                              </div>

                              <div class="relative z-10 pt-2 flex justify-center">
                                <button type="button" @click="addFocItem(tier)" class="px-4 py-2 border border-dashed border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 bg-blue-50/30 hover:bg-blue-50/60 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5">
                                  <Icon name="heroicons:plus-circle" class="w-4 h-4" /> Add Another Gift Product
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-3xl p-3 border border-slate-100 flex gap-4 shrink-0 shadow-xl shadow-slate-200/20 mt-8">
                <button type="button" @click="showPromoModal = false" class="h-14 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all">Discard</button>
                <button type="submit" class="h-14 flex-[1.5] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 group">
                  <span>Apply Promotion Schema</span>
                  <Icon name="heroicons:bolt" class="w-5 h-5 group-hover:scale-125 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Create/Edit Unified Promotion Modal -->
      <div v-if="showUnifiedPromoModal" class="fixed inset-0 z-[110] flex items-start justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
          <div class="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 class="font-black text-slate-900">{{ isEditingUnifiedPromo ? 'Edit Promotion' : 'New Promotion' }}</h2>
            <button @click="showUnifiedPromoModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400">
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="field-label-p">Promotion Name *</label>
                <input v-model="unifiedPromoForm.name" class="field-input-p" placeholder="e.g. Vitamin Jelly CH-V0005" />
              </div>
              <div>
                <label class="field-label-p">Memo Ref</label>
                <input v-model="unifiedPromoForm.memo_ref" class="field-input-p" placeholder="e.g. CH-V0005" />
              </div>
              <div>
                <label class="field-label-p">Promotion Type *</label>
                <select v-model="unifiedPromoForm.promotion_type" @change="handlePromoTypeChange" class="field-input-p">
                  <option value="category_tiered">Category Tiered</option>
                  <option value="mixed_tiered">Mixed / Group Combo</option>
                  <option value="bundle">Bundle Deal</option>
                </select>
              </div>
              <div>
                <label class="field-label-p">Channel</label>
                <select v-model="unifiedPromoForm.channel_type" class="field-input-p">
                  <option value="all">All Channels</option>
                  <option value="specialty">Specialty Only</option>
                  <option value="general">General Only</option>
                </select>
              </div>
              <div>
                <label class="field-label-p">Outlet Type</label>
                <select v-model="unifiedPromoForm.outlet_type" class="field-input-p">
                  <option value="all">All Stores</option>
                  <option value="existing">Existing Stores</option>
                  <option value="new">New Stores Only</option>
                </select>
              </div>
              <div>
                <label class="field-label-p">Valid From</label>
                <input v-model="unifiedPromoForm.valid_from" type="date" class="field-input-p" />
              </div>
              <div>
                <label class="field-label-p">Valid Until</label>
                <input v-model="unifiedPromoForm.valid_until" type="date" class="field-input-p" />
              </div>
              <div>
                <label class="field-label-p">Priority</label>
                <input v-model.number="unifiedPromoForm.priority" type="number" class="field-input-p" placeholder="0 = default" />
              </div>
              <div class="flex items-center gap-3 pt-4">
                <input id="upm-active" v-model="unifiedPromoForm.is_active" type="checkbox" class="w-4 h-4" />
                <label for="upm-active" class="text-sm font-bold text-slate-700">Active</label>
              </div>
            </div>

            <hr class="border-slate-100" />

            <!-- Rules -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <div>
                  <p class="text-xs font-black uppercase tracking-widest text-slate-700">Trigger Target Rules</p>
                  <p v-if="unifiedPromoForm.promotion_type === 'mixed_tiered'" class="text-[11px] font-semibold text-purple-700 mt-0.5">
                    📂 Select categories below. Carton totals will combine!
                  </p>
                </div>
                <div class="flex gap-2">
                  <button v-if="unifiedPromoForm.promotion_type === 'mixed_tiered'" @click="addUnifiedPromoRule('category')" type="button" class="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1">
                    <Icon name="heroicons:plus" class="w-3.5 h-3.5" /> Add Category Target
                  </button>
                  <button @click="addUnifiedPromoRule()" type="button" class="text-xs font-black uppercase tracking-wider text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1">
                    <Icon name="heroicons:plus" class="w-3.5 h-3.5" /> Add Rule
                  </button>
                </div>
              </div>

              <div v-for="(rule, idx) in unifiedPromoForm.rules" :key="idx" class="grid grid-cols-12 gap-2 mb-2.5 items-end bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                <div class="col-span-3">
                  <label class="field-label-p text-[10px]">Rule Type</label>
                  <select v-model="rule.rule_type" class="field-input-p text-xs py-1.5">
                    <option value="category">📂 Category Target</option>
                    <option value="product">🛍️ Specific Product</option>
                  </select>
                </div>
                <div class="col-span-4">
                  <label class="field-label-p text-[10px] font-bold text-slate-700">
                    {{ rule.rule_type === 'category' ? `Target Category #${idx+1}` : `Target Product #${idx+1}` }}
                  </label>
                  <select v-if="rule.rule_type === 'category'" v-model.number="rule.target_id" class="field-input-p text-xs py-1.5 font-bold" required>
                    <option value="">Choose Category...</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">📂 {{ c.name }}</option>
                  </select>
                  <select v-else v-model.number="rule.target_id" class="field-input-p text-xs py-1.5 font-bold" required>
                    <option value="">Choose Product...</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">🛍️ {{ p.name }}</option>
                  </select>
                </div>
                <div class="col-span-2">
                  <label class="field-label-p text-[10px]">Min Qty</label>
                  <input v-model.number="rule.min_qty" type="number" min="0.01" step="0.01" class="field-input-p text-xs py-1.5 text-center font-bold" placeholder="1" />
                </div>
                <div class="col-span-2">
                  <label class="field-label-p text-[10px]">Unit</label>
                  <input v-model="rule.unit" class="field-input-p text-xs py-1.5 text-center uppercase font-bold" placeholder="CTN" />
                </div>
                <div class="col-span-1 flex items-end">
                  <button @click="removeUnifiedPromoRule(idx)" type="button" class="w-full h-8 flex items-center justify-center rounded-lg hover:bg-red-500 hover:text-white text-red-400 border border-slate-200 bg-white transition-all text-xs">
                    <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <hr class="border-slate-100" />

            <!-- Rewards -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs font-black uppercase tracking-widest text-slate-500">Rewards</p>
                <button @click="addUnifiedPromoReward" type="button" class="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Icon name="heroicons:plus" class="w-3.5 h-3.5" /> Add Reward
                </button>
              </div>
              <p class="text-[11px] text-slate-400 mb-3">
                Use Option Group to let salesman choose.
              </p>
              <div v-for="(reward, idx) in unifiedPromoForm.rewards" :key="idx" class="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 space-y-3">
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="field-label-p text-[10px]">Option Group</label>
                    <input v-model.number="reward.option_group" type="number" min="1" class="field-input-p text-xs py-1.5" placeholder="1" />
                  </div>
                  <div>
                    <label class="field-label-p text-[10px]">Reward Type</label>
                    <select v-model="reward.reward_type" class="field-input-p text-xs py-1.5">
                      <option value="foc">FOC (Free Item)</option>
                      <option v-if="unifiedPromoForm.promotion_type !== 'bundle'" value="discount_pct">% Discount</option>
                      <option v-if="unifiedPromoForm.promotion_type !== 'bundle'" value="discount_flat">Flat $ Discount</option>
                    </select>
                  </div>
                  <div>
                    <label class="field-label-p text-[10px]">Min Qty Trigger (CTN)</label>
                    <input v-model.number="reward.min_qty_trigger" type="number" min="0" step="0.01" class="field-input-p text-xs py-1.5" placeholder="null" />
                  </div>
                </div>

                <div v-if="reward.reward_type === 'foc'" class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="field-label-p text-[10px]">Free Product</label>
                    <select v-model.number="reward.foc_product_id" class="field-input-p text-xs py-1.5">
                      <option value="">Select…</option>
                      <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="field-label-p text-[10px]">Free Qty</label>
                    <input v-model.number="reward.foc_qty" type="number" min="0.01" step="0.01" class="field-input-p text-xs py-1.5" />
                  </div>
                  <div>
                    <label class="field-label-p text-[10px]">Free Unit</label>
                    <input v-model="reward.foc_unit" class="field-input-p text-xs py-1.5" placeholder="box" />
                  </div>
                </div>

                <div v-else class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="field-label-p text-[10px]">{{ reward.reward_type === 'discount_pct' ? 'Discount %' : 'Discount Amount ($)' }}</label>
                    <input v-model.number="reward.discount_value" type="number" min="0" step="0.01" class="field-input-p text-xs py-1.5" />
                  </div>
                </div>
                <div class="flex justify-end">
                  <button @click="removeUnifiedPromoReward(idx)" type="button" class="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                    <Icon name="heroicons:trash" class="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            </div>

            <p v-if="unifiedPromoError" class="text-red-500 text-xs font-bold bg-red-50 rounded-xl px-4 py-3">{{ unifiedPromoError }}</p>
          </div>

          <div class="flex gap-3 p-6 border-t border-slate-100">
            <button @click="showUnifiedPromoModal = false" class="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
            <button @click="saveUnifiedPromotion" :disabled="savingUnifiedPromo" class="flex-1 py-3 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest hover:bg-purple-700 disabled:opacity-50 transition-all">
              {{ savingUnifiedPromo ? 'Saving…' : (isEditingUnifiedPromo ? 'Update Promotion' : 'Create Promotion') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bundle Modal -->
      <div v-if="isBundleModalOpen" class="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
        <div class="bg-white border border-slate-200 w-full max-w-2xl p-8 rounded-[2rem] shadow-2xl relative overflow-y-auto max-h-[95vh] scrollbar-hide">
          <button @click="closeBundleModal" class="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 p-2 rounded-full">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
          
          <div class="mb-8">
            <h3 class="text-2xl font-black text-slate-900 leading-none mb-2">{{ isEditingBundle ? 'Edit Bundle' : 'New Bundle' }}</h3>
            <p class="text-slate-500 text-xs font-medium uppercase tracking-widest leading-none">Configure required items and FOC rewards.</p>
          </div>
          
          <form @submit.prevent="saveBundle" class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label text-[10px] text-slate-500">Bundle Name</label>
                <input v-model="bundleForm.name" type="text" class="input-field-modern-admin" required placeholder="e.g. Bundle 1" />
              </div>
              <div>
                <label class="label text-[10px] text-slate-500">Target Outlet Type</label>
                <div class="relative">
                  <select v-model="bundleForm.target_outlet_type" class="input-field-modern-admin appearance-none cursor-pointer">
                    <option value="all">All Outlets</option>
                    <option value="existing">Existing Outlets</option>
                    <option value="new">New Outlets</option>
                  </select>
                  <Icon name="heroicons:chevron-up-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <!-- Requirements -->
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div class="flex justify-between items-center mb-4">
                <label class="label text-[10px] text-slate-900 mb-0">Products Required in Cart</label>
                <button type="button" @click="addRequirement" class="text-xs text-indigo-600 font-bold uppercase tracking-widest hover:text-indigo-800 transition-colors">+ Add Requirement</button>
              </div>
              <div v-for="(req, idx) in bundleForm.requirements" :key="idx" class="flex gap-2 mb-3 items-center">
                <div class="relative flex-1">
                  <select v-model="req.type_and_id" @change="onRequirementTypeChange(req)" class="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 appearance-none outline-none focus:border-indigo-400 focus:ring-[3px] focus:ring-indigo-400/10 cursor-pointer" required>
                    <option value="">Select Product or Category...</option>
                    <optgroup label="Categories">
                      <option v-for="c in categories" :key="'cat_'+c.id" :value="'cat_'+c.id">📂 [Category] {{ c.name }}</option>
                    </optgroup>
                    <optgroup label="Products">
                      <option v-for="p in products" :key="'prod_'+p.id" :value="'prod_'+p.id">🛍️ {{ p.name }}</option>
                    </optgroup>
                  </select>
                  <Icon name="heroicons:chevron-up-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <input v-model.number="req.required_qty" type="number" min="0.01" step="0.01" class="w-20 bg-white border border-slate-200 rounded-xl px-2 py-3 text-xs font-semibold text-slate-800 outline-none text-center focus:border-indigo-400 focus:ring-[3px] focus:ring-indigo-400/10" placeholder="Qty" required />
                <div class="relative w-24 shrink-0">
                  <select v-model="req.required_unit" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-xs font-semibold text-slate-800 appearance-none outline-none focus:border-indigo-400 focus:ring-[3px] focus:ring-indigo-400/10 cursor-pointer">
                    <option v-for="u in getRequirementUnits(req)" :key="u" :value="u">{{ u }}</option>
                    <option value="">Any</option>
                  </select>
                  <Icon name="heroicons:chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                <button type="button" @click="removeRequirement(idx)" class="w-10 h-10 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors"><Icon name="heroicons:trash" class="w-5 h-5" /></button>
              </div>
              <p v-if="!bundleForm.requirements.length" class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold text-center py-4">No requirements added yet.</p>
            </div>

            <!-- FOCs -->
            <div class="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div class="flex justify-between items-center mb-4">
                <label class="label text-[10px] text-emerald-800 mb-0">Free of Charge (FOC) Rewards</label>
                <button type="button" @click="addFoc" class="text-xs text-emerald-600 font-bold uppercase tracking-widest hover:text-emerald-800 transition-colors">+ Add FOC</button>
              </div>
              <div v-for="(foc, idx) in bundleForm.focs" :key="'foc'+idx" class="flex gap-2 mb-3 items-center">
                <div class="relative flex-1">
                  <select v-model="foc.product_id" @change="onFocProductChange(foc)" class="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 appearance-none outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/10 cursor-pointer" required>
                    <option value="">Select FOC Product...</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                  <Icon name="heroicons:chevron-up-down" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <input v-model.number="foc.qty" type="number" min="1" class="w-20 bg-white border border-emerald-200 rounded-xl px-3 py-3 text-xs font-semibold text-slate-800 outline-none text-center focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/10" placeholder="Qty" required />
                <div class="relative w-24 shrink-0">
                  <select v-model="foc.unit" class="w-full bg-white border border-emerald-200 rounded-xl px-3 py-3 text-xs font-semibold text-slate-800 appearance-none outline-none focus:border-emerald-400 focus:ring-[3px] focus:ring-emerald-400/10 cursor-pointer" required>
                    <option v-for="u in getFocUnits(foc)" :key="u" :value="u">{{ u }}</option>
                  </select>
                  <Icon name="heroicons:chevron-down" class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
                <button type="button" @click="removeFoc(idx)" class="w-10 h-10 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-colors"><Icon name="heroicons:trash" class="w-5 h-5" /></button>
              </div>
              <p v-if="!bundleForm.focs.length" class="text-[10px] text-emerald-600/50 uppercase tracking-widest font-semibold text-center py-4">No FOC items added yet.</p>
            </div>

            <!-- Footer Actions -->
            <div class="bg-white rounded-3xl p-3 border border-slate-100 flex gap-4 shrink-0 shadow-xl shadow-slate-200/20 mt-8">
              <button type="button" @click="closeBundleModal" class="h-14 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all">Discard</button>
              <button type="submit" :disabled="savingBundle" class="h-14 flex-[1.5] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <span>{{ savingBundle ? 'Saving...' : (isEditingBundle ? 'Save Changes' : 'Create Bundle') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="toast"
        class="fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold"
        :class="toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
      >
        <Icon :name="toast.type === 'success' ? 'heroicons:check-circle' : 'heroicons:x-circle'" class="w-5 h-5 shrink-0" />
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'

const api = useApi()

const props = defineProps<{
  products: any[]
  categories: any[]
  promos: any[]
  unifiedPromos: any[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// UI state
const showGlobalFocRules = ref(false)
const syncingRate = ref(false)
const savingWholesale = ref(false)
const wholesaleId = ref<number | null>(null)
const activeSystem = ref('category')
const promoToggling = ref<number | null>(null)

// Global settings
const mtPromoActive = ref(true)
const mtCodActive = ref(true)
const mtCodDiscountPercent = ref(5.00)
const mtCreditDiscountPercent = ref(0.00)
const customExchangeRate = ref('')
const globalFocRules = ref<any[]>([])

const wholesaleSettings = ref({
  cod_discount_percent: 0.00,
  credit_discount_percent: 0.00
})

// Unified Promotion Modal State
const showUnifiedPromoModal = ref(false)
const isEditingUnifiedPromo = ref(false)
const editingUnifiedPromoId = ref<number | null>(null)
const savingUnifiedPromo = ref(false)
const unifiedPromoError = ref('')

const unifiedPromoForm = ref({
  name: '',
  memo_ref: '',
  promotion_type: 'category_tiered',
  channel_type: 'all',
  outlet_type: 'all',
  priority: 0,
  is_active: true,
  valid_from: '',
  valid_until: '',
  rules: [{ rule_type: 'product', target_id: '', min_qty: 1, unit: 'CTN' }],
  rewards: [{ option_group: 1, reward_type: 'foc', min_qty_trigger: null, foc_product_id: '', foc_qty: '', foc_unit: 'box', discount_value: null }],
})

// Category & Product Promos state
const promoTab = ref<'all' | 'category' | 'product'>('all')
const showPromoModal = ref(false)
const promoForm = reactive({
  id: null as number | null,
  name: '',
  target_type: 'category' as 'category' | 'product',
  product_id: null as number | null,
  category_id: null as number | null,
  category_ids: [null] as (number | null)[],
  is_mixed_mode: false,
  channel_type: 'all',
  selected_channels: ['all'] as string[],
  tiers: [] as any[]
})

// Bundle Promos state
const isBundleModalOpen = ref(false)
const isEditingBundle = ref(false)
const savingBundle = ref(false)
const bundles = ref<any[]>([])
const bundleForm = ref({
  id: null as number | null,
  name: '',
  target_outlet_type: 'all',
  requirements: [] as any[],
  focs: [] as any[]
})

// Local Toast State
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { message, type }
  toastTimer = setTimeout(() => { toast.value = null }, 3000)
}

// Computeds
const mixedComboPromos = computed(() => {
  return (props.unifiedPromos || []).filter(p => p.promotion_type === 'mixed_tiered')
})

const productPromos = computed(() => {
  return (props.promos || []).filter(p => 
    p.promotion_type === 'product_tiered' || 
    (p.rules && p.rules.length > 0 && p.rules.every((r: any) => r.rule_type === 'product') && p.promotion_type !== 'bundle')
  )
})

const activeProductPromoIds = computed(() => {
  const set = new Set<number>()
  productPromos.value.forEach((p: any) => {
    if (p.is_active) {
      if (p.product_id) set.add(Number(p.product_id))
      ;(p.rules || []).forEach((r: any) => {
        if (r.rule_type === 'product' && r.target_id) set.add(Number(r.target_id))
      })
    }
  })
  return set
})

function getCategoryOverriddenCount(catId: number): number {
  let count = 0
  const catProducts = (props.products || []).filter(p => Number(p.category_id) === Number(catId))
  catProducts.forEach(p => {
    if (activeProductPromoIds.value.has(Number(p.id))) count++
  })
  return count
}

function getProductForPromo(promo: any) {
  const prodId = promo.product_id || promo.rules?.find((r: any) => r.rule_type === 'product')?.target_id
  return (props.products || []).find(x => Number(x.id) === Number(prodId))
}

function setPromoTargetType(type: 'category' | 'product') {
  promoForm.target_type = type
  if (type === 'product') {
    promoForm.is_mixed_mode = false
    if (!promoForm.product_id && props.products.length > 0) {
      promoForm.product_id = props.products[0].id
      onPromoProductChange()
    }
  } else {
    if (!promoForm.category_id && props.categories.length > 0) {
      promoForm.category_id = props.categories[0].id
      onPromoCategoryChange()
    }
  }
}

function onPromoProductChange() {
  if (promoForm.product_id) {
    const prod = props.products.find(p => p.id === promoForm.product_id)
    if (prod) {
      promoForm.category_id = prod.category_id || null
      promoForm.category_ids = [prod.category_id || null]
      loadProductTiers(promoForm.product_id)
    }
  }
}

function loadProductTiers(productId: number, promoObj?: any) {
  let promo = (promoObj && Array.isArray(promoObj.rewards) && promoObj.rewards.length > 0) ? promoObj : null
  if (!promo && promoObj?.id) {
    promo = props.promos.find(p => p.id === promoObj.id)
  }
  if (!promo && productId) {
    promo = props.promos.find(p => 
      (p.promotion_type === 'product_tiered' || (p.rules || []).some((r: any) => r.rule_type === 'product' && Number(r.target_id) === Number(productId))) &&
      (Number(p.product_id) === Number(productId) || (p.rules || []).some((r: any) => r.rule_type === 'product' && Number(r.target_id) === Number(productId)))
    )
  }
  if (promo) {
    loadCategoryTiers(0, promo)
  } else {
    promoForm.tiers = []
    addTier()
  }
}

async function deleteProductPromo(promoId: number) {
  if (!confirm('Are you sure you want to delete this product promotion? The product will revert to receiving category promotions if available.')) return
  try {
    await api.del(`/admin/promotions/${promoId}`)
    emit('refresh')
    showToast('Product promotion deleted!')
  } catch (e: any) {
    showToast(e.response?._data?.message || 'Failed to delete product promotion', 'error')
  }
}

const groupedPromos = computed(() => {
  const groups: Record<number, any[]> = {}
  props.categories.forEach(c => {
    groups[c.id] = []
  })
  props.promos.forEach(p => {
    const catId = p.category_id
    if (groups[catId]) {
      groups[catId].push(p)
    }
  })
  return groups
})

const activeChannelStoreTypes = computed(() => {
  return [
    { id: 'regular', name: 'Regular Store (Pharmacy Retail)', code: 'retail', type_category: 'regular', icon: 'heroicons:building-storefront' },
    { id: 'new_store', name: 'New Store', code: 'new_store', type_category: 'new_store', icon: 'heroicons:sparkles' },
    { id: 'wholesale', name: 'Wholesale', code: 'wholesale', type_category: 'wholesale', icon: 'heroicons:cube' },
    { id: 'modern_trade', name: 'Modern Trade (MT)', code: 'mt', type_category: 'modern_trade', icon: 'heroicons:tag' }
  ]
})

function getCategoryName(id: number) {
  const cat = props.categories.find(c => c.id === id)
  return cat ? cat.name : 'Unknown Category'
}

function getRuleTargetName(rule: any) {
  if (rule.rule_type === 'category') {
    return getCategoryName(Number(rule.target_id))
  }
  const prod = props.products.find(p => p.id === Number(rule.target_id))
  return prod ? prod.name : `Product #${rule.target_id}`
}

function getTiersCountForGroup(group: any[]) {
  if (!group || group.length === 0) return 0
  const promo = group[0]
  if (!promo || !promo.rewards || !Array.isArray(promo.rewards)) return 0
  const hasOptions = promo.rewards.some((r: any) => r.option_group === 2)
  if (hasOptions) {
    return promo.rewards.filter((r: any) => r.option_group === 1 && (r.reward_type === 'discount_flat' || r.reward_type === 'discount_pct')).length
  }
  const seen = new Set()
  promo.rewards.forEach((r: any) => {
    seen.add(`${Number(r.min_qty_trigger || 0)}_${(r.trigger_unit || 'CTN').toUpperCase()}`)
  })
  return seen.size
}

function categoryHasOptions(group: any[]) {
  if (!group || group.length === 0) return false
  const promo = group[0]
  if (!promo || !promo.rewards) return false
  return (promo.rewards || []).some((r: any) => r.option_group === 2)
}

const emptyUnifiedPromoForm = () => ({
  name: '',
  memo_ref: '',
  promotion_type: 'category_tiered',
  channel_type: 'all',
  outlet_type: 'all',
  priority: 0,
  is_active: true,
  valid_from: '',
  valid_until: '',
  rules: [{ rule_type: 'product', target_id: '', min_qty: 1, unit: 'CTN' }],
  rewards: [{ option_group: 1, reward_type: 'foc', min_qty_trigger: null, foc_product_id: '', foc_qty: '', foc_unit: 'box', discount_value: null }],
})

// Methods
function handleAddButton() {
  if (activeSystem.value === 'mixed') {
    openNewPromotion()
    unifiedPromoForm.value.promotion_type = 'mixed_tiered'
    handlePromoTypeChange()
  } else if (activeSystem.value === 'bundle') {
    openBundleModal()
  } else if (activeSystem.value === 'category') {
    openPromoModal()
  } else {
    openNewPromotion()
  }
}

// ── NBC & Settings Sync Methods ──
async function syncNbcRate() {
  syncingRate.value = true
  try {
    const res = await api.get('/admin/global-settings/sync-nbc') as any
    if (res && res.rate) {
      customExchangeRate.value = String(res.rate)
      await saveGlobalSettings()
      alert('Exchange rate synced successfully from NBC server!')
      return
    }
  } catch (e) {
    console.warn('Server NBC sync failed, trying fallback...', e)
  }

  try {
    const targetUrl = 'https://www.nbc.gov.kh/english/economic_research/exchange_rate.php'
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl)
    const response = await fetch(proxyUrl)
    if (response.ok) {
      const html = await response.text()
      const match = html.match(/Official Exchange Rate[^<]*<[^>]+>\s*([\d,]+)/i)
      if (match) {
        const rate = parseInt((match[1] ?? '').replace(/,/g, ''))
        if (rate > 3800 && rate < 4500) {
          customExchangeRate.value = String(rate)
          await saveGlobalSettings()
          alert('Exchange rate synced successfully via browser proxy!')
          return
        }
      }
    }
    alert('Could not parse exchange rate. Enter it manually.')
  } catch (e) {
    alert('Could not fetch rate. Enter it manually.')
  } finally {
    syncingRate.value = false
  }
}

async function saveGlobalSettings() {
  try {
    const cleanedRules = globalFocRules.value.map(r => {
      const { _showChannelPopover, ...rest } = r
      return rest
    })
    await api.put('/admin/global-settings', {
      settings: {
        active_promotion_system: activeSystem.value,
        mt_promo_active: String(mtPromoActive.value),
        mt_cod_active: String(mtCodActive.value),
        mt_cod_discount_percent: String(mtCodDiscountPercent.value),
        mt_credit_discount_percent: String(mtCreditDiscountPercent.value),
        custom_exchange_rate: String(customExchangeRate.value),
        global_foc_rules: JSON.stringify(cleanedRules)
      }
    })
    await fetch('/api/maintenance/clear-cache?token=afc_reset_2024').catch(() => {})
    showToast('Settings saved!')
  } catch (e) {
    showToast('Failed to save settings', 'error')
  }
}

async function saveWholesaleSettings() {
  savingWholesale.value = true
  try {
    if (!wholesaleId.value) {
      const storeTypesRes = await api.get('/store-types')
      const wholesale = (storeTypesRes as any[]).find(p => p.name === 'Wholesale')
      if (wholesale) wholesaleId.value = wholesale.id
    }
    if (wholesaleId.value) {
      await api.put(`/admin/store-types/${wholesaleId.value}`, {
        name: 'Wholesale',
        visit_frequency: 'F1',
        cod_discount_percent: wholesaleSettings.value.cod_discount_percent,
        credit_discount_percent: wholesaleSettings.value.credit_discount_percent
      })
      showToast('Wholesale settings saved!')
    } else {
      const res = await api.post('/admin/store-types', {
        name: 'Wholesale',
        visit_frequency: 'F1',
        cod_discount_percent: wholesaleSettings.value.cod_discount_percent,
        credit_discount_percent: wholesaleSettings.value.credit_discount_percent
      }) as any
      if (res && res.id) wholesaleId.value = res.id
      showToast('Wholesale settings created & saved!')
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to save Wholesale settings', 'error')
  } finally {
    savingWholesale.value = false
  }
}

// ── Global FOC Rules Methods ──
function addGlobalFocRule() {
  globalFocRules.value.push({
    type: 'min_order_value',
    threshold: 50.00,
    product_id: '',
    qty: 2,
    unit: 'blister',
    disabled: false,
    channel_target: 'retail',
    apply_retail: true,
    apply_wholesale: false,
    apply_mt: false
  })
}

function removeGlobalFocRule(idx: number) {
  globalFocRules.value.splice(idx, 1)
}

function loadSettings() {
  api.get('/admin/global-settings').then((res: any) => {
    if (res) {
      if (res.active_promotion_system) activeSystem.value = res.active_promotion_system
      if (res.mt_promo_active !== undefined) {
        mtPromoActive.value = res.mt_promo_active === 'true'
        mtCodActive.value = res.mt_cod_active === 'true'
        mtCodDiscountPercent.value = res.mt_cod_discount_percent !== undefined ? Number(res.mt_cod_discount_percent) : 5.00
        mtCreditDiscountPercent.value = res.mt_credit_discount_percent !== undefined ? Number(res.mt_credit_discount_percent) : 0.00
      }
      customExchangeRate.value = res.custom_exchange_rate ? String(res.custom_exchange_rate) : ''
      if (res.global_foc_rules) {
        try {
          const rules = JSON.parse(res.global_foc_rules)
          globalFocRules.value = Array.isArray(rules) ? rules.map((r: any) => {
            const apply_retail = r.apply_retail !== undefined ? r.apply_retail : true
            const apply_wholesale = r.apply_wholesale !== undefined ? r.apply_wholesale : false
            const apply_mt = r.apply_mt !== undefined ? r.apply_mt : false
            let channel_target = r.channel_target || (apply_retail && apply_wholesale && apply_mt ? 'all' : 'retail')
            let selected_channels = Array.isArray(channel_target) ? channel_target : String(channel_target).split(',')
            return {
              ...r,
              apply_retail,
              apply_wholesale,
              apply_mt,
              channel_target,
              selected_channels,
              _showChannelPopover: false
            }
          }) : []
        } catch (e) {
          globalFocRules.value = []
        }
      }
    }
  }).catch(() => {})

  api.get('/store-types').then((res: any) => {
    const arr = res?.data || res
    if (Array.isArray(arr)) {
      const wholesale = arr.find(p => p.name === 'Wholesale')
      if (wholesale) {
        wholesaleId.value = wholesale.id
        wholesaleSettings.value.cod_discount_percent = Number(wholesale.cod_discount_percent) || 0
        wholesaleSettings.value.credit_discount_percent = Number(wholesale.credit_discount_percent) || 0
      }
    }
  }).catch(() => {})
}

// ── Channels Helper Functions ──
function getStoreTypeCode(st: any): string {
  const code = st.code || st.type_category || ''
  if (code === 'retail' || code === 'regular' || st.name.toLowerCase().includes('regular') || st.name.toLowerCase().includes('pharmacy')) return 'retail'
  if (code === 'mt' || code === 'modern_trade' || st.name.toLowerCase().includes('modern trade')) return 'mt'
  if (code === 'wholesale' || st.name.toLowerCase().includes('wholesale')) return 'wholesale'
  if (code === 'new_store' || st.name.toLowerCase().includes('new store')) return 'new_store'
  return code || String(st.id)
}

function getStoreTypeIconEmoji(st: any): string {
  const cat = st.type_category || st.code || ''
  if (cat === 'wholesale' || st.name.toLowerCase().includes('wholesale')) return '📦'
  if (cat === 'modern_trade' || cat === 'mt' || st.name.toLowerCase().includes('modern trade')) return '🏪'
  if (cat === 'new_store' || st.name.toLowerCase().includes('new store')) return '✨'
  return '🏥'
}

function getChannelSelectionSummary(selectedChannels: any): string {
  if (!selectedChannels || selectedChannels === 'all' || (Array.isArray(selectedChannels) && (selectedChannels.includes('all') || selectedChannels.length === 0))) {
    return '🌐 All Channels'
  }
  const arr = Array.isArray(selectedChannels) ? selectedChannels : String(selectedChannels).split(',')
  if (arr.length === 0 || arr.includes('all')) return '🌐 All Channels'
  const names = arr.map(code => {
    const st = activeChannelStoreTypes.value.find(s => getStoreTypeCode(s) === code)
    return st ? `${getStoreTypeIconEmoji(st)} ${st.name}` : code
  })
  return names.length === 1 ? (names[0] ?? '') : `${names.length} Channels selected`
}

function getChannelBadgesList(channelTarget: any): { label: string; icon: string; code: string }[] {
  if (!channelTarget || channelTarget === 'all' || (Array.isArray(channelTarget) && (channelTarget.includes('all') || channelTarget.length === 0))) {
    return [{ label: 'All Channels', icon: '🌐', code: 'all' }]
  }
  const arr = Array.isArray(channelTarget) ? channelTarget : String(channelTarget).split(',').map(s => s.trim()).filter(Boolean)
  if (arr.length === 0 || arr.includes('all')) {
    return [{ label: 'All Channels', icon: '🌐', code: 'all' }]
  }
  return arr.map(code => {
    const st = activeChannelStoreTypes.value.find(s => getStoreTypeCode(s) === code || s.id === code || s.code === code)
    return {
      label: st ? st.name : (code === 'retail' ? 'Regular Store' : (code === 'wholesale' ? 'Wholesale' : (code === 'mt' ? 'Modern Trade' : (code === 'new_store' ? 'New Store' : code)))),
      icon: st ? getStoreTypeIconEmoji(st) : '🏪',
      code
    }
  })
}

function isChannelSelected(selectedChannels: any, channelCode: string): boolean {
  if (!selectedChannels) return channelCode === 'all'
  const arr = Array.isArray(selectedChannels) ? selectedChannels : String(selectedChannels).split(',').map(s => s.trim()).filter(Boolean)
  if (arr.length === 0) return channelCode === 'all'
  if (channelCode === 'all') return arr.includes('all')
  if (arr.includes('all')) return true
  return arr.some(c => c === channelCode)
}

function toggleChannelSelection(targetObj: any, channelCode: string) {
  let current = Array.isArray(targetObj.selected_channels) ? [...targetObj.selected_channels] : []
  if (current.length === 0) {
    const existing = targetObj.channel_target || targetObj.channel_type || 'all'
    current = existing === 'all' ? ['all'] : String(existing).split(',').map(s => s.trim()).filter(Boolean)
  }
  if (channelCode === 'all') {
    current = ['all']
  } else {
    current = current.filter(c => c !== 'all')
    const idx = current.indexOf(channelCode)
    if (idx >= 0) current.splice(idx, 1)
    else current.push(channelCode)
    const activeCodes = activeChannelStoreTypes.value.map(st => getStoreTypeCode(st))
    if (activeCodes.every(code => current.includes(code))) current = ['all']
    if (current.length === 0) current = ['all']
  }
  targetObj.selected_channels = current
  targetObj.channel_target = current.includes('all') ? 'all' : current.join(',')
  targetObj.channel_type = current.includes('all') ? 'all' : current.join(',')
  targetObj.apply_retail = current.includes('all') || current.includes('retail') || current.includes('regular') || current.includes('new_store')
  targetObj.apply_wholesale = current.includes('all') || current.includes('wholesale')
  targetObj.apply_mt = current.includes('all') || current.includes('mt') || current.includes('modern_trade')
}

// ── Mixed / Unified Promo Modal Methods ──
function openNewPromotion() {
  unifiedPromoForm.value = emptyUnifiedPromoForm()
  isEditingUnifiedPromo.value = false
  editingUnifiedPromoId.value = null
  unifiedPromoError.value = ''
  showUnifiedPromoModal.value = true
}

function editPromotion(promo: any) {
  isEditingUnifiedPromo.value = true
  editingUnifiedPromoId.value = promo.id
  unifiedPromoError.value = ''
  unifiedPromoForm.value = {
    name: promo.name,
    memo_ref: promo.memo_ref ?? '',
    promotion_type: promo.promotion_type,
    channel_type: promo.channel_type,
    outlet_type: promo.outlet_type,
    priority: promo.priority ?? 0,
    is_active: promo.is_active,
    valid_from: promo.valid_from?.substring(0, 10) ?? '',
    valid_until: promo.valid_until?.substring(0, 10) ?? '',
    rules: (promo.rules ?? []).map((r: any) => ({ rule_type: r.rule_type, target_id: r.target_id, min_qty: r.min_qty, unit: r.unit })),
    rewards: (promo.rewards ?? []).map((r: any) => ({
      option_group: r.option_group, reward_type: r.reward_type, min_qty_trigger: r.min_qty_trigger ?? null,
      foc_product_id: r.foc_product_id ?? '', foc_qty: r.foc_qty ?? '', foc_unit: r.foc_unit ?? 'box', discount_value: r.discount_value ?? null
    })),
  }
  showUnifiedPromoModal.value = true
}

async function saveUnifiedPromotion() {
  savingUnifiedPromo.value = true
  unifiedPromoError.value = ''
  try {
    const f = unifiedPromoForm.value
    const payload = {
      ...f,
      memo_ref: f.memo_ref || null,
      valid_from: f.valid_from || null,
      valid_until: f.valid_until || null,
      rules: f.rules.map(r => ({ ...r, target_id: Number(r.target_id), min_qty: Number(r.min_qty), unit: r.unit || 'CTN' })),
      rewards: f.rewards.map(r => ({
        option_group: Number(r.option_group), reward_type: r.reward_type,
        min_qty_trigger: r.min_qty_trigger != null ? Number(r.min_qty_trigger) : null,
        foc_product_id: r.reward_type === 'foc' && r.foc_product_id ? Number(r.foc_product_id) : null,
        foc_qty: r.reward_type === 'foc' && r.foc_qty ? Number(r.foc_qty) : null,
        foc_unit: r.reward_type === 'foc' ? (r.foc_unit || 'box') : null,
        discount_value: r.reward_type !== 'foc' && r.discount_value != null ? Number(r.discount_value) : null,
      })),
    }
    if (isEditingUnifiedPromo.value) {
      await api.put(`/admin/promotions/${editingUnifiedPromoId.value}`, payload)
    } else {
      await api.post('/admin/promotions', payload)
    }
    emit('refresh')
    showUnifiedPromoModal.value = false
    showToast(isEditingUnifiedPromo.value ? 'Promotion updated!' : 'Promotion created!')
  } catch (e: any) {
    unifiedPromoError.value = e?.data?.message ?? e?.message ?? 'Failed to save promotion'
  } finally { savingUnifiedPromo.value = false }
}

async function togglePromoActive(promo: any) {
  promoToggling.value = promo.id
  try {
    const res = await api.patch(`/admin/promotions/${promo.id}/toggle-active`)
    promo.is_active = (res as any).is_active
  } catch (e) { console.error(e) } finally { promoToggling.value = null }
}

async function deletePromotion(promo: any) {
  if (!confirm(`Delete promotion "${promo.name}"?`)) return
  try {
    await api.del(`/admin/promotions/${promo.id}`)
    emit('refresh')
    showToast('Promotion deleted')
  } catch (e) { showToast('Failed to delete', 'error') }
}

function handlePromoTypeChange() {
  if (unifiedPromoForm.value.promotion_type === 'bundle') {
    unifiedPromoForm.value.rewards.forEach(r => { r.reward_type = 'foc' })
  } else if (unifiedPromoForm.value.promotion_type === 'mixed_tiered') {
    unifiedPromoForm.value.rules.forEach(r => { r.rule_type = 'category' })
  }
}

function addUnifiedPromoRule(forceType?: any) {
  const type = typeof forceType === 'string' ? forceType : (unifiedPromoForm.value.promotion_type === 'mixed_tiered' ? 'category' : 'product')
  unifiedPromoForm.value.rules.push({ rule_type: type, target_id: '', min_qty: 1, unit: 'CTN' })
}

function removeUnifiedPromoRule(idx: number) {
  unifiedPromoForm.value.rules.splice(idx, 1)
}

function addUnifiedPromoReward() {
  unifiedPromoForm.value.rewards.push({ option_group: 1, reward_type: 'foc', min_qty_trigger: null, foc_product_id: '', foc_qty: '', foc_unit: 'box', discount_value: null })
}

function removeUnifiedPromoReward(idx: number) {
  unifiedPromoForm.value.rewards.splice(idx, 1)
}

// ── Category Tiered Promo Methods ──
function openPromoModal(p?: any, isMixedForce?: boolean) {
  const isProduct = p?.promotion_type === 'product_tiered' || (p?.rules && p.rules.length > 0 && p.rules.every((r: any) => r.rule_type === 'product') && p.promotion_type !== 'bundle') || !!p?.product_id
  const isMixed = isMixedForce || p?.promotion_type === 'mixed_tiered' || activeSystem.value === 'mixed'
  const chType = p?.channel_type || 'all'
  promoForm.channel_type = chType

  let selChans = chType === 'all' ? ['all'] : (Array.isArray(chType) ? chType : String(chType).split(','))
  promoForm.selected_channels = selChans

  if (isProduct) {
    const targetProdId = Number(p.product_id || p.rules?.find((r: any) => r.rule_type === 'product')?.target_id || p.id)
    promoForm.id = p.id ?? null
    promoForm.name = p.name ?? ''
    promoForm.target_type = 'product'
    promoForm.product_id = targetProdId
    const prod = props.products.find(x => x.id === targetProdId)
    promoForm.category_id = prod?.category_id || null
    promoForm.category_ids = [promoForm.category_id]
    promoForm.is_mixed_mode = false
    loadCategoryTiers(0, p)
  } else if (p?.promotion_type === 'mixed_tiered') {
    promoForm.id = p.id ?? null
    promoForm.name = p.name ?? ''
    promoForm.target_type = 'category'
    promoForm.product_id = null
    const catIds = (p.rules || []).filter((r: any) => r.rule_type === 'category').map((r: any) => Number(r.target_id))
    promoForm.category_ids = catIds.length > 0 ? catIds : [p.category_id || null]
    promoForm.category_id = promoForm.category_ids[0] || null
    promoForm.is_mixed_mode = true
    loadCategoryTiers(promoForm.category_id || 0, p)
  } else if (p?.category_id || p?.rules?.some((r: any) => r.rule_type === 'category')) {
    const targetCatId = Number(p.category_id || p.rules?.find((r: any) => r.rule_type === 'category')?.target_id)
    promoForm.id = p.id ?? null
    promoForm.name = p.name ?? ''
    promoForm.target_type = 'category'
    promoForm.product_id = null
    promoForm.category_id = targetCatId
    promoForm.category_ids = [targetCatId]
    promoForm.is_mixed_mode = false
    loadCategoryTiers(targetCatId, p)
  } else {
    promoForm.id = null
    promoForm.name = ''
    promoForm.target_type = promoTab.value === 'product' ? 'product' : 'category'
    promoForm.product_id = promoForm.target_type === 'product' && props.products.length > 0 ? props.products[0].id : null
    promoForm.category_id = null
    promoForm.category_ids = isMixed ? [null, null] : [null]
    promoForm.is_mixed_mode = isMixed
    promoForm.channel_type = 'all'
    promoForm.selected_channels = ['all']
    promoForm.tiers = []
    if (promoForm.target_type === 'product' && promoForm.product_id) {
      loadProductTiers(promoForm.product_id)
    } else {
      addTier()
    }
  }
  showPromoModal.value = true
}

function getTriggerUnitFactor(catId: number | null, unitName?: string, prodId?: number | null): number {
  if (!unitName || unitName.toUpperCase() === 'CTN') return 1.0
  const effectiveProdId = prodId || (promoForm.target_type === 'product' ? promoForm.product_id : null)
  const sampleProd = effectiveProdId
    ? props.products?.find((p: any) => Number(p.id) === Number(effectiveProdId))
    : props.products?.find((p: any) => !catId || Number(p.category_id) === Number(catId))
  if (sampleProd && sampleProd.units) {
    const u = sampleProd.units.find((x: any) => x.name.toUpperCase() === unitName.toUpperCase())
    if (u && Number(u.carton_factor) > 0) {
      const raw = Number(u.carton_factor)
      return raw >= 1.0 ? (1.0 / raw) : raw
    }
  }
  return 0.1
}

function loadCategoryTiers(catId: number, promoObj?: any) {
  let promo = (promoObj && Array.isArray(promoObj.rewards) && promoObj.rewards.length > 0) ? promoObj : null

  if (!promo && promoObj?.id) {
    promo = props.promos.find(p => p.id === promoObj.id)
  }

  if (!promo && promoForm.target_type === 'product' && promoForm.product_id) {
    promo = props.promos.find(p => 
      (p.promotion_type === 'product_tiered' || (p.rules || []).some((r: any) => r.rule_type === 'product' && Number(r.target_id) === Number(promoForm.product_id))) &&
      (Number(p.product_id) === Number(promoForm.product_id) || (p.rules || []).some((r: any) => r.rule_type === 'product' && Number(r.target_id) === Number(promoForm.product_id)))
    )
  }

  if (!promo && catId) {
    promo = props.promos.find(p => 
      (p.promotion_type === 'category_tiered' || !p.promotion_type) && 
      (Number(p.category_id) === Number(catId) || (p.rules || []).some((r: any) => r.rule_type === 'category' && Number(r.target_id) === Number(catId)))
    )
  }

  if (promo) {
    promoForm.id = promo.id ?? null
    promoForm.name = promo.name ?? ''
    if (promo.promotion_type === 'product_tiered' || (promo.rules && promo.rules.length > 0 && promo.rules.every((r: any) => r.rule_type === 'product'))) {
      promoForm.target_type = 'product'
      const prodId = Number(promo.product_id || promo.rules?.find((r: any) => r.rule_type === 'product')?.target_id)
      if (prodId) promoForm.product_id = prodId
    }
    const chType = promo.channel_type || 'all'
    promoForm.channel_type = chType
    promoForm.selected_channels = typeof chType === 'string' ? (chType === 'all' ? ['all'] : chType.split(',').map(s => s.trim()).filter(Boolean)) : (Array.isArray(chType) ? chType : ['all'])

    const rewards = promo.rewards || []
    const hasOptions = rewards.some((r: any) => r.option_group === 2)
    let cards: any[] = []

    if (hasOptions) {
      const discountRewards = rewards.filter((r: any) => r.option_group === 1 && (r.reward_type === 'discount_flat' || r.reward_type === 'discount_pct')).sort((a: any, b: any) => {
        const aFactor = getTriggerUnitFactor(catId, a.trigger_unit)
        const bFactor = getTriggerUnitFactor(catId, b.trigger_unit)
        return (Number(a.min_qty_trigger || 0) * aFactor) - (Number(b.min_qty_trigger || 0) * bFactor)
      })
      cards = discountRewards.map((discountReward: any, idx: number) => {
        const nextDiscount = discountRewards[idx + 1]
        const minVal = Number(discountReward.min_qty_trigger || 1)
        const maxVal = discountReward.max_qty_trigger !== null && discountReward.max_qty_trigger !== undefined ? Number(discountReward.max_qty_trigger) : (nextDiscount ? Number(nextDiscount.min_qty_trigger) - 1 : null)
        const giftRewards = rewards.filter((r: any) => r.reward_type === 'foc' && r.option_group === 2 && (nextDiscount ? Number(r.min_qty_trigger) >= minVal && Number(r.min_qty_trigger) < Number(nextDiscount.min_qty_trigger) : Number(r.min_qty_trigger) >= minVal))

        const focsList = giftRewards.map((r: any) => ({
          free_product_id: r.foc_product_id ? Number(r.foc_product_id) : null,
          free_qty: Number(r.foc_qty || 0),
          free_unit: r.foc_unit || 'box',
          is_multiply: !!r.is_multiply,
          extra_foc: Number(r.extra_foc || 0),
          min_cartons: r.min_qty_trigger !== null && r.min_qty_trigger !== undefined ? Number(r.min_qty_trigger) : minVal,
          max_cartons: r.max_qty_trigger !== null && r.max_qty_trigger !== undefined ? Number(r.max_qty_trigger) : maxVal
        }))
        if (focsList.length === 0) {
          focsList.push({ free_product_id: null, free_qty: 1, free_unit: 'box', is_multiply: !!discountReward.is_multiply, extra_foc: Number(discountReward.extra_foc || 0), min_cartons: minVal, max_cartons: maxVal })
        }
        return {
          id: promo.id, min_cartons: minVal, max_cartons: maxVal,
          discount_amount: Number(discountReward.discount_value || 0), discount_type: discountReward.reward_type || 'discount_flat',
          free_product_id: focsList[0]?.free_product_id || null, free_qty: focsList[0]?.free_qty || 1, free_unit: focsList[0]?.free_unit || 'box',
          is_multiply: !!discountReward.is_multiply, extra_foc: Number(discountReward.extra_foc || 0),
          trigger_unit: discountReward.trigger_unit || giftRewards[0]?.trigger_unit || promo.rules?.[0]?.unit || 'CTN',
          is_option_choice: true, cash_expanded: true, foc_expanded: true, _reward_type: 'gift' as const,
          cash_min_cartons: minVal, cash_max_cartons: discountReward.max_qty_trigger !== null && discountReward.max_qty_trigger !== undefined ? Number(discountReward.max_qty_trigger) : null, focs: focsList
        }
      })
    } else {
      const distinctKeys: { minQty: number; unit: string; _ctn_eq: number }[] = []
      const seen = new Set<string>()
      rewards.forEach((r: any) => {
        const minQty = Number(r.min_qty_trigger || 0)
        const unit = r.trigger_unit || 'CTN'
        const k = `${minQty}_${unit.toUpperCase()}`
        if (!seen.has(k)) {
          seen.add(k)
          const factor = getTriggerUnitFactor(catId, unit)
          distinctKeys.push({ minQty, unit, _ctn_eq: minQty * factor })
        }
      })
      distinctKeys.sort((a, b) => a._ctn_eq - b._ctn_eq)

      cards = distinctKeys.map((tierKey, idx) => {
        const triggerQty = tierKey.minQty
        const trigUnit = tierKey.unit
        const tierRewards = rewards.filter((r: any) => Number(r.min_qty_trigger || 0) === triggerQty && (r.trigger_unit || 'CTN').toUpperCase() === trigUnit.toUpperCase())
        const discountReward = tierRewards.find((r: any) => r.reward_type === 'discount_flat' || r.reward_type === 'discount_pct')
        const giftReward = tierRewards.find((r: any) => r.reward_type === 'foc')
        const nextTierKey = distinctKeys[idx + 1]
        const dbMax = discountReward?.max_qty_trigger ?? giftReward?.max_qty_trigger
        const maxCartons = dbMax !== null && dbMax !== undefined ? Number(dbMax) : (nextTierKey && nextTierKey.unit === trigUnit ? Number(nextTierKey.minQty) - 1 : null)
        const isMultiply = discountReward ? !!discountReward.is_multiply : (giftReward ? !!giftReward.is_multiply : false)
        const extraFoc = discountReward ? Number(discountReward.extra_foc || 0) : (giftReward ? Number(giftReward.extra_foc || 0) : 0)

        const giftRewards = tierRewards.filter((r: any) => r.reward_type === 'foc' && (r.option_group === 1 || !r.option_group))
        const focsList = giftRewards.map((r: any) => ({
          free_product_id: r.foc_product_id ? Number(r.foc_product_id) : null,
          free_qty: Number(r.foc_qty || 0),
          free_unit: r.foc_unit || 'box',
          is_multiply: !!r.is_multiply,
          extra_foc: Number(r.extra_foc || 0),
          min_cartons: r.min_qty_trigger !== null && r.min_qty_trigger !== undefined ? Number(r.min_qty_trigger) : (triggerQty || 1),
          max_cartons: r.max_qty_trigger !== null && r.max_qty_trigger !== undefined ? Number(r.max_qty_trigger) : maxCartons
        }))
        if (focsList.length === 0 && giftReward) {
          focsList.push({ free_product_id: giftReward.foc_product_id ? Number(giftReward.foc_product_id) : null, free_qty: Number(giftReward.foc_qty || 1), free_unit: giftReward.foc_unit || 'box', is_multiply: isMultiply, extra_foc: extraFoc, min_cartons: triggerQty || 1, max_cartons: maxCartons })
        } else if (focsList.length === 0) {
          focsList.push({ free_product_id: null, free_qty: 1, free_unit: 'box', is_multiply: isMultiply, extra_foc: extraFoc, min_cartons: triggerQty || 1, max_cartons: maxCartons })
        }

        return {
          id: promo.id, min_cartons: triggerQty || 1, max_cartons: maxCartons,
          discount_amount: discountReward ? Number(discountReward.discount_value) : 0, discount_type: discountReward ? discountReward.reward_type : 'discount_flat',
          free_product_id: focsList[0]?.free_product_id || null, free_qty: focsList[0]?.free_qty || 1, free_unit: focsList[0]?.free_unit || 'box',
          is_multiply: isMultiply, extra_foc: extraFoc,
          trigger_unit: trigUnit || discountReward?.trigger_unit || giftReward?.trigger_unit || promo.rules?.[0]?.unit || 'CTN',
          is_option_choice: false, cash_expanded: true, foc_expanded: true, _reward_type: giftRewards.length > 0 ? 'gift' : (discountReward ? 'cash' : 'none'),
          cash_min_cartons: discountReward?.min_qty_trigger !== null && discountReward?.min_qty_trigger !== undefined ? Number(discountReward?.min_qty_trigger) : (triggerQty || 1),
          cash_max_cartons: discountReward?.max_qty_trigger !== null && discountReward?.max_qty_trigger !== undefined ? Number(discountReward?.max_qty_trigger) : maxCartons, focs: focsList
        }
      })
    }
    promoForm.tiers = cards
  } else {
    promoForm.tiers = []
  }
  if (promoForm.tiers.length === 0) addTier()
}

function addTier() {
  promoForm.tiers.push({
    min_cartons: 1, max_cartons: null, discount_amount: 0, discount_type: 'discount_flat',
    free_product_id: null, free_qty: 1, free_unit: '', is_active: true, is_multiply: false, extra_foc: 0,
    trigger_unit: 'CTN', is_option_choice: false, cash_expanded: true, foc_expanded: true, _reward_type: 'none',
    cash_min_cartons: 1, cash_max_cartons: null,
    focs: [{ free_product_id: null, free_qty: 1, free_unit: 'box', is_multiply: false, extra_foc: 0, min_cartons: 1, max_cartons: null }]
  })
}

function removeTier(idx: number) {
  promoForm.tiers.splice(idx, 1)
}

function addCategoryToPromoForm() {
  promoForm.category_ids.push(null)
  if (promoForm.category_ids.length > 1) promoForm.is_mixed_mode = true
}

function removeCategoryFromPromoForm(idx: number) {
  promoForm.category_ids.splice(idx, 1)
  if (promoForm.category_ids.length <= 1) promoForm.is_mixed_mode = false
}

function onPromoCategoryChange() {
  if (promoForm.category_id) {
    promoForm.category_ids = [promoForm.category_id]
    loadCategoryTiers(promoForm.category_id)
  }
}

function getCategoryTriggerUnits() {
  if (promoForm.target_type === 'product') {
    if (promoForm.product_id) {
      const prod = (props.products || []).find((p: any) => Number(p.id) === Number(promoForm.product_id))
      const unitsSet = new Set<string>()
      if (prod) {
        if (prod.unit && typeof prod.unit === 'string' && prod.unit.trim()) {
          unitsSet.add(prod.unit.trim().toUpperCase())
        }
        if (Array.isArray(prod.units)) {
          prod.units.forEach((u: any) => {
            if (u && u.name && typeof u.name === 'string' && u.name.trim()) {
              unitsSet.add(u.name.trim().toUpperCase())
            }
          })
        }
      }
      if (unitsSet.size === 0) return ['CTN']
      const list = Array.from(unitsSet)
      if (list.includes('CTN')) return ['CTN', ...list.filter(u => u !== 'CTN')]
      return list
    }
    return ['CTN']
  }

  const catIds: number[] = []
  if (promoForm.is_mixed_mode && Array.isArray(promoForm.category_ids)) {
    promoForm.category_ids.forEach((id: any) => {
      if (id) catIds.push(Number(id))
    })
  } else if (promoForm.category_id) {
    catIds.push(Number(promoForm.category_id))
  }

  const unitsSet = new Set<string>()
  const prods = catIds.length > 0
    ? (props.products || []).filter((p: any) => catIds.includes(Number(p.category_id)))
    : (props.products || [])

  prods.forEach((p: any) => {
    if (p.unit && typeof p.unit === 'string' && p.unit.trim()) {
      unitsSet.add(p.unit.trim().toUpperCase())
    }
    if (Array.isArray(p.units)) {
      p.units.forEach((u: any) => {
        if (u && u.name && typeof u.name === 'string' && u.name.trim()) {
          unitsSet.add(u.name.trim().toUpperCase())
        }
      })
    }
  })

  if (unitsSet.size === 0) {
    return ['CTN']
  }
  const list = Array.from(unitsSet)
  if (list.includes('CTN')) {
    return ['CTN', ...list.filter(u => u !== 'CTN')]
  }
  return list
}

function addFocItem(tier: any) {
  if (!tier.focs) tier.focs = []
  tier.focs.push({ free_product_id: null, free_qty: 1, free_unit: 'box', is_multiply: false, extra_foc: 0, min_cartons: tier.min_cartons || 1, max_cartons: tier.max_cartons || null })
}

function removeFocItem(tier: any, idx: number) {
  if (tier.focs && tier.focs.length > 1) tier.focs.splice(idx, 1)
}

function onCategoryFocProductChange(foc: any) {
  if (foc.free_product_id) {
    const p = props.products.find(x => x.id === foc.free_product_id)
    if (p && p.unit) foc.free_unit = p.unit
  }
}

function getFocProductUnits(foc: any) {
  let units: { name: string }[] = []
  if (!foc.free_product_id) {
    props.products.forEach(p => {
      if (p.unit && !units.find(u => u.name.toUpperCase() === p.unit.toUpperCase())) units.push({ name: p.unit })
    })
  } else {
    const p = props.products.find(x => x.id === foc.free_product_id)
    if (p) {
      if (p.unit) units.push({ name: p.unit })
      if (p.units) p.units.forEach((u: any) => { if (!units.find(e => e.name === u.name)) units.push({ name: u.name }) })
    }
  }
  return units
}

function getFocUnits(rule: any) {
  if (!rule.product_id) return ['CTN', 'BOX', 'PCS']
  const p = props.products.find(x => x.id == rule.product_id)
  if (!p) return ['CTN', 'BOX', 'PCS']
  const units: string[] = []
  if (p.unit) units.push(p.unit)
  if (p.units) p.units.forEach((u: any) => { if (!units.includes(u.name)) units.push(u.name) })
  return units.length ? units : ['CTN', 'BOX', 'PCS']
}

function onFocProductChange(rule: any) {
  if (rule.product_id) {
    const units = getFocUnits(rule)
    if (units.length > 0 && !units.includes(rule.unit)) rule.unit = units[0]
  }
}

function getMaxCartonsPlaceholder(tier: any) {
  if (!promoForm.tiers || promoForm.tiers.length <= 1) return '∞'
  const isProd = promoForm.target_type === 'product'
  const targetId = isProd ? promoForm.product_id : (promoForm.category_id || (promoForm.category_ids && promoForm.category_ids[0]) || null)
  const sorted = [...promoForm.tiers].map((t: any) => ({
    ...t,
    _ctn_eq: Number(t.min_cartons || 0) * getTriggerUnitFactor(targetId, t.trigger_unit, isProd ? targetId : null)
  })).sort((a, b) => a._ctn_eq - b._ctn_eq)
  const idx = sorted.findIndex((t: any) => t.min_cartons === tier.min_cartons && t.trigger_unit === tier.trigger_unit)
  if (idx !== -1 && sorted[idx + 1] && sorted[idx + 1].trigger_unit === tier.trigger_unit) {
    return String(Number(sorted[idx + 1].min_cartons) - 1)
  }
  return '∞'
}

async function savePromo() {
  const isProduct = promoForm.target_type === 'product'
  let targetProduct: any = null
  const validCatIds = (promoForm.category_ids || []).filter((id): id is number => id !== null && id !== undefined && !isNaN(Number(id)))

  if (isProduct) {
    if (!promoForm.product_id) {
      alert('Please select a target product.')
      return
    }
    targetProduct = (props.products || []).find((p: any) => Number(p.id) === Number(promoForm.product_id))
  } else {
    if (validCatIds.length === 0) {
      alert('Please select at least one target category.')
      return
    }
  }

  for (let i = 0; i < promoForm.tiers.length; i++) {
    const tier = promoForm.tiers[i]
    const hasFocs = tier.focs && tier.focs.length > 0

    if (tier.is_option_choice) {
      const minVals = [Number(tier.cash_min_cartons) || 1, ...(tier.focs || []).map((f: any) => Number(f.min_cartons) || 1)]
      tier.min_cartons = Math.min(...minVals)
      const maxVals = [tier.cash_max_cartons !== null && tier.cash_max_cartons !== '' ? Number(tier.cash_max_cartons) : 999999, ...(tier.focs || []).map((f: any) => f.max_cartons !== null && f.max_cartons !== '' ? Number(f.max_cartons) : 999999)]
      const maxVal = Math.max(...maxVals)
      tier.max_cartons = maxVal >= 999999 ? null : maxVal

      if (!tier.discount_amount || Number(tier.discount_amount) <= 0) {
        alert(`Tier ${i + 1}: Please enter a valid Cash Discount.`)
        return
      }
      if (hasFocs) {
        for (let j = 0; j < tier.focs.length; j++) {
          const foc = tier.focs[j]
          if (!foc.free_product_id || !foc.free_qty || Number(foc.free_qty) <= 0) {
            alert(`Tier ${i + 1}: Please select product and qty for Gift #${j + 1}.`)
            return
          }
        }
      }
    } else {
      if (tier._reward_type === 'cash') {
        if (!tier.discount_amount || Number(tier.discount_amount) <= 0) {
          alert(`Tier ${i + 1}: Please enter a valid Cash Discount.`)
          return
        }
      } else if (tier._reward_type === 'gift') {
        if (hasFocs) {
          for (let j = 0; j < tier.focs.length; j++) {
            const foc = tier.focs[j]
            if (!foc.free_product_id || !foc.free_qty || Number(foc.free_qty) <= 0) {
              alert(`Tier ${i + 1}: Please enter product and qty for Gift #${j + 1}.`)
              return
            }
          }
        }
      } else {
        alert(`Tier ${i + 1}: Please choose a Reward Strategy.`)
        return
      }
    }

    if (hasFocs && tier.focs[0]) {
      tier.free_product_id = tier.focs[0].free_product_id
      tier.free_qty = tier.focs[0].free_qty
      tier.free_unit = tier.focs[0].free_unit
      if (!tier.is_option_choice && tier._reward_type !== 'cash') {
        tier.is_multiply = tier.focs[0].is_multiply ? 1 : 0
        tier.extra_foc = tier.focs[0].extra_foc
      }
    }
  }

  if (!isProduct && (validCatIds.length > 1 || promoForm.is_mixed_mode)) {
    const rewardsPayload: any[] = []
    promoForm.tiers.forEach((tier: any) => {
      if (tier.is_option_choice) {
        rewardsPayload.push({
          option_group: 1,
          reward_type: tier.discount_type || 'discount_pct',
          discount_value: Number(tier.discount_amount || 0),
          min_qty_trigger: Number(tier.cash_min_cartons || tier.min_cartons || 1),
          max_qty_trigger: tier.cash_max_cartons ? Number(tier.cash_max_cartons) : (tier.max_cartons ? Number(tier.max_cartons) : null),
          trigger_unit: tier.trigger_unit || 'CTN',
          is_multiply: !!tier.is_multiply,
          extra_foc: Number(tier.extra_foc || 0)
        })
        const focsList = tier.focs || []
        focsList.forEach((foc: any) => {
          if (foc.free_product_id) {
            rewardsPayload.push({
              option_group: 2,
              reward_type: 'foc',
              foc_product_id: Number(foc.free_product_id),
              foc_qty: Number(foc.free_qty || 1),
              foc_unit: foc.free_unit || 'box',
              min_qty_trigger: Number(foc.min_cartons || tier.min_cartons || 1),
              max_qty_trigger: foc.max_cartons ? Number(foc.max_cartons) : (tier.max_cartons ? Number(tier.max_cartons) : null),
              trigger_unit: tier.trigger_unit || 'CTN',
              is_multiply: !!foc.is_multiply,
              extra_foc: Number(foc.extra_foc || 0)
            })
          }
        })
      } else if (tier._reward_type === 'cash') {
        rewardsPayload.push({
          option_group: 1,
          reward_type: tier.discount_type || 'discount_flat',
          discount_value: Number(tier.discount_amount || 0),
          min_qty_trigger: Number(tier.min_cartons || 1),
          max_qty_trigger: tier.max_cartons ? Number(tier.max_cartons) : null,
          trigger_unit: tier.trigger_unit || 'CTN',
          is_multiply: !!tier.is_multiply,
          extra_foc: Number(tier.extra_foc || 0)
        })
      } else if (tier._reward_type === 'gift') {
        const focsList = tier.focs || []
        focsList.forEach((foc: any) => {
          if (foc.free_product_id) {
            rewardsPayload.push({
              option_group: 1,
              reward_type: 'foc',
              foc_product_id: Number(foc.free_product_id),
              foc_qty: Number(foc.free_qty || 1),
              foc_unit: foc.free_unit || 'box',
              min_qty_trigger: Number(tier.min_cartons || 1),
              max_qty_trigger: tier.max_cartons ? Number(tier.max_cartons) : null,
              trigger_unit: tier.trigger_unit || 'CTN',
              is_multiply: !!foc.is_multiply,
              extra_foc: Number(foc.extra_foc || 0)
            })
          }
        })
      }
    })

    const catNames = validCatIds.map(id => getCategoryName(id)).join(' + ')
    const payload = {
      name: promoForm.name || `Mixed Combo: ${catNames}`,
      promotion_type: 'mixed_tiered',
      channel_type: promoForm.channel_type || 'all',
      outlet_type: 'all',
      priority: 0,
      is_active: true,
      rules: validCatIds.map(id => ({ rule_type: 'category', target_id: Number(id), min_qty: 1, unit: 'CTN' })),
      rewards: rewardsPayload
    }

    try {
      if (promoForm.id) await api.put(`/admin/promotions/${promoForm.id}`, payload)
      else await api.post('/admin/promotions', payload)
      emit('refresh')
      showToast('Mixed Combo promotion saved successfully!')
      showPromoModal.value = false
    } catch (e: any) {
      alert(e.response?._data?.message || e.message || 'Failed to save Combo promotion')
    }
    return
  }

  const cleanedTiers = promoForm.tiers.map((tier: any) => {
    const cleaned = JSON.parse(JSON.stringify(tier))
    if (!cleaned.is_option_choice) {
      if (cleaned._reward_type === 'cash') {
        cleaned.free_product_id = null
        cleaned.free_qty = null
        cleaned.free_unit = null
        cleaned.is_multiply = null
        cleaned.extra_foc = null
        cleaned.focs = []
      } else if (cleaned._reward_type === 'gift') {
        cleaned.discount_amount = null
        cleaned.discount_type = null
        if (cleaned.focs) cleaned.focs = cleaned.focs.filter((f: any) => f.free_product_id)
      }
    } else {
      if (cleaned.focs) cleaned.focs = cleaned.focs.filter((f: any) => f.free_product_id)
    }
    return cleaned
  })

  const fallbackCatId = isProduct ? (targetProduct?.category_id || null) : validCatIds[0]

  try {
    const res = await api.post('/admin/promotions/sync', {
      target_type: isProduct ? 'product' : 'category',
      product_id: isProduct ? Number(promoForm.product_id) : null,
      category_id: fallbackCatId,
      channel_type: promoForm.channel_type || 'all',
      tiers: cleanedTiers
    }) as any
    emit('refresh')
    if (res && res.migration_error) alert('Promotions saved, database migration failed: ' + res.migration_error)
    else showToast(isProduct ? 'Product promotion saved successfully!' : 'Category promotion saved successfully!')
    showPromoModal.value = false
  } catch (e: any) { alert(e.data?.message || 'Error sync') }
}

async function deleteCategoryPromos(catId: number) {
  if (!confirm('Delete all promotion tiers for this category?')) return
  const promo = props.promos.find(p => p.promotion_type === 'category_tiered' && p.category_id === catId)
  if (promo) await api.del(`/admin/promotions/${promo.id}`)
  emit('refresh')
}

// ── Bundle Promo Methods ──
async function loadBundles() {
  try {
    let rawBundles: any[] = []
    if (props.unifiedPromos.length > 0) rawBundles = props.unifiedPromos.filter((p: any) => p.promotion_type === 'bundle')
    else {
      const all = await api.get('/admin/promotions').catch(() => []) as any[]
      rawBundles = all.filter((p: any) => p.promotion_type === 'bundle')
    }
    bundles.value = rawBundles.map((promo: any) => {
      const requirements = (promo.rules || []).map((rule: any) => ({
        id: rule.id,
        product_id: rule.rule_type === 'product' ? Number(rule.target_id) : null,
        category_id: rule.rule_type === 'category' ? Number(rule.target_id) : null,
        required_qty: Number(rule.min_qty),
        required_unit: rule.unit || 'CTN',
        product: rule.product,
        category: rule.category
      }))
      const focs = (promo.rewards || []).filter((r: any) => r.reward_type === 'foc').map((reward: any) => ({
        id: reward.id,
        product_id: reward.foc_product_id,
        qty: Number(reward.foc_qty || 0),
        unit: reward.foc_unit || 'BOX',
        product: reward.foc_product || reward.focProduct
      }))
      return { ...promo, requirements, focs }
    })
  } catch (e) { console.error(e) }
}

function openBundleModal(bundle = null) {
  if (bundle) {
    isEditingBundle.value = true
    const requirements = JSON.parse(JSON.stringify((bundle as any).requirements)).map((req: any) => {
      req.type_and_id = req.category_id ? `cat_${req.category_id}` : (req.product_id ? `prod_${req.product_id}` : '')
      return req
    })
    bundleForm.value = {
      id: (bundle as any).id,
      name: (bundle as any).name,
      target_outlet_type: (bundle as any).outlet_type || 'all',
      requirements: requirements,
      focs: JSON.parse(JSON.stringify((bundle as any).focs))
    }
  } else {
    isEditingBundle.value = false
    bundleForm.value = { id: null, name: '', target_outlet_type: 'all', requirements: [], focs: [] }
  }
  isBundleModalOpen.value = true
}

function closeBundleModal() { isBundleModalOpen.value = false }
function addRequirement() { bundleForm.value.requirements.push({ product_id: null, category_id: null, type_and_id: '', required_qty: 1, required_unit: 'CTN' }) }

function getRequirementUnits(req: any) {
  const units: string[] = []
  if (req.product_id) {
    const p = props.products.find(x => x.id == req.product_id)
    if (p) {
      if (p.unit) units.push(p.unit)
      if (p.units) p.units.forEach((u: any) => { if (!units.includes(u.name)) units.push(u.name) })
    }
  } else if (req.category_id) {
    props.products.filter(p => p.category_id == req.category_id).forEach(p => {
      if (p.unit && !units.includes(p.unit)) units.push(p.unit)
    })
  }
  return units.length ? units : ['CTN', 'BOX', 'PCS']
}

function onRequirementTypeChange(req: any) {
  if (req.type_and_id && req.type_and_id.startsWith('prod_')) {
    req.product_id = parseInt(req.type_and_id.replace('prod_', ''))
    req.category_id = null
  } else if (req.type_and_id && req.type_and_id.startsWith('cat_')) {
    req.category_id = parseInt(req.type_and_id.replace('cat_', ''))
    req.product_id = null
  } else {
    req.product_id = null
    req.category_id = null
  }
  const units = getRequirementUnits(req)
  if (units.length > 0) req.required_unit = units[0]
}

function removeRequirement(idx: number) { bundleForm.value.requirements.splice(idx, 1) }
function addFoc() { bundleForm.value.focs.push({ product_id: '', qty: 1, unit: 'BOX' }) }
function removeFoc(idx: number) { bundleForm.value.focs.splice(idx, 1) }

async function saveBundle() {
  savingBundle.value = true
  try {
    const rules = bundleForm.value.requirements.map((req: any) => ({
      rule_type: req.category_id ? 'category' : 'product',
      target_id: req.category_id ? req.category_id : req.product_id,
      min_qty: req.required_qty,
      unit: req.required_unit || 'CTN'
    }))
    const rewards = bundleForm.value.focs.map((foc: any) => ({
      option_group: 1, reward_type: 'foc', foc_product_id: foc.product_id, foc_qty: foc.qty, foc_unit: foc.unit || 'BOX', min_qty_trigger: null
    }))
    const payload = {
      name: bundleForm.value.name, promotion_type: 'bundle',
      target_outlet_type: bundleForm.value.target_outlet_type || 'all', channel_type: 'all',
      outlet_type: bundleForm.value.target_outlet_type || 'all', priority: 0, is_active: true,
      rules, rewards
    }

    if (isEditingBundle.value) await api.put(`/admin/promotions/${bundleForm.value.id}`, payload)
    else await api.post('/admin/promotions', payload)
    
    emit('refresh')
    closeBundleModal()
  } catch (e: any) {
    alert(e.response?.data?.message || 'Failed to save bundle.')
  } finally { savingBundle.value = false }
}

async function deleteBundle(id: number) {
  if (!confirm('Are you sure you want to delete this bundle?')) return
  try {
    await api.del(`/admin/promotions/${id}`)
    emit('refresh')
  } catch(e) { alert('Failed to delete bundle') }
}

// Watchers
watch(() => props.unifiedPromos, () => {
  loadBundles()
}, { deep: true })

onMounted(() => {
  loadSettings()
  loadBundles()
})

defineExpose({
  activeSystem,
  handleAddButton,
  openPromoModal,
  openBundleModal,
  openNewPromotion
})
</script>

<style scoped>
.input-field-modern-admin {
  @apply w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900 transition-all 
         placeholder:text-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none tracking-wide;
}
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.label { @apply font-black uppercase tracking-[0.2em] mb-2 block; }
.field-label-p { @apply block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1; }
.field-input-p { @apply w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>
