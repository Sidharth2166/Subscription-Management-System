/**
 * SubFlow Central API Client
 * Automatically attaches JWT bearer tokens and standard headers
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('subflow_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // Fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/api/auth/me'),

  // Analytics & Dashboard
  getDashboardPulse: () => request<any>('/api/analytics/dashboard-pulse'),

  // Customers
  getCustomers: (params?: { search?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.status) searchParams.set('status', params.status);
    return request<any[]>(`/api/customers?${searchParams.toString()}`);
  },
  getCustomer: (id: number | string) => request<any>(`/api/customers/${id}`),
  createCustomer: (data: any) => request<any>('/api/customers', { method: 'POST', body: JSON.stringify(data) }),

  // Products & Plans
  getProducts: () => request<any[]>('/api/products'),
  createProduct: (data: any) => request<any>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  getPlans: () => request<any[]>('/api/plans'),
  createPlan: (data: any) => request<any>('/api/plans', { method: 'POST', body: JSON.stringify(data) }),

  // Quotations
  getQuotations: () => request<any[]>('/api/quotations'),
  createQuotation: (data: any) => request<any>('/api/quotations', { method: 'POST', body: JSON.stringify(data) }),
  convertToSubscription: (id: number | string) => request<any>(`/api/quotations/${id}/convert-to-subscription`, { method: 'POST' }),

  // Subscriptions
  getSubscriptions: (params?: { status?: string; health?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.health) searchParams.set('health', params.health);
    return request<any[]>(`/api/subscriptions?${searchParams.toString()}`);
  },
  getSubscription: (id: number | string) => request<any>(`/api/subscriptions/${id}`),
  getProrationPreview: (subId: number | string, newPlanId: number | string) =>
    request<any>(`/api/subscriptions/${subId}/proration-preview?new_plan_id=${newPlanId}`),
  changePlan: (subId: number | string, newPlanId: number | string) =>
    request<any>(`/api/subscriptions/${subId}/change-plan?new_plan_id=${newPlanId}`, { method: 'POST' }),
  updateSubscriptionStatus: (subId: number | string, newStatus: string, reason?: string) =>
    request<any>(`/api/subscriptions/${subId}/status?new_status=${newStatus}&reason=${encodeURIComponent(reason || '')}`, { method: 'POST' }),

  // Invoices
  getInvoices: (params?: { status?: string; customer_id?: number | string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.customer_id) searchParams.set('customer_id', String(params.customer_id));
    return request<any[]>(`/api/invoices?${searchParams.toString()}`);
  },
  getInvoice: (id: number | string) => request<any>(`/api/invoices/${id}`),
  generateInvoice: (subId: number | string, period: string, discountCode?: string) => {
    let url = `/api/invoices/generate?subscription_id=${subId}&billing_period=${period}`;
    if (discountCode) url += `&discount_code=${discountCode}`;
    return request<any>(url, { method: 'POST' });
  },
  simulatePaymentFailure: (invoiceId: number | string) =>
    request<any>(`/api/invoices/${invoiceId}/simulate-failure`, { method: 'POST' }),
  simulateRetrySuccess: (invoiceId: number | string) =>
    request<any>(`/api/invoices/${invoiceId}/simulate-retry-success`, { method: 'POST' }),
  getInvoicePdfUrl: (invoiceId: number | string) => `${API_BASE_URL}/api/invoices/${invoiceId}/pdf`,

  // Payments
  getPayments: (params?: { invoice_id?: number | string; customer_id?: number | string }) => {
    const searchParams = new URLSearchParams();
    if (params?.invoice_id) searchParams.set('invoice_id', String(params.invoice_id));
    if (params?.customer_id) searchParams.set('customer_id', String(params.customer_id));
    return request<any[]>(`/api/payments?${searchParams.toString()}`);
  },
  recordPayment: (data: any) => request<any>('/api/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Smart Guardian
  auditSubscription: (subId: number | string, period: string) =>
    request<any>(`/api/guardian/audit?subscription_id=${subId}&billing_period=${period}`),

  // Revenue Rescue
  getRescueSummary: () => request<any>('/api/rescue/summary'),
  getRescueQueue: () => request<any[]>('/api/rescue/queue'),
  sendReminder: (invoiceId: number | string) => request<any>(`/api/rescue/send-reminder/${invoiceId}`, { method: 'POST' }),

  // AI Copilot
  queryCopilot: (query: string, sessionId?: string) =>
    request<any>('/api/copilot/query', { method: 'POST', body: JSON.stringify({ query, session_id: sessionId }) }),

  // Notifications
  getNotifications: () => request<any[]>('/api/notifications'),
  markNotificationRead: (id: number | string) => request<any>(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<any>('/api/notifications/read-all', { method: 'POST' }),

  // Settings & Demo Tools
  fastForwardCycle: () => request<any>('/api/settings/fast-forward-cycle', { method: 'POST' }),
  getTaxes: () => request<any[]>('/api/settings/taxes'),
  getDiscounts: () => request<any[]>('/api/settings/discounts'),
};
