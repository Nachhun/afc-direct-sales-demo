<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()
onMounted(() => {
  authStore.loadFromStorage()
  if (authStore.isLoggedIn) {
    if (authStore.isAdmin) navigateTo('/admin')
    else if (authStore.isDelivery) navigateTo('/delivery')
    else if (authStore.isAsm) navigateTo('/asm')
    else navigateTo('/order/new')
  } else {
    navigateTo('/login')
  }
})
</script>
