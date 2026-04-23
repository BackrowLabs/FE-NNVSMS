import { api } from '../lib/api'

export interface AcademicYear {
  id: number
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

export interface GradeLevel {
  id: number
  name: string
  orderNum: number
}

export interface Section {
  id: number
  name: string
  gradeId: number
  gradeName: string
  fullName: string
}

export const configApi = {
  // Academic Years
  listYears: () => api.get<AcademicYear[]>('/academic-years').then(r => r.data),
  createYear: (payload: { name: string; startDate: string; endDate: string }) =>
    api.post<AcademicYear>('/academic-years', payload).then(r => r.data),
  setCurrentYear: (id: number) =>
    api.patch<AcademicYear>(`/academic-years/${id}/set-current`).then(r => r.data),
  deleteYear: (id: number) => api.delete(`/academic-years/${id}`),

  // Grade Levels
  listGrades: () => api.get<GradeLevel[]>('/grade-levels').then(r => r.data),
  createGrade: (payload: { name: string; orderNum: number }) =>
    api.post<GradeLevel>('/grade-levels', payload).then(r => r.data),
  deleteGrade: (id: number) => api.delete(`/grade-levels/${id}`),

  // Sections
  listSections: () => api.get<Section[]>('/sections').then(r => r.data),
  createSection: (payload: { gradeId: number; name: string }) =>
    api.post<Section>('/sections', payload).then(r => r.data),
  deleteSection: (id: number) => api.delete(`/sections/${id}`),
}
