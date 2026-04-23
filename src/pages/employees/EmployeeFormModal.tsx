import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { employeeApi } from '../../api/employeeApi'
import type { Employee, CreateEmployeePayload, UpdateEmployeePayload } from '../../types/employee'

interface Props {
  employee?: Employee
  onClose: () => void
  onSuccess: () => void
}

type FormValues = {
  fullName: string
  monthlySalary: number
  employeeCode: string
  designation: string
  department: string
  phone: string
  email: string
  dateOfBirth: string
  gender: string
  address: string
  joinDate: string
}

export default function EmployeeFormModal({ employee, onClose, onSuccess }: Props) {
  const isEdit = !!employee
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>()

  useEffect(() => {
    if (employee) {
      reset({
        fullName: employee.fullName,
        monthlySalary: employee.monthlySalary,
        designation: employee.designation ?? '',
        department: employee.department ?? '',
        phone: employee.phone ?? '',
        email: employee.email ?? '',
        dateOfBirth: employee.dateOfBirth ?? '',
        gender: employee.gender ?? '',
        address: employee.address ?? '',
        joinDate: employee.joinDate ?? '',
      })
    }
  }, [employee, reset])

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeePayload) => employeeApi.create(data),
    onSuccess,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEmployeePayload) => employeeApi.update(employee!.id, data),
    onSuccess,
  })

  const onSubmit = (values: FormValues) => {
    const base = {
      fullName: values.fullName,
      monthlySalary: Number(values.monthlySalary),
      designation: values.designation || undefined,
      department: values.department || undefined,
      phone: values.phone || undefined,
      email: values.email || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      gender: (values.gender as any) || undefined,
      address: values.address || undefined,
      joinDate: values.joinDate || undefined,
    }

    if (isEdit) {
      updateMutation.mutate(base)
    } else {
      createMutation.mutate({ ...base, employeeCode: values.employeeCode || undefined })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Employee' : 'Add Employee'}
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

            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Code <span className="text-gray-400">(auto if blank)</span></label>
                <input {...register('employeeCode')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary *</label>
              <input type="number" step="0.01" {...register('monthlySalary', { required: 'Required', min: 0 })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.monthlySalary && <p className="text-red-500 text-xs mt-1">{errors.monthlySalary.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input {...register('designation')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input {...register('department')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input {...register('phone')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register('email')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input type="date" {...register('joinDate')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea {...register('address')} rows={2}
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
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
