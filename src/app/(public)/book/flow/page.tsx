// File: /src/app/(public)/book/flow/page.tsx
// UPDATED VERSION WITH FRIDAY SLOTS FIX

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar as CalendarIcon, Clock, Check, CreditCard, Loader, ArrowRight, 
  User, Mail, Phone, Target, MapPin, Car, Video, Home, AlertCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react'

interface Service {
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

interface TimeSlot {
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

interface AvailabilityResponse {
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

// 🔥 FIXED: Calendar helper functions - USE UTC
const getDaysInMonth = (year: number, month: number) => {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
}

// 🔥 FIXED: Get first day to display (first Monday on or before the 1st of the month) - UTC VERSION
const getFirstDisplayDate = (year: number, month: number) => {
  // Use UTC at noon to avoid timezone issues
  const firstDayOfMonth = new Date(Date.UTC(year, month, 1, 12, 0, 0))
  
  // Find the Monday on or before the 1st (using UTC)
  let currentDate = new Date(firstDayOfMonth)
  while (currentDate.getUTCDay() !== 1) { // 1 = Monday (UTC)
    currentDate.setUTCDate(currentDate.getUTCDate() - 1)
  }
  
  return currentDate
}

const formatMonthYear = (date: Date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// 🔥 FIXED: Use UTC components
const formatDateKey = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 🔥 FIXED: Compare UTC dates
const isSameDay = (date1: Date, date2: Date) => {
  return date1.getUTCFullYear() === date2.getUTCFullYear() &&
         date1.getUTCMonth() === date2.getUTCMonth() &&
         date1.getUTCDate() === date2.getUTCDate()
}

// 🔥 FIXED: Check if a date is a weekend (Saturday or Sunday) - UTC VERSION
const isWeekend = (date: Date) => {
  const day = date.getUTCDay() // 0=Sunday, 6=Saturday (UTC)
  return day === 0 || day === 6
}

export default function BookingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([])
  const [groupedSlots, setGroupedSlots] = useState<Record<string, TimeSlot[]>>({})
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [packageOption, setPackageOption] = useState<'single' | 'package'>('single')
  const [slotChecking, setSlotChecking] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    // Initialize with UTC date at noon
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12, 0, 0))
  })
  
  // Travel pricing state
  const [meetingType, setMeetingType] = useState<'virtual' | 'client_travels' | 'coach_travels'>('virtual')
  const [clientAddress, setClientAddress] = useState<string>('')
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goals: ''
  })

  // Fetch services on load
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.filter((s: Service) => s.isActive))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchAvailableSlots = async (serviceId: string) => {
    try {
      setLoading(true)
      setErrorMessage(null)
      
      console.log('📅 Requesting slots for month:', {
        currentMonth: currentMonth.toISOString(),
        year: currentMonth.getUTCFullYear(),
        month: currentMonth.getUTCMonth() + 1,
        monthName: currentMonth.toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      })
      
      // 🔥 FIXED: Use current month's year and month in the API request
      const year = currentMonth.getUTCFullYear()
      const month = currentMonth.getUTCMonth() + 1
      
      const response = await fetch(
        `/api/availability/public?serviceId=${serviceId}&year=${year}&month=${month}`
      )
      
      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${response.status}`)
      }
      
      const data: AvailabilityResponse = await response.json()
      
      // Handle both response formats
      const slots = Array.isArray(data) ? data : (data.slots || [])
      const grouped = data.groupedByDate || groupSlotsByDate(slots)
      
      setAllTimeSlots(slots)
      setGroupedSlots(grouped)
      
      console.log('📊 Slots loaded:', {
        total: slots.length,
        available: slots.filter(s => s.isAvailable).length,
        blocked: slots.filter(s => s.isBlocked).length,
        booked: slots.filter(s => !s.isAvailable && !s.isBlocked).length,
        groupedDates: Object.keys(grouped).length,
        fridaySlots: slots.filter(s => {
          const date = new Date(s.date + 'T12:00:00Z')
          return date.getUTCDay() === 5
        }).length
      })
      
      if (slots.length === 0) {
        setErrorMessage('No available time slots found for this service.')
      }
      
    } catch (error) {
      console.error('❌ Error fetching slots:', error)
      setErrorMessage('Failed to load available time slots. Please try again.')
      setAllTimeSlots([])
      setGroupedSlots({})
    } finally {
      setLoading(false)
    }
  }

  const groupSlotsByDate = (slots: TimeSlot[]): Record<string, TimeSlot[]> => {
    const grouped: Record<string, TimeSlot[]> = {}
    
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = []
      }
      grouped[slot.date].push(slot)
    })
    
    // Sort slots within each date by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time))
    })
    
    return grouped
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    fetchAvailableSlots(service.id)
    setStep(2)
    setSelectedSlot(null)
    setSelectedDate(null)
  }

  const checkSlotAvailability = async (slotId: string): Promise<{available: boolean; reason?: string; slot?: any}> => {
    try {
      setSlotChecking(true)
      const response = await fetch(`/api/availability/${slotId}/check`)
      
      if (!response.ok) {
        throw new Error('Check failed')
      }
      
      const data = await response.json()
      return {
        available: data.available,
        reason: data.reason,
        slot: data.slot
      }
    } catch (error) {
      console.error('Error checking slot:', error)
      return {
        available: false,
        reason: 'Unable to verify slot availability'
      }
    } finally {
      setSlotChecking(false)
    }
  }

  const handleSlotSelect = async (slot: TimeSlot) => {
    setErrorMessage(null)
    
    if (slot.isBlocked || !slot.isAvailable) {
      setErrorMessage('This time slot is no longer available. Please select another time.')
      return
    }
    
    const result = await checkSlotAvailability(slot.id)
    
    if (!result.available) {
      setErrorMessage(result.reason || 'This time slot was just taken. Please select another.')
      
      if (selectedService) {
        fetchAvailableSlots(selectedService.id)
      }
      
      return
    }
    
    setSelectedSlot(slot)
    setStep(3)
  }

  const handleDateSelect = (date: Date) => {
    const dateKey = formatDateKey(date)
    const slotsForDate = groupedSlots[dateKey]
    
    if (slotsForDate && slotsForDate.length > 0) {
      setSelectedDate(date)
    }
  }

  const calculateTotal = () => {
    if (!selectedService) return 0
    
    let basePrice = 0
    
    if (packageOption === 'package' && selectedService.hasPackage) {
      const packagePrice = Number(selectedService.price) * (selectedService.packageSessions || 3)
      const discount = packagePrice * ((Number(selectedService.packageDiscount) || 0) / 100)
      basePrice = packagePrice - discount
    } else {
      basePrice = Number(selectedService.price)
    }
    
    return basePrice
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !selectedSlot) return
    
    setLoading(true)
    setErrorMessage(null)
    
    try {
      const finalCheck = await checkSlotAvailability(selectedSlot.id)
      if (!finalCheck.available) {
        setErrorMessage(finalCheck.reason || 'This time slot was just booked. Please go back and choose another time.')
        setLoading(false)
        return
      }
      
      const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      let sessionAmount = 0
      if (packageOption === 'package' && selectedService.hasPackage) {
        const packagePrice = Number(selectedService.price) * (selectedService.packageSessions || 3)
        const discount = packagePrice * ((Number(selectedService.packageDiscount) || 0) / 100)
        sessionAmount = packagePrice - discount
      } else {
        sessionAmount = Number(selectedService.price)
      }
      
      const bookingData: any = {
        serviceId: selectedService.id,
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        bookingDate: selectedSlot.date,
        bookingTime: selectedSlot.time,
        duration: selectedService.duration,
        format: selectedService.format,
        goals: formData.goals,
        totalAmount: calculateTotal(),
        numberOfSessions: packageOption === 'package' ? (selectedService.packageSessions || 1) : 1,
        sessionType: packageOption === 'package' && selectedService.packageSessions 
          ? `package_${selectedService.packageSessions}`
          : 'single',
        termsAccepted: true,
        bookingNumber: bookingNumber,
        attendees: 1,
        amountPaid: 0,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        companyName: null,
        eventDetails: null,
        meetingLink: null,
        notes: null,
        specialRequests: null,
        meetingType: meetingType,
        sessionAmount: sessionAmount,
        travelDistanceKm: null,
        travelAmount: 0,
      }

      if (meetingType === 'coach_travels') {
        bookingData.location = clientAddress
      } else if (meetingType === 'client_travels') {
        bookingData.location = "Client will travel to coach's location"
      } else {
        bookingData.location = "Virtual session"
      }

      const bookingResponse = await fetch('/api/session-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      
      if (bookingResponse.ok) {
        const booking = await bookingResponse.json()
        router.push(`/book/pay/${booking.id}`)
      } else {
        const error = await bookingResponse.json()
        setErrorMessage(error.error || 'Failed to create booking. Please try again.')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      setErrorMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calendar navigation - USE UTC
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setUTCMonth(prev.getUTCMonth() - 1)
      return newDate
    })
  }

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setUTCMonth(prev.getUTCMonth() + 1)
      return newDate
    })
  }

  const goToToday = () => {
    const now = new Date()
    setCurrentMonth(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12, 0, 0)))
  }

  // 🔥 FIXED: Generate calendar days based on actual month boundaries with UTC
  const generateCalendarDays = () => {
    const year = currentMonth.getUTCFullYear()
    const month = currentMonth.getUTCMonth()
    
    const days = []
    
    // Start from the Monday on or before the 1st of the month (in UTC)
    let currentDate = getFirstDisplayDate(year, month)
    
    // Get today in UTC (at noon to avoid timezone issues)
    const today = new Date()
    const todayUTC = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      12, 0, 0
    ))
    
    // Calculate end date: show 6 weeks total for consistency
    const endDate = new Date(currentDate)
    endDate.setUTCDate(currentDate.getUTCDate() + (6 * 7)) // 6 weeks (42 days)
    
    while (currentDate <= endDate) {
      // Only add weekdays (Monday-Friday) using UTC
      if (!isWeekend(currentDate)) {
        const dateKey = formatDateKey(currentDate)
        const slotsForDate = groupedSlots[dateKey] || []
        const availableSlots = slotsForDate.filter(s => s.isAvailable && !s.isBlocked).length
        
        const isCurrentMonth = currentDate.getUTCMonth() === month
        
        days.push({
          date: new Date(currentDate),
          isCurrentMonth: isCurrentMonth,
          isToday: isSameDay(currentDate, todayUTC),
          hasSlots: slotsForDate.length > 0,
          availableSlots: availableSlots,
          totalSlots: slotsForDate.length,
          isPast: currentDate < todayUTC,
          isWeekend: false // All days in this array are weekdays
        })
      }
      
      // Move to next day (UTC)
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    
    console.log('📅 Generated calendar days:', {
      yearMonth: `${year}-${month + 1}`,
      totalDays: days.length,
      firstDate: days[0]?.date.toISOString(),
      lastDate: days[days.length - 1]?.date.toISOString(),
      currentMonthCount: days.filter(d => d.isCurrentMonth).length,
      fridayCount: days.filter(d => {
        const date = d.date
        return date.getUTCDay() === 5 && d.isCurrentMonth
      }).length
    })
    
    return days
  }

  const renderCalendar = () => {
    const days = generateCalendarDays()
    // Show only Monday-Friday (5 columns)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    
    // Debug: Count Fridays in current month
    const fridaysInMonth = days.filter(d => {
      const date = d.date
      return date.getUTCDay() === 5 && d.isCurrentMonth
    })
    
    console.log('📅 Calendar rendering:', {
      totalCells: days.length,
      fridaysInMonth: fridaysInMonth.length,
      fridayDates: fridaysInMonth.map(d => d.date.toISOString().split('T')[0]),
      fridaySlots: fridaysInMonth.map(d => ({
        date: d.date.toISOString().split('T')[0],
        hasSlots: d.hasSlots,
        availableSlots: d.availableSlots
      }))
    })
    
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        {/* Weekday Headers - Monday to Friday only */}
        <div className="grid grid-cols-5 border-b border-gray-200 bg-gray-50">
          {weekDays.map(day => (
            <div key={day} className="text-center py-3 px-2">
              <div className="text-sm font-semibold text-gray-700">{day}</div>
            </div>
          ))}
        </div>

        {/* Calendar Days - 5 columns grid */}
        <div className="grid grid-cols-5">
          {days.map((day, index) => {
            const dateKey = formatDateKey(day.date)
            const isSelected = selectedDate && isSameDay(selectedDate, day.date)
            const isClickable = day.isCurrentMonth && day.hasSlots && !day.isPast
            
            // Debug Friday cells
            const isFriday = day.date.getUTCDay() === 5
            if (isFriday && day.isCurrentMonth) {
              console.log('📅 Friday cell:', {
                date: dateKey,
                hasSlots: day.hasSlots,
                availableSlots: day.availableSlots,
                isClickable,
                isCurrentMonth: day.isCurrentMonth
              })
            }
            
            return (
              <div
                key={index}
                onClick={() => {
                  if (isClickable) {
                    handleDateSelect(day.date)
                  }
                }}
                className={`
                  min-h-[90px] sm:min-h-[100px] p-2 sm:p-3 border-r border-b border-gray-100
                  transition-all duration-200
                  ${!day.isCurrentMonth ? 'bg-gray-50/50 opacity-40' : ''}
                  ${day.isToday ? 'bg-blue-50' : ''}
                  ${isSelected ? 'bg-black ring-2 ring-black ring-inset' : ''}
                  ${isClickable ? 'cursor-pointer hover:bg-gray-50 hover:shadow-sm' : 'cursor-default'}
                  ${!isClickable && day.isCurrentMonth ? 'opacity-50' : ''}
                  ${day.isPast && day.isCurrentMonth ? 'opacity-40' : ''}
                  ${isFriday ? 'border-l border-r border-gray-200' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  {/* Date number */}
                  <div className="flex justify-between items-start mb-1">
                    <span className={`
                      text-sm sm:text-base font-medium
                      ${isSelected ? 'text-white' : ''}
                      ${day.isToday && !isSelected ? 'text-blue-600 font-bold' : ''}
                      ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                      ${isFriday ? 'font-semibold' : ''}
                    `}>
                      {day.date.getUTCDate()}
                      {isFriday && day.isCurrentMonth && (
                        <span className="ml-1 text-xs text-purple-600">Fri</span>
                      )}
                    </span>
                    
                    {/* Availability indicator dot */}
                    {day.isCurrentMonth && day.hasSlots && !day.isPast && (
                      <div className={`
                        w-2 h-2 rounded-full flex-shrink-0
                        ${day.availableSlots > 3 ? 'bg-green-500' : 
                          day.availableSlots > 0 ? 'bg-yellow-500' : 
                          'bg-red-400'}
                        ${isSelected ? 'bg-white' : ''}
                      `} />
                    )}
                  </div>
                  
                  {/* Availability info */}
                  {day.isCurrentMonth && day.hasSlots && !day.isPast && (
                    <div className={`mt-auto text-xs ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                      {day.availableSlots > 0 ? (
                        <div className={`font-medium ${isSelected ? 'text-white' : 'text-green-600'}`}>
                          {day.availableSlots} {day.availableSlots === 1 ? 'slot' : 'slots'}
                        </div>
                      ) : (
                        <div className={`${isSelected ? 'text-gray-300' : 'text-red-600'}`}>
                          Fully booked
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Debug info for empty Friday cells */}
                  {isFriday && day.isCurrentMonth && !day.hasSlots && (
                    <div className="mt-auto text-xs text-red-500">
                      No slots
                    </div>
                  )}
                  
                  {/* Past date indicator */}
                  {day.isPast && day.isCurrentMonth && (
                    <div className="mt-auto text-xs text-gray-400">
                      Past
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderTimeSlotsForSelectedDate = () => {
    if (!selectedDate) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a date from the calendar above</p>
          <p className="text-gray-400 text-sm mt-2">Available dates are highlighted with colored dots</p>
        </div>
      )
    }
    
    const dateKey = formatDateKey(selectedDate)
    const slotsForDate = groupedSlots[dateKey] || []
    
    // Debug selected date
    console.log('📅 Selected date:', {
      date: selectedDate.toISOString(),
      dateKey,
      slotsCount: slotsForDate.length,
      isFriday: selectedDate.getUTCDay() === 5
    })
    
    if (slotsForDate.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No time slots available for this date</p>
          <p className="text-gray-400 text-sm mt-2">Please select another date</p>
        </div>
      )
    }
    
    // Separate available and unavailable slots
    const availableSlots = slotsForDate.filter(s => s.isAvailable && !s.isBlocked)
    const unavailableSlots = slotsForDate.filter(s => !s.isAvailable || s.isBlocked)
    
    return (
      <div className="space-y-6">
        {/* Selected Date Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC'
              })}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {availableSlots.length} available {availableSlots.length === 1 ? 'slot' : 'slots'}
            </p>
          </div>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear selection
          </button>
        </div>

        {/* Available slots */}
        {availableSlots.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              Available Times
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={slotChecking}
                  className={`
                    p-4 rounded-xl border-2 text-center transition-all duration-300
                    ${selectedSlot?.id === slot.id
                      ? 'border-black bg-black text-white shadow-lg scale-105'
                      : 'border-green-200 bg-green-50 hover:border-green-400 hover:shadow-md hover:scale-102'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="font-semibold text-lg">
                    {slot.formattedTimeShort || slot.formattedTime}
                  </div>
                  {slot.remainingSpots !== undefined && (
                    <div className={`text-xs mt-1 ${selectedSlot?.id === slot.id ? 'text-white' : 'text-green-700'}`}>
                      {slot.remainingSpots} left
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Unavailable slots */}
        {unavailableSlots.length > 0 && (
          <div className="opacity-60">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
              Unavailable Times
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {unavailableSlots.map(slot => (
                <div
                  key={slot.id}
                  className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-center cursor-not-allowed"
                >
                  <div className="font-semibold text-gray-500">
                    {slot.formattedTimeShort || slot.formattedTime}
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    {slot.isBlocked ? 'Blocked' : 'Booked'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Reset address when meeting type changes
  useEffect(() => {
    if (meetingType !== 'coach_travels') {
      setClientAddress('')
    }
  }, [meetingType])

  // 🔥 FIXED: Refetch slots when month changes
  useEffect(() => {
    if (selectedService && step === 2) {
      fetchAvailableSlots(selectedService.id)
    }
  }, [currentMonth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Book Your Coaching Session</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Select your service, choose a date & time, and book instantly
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-4xl mx-auto">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-1 bg-black transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
            </div>
            
            {[
              { num: 1, icon: <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Service' },
              { num: 2, icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Date & Time' },
              { num: 3, icon: <User className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Details' },
              { num: 4, icon: <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />, label: 'Payment' }
            ].map(({ num, icon, label }) => (
              <div key={num} className="flex flex-col items-center relative">
                <div className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${step >= num 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-400 border-gray-300'
                  }
                  ${step === num ? 'scale-110 shadow-lg' : ''}
                `}>
                  {step > num ? <Check className="h-5 w-5 sm:h-6 sm:w-6" /> : icon}
                </div>
                <div className={`mt-2 text-xs sm:text-sm font-medium ${step >= num ? 'text-gray-900' : 'text-gray-500'}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Step 1: Choose Service */}
          {step === 1 && (
            <ServiceSelection services={services} onSelect={handleServiceSelect} />
          )}

          {/* Step 2: Date & Time Selection with Monthly Calendar */}
          {step === 2 && selectedService && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Date & Time</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedService.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStep(1)
                    setSelectedSlot(null)
                    setSelectedDate(null)
                    setErrorMessage(null)
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Change service
                </button>
              </div>

              {/* Meeting Type & Package Selection */}
              <MeetingAndPackageSelection
                meetingType={meetingType}
                onMeetingTypeChange={setMeetingType}
                clientAddress={clientAddress}
                onAddressChange={setClientAddress}
                selectedService={selectedService}
                packageOption={packageOption}
                onPackageChange={setPackageOption}
              />

              {/* Loading state */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : allTimeSlots.length === 0 ? (
                <NoSlotsMessage />
              ) : (
                <div className="space-y-8">
                  {/* Calendar Navigation */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {formatMonthYear(currentMonth)}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={prevMonth}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        aria-label="Previous month"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={goToToday}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={nextMonth}
                        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        aria-label="Next month"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Monthly Calendar - 5 COLUMNS ONLY (Mon-Fri) */}
                  {renderCalendar()}

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Many slots</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Few slots</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <span>Fully booked</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                      <span>Friday</span>
                    </div>
                  </div>

                  {/* Time Slots for Selected Date */}
                  <div className="mt-8 pt-8 border-t-2 border-gray-200">
                    {renderTimeSlotsForSelectedDate()}
                  </div>

                  {/* Slot checking indicator */}
                  {slotChecking && (
                    <div className="flex items-center justify-center py-4">
                      <Loader className="h-5 w-5 animate-spin text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Verifying availability...</span>
                    </div>
                  )}

                  {/* Bottom Navigation */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setStep(1)
                        setSelectedSlot(null)
                        setSelectedDate(null)
                      }}
                      className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      ← Back
                    </button>
                    
                    <div className="flex flex-col items-center sm:items-end">
                      <div className="text-sm text-gray-600">Session Total</div>
                      <div className="text-2xl font-bold text-gray-900">
                        R {calculateTotal().toFixed(2)}
                      </div>
                      {meetingType === 'coach_travels' && (
                        <div className="text-xs text-yellow-700 mt-1">
                          + Travel fee to be confirmed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Details Form */}
          {step === 3 && selectedService && selectedSlot && (
            <DetailsForm
              selectedService={selectedService}
              selectedSlot={selectedSlot}
              meetingType={meetingType}
              clientAddress={clientAddress}
              packageOption={packageOption}
              formData={formData}
              onFormDataChange={setFormData}
              onBack={() => {
                setStep(2)
                setErrorMessage(null)
              }}
              onSubmit={handleFormSubmit}
              loading={loading}
              calculateTotal={calculateTotal}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Need help? Call us at +27 82 123 4567 or email support@lifecoach.co.za
        </div>
      </div>
    </div>
  )
}

// Component: Service Selection
function ServiceSelection({ services, onSelect }: { services: Service[]; onSelect: (service: Service) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Coaching Service</h2>
      <div className="space-y-6">
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelect(service)}
            className="group cursor-pointer p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-6">
                  <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl font-bold text-gray-900">R {Number(service.price).toFixed(2)}</div>
                    <div className="text-sm text-gray-500">per session</div>
                  </div>
                </div>
                
                <p className="text-gray-600 mt-3">{service.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-4 w-4 mr-2" />
                    {service.duration} minutes
                  </div>
                  <div className="flex items-center text-gray-700">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {service.format === 'both' ? 'Virtual or In-person' : service.format}
                  </div>
                </div>

                {service.hasPackage && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="font-medium text-blue-900">
                          Save {Number(service.packageDiscount)}% with {service.packageSessions}-Session Package
                        </div>
                        <div className="text-sm text-blue-700 mt-1">
                          Pay once, book multiple sessions
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <div className="text-xl font-bold text-blue-900">
                          R {(Number(service.price) * (service.packageSessions || 3) * (1 - (Number(service.packageDiscount) || 0) / 100)).toFixed(2)}
                        </div>
                        <div className="text-sm text-blue-600">
                          instead of R {(Number(service.price) * (service.packageSessions || 3)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:pl-6 md:border-l md:border-gray-200">
                <button className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                  Select
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Component: Meeting and Package Selection
function MeetingAndPackageSelection({
  meetingType,
  onMeetingTypeChange,
  clientAddress,
  onAddressChange,
  selectedService,
  packageOption,
  onPackageChange
}: {
  meetingType: string
  onMeetingTypeChange: (type: any) => void
  clientAddress: string
  onAddressChange: (address: string) => void
  selectedService: Service
  packageOption: string
  onPackageChange: (option: any) => void
}) {
  return (
    <div className="mb-8 space-y-6">
      {/* Meeting Type */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">How would you like to meet?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'virtual', label: 'Virtual', icon: Video, desc: 'Zoom/Teams', note: 'No travel fee' },
            { value: 'client_travels', label: "I'll Come to You", icon: Home, desc: "Coach's location", note: 'No travel fee' },
            { value: 'coach_travels', label: 'You Come to Me', icon: Car, desc: 'Coach travels', note: '+ R6.50/km' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => onMeetingTypeChange(option.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                meetingType === option.value 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <option.icon className="h-5 w-5 mr-2" />
                <div className="font-medium text-sm sm:text-base">{option.label}</div>
              </div>
              <div className="text-xs sm:text-sm">{option.desc}</div>
              <div className="text-xs sm:text-sm mt-2">{option.note}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Address Input */}
      {meetingType === 'coach_travels' && (
        <div className="p-4 sm:p-6 bg-yellow-50 rounded-xl border border-yellow-200">
          <h3 className="font-medium text-yellow-900 mb-3">Your Address</h3>
          <textarea
            value={clientAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
            placeholder="e.g., Shop 12 Ghent Street, Evander, 2280"
            rows={2}
            required
          />
          <div className="text-xs sm:text-sm text-yellow-700 mt-2">
            💡 Travel fee calculated by admin based on distance
          </div>
        </div>
      )}

      {/* Package Selection */}
      {selectedService.hasPackage && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Choose your option</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onPackageChange('single')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                packageOption === 'single'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">Single Session</div>
              <div className="text-sm mt-1">R {Number(selectedService.price).toFixed(2)}</div>
            </button>
            <button
              onClick={() => onPackageChange('package')}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                packageOption === 'package'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">{selectedService.packageSessions}-Session Package</div>
              <div className="text-sm mt-1">
                Save {Number(selectedService.packageDiscount)}% - R {
                  (Number(selectedService.price) * (selectedService.packageSessions || 3) * 
                  (1 - (Number(selectedService.packageDiscount) || 0) / 100)).toFixed(2)
                }
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Component: No Slots Message
function NoSlotsMessage() {
  return (
    <div className="text-center py-20">
      <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">No available slots for this service</p>
      <p className="text-gray-400 mt-2">Please check back later or select a different service</p>
    </div>
  )
}

// Component: Details Form
function DetailsForm({
  selectedService,
  selectedSlot,
  meetingType,
  clientAddress,
  packageOption,
  formData,
  onFormDataChange,
  onBack,
  onSubmit,
  loading,
  calculateTotal
}: any) {
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00Z')
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
          <p className="text-gray-600 mt-2">
            We'll use this to send your confirmation
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          ← Back
        </button>
      </div>

      {/* Booking Summary */}
      <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{selectedService.name}</h3>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center text-gray-700">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDate(selectedSlot.date)}
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-2" />
                {selectedSlot.formattedTime}
              </div>
              <div className="flex items-center text-gray-700">
                {meetingType === 'virtual' ? <Video className="h-4 w-4 mr-2" /> :
                  meetingType === 'client_travels' ? <Home className="h-4 w-4 mr-2" /> :
                  <Car className="h-4 w-4 mr-2" />}
                {meetingType === 'virtual' ? 'Virtual' :
                  meetingType === 'client_travels' ? 'You Travel' :
                  'Coach Travels'}
              </div>
            </div>
            {meetingType === 'coach_travels' && clientAddress && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>Address:</strong> {clientAddress}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-left md:text-right">
            <div className="text-2xl font-bold text-gray-900">
              R {calculateTotal().toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {packageOption === 'package' 
                ? `${selectedService.packageSessions} sessions` 
                : '1 session'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Full Name *
                </div>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => onFormDataChange({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address *
                </div>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => onFormDataChange({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Phone Number *
              </div>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => onFormDataChange({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="+27 82 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2" />
                What would you like to achieve? (Optional)
              </div>
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => onFormDataChange({...formData, goals: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Share your goals or what you'd like to focus on..."
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              required
              id="terms"
              className="mt-1 mr-3 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the terms and conditions and booking policy.
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}