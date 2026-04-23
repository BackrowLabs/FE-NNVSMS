import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { studentApi } from '../../api/studentApi'
import type { Student, Section, AcademicYear } from '../../types/student'

interface Props {
  student: Student
  sections: Section[]
  academicYears: AcademicYear[]
  onClose: () => void
  onSuccess: () => void
}

export default function PromoteStudentModal({ student, sections, academicYears, onClose, onSuccess }: Props) {
  const [sectionId, setSectionId] = useState<string>(student.sectionId?.toString() ?? '')
  const [academicYearId, setAcademicYearId] = useState<string>(student.academicYearId?.toString() ?? '')

  const promote = useMutation({
    mutationFn: () => studentApi.promote(student.id, {
      sectionId: Number(sectionId),
      academicYearId: Number(academicYearId),
    }),
    onSuccess,
  })

  const isUnchanged =
    sectionId === (student.sectionId?.toString() ?? '') &&
    academicYearId === (student.academicYearId?.toString() ?? '')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Promote / Transfer Student</h2>
        <p className="text-sm text-gray-500 mb-5">{student.fullName} · {student.admissionNumber}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <select
              value={academicYearId}
              onChange={e => setAcademicYearId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select year</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section (Grade)</label>
            <select
              value={sectionId}
              onChange={e => setSectionId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select section</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.fullName}</option>
              ))}
            </select>
          </div>

          {promote.isError && (
            <p className="text-xs text-red-600">Failed to transfer student. Please try again.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => promote.mutate()}
            disabled={!sectionId || !academicYearId || isUnchanged || promote.isPending}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {promote.isPending ? 'Saving…' : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </div>
  )
}
