export type FeeType = 'TUITION' | 'TRANSPORT' | 'LIBRARY' | 'EXAM'
export type PaymentStatus = 'PENDING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
export type StudentFeeStatus = 'PENDING' | 'PARTIAL' | 'PAID'

export interface FeeInstallment {
  id: number
  installmentNumber: number
  dueDate: string
  amount: number
}

export interface FeeStructure {
  id: number
  academicYearId: number
  academicYearName: string
  gradeId: number
  gradeName: string
  feeType: FeeType
  totalAmount: number
  installments: FeeInstallment[]
  createdAt: string
}

export interface StudentFee {
  id: number
  studentId: number
  studentName: string
  admissionNumber: string
  sectionName: string | null
  installmentId: number
  installmentNumber: number
  dueDate: string
  feeType: FeeType
  amountDue: number
  amountPaid: number
  lateFee: number
  balance: number
  status: StudentFeeStatus
  overdue: boolean
  approvedPaymentId: number | null
  receiptNumber: string | null
  rejectedPaymentId: number | null
  rejectedReason: string | null
}

export interface FeePayment {
  id: number
  studentFeeId: number
  studentId: number
  studentName: string
  admissionNumber: string
  sectionName: string | null
  feeType: string
  installmentNumber: number
  amount: number
  paymentDate: string
  receiptNumber: string | null
  collectedByName: string
  status: PaymentStatus
  approvedByName: string | null
  approvedAt: string | null
  rejectionReason: string | null
  notes: string | null
  createdAt: string
}

export interface CreateFeeStructurePayload {
  academicYearId: number
  gradeId: number
  feeType: FeeType
  totalAmount: number
  installments: { installmentNumber: number; dueDate: string; amount: number }[]
}

export interface RecordPaymentPayload {
  studentFeeId: number
  amount: number
  paymentDate: string
  notes?: string
}
