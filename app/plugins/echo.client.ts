// @ts-ignore
import Echo from 'laravel-echo'
// @ts-ignore
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof window === 'undefined') {
    return {
      provide: {
        echo: null as Echo<any> | null
      }
    }
  }

  window.Pusher = Pusher
  const isHttps = window.location.protocol === 'https:'
  let echoInstance: Echo<any> | null = null

  // Fetch real Reverb config in the background — only initialize when configured
  $fetch('/api/global-settings').then((res: any) => {
    if (!res?.reverb_key) return
    try {
      const key = res.reverb_key
      const host = res.reverb_host || window.location.hostname
      const port = Number(res.reverb_port) || 8080
      const scheme = res.reverb_scheme || (isHttps ? 'https' : 'http')
      const tls = scheme === 'https'

      echoInstance = new Echo({
        broadcaster: 'reverb',
        key,
        wsHost: host,
        wsPort: port,
        wssPort: port,
        forceTLS: tls,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
      })
      window.Echo = echoInstance
    } catch (e) {
      console.warn('[Echo] Failed to initialize Echo with server settings:', e)
    }
  }).catch(() => {
    // silently ignore if settings cannot be reached
  })

  return {
    provide: {
      echo: echoInstance
    }
  }
})
