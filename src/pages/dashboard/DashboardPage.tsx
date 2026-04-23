import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { studentApi } from '../../api/studentApi'
import { employeeApi } from '../../api/employeeApi'
import { feeApi } from '../../api/feeApi'

function StatCard({
  label, value, sub, color, icon, onClick,
}: {
  label: string
  value: number | undefined
  sub?: string
  color: 'indigo' | 'emerald' | 'amber' | 'rose'
  icon: React.ReactNode
  onClick?: () => void
}) {
  const colors = {
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-100' },
    rose: { bg: 'bg-rose-50', icon: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-100' },
  }
  const c = colors[color]

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border ${c.border} shadow-sm p-6 flex items-center gap-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center shrink-0 shadow-sm`}>
        <span className="text-white w-7 h-7">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`text-3xl font-bold mt-0.5 ${c.text}`}>
          {value === undefined ? '—' : value.toLocaleString()}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const Icons = {
  students: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6-4a3 3 0 11-6 0 3 3 0 016 0zM3 8a3 3 0 116 0 3 3 0 01-6 0z" />
    </svg>
  ),
  employees: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  pending: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  fees: (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
    </svg>
  ),
}

const quickLinks = [
  { label: 'Add Student', path: '/students', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', roles: ['ADMIN', 'OFFICE_EMPLOYEE'] },
  { label: 'Record Attendance', path: '/attendance/students', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', roles: ['ADMIN', 'OFFICE_EMPLOYEE', 'TEACHER'] },
  { label: 'Student Fees', path: '/fees/student', color: 'text-amber-600 bg-amber-50 border-amber-100', roles: ['ADMIN', 'OFFICE_EMPLOYEE'] },
  { label: 'Grade Entry', path: '/grades', color: 'text-rose-600 bg-rose-50 border-rose-100', roles: ['ADMIN', 'TEACHER'] },
  { label: 'Leave Requests', path: '/attendance/leaves', color: 'text-purple-600 bg-purple-50 border-purple-100', roles: ['ADMIN', 'OFFICE_EMPLOYEE', 'TEACHER'] },
  { label: 'Pending Approvals', path: '/fees/pending', color: 'text-orange-600 bg-orange-50 border-orange-100', roles: ['ADMIN'] },
]

export default function DashboardPage() {
  const { role } = useAuthStore()
  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const isAdmin = role === 'ADMIN'
  const canSeeEmployees = role === 'ADMIN' || role === 'OFFICE_EMPLOYEE'

  const { data: studentData } = useQuery({
    queryKey: ['students', { page: 0, size: 1 }],
    queryFn: () => studentApi.list({ page: 0, size: 1 }),
  })

  const { data: employeeData } = useQuery({
    queryKey: ['employees', { page: 0, size: 1 }],
    queryFn: () => employeeApi.list({ page: 0, size: 1 }),
    enabled: canSeeEmployees,
  })

  const { data: pendingData } = useQuery({
    queryKey: ['pending-count'],
    queryFn: feeApi.countPending,
    enabled: isAdmin,
  })

  const visibleLinks = quickLinks.filter(l => role && l.roles.includes(role))

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div
        className="rounded-2xl px-8 py-6 text-white shadow-lg flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)' }}
      >
        <div>
          <p className="text-indigo-300 text-sm font-medium mb-1">{today}</p>
          <h1 className="text-2xl font-bold">Welcome to Nalanda Vidya Nikethan</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Signed in as <span className="font-semibold text-white">{role?.replace(/_/g, ' ')}</span>
          </p>
        </div>
        <div className="hidden md:block opacity-20">
          <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          label="Total Students"
          value={studentData?.totalElements}
          sub="enrolled this year"
          color="indigo"
          icon={Icons.students}
          onClick={() => navigate('/students')}
        />
        {canSeeEmployees && (
          <StatCard
            label="Total Employees"
            value={employeeData?.totalElements}
            sub="active staff"
            color="emerald"
            icon={Icons.employees}
            onClick={() => navigate('/employees')}
          />
        )}
        {isAdmin && (
          <StatCard
            label="Pending Approvals"
            value={pendingData?.count}
            sub="fee payments to review"
            color={pendingData?.count ? 'amber' : 'emerald'}
            icon={Icons.pending}
            onClick={() => navigate('/fees/pending')}
          />
        )}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {visibleLinks.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border text-sm font-medium hover:shadow-md transition-all ${link.color}`}
            >
              <span className="text-xs text-center leading-snug">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
