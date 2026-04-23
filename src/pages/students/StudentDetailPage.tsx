import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '../../api/studentApi'
import { feeApi } from '../../api/feeApi'
import { useAuthStore } from '../../store/authStore'
import StudentFormModal from './StudentFormModal'
import PromoteStudentModal from './PromoteStudentModal'
import RecordPaymentModal from '../fees/RecordPaymentModal'
import type { StudentFee } from '../../types/fee'

const STATUS_STYLE: Record<string, string> = {
  PAID: 'bg-green-100 text-green-700',
  PARTIAL: 'bg-yellow-100 text-yellow-700',
  PENDING: 'bg-gray-100 text-gray-600',
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-3 flex">
      <dt className="w-40 text-sm font-medium text-gray-500 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-800">{value ?? '—'}</dd>
    </div>
  )
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { role } = useAuthStore()
  const [showEdit, setShowEdit] = useState(false)
  const [showPromote, setShowPromote] = useState(false)
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null)

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentApi.getById(Number(id)),
  })

  const { data: sections } = useQuery({ queryKey: ['sections'], queryFn: studentApi.getSections })
  const { data: academicYears } = useQuery({ queryKey: ['academic-years'], queryFn: studentApi.getAcademicYears })

  const { data: fees } = useQuery({
    queryKey: ['student-fees', Number(id)],
    queryFn: () => feeApi.getStudentFees(Number(id)),
    enabled: !!id,
  })

  const deactivate = useMutation({
    mutationFn: () => studentApi.deactivate(Number(id)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); navigate('/students') },
  })

  const canRecord = role === 'ADMIN' || role === 'OFFICE_EMPLOYEE'
  const canEdit = role === 'ADMIN' || role === 'OFFICE_EMPLOYEE'
  const canPromote = role === 'ADMIN' || role === 'OFFICE_EMPLOYEE' || role === 'TEACHER'

  const handleDownload = async (paymentId: number, receiptNo: string) => {
    const blob = await feeApi.downloadReceipt(paymentId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${receiptNo}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
  if (!student) return <div className="p-8 text-center text-red-400 text-sm">Student not found.</div>

  const pendingFees = fees?.filter(f => f.status !== 'PAID') ?? []
  const paidFees = fees?.filter(f => f.status === 'PAID') ?? []

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-2xl font-semibold text-gray-800 flex-1">{student.fullName}</h1>
        <div className="flex gap-2">
          {canPromote && student.isActive && (
            <button
              onClick={() => setShowPromote(true)}
              className="px-4 py-2 text-sm border border-amber-500 text-amber-600 rounded-md hover:bg-amber-50"
            >
              Promote / Transfer
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => setShowEdit(true)}
              className="px-4 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Edit
            </button>
          )}
          {role === 'ADMIN' && student.isActive && (
            <button
              onClick={() => { if (confirm('Deactivate this student?')) deactivate.mutate() }}
              className="px-4 py-2 text-sm border border-red-400 text-red-500 rounded-md hover:bg-red-50"
            >
              Deactivate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Personal Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Personal Info</h2>
          <dl className="divide-y divide-gray-100">
            <DetailRow label="Admission No." value={student.admissionNumber} />
            <DetailRow label="Date of Birth" value={student.dateOfBirth ?? undefined} />
            <DetailRow label="Gender" value={student.gender ?? undefined} />
            <DetailRow label="Address" value={student.address ?? undefined} />
            <DetailRow label="Enrolled" value={student.enrollmentDate} />
            <DetailRow label="Status" value={student.isActive ? 'Active' : 'Inactive'} />
          </dl>
        </div>

        {/* Academic Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Academic Info</h2>
          <dl className="divide-y divide-gray-100">
            <DetailRow label="Section" value={student.sectionName ?? undefined} />
            <DetailRow label="Academic Year" value={student.academicYearName ?? undefined} />
          </dl>

          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mt-6 mb-3">Parent / Guardian</h2>
          <dl className="divide-y divide-gray-100">
            <DetailRow label="Name" value={student.parentName ?? undefined} />
            <DetailRow label="Phone" value={student.parentPhone ?? undefined} />
            <DetailRow label="Email" value={student.parentEmail ?? undefined} />
          </dl>
        </div>

        {/* Fee Payments */}
        {fees !== undefined && (
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Fee Payments</h2>

            {fees.length === 0 ? (
              <p className="text-sm text-gray-400">No fee records assigned to this student.</p>
            ) : (
              <div className="space-y-6">
                {/* Pending / Partial fees */}
                {pendingFees.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Pending / Partial
                    </h3>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Fee Type</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Installment</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Due Date</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-600">Amount Due</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-600">Paid</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-600">Balance</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                          {canRecord && <th className="px-4 py-2" />}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingFees.map(fee => (
                          <>
                            {fee.rejectedReason && (
                              <tr key={`${fee.id}-rejection`} className="bg-red-50">
                                <td colSpan={canRecord ? 8 : 7} className="px-4 py-2">
                                  <div className="flex items-start gap-2 text-xs text-red-700">
                                    <span className="font-semibold shrink-0">Payment Rejected:</span>
                                    <span>{fee.rejectedReason}</span>
                                    <span className="shrink-0 text-red-400">— Please re-collect and re-submit.</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            <tr key={fee.id} className={`hover:bg-gray-50 ${fee.overdue ? 'bg-red-50' : ''}`}>
                              <td className="px-4 py-2 text-gray-700">{fee.feeType}</td>
                              <td className="px-4 py-2 text-gray-600">#{fee.installmentNumber}</td>
                              <td className="px-4 py-2 text-gray-600">
                                {fee.dueDate}
                                {fee.overdue && (
                                  <span className="ml-1 text-xs text-red-500 font-medium">Overdue</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-right text-gray-800">₹ {fee.amountDue.toLocaleString()}</td>
                              <td className="px-4 py-2 text-right text-green-600">₹ {fee.amountPaid.toLocaleString()}</td>
                              <td className="px-4 py-2 text-right font-medium text-gray-800">₹ {fee.balance.toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[fee.status]}`}>
                                  {fee.status}
                                </span>
                              </td>
                              {canRecord && (
                                <td className="px-4 py-2 text-right">
                                  <button
                                    onClick={() => setSelectedFee(fee)}
                                    className="text-xs text-indigo-600 hover:underline"
                                  >
                                    {fee.rejectedReason ? 'Re-collect Payment' : 'Collect Payment'}
                                  </button>
                                </td>
                              )}
                            </tr>
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Paid fees */}
                {paidFees.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Paid
                    </h3>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Fee Type</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Installment</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Due Date</th>
                          <th className="text-right px-4 py-2 font-medium text-gray-600">Amount Paid</th>
                          <th className="text-left px-4 py-2 font-medium text-gray-600">Receipt</th>
                          <th className="px-4 py-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paidFees.map(fee => (
                          <tr key={fee.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-700">{fee.feeType}</td>
                            <td className="px-4 py-2 text-gray-600">#{fee.installmentNumber}</td>
                            <td className="px-4 py-2 text-gray-600">{fee.dueDate}</td>
                            <td className="px-4 py-2 text-right font-medium text-green-700">₹ {fee.amountPaid.toLocaleString()}</td>
                            <td className="px-4 py-2 text-xs text-gray-500">{fee.receiptNumber ?? '—'}</td>
                            <td className="px-4 py-2 text-right">
                              {fee.approvedPaymentId && fee.receiptNumber && (
                                <button
                                  onClick={() => handleDownload(fee.approvedPaymentId!, fee.receiptNumber!)}
                                  className="text-xs text-green-600 hover:underline"
                                >
                                  Download Receipt
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {student.documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Documents</h2>
            <ul className="divide-y divide-gray-100">
              {student.documents.map(doc => (
                <li key={doc.id} className="py-2 flex items-center justify-between text-sm">
                  <span className="text-gray-700">{doc.name}</span>
                  <a href={doc.url} target="_blank" rel="noreferrer"
                    className="text-indigo-600 hover:underline text-xs">
                    View
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {showPromote && student && (
        <PromoteStudentModal
          student={student}
          sections={sections ?? []}
          academicYears={academicYears ?? []}
          onClose={() => setShowPromote(false)}
          onSuccess={() => {
            setShowPromote(false)
            qc.invalidateQueries({ queryKey: ['student', id] })
            qc.invalidateQueries({ queryKey: ['students'] })
          }}
        />
      )}

      {showEdit && student && (
        <StudentFormModal
          student={student}
          sections={sections ?? []}
          academicYears={academicYears ?? []}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); qc.invalidateQueries({ queryKey: ['student', id] }) }}
        />
      )}

      {selectedFee && (
        <RecordPaymentModal
          studentFee={selectedFee}
          onClose={() => setSelectedFee(null)}
          onSuccess={() => {
            setSelectedFee(null)
            qc.invalidateQueries({ queryKey: ['student-fees', Number(id)] })
            qc.invalidateQueries({ queryKey: ['pending-payments'] })
          }}
        />
      )}
    </div>
  )
}
