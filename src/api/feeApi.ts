import { api } from '../lib/api'
import type {
  FeeStructure, StudentFee, FeePayment,
  CreateFeeStructurePayload, RecordPaymentPayload
} from '../types/fee'
import type { PageResponse } from '../types/student'

export const feeApi = {
  // Fee structures
  listStructures: (params?: { academicYearId?: number; gradeId?: number }) =>
    api.get<FeeStructure[]>('/fee-structures', { params }).then(r => r.data),

  getStructure: (id: number) =>
    api.get<FeeStructure>(`/fee-structures/${id}`).then(r => r.data),

  createStructure: (payload: CreateFeeStructurePayload) =>
    api.post<FeeStructure>('/fee-structures', payload).then(r => r.data),

  updateStructure: (id: number, payload: { totalAmount: number; installments: { installmentNumber: number; dueDate: string; amount: number }[] }) =>
    api.put<FeeStructure>(`/fee-structures/${id}`, payload).then(r => r.data),

  publishStructure: (id: number) =>
    api.post<{ message: string; count: number }>(`/fee-structures/${id}/publish`).then(r => r.data),

  // Student fees
  getStudentFees: (studentId: number) =>
    api.get<StudentFee[]>(`/fee-structures/student/${studentId}`).then(r => r.data),

  getInstallmentFees: (installmentId: number) =>
    api.get<StudentFee[]>(`/fee-structures/installment/${installmentId}/fees`).then(r => r.data),

  // Payments
  getPendingPayments: (params?: { page?: number; size?: number }) =>
    api.get<PageResponse<FeePayment>>('/fee-payments/pending', { params }).then(r => r.data),

  countPending: () =>
    api.get<{ count: number }>('/fee-payments/pending/count').then(r => r.data),

  recordPayment: (payload: RecordPaymentPayload) =>
    api.post<FeePayment>('/fee-payments', payload).then(r => r.data),

  approvePayment: (id: number, approved: boolean, rejectionReason?: string) =>
    api.patch<FeePayment>(`/fee-payments/${id}/approve`, { approved, rejectionReason }).then(r => r.data),

  downloadReceipt: (paymentId: number) =>
    api.get(`/fee-payments/${paymentId}/receipt`, { responseType: 'blob' }).then(r => r.data as Blob),
}
