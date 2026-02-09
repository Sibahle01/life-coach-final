// File: /src/app/(public)/events/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  address?: string
  isVirtual: boolean
  meetingLink?: string
  category: string
  capacity: number
  ticketsSold: number
  ticketPrice: number
  posterImageUrl?: string
  galleryImages: string[]
  status: string
  isFeatured: boolean
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${eventId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Event not found')
          return
        }
        throw new Error('Failed to fetch event')
      }
      
      const data = await response.json()
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getSeatsAvailable = (eventData: Event) => {
    return eventData.capacity - eventData.ticketsSold
  }

  const buyNow = () => {
    if (!event) {
      alert('Event not found')
      return
    }

    const seatsAvailable = getSeatsAvailable(event)
    if (quantity > seatsAvailable) {
      alert(`Only ${seatsAvailable} seats available`)
      return
    }

    // Store event purchase data in sessionStorage (temporary, single session)
    const purchaseData = {
      eventId: event.id,
      title: event.title,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      location: event.location,
      venue: event.venue,
      isVirtual: event.isVirtual,
      meetingLink: event.meetingLink,
      price: event.ticketPrice,
      quantity: quantity,
      posterImageUrl: event.posterImageUrl
    }

    sessionStorage.setItem('event-purchase', JSON.stringify(purchaseData))
    
    // Redirect directly to checkout
    router.push('/events/checkout')
  }

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Event Not Found</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const seatsAvailable = getSeatsAvailable(event)
  const isSoldOut = seatsAvailable <= 0
  const isLowSeats = seatsAvailable <= 10

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/events" className="hover:text-gray-900 transition-colors">
              Events
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{event.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Event Image & Details */}
          <div>
            {/* Event Poster */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                {event.posterImageUrl ? (
                  <img 
                    src={event.posterImageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-center">No poster available</p>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="mt-6 flex flex-wrap gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getCategoryBadgeColor(event.category)}`}>
                  {event.category}
                </span>
                {event.isVirtual && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                    Virtual Event
                  </span>
                )}
                {event.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
                {isLowSeats && !isSoldOut && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Almost Sold Out!
                  </span>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Event Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium text-gray-900">{formatDate(event.eventDate)}</p>
                    <p className="text-gray-700">
                      {event.eventTime} {event.endTime && `- ${event.endTime}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{event.location}</p>
                    {event.venue && <p className="text-gray-700">{event.venue}</p>}
                    {event.address && <p className="text-gray-600 text-sm">{event.address}</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-medium text-gray-900">
                      {event.capacity} attendees maximum
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.ticketsSold} booked, {seatsAvailable} remaining
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            {event.galleryImages && event.galleryImages.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Gallery</h3>
                <div className="grid grid-cols-2 gap-4">
                  {event.galleryImages.map((imageUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={imageUrl} 
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Booking */}
          <div>
            {/* Event Title */}
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900">
                {formatCurrency(event.ticketPrice)}
              </div>
              <p className="text-gray-600 mt-1">per person (incl. VAT)</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About This Event</h3>
              <div className="prose max-w-none text-gray-700">
                {event.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Booking Widget */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Book Your Tickets</h3>

              {isSoldOut ? (
                <div className="p-6 bg-red-50 border border-red-100 rounded-lg text-center">
                  <svg className="w-12 h-12 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <h4 className="font-bold text-red-900 mb-1">Event Sold Out</h4>
                  <p className="text-sm text-red-700">All tickets have been sold</p>
                </div>
              ) : (
                <>
                  {/* Quantity Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Number of Tickets:
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(prev => Math.min(seatsAvailable, prev + 1))}
                          className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-gray-600">
                        <span className="font-medium text-lg">{formatCurrency(event.ticketPrice * quantity)}</span>
                        <span className="text-sm ml-2">total</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum {seatsAvailable} tickets available
                    </p>
                  </div>

                  {/* Action Button */}
                  <div>
                    <button
                      onClick={buyNow}
                      className="w-full py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Purchase Tickets
                    </button>
                  </div>

                  {/* Info */}
                  {event.isVirtual && (
                    <div className="mt-6 p-4 bg-cyan-50 border border-cyan-100 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-cyan-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <h4 className="font-medium text-cyan-900 mb-1">Virtual Event</h4>
                          <p className="text-sm text-cyan-700">
                            You'll receive a meeting link via email after booking
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Back Link */}
            <div className="mt-6">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:underline transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to All Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}