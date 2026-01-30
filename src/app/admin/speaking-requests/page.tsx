// File: /src/app/admin/speaking-requests/page.tsx
'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

// Define TypeScript interfaces
interface AdminUser {
  id: string
  name?: string
  email: string
}

interface Service {
  id: string
  name: string
  category: string
  price: any
}

interface Booking {
  id: string
  bookingNumber: string
  bookingDate: string
  status: string
  service?: Service
}

interface SpeakingRequest {
  id: string
  requestNumber: string
  organization: string
  contactPerson: string
  email: string
  phone?: string
  eventName: string
  eventDate?: string
  eventType: string
  audienceSize?: number
  duration?: number
  budget?: any
  location: string
  isVirtual: boolean
  description: string
  status: string
  notes?: string
  respondedById?: string
  responseDate?: string
  responseNotes?: string
  bookingId?: string
  createdAt: string
  updatedAt: string
  respondedBy?: AdminUser
  booking?: Booking
}

export default function SpeakingRequestsPage() {
  const [requests, setRequests] = useState<SpeakingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [respondedFilter, setRespondedFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<SpeakingRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isResponseOpen, setIsResponseOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  // Response form
  const [responseForm, setResponseForm] = useState({
    status: '',
    responseNotes: '',
    convertToBooking: false
  })

  // Event types
  const [eventTypes] = useState([
    { value: 'conference', label: 'Conference' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'retreat', label: 'Retreat' },
    { value: 'corporate', label: 'Corporate Event' },
    { value: 'university', label: 'University Talk' },
    { value: 'community', label: 'Community Event' },
    { value: 'other', label: 'Other' }
  ])

  // Status types
  const [statuses] = useState([
    { value: 'PENDING', label: 'Pending Review' },
    { value: 'REVIEWED', label: 'Reviewed' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'DECLINED', label: 'Declined' },
    { value: 'FOLLOW_UP', label: 'Follow Up Needed' }
  ])

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    accepted: 0,
    declined: 0,
    followUp: 0,
    withBooking: 0,
    virtual: 0,
    inPerson: 0,
    totalBudget: 0
  })

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (selectedRequest) {
      setResponseForm({
        status: selectedRequest.status,
        responseNotes: selectedRequest.responseNotes || '',
        convertToBooking: !!selectedRequest.bookingId
      })
    }
  }, [selectedRequest])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      let url = '/api/speaking-requests'
      const params = []
      
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`)
      if (eventTypeFilter !== 'all') params.push(`eventType=${eventTypeFilter}`)
      if (respondedFilter !== 'all') params.push(`responded=${respondedFilter}`)
      
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch speaking requests')
      const data = await response.json()
      setRequests(data)
      calculateStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (requestsData: SpeakingRequest[]) => {
    const newStats = {
      total: requestsData.length,
      pending: requestsData.filter(r => r.status === 'PENDING').length,
      reviewed: requestsData.filter(r => r.status === 'REVIEWED').length,
      accepted: requestsData.filter(r => r.status === 'ACCEPTED').length,
      declined: requestsData.filter(r => r.status === 'DECLINED').length,
      followUp: requestsData.filter(r => r.status === 'FOLLOW_UP').length,
      withBooking: requestsData.filter(r => r.bookingId).length,
      virtual: requestsData.filter(r => r.isVirtual).length,
      inPerson: requestsData.filter(r => !r.isVirtual).length,
      totalBudget: requestsData.reduce((sum, request) => {
        const budget = parseFloat(request.budget?.toString() || '0')
        return sum + budget
      }, 0)
    }
    setStats(newStats)
  }

  const handleViewDetails = (request: SpeakingRequest) => {
    setSelectedRequest(request)
    setIsDetailsOpen(true)
  }

  const handleRespond = (request: SpeakingRequest) => {
    setSelectedRequest(request)
    setIsResponseOpen(true)
  }

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this speaking request? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/speaking-requests/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete request')
      }

      fetchRequests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleResponseSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedRequest) return

    setUpdating(true)
    try {
      let response
      
      if (responseForm.convertToBooking && !selectedRequest.bookingId) {
        // Convert to booking
        response = await fetch(`/api/speaking-requests/${selectedRequest.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: responseForm.status,
            responseNotes: responseForm.responseNotes
          })
        })
      } else {
        // Just update status
        response = await fetch(`/api/speaking-requests/${selectedRequest.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...selectedRequest,
            status: responseForm.status,
            responseNotes: responseForm.responseNotes,
            responseDate: new Date().toISOString()
          })
        })
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update request')
      }

      fetchRequests()
      setIsResponseOpen(false)
      setSelectedRequest(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUpdating(false)
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
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REVIEWED': return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'DECLINED': return 'bg-red-100 text-red-800'
      case 'FOLLOW_UP': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statusObj = statuses.find(s => s.value === status)
    return statusObj ? statusObj.label : status
  }

  const getEventTypeText = (eventType: string) => {
    const eventTypeObj = eventTypes.find(e => e.value === eventType)
    return eventTypeObj ? eventTypeObj.label : eventType
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    return date.toLocaleString('en-ZA')
  }

  const getEventTypeBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'conference': return 'bg-purple-100 text-purple-800'
      case 'workshop': return 'bg-indigo-100 text-indigo-800'
      case 'seminar': return 'bg-blue-100 text-blue-800'
      case 'retreat': return 'bg-teal-100 text-teal-800'
      case 'corporate': return 'bg-cyan-100 text-cyan-800'
      case 'university': return 'bg-emerald-100 text-emerald-800'
      case 'community': return 'bg-amber-100 text-amber-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAudienceSizeText = (size?: number) => {
    if (!size) return 'Not specified'
    if (size < 50) return `Small (${size})`
    if (size < 200) return `Medium (${size})`
    return `Large (${size})`
  }

  // Filter requests
  const filteredRequests = requests.filter(request => {
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        request.organization.toLowerCase().includes(searchLower) ||
        request.contactPerson.toLowerCase().includes(searchLower) ||
        request.email.toLowerCase().includes(searchLower) ||
        request.eventName.toLowerCase().includes(searchLower) ||
        request.location.toLowerCase().includes(searchLower)
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
          <h1 className="text-3xl font-bold text-gray-900">Speaking Requests</h1>
          <p className="text-gray-600 mt-2">Manage invitations to speak at events, conferences, and workshops</p>
        </div>
        <button
          onClick={fetchRequests}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
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
          <p className="text-sm font-medium text-gray-600">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Accepted</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Converted to Bookings</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.withBooking}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Budget</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{formatCurrency(stats.totalBudget)}</p>
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
                placeholder="Search by organization, contact person, event name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
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
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Event Types</option>
              {eventTypes.map(eventType => (
                <option key={eventType.value} value={eventType.value}>
                  {eventType.label}
                </option>
              ))}
            </select>

            <select
              value={respondedFilter}
              onChange={(e) => setRespondedFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Responses</option>
              <option value="yes">Responded</option>
              <option value="no">Not Responded</option>
            </select>

            <button
              onClick={fetchRequests}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Status Quick Stats */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['PENDING', 'REVIEWED', 'ACCEPTED', 'DECLINED', 'FOLLOW_UP'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {getStatusText(status)} ({stats[status.toLowerCase().replace('_', '') as keyof typeof stats] || 0})
          </button>
        ))}
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All Requests
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No speaking requests found</h3>
            <p className="text-gray-600 mb-6">
              {requests.length === 0 
                ? "No speaking invitations have been received yet" 
                : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Request Details</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Event Information</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Budget & Logistics</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">#{request.requestNumber}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                        <div className="font-medium text-gray-900">{request.organization}</div>
                        <div className="text-sm text-gray-600">
                          <div>{request.contactPerson}</div>
                          <div>{request.email}</div>
                          {request.phone && <div>{request.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-900">{request.eventName}</div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getEventTypeBadgeColor(request.eventType)}`}>
                            {getEventTypeText(request.eventType)}
                          </span>
                          {request.isVirtual ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800">
                              Virtual
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              In-Person
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{request.location}</div>
                          {request.eventDate && (
                            <div>{formatDate(request.eventDate)}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Budget:</span>
                          <span className="font-medium text-gray-900">
                            {request.budget ? formatCurrency(request.budget) : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Audience:</span>
                          <span className="font-medium text-gray-900">
                            {getAudienceSizeText(request.audienceSize)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">
                            {request.duration ? `${request.duration} min` : 'Flexible'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                        {request.booking && (
                          <div className="text-sm">
                            <span className="text-gray-600">Booking: </span>
                            <a 
                              href={`/admin/session-bookings`}
                              className="font-medium text-blue-600 hover:text-blue-700"
                            >
                              #{request.booking.bookingNumber}
                            </a>
                          </div>
                        )}
                        {request.respondedBy && (
                          <div className="text-sm text-gray-600">
                            Responded by: {request.respondedBy.name || request.respondedBy.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                        {request.status !== 'ACCEPTED' && request.status !== 'DECLINED' && (
                          <button
                            onClick={() => handleRespond(request)}
                            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg transition-colors"
                          >
                            Respond
                          </button>
                        )}
                        {request.booking && (
                          <a
                            href={`/admin/session-bookings`}
                            className="px-3 py-1.5 text-sm text-center bg-green-100 text-green-700 hover:bg-green-200 font-medium rounded-lg transition-colors"
                          >
                            View Booking
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
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

      {/* Request Details Modal */}
      {isDetailsOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Speaking Request #{selectedRequest.requestNumber}
                </h2>
                <button
                  onClick={() => {
                    setIsDetailsOpen(false)
                    setSelectedRequest(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Received on {formatDateTime(selectedRequest.createdAt)}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-medium text-gray-900">{selectedRequest.organization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-medium text-gray-900">{selectedRequest.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{selectedRequest.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Event Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Event Name</p>
                    <p className="font-medium text-gray-900">{selectedRequest.eventName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Event Type</p>
                    <p className="font-medium text-gray-900">{getEventTypeText(selectedRequest.eventType)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedRequest.eventDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{selectedRequest.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Format</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.isVirtual ? 'Virtual Event' : 'In-Person Event'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Audience Size</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.audienceSize ? `${selectedRequest.audienceSize} people` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.duration ? `${selectedRequest.duration} minutes` : 'Flexible'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-medium text-gray-900">
                      {selectedRequest.budget ? formatCurrency(selectedRequest.budget) : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{selectedRequest.description}</p>
              </div>

              {/* Response Information */}
              {(selectedRequest.respondedBy || selectedRequest.responseNotes || selectedRequest.booking) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Response Information</h3>
                  {selectedRequest.respondedBy && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Responded By</p>
                      <p className="font-medium text-gray-900">
                        {selectedRequest.respondedBy.name || selectedRequest.respondedBy.email}
                        {selectedRequest.responseDate && (
                          <span className="text-gray-600 text-sm ml-2">
                            on {formatDateTime(selectedRequest.responseDate)}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                  {selectedRequest.responseNotes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Response Notes</p>
                      <p className="text-gray-700 whitespace-pre-line">{selectedRequest.responseNotes}</p>
                    </div>
                  )}
                  {selectedRequest.booking && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Linked Booking</p>
                          <p className="font-medium text-gray-900">
                            #{selectedRequest.booking.bookingNumber} - {formatDate(selectedRequest.booking.bookingDate)}
                          </p>
                          {selectedRequest.booking.service && (
                            <p className="text-sm text-gray-600">
                              {selectedRequest.booking.service.name} - {formatCurrency(selectedRequest.booking.service.price)}
                            </p>
                          )}
                        </div>
                        <a
                          href={`/admin/session-bookings`}
                          className="px-4 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg transition-colors"
                        >
                          View Booking
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                {selectedRequest.booking ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailsOpen(false)
                        setSelectedRequest(null)
                      }}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <a
                      href={`/admin/session-bookings`}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Booking
                    </a>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailsOpen(false)
                        handleDeleteRequest(selectedRequest.id)
                      }}
                      className="px-6 py-3 text-red-700 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors"
                    >
                      Delete Request
                    </button>
                    <button
                      onClick={() => {
                        setIsDetailsOpen(false)
                        handleRespond(selectedRequest)
                      }}
                      className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
                    >
                      Respond to Request
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {isResponseOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Respond to Request #{selectedRequest.requestNumber}
                </h2>
                <button
                  onClick={() => {
                    setIsResponseOpen(false)
                    setSelectedRequest(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {selectedRequest.organization} - {selectedRequest.eventName}
              </p>
            </div>

            <form onSubmit={handleResponseSubmit} className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Status *
                </label>
                <select
                  value={responseForm.status}
                  onChange={(e) => setResponseForm({...responseForm, status: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Convert to Booking */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="convertToBooking"
                    checked={responseForm.convertToBooking}
                    onChange={(e) => setResponseForm({...responseForm, convertToBooking: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    disabled={!!selectedRequest.bookingId}
                  />
                  <label htmlFor="convertToBooking" className="text-sm font-medium text-gray-900">
                    Convert to a booking session
                    {selectedRequest.bookingId && (
                      <span className="ml-2 text-gray-500">(Already converted to booking #{selectedRequest.booking?.bookingNumber})</span>
                    )}
                  </label>
                </div>
                
                {responseForm.convertToBooking && !selectedRequest.bookingId && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      This will create a new booking in Session Bookings using the "Invite to Speak" service.
                      The booking will be linked to this speaking request for tracking.
                    </p>
                  </div>
                )}
              </div>

              {/* Response Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Response Notes
                </label>
                <textarea
                  value={responseForm.responseNotes}
                  onChange={(e) => setResponseForm({...responseForm, responseNotes: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  placeholder="Add your response notes, next steps, or any special conditions..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsResponseOpen(false)
                    setSelectedRequest(null)
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {responseForm.convertToBooking ? 'Convert & Update' : 'Update Request'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}