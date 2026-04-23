import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from '../../api/attendanceApi'
import { studentApi } from '../../api/studentApi'
import type { AttendanceStatus, StudentAttendance } from '../../types/attendance'

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  PRESENT: 'bg-green-100 text-green-700 border-green-300',
  ABSENT: 'bg-red-100 text-red-600 border-red-300',
  LATE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  HALF_DAY: 'bg-blue-100 text-blue-600 border-blue-300',
}

export default function StudentAttendancePage() {
  const qc = useQueryClient()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [sectionId, setSectionId] = useState<number | undefined>()
  const [academicYearId, setAcademicYearId] = useState<number | undefined>()
  const [entries, setEntries] = useState<Record<number, { status: AttendanceStatus; remarks: string }>>({})
  const [saved, setSaved] = useState(false)

  const { data: sections } = useQuery({ queryKey: ['sections'], queryFn: studentApi.getSections })
  const { data: academicYears } = useQuery({ queryKey: ['academic-years'], queryFn: studentApi.getAcademicYears })

  const { data: students } = useQuery({
    queryKey: ['students-for-attendance', sectionId, academicYearId],
    queryFn: () => studentApi.list({ sectionId, academicYearId, page: 0, size: 200 }),
    enabled: !!sectionId && !!academicYearId,
  })

  const { data: existingData } = useQuery({
    queryKey: ['attendance', sectionId, date],
    queryFn: () => attendanceApi.getBySectionAndDate(sectionId!, date),
    enabled: !!sectionId,
  })

  useEffect(() => {
    if (existingData) {
      const map: typeof entries = {}
      existingData.forEach((a: StudentAttendance) => { map[a.studentId] = { status: a.status, remarks: a.remarks ?? '' } })
      setEntries(map)
    }
  }, [existingData])

  const save = useMutation({
    mutationFn: () => attendanceApi.saveBulk({
      sectionId: sectionId!,
      academicYearId: academicYearId!,
      date,
      entries: (students?.content ?? []).map(s => ({
        studentId: s.id,
        status: entries[s.id]?.status ?? 'PRESENT',
        remarks: entries[s.id]?.remarks || undefined,
      })),
    }),
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      qc.invalidateQueries({ queryKey: ['attendance', sectionId, date] })
    },
  })

  const markAll = (status: AttendanceStatus) => {
    const map: typeof entries = {}
    students?.content.forEach(s => { map[s.id] = { status, remarks: '' } })
    setEntries(map)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Student Attendance</h1>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Section</label>
          <select value={sectionId ?? ''} onChange={e => setSectionId(e.target.value ? Number(e.target.value) : undefined)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select section</option>
            {sections?.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Academic Year</label>
          <select value={academicYearId ?? ''} onChange={e => setAcademicYearId(e.target.value ? Number(e.target.value) : undefined)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select year</option>
            {academicYears?.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </div>
      </div>

      {sectionId && academicYearId && students?.content.length ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Mark all */}
          <div className="px-4 py-3 border-b border-gray-100 flex gap-2 items-center">
            <span className="text-xs text-gray-500 mr-1">Mark all:</span>
            {STATUSES.map(s => (
              <button key={s} onClick={() => markAll(s)}
                className={`text-xs px-2 py-1 rounded border font-medium ${STATUS_STYLE[s]}`}>
                {s}
              </button>
            ))}
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Adm. No.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.content.map(student => {
                const entry = entries[student.id] ?? { status: 'PRESENT' as AttendanceStatus, remarks: '' }
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{student.fullName}</td>
                    <td className="px-4 py-2 text-gray-500">{student.admissionNumber}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        {STATUSES.map(s => (
                          <button key={s}
                            onClick={() => setEntries(prev => ({ ...prev, [student.id]: { ...entry, status: s } }))}
                            className={`text-xs px-2 py-1 rounded border font-medium transition-opacity ${
                              entry.status === s ? STATUS_STYLE[s] : 'opacity-30 bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                            {s[0]}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={entry.remarks}
                        onChange={e => setEntries(prev => ({ ...prev, [student.id]: { ...entry, remarks: e.target.value } }))}
                        placeholder="Optional"
                        className="border border-gray-200 rounded px-2 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-3">
            {saved && <span className="text-green-600 text-sm self-center">Saved!</span>}
            <button onClick={() => save.mutate()} disabled={save.isPending}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {save.isPending ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      ) : sectionId && academicYearId ? (
        <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-lg shadow-sm">
          No students found in this section.
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-lg shadow-sm">
          Select a section and academic year to take attendance.
        </div>
      )}
    </div>
  )
}
