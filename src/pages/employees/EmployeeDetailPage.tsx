import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { employeeApi } from '../../api/employeeApi'
import { useAuthStore } from '../../store/authStore'
import EmployeeFormModal from './EmployeeFormModal'

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="py-3 flex">
      <dt className="w-40 text-sm font-medium text-gray-500 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-800">{value ?? '—'}</dd>
    </div>
  )
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { role } = useAuthStore()
  const [showEdit, setShowEdit] = useState(false)
  const isAdmin = role === 'ADMIN'

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeeApi.getById(Number(id)),
  })

  const deactivate = useMutation({
    mutationFn: () => employeeApi.deactivate(Number(id)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); navigate('/employees') },
  })

  if (isLoading) return <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
  if (!employee) return <div className="p-8 text-center text-red-400 text-sm">Employee not found.</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-2xl font-semibold text-gray-800 flex-1">{employee.fullName}</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowEdit(true)}
              className="px-4 py-2 text-sm border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50">
              Edit
            </button>
            {employee.isActive && (
              <button
                onClick={() => { if (confirm('Deactivate this employee?')) deactivate.mutate() }}
                className="px-4 py-2 text-sm border border-red-400 text-red-500 rounded-md hover:bg-red-50">
                Deactivate
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Personal Info</h2>
          <dl className="divide-y divide-gray-100">
            <DetailRow label="Employee Code" value={employee.employeeCode} />
            <DetailRow label="Date of Birth" value={employee.dateOfBirth} />
            <DetailRow label="Gender" value={employee.gender} />
            <DetailRow label="Address" value={employee.address} />
            <DetailRow label="Status" value={employee.isActive ? 'Active' : 'Inactive'} />
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Employment</h2>
          <dl className="divide-y divide-gray-100">
            <DetailRow label="Designation" value={employee.designation} />
            <DetailRow label="Department" value={employee.department} />
            <DetailRow label="Join Date" value={employee.joinDate} />
            {isAdmin && <DetailRow label="Monthly Salary" value={`₹ ${employee.monthlySalary.toLocaleString()}`} />}
            <DetailRow label="Phone" value={employee.phone} />
            <DetailRow label="Email" value={employee.email} />
          </dl>
        </div>
      </div>

      {showEdit && (
        <EmployeeFormModal
          employee={employee}
          onClose={() => setShowEdit(false)}
          onSuccess={() => { setShowEdit(false); qc.invalidateQueries({ queryKey: ['employee', id] }) }}
        />
      )}
    </div>
  )
}
