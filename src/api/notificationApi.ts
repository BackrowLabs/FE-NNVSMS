import { api } from '../lib/api'
import type { Notification } from '../types/notification'

export const notificationApi = {
  getAll: () =>
    api.get<Notification[]>('/notifications').then(r => r.data),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then(r => r.data.count),

  markRead: (id: number) =>
    api.patch(`/notifications/${id}/read`),
}
