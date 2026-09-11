import { useAuthStore } from '~/stores/auth'
import { isDemoModeActive, handleMockRequest } from '~/mock/mockHandler'

// Composable to make API calls with auth token automatically attached
// Automatically routes to synthetic MockEngine when in Demo Mode
export const useApi = () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const apiBase = import.meta.client && window.location.hostname === 'localhost'
        ? '/api'
        : config.public.apiBase

    const fetchOptions = (opts: any, method: string, body?: any) => ({
        ...opts,
        method,
        body,
        headers: {
            Authorization: `Bearer ${authStore.token}`,
            Accept: 'application/json',
            ...opts.headers,
        },
        onResponseError({ response }: { response: any }) {
            if (response.status === 401 && !isDemoModeActive()) {
                authStore.logout()
            }
            let errorMsg = 'An unexpected error occurred'
            const rawData = response._data
            if (typeof rawData === 'string') {
                if (response.status === 503) {
                    errorMsg = 'Server is temporarily updating or unavailable (503). Please try again shortly.'
                } else if (response.status === 502 || response.status === 504) {
                    errorMsg = 'Server gateway timeout. Please check your connection and retry.'
                } else if (rawData.trim().startsWith('<!DOCTYPE') || rawData.trim().startsWith('<html')) {
                    errorMsg = `Server response error (${response.status || 500}). Please refresh the page.`
                } else {
                    errorMsg = rawData
                }
            } else if (rawData && typeof rawData === 'object') {
                errorMsg = rawData.message || rawData.error || errorMsg
            }

            const error = new Error(errorMsg) as any
            error.status = response.status
            error.data = rawData
            throw error
        }
    })

    const get = async (path: string, opts: any = {}) => {
        if (isDemoModeActive()) {
            return handleMockRequest('GET', path, undefined, opts)
        }
        try {
            return await $fetch(`${apiBase}${path}`, fetchOptions(opts, 'GET'))
        } catch (e: any) {
            console.warn('[API] Real API unavailable, serving from Demo MockEngine:', e)
            return handleMockRequest('GET', path, undefined, opts)
        }
    }

    const post = async (path: string, body: any = {}, opts: any = {}) => {
        if (isDemoModeActive()) {
            return handleMockRequest('POST', path, body, opts)
        }
        try {
            return await $fetch(`${apiBase}${path}`, fetchOptions(opts, 'POST', body))
        } catch (e: any) {
            console.warn('[API] Real API unavailable, serving from Demo MockEngine:', e)
            return handleMockRequest('POST', path, body, opts)
        }
    }

    const put = async (path: string, body: any = {}, opts: any = {}) => {
        if (isDemoModeActive()) {
            return handleMockRequest('PUT', path, body, opts)
        }
        try {
            return await $fetch(`${apiBase}${path}`, fetchOptions(opts, 'PUT', body))
        } catch (e: any) {
            console.warn('[API] Real API unavailable, serving from Demo MockEngine:', e)
            return handleMockRequest('PUT', path, body, opts)
        }
    }

    const del = async (path: string, opts: any = {}) => {
        if (isDemoModeActive()) {
            return handleMockRequest('DELETE', path, undefined, opts)
        }
        try {
            return await $fetch(`${apiBase}${path}`, fetchOptions(opts, 'DELETE'))
        } catch (e: any) {
            console.warn('[API] Real API unavailable, serving from Demo MockEngine:', e)
            return handleMockRequest('DELETE', path, undefined, opts)
        }
    }

    const patch = async (path: string, body: any = {}, opts: any = {}) => {
        if (isDemoModeActive()) {
            return handleMockRequest('PATCH', path, body, opts)
        }
        try {
            return await $fetch(`${apiBase}${path}`, fetchOptions(opts, 'PATCH', body))
        } catch (e: any) {
            console.warn('[API] Real API unavailable, serving from Demo MockEngine:', e)
            return handleMockRequest('PATCH', path, body, opts)
        }
    }

    return { get, post, put, del, patch }
}
