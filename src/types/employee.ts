import type { Gender } from './student'

export interface EmployeeSummary {
  id: number
  employeeCode: string
  fullName: string
  designation: string | null
  department: string | null
  phone: string | null
  isActive: boolean
}

export interface Employee {
  id: number
  employeeCode: string
  fullName: string
  designation: string | null
  department: string | null
  phone: string | null
  email: string | null
  dateOfBirth: string | null
  gender: Gender | null
  address: string | null
  joinDate: string
  monthlySalary: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeePayload {
  fullName: string
  monthlySalary: number
  employeeCode?: string
  designation?: string
  department?: string
  phone?: string
  email?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  joinDate?: string
}

export interface UpdateEmployeePayload {
  fullName: string
  monthlySalary: number
  designation?: string
  department?: string
  phone?: string
  email?: string
  dateOfBirth?: string
  gender?: Gender
  address?: string
  joinDate?: string
}
