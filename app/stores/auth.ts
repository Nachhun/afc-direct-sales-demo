import { defineStore } from 'pinia'
import { MOCK_USERS } from '~/mock/mockData'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as any,
        token: '' as string,
    }),

    getters: {
        isLoggedIn: (state) => !!state.token,
        isSuperAdmin: (state) => {
            const role = state.user?.role?.toLowerCase() || ''
            return role === 'super_admin' || role === 'superadmin' || role === 'administrator' || role === 'super admin'
        },
        isAdmin: (state) => {
            const role = state.user?.role?.toLowerCase() || ''
            return role.includes('admin') || role === 'superadmin' || role === 'administrator' || role === 'sale_admin' || role === 'sale admin'
        },
        isSaleAdmin: (state) => {
            const role = state.user?.role?.toLowerCase() || ''
            return role === 'sale_admin' || role === 'sale admin'
        },
        isAdminReporter: (state) => state.user?.role?.toLowerCase() === 'admin_reporter',
        isAdminDelivery: (state) => state.user?.role?.toLowerCase() === 'admin_delivery',
        isSalesman: (state) => state.user?.role?.toLowerCase() === 'salesman',
        isDelivery: (state) => state.user?.role?.toLowerCase() === 'delivery',
        isAsm: (state) => {
            const role = state.user?.role?.toLowerCase() || ''
            return role === 'asm' || role === 'area_sales_manager' || role === 'area sales manager'
        },
        canManageDeliveries: (state) => {
            const role = state.user?.role?.toLowerCase() || ''
            return role === 'super_admin' || role === 'superadmin' || role === 'administrator' || role === 'admin' || role === 'admin_delivery' || role === 'super admin'
        },
    },

    actions: {
        loginDemo(roleKey: 'super_admin' | 'admin' | 'asm' | 'salesman' | 'delivery' = 'super_admin') {
            const user = MOCK_USERS[roleKey] || MOCK_USERS.super_admin
            const token = `demo_token_${roleKey}`

            this.token = token
            this.user = user

            if (import.meta.client) {
                localStorage.setItem('auth_token', token)
                localStorage.setItem('auth_user', JSON.stringify(user))
                localStorage.setItem('demo_mode', 'true')
            }

            // Route to appropriate initial dashboard/workflow
            if (roleKey === 'super_admin' || roleKey === 'admin') {
                navigateTo('/admin')
            } else if (roleKey === 'asm') {
                navigateTo('/asm')
            } else if (roleKey === 'salesman') {
                navigateTo('/order/new')
            } else if (roleKey === 'delivery') {
                navigateTo('/delivery')
            } else {
                navigateTo('/admin')
            }
        },

        async login(telegram_id?: string, initData?: string) {
            const config = useRuntimeConfig()
            const apiBase = import.meta.client && window.location.hostname === 'localhost'
                ? '/api'
                : config.public.apiBase
            const normalizedTelegramId = telegram_id?.trim()
            const body = initData
                ? { initData }
                : normalizedTelegramId
                    ? { telegram_id: normalizedTelegramId }
                    : null

            if (!body) {
                throw { message: 'Telegram ID is required.' }
            }

            const res = await $fetch<{ user: any; access_token: string }>(`${apiBase}/login`, {
                method: 'POST',
                body,
            })
            this.token = res.access_token
            this.user = res.user
            // Persist to localStorage
            if (import.meta.client) {
                localStorage.setItem('auth_token', res.access_token)
                localStorage.setItem('auth_user', JSON.stringify(res.user))
            }
        },

        async verifyAdminOtp(email: string, otp: string) {
            const config = useRuntimeConfig()
            const apiBase = import.meta.client && window.location.hostname === 'localhost'
                ? '/api'
                : config.public.apiBase

            const res = await $fetch<{ user: any; access_token: string }>(`${apiBase}/verify-admin-otp`, {
                method: 'POST',
                body: { email, otp },
            })
            
            this.token = res.access_token
            this.user = res.user
            if (import.meta.client) {
                localStorage.setItem('auth_token', res.access_token)
                localStorage.setItem('auth_user', JSON.stringify(res.user))
            }
        },

        async logout() {
            const config = useRuntimeConfig()
            const apiBase = import.meta.client && window.location.hostname === 'localhost'
                ? '/api'
                : config.public.apiBase
            try {
                await $fetch(`${apiBase}/logout`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${this.token}` },
                })
            } catch { }
            this.token = ''
            this.user = null
            if (import.meta.client) {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
            }
            navigateTo('/login')
        },

        loadFromStorage() {
            if (import.meta.client) {
                try {
                    const token = localStorage.getItem('auth_token')
                    const user = localStorage.getItem('auth_user')
                    if (token && user && user !== 'undefined' && user !== 'null') {
                        this.token = token
                        this.user = JSON.parse(user)
                    }
                } catch (e) {
                    console.error('Failed to load auth from storage', e)
                    this.token = ''
                    this.user = null
                    localStorage.removeItem('auth_token')
                    localStorage.removeItem('auth_user')
                }
            }
        }
    }
})
