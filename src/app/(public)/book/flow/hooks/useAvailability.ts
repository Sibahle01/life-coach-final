// /src/app/(public)/book/flow/hooks/useAvailability.ts
// EXACT availability logic from your working system

'use client'

import { useState, useCallback } from 'react'
import type { TimeSlot, AvailabilityResponse } from '../types'
import { groupSlotsByDate } from '../utils/calendar'

export function useAvailability() {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [groupedSlots, setGroupedSlots] = useState<Record<string, TimeSlot[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAvailableSlots = useCallback(async (serviceId: string, year?: number, month?: number) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📅 Requesting slots for month:', { year, month })
      
      let url = `/api/availability/public?serviceId=${serviceId}`
      if (year && month) {
        url += `&year=${year}&month=${month}`
      }
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch availability: ${response.status}`)
      }
      
      const data: AvailabilityResponse = await response.json()
      const slotsArray = Array.isArray(data) ? data : (data.slots || [])
      const grouped = data.groupedByDate || groupSlotsByDate(slotsArray)
      
      setSlots(slotsArray)
      setGroupedSlots(grouped)
      
      console.log('📊 Slots loaded:', {
        total: slotsArray.length,
        available: slotsArray.filter(s => s.isAvailable).length,
        groupedDates: Object.keys(grouped).length
      })
      
    } catch (error) {
      console.error('❌ Error fetching slots:', error)
      setError('Failed to load available time slots. Please try again.')
      setSlots([])
      setGroupedSlots({})
    } finally {
      setLoading(false)
    }
  }, [])

  const checkSlotAvailability = useCallback(async (slotId: string): Promise<{
    available: boolean
    reason?: string
    slot?: any
  }> => {
    try {
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
    }
  }, [])

  const resetSlots = useCallback(() => {
    setSlots([])
    setGroupedSlots({})
    setError(null)
  }, [])

  return {
    slots,
    groupedSlots,
    loading,
    error,
    fetchAvailableSlots,
    checkSlotAvailability,
    resetSlots
  }
}