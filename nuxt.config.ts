/// <reference types="node" />
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/icon',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      allowBrowser: true,
    }
  },

  nitro: {
    preset: 'static',
    devProxy: {
      '/api': {
        target: process.env.NUXT_PUBLIC_API_URL || 'https://d-order.apratifoods.asia/api',
        changeOrigin: true,
      }
    }
  },

  experimental: {
    appManifest: false,
  },

  app: {
    head: {
      title: 'AFC Direct Sales',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'description', content: 'AFC Direct Sales Order Management System' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ],
      script: [
        {
          innerHTML: 'window.__NUXT__ = window.__NUXT__ || {}; window.__NUXT__.config = window.__NUXT__.config || { public: { apiBase: "/api", allowBrowser: true }, app: { baseURL: "/", buildAssetsDir: "/_nuxt/", cdnURL: "" } };',
          type: 'text/javascript',
        },
        { 
          src: '/telegram-web-app.js', 
          defer: false
        },
      ],
    }
  },

  ssr: false, // SPA mode for Telegram Mini App
  vite: {
    server: {
      allowedHosts: true
    }
  }
})
