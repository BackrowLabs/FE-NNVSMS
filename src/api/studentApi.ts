import { api } from '../lib/api'
import type {
  Student, StudentSummary, CreateStudentPayload,
  UpdateStudentPayload, PageResponse, Section, AcademicYear
} from '../types/student'

export const studentApi = {
  list: (params: {
    academicYearId?: number
    sectionId?: number
    search?: string
    page?: number
    size?: number
  }) => api.get<PageResponse<StudentSummary>>('/students', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get<Student>(`/students/${id}`).then(r => r.data),

  create: (payload: CreateStudentPayload) =>
    api.post<Student>('/students', payload).then(r => r.data),

  update: (id: number, payload: UpdateStudentPayload) =>
    api.put<Student>(`/students/${id}`, payload).then(r => r.data),

  promote: (id: number, payload: { sectionId: number; academicYearId: number }) =>
    api.patch<Student>(`/students/${id}/promote`, payload).then(r => r.data),

  deactivate: (id: number) =>
    api.delete(`/students/${id}`),

  getSections: () =>
    api.get<Section[]>('/sections').then(r => r.data),

  getAcademicYears: () =>
    api.get<AcademicYear[]>('/academic-years').then(r => r.data),
}
