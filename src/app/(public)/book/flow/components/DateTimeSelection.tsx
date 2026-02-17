// /src/app/(public)/book/flow/components/DateTimeSelection.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown, X,
  Video, Home, Car, MapPin, Loader, Users, AlertCircle
} from 'lucide-react'
import type { Service, TimeSlot, MeetingType, PackageOption } from '../types'
import { 
  formatMonthYear, formatDateKey, isSameDay, generateCalendarDays,
  getUTCToday
} from '../utils/calendar'
import { 
  formatCurrency, 
  formatTimeForDisplay, 
  formatShortTime 
} from '../utils/formatting'
import { calculatePackagePrice } from '../utils/validation'

interface DateTimeSelectionProps {
  selectedService: Service
  slots: TimeSlot[]
  groupedSlots: Record<string, TimeSlot[]>
  loading: boolean
  slotChecking: boolean
  currentMonth: Date
  onMonthChange: (direction: 'prev' | 'next') => void
  onToday: () => void
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  selectedSlot: TimeSlot | null
  onSlotSelect: (slot: TimeSlot) => Promise<boolean>
  meetingType: MeetingType
  onMeetingTypeChange: (type: MeetingType) => void
  clientAddress: string
  onAddressChange: (address: string) => void
  packageOption: PackageOption
  onPackageChange: (option: PackageOption) => void
  onBack: () => void
  calculateTotal: () => number
}

