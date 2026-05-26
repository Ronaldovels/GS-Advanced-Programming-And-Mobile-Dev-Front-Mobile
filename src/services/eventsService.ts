import request from './api';
import type { MissionEvent } from '../types';

export const eventsService = {
  getAll: () => request<MissionEvent[]>('/events'),
  getById: (id: number) => request<MissionEvent>(`/events/${id}`),
  create: (data: Omit<MissionEvent, 'id'>) =>
    request<MissionEvent>('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Omit<MissionEvent, 'id'>>) =>
    request<MissionEvent>(`/events/${id}`, { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  remove: (id: number) =>
    request<void>(`/events/${id}`, { method: 'DELETE' }),
};
