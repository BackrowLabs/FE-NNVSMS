import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { studentApi } from '../../api/studentApi'
import { useAuthStore } from '../../store/authStore'
import StudentFormModal from './StudentFormModal'

export default function StudentsPage() {
  const { role } = useAuthStore()
  const [search, setSearch] = useState('')
  const [sectionId, setSectionId] = useState<number | undefined>()
  const [academicYearId, setAcademicYearId] = useState<number | undefined>()
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['students', { search, sectionId, academicYearId, page }],
    queryFn: () => studentApi.list({ search, sectionId, academicYearId, page, size: 20 }),
  })

  const { data: sections } = useQuery({ queryKey: ['sections'], queryFn: studentApi.getSections })
  const { data: academicYears } = useQuery({ queryKey: ['academic-years'], queryFn: studentApi.getAcademicYears })

  const canEdit = role === 'ADMIN' || role === 'OFFICE_EMPLOYEE'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add Student
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by name or admission no."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-gray-400"
        />
        <select
          value={sectionId ?? ''}
          onChange={e => { setSectionId(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-600"
        >
          <option value="">All Sections</option>
          {sections?.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>
        <select
          value={academicYearId ?? ''}
          onChange={e => { setAcademicYearId(e.target.value ? Number(e.target.value) : undefined); setPage(0) }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-600"
        >
          <option value="">All Years</option>
          {academicYears?.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : !data?.content.length ? (
          <div className="p-12 text-center text-gray-400 text-sm">No students found.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50 border-b border-indigo-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Adm. No.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Section</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Year</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Parent Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.content.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.admissionNumber}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{s.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{s.sectionName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.academicYearName ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.parentPhone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/students/${s.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
                <span className="text-xs text-gray-400">{data.totalElements} students total</span>
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
        <StudentFormModal
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); refetch() }}
          sections={sections ?? []}
          academicYears={academicYears ?? []}
        />
      )}
    </div>
  )
}
