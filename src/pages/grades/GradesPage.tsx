import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '../../api/studentApi'
import { gradeApi } from '../../api/gradeApi'
import { LETTER_GRADES } from '../../types/grade'
import { useAuthStore } from '../../store/authStore'

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Education']
const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Final']

interface GradeEntry {
  studentId: number
  letterGrade: string
  marks: string
  remarks: string
}

export default function GradesPage() {
  const { role: _role } = useAuthStore()
  const qc = useQueryClient()

  const [academicYearId, setAcademicYearId] = useState<number | ''>('')
  const [sectionId, setSectionId] = useState<number | ''>('')
  const [subject, setSubject] = useState('')
  const [term, setTerm] = useState('')
  const [entries, setEntries] = useState<Record<number, GradeEntry>>({})
  const [saved, setSaved] = useState(false)

  const { data: years } = useQuery({
    queryKey: ['academic-years'],
    queryFn: studentApi.getAcademicYears,
  })

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: studentApi.getSections,
  })

  const currentYear = years?.find(y => y.isCurrent)

  useEffect(() => {
    if (currentYear && !academicYearId) setAcademicYearId(currentYear.id)
  }, [currentYear])

  const canLoad = academicYearId && sectionId && subject && term

  const { data: existing, isFetching } = useQuery({
    queryKey: ['grades-section', sectionId, subject, term, academicYearId],
    queryFn: () => gradeApi.getSectionGrades(sectionId as number, subject, term, academicYearId as number),
    enabled: !!canLoad,
  })

  const { data: students } = useQuery({
    queryKey: ['students', { academicYearId, sectionId, size: 200 }],
    queryFn: () => studentApi.list({ academicYearId: academicYearId as number, sectionId: sectionId as number, size: 200 }),
    enabled: !!sectionId && !!academicYearId,
    select: d => d.content,
  })

  useEffect(() => {
    if (!students) return
    const map: Record<number, GradeEntry> = {}
    students.forEach(s => {
      const rec = existing?.find(g => g.studentId === s.id)
      map[s.id] = {
        studentId: s.id,
        letterGrade: rec?.letterGrade ?? '',
        marks: rec?.marks != null ? String(rec.marks) : '',
        remarks: rec?.remarks ?? '',
      }
    })
    setEntries(map)
    setSaved(false)
  }, [students, existing])

  const save = useMutation({
    mutationFn: () =>
      gradeApi.saveGrades({
        academicYearId: academicYearId as number,
        sectionId: sectionId as number,
        subject,
        term,
        entries: Object.values(entries).map(e => ({
          studentId: e.studentId,
          letterGrade: e.letterGrade || undefined,
          marks: e.marks !== '' ? Number(e.marks) : undefined,
          remarks: e.remarks || undefined,
        })),
      }),
    onSuccess: () => {
      setSaved(true)
      qc.invalidateQueries({ queryKey: ['grades-section', sectionId, subject, term, academicYearId] })
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const updateEntry = (studentId: number, field: keyof Omit<GradeEntry, 'studentId'>, value: string) => {
    setEntries(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }))
    setSaved(false)
  }

  const markAllGrade = (grade: string) => {
    setEntries(prev => {
      const next = { ...prev }
      Object.keys(next).forEach(id => { next[+id] = { ...next[+id], letterGrade: grade } })
      return next
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Grades</h1>
        {saved && (
          <span className="text-sm text-green-600 font-medium">Grades saved successfully</span>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year</label>
          <select
            value={academicYearId}
            onChange={e => setAcademicYearId(e.target.value ? +e.target.value : '')}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select year</option>
            {years?.map(y => (
              <option key={y.id} value={y.id}>{y.name}{y.isCurrent ? ' (Current)' : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
          <select
            value={sectionId}
            onChange={e => setSectionId(e.target.value ? +e.target.value : '')}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select section</option>
            {sections?.map(s => (
              <option key={s.id} value={s.id}>{s.fullName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select subject</option>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Term</label>
          <select
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select term</option>
            {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Grade table */}
      {!canLoad ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-400 text-sm">
          Select academic year, section, subject, and term to enter grades.
        </div>
      ) : isFetching ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-400 text-sm">Loading...</div>
      ) : !students?.length ? (
        <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-400 text-sm">
          No students found in this section.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{students.length} students</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Mark all:</span>
              {LETTER_GRADES.map(g => (
                <button
                  key={g}
                  onClick={() => markAllGrade(g)}
                  className="text-xs px-2 py-0.5 border border-gray-300 rounded hover:bg-indigo-50 hover:border-indigo-400 hover:text-indigo-700"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-40">Grade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-28">Marks</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(s => {
                const entry = entries[s.id] ?? { letterGrade: '', marks: '', remarks: '' }
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-800">{s.fullName}</p>
                      <p className="text-xs text-gray-400">{s.admissionNumber}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={entry.letterGrade}
                        onChange={e => updateEntry(s.id, 'letterGrade', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">—</option>
                        {LETTER_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={entry.marks}
                        onChange={e => updateEntry(s.id, 'marks', e.target.value)}
                        placeholder="0–100"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={entry.remarks}
                        onChange={e => updateEntry(s.id, 'remarks', e.target.value)}
                        placeholder="Optional remarks"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {save.isPending ? 'Saving...' : 'Save Grades'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
