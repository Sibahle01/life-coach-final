// /src/app/(public)/book/flow/page.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useBookingFlow } from './hooks/useBookingFlow'
import { BookingProgress } from './components/BookingProgress'
import { ServiceSelection } from './components/ServiceSelection'
import { DateTimeSelection } from './components/DateTimeSelection'
import { DetailsForm } from './components/DetailsForm'
import { set } from 'date-fns'

export default function BookingFlowPage() {
  const {
    // State
    step, setStep,
    services, servicesLoading,
    selectedService,
    selectedSlot, setSelectedSlot,
    selectedDate, setSelectedDate,
    slots, groupedSlots, slotsLoading, slotChecking,
    currentMonth,
    packageOption, setPackageOption,
    meetingType, setMeetingType,
    clientAddress, setClientAddress,
    formData, setFormData,
    errorMessage, setErrorMessage,
    loading,
    
    // Actions
    handleServiceSelect,
    handleSlotSelect,
    handleFormSubmit,
    handleMonthChange,
    handleToday,
    calculateTotal,
  } = useBookingFlow()

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/events" className="hover:text-gray-900">Events</Link>
          <span>/</span>
          <span className="text-gray-900">Book Session</span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-light text-gray-900">Book Your Session</h1>
            <span className="text-xs text-gray-500">Step {step} of 4</span>
          </div>
        </div>

        {/* Progress Steps */}
        <BookingProgress currentStep={step} />

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {step === 1 && (
            <ServiceSelection 
              services={services}
              loading={servicesLoading}
              onSelect={handleServiceSelect}
            />
          )}

          {step === 2 && selectedService && (
            <DateTimeSelection
              selectedService={selectedService}
              slots={slots}
              groupedSlots={groupedSlots}
              loading={slotsLoading}
              slotChecking={slotChecking}
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              onToday={handleToday}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              selectedSlot={selectedSlot}
              onSlotSelect={handleSlotSelect}
              meetingType={meetingType}
              onMeetingTypeChange={setMeetingType}
              clientAddress={clientAddress}
              onAddressChange={setClientAddress}
              packageOption={packageOption}
              onPackageChange={setPackageOption}
              onBack={() => {
                setStep(1)
                setSelectedSlot(null)
                setSelectedDate(null)
                setErrorMessage(null)
              }}
              calculateTotal={calculateTotal}
            />
          )}

          {step === 3 && selectedService && selectedSlot && (
            <DetailsForm
              selectedService={selectedService}
              selectedSlot={selectedSlot}
              meetingType={meetingType}
              clientAddress={clientAddress}
              packageOption={packageOption}
              formData={formData}
              onFormDataChange={setFormData}
              onBack={() => {
                setStep(2)
                setErrorMessage(null)
              }}
              onSubmit={handleFormSubmit}
              loading={loading}
              calculateTotal={calculateTotal}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-gray-500">
            Need help? Call <span className="text-gray-900">+27 82 123 4567</span> or email{' '}
            <span className="text-gray-900">support@lifecoach.co.za</span>
          </p>
        </div>
      </div>
    </div>
  )
}