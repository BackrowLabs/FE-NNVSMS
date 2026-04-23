export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'
export type LeaveType = 'SICK' | 'CASUAL' | 'EARNED'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface StudentAttendance {
  id: number
  studentId: number
  studentName: string
  admissionNumber: string
  date: string
  status: AttendanceStatus
  remarks: string | null
}

export interface EmployeeAttendance {
  id: number
  employeeId: number
  employeeName: string
  employeeCode: string
  date: string
  status: AttendanceStatus
  checkIn: string | null
  checkOut: string | null
  remarks: string | null
}

export interface LeaveRequest {
  id: number
  employeeId: number
  employeeName: string
  employeeCode: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string | null
  status: LeaveStatus
  approvedByName: string | null
  approvedAt: string | null
  remarks: string | null
  createdAt: string
}
