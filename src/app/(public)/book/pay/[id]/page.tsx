'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Check, CreditCard, Calendar, Clock, User, Loader, Shield, Mail, Phone } from 'lucide-react'

interface Booking {
  id: string
  bookingNumber: string
  service: {
    name: string
    duration: number
    format: string
  }
  clientName: string
  clientEmail: string
  clientPhone: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  status: string
}

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'eft' | 'simulate'>('simulate')

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/session-bookings/${bookingId}`)
      if (response.ok) {
        const data = await response.json()
        // Convert Decimal to number for display
        setBooking({
          ...data,
          totalAmount: Number(data.totalAmount)
        })
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!booking) return
    
    setProcessing(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update booking status to PAID
      const response = await fetch(`/api/session-bookings/${bookingId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'simulated',
          status: 'CONFIRMED',
          paymentStatus: 'PAID'
        })
      })
      
      if (response.ok) {
        // Redirect to confirmation page
        router.push(`/book/confirm/${bookingId}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeStr: string) => {
    const [hour, minute] = timeStr.split(':')
    const hourNum = parseInt(hour)
    const ampm = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum % 12 || 12
    return `${displayHour}:${minute} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg">Booking not found</div>
          <button
            onClick={() => router.push('/book')}
            className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Start Over
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
          <p className="text-gray-600 mt-2">Secure payment for your coaching session</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Booking Summary */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{booking.service.name}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(booking.bookingDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatTime(booking.bookingTime)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    R {Number(booking.totalAmount).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total amount</div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Your Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div className="font-medium">{booking.clientName}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{booking.clientEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium">{booking.clientPhone}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-600">Duration</div>
                      <div className="font-medium">{booking.service.duration} minutes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
            
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  <Shield className="h-4 w-4 mr-2" />
                  Simulated Payment - For Testing
                </div>
                <p className="text-gray-600 mt-2 text-sm">
                  This is a simulated payment flow. In production, you'll be redirected to PayFast.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                  { id: 'eft', label: 'Instant EFT', icon: '🏦' },
                  { id: 'simulate', label: 'Simulate Payment', icon: '🔄', highlighted: true }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === method.id
                        ? method.highlighted
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="font-medium">{method.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Details & Button */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="text-sm text-gray-600">Amount to pay</div>
                <div className="text-3xl font-bold text-gray-900">R {Number(booking.totalAmount).toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Booking reference</div>
                <div className="font-mono font-medium">{booking.bookingNumber}</div>
              </div>
            </div>

            {/* Security Info */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900">Secure Payment</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Your payment is secure and encrypted. In production, this would be processed through PayFast.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
              >
                ← Back to Booking
              </button>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin mr-3" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-3" />
                    Complete Payment - R {Number(booking.totalAmount).toFixed(2)}
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-6">
              <div className="text-xs text-gray-500">
                By completing this payment, you agree to our terms and conditions
              </div>
            </div>
          </div>
        </div>

        {/* Help Info */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            Need help? Call +27 82 123 4567 or email support@lifecoach.co.za
          </div>
          <div className="text-xs text-gray-400 mt-2">
            This is a simulated payment flow for testing purposes
          </div>
        </div>
      </div>
    </div>
  )
}