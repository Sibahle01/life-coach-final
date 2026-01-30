'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, Clock, User, Mail, Phone, MapPin, Car, Video, Home, 
  Target, DollarSign, Navigation, ArrowLeft, Edit, Save, Loader 
} from 'lucide-react'

interface SessionBooking {
  id: string
  bookingNumber: string
  serviceId: string
  service: {
    id: string
    name: string
    price: any
    duration: number
    format: string
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
  meetingType: string
  location?: string
  goals?: string
  sessionAmount?: any
  travelDistanceKm?: any
  travelAmount?: any
  totalAmount: any
  paymentStatus: string
  amountPaid: any
  status: string
  meetingLink?: string
  notes?: string
  specialRequests?: string
  reminderSent: boolean
  confirmationSent: boolean
  createdAt: string
  updatedAt: string
}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<SessionBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [showTravelCalculator, setShowTravelCalculator] = useState(false)
  const [travelDistance, setTravelDistance] = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  
  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])
  
  const fetchBooking = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/session-bookings/${bookingId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch booking')
      }
      
      const data = await response.json()
      setBooking(data)
      setNotes(data.notes || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdateNotes = async () => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/session-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update notes')
      }
      
      const updatedBooking = await response.json()
      setBooking(updatedBooking)
      setEditingNotes(false)
      alert('Notes updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUpdating(false)
    }
  }
  
  const handleCalculateTravelFee = async () => {
    if (!travelDistance || parseFloat(travelDistance) <= 0) {
      alert('Please enter a valid travel distance')
      return
    }
    
    try {
      setUpdating(true)
      const response = await fetch(`/api/session-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travelDistanceKm: parseFloat(travelDistance) })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to calculate travel fee')
      }
      
      const updatedBooking = await response.json()
      setBooking(updatedBooking)
      setShowTravelCalculator(false)
      setTravelDistance('')
      alert(`Travel fee calculated: R${parseFloat(updatedBooking.travelAmount).toFixed(2)} for ${travelDistance}km`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUpdating(false)
    }
  }
  
  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/session-bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }
      
      const updatedBooking = await response.json()
      setBooking(updatedBooking)
      alert(`Status updated to ${newStatus}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUpdating(false)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  const formatCurrency = (amount: any) => {
    if (!amount) return 'R 0.00'
    const num = typeof amount === 'object' ? parseFloat(amount.toString()) : parseFloat(amount)
    return `R ${isNaN(num) ? '0.00' : num.toFixed(2)}`
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }
  
  if (error || !booking) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error || 'Booking not found'}</span>
          </div>
        </div>
        <Link href="/admin/session-bookings" className="text-blue-600 hover:underline">
          ← Back to bookings
        </Link>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/session-bookings"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.bookingNumber}</h1>
            <p className="text-gray-600 mt-2">
              {booking.service.name} • {formatDate(booking.bookingDate)} • {booking.bookingTime}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={booking.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updating}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
        </div>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client & Booking Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="text-gray-900 font-medium">{booking.clientName}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <div className="text-gray-900 font-medium">{booking.clientEmail}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                <div className="text-gray-900 font-medium">{booking.clientPhone || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                <div className="text-gray-900 font-medium">{booking.attendees} person(s)</div>
              </div>
            </div>
          </div>
          
          {/* 🔥 CRITICAL: Client Goals Card */}
          {booking.goals && (
            <div className="bg-white rounded-xl border border-blue-200 p-6 border-l-4 border-l-blue-500">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                What the Client Wants to Achieve
              </h2>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-gray-800 whitespace-pre-line">{booking.goals}</p>
              </div>
              
              <p className="text-sm text-gray-600 mt-3">
                This information was provided by the client during booking. Use it to prepare for the session.
              </p>
            </div>
          )}
          
          {/* 🔥 CRITICAL: Travel Information Card */}
          {booking.meetingType === 'coach_travels' && (
            <div className="bg-white rounded-xl border border-yellow-200 p-6 border-l-4 border-l-yellow-500">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5 text-yellow-600" />
                Travel Information
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Client Address
                </label>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <p className="text-gray-800 font-medium">{booking.location || 'No address provided'}</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  💡 Use Google Maps to calculate distance from coach's location to this address.
                </p>
              </div>
              
              {/* Travel Calculator */}
              {!booking.travelDistanceKm ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Travel Fee Calculator</h3>
                  
                  {!showTravelCalculator ? (
                    <button
                      onClick={() => setShowTravelCalculator(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4" />
                      Calculate Travel Fee
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter travel distance (km)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            step="0.1"
                            value={travelDistance}
                            onChange={(e) => setTravelDistance(e.target.value)}
                            placeholder="e.g., 15.5"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-gray-600">km</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Rate: R6.50 per km • Max: 100km
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCalculateTravelFee}
                          disabled={updating || !travelDistance}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {updating ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <DollarSign className="h-4 w-4" />
                          )}
                          Calculate & Update Fee
                        </button>
                        <button
                          onClick={() => setShowTravelCalculator(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-900 mb-2">Travel Fee Calculated</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Distance</p>
                      <p className="text-lg font-bold text-gray-900">{parseFloat(booking.travelDistanceKm).toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Travel Fee</p>
                      <p className="text-lg font-bold text-green-700">
                        {formatCurrency(booking.travelAmount)} ({parseFloat(booking.travelDistanceKm).toFixed(1)}km × R6.50)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowTravelCalculator(true)
                      setTravelDistance(booking.travelDistanceKm?.toString() || '')
                    }}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Recalculate travel fee
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Meeting Type Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Meeting Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type</label>
                <div className="flex items-center gap-2">
                  {booking.meetingType === 'virtual' ? (
                    <>
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-900 font-medium">Virtual Session</span>
                    </>
                  ) : booking.meetingType === 'client_travels' ? (
                    <>
                      <Home className="h-4 w-4 text-green-600" />
                      <span className="text-gray-900 font-medium">Client Travels to Coach</span>
                    </>
                  ) : (
                    <>
                      <Car className="h-4 w-4 text-yellow-600" />
                      <span className="text-gray-900 font-medium">Coach Travels to Client</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 font-medium">{formatDate(booking.bookingDate)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 font-medium">{booking.bookingTime}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <div className="text-gray-900 font-medium">{booking.duration} minutes</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <div className="text-gray-900 font-medium">{booking.format}</div>
              </div>
              
              {booking.meetingLink && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                  <a 
                    href={booking.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                  >
                    {booking.meetingLink}
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Notes Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Admin Notes</h2>
              {!editingNotes ? (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit Notes
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUpdateNotes}
                    disabled={updating}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {updating ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingNotes(false)
                      setNotes(booking.notes || '')
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {editingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this booking..."
              />
            ) : (
              <div className="min-h-[100px]">
                {booking.notes ? (
                  <p className="text-gray-800 whitespace-pre-line">{booking.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No notes added yet</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Financial & Actions */}
        <div className="space-y-6">
          {/* Service & Pricing Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Service & Pricing</h2>
            
            <div className="space-y-3">
              <div className="pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">Service</p>
                <p className="text-lg font-bold text-gray-900">{booking.service.name}</p>
              </div>
              
              <div className="pb-3 border-b border-gray-200">
                <p className="text-sm text-gray-600">Session Fee</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(booking.sessionAmount || booking.service.price)}
                </p>
              </div>
              
              {booking.travelAmount && parseFloat(booking.travelAmount) > 0 && (
                <div className="pb-3 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Travel Fee</p>
                  <p className="text-lg font-bold text-yellow-700">
                    {formatCurrency(booking.travelAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {parseFloat(booking.travelDistanceKm).toFixed(1)}km × R6.50
                  </p>
                </div>
              )}
              
              <div className="pt-3">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">Payment Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  booking.paymentStatus === 'PAID' 
                    ? 'bg-green-100 text-green-800'
                    : booking.paymentStatus === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {booking.paymentStatus}
                </span>
                <p className="text-sm text-gray-600 mt-2">Amount Paid</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(booking.amountPaid)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => handleStatusChange('CONFIRMED')}
                disabled={updating || booking.status === 'CONFIRMED'}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Mark as Confirmed'}
              </button>
              
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={updating || booking.status === 'COMPLETED'}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Mark as Completed'}
              </button>
              
              <button
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={updating || booking.status === 'CANCELLED'}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Mark as Cancelled'}
              </button>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Booking Created</p>
                <p className="text-gray-900">
                  {new Date(booking.createdAt).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          {/* Special Requests */}
          {booking.specialRequests && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Special Requests</h2>
              <p className="text-gray-800 whitespace-pre-line">{booking.specialRequests}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Action Bar */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
        <Link
          href="/admin/session-bookings"
          className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Bookings
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBooking}
            disabled={updating}
            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {updating ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}