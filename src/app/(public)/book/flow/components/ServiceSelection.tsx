// /src/app/(public)/book/flow/components/ServiceSelection.tsx
'use client'

import { motion } from 'framer-motion'
import { Clock, CreditCard, ArrowRight } from 'lucide-react'
import type { Service } from '../types'
import { calculatePackagePrice } from '../utils/validation'
import { formatCurrency } from '../utils/formatting'

interface ServiceSelectionProps {
  services: Service[]
  loading: boolean
  onSelect: (service: Service) => void
}

export function ServiceSelection({ services, loading, onSelect }: ServiceSelectionProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-medium text-gray-900">
          Select Your Coaching Service
        </h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {services.length} services
        </span>
      </div>
      
      {/* GRID LAYOUT: 1 column mobile, 2 columns desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {services.map((service) => {
          const packagePrice = service.hasPackage
            ? calculatePackagePrice(
                Number(service.price),
                service.packageSessions || 3,
                Number(service.packageDiscount) || 0
              )
            : null
          
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group cursor-pointer h-full"
              onClick={() => onSelect(service)}
            >
              <div className="h-full p-4 sm:p-5 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex flex-col h-full">
                  {/* Header with title and badge */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 pr-4">
                      {service.name}
                    </h3>
                    {service.hasPackage && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-900 text-white uppercase tracking-wider whitespace-nowrap">
                        Package
                      </span>
                    )}
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
                    {service.description}
                  </p>
                  
                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600">
                      <Clock size={12} className="text-gray-400" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-600">
                      <CreditCard size={12} className="text-gray-400" />
                      <span className="capitalize">{service.format}</span>
                    </div>
                  </div>

                  {/* Package info - if available */}
                  {service.hasPackage && (
                    <div className="mt-2 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] sm:text-xs font-medium text-gray-900">
                            {service.packageSessions}-session package
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-gray-500 ml-1.5">
                            Save {service.packageDiscount}%
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {formatCurrency(packagePrice || 0)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Price and CTA - always at bottom */}
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                    <div>
                      <div className="text-base sm:text-lg font-light text-gray-900">
                        {formatCurrency(Number(service.price))}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-gray-500">
                        per session
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <ArrowRight size={14} className="text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}