'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, parseISO, isToday, isFuture, isPast, startOfDay } from 'date-fns'

interface Reservation {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  reservationDate: string
  time: string
  partySize: number
  specialRequests: string | null
  occasion: string | null
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SEATED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SEATED: 'Seated',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Reservation>>({})

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reservations')
      if (!response.ok) throw new Error('Failed to fetch reservations')
      
      const data = await response.json()
      setReservations(data)
    } catch (err) {
      setError('Error loading reservations')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setReservations(prev => 
          prev.map(res => 
            res.id === id ? { ...res, status: newStatus } : res
          )
        )
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update status')
    }
  }

  const startEdit = (reservation: Reservation) => {
    setEditingId(reservation.id)
    setEditForm({
      customerName: reservation.customerName,
      customerEmail: reservation.customerEmail,
      customerPhone: reservation.customerPhone,
      reservationDate: reservation.reservationDate,
      time: reservation.time,
      partySize: reservation.partySize,
      specialRequests: reservation.specialRequests,
      occasion: reservation.occasion
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const updated = await response.json()
        setReservations(prev => 
          prev.map(res => res.id === id ? updated : res)
        )
        setEditingId(null)
        setEditForm({})
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update reservation')
      }
    } catch (err) {
      console.error('Error updating reservation:', err)
      alert('Failed to update reservation')
    }
  }

  const deleteReservation = async (id: string, customerName: string) => {
    if (!confirm(`Delete reservation for ${customerName}? This cannot be undone.`)) return
    
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setReservations(prev => prev.filter(res => res.id !== id))
      }
    } catch (err) {
      console.error('Error deleting reservation:', err)
      alert('Failed to delete reservation')
    }
  }

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = parseISO(dateString)
    return {
      date: format(date, 'EEE, MMM d, yyyy'),
      time: timeString,
      full: format(date, 'EEE, MMM d, yyyy') + ' at ' + timeString
    }
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'Not provided'
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
  }

  // Fixed filter logic
  const filteredReservations = reservations.filter(reservation => {
    const reservationDate = parseISO(reservation.reservationDate)
    const today = startOfDay(new Date())
    const resDate = startOfDay(reservationDate)
    
    // Apply date filter - FIXED LOGIC
    if (filter === 'today') {
      if (resDate.getTime() !== today.getTime()) return false
    } else if (filter === 'upcoming') {
      if (resDate.getTime() <= today.getTime()) return false
    } else if (filter === 'past') {
      if (resDate.getTime() >= today.getTime()) return false
    } else if (filter === 'pending') {
      if (reservation.status !== 'PENDING') return false
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        reservation.customerName.toLowerCase().includes(term) ||
        reservation.customerEmail.toLowerCase().includes(term) ||
        (reservation.customerPhone && reservation.customerPhone.includes(term)) ||
        reservation.id.toLowerCase().includes(term)
      )
    }
    
    return true
  })

  // Sort by date (upcoming first, then past)
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const dateA = new Date(a.reservationDate + 'T' + a.time).getTime()
    const dateB = new Date(b.reservationDate + 'T' + b.time).getTime()
    return dateB - dateA
  })

  // Stats - FIXED
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    today: reservations.filter(r => {
      const resDate = startOfDay(parseISO(r.reservationDate))
      const today = startOfDay(new Date())
      return resDate.getTime() === today.getTime()
    }).length,
    upcoming: reservations.filter(r => {
      const resDate = startOfDay(parseISO(r.reservationDate))
      const today = startOfDay(new Date())
      return resDate.getTime() > today.getTime()
    }).length
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reservations...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-700">Reservations</h1>
            <p className="text-gray-600">Manage table bookings and customer reservations</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/reservations"
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
            >
              + Add Reservation
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Reservations</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Today</p>
          <p className="text-2xl font-bold text-green-600">{stats.today}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Upcoming</p>
          <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'today' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'upcoming' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'past' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Past
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition ${filter === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {sortedReservations.length} of {reservations.length} reservations
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedReservations.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reservations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try a different search term' : 'Get started by creating a new reservation'}
            </p>
            <div className="mt-6">
              <Link
                href="/reservations"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                + Add New Reservation
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Party Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedReservations.map((reservation) => {
                  const dateTime = formatDateTime(reservation.reservationDate, reservation.time)
                  const isEditing = editingId === reservation.id
                  
                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.customerName || ''}
                              onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Name"
                            />
                            <input
                              type="email"
                              value={editForm.customerEmail || ''}
                              onChange={(e) => setEditForm({...editForm, customerEmail: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Email"
                            />
                            <input
                              type="tel"
                              value={editForm.customerPhone || ''}
                              onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Phone"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-800 font-semibold">
                                {reservation.customerName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {reservation.customerName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {reservation.customerEmail}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatPhone(reservation.customerPhone)}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="date"
                              value={editForm.reservationDate || ''}
                              onChange={(e) => setEditForm({...editForm, reservationDate: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="time"
                              value={editForm.time || ''}
                              onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                            <textarea
                              value={editForm.specialRequests || ''}
                              onChange={(e) => setEditForm({...editForm, specialRequests: e.target.value})}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="Special requests"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">{dateTime.date}</div>
                            <div className="text-sm text-gray-500">{dateTime.time}</div>
                            {reservation.specialRequests && (
                              <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={reservation.specialRequests}>
                                📝 {reservation.specialRequests}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={editForm.partySize || ''}
                            onChange={(e) => setEditForm({...editForm, partySize: parseInt(e.target.value)})}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                        ) : (
                          <div className="text-lg font-semibold text-gray-900">
                            {reservation.partySize} <span className="text-sm text-gray-500">people</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={reservation.status}
                          onChange={(e) => updateStatus(reservation.id, e.target.value)}
                          disabled={isEditing}
                          className={`text-xs font-medium px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-green-500 ${STATUS_COLORS[reservation.status]} ${isEditing ? 'opacity-50' : ''}`}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <option key={value} value={value} className="bg-white text-gray-900">
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveEdit(reservation.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-3">
                            <button
                              onClick={() => startEdit(reservation)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteReservation(reservation.id, reservation.customerName)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Update reservation status as customers arrive and leave. 
              Use "Seated" when they arrive and "Completed" when they leave. Click "Edit" to modify reservation details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}