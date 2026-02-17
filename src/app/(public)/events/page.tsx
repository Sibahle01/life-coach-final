// File: /src/app/(public)/events/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Search, 
  Filter,
  ChevronRight,
  Video,
  Sparkles,
  AlertCircle,
  Image as ImageIcon
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
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?status=UPCOMING')
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
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
    return `R${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

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
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Events</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-light text-gray-900">Events</h1>
              <p className="text-xs text-gray-500">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 bg-gray-50 rounded-lg"
            >
              <Filter size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS - Desktop */}
        <div className="hidden lg:flex items-center gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* MOBILE FILTERS - Collapsible */}
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mb-6 p-4 bg-white border border-gray-200 rounded-lg"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                  Search
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* EVENTS COUNT - Mobile */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <p className="text-xs text-gray-500">
            {filteredEvents.length} events available
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-gray-500 hover:text-gray-900"
            >
              Clear search
            </button>
          )}
        </div>

        {/* EVENTS GRID */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={22} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No events found</h3>
            <p className="text-xs text-gray-500 mb-5">
              {events.length === 0 
                ? 'Check back soon for upcoming events' 
                : 'Try adjusting your search or filters'}
            </p>
            <button
              onClick={() => {
                setSearch('')
                setCategoryFilter('all')
              }}
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map((event, index) => {
              const seatsAvailable = getSeatsAvailable(event)
              const isLowSeats = seatsAvailable <= 10
              const isAlmostFull = seatsAvailable <= 5
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-md transition-all"
                >
                  {/* EVENT IMAGE - Restored */}
                  <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {event.posterImageUrl ? (
                      <>
                        <img 
                          src={event.posterImageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center mb-2">
                          <ImageIcon size={20} className="text-gray-500" />
                        </div>
                        <p className="text-xs text-gray-500 font-light">No poster</p>
                      </div>
                    )}
                    
                    {/* Featured Badge - Overlay on image */}
                    {event.isFeatured && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-black/80 backdrop-blur-sm text-white border border-white/20">
                          <Sparkles size={10} />
                          Featured
                        </span>
                      </div>
                    )}
                    
                    {/* Virtual Badge - Overlay on image */}
                    {event.isVirtual && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-200">
                          <Video size={10} />
                          Virtual
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    {/* Category */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-medium bg-gray-900 text-white uppercase tracking-wider">
                        {event.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-medium text-gray-900 mb-2 line-clamp-2 leading-snug">
                      {event.title}
                    </h3>

                    {/* Description - short */}
                    <p className="text-xs text-gray-600 font-light line-clamp-2 mb-3">
                      {event.description}
                    </p>

                    {/* Date & Location - Compact */}
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="font-light">
                          {formatDate(event.eventDate)} • {event.eventTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                        <span className="font-light truncate">
                          {event.venue || event.location}
                        </span>
                      </div>
                    </div>

                    {/* Price & Availability */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-lg font-light text-gray-900">
                          {formatCurrency(event.ticketPrice)}
                        </div>
                        <div className="text-[10px] text-gray-500">per person</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-gray-400" />
                          <span className={`text-xs font-medium ${
                            isAlmostFull ? 'text-red-600' : isLowSeats ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {seatsAvailable} left
                          </span>
                        </div>
                        {isAlmostFull && (
                          <span className="text-[9px] text-red-600 font-medium">
                            Almost full
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      href={`/events/${event.id}`}
                      className="w-full py-2.5 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Empty state for no events at all */}
        {events.length === 0 && !loading && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <AlertCircle size={14} className="text-gray-500" />
              <p className="text-xs text-gray-600">
                No upcoming events scheduled. Check back soon.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}