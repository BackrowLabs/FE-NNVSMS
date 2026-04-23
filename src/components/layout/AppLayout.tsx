import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import NotificationBell from './NotificationBell'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'OFFICE_EMPLOYEE', 'TEACHER'] },
  { path: '/students', label: 'Students', roles: ['ADMIN', 'OFFICE_EMPLOYEE', 'TEACHER'] },
  { path: '/employees', label: 'Employees', roles: ['ADMIN', 'OFFICE_EMPLOYEE'] },
  { path: '/fees', label: 'Fee Structures', roles: ['ADMIN', 'OFFICE_EMPLOYEE'] },
  { path: '/fees/student', label: 'Student Fees', roles: ['ADMIN', 'OFFICE_EMPLOYEE'] },
  { path: '/fees/pending', label: 'Pending Approvals', roles: ['ADMIN'] },
  { path: '/attendance/students', label: 'Student Attendance', roles: ['ADMIN', 'OFFICE_EMPLOYEE', 'TEACHER'] },
  { path: '/attendance/employees', label: 'Employee Attendance', roles: ['ADMIN', 'OFFICE_EMPLOYEE'] },
  { path: '/attendance/leaves', label: 'Leave Requests', roles: ['ADMIN', 'OFFICE_EMPLOYEE', 'TEACHER'] },
  { path: '/grades', label: 'Grade Entry', roles: ['ADMIN', 'TEACHER'] },
  { path: '/grades/student', label: 'Student Report Card', roles: ['ADMIN', 'TEACHER', 'OFFICE_EMPLOYEE'] },
  { path: '/reports', label: 'Reports', roles: ['ADMIN', 'OFFICE_EMPLOYEE'] },
  { path: '/config', label: 'Configuration', roles: ['ADMIN'] },
  { path: '/settings', label: 'Settings', roles: ['ADMIN'] },
]

export default function AppLayout() {
  const { role, user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  const visibleNav = navItems.filter(item => role && item.roles.includes(role))

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col shadow-xl shrink-0"
        style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 60%, #3730a3 100%)' }}>

        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 shadow-inner">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-snug">Nalanda Vidya</h1>
              <p className="text-xs text-indigo-300 leading-snug">Nikethan</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map(item => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/')
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="px-4 py-4 border-t border-white/10" style={{ background: 'rgba(0,0,0,0.15)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 text-xs font-bold text-white shadow">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60 truncate leading-tight">{user?.email}</p>
              <p className="text-xs text-indigo-300 font-semibold leading-tight mt-0.5">
                {role?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-indigo-400 hover:text-red-400 transition-colors"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm shrink-0 flex items-center justify-between px-6 py-3">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              {navItems.find(n => location.pathname === n.path || location.pathname.startsWith(n.path + '/'))?.label ?? 'Page'}
            </p>
          </div>
          {role === 'ADMIN' && <NotificationBell />}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
