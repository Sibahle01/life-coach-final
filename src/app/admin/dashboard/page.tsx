// src/app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  totalServices: number
  totalBooks: number
  totalEvents: number
  totalSessionBookings: number
  totalBookOrders: number
  totalEventTickets: number
  pendingBookings: number
  todayBookings: number
  upcomingEvents: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    totalBooks: 0,
    totalEvents: 0,
    totalSessionBookings: 0,
    totalBookOrders: 0,
    totalEventTickets: 0,
    pendingBookings: 0,
    todayBookings: 0,
    upcomingEvents: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/me')
      if (!response.ok) {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchStats = async () => {
    try {
      // Fetch real stats from Life Coach API
      const [servicesRes, booksRes, eventsRes, bookingsRes] = await Promise.all([
        fetch('/api/services').catch(() => null),
        fetch('/api/books').catch(() => null),
        fetch('/api/events').catch(() => null),
        fetch('/api/session-bookings').catch(() => null),
      ])

      const services = servicesRes?.ok ? await servicesRes.json() : []
      const books = booksRes?.ok ? await booksRes.json() : []
      const events = eventsRes?.ok ? await eventsRes.json() : []
      const bookings = bookingsRes?.ok ? await bookingsRes.json() : []

      // Calculate stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      setStats({
        totalServices: Array.isArray(services) ? services.length : 0,
        totalBooks: Array.isArray(books) ? books.length : 0,
        totalEvents: Array.isArray(events) ? events.length : 0,
        totalSessionBookings: Array.isArray(bookings) ? bookings.length : 0,
        totalBookOrders: 0, // Will implement later
        totalEventTickets: 0, // Will implement later
        pendingBookings: Array.isArray(bookings) 
          ? bookings.filter((b: any) => b.status === 'PENDING').length 
          : 0,
        todayBookings: Array.isArray(bookings)
          ? bookings.filter((b: any) => {
              const bookingDate = new Date(b.bookingDate)
              return bookingDate >= today
            }).length
          : 0,
        upcomingEvents: Array.isArray(events)
          ? events.filter((e: any) => {
              const eventDate = new Date(e.eventDate)
              return eventDate >= today && e.status === 'UPCOMING'
            }).length
          : 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your life coaching platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Services Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">Coaching Services</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
          </div>
          <Link 
            href="/admin/services" 
            className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center"
          >
            Manage →
          </Link>
        </div>

        {/* Books Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">Books</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalBooks}</p>
          </div>
          <Link 
            href="/admin/books" 
            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
          >
            Manage →
          </Link>
        </div>

        {/* Session Bookings Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            {stats.pendingBookings > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                {stats.pendingBookings} pending
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">Session Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSessionBookings}</p>
          </div>
          <Link 
            href="/admin/session-bookings" 
            className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
          >
            View all →
          </Link>
        </div>

        {/* Events Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {stats.upcomingEvents > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">
                {stats.upcomingEvents} upcoming
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">Events</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
          </div>
          <Link 
            href="/admin/events" 
            className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium inline-flex items-center"
          >
            Manage →
          </Link>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/admin/services/new"
            className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Add Service</h3>
                <p className="text-sm text-gray-500">Create new coaching service</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/books/new"
            className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Add Book</h3>
                <p className="text-sm text-gray-500">List a new book for sale</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/events/new"
            className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-amber-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Create Event</h3>
                <p className="text-sm text-gray-500">Schedule workshop or seminar</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity / Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Services Management</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Booking System</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Event Management</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Active Services</span>
              <span className="text-sm font-semibold text-gray-900">{stats.totalServices}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Pending Bookings</span>
              <span className="text-sm font-semibold text-gray-900">{stats.pendingBookings}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Upcoming Events</span>
              <span className="text-sm font-semibold text-gray-900">{stats.upcomingEvents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}