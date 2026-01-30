'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, Calendar, Clock, User, Mail, Phone, Download, Home, Mail as MailIcon } from 'lucide-react'

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
  paymentStatus: string
}

export default function ConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

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

  const handleDownloadICS = async () => {
    if (!booking) return
    
    setDownloading(true)
    try {
      // Format date and time for ICS file
      const bookingDateTime = new Date(`${booking.bookingDate}T${booking.bookingTime}`)
      const endDateTime = new Date(bookingDateTime.getTime() + booking.service.duration * 60000)
      
      // Format dates as YYYYMMDDTHHMMSS
      const formatICSDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}${month}${day}T${hours}${minutes}${seconds}`
      }

      const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Life Coach Pro//Booking System//EN
BEGIN:VEVENT
UID:${booking.bookingNumber}@lifecoach.co.za
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(bookingDateTime)}
DTEND:${formatICSDate(endDateTime)}
SUMMARY:${booking.service.name} - Life Coaching Session
DESCRIPTION:Your coaching session with Life Coach Pro\\n\\nBooking Reference: ${booking.bookingNumber}\\nDuration: ${booking.service.duration} minutes\\nFormat: ${booking.service.format}\\n\\nIf you have any questions, please contact us at support@lifecoach.co.za
LOCATION:${booking.service.format === 'virtual' ? 'Virtual (Zoom link will be sent)' : 'To be confirmed'}
STATUS:CONFIRMED
ORGANIZER:mailto:support@lifecoach.co.za
ATTENDEE:mailto:${booking.clientEmail}
END:VEVENT
END:VCALENDAR`
    
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coaching-session-${booking.bookingNumber}.ics`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error) {
      console.error('Error downloading calendar:', error)
      alert('Failed to generate calendar file. Please try again.')
    } finally {
      setDownloading(false)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-lg">Confirmation not found</div>
          <button
            onClick={() => router.push('/book')}
            className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Book New Session
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-pulse">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
          <p className="text-gray-600 mt-2">Your coaching session has been scheduled</p>
          <div className="mt-2 text-sm text-gray-500">
            Reference: <span className="font-mono font-medium">{booking.bookingNumber}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Confirmation Details */}
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Session Details</h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Confirmed
                </span>
              </div>

              <div className="space-y-6">
                {/* Service Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-bold text-gray-900 text-lg">{booking.service.name}</div>
                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(booking.bookingDate)}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-2" />
                      {formatTime(booking.bookingTime)}
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="h-4 w-4 mr-2" />
                      {booking.service.duration} minutes
                    </div>
                  </div>
                  <div className="mt-2 text-gray-600">
                    Format: {booking.service.format === 'virtual' ? 'Virtual (Zoom)' : 
                            booking.service.format === 'in-person' ? 'In-person' : 
                            'Virtual or In-person'}
                  </div>
                </div>

                {/* Client Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Your Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Name</div>
                        <div className="font-medium">{booking.clientName}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{booking.clientEmail}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="font-medium">{booking.clientPhone}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Check className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm text-gray-600">Payment</div>
                        <div className="font-medium text-green-600">Paid - R {Number(booking.totalAmount).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">What Happens Next</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Confirmation email sent to {booking.clientEmail}</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Calendar invite attached to email (add to your calendar)</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>24-hour reminder email will be sent before your session</span>
                    </li>
                    {booking.service.format === 'virtual' && (
                      <li className="flex items-start">
                        <MailIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Zoom link will be sent 1 hour before your session</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleDownloadICS}
                disabled={downloading}
                className="w-full px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3"></div>
                    Generating Calendar File...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-3" />
                    Download Calendar Invite (.ics)
                  </>
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/book')}
                  className="px-6 py-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors flex items-center justify-center"
                >
                  <Calendar className="h-5 w-5 mr-3" />
                  Book Another Session
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Home className="h-5 w-5 mr-3" />
                  Back to Homepage
                </button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gray-50 p-8 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Need Help?</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Check your email for the confirmation and calendar invite</p>
              <p>• 24-hour reminder will be sent automatically</p>
              <p>• Need to reschedule? Contact us at least 48 hours before</p>
              <p className="mt-4">
                Questions? Call +27 82 123 4567 or email support@lifecoach.co.za
              </p>
            </div>
          </div>
        </div>

        {/* Receipt */}
        <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Payment Receipt</h3>
            <span className="text-sm text-gray-500">#{booking.bookingNumber}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{booking.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">{formatDate(booking.bookingDate)} at {formatTime(booking.bookingTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-bold text-gray-900">R {Number(booking.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-medium text-green-600">Paid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}