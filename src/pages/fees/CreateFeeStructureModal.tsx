import { useForm, useFieldArray } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { feeApi } from '../../api/feeApi'
import type { AcademicYear } from '../../types/student'
import type { FeeStructure, FeeType } from '../../types/fee'

interface Props {
  academicYears: AcademicYear[]
  grades: { id: number; name: string }[]
  onClose: () => void
  onSuccess: () => void
  editing?: FeeStructure
}

type FormValues = {
  academicYearId: number
  gradeId: number
  feeType: FeeType
  totalAmount: number
  installments: { installmentNumber: number; dueDate: string; amount: number }[]
}

export default function CreateFeeStructureModal({ academicYears, grades, onClose, onSuccess, editing }: Props) {
  const isEdit = !!editing

  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: isEdit
      ? {
          academicYearId: editing.academicYearId,
          gradeId: editing.gradeId,
          feeType: editing.feeType,
          totalAmount: editing.totalAmount,
          installments: editing.installments.map(i => ({
            installmentNumber: i.installmentNumber,
            dueDate: i.dueDate,
            amount: i.amount,
          })),
        }
      : {
          installments: [{ installmentNumber: 1, dueDate: '', amount: 0 }],
        },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'installments' })

  const create = useMutation({
    mutationFn: (data: FormValues) => feeApi.createStructure({
      ...data,
      academicYearId: Number(data.academicYearId),
      gradeId: Number(data.gradeId),
      totalAmount: Number(data.totalAmount),
      installments: data.installments.map((i, idx) => ({
        installmentNumber: idx + 1,
        dueDate: i.dueDate,
        amount: Number(i.amount),
      })),
    }),
    onSuccess,
  })

  const update = useMutation({
    mutationFn: (data: FormValues) => feeApi.updateStructure(editing!.id, {
      totalAmount: Number(data.totalAmount),
      installments: data.installments.map((i, idx) => ({
        installmentNumber: idx + 1,
        dueDate: i.dueDate,
        amount: Number(i.amount),
      })),
    }),
    onSuccess,
  })

  const mutation = isEdit ? update : create
  const submitError = (mutation.error as any)?.response?.data?.detail
    ?? (mutation.error as any)?.response?.data?.message
    ?? null

  const onSubmit = (data: FormValues) => mutation.mutate(data)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Fee Structure' : 'New Fee Structure'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <select
                {...register('academicYearId', { required: true })}
                disabled={isEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select</option>
                {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
              <select
                {...register('gradeId', { required: true })}
                disabled={isEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
              <select
                {...register('feeType', { required: true })}
                disabled={isEdit}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select</option>
                <option value="TUITION">Tuition</option>
                <option value="TRANSPORT">Transport</option>
                <option value="LIBRARY">Library</option>
                <option value="EXAM">Exam</option>
              </select>
              {isEdit && (
                <p className="text-xs text-gray-400 mt-1">Academic year, grade and fee type cannot be changed.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount *</label>
              <input
                type="number"
                step="0.01"
                {...register('totalAmount', { required: true, min: 1 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Installments</p>
              <button
                type="button"
                onClick={() => append({ installmentNumber: fields.length + 1, dueDate: '', amount: 0 })}
                className="text-xs text-indigo-600 hover:underline"
              >
                + Add
              </button>
            </div>

            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <div className="w-10 text-center text-xs text-gray-400 pb-2">#{idx + 1}</div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                    <input
                      type="date"
                      {...register(`installments.${idx}.dueDate`, { required: true })}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`installments.${idx}.amount`, { required: true, min: 1 })}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                    className="text-red-400 hover:text-red-600 disabled:opacity-30 pb-1 text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          {submitError && (
            <p className="text-red-500 text-sm">{submitError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
