// File: /src/app/(public)/events/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Video, 
  Ticket, 
  CreditCard,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Coffee,
  FileText,
  CheckCircle,
  QrCode
} from 'lucide-react'

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
  const [success, setSuccess] = useState(false)
  const [ticketNumber, setTicketNumber] = useState('')

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
    
    if (!formData.attendeeName.trim()) errors.attendeeName = 'Name required'
    if (!formData.attendeeEmail.trim()) errors.attendeeEmail = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(formData.attendeeEmail)) errors.attendeeEmail = 'Invalid email'
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!purchaseData) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: purchaseData.eventId,
          quantity: purchaseData.quantity,
          ...formData
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Purchase failed')
      }

      const result = await response.json()
      
      setTicketNumber(result.ticket?.ticketNumber || `EVT-${Date.now().toString().slice(-6)}`)
      setSuccess(true)
      
      // Clear purchase data
      sessionStorage.removeItem('event-purchase')
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push('/events')
      }, 3000)

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
    return `R${amount.toFixed(2)}`
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  // SUCCESS STATE
  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 max-w-lg mx-auto text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <CheckCircle size={22} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-xl font-light text-gray-900 mb-1">
              Tickets Confirmed!
            </h1>
            <p className="text-xs text-gray-500 mb-5">
              #{ticketNumber}
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5 text-left">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-900/5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <QrCode size={12} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-1">Your tickets are on the way!</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-start gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span>Email with QR codes sent to {formData.attendeeEmail}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span>{purchaseData?.isVirtual ? 'Virtual event link included' : 'Bring QR code for check-in'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/events"
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                Browse More Events
              </Link>
              <Link
                href="/"
                className="flex-1 px-4 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors text-center"
              >
                Return Home
              </Link>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-4">
              Redirecting to events in 3 seconds...
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // NO PURCHASE DATA
  if (!purchaseData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={22} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No ticket selected</h3>
            <p className="text-xs text-gray-500 mb-5">Please select an event to purchase tickets</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Browse Events</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
        
        {/* COMPACT HEADER */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/events" className="hover:text-gray-900">Events</Link>
            <span>/</span>
            <Link href={`/events/${purchaseData.eventId}`} className="hover:text-gray-900 truncate max-w-[150px]">
              {purchaseData.title}
            </Link>
            <span>/</span>
            <span className="text-gray-900">Checkout</span>
          </div>
          
          <Link
            href={`/events/${purchaseData.eventId}`}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={14} />
            <span>Back to Event</span>
          </Link>
        </div>

        {/* MOBILE: Sticky Order Summary */}
        <div className="lg:hidden sticky top-[72px] z-10 -mx-4 px-4 pt-2 pb-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Total</span>
              <div className="text-xl font-light text-gray-900">{formatCurrency(total)}</div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CreditCard size={16} />
              )}
              <span>{submitting ? 'Processing...' : 'Complete'}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 mt-1.5">
            <Ticket size={12} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">
              {purchaseData.quantity} {purchaseData.quantity === 1 ? 'ticket' : 'tickets'}
            </span>
            <span className="text-gray-300">•</span>
            <Calendar size={12} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">{formatDate(purchaseData.eventDate)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Attendee Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-600" />
                  <h2 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                    Attendee Information
                  </h2>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-5">
                <div className="space-y-5">
                  {/* Name - Required */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                      Full Name <span className="text-gray-900">*</span>
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="attendeeName"
                        value={formData.attendeeName}
                        onChange={handleInputChange}
                        className={`
                          w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg 
                          focus:ring-1 focus:ring-gray-900 focus:border-gray-900 
                          transition-colors text-gray-900 placeholder:text-gray-400
                          ${formErrors.attendeeName ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}
                        `}
                        placeholder="John Doe"
                      />
                    </div>
                    {formErrors.attendeeName && (
                      <p className="mt-1.5 text-[10px] text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {formErrors.attendeeName}
                      </p>
                    )}
                  </div>

                  {/* Email - Required */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                      Email Address <span className="text-gray-900">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="attendeeEmail"
                        value={formData.attendeeEmail}
                        onChange={handleInputChange}
                        className={`
                          w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg 
                          focus:ring-1 focus:ring-gray-900 focus:border-gray-900 
                          transition-colors text-gray-900 placeholder:text-gray-400
                          ${formErrors.attendeeEmail ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}
                        `}
                        placeholder="john@example.com"
                      />
                    </div>
                    {formErrors.attendeeEmail ? (
                      <p className="mt-1.5 text-[10px] text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {formErrors.attendeeEmail}
                      </p>
                    ) : (
                      <p className="mt-1.5 text-[10px] text-gray-500">
                        Tickets will be sent to this email
                      </p>
                    )}
                  </div>

                  {/* Phone - Optional */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                      Phone Number <span className="text-gray-300 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="attendeePhone"
                        value={formData.attendeePhone}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                        placeholder="+27 82 123 4567"
                      />
                    </div>
                  </div>

                  {/* Company & Job Title - Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                        Company <span className="text-gray-300 font-normal">(Opt)</span>
                      </label>
                      <div className="relative">
                        <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                          placeholder="Your Company"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                        Job Title <span className="text-gray-300 font-normal">(Opt)</span>
                      </label>
                      <div className="relative">
                        <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                          placeholder="Your Job Title"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dietary Needs - Optional */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                      Dietary Requirements <span className="text-gray-300 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Coffee size={14} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="dietaryNeeds"
                        value={formData.dietaryNeeds}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                        placeholder="Vegetarian, Gluten-free, Halal..."
                      />
                    </div>
                  </div>

                  {/* Special Requests - Optional */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                      Special Requests <span className="text-gray-300 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <FileText size={14} className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                        placeholder="Accessibility needs, seating preferences..."
                      />
                    </div>
                  </div>
                </div>

                {/* Desktop Submit Button */}
                <div className="hidden lg:block mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} />
                        <span>Complete Purchase • {formatCurrency(total)}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* RIGHT: Order Summary - Desktop only */}
          <div className="hidden lg:block lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-5 sticky top-28"
            >
              <h2 className="text-sm font-medium text-gray-900 mb-4 pb-3 border-b border-gray-200 uppercase tracking-wide">
                Order Summary
              </h2>

              {/* Event Preview */}
              <div className="flex gap-3 mb-4">
                {/* Mini Poster */}
                <div className="w-16 h-16 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 border border-gray-200">
                  {purchaseData.posterImageUrl ? (
                    <img 
                      src={purchaseData.posterImageUrl} 
                      alt={purchaseData.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Ticket size={20} className="text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">
                    {purchaseData.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar size={10} className="flex-shrink-0" />
                    <span>{formatDate(purchaseData.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                    <MapPin size={10} className="flex-shrink-0" />
                    <span className="truncate">{purchaseData.venue || purchaseData.location}</span>
                  </div>
                  {purchaseData.isVirtual && (
                    <div className="inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 bg-gray-100 rounded text-[8px] text-gray-700">
                      <Video size={8} />
                      Virtual
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Quantity */}
              <div className="flex justify-between items-center py-3 border-t border-gray-200 text-xs">
                <span className="text-gray-600">
                  {purchaseData.quantity} {purchaseData.quantity === 1 ? 'ticket' : 'tickets'}
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(purchaseData.price * purchaseData.quantity)}
                </span>
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2 text-xs">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-xs">
                  <span className="text-gray-600">Processing fee</span>
                  <span className="font-medium text-gray-900">R0.00</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Total</span>
                  <span className="text-xl font-light text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* What's included */}
              <div className="mt-5 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-[10px] font-medium text-gray-900 mb-2 uppercase tracking-wide">
                  You'll receive
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-1.5 text-[10px] text-gray-600">
                    <CheckCircle size={10} className="text-gray-500" />
                    Email confirmation
                  </li>
                  <li className="flex items-center gap-1.5 text-[10px] text-gray-600">
                    <QrCode size={10} className="text-gray-500" />
                    QR code tickets
                  </li>
                  <li className="flex items-center gap-1.5 text-[10px] text-gray-600">
                    <Calendar size={10} className="text-gray-500" />
                    Event reminders
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}