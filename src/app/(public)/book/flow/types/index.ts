// /src/app/(public)/book/flow/types/index.ts
// EXACT types from your working system - no changes

export interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  format: string
  hasPackage: boolean
  packageSessions?: number
  packageDiscount?: number
  isActive: boolean
}

export interface TimeSlot {
  id: string
  date: string
  time: string
  formattedDate: string
  formattedTime: string
  formattedTimeShort?: string
  isAvailable: boolean
  isBlocked: boolean
  serviceId?: string
  serviceName?: string
  duration?: number
  endTime?: string
  remainingSpots?: number
  maxBookings?: number
  bookingsMade?: number
}

export interface AvailabilityResponse {
  slots: TimeSlot[]
  groupedByDate?: Record<string, TimeSlot[]>
  summary?: {
    totalSlots: number
    available: number
    blocked: number
    booked: number
    dateRange: {
      from: string
      to: string
    }
    serviceId: string
    generatedAt: string
  }
}

export type MeetingType = 'virtual' | 'client_travels' | 'coach_travels'
export type PackageOption = 'single' | 'package'

export interface BookingFormData {
  name: string
  email: string
  phone: string
  goals: string
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  hasSlots: boolean
  availableSlots: number
  totalSlots: number
  isPast: boolean
}