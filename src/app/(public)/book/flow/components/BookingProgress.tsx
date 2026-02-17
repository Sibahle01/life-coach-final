// /src/app/(public)/book/flow/components/BookingProgress.tsx
'use client'

import { Calendar, Clock, User, CreditCard, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface BookingProgressProps {
  currentStep: number
}

export function BookingProgress({ currentStep }: BookingProgressProps) {
  const steps = [
    { num: 1, icon: Calendar, label: 'Service' },
    { num: 2, icon: Clock, label: 'Date & Time' },
    { num: 3, icon: User, label: 'Details' },
    { num: 4, icon: CreditCard, label: 'Payment' }
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative max-w-md mx-auto">
        {/* Progress bar background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
        
        {/* Progress bar fill */}
        <div 
          className="absolute top-4 left-0 h-0.5 bg-black transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />
        
        {steps.map(({ num, icon: Icon, label }) => {
          const isComplete = currentStep > num
          const isCurrent = currentStep === num
          
          return (
            <div key={num} className="flex flex-col items-center relative z-10">
              <motion.div 
                animate={isCurrent ? { scale: 1.1 } : { scale: 1 }}
                className={`
                  w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300 bg-white
                  ${isComplete || isCurrent 
                    ? 'border-black text-black' 
                    : 'border-gray-300 text-gray-400'
                  }
                  ${isCurrent ? 'shadow-lg' : ''}
                `}
              >
                {isComplete ? (
                  <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </motion.div>
              <span className={`
                mt-1.5 text-[10px] sm:text-xs font-medium
                ${isCurrent ? 'text-gray-900' : 'text-gray-500'}
              `}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}