import request from './api';
import type { Sensor } from '../types';

export const sensorsService = {
  getAll: () => request<Sensor[]>('/sensors'),
  getById: (id: number) => request<Sensor>(`/sensors/${id}`),
  create: (data: Omit<Sensor, 'id'>) =>
    request<Sensor>('/sensors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Omit<Sensor, 'id'>>) =>
    request<Sensor>(`/sensors/${id}`, { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  remove: (id: number) =>
    request<void>(`/sensors/${id}`, { method: 'DELETE' }),
};
