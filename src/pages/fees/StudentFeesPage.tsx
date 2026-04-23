import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { feeApi } from '../../api/feeApi'
import { studentApi } from '../../api/studentApi'
import RecordPaymentModal from './RecordPaymentModal'
import type { StudentFee } from '../../types/fee'
import { useAuthStore } from '../../store/authStore'

const STATUS_STYLE: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PARTIAL: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-gray-100 text-gray-600',
}

export default function StudentFeesPage() {
  const { role } = useAuthStore()
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()
  const preselectedStudentId = searchParams.get('studentId')

  const [search, setSearch] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    preselectedStudentId ? Number(preselectedStudentId) : null
  )
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null)

  const { data: students } = useQuery({
    queryKey: ['students', { search, page: 0 }],
    queryFn: () => studentApi.list({ search, page: 0, size: 10 }),
    enabled: search.length > 1,
  })

  const { data: fees, isLoading } = useQuery({
    queryKey: ['student-fees', selectedStudentId],
    queryFn: () => feeApi.getStudentFees(selectedStudentId!),
    enabled: !!selectedStudentId,
  })

  const canRecord = role === 'ADMIN' || role === 'OFFICE_EMPLOYEE'

  const handleDownload = async (paymentId: number, receiptNo: string) => {
    const blob = await feeApi.downloadReceipt(paymentId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${receiptNo}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Student Fees</h1>

      {/* Student search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Search Student</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Type student name or admission number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-gray-400"
          />
          {search.length > 1 && students?.content.length ? (
            <ul className="absolute z-10 border border-gray-200 rounded-xl mt-1 w-72 bg-white shadow-lg max-h-48 overflow-y-auto">
              {students.content.map(s => (
                <li key={s.id}>
                  <button
                    onClick={() => { setSelectedStudentId(s.id); setSearch('') }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{s.fullName}</span>
                    <span className="text-gray-400 ml-2 text-xs font-mono">{s.admissionNumber}</span>
                    <span className="text-gray-400 text-xs"> · {s.sectionName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Fee list */}
      {selectedStudentId && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : !fees?.length ? (
            <div className="p-12 text-center text-gray-400 text-sm">No fee records found for this student.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 border-b border-indigo-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Fee Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Installment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Due Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Amount Due</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Late Fee</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Paid</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Balance</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fees.map(fee => (
                  <>
                    {fee.rejectedReason && fee.status !== 'PAID' && (
                      <tr key={`${fee.id}-rejection`} className="bg-red-50">
                        <td colSpan={9} className="px-4 py-2">
                          <div className="flex items-start gap-2 text-xs text-red-700">
                            <span className="font-semibold shrink-0">Payment Rejected:</span>
                            <span>{fee.rejectedReason}</span>
                            <span className="shrink-0 text-red-400">— Please re-collect and re-submit.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr key={fee.id} className={`hover:bg-slate-50 transition-colors ${fee.overdue && fee.status !== 'PAID' ? 'bg-red-50/50' : ''}`}>
                      <td className="px-4 py-3 font-medium text-gray-700">{fee.feeType}</td>
                      <td className="px-4 py-3 text-gray-500">#{fee.installmentNumber}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {fee.dueDate}
                        {fee.overdue && fee.status !== 'PAID' && (
                          <span className="ml-1.5 text-xs text-red-500 font-semibold">Overdue</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">₹ {fee.amountDue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-500 font-medium">
                        {fee.lateFee > 0 ? `₹ ${fee.lateFee.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹ {fee.amountPaid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">₹ {fee.balance.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[fee.status]}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-y-1">
                        {fee.approvedPaymentId && fee.receiptNumber && (
                          <button onClick={() => handleDownload(fee.approvedPaymentId!, fee.receiptNumber!)}
                            className="block text-xs text-emerald-600 hover:underline font-medium">
                            Download Receipt
                          </button>
                        )}
                        {canRecord && fee.status !== 'PAID' && (
                          <button onClick={() => setSelectedFee(fee)}
                            className="block text-xs text-indigo-600 hover:underline font-medium">
                            {fee.rejectedReason ? 'Re-collect Payment' : 'Record Payment'}
                          </button>
                        )}
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selectedFee && (
        <RecordPaymentModal
          studentFee={selectedFee}
          onClose={() => setSelectedFee(null)}
          onSuccess={() => {
            setSelectedFee(null)
            qc.invalidateQueries({ queryKey: ['student-fees', selectedStudentId] })
            qc.invalidateQueries({ queryKey: ['pending-payments'] })
          }}
        />
      )}
    </div>
  )
}
