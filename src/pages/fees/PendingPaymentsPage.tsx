import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feeApi } from '../../api/feeApi'

export default function PendingPaymentsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['pending-payments', page],
    queryFn: () => feeApi.getPendingPayments({ page, size: 20 }),
  })

  const approve = useMutation({
    mutationFn: (id: number) => feeApi.approvePayment(id, true),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-payments'] }),
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      feeApi.approvePayment(id, false, reason),
    onSuccess: () => {
      setRejectId(null)
      setRejectionReason('')
      qc.invalidateQueries({ queryKey: ['pending-payments'] })
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Pending Fee Approvals</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : !data?.content.length ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-500">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No pending payments to review.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-50 border-b border-amber-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-amber-700 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-amber-700 uppercase tracking-wider">Section</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-amber-700 uppercase tracking-wider">Fee</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-amber-700 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-amber-700 uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-amber-700 uppercase tracking-wider">Collected By</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-amber-700 uppercase tracking-wider">Notes</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.content.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800">{p.studentName}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.admissionNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.sectionName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.feeType} #{p.installmentNumber}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ₹ {p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.paymentDate}</td>
                    <td className="px-4 py-3 text-gray-600">{p.collectedByName}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[120px] truncate">{p.notes ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { if (confirm('Approve this payment?')) approve.mutate(p.id) }}
                          disabled={approve.isPending}
                          className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectId(p.id)}
                          className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 font-medium transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs text-gray-400">{data.totalElements} pending</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 disabled:opacity-40 transition-colors">← Prev</button>
                  <span className="px-2 text-xs text-gray-500">{page + 1} / {data.totalPages}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={data.last}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 disabled:opacity-40 transition-colors">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rejection modal */}
      {rejectId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-1">Reject Payment</h3>
            <p className="text-xs text-gray-400 mb-4">This reason will be shown to the employee who collected the payment.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason *</label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white resize-none placeholder:text-gray-300"
              placeholder="e.g. Receipt was not provided, amount mismatch…"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setRejectId(null); setRejectionReason('') }}
                className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => { if (!rejectionReason.trim()) return; reject.mutate({ id: rejectId, reason: rejectionReason }) }}
                disabled={reject.isPending || !rejectionReason.trim()}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium">
                {reject.isPending ? 'Rejecting…' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
