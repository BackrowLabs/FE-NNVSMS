import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { studentApi } from '../../api/studentApi'
import { gradeApi } from '../../api/gradeApi'

export default function StudentGradesPage() {
  const { id } = useParams<{ id: string }>()
  const studentId = Number(id)

  const [academicYearId, setAcademicYearId] = useState<number | ''>('')

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: studentApi.getAcademicYears,
  })

  const { data: student } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentApi.getById(studentId),
    enabled: !!studentId,
  })

  const { data: grades, isLoading } = useQuery({
    queryKey: ['grades-student', studentId, academicYearId],
    queryFn: () => gradeApi.getStudentGrades(studentId, academicYearId || undefined),
    enabled: !!studentId,
  })

  // Group by term, then subject
  const grouped = grades?.reduce<Record<string, Record<string, typeof grades[0]>>>((acc, g) => {
    if (!acc[g.term]) acc[g.term] = {}
    acc[g.term][g.subject] = g
    return acc
  }, {}) ?? {}

  const terms = Object.keys(grouped).sort()
  const subjects = [...new Set(grades?.map(g => g.subject) ?? [])].sort()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/grades" className="text-sm text-indigo-600 hover:underline">← Grades</Link>
        <h1 className="text-2xl font-semibold text-gray-800">
          {student ? student.fullName : 'Student'} — Report Card
        </h1>
      </div>

      {student && (
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-4 flex items-center gap-6 text-sm text-gray-600">
          <span><span className="font-medium text-gray-700">Admission No:</span> {student.admissionNumber}</span>
          {student.sectionName && (
            <span><span className="font-medium text-gray-700">Section:</span> {student.sectionName}</span>
          )}
          {student.academicYearName && (
            <span><span className="font-medium text-gray-700">Year:</span> {student.academicYearName}</span>
          )}
        </div>
      )}

      {/* Year filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Academic Year</label>
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
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-400 text-sm">Loading...</div>
      ) : !grades?.length ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-400 text-sm">
          No grade records found.
        </div>
      ) : (
        <div className="space-y-5">
          {terms.map(term => (
            <div key={term} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
                <h2 className="text-sm font-semibold text-indigo-700">{term}</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Subject</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-24">Grade</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-24">Marks</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600">Remarks</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-32">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subjects.filter(s => grouped[term]?.[s]).map(subject => {
                    const rec = grouped[term][subject]
                    return (
                      <tr key={subject} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-800">{subject}</td>
                        <td className="px-4 py-2.5">
                          {rec.letterGrade ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${gradeColor(rec.letterGrade)}`}>
                              {rec.letterGrade}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{rec.marks ?? '—'}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">{rec.remarks || '—'}</td>
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{rec.academicYearName}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function gradeColor(grade: string) {
  if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-700'
  if (grade === 'B+' || grade === 'B') return 'bg-blue-100 text-blue-700'
  if (grade === 'C+' || grade === 'C') return 'bg-yellow-100 text-yellow-700'
  if (grade === 'D') return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}
