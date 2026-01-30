'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Check, CreditCard, Loader, ArrowRight, User, Mail, Phone, Target, MapPin, Car, Video, Home } from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  format: string
  hasPackage: boolean
  packageSessions?: number
  packageDiscount?: number
  isActive: boolean
}

interface TimeSlot {
  id: string
  date: string           // "2024-01-30"
  time: string           // "14:30"
  formattedDate: string  // "Tuesday, Jan 30"
  formattedTime: string  // "2:30 PM"
  isAvailable: boolean
  isBlocked: boolean
}

export default function BookingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [packageOption, setPackageOption] = useState<'single' | 'package'>('single')
  
  // Travel pricing state
  const [meetingType, setMeetingType] = useState<'virtual' | 'client_travels' | 'coach_travels'>('virtual')
  const [clientAddress, setClientAddress] = useState<string>('')
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goals: ''
  })

  // Fetch services on load
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.filter((s: Service) => s.isActive))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchAvailableSlots = async (serviceId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/availability/public?serviceId=${serviceId}`)
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data)
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    fetchAvailableSlots(service.id)
    setStep(2)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable && !slot.isBlocked) {
      setSelectedSlot(slot)
      setStep(3)
    }
  }

  // Calculate total - NO travel fee included for coach_travels (admin will add later)
  const calculateTotal = () => {
    if (!selectedService) return 0
    
    let basePrice = 0
    
    // Calculate base price (with package discount if applicable)
    if (packageOption === 'package' && selectedService.hasPackage) {
      const packagePrice = Number(selectedService.price) * (selectedService.packageSessions || 3)
      const discount = packagePrice * ((Number(selectedService.packageDiscount) || 0) / 100)
      basePrice = packagePrice - discount
    } else {
      basePrice = Number(selectedService.price)
    }
    
    // For coach travel, admin will add travel fee later
    // For now, just show session price
    return basePrice
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedService || !selectedSlot) return
    
    setLoading(true)
    try {
      // Generate booking number
      const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      // Calculate session amount (base price without travel)
      let sessionAmount = 0
      if (packageOption === 'package' && selectedService.hasPackage) {
        const packagePrice = Number(selectedService.price) * (selectedService.packageSessions || 3)
        const discount = packagePrice * ((Number(selectedService.packageDiscount) || 0) / 100)
        sessionAmount = packagePrice - discount
      } else {
        sessionAmount = Number(selectedService.price)
      }
      
      // Prepare booking data
      const bookingData: any = {
        serviceId: selectedService.id,
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        bookingDate: selectedSlot.date,
        bookingTime: selectedSlot.time,
        duration: selectedService.duration,
        format: selectedService.format,
        goals: formData.goals,
        totalAmount: calculateTotal(),
        numberOfSessions: packageOption === 'package' ? (selectedService.packageSessions || 1) : 1,
        sessionType: packageOption === 'package' && selectedService.packageSessions 
          ? `package_${selectedService.packageSessions}`
          : 'single',
        termsAccepted: true,
        bookingNumber: bookingNumber,
        attendees: 1,
        amountPaid: 0,
        paymentStatus: 'PENDING',
        status: 'PENDING',
        companyName: null,
        eventDetails: null,
        meetingLink: null,
        notes: null,
        specialRequests: null,
        
        // Travel pricing fields
        meetingType: meetingType,
        sessionAmount: sessionAmount,
        travelDistanceKm: null, // Admin will fill this
        travelAmount: 0, // Admin will calculate
      }

      // Add location based on meeting type
      if (meetingType === 'coach_travels') {
        bookingData.location = clientAddress
      } else if (meetingType === 'client_travels') {
        bookingData.location = "Client will travel to coach's location"
      } else {
        bookingData.location = "Virtual session"
      }

      // Send booking to API
      const bookingResponse = await fetch('/api/session-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })
      
      if (bookingResponse.ok) {
        const booking = await bookingResponse.json()
        // Redirect to payment page
        router.push(`/book/pay/${booking.id}`)
      } else {
        const error = await bookingResponse.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Reset address when meeting type changes
  useEffect(() => {
    if (meetingType !== 'coach_travels') {
      setClientAddress('')
    }
  }, [meetingType])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Book Your Session</h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Choose your coaching service, pick a convenient time, and get instant confirmation
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
              <div 
                className="h-1 bg-black transition-all duration-500"
                style={{ width: `${((step - 1) / 3) * 100}%` }}
              ></div>
            </div>
            
            {[
              { num: 1, icon: <Calendar className="h-5 w-5" />, label: 'Choose Service' },
              { num: 2, icon: <Clock className="h-5 w-5" />, label: 'Pick Time' },
              { num: 3, icon: <User className="h-5 w-5" />, label: 'Your Details' },
              { num: 4, icon: <CreditCard className="h-5 w-5" />, label: 'Payment' }
            ].map(({ num, icon, label }) => (
              <div key={num} className="flex flex-col items-center relative">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${step >= num 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-400 border-gray-300'
                  }
                  ${step === num ? 'scale-110 shadow-lg' : ''}
                `}>
                  {step > num ? <Check className="h-6 w-6" /> : icon}
                </div>
                <div className={`mt-3 text-sm font-medium ${step >= num ? 'text-gray-900' : 'text-gray-500'}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Choose Service */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Coaching Service</h2>
              <div className="space-y-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="group cursor-pointer p-6 border-2 border-gray-200 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">R {Number(service.price).toFixed(2)}</div>
                            <div className="text-sm text-gray-500">per session</div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mt-3">{service.description}</p>
                        
                        <div className="flex flex-wrap gap-4 mt-4">
                          <div className="flex items-center text-gray-700">
                            <Clock className="h-4 w-4 mr-2" />
                            {service.duration} minutes
                          </div>
                          <div className="flex items-center text-gray-700">
                            <CreditCard className="h-4 w-4 mr-2" />
                            {service.format === 'both' ? 'Virtual or In-person' : service.format}
                          </div>
                        </div>

                        {/* Package Option */}
                        {service.hasPackage && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-blue-900">
                                  Save {Number(service.packageDiscount)}% with {service.packageSessions}-Session Package
                                </div>
                                <div className="text-sm text-blue-700 mt-1">
                                  Pay once, book multiple sessions
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-blue-900">
                                  R {(Number(service.price) * (service.packageSessions || 3) * (1 - (Number(service.packageDiscount) || 0) / 100)).toFixed(2)}
                                </div>
                                <div className="text-sm text-blue-600">
                                  instead of R {(Number(service.price) * (service.packageSessions || 3)).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="md:pl-6 md:border-l md:border-gray-200">
                        <button className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                          Select
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Pick Time Slot */}
          {step === 2 && selectedService && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Time</h2>
                  <p className="text-gray-600 mt-2">
                    Select from available slots for {selectedService.name}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Change service
                </button>
              </div>

              {/* Meeting Type Selection */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-900 mb-3">How would you like to meet?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setMeetingType('virtual');
                      setClientAddress('');
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      meetingType === 'virtual' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Video className="h-5 w-5 mr-2" />
                      <div className="font-medium">Virtual Session</div>
                    </div>
                    <div className="text-sm">Zoom/Teams meeting</div>
                    <div className="text-sm mt-2">No travel fee</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setMeetingType('client_travels');
                      setClientAddress('');
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      meetingType === 'client_travels' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Home className="h-5 w-5 mr-2" />
                      <div className="font-medium">I'll Come to You</div>
                    </div>
                    <div className="text-sm">At coach's location/venue</div>
                    <div className="text-sm mt-2">No travel fee</div>
                  </button>
                  
                  <button
                    onClick={() => setMeetingType('coach_travels')}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      meetingType === 'coach_travels' 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Car className="h-5 w-5 mr-2" />
                      <div className="font-medium">You Come to Me</div>
                    </div>
                    <div className="text-sm">Coach travels to your address</div>
                    <div className="text-sm mt-2">+ R6.50 per km travel fee</div>
                  </button>
                </div>
              </div>

              {/* Address Input (only for coach_travels) */}
              {meetingType === 'coach_travels' && (
                <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h3 className="font-medium text-yellow-900 mb-3">Your Address for Travel</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-900 mb-2">
                        Enter your full address *
                      </label>
                      <textarea
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="e.g., Shop 12 Ghent Street, Evander, 2280, Mpumalanga"
                        rows={3}
                        required
                      />
                      <div className="text-sm text-yellow-700 mt-2">
                        💡 Travel fee will be calculated by admin based on distance from coach's location.
                        You'll receive confirmation of any additional travel fees before payment.
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                      <div className="flex items-start">
                        <div className="text-yellow-800 mr-3">📝</div>
                        <div className="text-sm text-yellow-800">
                          <strong>Travel Fee Note:</strong> If you select "You Come to Me", a travel fee of R6.50 per kilometer will be added to your total. The exact distance and fee will be confirmed by our admin team based on your address provided.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Package Selection */}
              {selectedService.hasPackage && (
                <div className="mb-8">
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setPackageOption('single')}
                      className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                        packageOption === 'single'
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      Single Session
                      <div className="text-sm font-normal mt-1">R {Number(selectedService.price).toFixed(2)}</div>
                    </button>
                    <button
                      onClick={() => setPackageOption('package')}
                      className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                        packageOption === 'package'
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {selectedService.packageSessions}-Session Package
                      <div className="text-sm font-normal mt-1">
                        Save {Number(selectedService.packageDiscount)}% - R {
                          (Number(selectedService.price) * (selectedService.packageSessions || 3) * 
                          (1 - (Number(selectedService.packageDiscount) || 0) / 100)).toFixed(2)
                        }
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Price Preview */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">Total Estimate</div>
                    <div className="text-sm text-gray-600">
                      {meetingType === 'virtual' && 'Virtual session - R0 travel fee'}
                      {meetingType === 'client_travels' && 'In-person (you travel) - R0 travel fee'}
                      {meetingType === 'coach_travels' && 'In-person (coach travels) - Travel fee to be confirmed'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      R {calculateTotal().toFixed(2)}
                    </div>
                    {meetingType === 'coach_travels' && (
                      <div className="text-sm text-yellow-700">
                        + Travel fee (R6.50/km) to be added
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Time Slots Grid */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No available slots for this service</p>
                  <p className="text-gray-400 mt-2">Please check back later or select a different service</p>
                </div>
              ) : (
                <>
                  {/* Group by date */}
                  {Array.from(new Set(timeSlots.map(slot => slot.date))).map(date => {
                    const slotsForDate = timeSlots.filter(slot => slot.date === date)
                    return (
                      <div key={date} className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {formatDate(date)}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {slotsForDate.map((slot) => (
                            <button
                              key={`${date}-${slot.time}`}
                              onClick={() => handleSlotSelect(slot)}
                              disabled={!slot.isAvailable || slot.isBlocked}
                              className={`
                                p-4 rounded-xl border-2 text-left transition-all duration-300
                                ${slot.isAvailable && !slot.isBlocked
                                  ? selectedSlot?.date === date && selectedSlot?.time === slot.time
                                    ? 'border-black bg-black text-white shadow-lg'
                                    : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                                }
                              `}
                            >
                              <div className="font-medium">
                                {slot.formattedTime}
                              </div>
                              {slot.isBlocked && (
                                <div className="text-sm text-red-600 mt-1">
                                  Unavailable
                                </div>
                              )}
                              {!slot.isAvailable && !slot.isBlocked && (
                                <div className="text-sm text-gray-500 mt-1">
                                  Booked
                                </div>
                              )}
                              {slot.isAvailable && !slot.isBlocked && (
                                <div className="text-sm text-green-600 mt-1">
                                  Available
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}

              <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Ready to proceed?</div>
                  <div className="text-lg font-bold text-gray-900">R {calculateTotal().toFixed(2)}</div>
                  {meetingType === 'coach_travels' && (
                    <div className="text-xs text-yellow-700">+ Travel fee to be confirmed</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Your Details */}
          {step === 3 && selectedService && selectedSlot && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
                  <p className="text-gray-600 mt-2">
                    We'll use this to send your confirmation and meeting details
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Change time
                </button>
              </div>

              {/* Booking Summary with Price Breakdown */}
              <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{selectedService.name}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(selectedSlot.date)}
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Clock className="h-4 w-4 mr-2" />
                        {selectedSlot.time}
                      </div>
                      <div className="flex items-center text-gray-700">
                        {meetingType === 'virtual' ? <Video className="h-4 w-4 mr-2" /> :
                         meetingType === 'client_travels' ? <Home className="h-4 w-4 mr-2" /> :
                         <Car className="h-4 w-4 mr-2" />}
                        {meetingType === 'virtual' ? 'Virtual' :
                         meetingType === 'client_travels' ? 'You Travel' :
                         'Coach Travels'}
                      </div>
                    </div>
                    {meetingType === 'coach_travels' && clientAddress && (
                      <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-800">
                            <strong>Your address:</strong> {clientAddress}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      R {calculateTotal().toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {packageOption === 'package' 
                        ? `${selectedService.packageSessions} sessions` 
                        : '1 session'
                      }
                    </div>
                  </div>
                </div>
                
                {/* Price Breakdown */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Session fee:</span>
                      <span className="font-medium">
                        R {(
                          packageOption === 'package' && selectedService.hasPackage
                            ? (Number(selectedService.price) * (selectedService.packageSessions || 3) * 
                               (1 - (Number(selectedService.packageDiscount) || 0) / 100))
                            : Number(selectedService.price)
                        ).toFixed(2)}
                      </span>
                    </div>
                    {meetingType === 'coach_travels' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Travel fee (to be confirmed):</span>
                        <span className="font-medium text-yellow-700">R6.50 per km</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-300">
                      <span>
                        {meetingType === 'coach_travels' ? 'Session Total:' : 'Total:'}
                      </span>
                      <span>R {calculateTotal().toFixed(2)}</span>
                    </div>
                    {meetingType === 'coach_travels' && (
                      <div className="text-xs text-yellow-700 mt-2">
                        Note: Final total will include travel fee calculated based on your address. Admin will confirm before payment.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Full Name *
                        </div>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          Email Address *
                        </div>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Phone Number *
                      </div>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                      placeholder="+27 82 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        What would you like to achieve in this session? (Optional)
                      </div>
                    </label>
                    <textarea
                      value={formData.goals}
                      onChange={(e) => setFormData({...formData, goals: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                      placeholder="Share your goals, challenges, or what you'd like to focus on..."
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      id="terms"
                      className="mt-1 mr-3 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the terms and conditions and understand that this booking is subject to the 
                      cancellation policy. I confirm that I've read and agree to the privacy policy.
                    </label>
                  </div>
                </div>

                <div className="flex justify-between mt-8 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          Need help? Call us at +27 82 123 4567 or email support@lifecoach.co.za
        </div>
      </div>
    </div>
  )
}