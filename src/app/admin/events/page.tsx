// File: /src/app/admin/events/page.tsx
'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

// Define TypeScript interfaces
interface EventTicket {
  id: string
  ticketNumber: string
  attendeeName: string
  attendeeEmail: string
  attendeePhone?: string
  quantity: number
  totalAmount: any
  paymentStatus: string
  status: string
  createdAt: string
}

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
  ticketPrice: any
  posterImageUrl?: string
  galleryImages: string[]
  status: string
  isFeatured: boolean
  tickets: EventTicket[]
  createdAt: string
  updatedAt: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [featuredFilter, setFeaturedFilter] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Event form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    endDate: '',
    endTime: '',
    location: '',
    venue: '',
    address: '',
    isVirtual: false,
    meetingLink: '',
    category: 'workshop',
    capacity: '50',
    ticketPrice: '',
    posterImageUrl: '',
    galleryImages: [] as string[],
    status: 'UPCOMING',
    isFeatured: false
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Event categories
  const [categories] = useState([
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'retreat', label: 'Retreat' },
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'conference', label: 'Conference' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'training', label: 'Training' }
  ])

  // Event statuses
  const [statuses] = useState([
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'ONGOING', label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ])

  // Event statistics
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    featured: 0,
    virtual: 0,
    totalTicketsSold: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent && isFormOpen) {
      setFormData({
        title: selectedEvent.title,
        description: selectedEvent.description,
        eventDate: selectedEvent.eventDate.split('T')[0],
        eventTime: selectedEvent.eventTime,
        endDate: selectedEvent.endDate ? selectedEvent.endDate.split('T')[0] : '',
        endTime: selectedEvent.endTime || '',
        location: selectedEvent.location,
        venue: selectedEvent.venue || '',
        address: selectedEvent.address || '',
        isVirtual: selectedEvent.isVirtual,
        meetingLink: selectedEvent.meetingLink || '',
        category: selectedEvent.category,
        capacity: selectedEvent.capacity.toString(),
        ticketPrice: selectedEvent.ticketPrice.toString(),
        posterImageUrl: selectedEvent.posterImageUrl || '',
        galleryImages: selectedEvent.galleryImages || [],
        status: selectedEvent.status,
        isFeatured: selectedEvent.isFeatured
      })
    }
  }, [selectedEvent, isFormOpen])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      let url = '/api/events'
      const params = []
      
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`)
      if (categoryFilter !== 'all') params.push(`category=${categoryFilter}`)
      if (featuredFilter !== 'all') params.push(`featured=${featuredFilter}`)
      
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch events')
      const data = await response.json()
      setEvents(data)
      calculateStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (eventsData: Event[]) => {
    const newStats = {
      total: eventsData.length,
      upcoming: eventsData.filter(e => e.status === 'UPCOMING').length,
      ongoing: eventsData.filter(e => e.status === 'ONGOING').length,
      completed: eventsData.filter(e => e.status === 'COMPLETED').length,
      cancelled: eventsData.filter(e => e.status === 'CANCELLED').length,
      featured: eventsData.filter(e => e.isFeatured).length,
      virtual: eventsData.filter(e => e.isVirtual).length,
      totalTicketsSold: eventsData.reduce((sum, event) => sum + event.ticketsSold, 0),
      totalRevenue: eventsData.reduce((sum, event) => {
        const ticketPrice = parseFloat(event.ticketPrice?.toString() || '0')
        return sum + (ticketPrice * event.ticketsSold)
      }, 0)
    }
    setStats(newStats)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setIsFormOpen(true)
  }

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event)
    setIsDetailsOpen(true)
  }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? All associated tickets will also be deleted.')) return

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete event')
      }

      fetchEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setIsDetailsOpen(false)
    setSelectedEvent(null)
    setSubmitting(false)
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      eventTime: '',
      endDate: '',
      endTime: '',
      location: '',
      venue: '',
      address: '',
      isVirtual: false,
      meetingLink: '',
      category: 'workshop',
      capacity: '50',
      ticketPrice: '',
      posterImageUrl: '',
      galleryImages: [],
      status: 'UPCOMING',
      isFeatured: false
    })
    setFormErrors({})
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else if (name === 'galleryImages') {
      // Handle gallery images as comma-separated values
      const images = value.split(',').map(img => img.trim()).filter(img => img)
      setFormData(prev => ({
        ...prev,
        galleryImages: images
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.eventDate) errors.eventDate = 'Event date is required'
    if (!formData.eventTime) errors.eventTime = 'Event time is required'
    if (!formData.location.trim()) errors.location = 'Location is required'
    if (!formData.category) errors.category = 'Category is required'
    if (!formData.capacity || parseInt(formData.capacity) <= 0) errors.capacity = 'Valid capacity is required'
    if (!formData.ticketPrice || parseFloat(formData.ticketPrice) < 0) errors.ticketPrice = 'Valid ticket price is required'
    
    return errors
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      const url = selectedEvent ? `/api/events/${selectedEvent.id}` : '/api/events'
      const method = selectedEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          ticketPrice: parseFloat(formData.ticketPrice),
          galleryImages: formData.galleryImages.filter(img => img.trim())
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save event')
      }

      fetchEvents()
      handleFormClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: any) => {
    try {
      const num = typeof amount === 'object' && amount !== null 
        ? parseFloat(amount.toString()) 
        : typeof amount === 'string'
        ? parseFloat(amount)
        : typeof amount === 'number'
        ? amount
        : 0
      
      return `R ${isNaN(num) ? '0.00' : num.toFixed(2)}`
    } catch (error) {
      return 'R 0.00'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-100 text-blue-800'
      case 'ONGOING': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'Upcoming'
      case 'ONGOING': return 'Ongoing'
      case 'COMPLETED': return 'Completed'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
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

  const getCategoryText = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(dateString)
    const time = timeString || ''
    return `${date.toLocaleDateString('en-ZA')} ${time}`
  }

  const getSeatsAvailable = (event: Event) => {
    return event.capacity - event.ticketsSold
  }

  const getSeatsBadgeColor = (event: Event) => {
    const seatsAvailable = getSeatsAvailable(event)
    if (seatsAvailable === 0) return 'bg-red-100 text-red-800'
    if (seatsAvailable <= 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  // Filter events
  const filteredEvents = events.filter(event => {
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        event.venue?.toLowerCase().includes(searchLower) ||
        event.category.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-2">Manage workshops, seminars, masterclasses, and virtual events</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Event
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.upcoming}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalTicketsSold}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Revenue</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Virtual Events</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1">{stats.virtual}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events by title, description, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Events</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured</option>
            </select>

            <button
              onClick={fetchEvents}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid/Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {events.length === 0 
                ? "Start by creating your first event" 
                : "Try adjusting your search or filter"}
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Event Details</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Date & Location</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Tickets & Pricing</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {event.posterImageUrl ? (
                          <div className="w-20 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img 
                              src={event.posterImageUrl} 
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadgeColor(event.category)}`}>
                              {getCategoryText(event.category)}
                            </span>
                            {event.isVirtual && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800">
                                Virtual
                              </span>
                            )}
                            {event.isFeatured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {event.description.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(event.eventDate)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {event.eventTime} {event.endTime && `- ${event.endTime}`}
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">{event.location}</div>
                          {event.venue && <div className="text-gray-600">{event.venue}</div>}
                          {event.isVirtual && event.meetingLink && (
                            <div className="text-cyan-600 truncate">Meeting Link Available</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="font-medium text-gray-900">{formatCurrency(event.ticketPrice)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Sold:</span>
                          <span className="font-medium text-gray-900">{event.ticketsSold} / {event.capacity}</span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeatsBadgeColor(event)}`}>
                            {getSeatsAvailable(event)} seats available
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                        {event.galleryImages.length > 0 && (
                          <div className="text-sm text-gray-600">
                            {event.galleryImages.length} gallery images
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetails(event)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 font-medium rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {selectedEvent ? 'Update your event details' : 'Add a new workshop, seminar, or masterclass'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                    placeholder="Enter event title"
                  />
                  {formErrors.title && <p className="mt-2 text-sm text-red-600">{formErrors.title}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                    placeholder="Describe the event..."
                  />
                  {formErrors.description && <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.eventDate ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                  />
                  {formErrors.eventDate && <p className="mt-2 text-sm text-red-600">{formErrors.eventDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.eventTime ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                  />
                  {formErrors.eventTime && <p className="mt-2 text-sm text-red-600">{formErrors.eventTime}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Location and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.location ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                    placeholder="City or general location"
                  />
                  {formErrors.location && <p className="mt-2 text-sm text-red-600">{formErrors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.category ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && <p className="mt-2 text-sm text-red-600">{formErrors.category}</p>}
                </div>
              </div>

              {/* Venue Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Venue Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="Venue name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="Full address"
                  />
                </div>
              </div>

              {/* Virtual Event */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="isVirtual"
                    name="isVirtual"
                    checked={formData.isVirtual}
                    onChange={handleFormChange}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <label htmlFor="isVirtual" className="text-sm font-medium text-gray-900">
                    This is a virtual event
                  </label>
                </div>

                {formData.isVirtual && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Meeting Link (Zoom/Teams/etc.)
                    </label>
                    <input
                      type="url"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                      placeholder="https://zoom.us/j/..."
                    />
                  </div>
                )}
              </div>

              {/* Ticket Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    min="1"
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.capacity ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                    placeholder="Maximum attendees"
                  />
                  {formErrors.capacity && <p className="mt-2 text-sm text-red-600">{formErrors.capacity}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Ticket Price (R) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                    <input
                      type="number"
                      name="ticketPrice"
                      value={formData.ticketPrice}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${formErrors.ticketPrice ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.ticketPrice && <p className="mt-2 text-sm text-red-600">{formErrors.ticketPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Poster Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="posterImageUrl"
                    value={formData.posterImageUrl}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="https://example.com/poster.jpg"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended: 800x1200px, landscape orientation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Gallery Images (Optional)
                  </label>
                  <textarea
                    name="galleryImages"
                    value={formData.galleryImages.join(', ')}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="Enter image URLs separated by commas"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple image URLs with commas
                  </p>
                </div>
              </div>

              {/* Featured and Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleFormChange}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-900">
                    Feature this event on the homepage
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleFormClose}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {selectedEvent ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {selectedEvent ? 'Update Event' : 'Create Event'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {isDetailsOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEvent.title}
                </h2>
                <button
                  onClick={() => {
                    setIsDetailsOpen(false)
                    setSelectedEvent(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {formatDateTime(selectedEvent.eventDate, selectedEvent.eventTime)}
                {selectedEvent.endDate && ` to ${formatDateTime(selectedEvent.endDate, selectedEvent.endTime || '')}`}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Header with Image */}
              <div className="flex flex-col md:flex-row gap-6">
                {selectedEvent.posterImageUrl && (
                  <div className="md:w-1/3">
                    <div className="rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={selectedEvent.posterImageUrl} 
                        alt={selectedEvent.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryBadgeColor(selectedEvent.category)}`}>
                      {getCategoryText(selectedEvent.category)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedEvent.status)}`}>
                      {getStatusText(selectedEvent.status)}
                    </span>
                    {selectedEvent.isVirtual && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                        Virtual Event
                      </span>
                    )}
                    {selectedEvent.isFeatured && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedEvent.eventDate)}
                        <br />
                        {selectedEvent.eventTime} {selectedEvent.endTime && `- ${selectedEvent.endTime}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">
                        {selectedEvent.location}
                        {selectedEvent.venue && <><br />{selectedEvent.venue}</>}
                        {selectedEvent.address && <><br />{selectedEvent.address}</>}
                      </p>
                      {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                        <a 
                          href={selectedEvent.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          Join Virtual Meeting →
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Ticket Price</p>
                      <p className="font-medium text-gray-900">{formatCurrency(selectedEvent.ticketPrice)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-medium text-gray-900">{selectedEvent.capacity} seats</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Tickets Sold</p>
                      <p className="font-medium text-gray-900">{selectedEvent.ticketsSold}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-600">Available Seats</p>
                      <p className={`font-medium ${getSeatsAvailable(selectedEvent) === 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {getSeatsAvailable(selectedEvent)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              {selectedEvent.galleryImages.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Gallery Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedEvent.galleryImages.map((imageUrl, index) => (
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

              {/* Tickets */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Purchases ({selectedEvent.tickets.length})</h3>
                {selectedEvent.tickets.length === 0 ? (
                  <p className="text-gray-600">No tickets purchased yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white">
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Ticket #</th>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Attendee</th>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Quantity</th>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Amount</th>
                          <th className="py-2 px-3 text-left text-sm font-medium text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedEvent.tickets.slice(0, 5).map(ticket => (
                          <tr key={ticket.id}>
                            <td className="py-2 px-3 text-sm text-gray-900">{ticket.ticketNumber}</td>
                            <td className="py-2 px-3 text-sm">
                              <div className="font-medium text-gray-900">{ticket.attendeeName}</div>
                              <div className="text-gray-600">{ticket.attendeeEmail}</div>
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-900">{ticket.quantity}</td>
                            <td className="py-2 px-3 text-sm font-medium text-gray-900">{formatCurrency(ticket.totalAmount)}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                ticket.paymentStatus === 'PAID' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {ticket.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedEvent.tickets.length > 5 && (
                      <p className="mt-4 text-sm text-gray-600 text-center">
                        ... and {selectedEvent.tickets.length - 5} more tickets
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsOpen(false)
                    setSelectedEvent(null)
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsDetailsOpen(false)
                    handleEditEvent(selectedEvent)
                  }}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
                >
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}