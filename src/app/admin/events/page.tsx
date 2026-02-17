'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Upload helper (same pattern as books) ───────────────────────────────────
async function uploadToSupabase(
  file: File,
  bucket: string,
  folder: string,
  prefix: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${prefix}-${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}

// ── Component ────────────────────────────────────────────────────────────────
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

  // Upload states
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  const emptyForm = {
    title: '', description: '',
    eventDate: '', eventTime: '', endDate: '', endTime: '',
    location: '', venue: '', address: '',
    isVirtual: false, meetingLink: '',
    category: 'workshop', capacity: '50', ticketPrice: '',
    posterImageUrl: '', galleryImages: [] as string[],
    status: 'UPCOMING', isFeatured: false,
  }

  const [formData, setFormData] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const categories = [
    { value: 'workshop',    label: 'Workshop' },
    { value: 'seminar',     label: 'Seminar' },
    { value: 'retreat',     label: 'Retreat' },
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'conference',  label: 'Conference' },
    { value: 'webinar',     label: 'Webinar' },
    { value: 'training',    label: 'Training' },
  ]

  const statuses = [
    { value: 'UPCOMING',  label: 'Upcoming' },
    { value: 'ONGOING',   label: 'Ongoing' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  const [stats, setStats] = useState({
    total: 0, upcoming: 0, ongoing: 0, completed: 0,
    cancelled: 0, featured: 0, virtual: 0,
    totalTicketsSold: 0, totalRevenue: 0,
  })

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => { fetchEvents() }, [])

  useEffect(() => {
    if (selectedEvent && isFormOpen) {
      setFormData({
        title:          selectedEvent.title,
        description:    selectedEvent.description,
        eventDate:      selectedEvent.eventDate.split('T')[0],
        eventTime:      selectedEvent.eventTime,
        endDate:        selectedEvent.endDate ? selectedEvent.endDate.split('T')[0] : '',
        endTime:        selectedEvent.endTime || '',
        location:       selectedEvent.location,
        venue:          selectedEvent.venue || '',
        address:        selectedEvent.address || '',
        isVirtual:      selectedEvent.isVirtual,
        meetingLink:    selectedEvent.meetingLink || '',
        category:       selectedEvent.category,
        capacity:       selectedEvent.capacity.toString(),
        ticketPrice:    selectedEvent.ticketPrice.toString(),
        posterImageUrl: selectedEvent.posterImageUrl || '',
        galleryImages:  selectedEvent.galleryImages || [],
        status:         selectedEvent.status,
        isFeatured:     selectedEvent.isFeatured,
      })
    }
  }, [selectedEvent, isFormOpen])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      let url = '/api/events'
      const params = []
      if (statusFilter   !== 'all') params.push(`status=${statusFilter}`)
      if (categoryFilter !== 'all') params.push(`category=${categoryFilter}`)
      if (featuredFilter !== 'all') params.push(`featured=${featuredFilter}`)
      if (params.length) url += `?${params.join('&')}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch events')
      const data = await res.json()
      setEvents(data)
      calculateStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Event[]) => {
    setStats({
      total:            data.length,
      upcoming:         data.filter(e => e.status === 'UPCOMING').length,
      ongoing:          data.filter(e => e.status === 'ONGOING').length,
      completed:        data.filter(e => e.status === 'COMPLETED').length,
      cancelled:        data.filter(e => e.status === 'CANCELLED').length,
      featured:         data.filter(e => e.isFeatured).length,
      virtual:          data.filter(e => e.isVirtual).length,
      totalTicketsSold: data.reduce((s, e) => s + e.ticketsSold, 0),
      totalRevenue:     data.reduce((s, e) => s + parseFloat(e.ticketPrice?.toString() || '0') * e.ticketsSold, 0),
    })
  }

  // ── Upload handlers ────────────────────────────────────────────────────────
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPoster(true)
    setUploadMsg('Uploading poster…')
    try {
      const url = await uploadToSupabase(
        file, 'event-images', 'posters',
        selectedEvent?.id || 'new'
      )
      setFormData(prev => ({ ...prev, posterImageUrl: url }))
      setUploadMsg('✓ Poster uploaded!')
    } catch {
      setUploadMsg('✗ Poster upload failed')
    } finally {
      setUploadingPoster(false)
      setTimeout(() => setUploadMsg(''), 3000)
      e.target.value = ''
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingGallery(true)
    setUploadMsg(`Uploading ${files.length} image(s)…`)
    try {
      const urls = await Promise.all(
        files.map(f =>
          uploadToSupabase(f, 'event-images', 'gallery', selectedEvent?.id || 'new')
        )
      )
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...urls],
      }))
      setUploadMsg(`✓ ${files.length} image(s) uploaded!`)
    } catch {
      setUploadMsg('✗ Gallery upload failed')
    } finally {
      setUploadingGallery(false)
      setTimeout(() => setUploadMsg(''), 3000)
      e.target.value = ''
    }
  }

  const removeGalleryImage = (idx: number) =>
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== idx),
    }))

  // ── Form helpers ───────────────────────────────────────────────────────────
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!formData.title.trim())                                        e.title = 'Title is required'
    if (!formData.description.trim())                                  e.description = 'Description is required'
    if (!formData.eventDate)                                           e.eventDate = 'Event date is required'
    if (!formData.eventTime)                                           e.eventTime = 'Event time is required'
    if (!formData.location.trim())                                     e.location = 'Location is required'
    if (!formData.capacity || parseInt(formData.capacity) <= 0)        e.capacity = 'Valid capacity is required'
    if (formData.ticketPrice === '' || parseFloat(formData.ticketPrice) < 0) e.ticketPrice = 'Valid ticket price is required'
    return e
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      const url    = selectedEvent ? `/api/events/${selectedEvent.id}` : '/api/events'
      const method = selectedEvent ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity:      parseInt(formData.capacity),
          ticketPrice:   parseFloat(formData.ticketPrice),
          galleryImages: formData.galleryImages.filter(img => img.trim()),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save event')
      fetchEvents()
      handleFormClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditEvent   = (event: Event) => { setSelectedEvent(event); setIsFormOpen(true) }
  const handleViewDetails = (event: Event) => { setSelectedEvent(event); setIsDetailsOpen(true) }

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Delete this event? All associated tickets will also be deleted.')) return
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete event')
      fetchEvents()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false); setIsDetailsOpen(false)
    setSelectedEvent(null); setSubmitting(false)
    setFormData(emptyForm); setFormErrors({})
  }

  // ── Formatting helpers ─────────────────────────────────────────────────────
  const formatCurrency = (amount: any) => {
    try {
      const n = typeof amount === 'object' && amount !== null
        ? parseFloat(amount.toString()) : parseFloat(String(amount ?? 0))
      return `R ${isNaN(n) ? '0.00' : n.toFixed(2)}`
    } catch { return 'R 0.00' }
  }

  const statusBadge = (s: string) => ({
    UPCOMING: 'bg-blue-100 text-blue-800', ONGOING: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800', CANCELLED: 'bg-red-100 text-red-800',
  }[s] ?? 'bg-gray-100 text-gray-800')

  const categoryBadge = (c: string) => ({
    workshop: 'bg-purple-100 text-purple-800', seminar: 'bg-indigo-100 text-indigo-800',
    retreat: 'bg-pink-100 text-pink-800',      masterclass: 'bg-yellow-100 text-yellow-800',
    conference: 'bg-teal-100 text-teal-800',   webinar: 'bg-cyan-100 text-cyan-800',
    training: 'bg-orange-100 text-orange-800',
  }[c] ?? 'bg-gray-100 text-gray-800')

  const getCategoryText = (v: string) => categories.find(c => c.value === v)?.label ?? v

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })

  const formatDateTime = (d: string, t: string) =>
    `${new Date(d).toLocaleDateString('en-ZA')} ${t}`

  const seatsAvailable = (e: Event) => e.capacity - e.ticketsSold
  const seatsBadge = (e: Event) => {
    const n = seatsAvailable(e)
    return n === 0 ? 'bg-red-100 text-red-800' : n <= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
  }

  const filteredEvents = events.filter(ev => {
    if (!search) return true
    const s = search.toLowerCase()
    return [ev.title, ev.description, ev.location, ev.venue ?? '', ev.category]
      .some(f => f.toLowerCase().includes(s))
  })

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-2">Manage workshops, seminars, masterclasses, and virtual events</p>
        </div>
        <button onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Event
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Events',   val: stats.total,            color: 'text-gray-900' },
          { label: 'Upcoming',       val: stats.upcoming,         color: 'text-blue-600' },
          { label: 'Tickets Sold',   val: stats.totalTicketsSold, color: 'text-green-600' },
          { label: 'Revenue',        val: formatCurrency(stats.totalRevenue), color: 'text-purple-600' },
          { label: 'Virtual Events', val: stats.virtual,          color: 'text-cyan-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm font-medium text-gray-600">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search events by title, description, location..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { val: statusFilter,   set: setStatusFilter,   opts: [{ value: 'all', label: 'All Status' }, ...statuses] },
              { val: categoryFilter, set: setCategoryFilter, opts: [{ value: 'all', label: 'All Categories' }, ...categories] },
              { val: featuredFilter, set: setFeaturedFilter, opts: [{ value: 'all', label: 'All Events' }, { value: 'true', label: 'Featured Only' }, { value: 'false', label: 'Non-Featured' }] },
            ].map((f, i) => (
              <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900">
                {f.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ))}
            <button onClick={fetchEvents}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              {events.length === 0 ? 'Start by creating your first event' : 'Try adjusting your search or filter'}
            </p>
            <button onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
              Create Your First Event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Event Details', 'Date & Location', 'Tickets & Pricing', 'Status', 'Actions'].map(h => (
                    <th key={h} className="py-4 px-6 text-left text-sm font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {event.posterImageUrl ? (
                          <div className="w-20 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={event.posterImageUrl} alt={event.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-20 h-24 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{event.title}</h4>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryBadge(event.category)}`}>
                              {getCategoryText(event.category)}
                            </span>
                            {event.isVirtual && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800">Virtual</span>}
                            {event.isFeatured && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Featured</span>}
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.description.substring(0, 100)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{formatDate(event.eventDate)}</div>
                        <div className="text-sm text-gray-600">{event.eventTime}{event.endTime && ` - ${event.endTime}`}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-gray-900 font-medium">{event.location}</div>
                        {event.venue && <div className="text-gray-600">{event.venue}</div>}
                        {event.isVirtual && event.meetingLink && <div className="text-cyan-600">Meeting Link Available</div>}
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Price:</span><span className="font-medium text-gray-900">{formatCurrency(event.ticketPrice)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600">Sold:</span><span className="font-medium text-gray-900">{event.ticketsSold} / {event.capacity}</span></div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${seatsBadge(event)}`}>
                        {seatsAvailable(event)} seats available
                      </span>
                    </td>
                    <td className="py-4 px-6 space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge(event.status)}`}>
                        {statuses.find(s => s.value === event.status)?.label ?? event.status}
                      </span>
                      {event.galleryImages.length > 0 && (
                        <div className="text-sm text-gray-600">{event.galleryImages.length} gallery images</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleViewDetails(event)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-colors">View Details</button>
                        <button onClick={() => handleEditEvent(event)}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg transition-colors">Edit</button>
                        <button onClick={() => handleDeleteEvent(event.id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 font-medium rounded-lg transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── FORM MODAL ──────────────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEvent ? 'Edit Event' : 'Create New Event'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedEvent ? 'Update your event details' : 'Add a new workshop, seminar, or masterclass'}
                </p>
              </div>
              <button onClick={handleFormClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">

              {/* Upload progress banner */}
              {uploadMsg && (
                <div className={`p-3 rounded-lg border flex items-center gap-2 text-sm font-medium
                  ${uploadMsg.startsWith('✓') ? 'bg-green-50 border-green-200 text-green-700'
                  : uploadMsg.startsWith('✗') ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                  {(uploadingPoster || uploadingGallery) && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {uploadMsg}
                </div>
              )}

              {/* Title + Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500`}
                    placeholder="Enter event title" />
                  {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500`}
                    placeholder="Describe the event..." />
                  {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Event Date *',       name: 'eventDate', type: 'date', err: formErrors.eventDate },
                  { label: 'Start Time *',        name: 'eventTime', type: 'time', err: formErrors.eventTime },
                  { label: 'End Date (Optional)', name: 'endDate',   type: 'date', err: '' },
                  { label: 'End Time (Optional)', name: 'endTime',   type: 'time', err: '' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{f.label}</label>
                    <input type={f.type} name={f.name} value={(formData as any)[f.name]} onChange={handleFormChange}
                      className={`w-full px-4 py-3 rounded-lg border ${f.err ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900`} />
                    {f.err && <p className="mt-1 text-sm text-red-600">{f.err}</p>}
                  </div>
                ))}
              </div>

              {/* Location + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input type="text" name="location" value={formData.location} onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.location ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500`}
                    placeholder="City or general location" />
                  {formErrors.location && <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900">
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Venue + Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name (Optional)</label>
                  <input type="text" name="venue" value={formData.venue} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                    placeholder="Venue name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
                  <input type="text" name="address" value={formData.address} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                    placeholder="Full address" />
                </div>
              </div>

              {/* Virtual */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <input type="checkbox" id="isVirtual" name="isVirtual"
                    checked={formData.isVirtual} onChange={handleFormChange}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 bg-white" />
                  <label htmlFor="isVirtual" className="text-sm font-medium text-gray-700">This is a virtual event</label>
                </div>
                {formData.isVirtual && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Link (Zoom/Teams/etc.)</label>
                    <input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                      placeholder="https://zoom.us/j/..." />
                  </div>
                )}
              </div>

              {/* Capacity + Price + Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleFormChange} min="1"
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.capacity ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900`} />
                  {formErrors.capacity && <p className="mt-1 text-sm text-red-600">{formErrors.capacity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ticket Price (R) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                    <input type="number" name="ticketPrice" value={formData.ticketPrice} onChange={handleFormChange}
                      min="0" step="0.01"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${formErrors.ticketPrice ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900`}
                      placeholder="0.00" />
                  </div>
                  {formErrors.ticketPrice && <p className="mt-1 text-sm text-red-600">{formErrors.ticketPrice}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select name="status" value={formData.status} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900">
                    {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* ── POSTER IMAGE ─────────────────────────────────────────────── */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <label className="block text-sm font-medium text-gray-700">Event Poster</label>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Upload from device:</p>
                  <input type="file" accept="image/*" onChange={handlePosterUpload}
                    disabled={uploadingPoster || uploadingGallery}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:text-sm file:font-medium file:bg-gray-900 file:text-white
                      hover:file:bg-black disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>

                {formData.posterImageUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
                    <div className="relative w-40">
                      <img src={formData.posterImageUrl} alt="Poster preview"
                        className="w-full h-auto object-cover rounded-lg border-2 border-gray-200" />
                      <button type="button"
                        onClick={() => setFormData(prev => ({ ...prev, posterImageUrl: '' }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                        ×
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Or paste a URL:</p>
                  <input type="url" name="posterImageUrl" value={formData.posterImageUrl}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                    placeholder="https://example.com/poster.jpg" />
                </div>
              </div>

              {/* ── GALLERY IMAGES ───────────────────────────────────────────── */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Gallery Images
                  {formData.galleryImages.length > 0 &&
                    <span className="ml-2 text-xs text-gray-500">({formData.galleryImages.length} added)</span>}
                </label>

                <div>
                  <p className="text-xs text-gray-500 mb-2">Upload from device (select multiple):</p>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload}
                    disabled={uploadingPoster || uploadingGallery}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:text-sm file:font-medium file:bg-gray-900 file:text-white
                      hover:file:bg-black disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>

                {formData.galleryImages.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Gallery Preview:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {formData.galleryImages.map((url, i) => (
                        <div key={i} className="relative">
                          <img src={url} alt={`Gallery ${i + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                          <button type="button" onClick={() => removeGalleryImage(i)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Or paste URLs (comma-separated):</p>
                  <textarea
                    value={formData.galleryImages.join(', ')}
                    onChange={e => {
                      const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean)
                      setFormData(prev => ({ ...prev, galleryImages: urls }))
                    }}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
                </div>
              </div>

              {/* Featured + Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="isFeatured" name="isFeatured"
                    checked={formData.isFeatured} onChange={handleFormChange}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 bg-white" />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Feature this event on the homepage
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={handleFormClose} disabled={submitting}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting || uploadingPoster || uploadingGallery}
                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {selectedEvent ? 'Updating…' : 'Creating…'}
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

      {/* ── DETAILS MODAL ───────────────────────────────────────────────────── */}
      {isDetailsOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <p className="text-gray-600 mt-1">
                  {formatDateTime(selectedEvent.eventDate, selectedEvent.eventTime)}
                  {selectedEvent.endDate && ` to ${formatDateTime(selectedEvent.endDate, selectedEvent.endTime || '')}`}
                </p>
              </div>
              <button onClick={() => { setIsDetailsOpen(false); setSelectedEvent(null) }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Poster + badges + description */}
              <div className="flex flex-col md:flex-row gap-6">
                {selectedEvent.posterImageUrl && (
                  <div className="md:w-1/3 rounded-lg overflow-hidden bg-gray-100">
                    <img src={selectedEvent.posterImageUrl} alt={selectedEvent.title} className="w-full h-auto object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryBadge(selectedEvent.category)}`}>{getCategoryText(selectedEvent.category)}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge(selectedEvent.status)}`}>{statuses.find(s => s.value === selectedEvent.status)?.label}</span>
                    {selectedEvent.isVirtual && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">Virtual Event</span>}
                    {selectedEvent.isFeatured && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Featured</span>}
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{selectedEvent.description}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(selectedEvent.eventDate)}<br />
                        {selectedEvent.eventTime}{selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium text-gray-900">
                        {selectedEvent.location}
                        {selectedEvent.venue   && <><br />{selectedEvent.venue}</>}
                        {selectedEvent.address && <><br />{selectedEvent.address}</>}
                      </p>
                      {selectedEvent.isVirtual && selectedEvent.meetingLink && (
                        <a href={selectedEvent.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="inline-block mt-2 text-cyan-600 hover:text-cyan-700 font-medium">
                          Join Virtual Meeting →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Information</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Ticket Price',    val: formatCurrency(selectedEvent.ticketPrice) },
                      { label: 'Capacity',        val: `${selectedEvent.capacity} seats` },
                      { label: 'Tickets Sold',    val: selectedEvent.ticketsSold },
                      { label: 'Available Seats', val: seatsAvailable(selectedEvent) },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between">
                        <p className="text-sm text-gray-600">{r.label}</p>
                        <p className={`font-medium ${r.label === 'Available Seats' && seatsAvailable(selectedEvent) === 0 ? 'text-red-600' : 'text-gray-900'}`}>{r.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gallery */}
              {selectedEvent.galleryImages.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Gallery Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedEvent.galleryImages.map((url, i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-gray-100">
                        <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-32 object-cover hover:opacity-90 transition-opacity" />
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
                          {['Ticket #', 'Attendee', 'Quantity', 'Amount', 'Status'].map(h => (
                            <th key={h} className="py-2 px-3 text-left text-sm font-medium text-gray-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedEvent.tickets.slice(0, 5).map(t => (
                          <tr key={t.id}>
                            <td className="py-2 px-3 text-sm text-gray-900">{t.ticketNumber}</td>
                            <td className="py-2 px-3 text-sm">
                              <div className="font-medium text-gray-900">{t.attendeeName}</div>
                              <div className="text-gray-600">{t.attendeeEmail}</div>
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-900">{t.quantity}</td>
                            <td className="py-2 px-3 text-sm font-medium text-gray-900">{formatCurrency(t.totalAmount)}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${t.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {t.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedEvent.tickets.length > 5 && (
                      <p className="mt-4 text-sm text-gray-600 text-center">
                        … and {selectedEvent.tickets.length - 5} more tickets
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button onClick={() => { setIsDetailsOpen(false); setSelectedEvent(null) }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                  Close
                </button>
                <button onClick={() => { setIsDetailsOpen(false); handleEditEvent(selectedEvent) }}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
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