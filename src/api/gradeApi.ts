import { api } from '../lib/api'
import type { GradeRecord } from '../types/grade'

export const gradeApi = {
  getStudentGrades: (studentId: number, academicYearId?: number) =>
    api.get<GradeRecord[]>(`/grades/student/${studentId}`, { params: { academicYearId } }).then(r => r.data),

  getSectionGrades: (sectionId: number, subject: string, term: string, academicYearId?: number) =>
    api.get<GradeRecord[]>(`/grades/section/${sectionId}`, {
      params: { subject, term, academicYearId }
    }).then(r => r.data),

  saveGrades: (payload: {
    academicYearId: number
    sectionId: number
    subject: string
    term: string
    entries: { studentId: number; letterGrade?: string; marks?: number; remarks?: string }[]
  }) => api.post<GradeRecord[]>('/grades', payload).then(r => r.data),
}
