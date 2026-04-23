import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { feeApi } from '../../api/feeApi'
import { studentApi } from '../../api/studentApi'
import { useAuthStore } from '../../store/authStore'
import CreateFeeStructureModal from './CreateFeeStructureModal'
import type { FeeStructure, FeeType } from '../../types/fee'

const FEE_TYPE_LABELS: Record<FeeType, string> = {
  TUITION: 'Tuition', TRANSPORT: 'Transport', LIBRARY: 'Library', EXAM: 'Exam',
}

const STATUS_COLORS: Record<FeeType, string> = {
  TUITION: 'bg-blue-100 text-blue-700',
  TRANSPORT: 'bg-emerald-100 text-emerald-700',
  LIBRARY: 'bg-amber-100 text-amber-700',
  EXAM: 'bg-purple-100 text-purple-700',
}

export default function FeeStructuresPage() {
  const { role } = useAuthStore()
  const qc = useQueryClient()
  const [yearId, setYearId] = useState<number | undefined>()
  const [gradeId, setGradeId] = useState<number | undefined>()
  const [showCreate, setShowCreate] = useState(false)
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null)

  const { data: structures, isLoading } = useQuery({
    queryKey: ['fee-structures', { yearId, gradeId }],
    queryFn: () => feeApi.listStructures({ academicYearId: yearId, gradeId }),
  })

  const { data: academicYears } = useQuery({
    queryKey: ['academic-years'],
    queryFn: studentApi.getAcademicYears,
  })

  const { data: sections } = useQuery({
    queryKey: ['sections'],
    queryFn: studentApi.getSections,
  })

  const grades = [...new Map(sections?.map(s => [s.gradeName, { id: s.gradeId, name: s.gradeName }]) ?? []).values()]
  const isAdmin = role === 'ADMIN'

  const handleModalSuccess = () => {
    setShowCreate(false)
    setEditingStructure(null)
    qc.invalidateQueries({ queryKey: ['fee-structures'] })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Fee Structures</h1>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + New Structure
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3 flex-wrap">
        <select value={yearId ?? ''} onChange={e => setYearId(e.target.value ? Number(e.target.value) : undefined)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-600">
          <option value="">All Academic Years</option>
          {academicYears?.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
        </select>
        <select value={gradeId ?? ''} onChange={e => setGradeId(e.target.value ? Number(e.target.value) : undefined)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-600">
          <option value="">All Grades</option>
          {grades.map(g => <option key={g.name} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : !structures?.length ? (
          <div className="p-12 text-center text-gray-400 text-sm">No fee structures found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50 border-b border-indigo-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Grade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Year</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Fee Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Total Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-indigo-700 uppercase tracking-wider">Installments</th>
                {isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {structures.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-800">{s.gradeName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.academicYearName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[s.feeType]}`}>
                      {FEE_TYPE_LABELS[s.feeType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹ {s.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{s.installments.length} installment{s.installments.length !== 1 ? 's' : ''}</td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditingStructure(s)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(showCreate || editingStructure) && (
        <CreateFeeStructureModal
          academicYears={academicYears ?? []}
          grades={grades}
          onClose={() => { setShowCreate(false); setEditingStructure(null) }}
          onSuccess={handleModalSuccess}
          editing={editingStructure ?? undefined}
        />
      )}
    </div>
  )
}
