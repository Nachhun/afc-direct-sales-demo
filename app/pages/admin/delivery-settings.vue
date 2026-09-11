<template>
  <div class="p-6 text-center text-slate-500 font-bold">
    Redirecting to system settings...
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  navigateTo('/admin/settings')
})
</script>
