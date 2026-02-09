// File: /src/app/(public)/events/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface PurchaseData {
  eventId: string
  title: string
  eventDate: string
  eventTime: string
  location: string
  venue?: string
  isVirtual: boolean
  meetingLink?: string
  price: number
  quantity: number
  posterImageUrl?: string
}

export default function EventCheckoutPage() {
  const router = useRouter()
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    attendeeName: '',
    attendeeEmail: '',
    attendeePhone: '',
    specialRequests: '',
    dietaryNeeds: '',
    companyName: '',
    jobTitle: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadPurchaseData()
  }, [])

  const loadPurchaseData = () => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('event-purchase')
      if (savedData) {
        setPurchaseData(JSON.parse(savedData))
      }
    }
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.attendeeName.trim()) errors.attendeeName = 'Name is required'
    if (!formData.attendeeEmail.trim()) errors.attendeeEmail = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.attendeeEmail)) errors.attendeeEmail = 'Invalid email address'
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!purchaseData) {
      alert('No ticket selected')
      router.push('/events')
      return
    }

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/events/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: purchaseData.eventId,
          quantity: purchaseData.quantity,
          ...formData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to purchase ticket')
      }

      const result = await response.json()
      console.log('✅ Ticket purchased:', result.ticket.ticketNumber)

      // Clear purchase data
      sessionStorage.removeItem('event-purchase')
      
      // Show success and redirect
      alert('🎉 Tickets purchased successfully! Check your email for your tickets with QR codes.')
      router.push('/events')

    } catch (error) {
      console.error('Purchase error:', error)
      alert(error instanceof Error ? error.message : 'Purchase failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const calculateTotal = () => {
    if (!purchaseData) return 0
    return purchaseData.price * purchaseData.quantity
  }

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!purchaseData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ticket selected</h3>
            <p className="text-gray-600 mb-6">Please select an event to purchase tickets</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Checkout</h1>
          <p className="text-gray-600">Complete your ticket purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Attendee Information</h2>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="attendeeName"
                    value={formData.attendeeName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors.attendeeName ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                    placeholder="John Doe"
                  />
                  {formErrors.attendeeName && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.attendeeName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="attendeeEmail"
                    value={formData.attendeeEmail}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      formErrors.attendeeEmail ? 'border-red-300' : 'border-gray-300'
                    } focus:ring-2 focus:ring-gray-900 focus:border-transparent`}
                    placeholder="john@example.com"
                  />
                  {formErrors.attendeeEmail && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.attendeeEmail}</p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    Your tickets will be sent to this email
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="attendeePhone"
                    value={formData.attendeePhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="+27 82 123 4567"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Your Company"
                  />
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Your Job Title"
                  />
                </div>

                {/* Dietary Needs */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Dietary Requirements (Optional)
                  </label>
                  <textarea
                    name="dietaryNeeds"
                    value={formData.dietaryNeeds}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="E.g., Vegetarian, Gluten-free, Halal..."
                  />
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Any special accommodations or requests..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
                      Complete Purchase
                    </>
                  )}
                </button>
                <p className="mt-3 text-sm text-gray-600 text-center">
                  You'll receive your tickets via email immediately
                </p>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Event Details */}
              <div className="pb-4 border-b border-gray-200 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">{purchaseData.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📅 {formatDate(purchaseData.eventDate)}</p>
                  <p>⏰ {purchaseData.eventTime}</p>
                  <p>📍 {purchaseData.venue || purchaseData.location}</p>
                  {purchaseData.isVirtual && (
                    <p className="text-cyan-600">🌐 Virtual Event</p>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {purchaseData.quantity} ticket{purchaseData.quantity > 1 ? 's' : ''}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(purchaseData.price * purchaseData.quantity)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-medium">R 0.00</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>What happens next:</strong>
                </p>
                <ul className="mt-2 text-sm text-gray-600 space-y-1">
                  <li>✓ Instant email confirmation</li>
                  <li>✓ Tickets with QR codes</li>
                  <li>✓ Event reminders</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}