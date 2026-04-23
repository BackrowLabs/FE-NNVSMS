import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'

type Role = 'ADMIN' | 'OFFICE_EMPLOYEE' | 'TEACHER' | null

interface AuthState {
  session: Session | null
  user: User | null
  role: Role
  isLoading: boolean
  setSession: (session: Session | null) => void
  setRole: (role: Role) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  role: null,
  isLoading: true,

  setSession: (session) =>
    set({ session, user: session?.user ?? null }),

  setRole: (role) => set({ role }),

  setLoading: (isLoading) => set({ isLoading }),

  clearAuth: () => set({ session: null, user: null, role: null }),
}))
