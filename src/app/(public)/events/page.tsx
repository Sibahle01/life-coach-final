// File: /src/app/(public)/events/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  eventTime: string
  endDate?: string
  endTime?: string
  location: string
  venue?: string
  isVirtual: boolean
  category: string
  capacity: number
  ticketsSold: number
  ticketPrice: number
  posterImageUrl?: string
  status: string
  isFeatured: boolean
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?status=UPCOMING')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      // Only show events with available seats
      const availableEvents = data.filter((e: Event) => e.capacity - e.ticketsSold > 0)
      setEvents(availableEvents)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeatsAvailable = (event: Event) => {
    return event.capacity - event.ticketsSold
  }

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const categories = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'retreat', label: 'Retreat' },
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'conference', label: 'Conference' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'training', label: 'Training' }
  ]

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'workshop': return 'bg-purple-100 text-purple-800'
      case 'seminar': return 'bg-indigo-100 text-indigo-800'
      case 'retreat': return 'bg-pink-100 text-pink-800'
      case 'masterclass': return 'bg-yellow-100 text-yellow-800'
      case 'conference': return 'bg-teal-100 text-teal-800'
      case 'webinar': return 'bg-cyan-100 text-cyan-800'
      case 'training': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    if (search && !event.title.toLowerCase().includes(search.toLowerCase()) &&
        !event.description.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (categoryFilter !== 'all' && event.category !== categoryFilter) {
      return false
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
          <p className="text-gray-600">Join workshops, seminars, and masterclasses</p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const seatsAvailable = getSeatsAvailable(event)
            const isLowSeats = seatsAvailable <= 10
            
            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Event Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                  {event.posterImageUrl ? (
                    <img 
                      src={event.posterImageUrl} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {event.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-400 text-gray-900">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryBadgeColor(event.category)}`}>
                      {event.category}
                    </span>
                    {event.isVirtual && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-cyan-100 text-cyan-800">
                        Virtual
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Date & Location */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {formatDate(event.eventDate)} at {event.eventTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {event.venue || event.location}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Price & Availability */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(event.ticketPrice)}
                      </div>
                      <div className="text-sm text-gray-600">per person</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        isLowSeats ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {seatsAvailable} seats left
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/events/${event.id}`}
                    className="block w-full py-3 bg-gray-900 text-white text-center font-medium rounded-lg hover:bg-black transition-colors"
                  >
                    View Details & Book
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">
              {events.length === 0 
                ? 'Check back soon for upcoming events' 
                : 'Try adjusting your search or filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}