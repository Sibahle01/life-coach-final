// File: /src/app/(public)/events/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Video, 
  Sparkles, 
  ChevronLeft, 
  CreditCard,
  AlertCircle,
  Image as ImageIcon,
  Minus,
  Plus,
  Ticket
} from 'lucide-react'

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
  const [activeImage, setActiveImage] = useState<string | null>(null)

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
      setActiveImage(data.posterImageUrl || null)
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
    if (!event) return

    const seatsAvailable = getSeatsAvailable(event)
    if (quantity > seatsAvailable) {
      alert(`Only ${seatsAvailable} seats available`)
      return
    }

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
    router.push('/events/checkout')
  }

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={22} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Event Not Found</h3>
            <p className="text-xs text-gray-500 mb-5">{error || 'This event may have been removed'}</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Back to Events</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const seatsAvailable = getSeatsAvailable(event)
  const isSoldOut = seatsAvailable <= 0
  const isLowSeats = seatsAvailable <= 10
  const isAlmostFull = seatsAvailable <= 5

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
        
        {/* COMPACT HEADER */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/events" className="hover:text-gray-900">Events</Link>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[200px]">{event.title}</span>
          </div>
          
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={14} />
            <span>Back to Events</span>
          </Link>
        </div>

        {/* MOBILE: Sticky Booking Bar - Shows at top on mobile */}
        {!isSoldOut && (
          <div className="lg:hidden sticky top-[72px] z-10 -mx-4 px-4 pt-2 pb-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500">Price</span>
                <div className="text-xl font-light text-gray-900">{formatCurrency(event.ticketPrice)}</div>
              </div>
              
              <button
                onClick={buyNow}
                className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Ticket size={16} />
                <span>Book Now</span>
              </button>
            </div>
            
            {/* Availability indicator */}
            <div className="flex items-center gap-2 mt-1.5">
              <Users size={12} className="text-gray-400" />
              <span className={`text-[10px] ${
                isAlmostFull ? 'text-red-600' : isLowSeats ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {seatsAvailable} {seatsAvailable === 1 ? 'seat' : 'seats'} left
              </span>
              {event.isVirtual && (
                <>
                  <span className="text-gray-300">•</span>
                  <Video size={12} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500">Virtual</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* LEFT COLUMN - Images & Details */}
          <div className="space-y-5">
            
            {/* Main Event Poster */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {activeImage ? (
                  <>
                    <img 
                      src={activeImage} 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-2">
                      <ImageIcon size={24} className="text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500 font-light">No poster available</p>
                  </div>
                )}
                
                {/* Badges - Overlay on image */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-black/80 backdrop-blur-sm text-white border border-white/20 uppercase tracking-wider">
                    {event.category}
                  </span>
                  {event.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-black/80 backdrop-blur-sm text-white border border-white/20">
                      <Sparkles size={10} />
                      Featured
                    </span>
                  )}
                </div>
                
                {/* Sold Out Badge - Overlay */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery - if exists */}
              {event.galleryImages && event.galleryImages.length > 0 && (
                <div className="p-3 border-t border-gray-200">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {[event.posterImageUrl, ...event.galleryImages].filter(Boolean).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img!)}
                        className={`
                          flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all
                          ${activeImage === img ? 'border-black' : 'border-transparent hover:border-gray-300'}
                        `}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Event Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <h2 className="text-sm font-medium text-gray-900 mb-4 pb-3 border-b border-gray-200 uppercase tracking-wide">
                Event Details
              </h2>
              
              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Date & Time</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(event.eventDate)}</p>
                    <p className="text-xs text-gray-700 mt-0.5">
                      {event.eventTime} {event.endTime && `- ${event.endTime}`}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Location</p>
                    <p className="text-sm font-medium text-gray-900">{event.location}</p>
                    {event.venue && <p className="text-xs text-gray-700 mt-0.5">{event.venue}</p>}
                    {event.address && <p className="text-xs text-gray-500 mt-0.5">{event.address}</p>}
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users size={14} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Capacity</p>
                    <p className="text-sm font-medium text-gray-900">{event.capacity} attendees</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-24">
                        <div 
                          className="h-full bg-gray-900 rounded-full"
                          style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-600">
                        {event.ticketsSold} booked
                      </span>
                    </div>
                  </div>
                </div>

                {/* Virtual Event Info */}
                {event.isVirtual && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Video size={14} className="text-gray-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 mb-0.5">Virtual Event</p>
                        <p className="text-[10px] text-gray-600">
                          Meeting link will be emailed after booking
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN - Event Info & Booking */}
          <div className="space-y-5">
            
            {/* Title & Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <h1 className="text-2xl lg:text-3xl font-light text-gray-900 mb-4 leading-tight">
                {event.title}
              </h1>
              
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div>
                  <span className="text-xs text-gray-500">Price</span>
                  <div className="text-2xl lg:text-3xl font-light text-gray-900">
                    {formatCurrency(event.ticketPrice)}
                  </div>
                  <span className="text-[10px] text-gray-500">per person (incl. VAT)</span>
                </div>
                
                {/* Availability badge */}
                {!isSoldOut && (
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium ${
                      isAlmostFull ? 'bg-red-50 text-red-700 border border-red-200' :
                      isLowSeats ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {seatsAvailable} {seatsAvailable === 1 ? 'seat' : 'seats'} left
                    </span>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div>
                <h2 className="text-xs font-medium text-gray-900 uppercase tracking-wide mb-3">
                  About This Event
                </h2>
                <div className="text-sm text-gray-700 font-light leading-relaxed space-y-3">
                  {event.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Booking Card - Desktop only (mobile has sticky bar) */}
            {!isSoldOut && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="hidden lg:block bg-white border border-gray-200 rounded-lg p-5 sticky top-28"
              >
                <h2 className="text-sm font-medium text-gray-900 mb-4 pb-3 border-b border-gray-200 uppercase tracking-wide">
                  Book Tickets
                </h2>
                
                {/* Quantity Selection */}
                <div className="mb-5">
                  <label className="block text-xs text-gray-600 mb-2">
                    Number of tickets:
                  </label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-medium text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(prev => Math.min(seatsAvailable, prev + 1))}
                        disabled={quantity >= seatsAvailable}
                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Total</span>
                      <div className="text-lg font-light text-gray-900">
                        {formatCurrency(event.ticketPrice * quantity)}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    Max {seatsAvailable} tickets per order
                  </p>
                </div>

                {/* Book Button */}
                <button
                  onClick={buyNow}
                  className="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Ticket size={16} />
                  <span>Book Now</span>
                </button>

                {/* Secure checkout note */}
                <p className="text-[10px] text-gray-500 text-center mt-3">
                  Secure checkout • Instant confirmation
                </p>
              </motion.div>
            )}

            {/* Sold Out Message - Desktop */}
            {isSoldOut && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={20} className="text-gray-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Event Sold Out</h3>
                <p className="text-xs text-gray-500 mb-4">
                  All tickets have been sold for this event
                </p>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft size={14} />
                  <span>Browse other events</span>
                </Link>
              </motion.div>
            )}

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-lg p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={14} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-1">Need help?</p>
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                    For questions about this event, please contact us at events@sifisonkabinde.com
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}