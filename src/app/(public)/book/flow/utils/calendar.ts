// /src/app/(public)/book/flow/utils/calendar.ts
// EXACT UTC logic from your working system - NO CHANGES

import type { TimeSlot, CalendarDay } from '../types'

// 🔥 FIXED: Calendar helper functions - USE UTC (exactly as you had them)
export const getDaysInMonth = (year: number, month: number) => {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

// 🔥 FIXED: Get first day to display (first Monday on or before the 1st of the month) - UTC VERSION
export const getFirstDisplayDate = (year: number, month: number) => {
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1, 12, 0, 0))
  let currentDate = new Date(firstDayOfMonth)
  while (currentDate.getUTCDay() !== 1) {
    currentDate.setUTCDate(currentDate.getUTCDate() - 1)
  }
  return currentDate
}

export const formatMonthYear = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// 🔥 FIXED: Use UTC components
export const formatDateKey = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 🔥 FIXED: Compare UTC dates
export const isSameDay = (date1: Date, date2: Date) => {
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
         date1.getUTCMonth() === date2.getUTCMonth() &&
         date1.getUTCDate() === date2.getUTCDate()
}

// 🔥 FIXED: Check if a date is a weekend (Saturday or Sunday) - UTC VERSION
export const isWeekend = (date: Date) => {
  const day = date.getUTCDay()
  return day === 0 || day === 6
}

export const getUTCToday = () => {
  const today = new Date()
  return new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
    12, 0, 0
  ))
}

// 🔥 FIXED: Generate calendar days based on actual month boundaries with UTC
export const generateCalendarDays = (
  currentMonth: Date,
  groupedSlots: Record<string, TimeSlot[]>
): CalendarDay[] => {
  const year = currentMonth.getUTCFullYear()
  const month = currentMonth.getUTCMonth()
  
  const days = []
  
  let currentDate = getFirstDisplayDate(year, month)
  const todayUTC = getUTCToday()
  const endDate = new Date(currentDate)
  endDate.setUTCDate(currentDate.getUTCDate() + (6 * 7))
  
  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      const dateKey = formatDateKey(currentDate)
      const slotsForDate = groupedSlots[dateKey] || []
      const availableSlots = slotsForDate.filter(s => s.isAvailable && !s.isBlocked).length
      const isCurrentMonth = currentDate.getUTCMonth() === month
      
      days.push({
        date: new Date(currentDate),
        isCurrentMonth,
        isToday: isSameDay(currentDate, todayUTC),
        hasSlots: slotsForDate.length > 0,
        availableSlots,
        totalSlots: slotsForDate.length,
        isPast: currentDate < todayUTC
      })
    }
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }
  
  return days
}

export const groupSlotsByDate = (slots: TimeSlot[]): Record<string, TimeSlot[]> => {
  const grouped: Record<string, TimeSlot[]> = {}
  
  slots.forEach(slot => {
    if (!grouped[slot.date]) {
      grouped[slot.date] = []
    }
    grouped[slot.date].push(slot)
  })
  
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => a.time.localeCompare(b.time))
  })
  
  return grouped
}