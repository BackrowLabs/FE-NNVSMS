import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { employeeApi } from '../../api/employeeApi'
import { useAuthStore } from '../../store/authStore'
import EmployeeFormModal from './EmployeeFormModal'

export default function EmployeesPage() {
  const { role } = useAuthStore()
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employees', { search, department, page }],
    queryFn: () => employeeApi.list({ search, department, page, size: 20 }),
  })

  const isAdmin = role === 'ADMIN'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        {isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add Employee
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or code"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-gray-400"
        />
        <input
          type="text"
          placeholder="Filter by department"
          value={department}
          onChange={e => { setDepartment(e.target.value); setPage(0) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-48 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-gray-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : !data?.content.length ? (
          <div className="p-12 text-center text-gray-400 text-sm">No employees found.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 border-b border-indigo-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Designation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.content.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{e.employeeCode}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{e.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{e.designation ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{e.department ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{e.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        e.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {e.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/employees/${e.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs text-gray-400">{data.totalElements} employees total</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    ← Prev
                  </button>
                  <span className="px-2 text-xs text-gray-500">{page + 1} / {data.totalPages}</span>
                  <button onClick={() => setPage(p => p + 1)} disabled={data.last}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <EmployeeFormModal
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); refetch() }}
        />
      )}
    </div>
  )
}
