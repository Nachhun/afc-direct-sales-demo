<template>
  <div class="max-w-4xl space-y-6">
    <div>
      <h1 class="page-title text-3xl font-black text-slate-900">System Settings</h1>
      <p class="text-slate-500 text-sm mt-1">Manage global parameters, payment QR codes, and multi-group Telegram notification dispatches.</p>
    </div>

    <!-- 1. Telegram Multi-Group Notification Hub -->
    <div class="card space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shadow-blue-500/10">
            <Icon name="heroicons:paper-airplane" class="w-6 h-6 -rotate-45" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black text-slate-900">Telegram Dispatch Hub</h2>
              <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                {{ telegramGroups.length }} {{ telegramGroups.length === 1 ? 'Group' : 'Groups' }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">Broadcast live location, new orders, and delivery alerts across multiple Telegram groups.</p>
          </div>
        </div>

        <button 
          @click="openAddGroupModal"
          class="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 active:scale-95 shrink-0"
        >
          <Icon name="heroicons:plus-circle" class="w-4 h-4" />
          <span>Add Telegram Group</span>
        </button>
      </div>

      <!-- Telegram Groups List -->
      <div v-if="telegramGroups.length > 0" class="space-y-3">
        <div 
          v-for="(group, idx) in telegramGroups" 
          :key="group.id || idx"
          class="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 transition-all space-y-3"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs"
                :class="group.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'">
                #{{ idx + 1 }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-black text-slate-800 uppercase tracking-wide">{{ group.name || 'Unnamed Group' }}</h3>
                  <span v-if="group.is_active" class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[9px] font-black uppercase">
                    Active
                  </span>
                  <span v-else class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase">
                    Paused
                  </span>
                </div>
                <p class="text-[11px] font-mono text-slate-500 font-bold mt-0.5 flex items-center gap-1">
                  <span class="text-slate-400 font-normal">Chat ID:</span>
                  <span class="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-indigo-600 font-bold">{{ group.chat_id }}</span>
                </p>
              </div>
            </div>

            <!-- Group Quick Actions -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button 
                @click="testGroup(group)"
                :disabled="testingGroupId === (group.id || idx)"
                class="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs disabled:opacity-50"
                title="Send test message to this Telegram group"
              >
                <Icon name="heroicons:paper-airplane" class="w-3.5 h-3.5" :class="{ 'animate-spin': testingGroupId === (group.id || idx) }" />
                <span>{{ testingGroupId === (group.id || idx) ? 'Sending...' : 'Test Bot' }}</span>
              </button>
              <button 
                @click="openEditGroupModal(group, idx)"
                class="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all"
                title="Edit Group"
              >
                <Icon name="heroicons:pencil-square" class="w-4 h-4" />
              </button>
              <button 
                @click="removeGroup(idx)"
                class="p-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-500 rounded-xl transition-all"
                title="Remove Group"
              >
                <Icon name="heroicons:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Alert Triggers Enabled in this Group -->
          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60">
            <span class="text-[9px] font-black uppercase tracking-wider text-slate-400">Broadcasts:</span>
            
            <span 
              class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
              :class="group.alerts?.live_location ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-slate-100 text-slate-400 line-through'"
            >
              <Icon name="heroicons:map-pin" class="w-3 h-3" />
              Live Location
            </span>

            <span 
              class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
              :class="group.alerts?.orders ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-400 line-through'"
            >
              <Icon name="heroicons:shopping-cart" class="w-3 h-3" />
              Orders
            </span>

            <span 
              class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
              :class="group.alerts?.daily_report !== false ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-100 text-slate-400 line-through'"
            >
              <Icon name="heroicons:chart-bar" class="w-3 h-3" />
              Daily 5PM Report
            </span>

            <span 
              class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
              :class="group.alerts?.deliveries ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-400 line-through'"
            >
              <Icon name="heroicons:truck" class="w-3 h-3" />
              Delivery Alerts
            </span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50">
        <Icon name="heroicons:chat-bubble-bottom-center-text" class="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p class="text-xs font-black uppercase text-slate-600">No Telegram Groups Configured</p>
        <p class="text-[11px] text-slate-400 mt-1">Add your Telegram group chat IDs to receive real-time live tracking and order notifications.</p>
        <button 
          @click="openAddGroupModal"
          class="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all"
        >
          <Icon name="heroicons:plus" class="w-3.5 h-3.5" />
          Add First Group
        </button>
      </div>

      <!-- Feedback Alerts -->
      <div v-if="savedTelegram" class="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-2">
        <Icon name="heroicons:check-circle" class="w-4 h-4 text-emerald-600" />
        <span>Telegram group settings saved and synced successfully!</span>
      </div>
      <div v-if="testResult.show" class="rounded-2xl px-4 py-3 text-xs font-bold flex items-center justify-between gap-2"
        :class="testResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'">
        <div class="flex items-center gap-2">
          <Icon :name="testResult.success ? 'heroicons:check-circle' : 'heroicons:exclamation-triangle'" class="w-4 h-4" />
          <span>{{ testResult.message }}</span>
        </div>
        <button @click="testResult.show = false" class="text-slate-400 hover:text-slate-600 font-black text-xs">✕</button>
      </div>

      <div class="flex justify-end pt-2 border-t border-slate-100">
        <button 
          @click="saveTelegramGroups" 
          class="btn-primary px-6 flex items-center gap-1.5" 
          :disabled="savingTelegram"
        >
          <Icon v-if="savingTelegram" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
          <span>{{ savingTelegram ? 'Saving Groups...' : 'Save All Telegram Config' }}</span>
        </button>
      </div>
    </div>

    <!-- 2. Automated Daily Sales Summary Report Schedule -->
    <div class="card space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-500/10">
            <Icon name="heroicons:chart-bar" class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-black text-slate-900">Daily Sales Summary Telegram Report</h2>
            <p class="text-xs text-slate-400">Automated end-of-day team performance report with stores sold & revenue breakdown.</p>
          </div>
        </div>

        <!-- Manual Send Preview Button -->
        <button 
          @click="sendDailyReportTest"
          :disabled="sendingReportNow"
          class="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 shrink-0"
          title="Send today's summary report immediately to Telegram groups"
        >
          <Icon name="heroicons:paper-airplane" class="w-3.5 h-3.5" :class="{ 'animate-spin': sendingReportNow }" />
          <span>{{ sendingReportNow ? 'Sending Report...' : 'Send Report Now' }}</span>
        </button>
      </div>

      <form @submit.prevent="saveDailyReportSettings" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Dispatch Time Input -->
          <div>
            <label class="label">Dispatch Time (Cambodia Time / UTC+7)</label>
            <div class="flex items-center gap-2">
              <input 
                v-model="dailyReportTime" 
                type="time" 
                class="input-field flex-1 font-mono font-bold text-sm" 
                required 
              />
              <span class="text-xs text-slate-400 font-bold">Daily</span>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">Default is <strong>17:00 (5:00 PM)</strong>. The system will automatically compile and dispatch the report at this time.</p>
          </div>

          <!-- Enabled / Disabled switch -->
          <div>
            <label class="label">Automated Dispatch Status</label>
            <label class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors mt-0.5">
              <div>
                <p class="text-xs font-black text-slate-800">{{ dailyReportEnabled ? 'Active (Enabled)' : 'Paused (Disabled)' }}</p>
                <p class="text-[10px] text-slate-400">Send automated report daily at {{ dailyReportTime }}</p>
              </div>
              <input type="checkbox" v-model="dailyReportEnabled" class="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
            </label>
          </div>
        </div>

        <!-- Target Groups Selector for Daily Report -->
        <div class="space-y-2 pt-2 border-t border-slate-100">
          <div class="flex items-center justify-between">
            <label class="label mb-0">Target Telegram Groups (Select which groups receive this report)</label>
            <span class="text-[10px] text-slate-400 font-bold">
              {{ telegramGroups.filter(g => g.alerts?.daily_report !== false && g.is_active).length }} selected
            </span>
          </div>

          <div v-if="telegramGroups.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div 
              v-for="group in telegramGroups" 
              :key="group.id || group.chat_id"
              class="flex items-center justify-between p-3 rounded-xl border transition-all"
              :class="group.alerts?.daily_report !== false && group.is_active 
                ? 'bg-indigo-50/60 border-indigo-200' 
                : 'bg-slate-50 border-slate-200 opacity-60'"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0">
                  TG
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black text-slate-800 truncate uppercase">{{ group.name || 'Unnamed Group' }}</p>
                  <p class="text-[10px] font-mono text-slate-400 truncate">{{ group.chat_id }}</p>
                </div>
              </div>

              <label class="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
                <input 
                  type="checkbox" 
                  :checked="group.alerts?.daily_report !== false"
                  @change="e => toggleGroupDailyReport(group, (e.target as HTMLInputElement).checked)"
                  class="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                />
              </label>
            </div>
          </div>
          <div v-else class="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
            <p class="text-xs text-slate-400 font-bold">No Telegram groups configured yet. Add a group in the Dispatch Hub above first.</p>
          </div>
        </div>

        <!-- Alert / Feedback -->
        <div v-if="savedDailyReport" class="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-2">
          <Icon name="heroicons:check-circle" class="w-4 h-4 text-emerald-600" />
          <span>Daily report dispatch schedule saved successfully!</span>
        </div>
        <div v-if="dailyReportResult.show" class="rounded-2xl px-4 py-3 text-xs font-bold flex items-center justify-between gap-2"
          :class="dailyReportResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'">
          <div class="flex items-center gap-2">
            <Icon :name="dailyReportResult.success ? 'heroicons:check-circle' : 'heroicons:exclamation-triangle'" class="w-4 h-4" />
            <span>{{ dailyReportResult.message }}</span>
          </div>
          <button type="button" @click="dailyReportResult.show = false" class="text-slate-400 hover:text-slate-600 font-black text-xs">✕</button>
        </div>

        <div class="flex justify-end pt-1">
          <button type="submit" class="btn-primary px-6" :disabled="savingDailyReport">
            {{ savingDailyReport ? 'Saving Schedule...' : 'Save Report Schedule' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 3. Delivery SLA Settings -->
    <div class="card space-y-4">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div class="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
          <Icon name="heroicons:clock" class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-black text-slate-900">Delivery SLA Settings</h2>
          <p class="text-xs text-slate-400">Set the timeframe before an assigned courier's delivery becomes overdue.</p>
        </div>
      </div>

      <form @submit.prevent="saveSla" class="space-y-4">
        <div>
          <label class="label">Time Limit</label>
          <div class="flex gap-3">
            <input v-model="slaForm.sla_value" type="number" min="1" max="365" class="input-field w-28" id="sla-value" required />
            <select v-model="slaForm.sla_unit" class="input-field flex-1" id="sla-unit">
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
          <p class="text-[11px] text-slate-400 mt-2">
            Example: If set to <strong>4 days</strong>, any delivery not completed within 4 days of assignment will trigger an <span class="text-red-500 font-bold">overdue alert</span>.
          </p>
        </div>

        <div v-if="savedSla" class="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-4 py-3 text-xs font-bold">
          ✅ SLA settings saved successfully!
        </div>
        <div v-if="errorSla" class="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 text-xs">{{ errorSla }}</div>

        <div class="flex justify-end">
          <button type="submit" class="btn-primary px-6" :disabled="savingSla">
            {{ savingSla ? 'Saving...' : 'Save SLA Settings' }}
          </button>
        </div>
      </form>
    </div>

    <!-- 3. Bank QR Upload -->
    <div class="card space-y-4">
      <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <Icon name="heroicons:qr-code" class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-base font-black text-slate-900">Payment QR Codes</h2>
          <p class="text-xs text-slate-400">Manage bank QR codes printed at the bottom of customer invoices.</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <!-- QR 1 -->
        <div class="flex flex-col gap-3">
          <div class="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
            <img v-if="qr1Url" :src="qr1Url" class="w-full h-full object-contain" />
            <Icon v-else name="heroicons:qr-code" class="w-12 h-12 text-slate-300" />
            <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span class="text-white text-xs font-bold bg-slate-900/60 px-3 py-1.5 rounded-xl">Change Image</span>
            </div>
          </div>
          <p class="text-[10px] text-slate-500 text-center font-bold">QR Code #1 (e.g. ABA Bank)</p>
          <input type="file" ref="qr1Input" @change="e => handleQrUpload(e, 1)" accept="image/*" class="hidden" />
          <button @click="qr1Input?.click()" class="btn-secondary text-[11px] w-full py-2.5 font-bold" :disabled="uploadingQr === 1">
            {{ uploadingQr === 1 ? 'Uploading...' : 'Upload QR #1' }}
          </button>
        </div>

        <!-- QR 2 -->
        <div class="flex flex-col gap-3">
          <div class="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
            <img v-if="qr2Url" :src="qr2Url" class="w-full h-full object-contain" />
            <Icon v-else name="heroicons:qr-code" class="w-12 h-12 text-slate-300" />
            <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span class="text-white text-xs font-bold bg-slate-900/60 px-3 py-1.5 rounded-xl">Change Image</span>
            </div>
          </div>
          <p class="text-[10px] text-slate-500 text-center font-bold">QR Code #2 (e.g. ACLEDA Bank)</p>
          <input type="file" ref="qr2Input" @change="e => handleQrUpload(e, 2)" accept="image/*" class="hidden" />
          <button @click="qr2Input?.click()" class="btn-secondary text-[11px] w-full py-2.5 font-bold" :disabled="uploadingQr === 2">
            {{ uploadingQr === 2 ? 'Uploading...' : 'Upload QR #2' }}
          </button>
        </div>
      </div>
      <p class="text-xs text-slate-400 mt-2 text-center">These QR codes will automatically be rendered side-by-side on all order invoices.</p>
    </div>

    <!-- MODAL: ADD / EDIT TELEGRAM GROUP -->
    <div 
      v-if="groupModal.show"
      class="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
      @click.self="groupModal.show = false"
    >
      <div class="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-slate-100 space-y-5 animate-scale-in">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon name="heroicons:paper-airplane" class="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 class="text-base font-black text-slate-900 uppercase">
                {{ groupModal.editIndex !== null ? 'Edit Telegram Group' : 'Add Telegram Group' }}
              </h3>
              <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Configure dispatch channel and alerts</p>
            </div>
          </div>
          <button @click="groupModal.show = false" class="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveGroupModal" class="space-y-4">
          <div>
            <label class="label">Group Name / Label</label>
            <input 
              v-model="groupModal.form.name" 
              type="text" 
              placeholder="e.g. Sales Team Live Tracking" 
              class="input-field w-full" 
              required 
            />
          </div>

          <div>
            <label class="label">Telegram Group Chat ID</label>
            <input 
              v-model="groupModal.form.chat_id" 
              type="text" 
              placeholder="e.g. -100XXXXXXXXXX or -5276832908" 
              class="input-field w-full font-mono text-xs" 
              required 
            />
            <p class="text-[10px] text-slate-400 mt-1">
              Usually starts with a minus sign (e.g. <code>-100234567890</code>). Add the bot as Admin to your Telegram group first.
            </p>
          </div>

          <!-- Alert Type Toggles -->
          <div class="space-y-2.5 pt-1">
            <label class="label block">Active Broadcast Subscriptions</label>
            
            <label class="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
              <div class="flex items-center gap-2.5">
                <Icon name="heroicons:map-pin" class="w-4 h-4 text-sky-500" />
                <div>
                  <p class="text-xs font-black text-slate-800">Live Location Started</p>
                  <p class="text-[9px] text-slate-400">Notify when salesmen/delivery reps begin broadcasting</p>
                </div>
              </div>
              <input type="checkbox" v-model="groupModal.form.alerts.live_location" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </label>

            <label class="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
              <div class="flex items-center gap-2.5">
                <Icon name="heroicons:shopping-cart" class="w-4 h-4 text-emerald-500" />
                <div>
                  <p class="text-xs font-black text-slate-800">New Orders & Updates</p>
                  <p class="text-[9px] text-slate-400">Send order invoice receipts and details</p>
                </div>
              </div>
              <input type="checkbox" v-model="groupModal.form.alerts.orders" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </label>

            <label class="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
              <div class="flex items-center gap-2.5">
                <Icon name="heroicons:chart-bar" class="w-4 h-4 text-indigo-500" />
                <div>
                  <p class="text-xs font-black text-slate-800">Daily Sales Summary Report</p>
                  <p class="text-[9px] text-slate-400">Receive 5:00 PM end-of-day sales revenue & stores summary</p>
                </div>
              </div>
              <input type="checkbox" v-model="groupModal.form.alerts.daily_report" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </label>

            <label class="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
              <div class="flex items-center gap-2.5">
                <Icon name="heroicons:truck" class="w-4 h-4 text-amber-500" />
                <div>
                  <p class="text-xs font-black text-slate-800">Delivery SLA & Overdue Alerts</p>
                  <p class="text-[9px] text-slate-400">Notify about delivery assignments and deadlines</p>
                </div>
              </div>
              <input type="checkbox" v-model="groupModal.form.alerts.deliveries" class="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
            </label>
          </div>

          <!-- Status toggle -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs font-bold text-slate-700">Enable Group Dispatch</span>
            <input type="checkbox" v-model="groupModal.form.is_active" class="w-4 h-4 rounded text-blue-600 cursor-pointer" />
          </div>

          <div class="flex gap-2.5 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              @click="groupModal.show = false" 
              class="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/20"
            >
              {{ groupModal.editIndex !== null ? 'Save Changes' : 'Add Group' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

definePageMeta({ layout: 'admin' })
const api = useApi()

const currentSla = ref<any>({ sla_value: 4, sla_unit: 'days', updated_by: null })
const slaForm = reactive({ sla_value: 4, sla_unit: 'days' })

// Telegram Multi-Group State
const telegramGroups = ref<any[]>([])
const savingSla = ref(false)
const savingTelegram = ref(false)
const savedSla = ref(false)
const savedTelegram = ref(false)
const errorSla = ref('')

// Daily Sales Report State
const dailyReportTime = ref('17:00')
const dailyReportEnabled = ref(true)
const savingDailyReport = ref(false)
const savedDailyReport = ref(false)
const sendingReportNow = ref(false)
const dailyReportResult = reactive({
  show: false,
  success: true,
  message: ''
})

const testingGroupId = ref<string | number | null>(null)
const testResult = reactive({
  show: false,
  success: true,
  message: ''
})

// Modal for Adding / Editing Group
const groupModal = reactive({
  show: false,
  editIndex: null as number | null,
  form: {
    id: '',
    name: '',
    chat_id: '',
    alerts: {
      live_location: true,
      orders: true,
      daily_report: true,
      deliveries: true
    },
    is_active: true
  }
})

const uploadingQr = ref<number | null>(null)
const qr1Url = ref('')
const qr2Url = ref('')
const qr1Input = ref<HTMLInputElement | null>(null)
const qr2Input = ref<HTMLInputElement | null>(null)

onMounted(async () => {
  // Load Delivery SLA & QR settings
  try {
    const slaData = await api.get('/admin/delivery-settings') as any
    if (slaData) {
      currentSla.value = slaData
      slaForm.sla_value = slaData.sla_value || 4
      slaForm.sla_unit = slaData.sla_unit || 'days'
      qr1Url.value = slaData.bank_qr_1 || ''
      qr2Url.value = slaData.bank_qr_2 || ''
    }
  } catch (e) {
    console.error('Failed to load delivery settings', e)
  }

  // Load Telegram Group & Daily Report settings
  try {
    const globalData = await api.get('/admin/global-settings') as any
    if (globalData) {
      if (Array.isArray(globalData.telegram_groups)) {
        telegramGroups.value = globalData.telegram_groups
      } else if (globalData?.telegram_group_chat_id) {
        telegramGroups.value = [
          {
            id: 'group_1',
            name: 'Main Telegram Group',
            chat_id: globalData.telegram_group_chat_id,
            alerts: { live_location: true, orders: true, daily_report: true, deliveries: true },
            is_active: true
          }
        ]
      }

      if (globalData.daily_report_time) {
        dailyReportTime.value = globalData.daily_report_time
      }
      if (globalData.daily_report_enabled !== undefined) {
        dailyReportEnabled.value = globalData.daily_report_enabled === '1' || globalData.daily_report_enabled === true || globalData.daily_report_enabled === 1
      }
    }
  } catch (e) {
    console.error('Failed to load global settings', e)
  }
})

function openAddGroupModal() {
  groupModal.editIndex = null
  groupModal.form = {
    id: 'grp_' + Date.now(),
    name: '',
    chat_id: '',
    alerts: {
      live_location: true,
      orders: true,
      daily_report: true,
      deliveries: true
    },
    is_active: true
  }
  groupModal.show = true
}

function openEditGroupModal(group: any, index: number) {
  groupModal.editIndex = index
  groupModal.form = {
    id: group.id || ('grp_' + Date.now()),
    name: group.name || '',
    chat_id: group.chat_id || '',
    alerts: {
      live_location: group.alerts?.live_location ?? true,
      orders: group.alerts?.orders ?? true,
      daily_report: group.alerts?.daily_report ?? true,
      deliveries: group.alerts?.deliveries ?? true
    },
    is_active: group.is_active ?? true
  }
  groupModal.show = true
}

function saveGroupModal() {
  if (!groupModal.form.chat_id || !groupModal.form.name) return
  
  if (groupModal.editIndex !== null) {
    telegramGroups.value[groupModal.editIndex] = { ...groupModal.form }
  } else {
    telegramGroups.value.push({ ...groupModal.form })
  }

  groupModal.show = false
  saveTelegramGroups()
}

function toggleGroupDailyReport(group: any, isChecked: boolean) {
  if (!group.alerts) {
    group.alerts = { live_location: true, orders: true, daily_report: true, deliveries: true }
  }
  group.alerts.daily_report = isChecked
  saveTelegramGroups()
}

function removeGroup(index: number) {
  if (confirm('Are you sure you want to remove this Telegram group dispatch?')) {
    telegramGroups.value.splice(index, 1)
    saveTelegramGroups()
  }
}

async function saveTelegramGroups() {
  savingTelegram.value = true
  savedTelegram.value = false
  try {
    // Also sync primary group chat id with the first active group for backward compatibility
    const primaryChatId = telegramGroups.value.find(g => g.is_active)?.chat_id || ''
    
    await api.put('/admin/global-settings', {
      settings: {
        telegram_groups: telegramGroups.value,
        telegram_group_chat_id: primaryChatId
      }
    })
    savedTelegram.value = true
    setTimeout(() => savedTelegram.value = false, 3500)
  } catch (e) {
    console.error('Failed to save Telegram groups', e)
  } finally {
    savingTelegram.value = false
  }
}

async function saveDailyReportSettings() {
  savingDailyReport.value = true
  savedDailyReport.value = false
  try {
    await api.put('/admin/global-settings', {
      settings: {
        daily_report_time: dailyReportTime.value,
        daily_report_enabled: dailyReportEnabled.value ? '1' : '0'
      }
    })
    savedDailyReport.value = true
    setTimeout(() => savedDailyReport.value = false, 3500)
  } catch (e) {
    console.error('Failed to save daily report settings', e)
  } finally {
    savingDailyReport.value = false
  }
}

async function sendDailyReportTest() {
  sendingReportNow.value = true
  dailyReportResult.show = false

  try {
    const res: any = await api.post('/admin/global-settings/send-daily-report', {})
    dailyReportResult.show = true
    dailyReportResult.success = true
    dailyReportResult.message = res.message || 'Daily summary report dispatched successfully to Telegram!'
  } catch (e: any) {
    dailyReportResult.show = true
    dailyReportResult.success = false
    dailyReportResult.message = e?.data?.message || 'Failed to dispatch daily summary report.'
  } finally {
    sendingReportNow.value = false
  }
}

async function testGroup(group: any) {
  const targetKey = group.id || group.chat_id
  testingGroupId.value = targetKey
  testResult.show = false

  try {
    const res: any = await api.post('/admin/global-settings/test-telegram', {
      chat_id: group.chat_id,
      group_name: group.name
    })

    testResult.show = true
    testResult.success = true
    testResult.message = res.message || `Test message sent to ${group.name}!`
  } catch (e: any) {
    testResult.show = true
    testResult.success = false
    testResult.message = e?.data?.message || 'Failed to dispatch test message. Verify bot is added as admin.'
  } finally {
    testingGroupId.value = null
  }
}

async function handleQrUpload(event: any, num: number) {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('qr_code', file)
  formData.append('number', num.toString())

  uploadingQr.value = num
  try {
    const res: any = await api.post('/admin/delivery-settings/upload-qr', formData)
    if (num === 1) qr1Url.value = res.url
    else qr2Url.value = res.url
  } catch (e) {
    alert('Failed to upload QR code')
  } finally {
    uploadingQr.value = null
  }
}

async function saveSla() {
  savingSla.value = true; errorSla.value = ''; savedSla.value = false
  try {
    currentSla.value = await api.put('/admin/delivery-settings', { ...slaForm }) as any
    savedSla.value = true
    setTimeout(() => savedSla.value = false, 3000)
  } catch (e: any) {
    errorSla.value = e?.data?.message || 'Failed to save SLA settings'
  } finally {
    savingSla.value = false
  }
}
</script>

