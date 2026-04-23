import { api } from '../lib/api'
import type { StudentAttendance, EmployeeAttendance, LeaveRequest, AttendanceStatus, LeaveType, LeaveStatus } from '../types/attendance'

export const attendanceApi = {
  // Student
  getBySectionAndDate: (sectionId: number, date: string) =>
    api.get<StudentAttendance[]>(`/attendance/students/section/${sectionId}`, { params: { date } }).then(r => r.data),

  getStudentHistory: (studentId: number, from: string, to: string) =>
    api.get<StudentAttendance[]>(`/attendance/students/${studentId}/history`, { params: { from, to } }).then(r => r.data),

  saveBulk: (payload: {
    sectionId: number
    academicYearId: number
    date: string
    entries: { studentId: number; status: AttendanceStatus; remarks?: string }[]
  }) => api.post<StudentAttendance[]>('/attendance/students/bulk', payload).then(r => r.data),

  // Employee
  getEmployeeByDate: (date: string) =>
    api.get<EmployeeAttendance[]>('/attendance/employees', { params: { date } }).then(r => r.data),

  getEmployeeHistory: (employeeId: number, from: string, to: string) =>
    api.get<EmployeeAttendance[]>(`/attendance/employees/${employeeId}/history`, { params: { from, to } }).then(r => r.data),

  saveEmployee: (payload: {
    employeeId: number; date: string; status: AttendanceStatus
    checkIn?: string; checkOut?: string; remarks?: string
  }) => api.post<EmployeeAttendance>('/attendance/employees', payload).then(r => r.data),

  // Leave
  getLeaves: (params?: { employeeId?: number; status?: LeaveStatus }) =>
    api.get<LeaveRequest[]>('/attendance/leaves', { params }).then(r => r.data),

  applyLeave: (payload: {
    employeeId?: number; leaveType: LeaveType
    startDate: string; endDate: string; reason?: string
  }) => api.post<LeaveRequest>('/attendance/leaves', payload).then(r => r.data),

  decideLeave: (id: number, approved: boolean, remarks?: string) =>
    api.patch<LeaveRequest>(`/attendance/leaves/${id}/decision`, {
      approved: String(approved), remarks
    }).then(r => r.data),
}
