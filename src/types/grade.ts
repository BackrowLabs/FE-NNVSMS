export interface GradeRecord {
  id: number
  studentId: number
  studentName: string
  admissionNumber: string
  sectionName: string | null
  academicYearId: number
  academicYearName: string
  subject: string
  term: string
  letterGrade: string | null
  marks: number | null
  remarks: string | null
  updatedAt: string
}

export const LETTER_GRADES = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'] as const
export type LetterGrade = typeof LETTER_GRADES[number]
