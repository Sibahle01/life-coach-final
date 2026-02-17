// /src/app/(public)/book/flow/hooks/useBookingFlow.ts
// Orchestrator - connects all the pieces together
// EXACT flow logic from your working system

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useServices } from './useServices'
import { useAvailability } from './useAvailability'
import { useBookingSubmit } from './useBookingSubmit'
import { calculatePackagePrice } from '../utils/validation'
import type { Service, TimeSlot, MeetingType, PackageOption, BookingFormData } from '../types'

export function useBookingFlow() {
  const router = useRouter()
  
  // Step management
  const [step, setStep] = useState(1)
  
  // Service selection
  const { services, loading: servicesLoading } = useServices()
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  
  // Date & time selection
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slotChecking, setSlotChecking] = useState(false)
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12, 0, 0))
  })
  
  // Availability
  const {
    slots,
    groupedSlots,
    loading: slotsLoading,
    error: slotsError,
    fetchAvailableSlots,
    checkSlotAvailability,
    resetSlots
  } = useAvailability()
  
  // Booking options
  const [packageOption, setPackageOption] = useState<PackageOption>('single')
  const [meetingType, setMeetingType] = useState<MeetingType>('virtual')
  const [clientAddress, setClientAddress] = useState('')
  
  // Form data
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    goals: ''
  })
  
  // Error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Booking submission
  const { submitBooking, loading: submitting } = useBookingSubmit()

  // Fetch slots when service or month changes
  useEffect(() => {
    if (selectedService && step === 2) {
      fetchAvailableSlots(
        selectedService.id,
        currentMonth.getUTCFullYear(),
        currentMonth.getUTCMonth() + 1
      )
    }
  }, [selectedService, step, currentMonth, fetchAvailableSlots])

  // Reset address when meeting type changes
  useEffect(() => {
    if (meetingType !== 'coach_travels') {
      setClientAddress('')
    }
  }, [meetingType])

  // Combine errors
  useEffect(() => {
    if (slotsError) {
      setErrorMessage(slotsError)
    }
  }, [slotsError])

  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service)
    resetSlots()
    setStep(2)
    setSelectedSlot(null)
    setSelectedDate(null)
    setErrorMessage(null)
  }, [resetSlots])

  const handleSlotSelect = useCallback(async (slot: TimeSlot) => {
    setErrorMessage(null)
    
    if (slot.isBlocked || !slot.isAvailable) {
      setErrorMessage('This time slot is no longer available. Please select another time.')
      return false
    }
    
    setSlotChecking(true)
    const result = await checkSlotAvailability(slot.id)
    setSlotChecking(false)
    
    if (!result.available) {
      setErrorMessage(result.reason || 'This time slot was just taken. Please select another.')
      if (selectedService) {
        fetchAvailableSlots(
          selectedService.id,
          currentMonth.getUTCFullYear(),
          currentMonth.getUTCMonth() + 1
        )
      }
      return false
    }
    
    setSelectedSlot(slot)
    setStep(3)
    return true
  }, [checkSlotAvailability, selectedService, currentMonth, fetchAvailableSlots])

  const calculateSessionAmount = useCallback(() => {
    if (!selectedService) return 0
    
    if (packageOption === 'package' && selectedService.hasPackage) {
      return calculatePackagePrice(
        Number(selectedService.price),
        selectedService.packageSessions || 3,
        Number(selectedService.packageDiscount) || 0
      )
    }
    
    return Number(selectedService.price)
  }, [selectedService, packageOption])

  const calculateTotal = useCallback(() => {
    return calculateSessionAmount()
  }, [calculateSessionAmount])

  const getLocationString = useCallback(() => {
    if (meetingType === 'coach_travels') return clientAddress
    if (meetingType === 'client_travels') return "Client will travel to coach's location"
    return "Virtual session"
  }, [meetingType, clientAddress])

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !selectedSlot) return
    
    setErrorMessage(null)
    
    // Final availability check
    const finalCheck = await checkSlotAvailability(selectedSlot.id)
    if (!finalCheck.available) {
      setErrorMessage(finalCheck.reason || 'This time slot was just booked. Please go back and choose another time.')
      return
    }
    
    const sessionAmount = calculateSessionAmount()
    
    const bookingData = {
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
      numberOfSessions: packageOption === 'package' 
        ? (selectedService.packageSessions || 1) 
        : 1,
      sessionType: packageOption === 'package' && selectedService.packageSessions
        ? `package_${selectedService.packageSessions}`
        : 'single',
      meetingType,
      sessionAmount,
      location: getLocationString(),
    }
    
    const booking = await submitBooking(bookingData)
    
    if (booking) {
      router.push(`/book/pay/${booking.id}`)
    }
  }, [
    selectedService,
    selectedSlot,
    formData,
    packageOption,
    meetingType,
    calculateTotal,
    calculateSessionAmount,
    getLocationString,
    checkSlotAvailability,
    submitBooking,
    router
  ])

  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setUTCMonth(prev.getUTCMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }, [])

  const handleToday = useCallback(() => {
    const now = new Date()
    setCurrentMonth(new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1, 12, 0, 0
    )))
  }, [])

  return {
    // State
    step,
    setStep,
    services,
    servicesLoading,
    selectedService,
    selectedSlot,
    setSelectedSlot,
    selectedDate,
    setSelectedDate,
    slots,
    groupedSlots,
    slotsLoading,
    slotChecking,
    currentMonth,
    packageOption,
    setPackageOption,
    meetingType,
    setMeetingType,
    clientAddress,
    setClientAddress,
    formData,
    setFormData,
    errorMessage,
    setErrorMessage,
    loading: servicesLoading || slotsLoading || submitting,
    
    // Actions
    handleServiceSelect,
    handleSlotSelect,
    handleFormSubmit,
    handleMonthChange,
    handleToday,
    calculateTotal,
  }
}