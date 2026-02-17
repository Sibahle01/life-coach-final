// /src/app/(public)/book/flow/components/DetailsForm.tsx
'use client'

import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, Target, Calendar, Clock, MapPin, 
  Video, Home, Car, Loader, ArrowRight 
} from 'lucide-react'
import type { Service, TimeSlot, MeetingType, PackageOption, BookingFormData } from '../types'
import { formatCurrency, formatDateForDisplay, formatTimeForDisplay } from '../utils/formatting'

interface DetailsFormProps {
  selectedService: Service
  selectedSlot: TimeSlot
  meetingType: MeetingType
  clientAddress: string
  packageOption: PackageOption
  formData: BookingFormData
  onFormDataChange: (data: BookingFormData) => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => Promise<void>
  loading: boolean
  calculateTotal: () => number
}

export function DetailsForm({
  selectedService,
  selectedSlot,
  meetingType,
  clientAddress,
  packageOption,
  formData,
  onFormDataChange,
  onBack,
  onSubmit,
  loading,
  calculateTotal
}: DetailsFormProps) {
  
  const getMeetingTypeIcon = () => {
    switch (meetingType) {
      case 'virtual': return Video
      case 'client_travels': return Home
      case 'coach_travels': return Car
    }
  }
  
  const MeetingIcon = getMeetingTypeIcon()
  
  const getMeetingTypeLabel = () => {
    switch (meetingType) {
      case 'virtual': return 'Virtual Session'
      case 'client_travels': return 'Client Travels'
      case 'coach_travels': return 'Coach Travels'
    }
  }

  return (
    <div className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-medium text-gray-900">
            Your Details
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            We'll use this to send your confirmation
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Booking Summary Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 p-4 sm:p-5 bg-gray-50 rounded-xl border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Left: Service & DateTime */}
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">
              {selectedService.name}
            </h3>
            
            <div className="space-y-2">
              {/* Date */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                <span>{formatDateForDisplay(selectedSlot.date)}</span>
              </div>
              
              {/* Time */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                <Clock size={14} className="text-gray-500 flex-shrink-0" />
                <span>{selectedSlot.formattedTime || formatTimeForDisplay(selectedSlot.time)}</span>
              </div>
              
              {/* Meeting Type */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                <MeetingIcon size={14} className="text-gray-500 flex-shrink-0" />
                <span>{getMeetingTypeLabel()}</span>
              </div>
            </div>

            {/* Address for Coach Travels */}
            {meetingType === 'coach_travels' && clientAddress && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-[11px] sm:text-xs text-amber-800">
                    <span className="font-medium">Address:</span> {clientAddress}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Price */}
          <div className="text-left sm:text-right">
            <div className="text-lg sm:text-xl font-light text-gray-900">
              {formatCurrency(calculateTotal())}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-600 mt-1">
              {packageOption === 'package' 
                ? `${selectedService.packageSessions} sessions` 
                : '1 session'
              }
            </div>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Name & Email - Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-gray-600 font-medium mb-1.5">
              <div className="flex items-center gap-1.5">
                <User size={12} className="text-gray-500" />
                Full Name *
              </div>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onFormDataChange({...formData, name: e.target.value})}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 placeholder:text-gray-500 transition-colors"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-[10px] uppercase tracking-wide text-gray-600 font-medium mb-1.5">
              <div className="flex items-center gap-1.5">
                <Mail size={12} className="text-gray-500" />
                Email Address *
              </div>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => onFormDataChange({...formData, email: e.target.value})}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 placeholder:text-gray-500 transition-colors"
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-gray-600 font-medium mb-1.5">
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="text-gray-500" />
              Phone Number *
            </div>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => onFormDataChange({...formData, phone: e.target.value})}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 placeholder:text-gray-500 transition-colors"
            placeholder="+27 82 123 4567"
          />
        </div>

        {/* Goals */}
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-gray-600 font-medium mb-1.5">
            <div className="flex items-center gap-1.5">
              <Target size={12} className="text-gray-500" />
              What would you like to achieve? (Optional)
            </div>
          </label>
          <textarea
            value={formData.goals}
            onChange={(e) => onFormDataChange({...formData, goals: e.target.value})}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 bg-white text-gray-900 placeholder:text-gray-500 transition-colors resize-none"
            placeholder="Share your goals or what you'd like to focus on..."
          />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            required
            id="terms"
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-black focus:ring-black focus:ring-2 bg-white"
          />
          <label htmlFor="terms" className="text-xs sm:text-sm text-gray-700">
            I agree to the <span className="text-gray-900 font-medium">terms and conditions</span> and{' '}
            <span className="text-gray-900 font-medium">booking policy</span>.
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 pt-5 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
          >
            ← Back
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}