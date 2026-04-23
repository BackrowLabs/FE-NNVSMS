import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { studentApi } from '../../api/studentApi'

export default function StudentGradePickerPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [academicYearId, setAcademicYearId] = useState<number | ''>('')

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: studentApi.getAcademicYears,
  })

  const { data, isFetching } = useQuery({
    queryKey: ['students', { search, academicYearId, size: 30 }],
    queryFn: () => studentApi.list({ search: search || undefined, academicYearId: academicYearId || undefined, size: 30 }),
    enabled: search.length >= 2 || !!academicYearId,
    select: d => d.content,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Student Report Card</h1>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex gap-3">
        <select
          value={academicYearId}
          onChange={e => setAcademicYearId(e.target.value ? +e.target.value : '')}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Years</option>
          {years?.map(y => (
            <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' (Current)' : ''}</option>
          ))}
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search student by name or admission number..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {search.length < 2 && !academicYearId ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Select a year or type at least 2 characters to search students.
          </div>
        ) : isFetching ? (
          <div className="p-10 text-center text-gray-400 text-sm">Searching...</div>
        ) : !data?.length ? (
          <div className="p-10 text-center text-gray-400 text-sm">No students found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Section</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Year</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/grades/student/${s.id}`)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{s.fullName}</p>
                    <p className="text-xs text-gray-400">{s.admissionNumber}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{s.sectionName || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.academicYearName}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-indigo-600 hover:underline">View Grades →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
