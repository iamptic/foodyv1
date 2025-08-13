import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './auth';
import type { OrdersQuery, Paged, Order } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function refresh() {
  const rt = getRefreshToken();
  if (!rt) return null;
  const resp = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rt }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (data?.accessToken) setAccessToken(data.accessToken);
  if (data?.refreshToken) setRefreshToken(data.refreshToken);
  return data;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(init.headers || {}) };
  const at = getAccessToken();
  if (at) headers['Authorization'] = `Bearer ${at}`;

  let resp = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (resp.status === 401) {
    const r = await refresh();
    if (r?.accessToken) {
      const headers2: HeadersInit = { 'Content-Type': 'application/json', ...(init.headers || {}) };
      headers2['Authorization'] = `Bearer ${r.accessToken}`;
      resp = await fetch(`${BASE_URL}${path}`, { ...init, headers: headers2 });
    }
  }

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `API error ${resp.status}`);
  }

  if (resp.status === 204) return undefined as T;
  return (await resp.json()) as T;
}

function q(params: Record<string, any>) {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : '';
}

export const AuthAPI = {
  login: (email: string, password: string) =>
    api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload: any) => api('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => api('/auth/me'),
  logout: async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    clearTokens();
  },
};

export const ProfileAPI = {
  get: () => api('/user/profile'),
  update: (payload: any) => api('/user/profile', { method: 'PUT', body: JSON.stringify(payload) }),
};

export const OrdersAPI = {
  list: (params: OrdersQuery) => api<Paged<Order>>(`/orders${q(params)}`),
  archive: (orderId: string) => api(`/orders/${orderId}/archive`, { method: 'POST' }),
  bulkArchive: (ids: string[]) => api(`/orders/archive/bulk`, { method: 'POST', body: JSON.stringify({ ids }) }),
  csv: (params: OrdersQuery) => {
    const path = `/orders/export.csv${q(params)}`;
    return fetch(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${getAccessToken()}` || '' } });
  },
};
