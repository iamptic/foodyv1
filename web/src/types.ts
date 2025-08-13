export type User = {
  id: string;
  email: string;
  name?: string;
  city?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  createdAt?: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user: User;
};

export type OrderStatus = 'new' | 'in_progress' | 'done' | 'archived' | 'canceled';

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  total: number;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
};

export type OrdersQuery = {
  status?: OrderStatus | 'all';
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  page?: number;     // 1-based
  pageSize?: number; // default 20
};

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };
