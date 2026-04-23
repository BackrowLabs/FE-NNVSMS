import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '../../api/attendanceApi'
import { employeeApi } from '../../api/employeeApi'
import { useAuthStore } from '../../store/authStore'
import type { LeaveStatus, LeaveType } from '../../types/attendance'

const STATUS_STYLE: Record<LeaveStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
}

export default function LeavePage() {
  const { role } = useAuthStore()
  const qc = useQueryClient()
  const isAdmin = role === 'ADMIN'

  const [filterStatus, setFilterStatus] = useState<LeaveStatus | ''>('')
  const [showApply, setShowApply] = useState(false)
  const [applyForm, setApplyForm] = useState({
    employeeId: '', leaveType: 'SICK' as LeaveType,
    startDate: '', endDate: '', reason: '',
  })

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves', filterStatus],
    queryFn: () => attendanceApi.getLeaves({ status: filterStatus as LeaveStatus || undefined }),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => employeeApi.list({ page: 0, size: 200 }),
    enabled: isAdmin,
  })

  const { data: myEmployee, isError: myEmployeeNotFound } = useQuery({
    queryKey: ['employee-me'],
    queryFn: employeeApi.getMe,
    enabled: !isAdmin,
    retry: false,
  })

  const apply = useMutation({
    mutationFn: () => attendanceApi.applyLeave({
      ...(isAdmin && applyForm.employeeId ? { employeeId: Number(applyForm.employeeId) } : {}),
      leaveType: applyForm.leaveType,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      reason: applyForm.reason || undefined,
    }),
    onSuccess: () => {
      setShowApply(false)
      setApplyForm({ employeeId: '', leaveType: 'SICK', startDate: '', endDate: '', reason: '' })
      qc.invalidateQueries({ queryKey: ['leaves'] })
    },
  })

  const decide = useMutation({
    mutationFn: ({ id, approved, remarks }: { id: number; approved: boolean; remarks?: string }) =>
      attendanceApi.decideLeave(id, approved, remarks),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leaves'] }),
  })

  const canSubmit = isAdmin
    ? !!applyForm.employeeId && !!applyForm.startDate && !!applyForm.endDate
    : !!myEmployee && !!applyForm.startDate && !!applyForm.endDate

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Leave Requests</h1>
        <button onClick={() => setShowApply(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
          + Apply Leave
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : !leaves?.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No leave requests found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {isAdmin && <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>}
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">From</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">To</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Days</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                {isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaves.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{l.employeeName}</p>
                      <p className="text-xs text-gray-400">{l.employeeCode}</p>
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-600">{l.leaveType}</td>
                  <td className="px-4 py-3 text-gray-600">{l.startDate}</td>
                  <td className="px-4 py-3 text-gray-600">{l.endDate}</td>
                  <td className="px-4 py-3 text-gray-600">{l.days}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{l.reason ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  {isAdmin && l.status === 'PENDING' && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => decide.mutate({ id: l.id, approved: true })}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">
                          Approve
                        </button>
                        <button onClick={() => {
                          const r = prompt('Rejection remarks:')
                          if (r !== null) decide.mutate({ id: l.id, approved: false, remarks: r })
                        }}
                          className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                  {isAdmin && l.status !== 'PENDING' && <td />}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">Apply Leave</h3>

            {isAdmin ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                <select value={applyForm.employeeId}
                  onChange={e => setApplyForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select employee</option>
                  {employees?.content.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                </select>
              </div>
            ) : myEmployeeNotFound ? (
              <p className="text-sm text-red-500 bg-red-50 rounded-md px-3 py-2">
                No employee record found for your account. Ask your admin to ensure your employee email matches your login email.
              </p>
            ) : myEmployee ? (
              <div className="bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700">
                Applying as: <span className="font-medium">{myEmployee.fullName}</span>
              </div>
            ) : null}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select value={applyForm.leaveType}
                onChange={e => setApplyForm(f => ({ ...f, leaveType: e.target.value as LeaveType }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="SICK">Sick</option>
                <option value="CASUAL">Casual</option>
                <option value="EARNED">Earned</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From *</label>
                <input type="date" value={applyForm.startDate}
                  onChange={e => setApplyForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
                <input type="date" value={applyForm.endDate}
                  onChange={e => setApplyForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea value={applyForm.reason}
                onChange={e => setApplyForm(f => ({ ...f, reason: e.target.value }))}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {apply.error && (
              <p className="text-red-500 text-sm">
                {(apply.error as any)?.response?.data?.message ?? 'Failed to submit leave request'}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowApply(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => apply.mutate()} disabled={apply.isPending || !canSubmit}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {apply.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
