// /src/app/(public)/book/flow/hooks/useServices.ts
// EXACT service fetching from your working system

'use client'

import { useState, useEffect } from 'react'
import type { Service } from '../types'

export function useServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.filter((s: Service) => s.isActive))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  return { services, loading, error }
}