export function DateTimeSelection({
  selectedService,
  slots,
  groupedSlots,
  loading,
  slotChecking,
  currentMonth,
  onMonthChange,
  onToday,
  selectedDate,
  onDateSelect,
  selectedSlot,
  onSlotSelect,
  meetingType,
  onMeetingTypeChange,
  clientAddress,
  onAddressChange,
  packageOption,
  onPackageChange,
  onBack,
  calculateTotal
}: DateTimeSelectionProps) {
  const [showFullCalendar, setShowFullCalendar] = useState(false)
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const todayUTC = getUTCToday()
  
  const dateKey = selectedDate ? formatDateKey(selectedDate) : null
  const slotsForDate = dateKey ? groupedSlots[dateKey] || [] : []
  const availableSlots = slotsForDate.filter(s => s.isAvailable && !s.isBlocked)
  const hasAvailableSlots = availableSlots.length > 0

  const handleSlotClick = async (slot: TimeSlot) => {
    await onSlotSelect(slot)
  }

  const getAvailabilityColor = (available: number) => {
    if (available > 3) return 'bg-green-500'
    if (available > 0) return 'bg-yellow-500'
    return 'bg-red-400'
  }

  const calendarDays = generateCalendarDays(currentMonth, groupedSlots)

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
        <Loader className="h-8 w-8 animate-spin text-gray-400 mb-4" />
        <p className="text-sm text-gray-600">Checking availability...</p>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">No available slots</h3>
        <p className="text-xs text-gray-600 mb-4">This service has no availability right now</p>
        <button
          onClick={onBack}
          className="text-xs text-gray-700 hover:text-gray-900 underline font-medium"
        >
          Choose another service
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-900">
              {selectedService.name}
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Select date, meeting type, and time
            </p>
          </div>
          <button
            onClick={onBack}
            className="text-xs text-gray-700 hover:text-gray-900 px-3 py-1.5 bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Change
          </button>
        </div>
      </div>

      {/* DESKTOP: 3-COLUMN LAYOUT */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:divide-x lg:divide-gray-200 min-h-[600px]">
        
        {/* COLUMN 1: Calendar */}
        <div className="p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wider">
              Select Date
            </h3>
            <button
              onClick={onToday}
              className="text-[10px] font-medium text-gray-700 hover:text-gray-900 px-2 py-1 border border-gray-300 bg-white rounded hover:bg-gray-50"
            >
              Today
            </button>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900">
              {formatMonthYear(currentMonth)}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onMonthChange('prev')}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => onMonthChange('next')}
                className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-5 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center">
                <span className="text-[10px] font-semibold text-gray-700 uppercase">
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-5 gap-1">
            {calendarDays.map((day, index) => {
              const isSelected = selectedDate && isSameDay(selectedDate, day.date)
              const isClickable = day.isCurrentMonth && day.hasSlots && !day.isPast
              
              return (
                <button
                  key={index}
                  onClick={() => isClickable && onDateSelect(day.date)}
                  disabled={!isClickable}
                  className={`
                    aspect-square p-1.5 rounded-lg border transition-all text-center
                    ${!day.isCurrentMonth ? 'opacity-40' : ''}
                    ${isSelected 
                      ? 'border-black bg-black text-white hover:bg-gray-900' 
                      : isClickable 
                        ? 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 text-gray-900' 
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                    ${day.isToday && !isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                    disabled:opacity-50
                  `}
                >
                  <span className={`
                    text-xs font-medium
                    ${isSelected ? 'text-white' : day.isToday ? 'text-blue-700' : 'text-gray-900'}
                    ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                  `}>
                    {day.date.getUTCDate()}
                  </span>
                  {day.hasSlots && day.isCurrentMonth && !day.isPast && (
                    <div className={`
                      w-1.5 h-1.5 rounded-full mx-auto mt-1
                      ${getAvailabilityColor(day.availableSlots)}
                      ${isSelected ? 'bg-white' : ''}
                    `} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-700">3+ slots</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-gray-700">1-2 slots</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-gray-700">Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Meeting Type & Package */}
        <div className="p-5 bg-gray-50">
          <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-4">
            Meeting Options
          </h3>
          
          {/* Meeting Type */}
          <div className="space-y-2 mb-6">
            {[
              { value: 'virtual' as const, label: 'Virtual Session', icon: Video, desc: 'Zoom/Teams', note: 'No travel fee' },
              { value: 'client_travels' as const, label: 'I Travel to Coach', icon: Home, desc: "Coach's location", note: 'No travel fee' },
              { value: 'coach_travels' as const, label: 'Coach Travels to Me', icon: Car, desc: 'Your location', note: '+ R6.50/km' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onMeetingTypeChange(option.value)}
                className={`
                  w-full p-3 rounded-lg border transition-all text-left
                  ${meetingType === option.value 
                    ? 'border-black bg-black text-white shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <option.icon size={16} className={meetingType === option.value ? 'text-white' : 'text-gray-700'} />
                  <div>
                    <span className={`
                      text-xs font-medium block
                      ${meetingType === option.value ? 'text-white' : 'text-gray-900'}
                    `}>
                      {option.label}
                    </span>
                    <span className={`
                      text-[10px] block mt-0.5
                      ${meetingType === option.value ? 'text-gray-200' : 'text-gray-600'}
                    `}>
                      {option.note}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Address */}
          {meetingType === 'coach_travels' && (
            <div className="mb-6">
              <label className="block text-[10px] uppercase tracking-wide text-gray-700 font-medium mb-1.5">
                Your Address
              </label>
              <textarea
                value={clientAddress}
                onChange={(e) => onAddressChange(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 placeholder:text-gray-500"
                placeholder="e.g., Shop 12 Ghent Street, Evander, 2280"
                rows={2}
                required
              />
              <p className="text-[9px] text-gray-600 mt-1.5">
                Travel fee calculated by admin based on distance
              </p>
            </div>
          )}

          {/* Package Options */}
          {selectedService.hasPackage && (
            <div>
              <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-3">
                Booking Type
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => onPackageChange('single')}
                  className={`
                    w-full p-3 rounded-lg border transition-all text-left
                    ${packageOption === 'single'
                      ? 'border-black bg-black text-white shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
                    }
                  `}
                >
                  <span className={`
                    text-xs font-medium block
                    ${packageOption === 'single' ? 'text-white' : 'text-gray-900'}
                  `}>
                    Single Session
                  </span>
                  <span className={`
                    text-[11px] block mt-1
                    ${packageOption === 'single' ? 'text-gray-200' : 'text-gray-700'}
                  `}>
                    {formatCurrency(Number(selectedService.price))}
                  </span>
                </button>
                <button
                  onClick={() => onPackageChange('package')}
                  className={`
                    w-full p-3 rounded-lg border transition-all text-left
                    ${packageOption === 'package'
                      ? 'border-black bg-black text-white shadow-sm' 
                      : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
                    }
                  `}
                >
                  <span className={`
                    text-xs font-medium block
                    ${packageOption === 'package' ? 'text-white' : 'text-gray-900'}
                  `}>
                    {selectedService.packageSessions}-Session Package
                  </span>
                  <span className={`
                    text-[11px] block mt-1
                    ${packageOption === 'package' ? 'text-gray-200' : 'text-gray-700'}
                  `}>
                    Save {selectedService.packageDiscount}% • {formatCurrency(
                      calculatePackagePrice(
                        Number(selectedService.price),
                        selectedService.packageSessions || 3,
                        Number(selectedService.packageDiscount) || 0
                      )
                    )}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 3: Time Slots */}
        <div className="p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wider">
              Available Times
            </h3>
            {selectedDate && (
              <span className="text-[10px] font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  timeZone: 'UTC'
                })}
              </span>
            )}
          </div>

          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
              <Calendar size={28} className="text-gray-400 mb-2" />
              <p className="text-xs font-medium text-gray-700 text-center">
                Select a date
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                from the calendar
              </p>
            </div>
          ) : !hasAvailableSlots ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle size={28} className="text-gray-400 mb-2" />
              <p className="text-xs font-medium text-gray-700 text-center">
                No available slots
              </p>
              <p className="text-[10px] text-gray-500 mt-1">
                Try another day
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {availableSlots.map((slot) => (
                <motion.button
                  key={slot.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSlotClick(slot)}
                  disabled={slotChecking}
                  className={`
                    w-full p-3 rounded-lg border-2 transition-all text-left
                    ${selectedSlot?.id === slot.id
                      ? 'border-black bg-black text-white shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                    relative
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`
                        text-sm font-medium
                        ${selectedSlot?.id === slot.id ? 'text-white' : 'text-gray-900'}
                      `}>
                        {slot.formattedTime || formatTimeForDisplay(slot.time)}
                      </div>
                      <div className={`
                        text-[10px] mt-1 flex items-center gap-1
                        ${selectedSlot?.id === slot.id ? 'text-gray-200' : 'text-gray-600'}
                      `}>
                        <Clock size={10} />
                        {slot.duration || selectedService.duration} min
                      </div>
                    </div>
                    {slot.remainingSpots !== undefined && slot.remainingSpots <= 3 && (
                      <div className={`
                        text-[9px] px-2 py-1 rounded-full font-medium
                        ${selectedSlot?.id === slot.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }
                      `}>
                        {slot.remainingSpots} left
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE LAYOUT - WITH FULL CALENDAR MODAL */}
      <div className="lg:hidden">
        {/* Date Scroller with Month Context & Full Calendar Button */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wider">
              Select Date
            </h3>
            
            {/* Month Navigator & Full Calendar Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => onMonthChange('prev')}
                  className="p-1.5 rounded-md hover:bg-white text-gray-700 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[11px] font-medium text-gray-900 px-1 min-w-[80px] text-center">
                  {formatMonthYear(currentMonth)}
                </span>
                <button
                  onClick={() => onMonthChange('next')}
                  className="p-1.5 rounded-md hover:bg-white text-gray-700 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              
              {/* Full Calendar Button */}
              <button
                onClick={() => setShowFullCalendar(true)}
                className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="View full calendar"
              >
                <Calendar size={16} className="text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Date Chips with Scroll Hint */}
          <div className="relative">
            {/* Left fade indicator - shows when scrolled */}
            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
            
            {/* Scrollable dates */}
            <div className="overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
              <div className="flex gap-2 min-w-min">
                {calendarDays
                  .filter(d => d.isCurrentMonth && !d.isPast && d.hasSlots)
                  .map((day) => {
                    const isSelected = selectedDate && isSameDay(selectedDate, day.date)
                    return (
                      <button
                        key={formatDateKey(day.date)}
                        onClick={() => onDateSelect(day.date)}
                        className={`
                          flex-shrink-0 w-16 p-2 rounded-lg border transition-all text-center
                          ${isSelected 
                            ? 'border-black bg-black text-white shadow-sm' 
                            : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
                          }
                        `}
                      >
                        <span className={`
                          text-[9px] font-medium
                          ${isSelected ? 'text-gray-200' : 'text-gray-600'}
                        `}>
                          {day.date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })}
                        </span>
                        <span className={`
                          text-base font-bold block my-0.5
                          ${isSelected ? 'text-white' : 'text-gray-900'}
                        `}>
                          {day.date.getUTCDate()}
                        </span>
                        <div className={`
                          w-1.5 h-1.5 rounded-full mx-auto
                          ${getAvailabilityColor(day.availableSlots)}
                          ${isSelected ? 'bg-white' : ''}
                        `} />
                      </button>
                    )
                  })}
              </div>
            </div>
            
            {/* Right fade & scroll indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white to-transparent pointer-events-none flex items-center justify-end pr-1">
              <div className="bg-gray-800/10 backdrop-blur-sm rounded-full p-1 mr-1">
                <ChevronRight size={12} className="text-gray-600 animate-pulse" />
              </div>
            </div>
          </div>
          
          {/* Scroll hint text */}
          <p className="text-[9px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-gray-400" />
            Scroll right for more dates
            <span className="inline-block w-1 h-1 rounded-full bg-gray-400 ml-1" />
          </p>
        </div>

        {/* FULL CALENDAR MODAL */}
        <AnimatePresence>
          {showFullCalendar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFullCalendar(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-lg bg-white rounded-t-2xl lg:rounded-2xl shadow-xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Full Calendar</h3>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {selectedService.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowFullCalendar(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={18} className="text-gray-700" />
                  </button>
                </div>

                {/* Calendar Content */}
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(80vh - 80px)" }}>
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => onMonthChange('prev')}
                      className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white"
                    >
                      <ChevronLeft size={18} className="text-gray-700" />
                    </button>
                    <span className="text-base font-medium text-gray-900">
                      {formatMonthYear(currentMonth)}
                    </span>
                    <button
                      onClick={() => onMonthChange('next')}
                      className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white"
                    >
                      <ChevronRight size={18} className="text-gray-700" />
                    </button>
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-5 mb-3">
                    {weekDays.map(day => (
                      <div key={day} className="text-center">
                        <span className="text-xs font-semibold text-gray-700 uppercase">
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {calendarDays.map((day, index) => {
                      const isSelected = selectedDate && isSameDay(selectedDate, day.date)
                      const isClickable = day.isCurrentMonth && day.hasSlots && !day.isPast
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (isClickable) {
                              onDateSelect(day.date)
                              setShowFullCalendar(false)
                            }
                          }}
                          disabled={!isClickable}
                          className={`
                            aspect-square p-2 rounded-lg border transition-all text-center
                            ${!day.isCurrentMonth ? 'opacity-40' : ''}
                            ${isSelected 
                              ? 'border-black bg-black text-white' 
                              : isClickable 
                                ? 'border-gray-200 bg-white hover:border-gray-400 text-gray-900' 
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                            }
                            ${day.isToday && !isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                          `}
                        >
                          <span className={`
                            text-sm font-medium
                            ${isSelected ? 'text-white' : day.isToday ? 'text-blue-700' : 'text-gray-900'}
                            ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                          `}>
                            {day.date.getUTCDate()}
                          </span>
                          {day.hasSlots && day.isCurrentMonth && !day.isPast && (
                            <div className={`
                              w-1.5 h-1.5 rounded-full mx-auto mt-1
                              ${getAvailabilityColor(day.availableSlots)}
                              ${isSelected ? 'bg-white' : ''}
                            `} />
                          )}
                          {!day.hasSlots && day.isCurrentMonth && !day.isPast && (
                            <div className="w-1.5 h-1.5 rounded-full mx-auto mt-1 bg-gray-300" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="text-gray-700">3+ slots</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                        <span className="text-gray-700">1-2 slots</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="text-gray-700">Booked</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                        <span className="text-gray-700">No slots</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        onToday()
                        setShowFullCalendar(false)
                      }}
                      className="flex-1 py-2.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Jump to Today
                    </button>
                    <button
                      onClick={() => setShowFullCalendar(false)}
                      className="flex-1 py-2.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Meeting Options */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-3">
            Meeting Options
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'virtual', icon: Video, label: 'Virtual' },
              { value: 'client_travels', icon: Home, label: 'I travel' },
              { value: 'coach_travels', icon: Car, label: 'Coach travels' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onMeetingTypeChange(option.value as MeetingType)}
                className={`
                  p-3 rounded-lg border transition-all text-center
                  ${meetingType === option.value 
                    ? 'border-black bg-black text-white shadow-sm' 
                    : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
                  }
                `}
              >
                <option.icon size={16} className="mx-auto mb-1" />
                <span className="text-[10px] font-medium block">{option.label}</span>
              </button>
            ))}
          </div>
          
          {/* Mobile Address */}
          {meetingType === 'coach_travels' && (
            <div className="mt-3">
              <textarea
                value={clientAddress}
                onChange={(e) => onAddressChange(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                placeholder="Your address"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Time Slots with "More" Indicator */}
        <div className="p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-gray-900 uppercase tracking-wider">
              Available Times
            </h3>
            {selectedDate && (
              <span className="text-[10px] font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  timeZone: 'UTC'
                })}
              </span>
            )}
          </div>
          
          {!selectedDate ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700">Select a date first</p>
            </div>
          ) : !hasAvailableSlots ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700">No slots available</p>
              <p className="text-[10px] text-gray-600 mt-1">Try another date</p>
            </div>
          ) : (
            <>
              {/* First 4 slots - 2x2 grid */}
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.slice(0, 4).map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    disabled={slotChecking}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-center
                      ${selectedSlot?.id === slot.id
                        ? 'border-black bg-black text-white shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-400 text-gray-900'
                      }
                      disabled:opacity-50
                    `}
                  >
                    <span className="text-xs font-medium block">
                      {slot.formattedTimeShort || formatShortTime(slot.time)}
                    </span>
                    {slot.remainingSpots !== undefined && slot.remainingSpots <= 3 && (
                      <span className={`
                        text-[8px] mt-1 block font-medium
                        ${selectedSlot?.id === slot.id ? 'text-gray-200' : 'text-yellow-700'}
                      `}>
                        {slot.remainingSpots} left
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Show more slots indicator - if more than 4 slots */}
              {availableSlots.length > 4 && (
                <div className="mt-3 relative">
                  <div className="absolute inset-x-0 -top-3 h-6 bg-gradient-to-b from-transparent to-white pointer-events-none" />
                  <button
                    onClick={() => {
                      // Expand to show next 4 slots, or could open a modal
                      const remainingSlots = availableSlots.slice(4, 8)
                      // For now, we'll just show a message - you could implement a modal here
                      alert(`${availableSlots.length - 4} more times available. Please scroll or use calendar view.`)
                    }}
                    className="w-full py-2.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View {availableSlots.length - 4} more times</span>
                    <ChevronRight size={12} />
                  </button>
                  <p className="text-[9px] text-gray-500 mt-1.5 text-center flex items-center justify-center gap-1">
                    <ChevronLeft size={10} className="animate-pulse" />
                    Scroll for more slots
                    <ChevronRight size={10} className="animate-pulse" />
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="p-4 sm:p-5 bg-white border-t border-gray-200 sticky bottom-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-wider">Total</div>
            <div className="text-lg font-medium text-gray-900">
              {formatCurrency(calculateTotal())}
            </div>
            {meetingType === 'coach_travels' && (
              <div className="text-[9px] text-amber-700 font-medium mt-0.5">
                + Travel fee to be confirmed
              </div>
            )}
          </div>
          
          <button
            onClick={() => selectedSlot && handleSlotClick(selectedSlot)}
            disabled={!selectedSlot || slotChecking}
            className={`
              px-6 py-2.5 rounded-lg text-xs font-medium transition-all
              ${selectedSlot 
                ? 'bg-black text-white hover:bg-gray-800 shadow-sm' 
                : 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
              }
              disabled:opacity-50
            `}
          >
            {slotChecking ? (
              <span className="flex items-center gap-2">
                <Loader size={12} className="animate-spin" />
                Checking...
              </span>
            ) : (
              'Continue →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}