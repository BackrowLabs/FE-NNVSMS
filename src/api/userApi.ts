import { api } from '../lib/api'

export interface AppUser {
  id: string
  email: string | null
  fullName: string
  phone: string | null
  role: 'ADMIN' | 'OFFICE_EMPLOYEE' | 'TEACHER'
  isActive: boolean
  createdAt: string
}

export const userApi = {
  list: () =>
    api.get<AppUser[]>('/users').then(r => r.data),

  create: (payload: { email: string; password: string; fullName: string; role: string; phone?: string }) =>
    api.post<AppUser>('/users', payload).then(r => r.data),

  updateRole: (id: string, role: string) =>
    api.patch<AppUser>(`/users/${id}/role`, { role }).then(r => r.data),

  toggleActive: (id: string) =>
    api.patch<AppUser>(`/users/${id}/toggle-active`).then(r => r.data),
}
