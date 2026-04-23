import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { studentApi } from '../../api/studentApi'
import type { Student, Section, AcademicYear, CreateStudentPayload, UpdateStudentPayload } from '../../types/student'

interface Props {
  student?: Student
  sections: Section[]
  academicYears: AcademicYear[]
  onClose: () => void
  onSuccess: () => void
}

type FormValues = {
  fullName: string
  sectionId: number
  academicYearId: number
  admissionNumber: string
  dateOfBirth: string
  gender: string
  address: string
  parentName: string
  parentPhone: string
  parentEmail: string
}

export default function StudentFormModal({ student, sections, academicYears, onClose, onSuccess }: Props) {
  const isEdit = !!student

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>()

  useEffect(() => {
    if (student) {
      reset({
        fullName: student.fullName,
        sectionId: student.sectionId ?? undefined,
        academicYearId: student.academicYearId ?? undefined,
        dateOfBirth: student.dateOfBirth ?? '',
        gender: student.gender ?? '',
        address: student.address ?? '',
        parentName: student.parentName ?? '',
        parentPhone: student.parentPhone ?? '',
        parentEmail: student.parentEmail ?? '',
      })
    }
  }, [student, reset])

  const createMutation = useMutation({
    mutationFn: (data: CreateStudentPayload) => studentApi.create(data),
    onSuccess,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateStudentPayload) => studentApi.update(student!.id, data),
    onSuccess,
  })

  const onSubmit = (values: FormValues) => {
    if (isEdit) {
      updateMutation.mutate({
        fullName: values.fullName,
        sectionId: Number(values.sectionId),
        dateOfBirth: values.dateOfBirth || undefined,
        gender: (values.gender as any) || undefined,
        address: values.address || undefined,
        parentName: values.parentName || undefined,
        parentPhone: values.parentPhone || undefined,
        parentEmail: values.parentEmail || undefined,
      })
    } else {
      createMutation.mutate({
        fullName: values.fullName,
        sectionId: Number(values.sectionId),
        academicYearId: Number(values.academicYearId),
        admissionNumber: values.admissionNumber || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: (values.gender as any) || undefined,
        address: values.address || undefined,
        parentName: values.parentName || undefined,
        parentPhone: values.parentPhone || undefined,
        parentEmail: values.parentEmail || undefined,
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Student' : 'Add Student'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register('fullName', { required: 'Required' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <select {...register('sectionId', { required: 'Required' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
              {errors.sectionId && <p className="text-red-500 text-xs mt-1">{errors.sectionId.message}</p>}
            </div>

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                <select {...register('academicYearId', { required: 'Required' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select year</option>
                  {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
                {errors.academicYearId && <p className="text-red-500 text-xs mt-1">{errors.academicYearId.message}</p>}
              </div>
            )}

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission No. <span className="text-gray-400">(auto if blank)</span></label>
                <input {...register('admissionNumber')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" {...register('dateOfBirth')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select {...register('gender')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea {...register('address')} rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Parent / Guardian</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input {...register('parentName')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('parentPhone')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register('parentEmail')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{(error as any)?.response?.data?.detail ?? 'Something went wrong'}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 pb-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
