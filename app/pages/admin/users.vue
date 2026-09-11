<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="page-title text-3xl">Team Management</h1>
        <p class="text-slate-500 text-sm mt-1">Manage administrative access and salesman profiles.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="showDeactivated = !showDeactivated" 
          :class="showDeactivated ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'"
          class="px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 hover:bg-slate-100"
          title="Toggle visibility of deactivated members"
        >
          <Icon :name="showDeactivated ? 'heroicons:eye' : 'heroicons:eye-slash'" class="w-4 h-4" />
          <span>{{ showDeactivated ? 'Showing Inactive' : 'Hide Inactive' }}</span>
          <span v-if="deactivatedCount > 0" class="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-black">
            {{ deactivatedCount }}
          </span>
        </button>
        <button @click="openManageTypesModal()" class="btn-secondary flex items-center gap-2 group">
          <Icon name="heroicons:tag" class="w-5 h-5 text-slate-500" /> 
          <span>Manage Classifications</span>
        </button>
        <button @click="openModal()" class="btn-primary flex items-center gap-2 group">
          <Icon name="heroicons:plus" class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> 
          <span>New Member</span>
        </button>
      </div>
    </div>

    <div v-for="(group, role) in groupedUsers" :key="role" class="space-y-3">
      <div class="flex items-center gap-3 px-2">
        <div class="h-px bg-slate-100 flex-1"></div>
        <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          {{ roleDisplayNames[role] || role.replace('_', ' ') }}
          <span class="ml-2 text-slate-300 font-bold">({{ group.length }})</span>
        </h2>
        <div class="h-px bg-slate-100 flex-1"></div>
      </div>

      <div class="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/50">
                <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Identity</th>
                <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Telegram</th>
                <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Performance</th>
                <th class="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="u in group" :key="u.id" class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-sm font-black text-blue-600 border border-blue-100">
                      {{ u.name?.charAt(0) }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-slate-900 font-bold text-sm block leading-none">{{ u.name }}</span>
                        <span v-if="u.is_active === false || u.is_active === 0" class="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-100">Deactivated</span>
                      </div>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span :class="roleClass(u.role)" class="text-[10px] uppercase font-black tracking-widest leading-none">{{ u.role?.replace('_', ' ') }}</span>
                        <span v-if="['salesman', 'sale_admin', 'sale admin'].includes(String(u.role).toLowerCase()) && u.salesman_type" class="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span v-if="['salesman', 'sale_admin', 'sale admin'].includes(String(u.role).toLowerCase()) && u.salesman_type" class="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded leading-none">{{ u.salesman_type.name }}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 hidden md:table-cell">
                  <span class="text-slate-600 text-sm font-medium">{{ u.telegram_id }}</span>
                </td>
                <td class="px-6 py-4">
                  <div v-if="['salesman', 'sale_admin', 'sale admin'].includes(String(u.role).toLowerCase())" class="flex items-center gap-4">
                    <div class="text-center">
                      <span class="block text-slate-900 font-bold text-xs">{{ u.orders_count || 0 }}</span>
                      <span class="text-[9px] text-slate-400 uppercase font-black">Orders</span>
                    </div>
                    <div class="text-center">
                      <span class="block text-amber-600 font-bold text-xs">${{ formatNumber(u.total_sales || 0) }}</span>
                      <span class="text-[9px] text-slate-400 uppercase font-black">Sales</span>
                    </div>
                  </div>
                  <span v-else class="text-slate-300 font-bold text-[10px] uppercase tracking-widest">N/A</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2 justify-end">
                    <button v-if="['salesman', 'sale_admin', 'sale admin'].includes(String(u.role).toLowerCase())" @click="viewPerformance(u)" class="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors" title="View Dashboard">
                      <Icon name="heroicons:presentation-chart-line" class="w-5 h-5" />
                    </button>
                    <button @click="openModal(u)" class="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors" title="Edit Profile">
                      <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                    </button>
                    <button @click="toggleUserStatus(u)" :class="u.is_active ? 'hover:bg-amber-50 text-slate-400 hover:text-amber-600' : 'hover:bg-emerald-50 text-slate-400 hover:text-emerald-600'" class="p-2 rounded-lg transition-colors" :title="u.is_active ? 'Deactivate Access' : 'Activate Access'">
                      <Icon :name="u.is_active ? 'heroicons:lock-closed' : 'heroicons:lock-open'" class="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-md p-8 rounded-3xl shadow-2xl relative">
          <button @click="showModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
          
          <h3 class="text-xl font-black text-slate-900 mb-2">{{ editing ? 'Update Credentials' : 'Onboard Member' }}</h3>
          <p class="text-slate-500 text-xs mb-8">Fill in the security details to manage access.</p>
          
          <form @submit.prevent="saveUser" class="space-y-5">
            <div>
              <label class="label">Full Name</label>
              <input v-model="form.name" class="input-field" required placeholder="John Doe" id="user-name" />
            </div>
            <div>
              <label class="label">Telegram ID</label>
              <input v-model="form.telegram_id" class="input-field" required placeholder="123456789" id="user-telegram-id" />
            </div>
            <div>
              <label class="label">Location / Base Coordinates</label>
              <div class="relative group">
                <input v-model="form.location" class="input-field pr-12" placeholder="Latitude, Longitude or Address" id="user-location" />
                <button 
                  type="button" 
                  @click="getLocation"
                  :disabled="gettingLocation"
                  class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 group/gps"
                >
                  <Icon v-if="gettingLocation" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                  <Icon v-else name="heroicons:map-pin" class="w-4 h-4 group-hover/gps:scale-110 transition-transform" />
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                 <label class="label">Role Assignment</label>
                  <div class="grid grid-cols-2 gap-3">
                    <button type="button" @click="form.role = 'salesman'" 
                      class="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all"
                      :class="form.role === 'salesman' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'">
                      Salesman
                    </button>
                    <button type="button" @click="form.role = 'delivery'" 
                      class="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all"
                      :class="form.role === 'delivery' ? 'bg-emerald-50 border-emerald-600 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'">
                      Courier
                    </button>
                    <button type="button" @click="form.role = 'super_admin'" 
                      class="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all"
                      :class="form.role === 'super_admin' ? 'bg-purple-50 border-purple-600 text-purple-600' : 'bg-slate-50 border-slate-100 text-slate-400'">
                      Super Admin
                    </button>
                    <button type="button" @click="form.role = 'admin_reporter'" 
                      class="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all"
                      :class="form.role === 'admin_reporter' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'">
                      Reporter
                    </button>
                    <button type="button" @click="form.role = 'admin_delivery'" 
                      :class="form.role === 'admin_delivery' ? 'bg-pink-50 border-pink-600 text-pink-600' : 'bg-slate-50 border-slate-100 text-slate-400'"
                      class="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all">
                      Delivery Admin
                    </button>
                    <button type="button" @click="form.role = 'sale_admin'" 
                      :class="form.role === 'sale_admin' || form.role === 'sale admin' ? 'bg-orange-50 border-orange-600 text-orange-600' : 'bg-slate-50 border-slate-100 text-slate-400'"
                      class="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all">
                      Sale Admin
                    </button>
                    <button type="button" @click="form.role = 'asm'" 
                      :class="form.role === 'asm' ? 'bg-cyan-50 border-cyan-600 text-cyan-600' : 'bg-slate-50 border-slate-100 text-slate-400'"
                      class="px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all">
                      ASM
                    </button>
                  </div>
              </div>
            </div>

            <!-- Salesman Classification Selector (Only visible when role is salesman or sale_admin) -->
            <div v-if="['salesman', 'sale_admin', 'sale admin'].includes(String(form.role).toLowerCase())" class="space-y-1.5 animate-fade-in">
              <label class="label">Salesman Classification</label>
              <select v-model="form.salesman_type_id" class="input-field" id="user-salesman-type">
                <option :value="null">Unassigned / General</option>
                <option v-for="t in salesmanTypes" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
            </div>
            
            <div class="space-y-4 pt-4">
              <div @click="showAdvanced = !showAdvanced" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">
                <Icon :name="showAdvanced ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-3 h-3" />
                Advanced Credentials (Optional)
              </div>
              
              <div v-show="showAdvanced" class="space-y-4 animate-fade-in">
                <div>
                  <label class="label">Email Address</label>
                  <input v-model="form.email" type="email" class="input-field" placeholder="john@afc.com" />
                </div>
                <div>
                  <label class="label">{{ editing ? 'Reset Password' : 'Initial Password' }}</label>
                  <input v-model="form.password" type="password" class="input-field" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <!-- Account Status Toggle (Only visible when editing) -->
            <div v-if="editing" class="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span class="text-xs font-bold text-slate-800 block">Account Status</span>
                <span class="text-[9px] text-slate-400">Deactivated members cannot access the system.</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.is_active" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div v-if="formError" class="bg-red-50 border border-red-100 text-red-600 rounded-2xl px-5 py-4 text-xs font-bold leading-relaxed">{{ formError }}</div>
            
            <div class="flex gap-4 pt-4">
              <button type="button" @click="showModal = false" class="btn-secondary flex-1">Discard</button>
              <button type="submit" class="btn-primary flex-1">{{ editing ? 'Confirm Changes' : 'Grant Access' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Performance Dashboard Modal -->
    <Teleport to="body">
      <div v-if="showPerformance" class="fixed inset-0 bg-slate-900/70 backdrop-blur-[2px] flex items-center justify-center z-[110] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-4xl p-0 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
          <div class="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-xl font-black text-blue-600 border border-blue-100">
                {{ selectedUser?.name?.charAt(0) }}
              </div>
              <div>
                <h3 class="text-2xl font-black text-slate-900 leading-none">{{ selectedUser?.name }}</h3>
                <p class="text-slate-500 text-xs mt-2 uppercase tracking-widest font-black">Sales Performance Dashboard</p>
              </div>
            </div>
            <button @click="showPerformance = false" class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-8 space-y-8">
            <!-- Summary Stats -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-3xl border border-slate-100 relative overflow-hidden group shadow-sm">
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon name="heroicons:shopping-cart" class="w-24 h-24 text-blue-600" />
                </div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Volume</p>
                <h4 class="text-3xl font-black text-slate-900">{{ selectedUser?.orders_count || 0 }} <span class="text-sm font-bold text-slate-400">Orders</span></h4>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-100 relative overflow-hidden group shadow-sm">
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon name="heroicons:banknotes" class="w-24 h-24 text-amber-600" />
                </div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Revenue</p>
                <h4 class="text-3xl font-black text-amber-600">${{ formatNumber(selectedUser?.total_sales || 0) }}</h4>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-slate-100 relative overflow-hidden group shadow-sm">
                <div class="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon name="heroicons:chart-bar" class="w-24 h-24 text-emerald-600" />
                </div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Order Value</p>
                <h4 class="text-3xl font-black text-emerald-600">${{ formatNumber(avgOrderValue) }}</h4>
              </div>
            </div>

            <!-- Recent Orders -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">Order History Pipeline</h4>
                <div class="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Showing last {{ selectedUserOrders.length }} transactions
                </div>
              </div>

              <div class="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <table class="w-full text-left">
                  <thead>
                    <tr class="bg-slate-50">
                      <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Order #</th>
                      <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Timestamp</th>
                      <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Merchant</th>
                      <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                      <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Value</th>
                      <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="order in selectedUserOrders" :key="order.id" class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4">
                        <span class="text-slate-700 font-black text-xs">#{{ order.id }}</span>
                        <span v-if="order.so_number" class="block text-[10px] text-slate-400 font-medium mt-0.5">{{ order.so_number }}</span>
                      </td>
                      <td class="px-6 py-4 text-xs text-slate-500">
                        {{ new Date(order.created_at).toLocaleDateString() }}
                      </td>
                      <td class="px-6 py-4">
                        <span class="text-slate-900 font-bold text-xs">{{ order.shop_name }}</span>
                      </td>
                      <td class="px-6 py-4 text-center">
                        <span :class="{
                          'bg-amber-50 text-amber-600 border-amber-100': order.status === 'pending',
                          'bg-emerald-50 text-emerald-600 border-emerald-100': order.status === 'completed',
                          'bg-red-50 text-red-600 border-red-100': order.status === 'cancelled'
                        }" class="px-2 py-0.5 rounded text-[9px] font-black uppercase border">{{ order.status }}</span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <span class="text-slate-900 font-black text-xs">${{ formatNumber(order.total_amount) }}</span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <NuxtLink
                          :to="`/admin/orders/${order.id}`"
                          class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                          title="View Invoice & Details"
                        >
                          <Icon name="heroicons:document-text" class="w-3.5 h-3.5" />
                          Invoice
                        </NuxtLink>
                      </td>
                    </tr>
                    <tr v-if="selectedUserOrders.length === 0">
                      <td colspan="6" class="px-6 py-12 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                        No transactions recorded yet
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Manage Classifications Modal -->
    <Teleport to="body">
      <div v-if="showManageTypesModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] px-4 animate-fade-in">
        <div class="bg-white border border-slate-200 w-full max-w-lg p-8 rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh]">
          <button @click="showManageTypesModal = false" class="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
          
          <h3 class="text-xl font-black text-slate-900 mb-2">Salesman Classifications</h3>
          <p class="text-slate-500 text-xs mb-6">Manage dynamic classification groups for your sales representatives.</p>
          
          <!-- Create / Edit Form -->
          <form @submit.prevent="saveSalesmanType" class="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-4 mb-6">
            <h4 class="text-xs font-black uppercase tracking-wider text-slate-700">
              {{ editingType ? 'Edit Classification' : 'Add New Classification' }}
            </h4>
            <div class="grid grid-cols-1 gap-3">
              <div>
                <label class="text-[10px] font-black uppercase text-slate-400">Name</label>
                <input v-model="newTypeName" class="input-field py-2 text-sm mt-1" placeholder="e.g. Pharmacy Rep" required />
              </div>
              <div>
                <label class="text-[10px] font-black uppercase text-slate-400">Description (Optional)</label>
                <input v-model="newTypeDescription" class="input-field py-2 text-sm mt-1" placeholder="Brief description of responsibilities" />
              </div>
            </div>
            <div v-if="typeFormError" class="text-red-600 text-xs font-bold leading-normal">{{ typeFormError }}</div>
            <div class="flex gap-2 justify-end pt-2">
              <button v-if="editingType" type="button" @click="cancelEditType" class="px-3 py-1.5 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-bold transition-colors">Cancel</button>
              <button type="submit" class="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-colors">
                {{ editingType ? 'Save Changes' : 'Add Classification' }}
              </button>
            </div>
          </form>

          <!-- List of classifications -->
          <div class="flex-1 overflow-y-auto min-h-[200px] border border-slate-100 rounded-2xl">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50/50 border-b border-slate-100">
                  <th class="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Classification</th>
                  <th class="px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="t in salesmanTypes" :key="t.id" class="hover:bg-slate-50/40">
                  <td class="px-4 py-3">
                    <span class="text-sm font-bold text-slate-800 block">{{ t.name }}</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5 leading-snug">{{ t.description || 'No description provided' }}</span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex gap-1 justify-end">
                      <button @click="editSalesmanType(t)" class="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors">
                        <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                      </button>
                      <button @click="deleteSalesmanType(t.id)" class="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors">
                        <Icon name="heroicons:trash" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="salesmanTypes.length === 0">
                  <td colspan="2" class="px-4 py-8 text-center text-slate-300 font-bold uppercase tracking-wider text-xs">
                    No classifications created yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const api = useApi()
const authStore = useAuthStore()
const users = ref<any[]>([])
const showModal = ref(false)
const showPerformance = ref(false)
const showAdvanced = ref(false)
const editing = ref<any>(null)
const formError = ref('')
const gettingLocation = ref(false)
const form = reactive({ name: '', email: '', password: '', telegram_id: '', role: 'salesman', location: '', is_active: true, salesman_type_id: null as number | null })

// Salesman Classification Types state
const salesmanTypes = ref<any[]>([])
const showManageTypesModal = ref(false)
const newTypeName = ref('')
const newTypeDescription = ref('')
const editingType = ref<any>(null)
const typeFormError = ref('')

const roleDisplayNames: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  admin_reporter: 'Reporter',
  admin_delivery: 'Delivery Admin',
  sale_admin: 'Sale Admin',
  salesman: 'Salesman',
  delivery: 'Courier',
  asm: 'Area Sales Manager'
}

const roleClass = (role: string) => {
  switch (role) {
    case 'super_admin':
    case 'admin':
    case 'super admin':
      return 'text-purple-600'
    case 'admin_reporter':
      return 'text-indigo-600'
    case 'admin_delivery':
      return 'text-pink-600'
    case 'sale_admin':
    case 'sale admin':
      return 'text-orange-600'
    case 'salesman':
      return 'text-blue-600'
    case 'delivery':
      return 'text-emerald-600'
    case 'asm':
      return 'text-cyan-600'
    default:
      return 'text-slate-400'
  }
}

const showDeactivated = ref(false)

const deactivatedCount = computed(() => {
  return users.value.filter(u => u.is_active === false || u.is_active === 0).length
})

const groupedUsers = computed(() => {
  const groups: Record<string, any[]> = {
    super_admin: [],
    admin: [],
    admin_reporter: [],
    admin_delivery: [],
    sale_admin: [],
    salesman: [],
    delivery: [],
    asm: []
  }
  
  users.value.forEach(u => {
    if (!showDeactivated.value && (u.is_active === false || u.is_active === 0)) {
      return
    }
    const r = u.role?.toLowerCase().replace(' ', '_') || 'salesman'
    if (!groups[r]) groups[r] = []
    groups[r].push(u)
  })

  // Remove empty groups
  return Object.fromEntries(Object.entries(groups).filter(([_, list]) => list.length > 0))
})

// Performance Dashboard State
const selectedUser = ref<any>(null)
const selectedUserOrders = ref<any[]>([])

const avgOrderValue = computed(() => {
  if (!selectedUser.value?.orders_count) return 0
  return selectedUser.value.total_sales / selectedUser.value.orders_count
})

onMounted(async () => { 
  if (authStore.isSaleAdmin) {
    navigateTo('/admin/products')
    return
  }
  if (!authStore.isSuperAdmin && !authStore.isAdmin) {
    navigateTo('/admin')
    return
  }
  await fetchUsers()
  await fetchSalesmanTypes()
})

async function fetchSalesmanTypes() {
  try {
    salesmanTypes.value = await api.get('/admin/salesman-types') as any[]
  } catch (e) {
    console.error('Failed to load salesman types', e)
  }
}

function openManageTypesModal() {
  showManageTypesModal.value = true
  newTypeName.value = ''
  newTypeDescription.value = ''
  editingType.value = null
  typeFormError.value = ''
}

async function saveSalesmanType() {
  typeFormError.value = ''
  if (!newTypeName.value.trim()) {
    typeFormError.value = 'Name is required'
    return
  }
  try {
    const body = {
      name: newTypeName.value.trim(),
      description: newTypeDescription.value.trim()
    }
    if (editingType.value) {
      await api.put(`/admin/salesman-types/${editingType.value.id}`, body)
    } else {
      await api.post('/admin/salesman-types', body)
    }
    newTypeName.value = ''
    newTypeDescription.value = ''
    editingType.value = null
    await fetchSalesmanTypes()
  } catch (e: any) {
    typeFormError.value = e?.data?.message || 'Failed to save classification type'
  }
}

function editSalesmanType(type: any) {
  editingType.value = type
  newTypeName.value = type.name
  newTypeDescription.value = type.description || ''
  typeFormError.value = ''
}

function cancelEditType() {
  editingType.value = null
  newTypeName.value = ''
  newTypeDescription.value = ''
  typeFormError.value = ''
}

async function deleteSalesmanType(id: number) {
  if (!confirm('Are you sure you want to delete this classification? Sales reps assigned to it will be set to Unassigned.')) return
  try {
    await api.del(`/admin/salesman-types/${id}`)
    await fetchSalesmanTypes()
    await fetchUsers()
  } catch (e: any) {
    alert(e?.data?.message || 'Failed to delete classification type')
  }
}

async function fetchUsers() {
  try {
    users.value = await api.get('/admin/users') as any[]
  } catch (e: any) {
    alert('Users List Denied: ' + (e?.data?.message || JSON.stringify(e?.data) || 'Unknown 403 Forbidden Error'));
  }
}

function openModal(u?: any) {
  editing.value = u || null
  form.name = u?.name || ''; 
  form.email = u?.email || ''; 
  form.telegram_id = u?.telegram_id || ''; 
  form.password = ''; 
  form.role = u?.role || 'salesman';
  form.location = u?.location || '';
  form.is_active = u ? (u.is_active === 1 || u.is_active === true) : true;
  form.salesman_type_id = u?.salesman_type_id || null;
  formError.value = ''; 
  showModal.value = true
  showAdvanced.value = false
}

async function viewPerformance(u: any) {
  selectedUser.value = u
  try {
    const data = await api.get(`/admin/users/${u.id}`) as any
    selectedUserOrders.value = data.orders || []
    showPerformance.value = true
  } catch (e) {
    alert('Failed to load performance metrics')
  }
}

function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}

async function getLocation() {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }
  gettingLocation.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      form.location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      gettingLocation.value = false
    },
    (err) => {
      alert(`Location error: ${err.message}`)
      gettingLocation.value = false
    },
    { enableHighAccuracy: true, timeout: 10000 }
  )
}

async function saveUser() {
  formError.value = ''
  try {
    const body = { ...form }
    if (!body.password) delete (body as any).password
    if (!body.email) delete (body as any).email
    if (editing.value) {
      await api.put(`/admin/users/${editing.value.id}`, body)
    } else {
      await api.post('/admin/users', body)
    }
    await fetchUsers()
    showModal.value = false
  } catch (e: any) {
    formError.value = e?.data?.message || JSON.stringify(e?.data?.errors) || 'Identity synchronization failed.'
  }
}

async function toggleUserStatus(u: any) {
  const action = u.is_active ? 'deactivate' : 'activate'
  if (!confirm(`Are you sure you want to ${action} this user's access?`)) return
  try {
    await api.put(`/admin/users/${u.id}`, {
      ...u,
      is_active: !u.is_active
    })
    await fetchUsers()
  } catch (e: any) {
    alert('Operation failed: ' + (e?.data?.message || 'Unknown error'))
  }
}
</script>
