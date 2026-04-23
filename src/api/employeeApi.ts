import { api } from '../lib/api'
import type { Employee, EmployeeSummary, CreateEmployeePayload, UpdateEmployeePayload } from '../types/employee'
import type { PageResponse } from '../types/student'

export const employeeApi = {
  list: (params: { department?: string; search?: string; page?: number; size?: number }) =>
    api.get<PageResponse<EmployeeSummary>>('/employees', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get<Employee>(`/employees/${id}`).then(r => r.data),

  getMe: () =>
    api.get<Employee>('/employees/me').then(r => r.data),

  create: (payload: CreateEmployeePayload) =>
    api.post<Employee>('/employees', payload).then(r => r.data),

  update: (id: number, payload: UpdateEmployeePayload) =>
    api.put<Employee>(`/employees/${id}`, payload).then(r => r.data),

  deactivate: (id: number) =>
    api.delete(`/employees/${id}`),
}
