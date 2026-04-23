import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'

import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/shared/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import StudentsPage from './pages/students/StudentsPage'
import StudentDetailPage from './pages/students/StudentDetailPage'
import EmployeesPage from './pages/employees/EmployeesPage'
import EmployeeDetailPage from './pages/employees/EmployeeDetailPage'
import FeeStructuresPage from './pages/fees/FeeStructuresPage'
import StudentFeesPage from './pages/fees/StudentFeesPage'
import PendingPaymentsPage from './pages/fees/PendingPaymentsPage'
import StudentAttendancePage from './pages/attendance/StudentAttendancePage'
import EmployeeAttendancePage from './pages/attendance/EmployeeAttendancePage'
import LeavePage from './pages/attendance/LeavePage'
import SettingsPage from './pages/settings/SettingsPage'
import GradesPage from './pages/grades/GradesPage'
import StudentGradePickerPage from './pages/grades/StudentGradePickerPage'
import StudentGradesPage from './pages/grades/StudentGradesPage'
import ConfigPage from './pages/config/ConfigPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchInterval: 1000 * 30,
      retry: 1,
    },
  },
})

async function fetchAndSetRole(userId: string, setRole: (role: 'ADMIN' | 'OFFICE_EMPLOYEE' | 'TEACHER' | null) => void) {
  try {
    const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 5000))
    const query = supabase.from('profiles').select('role').eq('id', userId).single()
    const result = await Promise.race([query, timeout])
    const role = result && 'data' in result ? (result.data as any)?.role : null
    // Only update role if we received a valid value — never reset to null on timeout/error
    if (role) setRole(role as 'ADMIN' | 'OFFICE_EMPLOYEE' | 'TEACHER')
  } catch {
    // Keep existing role on error
  }
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { setSession, setRole, setLoading } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        setSession(session)
        if (session?.user) await fetchAndSetRole(session.user.id, setRole)
      } finally {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setSession(session)
        if (session?.user) await fetchAndSetRole(session.user.id, setRole)
        else if (event === 'SIGNED_OUT') setRole(null)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setRole, setLoading])

  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/employees" element={<ProtectedRoute allowedRoles={['ADMIN', 'OFFICE_EMPLOYEE']}><EmployeesPage /></ProtectedRoute>} />
              <Route path="/employees/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'OFFICE_EMPLOYEE']}><EmployeeDetailPage /></ProtectedRoute>} />
              <Route path="/fees" element={<FeeStructuresPage />} />
              <Route path="/fees/student" element={<StudentFeesPage />} />
              <Route path="/fees/pending" element={<PendingPaymentsPage />} />
              <Route path="/attendance/students" element={<StudentAttendancePage />} />
              <Route path="/attendance/employees" element={<EmployeeAttendancePage />} />
              <Route path="/attendance/leaves" element={<LeavePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/grades" element={<GradesPage />} />
              <Route path="/grades/student" element={<StudentGradePickerPage />} />
              <Route path="/grades/student/:id" element={<StudentGradesPage />} />
              <Route path="/config" element={<ConfigPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
