export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface StudentDocument {
  id: number
  name: string
  url: string
  uploadedAt: string
}

export interface StudentSummary {
  id: number
  admissionNumber: string
  fullName: string
  sectionName: string
  academicYearName: string
  parentPhone: string
  isActive: boolean
}

export interface Student {
  id: number
  admissionNumber: string
  fullName: string
  dateOfBirth: string | null
  gender: Gender | null
  address: string | null
  photoUrl: string | null
  parentName: string | null
  parentPhone: string | null
  parentEmail: string | null
  sectionId: number | null
  sectionName: string | null
  academicYearId: number | null
  academicYearName: string | null
  enrollmentDate: string
  isActive: boolean
  documents: StudentDocument[]
  createdAt: string
  updatedAt: string
}

export interface CreateStudentPayload {
  fullName: string
  sectionId: number
  academicYearId: number
  admissionNumber?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  enrollmentDate?: string
}

export interface UpdateStudentPayload {
  fullName: string
  sectionId: number
  dateOfBirth?: string
  gender?: Gender
  address?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface Section {
  id: number
  name: string
  gradeId: number
  gradeName: string
  fullName: string
}

export interface AcademicYear {
  id: number
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
}
