import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { configApi, type AcademicYear, type GradeLevel, type Section } from '../../api/configApi'

type Tab = 'years' | 'grades' | 'sections'

export default function ConfigPage() {
  const [tab, setTab] = useState<Tab>('years')

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Configuration</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {(['years', 'grades', 'sections'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'years' ? 'Academic Years' : t === 'grades' ? 'Grades' : 'Sections'}
          </button>
        ))}
      </div>

      {tab === 'years' && <AcademicYearsTab />}
      {tab === 'grades' && <GradesTab />}
      {tab === 'sections' && <SectionsTab />}
    </div>
  )
}

// ── Academic Years ────────────────────────────────────────────────────────────

function AcademicYearsTab() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })
  const [error, setError] = useState('')

  const { data: years, isLoading } = useQuery({ queryKey: ['academic-years'], queryFn: configApi.listYears })

  const create = useMutation({
    mutationFn: configApi.createYear,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['academic-years'] }); setShowAdd(false); setForm({ name: '', startDate: '', endDate: '' }); setError('') },
    onError: () => setError('Failed to create academic year'),
  })

  const setCurrent = useMutation({
    mutationFn: configApi.setCurrentYear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-years'] }),
  })

  const remove = useMutation({
    mutationFn: configApi.deleteYear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-years'] }),
  })

  const handleAdd = () => {
    setError('')
    if (!form.name || !form.startDate || !form.endDate) { setError('All fields are required'); return }
    create.mutate(form)
  }

  const suggestName = (start: string) => {
    if (!start) return ''
    const y = new Date(start).getFullYear()
    return `${y}-${y + 1}`
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Manage academic years and set which one is active.</p>
        <button onClick={() => { setShowAdd(true); setError('') }} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
          + Add Year
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : !years?.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No academic years yet. Add one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Start Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">End Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {years.map((y: AcademicYear) => (
                <tr key={y.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{y.name}</td>
                  <td className="px-4 py-3 text-gray-600">{y.startDate}</td>
                  <td className="px-4 py-3 text-gray-600">{y.endDate}</td>
                  <td className="px-4 py-3">
                    {y.isCurrent
                      ? <span className="text-xs px-2 py-0.5 rounded font-medium bg-green-100 text-green-700">Current</span>
                      : <button onClick={() => setCurrent.mutate(y.id)} disabled={setCurrent.isPending} className="text-xs text-indigo-600 hover:underline">Set as Current</button>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!y.isCurrent && (
                      <button
                        onClick={() => { if (confirm('Delete this academic year?')) remove.mutate(y.id) }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Academic Year" onClose={() => { setShowAdd(false); setError('') }}>
          {error && <ErrorBox message={error} />}
          <div className="space-y-3">
            <Field label="Start Date *">
              <input type="date" value={form.startDate}
                onChange={e => {
                  const startDate = e.target.value
                  setForm(f => ({ ...f, startDate, name: suggestName(startDate) }))
                }}
                className={inputCls} />
            </Field>
            <Field label="End Date *">
              <input type="date" value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className={inputCls} />
            </Field>
            <Field label="Name *">
              <input type="text" value={form.name} placeholder="e.g. 2025-2026"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} />
            </Field>
          </div>
          <ModalActions onCancel={() => { setShowAdd(false); setError('') }} onConfirm={handleAdd} loading={create.isPending} label="Add Year" />
        </Modal>
      )}
    </div>
  )
}

// ── Grades ────────────────────────────────────────────────────────────────────

