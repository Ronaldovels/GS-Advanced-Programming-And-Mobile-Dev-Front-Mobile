import request from './api';
import type { Alert } from '../types';

export const alertsService = {
  getAll: () => request<Alert[]>('/alerts'),
  getById: (id: number) => request<Alert>(`/alerts/${id}`),
  create: (data: Omit<Alert, 'id'>) =>
    request<Alert>('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Omit<Alert, 'id'>>) =>
    request<Alert>(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  remove: (id: number) =>
    request<void>(`/alerts/${id}`, { method: 'DELETE' }),
};
