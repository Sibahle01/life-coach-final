// /src/app/(public)/book/flow/hooks/useBookingSubmit.ts
// EXACT booking creation from your working system

'use client'

import { useState } from 'react'

export function useBookingSubmit() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitBooking = async (bookingData: any) => {
    try {
      setLoading(true)
      setError(null)
      
      const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      const response = await fetch('/api/session-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          bookingNumber,
          termsAccepted: true,
          attendees: 1,
          amountPaid: 0,
          paymentStatus: 'PENDING',
          status: 'PENDING',
          companyName: null,
          eventDetails: null,
          meetingLink: null,
          notes: null,
          specialRequests: null,
          travelDistanceKm: null,
          travelAmount: 0,
        })
      })
      
      if (response.ok) {
        const booking = await response.json()
        return booking
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create booking. Please try again.')
        return null
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      setError('Something went wrong. Please try again.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submitBooking, loading, error }
}