function GradesTab() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', orderNum: '' })
  const [error, setError] = useState('')

  const { data: grades, isLoading } = useQuery({ queryKey: ['grade-levels'], queryFn: configApi.listGrades })

  const create = useMutation({
    mutationFn: configApi.createGrade,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['grade-levels'] }); setShowAdd(false); setForm({ name: '', orderNum: '' }); setError('') },
    onError: () => setError('Failed to create grade'),
  })

  const remove = useMutation({
    mutationFn: configApi.deleteGrade,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grade-levels'] }),
  })

  const handleAdd = () => {
    setError('')
    if (!form.name || !form.orderNum) { setError('All fields are required'); return }
    create.mutate({ name: form.name, orderNum: parseInt(form.orderNum) })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Define grade levels (e.g. Grade 1, Grade 2).</p>
        <button onClick={() => { setShowAdd(true); setError('') }} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
          + Add Grade
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : !grades?.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No grades yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((g: GradeLevel) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 w-16">{g.orderNum}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{g.name}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { if (confirm('Delete this grade? Sections under it will also be removed.')) remove.mutate(g.id) }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Grade" onClose={() => { setShowAdd(false); setError('') }}>
          {error && <ErrorBox message={error} />}
          <div className="space-y-3">
            <Field label="Grade Name *">
              <input type="text" value={form.name} placeholder="e.g. Grade 1"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} />
            </Field>
            <Field label="Display Order *">
              <input type="number" value={form.orderNum} placeholder="e.g. 1"
                onChange={e => setForm(f => ({ ...f, orderNum: e.target.value }))}
                className={inputCls} min={1} />
            </Field>
          </div>
          <ModalActions onCancel={() => { setShowAdd(false); setError('') }} onConfirm={handleAdd} loading={create.isPending} label="Add Grade" />
        </Modal>
      )}
    </div>
  )
}

// ── Sections ──────────────────────────────────────────────────────────────────

function SectionsTab() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ gradeId: '', name: '' })
  const [error, setError] = useState('')

  const { data: sections, isLoading } = useQuery({ queryKey: ['sections'], queryFn: configApi.listSections })
  const { data: grades } = useQuery({ queryKey: ['grade-levels'], queryFn: configApi.listGrades })

  const create = useMutation({
    mutationFn: configApi.createSection,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sections'] }); setShowAdd(false); setForm({ gradeId: '', name: '' }); setError('') },
    onError: () => setError('Failed to create section'),
  })

  const remove = useMutation({
    mutationFn: configApi.deleteSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sections'] }),
  })

  const handleAdd = () => {
    setError('')
    if (!form.gradeId || !form.name) { setError('All fields are required'); return }
    create.mutate({ gradeId: parseInt(form.gradeId), name: form.name })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">Define sections within each grade (e.g. Grade 1-A, Grade 1-B).</p>
        <button onClick={() => { setShowAdd(true); setError('') }} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
          + Add Section
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : !sections?.length ? (
          <div className="p-8 text-center text-gray-400 text-sm">No sections yet. Add grades first, then create sections.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Grade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Section</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Full Name</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sections.map((s: Section) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{s.gradeName}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.fullName}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => { if (confirm('Delete this section?')) remove.mutate(s.id) }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <Modal title="Add Section" onClose={() => { setShowAdd(false); setError('') }}>
          {error && <ErrorBox message={error} />}
          <div className="space-y-3">
            <Field label="Grade *">
              <select value={form.gradeId} onChange={e => setForm(f => ({ ...f, gradeId: e.target.value }))} className={inputCls}>
                <option value="">Select a grade</option>
                {grades?.map((g: GradeLevel) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </Field>
            <Field label="Section Name *">
              <input type="text" value={form.name} placeholder="e.g. A"
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} maxLength={10} />
            </Field>
          </div>
          <ModalActions onCancel={() => { setShowAdd(false); setError('') }} onConfirm={handleAdd} loading={create.isPending} label="Add Section" />
        </Modal>
      )}
    </div>
  )
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

const inputCls = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{message}</div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function ModalActions({ onCancel, onConfirm, loading, label }: { onCancel: () => void; onConfirm: () => void; loading: boolean; label: string }) {
  return (
    <div className="flex justify-end gap-3 mt-5">
      <button onClick={onCancel} className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">Cancel</button>
      <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Saving...' : label}
      </button>
    </div>
  )
}
