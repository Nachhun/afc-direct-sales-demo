<template>
  <div class="space-y-5">
    <div class="flex items-center gap-3 mb-2">
      <button @click="$router.back()" class="w-9 h-9 glass-panel rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
        <Icon name="heroicons:arrow-left" class="w-4 h-4 text-slate-400" />
      </button>
      <h1 class="page-title text-3xl flex-1">Order Details</h1>
      <button v-if="order" @click="printInvoice" class="btn-primary py-2 px-4 text-xs flex items-center gap-2">
        <Icon name="heroicons:printer" class="w-4 h-4" />
        Print Invoice
      </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-3">
      <div class="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      <p class="text-slate-500 text-xs font-black uppercase tracking-widest animate-pulse">Loading...</p>
    </div>

    <div v-else-if="order" class="space-y-5">
      <!-- Header Card -->
      <div class="glass-card p-6">
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2 flex-wrap">
              Order #{{ order.id }} 
              <span v-if="order.order_custom_id" class="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">ORD: {{ order.order_custom_id }}</span>
              <span v-if="order.delivery?.delivery_custom_id || order.delivery_number" class="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">DEL: {{ order.delivery?.delivery_custom_id || order.delivery_number }}</span>
              <span v-if="order.so_number" class="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">SO: {{ order.so_number }}</span>
              <span v-if="order.customer_id" class="text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">CUST: {{ order.customer_id }}</span>
            </p>
            <div class="flex items-center gap-3 mb-1 flex-wrap">
              <h2 class="text-xl font-black text-slate-900 italic tracking-tight">{{ order.shop_name }}</h2>
              <span v-if="order.is_new_store" class="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-blue-500/20">New Store</span>
              <span v-if="order.is_direct_sale" class="px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-emerald-500/20 flex items-center gap-1">
                <Icon name="heroicons:bolt" class="w-2.5 h-2.5" /> Direct Sale (លក់ផ្ទាល់ដៃ)
              </span>
              <span v-if="order.store_type" class="px-2 py-0.5 bg-purple-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-purple-500/20">{{ order.store_type }}</span>
              <span v-if="order.visit_frequency" class="px-2 py-0.5 bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-sm shadow-emerald-500/20">{{ order.visit_frequency }}</span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1.5">
            <span :class="`badge-${order.status} text-xs px-3 py-1.5`">{{ order.status }}</span>
            <span v-if="order.is_direct_sale" class="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
              ⚡ Auto Completed
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 col-span-2">
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Address</p>
            <p class="text-slate-900 font-bold text-sm">{{ order.customer_address || '—' }}</p>
            <div v-if="order.province" class="flex gap-2 mt-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <span>{{ order.province }}</span>
              <span v-if="order.district">› {{ order.district }}</span>
              <span v-if="order.commune">› {{ order.commune }}</span>
            </div>
          </div>
          <div class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Contact</p>
            <p class="text-slate-900 font-bold text-sm">{{ order.contact || '—' }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 relative group">
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center justify-between">
              Location
              <a v-if="isValidCoords(order.location)" 
                :href="`https://www.google.com/maps?q=${order.location}`" 
                target="_blank"
                class="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5"
                title="View on Map"
              >
                <Icon name="heroicons:map" class="w-3 h-3" />
                <span class="text-[8px]">Open Map</span>
              </a>
            </p>
            <p class="text-slate-900 font-bold text-sm">{{ order.location || '—' }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Request Delivery Date</p>
            <p class="text-slate-900 font-bold text-sm">{{ order.delivery_date || '—' }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Payment</p>
            <p class="text-slate-900 font-bold text-sm">{{ order.payment_method }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Date</p>
            <p class="text-slate-900 font-bold text-sm">{{ formatDate(order.created_at) }}</p>
          </div>
        </div>

        <div v-if="order.note" class="mt-4 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
          <p class="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Note</p>
          <p class="text-slate-700 text-sm leading-relaxed">{{ order.note }}</p>
        </div>
      </div>

      <!-- Items Card -->
      <div class="glass-card p-6">
        <h3 class="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">Items Ordered</h3>
        <div class="space-y-2">
          <div v-for="item in order.items" :key="item.id"
            class="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
            <div>
              <p class="text-slate-900 font-bold text-sm">{{ item.product?.name }}</p>
              <p class="text-slate-500 text-xs mt-0.5">{{ item.qty }} {{ item.product?.unit }} × ${{ Number(item.unit_price).toFixed(2) }}</p>
            </div>
            <p class="text-slate-900 font-black">${{ Number(item.subtotal).toFixed(2) }}</p>
          </div>
        </div>
        <div class="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <div v-if="Number(order.discount) > 0" class="flex justify-between items-center text-xs">
            <span class="text-slate-500 uppercase tracking-widest font-black text-[9px]">Subtotal</span>
            <span class="text-slate-900 font-bold">${{ (Number(order.total_amount) + Number(order.discount)).toFixed(2) }}</span>
          </div>
          <div v-if="Number(order.discount) > 0" class="flex justify-between items-center text-xs">
            <span class="text-slate-500 uppercase tracking-widest font-black text-[9px]">Discount</span>
            <span class="text-red-600 font-black">-${{ Number(order.discount).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-slate-700 font-bold">Grand Total</span>
            <span class="text-xl font-black text-blue-600">${{ Number(order.total_amount).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const api = useApi()
const order = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    order.value = await api.get(`/orders/${route.params.id}`) as any
  } finally { loading.value = false }
})

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isValidCoords(loc?: string) {
  if (!loc) return false
  return /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/.test(loc.trim())
}

function printInvoice() {
  if (!order.value?.invoice_url) return
  
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Invoice #${order.value.id}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: flex-start; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            img { max-width: 100%; height: auto; }
            @media print {
              @page { margin: 0; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <img src="${order.value.invoice_url}" onload="setTimeout(() => { window.print(); }, 500); window.onafterprint = function() { alert('Invoice Print Process Complete'); window.close(); };" />
        </body>
      </html>
    `)
    printWindow.document.close()
  }
}
</script>
