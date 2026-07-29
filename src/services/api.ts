import { UserProfile, StudioSettings, NailProduct } from '../types';

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include', // Automatically send/receive HTTP-only session cookies
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string, requestedPortal?: 'admin' | 'client') =>
    fetchAPI<{ success: boolean; token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, requestedPortal }),
    }),

  register: (name: string, email: string, password: string, phone?: string) =>
    fetchAPI<{ success: boolean; token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    }),

  googleLogin: (credential?: string, userInfo?: any) =>
    fetchAPI<{ success: boolean; token: string; user: UserProfile }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential, userInfo }),
    }),

  adminGoogleLogin: (credential?: string) =>
    fetchAPI<{ success: boolean; token: string; user: UserProfile }>('/auth/admin/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    }),

  getMe: () => fetchAPI<{ success: boolean; user: UserProfile }>('/auth/me'),

  logout: () =>
    fetchAPI<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  // Products
  getProducts: () => fetchAPI<{ success: boolean; products: NailProduct[] }>('/products'),

  createProduct: (product: Partial<NailProduct>) =>
    fetchAPI<{ success: boolean; product: NailProduct }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  updateProduct: (id: string, product: Partial<NailProduct>) =>
    fetchAPI<{ success: boolean; product: NailProduct }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),

  deleteProduct: (id: string) =>
    fetchAPI<{ success: boolean }>(`/products/${id}`, {
      method: 'DELETE',
    }),

  // Orders
  createOrder: (orderData: any) =>
    fetchAPI<{ success: boolean; order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getMyOrders: () => fetchAPI<{ success: boolean; orders: any[] }>('/orders/my'),

  getAllOrders: () => fetchAPI<{ success: boolean; orders: any[] }>('/orders'),

  updateOrderStatus: (id: string, status: string) =>
    fetchAPI<{ success: boolean; order: any }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Appointments
  createAppointment: (appointmentData: any) =>
    fetchAPI<{ success: boolean; appointment: any }>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),

  getMyAppointments: () => fetchAPI<{ success: boolean; appointments: any[] }>('/appointments/my'),

  getAllAppointments: () => fetchAPI<{ success: boolean; appointments: any[] }>('/appointments'),

  updateAppointmentStatus: (id: string, status: string) =>
    fetchAPI<{ success: boolean; appointment: any }>(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Contact Messages
  submitMessage: (messageData: { name: string; email: string; phone?: string; message: string }) =>
    fetchAPI<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),

  getMessages: () => fetchAPI<{ success: boolean; messages: any[] }>('/contact'),

  // Settings
  getSettings: () => fetchAPI<{ success: boolean; settings: StudioSettings }>('/settings'),

  updateSettings: (settings: Partial<StudioSettings>) =>
    fetchAPI<{ success: boolean; settings: StudioSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Users (Admin only)
  getUsers: () => fetchAPI<{ success: boolean; users: UserProfile[] }>('/users'),
};
