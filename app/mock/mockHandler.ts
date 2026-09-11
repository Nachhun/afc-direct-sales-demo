// Mock API Handler for AFC Direct Sales Demo
// Simulates a full REST API backend with in-memory persistence and realistic network delay.

import {
  MOCK_USERS,
  MOCK_PRODUCTS,
  MOCK_STORES,
  MOCK_ORDERS,
  MOCK_DELIVERIES,
  MOCK_SALES_REPS,
  MOCK_REPORTS_SUMMARY,
  MOCK_COMPARISON,
  MOCK_ASM_DASHBOARD,
} from './mockData'

// In-memory runtime state for mutations during the demo session
const ordersState = [...MOCK_ORDERS]
const deliveriesState = [...MOCK_DELIVERIES]

// Helper to simulate network latency for authentic feel
const sleep = (ms: number = 180) => new Promise(resolve => setTimeout(resolve, ms))

export const isDemoModeActive = (): boolean => {
  if (!import.meta.client) return true
  const token = localStorage.getItem('auth_token') || ''
  const isDemoUser = token.startsWith('demo_token_')
  const forceDemo = localStorage.getItem('demo_mode') !== 'false'
  return isDemoUser || forceDemo
}

export const setDemoMode = (active: boolean) => {
  if (import.meta.client) {
    localStorage.setItem('demo_mode', active ? 'true' : 'false')
  }
}

export async function handleMockRequest(
  method: string,
  path: string,
  body?: any,
  opts?: any
): Promise<any> {
  await sleep(150)

  // Clean path (strip domain and query parameters for route matching)
  const [urlPath = ''] = path.split('?')
  const cleanPath = urlPath.replace(/^\/api/, '')

  console.log(`[MockEngine] ${method} ${cleanPath}`)

  // 1. Auth routes
  if (cleanPath === '/login' && method === 'POST') {
    return {
      access_token: 'demo_token_super_admin',
      user: MOCK_USERS.super_admin,
    }
  }

  if (cleanPath === '/verify-admin-otp' && method === 'POST') {
    return {
      access_token: 'demo_token_admin',
      user: MOCK_USERS.admin,
    }
  }

  if (cleanPath === '/logout' && method === 'POST') {
    return { success: true, message: 'Demo session logged out' }
  }

  // 2. Orders routes
  if (cleanPath === '/orders' && method === 'GET') {
    return { orders: ordersState }
  }

  if (cleanPath.startsWith('/orders/') && method === 'GET') {
    const id = Number(cleanPath.split('/')[2])
    const order = ordersState.find(o => o.id === id) || ordersState[0]
    return { order }
  }

  if (cleanPath === '/orders' && method === 'POST') {
    const newId = 500 + ordersState.length + 1
    const newOrder = {
      id: newId,
      order_custom_id: `ORD-2026-${String(newId).padStart(3, '0')}`,
      shop_name: body?.shop_name || body?.store?.name || 'Retail Mart (Demo)',
      store_id: body?.store_id || 201,
      customer_address: body?.customer_address || 'Phnom Penh, Cambodia',
      contact: body?.contact || '012 345 678',
      total_amount: Number(body?.total_amount || 250.00),
      status: 'pending',
      payment_status: body?.payment_type || 'credit',
      created_at: new Date().toISOString(),
      user: MOCK_USERS.salesman,
      salesman_name: 'Sokha Meng',
      items: body?.items || [
        { id: 1, product: MOCK_PRODUCTS[0], qty: 5, unit: 'Carton', unit_price: 18.50 },
      ],
    }
    ordersState.unshift(newOrder)
    return {
      success: true,
      message: 'Demo order submitted successfully!',
      order: newOrder,
    }
  }

  // 3. Products routes
  if (cleanPath === '/products' && method === 'GET') {
    return MOCK_PRODUCTS
  }

  // 4. Stores routes
  if ((cleanPath === '/stores' || cleanPath === '/admin/stores') && method === 'GET') {
    return MOCK_STORES
  }

  // 5. Deliveries routes
  if (
    (cleanPath === '/deliveries' ||
      cleanPath === '/deliveries/my' ||
      cleanPath === '/admin/deliveries') &&
    method === 'GET'
  ) {
    return deliveriesState
  }

  if (cleanPath.startsWith('/deliveries/') && cleanPath.endsWith('/complete') && method === 'PUT') {
    const id = Number(cleanPath.split('/')[2])
    const delivery = deliveriesState.find(d => d.id === id)
    if (delivery) {
      delivery.status = body?.status || 'delivered'
    }
    return { success: true, message: 'Delivery completed (Demo Mode)' }
  }

  if (cleanPath.startsWith('/deliveries/') && cleanPath.endsWith('/shop-closed') && method === 'PUT') {
    const id = Number(cleanPath.split('/')[2])
    const delivery = deliveriesState.find(d => d.id === id)
    if (delivery) {
      delivery.status = 'failed_shop_closed'
    }
    return { success: true, message: 'Marked shop closed (Demo Mode)' }
  }

  if (cleanPath.startsWith('/deliveries/') && cleanPath.endsWith('/customer-cancel') && method === 'PUT') {
    const id = Number(cleanPath.split('/')[2])
    const delivery = deliveriesState.find(d => d.id === id)
    if (delivery) {
      delivery.status = 'customer_cancelled'
    }
    return { success: true, message: 'Customer cancellation recorded (Demo Mode)' }
  }

  if (cleanPath.startsWith('/deliveries/') && method === 'GET') {
    const id = Number(cleanPath.split('/')[2])
    const delivery = deliveriesState.find(d => d.id === id) || deliveriesState[0]
    return delivery
  }

  // 6. Reports & Executive Analytics
  if (cleanPath === '/admin/reports/summary') {
    return MOCK_REPORTS_SUMMARY
  }

  if (cleanPath === '/admin/reports/comparison') {
    return MOCK_COMPARISON
  }

  if (cleanPath === '/admin/users') {
    return [
      MOCK_USERS.super_admin,
      MOCK_USERS.admin,
      MOCK_USERS.asm,
      ...MOCK_SALES_REPS,
      MOCK_USERS.delivery,
    ]
  }

  // 7. Area Sales Manager (ASM) Dashboard
  if (cleanPath === '/asm/dashboard') {
    return MOCK_ASM_DASHBOARD
  }

  // Fallback default responses for unknown sub-paths
  if (cleanPath.includes('/overview') || cleanPath.includes('/kpi')) {
    return MOCK_REPORTS_SUMMARY
  }

  // Default generic success
  return { success: true, data: [] }
}
