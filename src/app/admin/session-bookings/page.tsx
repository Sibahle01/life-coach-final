'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Define TypeScript interfaces
interface SessionBooking {
  id: string
  bookingNumber: string
  serviceId: string
  service: {
    id: string
    name: string
    category: string
  }
  clientName: string
  clientEmail: string
  clientPhone?: string
  companyName?: string
  eventDetails?: string
  attendees: number
  bookingDate: string
  bookingTime: string
  duration: number
  format: string
  paymentStatus: string
  amountPaid: number | string
  status: string
  meetingLink?: string
  location?: string
  notes?: string
  specialRequests?: string
  reminderSent: boolean
  confirmationSent: boolean
  createdAt: string
}

interface Service {
  id: string
  name: string
  category: string
}

export default function SessionBookingsPage() {
  const [bookings, setBookings] = useState<SessionBooking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewDetails, setViewDetails] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookingsRes, servicesRes] = await Promise.all([
        fetch('/api/session-bookings'),
        fetch('/api/services')
      ])

      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings')
      if (!servicesRes.ok) throw new Error('Failed to fetch services')

      const bookingsData = await bookingsRes.json()
      const servicesData = await servicesRes.json()

      setBookings(bookingsData)
      setServices(servicesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/session-bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }

      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleSendReminder = async (id: string) => {
    try {
      const response = await fetch(`/api/session-bookings/${id}/reminder`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send reminder')
      }

      alert('Reminder sent successfully!')
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleSendConfirmation = async (id: string) => {
    try {
      const response = await fetch(`/api/session-bookings/${id}/confirmation`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send confirmation')
      }

      alert('Confirmation sent successfully!')
      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'rescheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  const formatTime = (timeString: string) => timeString

  const filteredBookings = bookings.filter(booking => {
    if (filter !== 'all' && booking.status.toLowerCase() !== filter.toLowerCase()) return false
    
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        booking.clientName.toLowerCase().includes(searchLower) ||
        booking.clientEmail.toLowerCase().includes(searchLower) ||
        booking.bookingNumber.toLowerCase().includes(searchLower) ||
        booking.service.name.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Session Bookings</h1>
          <p className="text-gray-600 mt-2">Manage coaching sessions, counselling appointments, and speaking engagements</p>
        </div>
        
        {/* UPDATED BUTTON: Removed Link, added Alert button */}
        <button
          onClick={() => alert('Bookings are created through the public website. Clients book sessions directly.')}
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2"
          title="Bookings come from public website"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View Public Booking
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

      {/* Stats Section (Omitted for brevity but kept in code) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</p>
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
                placeholder="Search by client name, email, booking number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              {bookings.length === 0 
                ? "No session bookings have been made yet" 
                : "Try adjusting your search or filter"}
            </p>
            
            {/* UPDATED EMPTY STATE BUTTON: Removed Link */}
            <button
              onClick={() => alert('Bookings are created through the public booking form. Visit the public site to test booking.')}
              className="inline-block px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              Test Public Booking
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Booking Details</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Client</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Date & Time</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Payment</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">#{booking.bookingNumber}</div>
                        <div className="text-sm text-gray-600 mt-1">{booking.service.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.format === 'virtual' ? 'Virtual' : 'In-Person'}
                          {booking.attendees > 1 && ` • ${booking.attendees} people`}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{booking.clientName}</div>
                      <div className="text-sm text-gray-600">{booking.clientEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{formatDate(booking.bookingDate)}</div>
                      <div className="text-sm text-gray-600">{formatTime(booking.bookingTime)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentBadgeColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                      <div className="text-sm text-gray-900 mt-1">
                        R {typeof booking.amountPaid === 'number' ? booking.amountPaid.toFixed(2) : parseFloat(booking.amountPaid as string).toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/admin/session-bookings/${booking.id}`}
                          className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors inline-block text-center"
                        >
                          View
                        </Link>
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-gray-300"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="RESCHEDULED">Rescheduled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal (Keeping existing logic) */}
      {viewDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button onClick={() => setViewDetails(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {/* Simplified Modal Content for display */}
              {(() => {
                const b = bookings.find(x => x.id === viewDetails)
                if(!b) return null;
                return (
                  <div className="space-y-4">
                    <p><strong>Client:</strong> {b.clientName} ({b.clientEmail})</p>
                    <p><strong>Service:</strong> {b.service.name}</p>
                    <p><strong>Date:</strong> {formatDate(b.bookingDate)} at {b.bookingTime}</p>
                    <p><strong>Format:</strong> {b.format}</p>
                    {b.notes && <p><strong>Notes:</strong> {b.notes}</p>}
                    <div className="pt-4 flex justify-end gap-2">
                      <button onClick={() => setViewDetails(null)} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
                      <button onClick={() => handleSendConfirmation(b.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Send Confirmation</button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}