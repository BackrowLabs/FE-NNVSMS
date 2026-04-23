import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '../../api/attendanceApi'
import { employeeApi } from '../../api/employeeApi'
import type { AttendanceStatus } from '../../types/attendance'

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700',
  ABSENT: 'bg-red-100 text-red-600',
  LATE: 'bg-yellow-100 text-yellow-700',
  HALF_DAY: 'bg-blue-100 text-blue-600',
}

export default function EmployeeAttendancePage() {
  const qc = useQueryClient()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [editing, setEditing] = useState<{
    employeeId: number; status: AttendanceStatus; checkIn: string; checkOut: string; remarks: string
  } | null>(null)

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['employee-attendance', date],
    queryFn: () => attendanceApi.getEmployeeByDate(date),
  })

  const { data: employees } = useQuery({
    queryKey: ['employees', {}],
    queryFn: () => employeeApi.list({ page: 0, size: 200 }),
  })

  const save = useMutation({
    mutationFn: () => attendanceApi.saveEmployee({
      employeeId: editing!.employeeId,
      date,
      status: editing!.status,
      checkIn: editing!.checkIn || undefined,
      checkOut: editing!.checkOut || undefined,
      remarks: editing!.remarks || undefined,
    }),
    onSuccess: () => {
      setEditing(null)
      qc.invalidateQueries({ queryKey: ['employee-attendance', date] })
    },
  })

  const attendanceMap = new Map(attendance?.map(a => [a.employeeId, a]) ?? [])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Employee Attendance</h1>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check In</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Check Out</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees?.content.map(emp => {
                const rec = attendanceMap.get(emp.id)
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{emp.employeeCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{emp.fullName}</td>
                    <td className="px-4 py-3">
                      {rec ? (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[rec.status]}`}>
                          {rec.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not marked</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{rec?.checkIn ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{rec?.checkOut ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing({
                          employeeId: emp.id,
                          status: rec?.status ?? 'PRESENT',
                          checkIn: rec?.checkIn ?? '',
                          checkOut: rec?.checkOut ?? '',
                          remarks: rec?.remarks ?? '',
                        })}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        {rec ? 'Edit' : 'Mark'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-800">Mark Attendance</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => setEditing(e => e && { ...e, status: s })}
                    className={`text-xs px-3 py-1.5 rounded border font-medium ${
                      editing.status === s ? STATUS_STYLE[s] + ' border-current' : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                <input type="time" value={editing.checkIn}
                  onChange={e => setEditing(ex => ex && { ...ex, checkIn: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                <input type="time" value={editing.checkOut}
                  onChange={e => setEditing(ex => ex && { ...ex, checkOut: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input value={editing.remarks}
                onChange={e => setEditing(ex => ex && { ...ex, remarks: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => save.mutate()} disabled={save.isPending}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {save.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
