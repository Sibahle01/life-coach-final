// File: /src/app/admin/services/ServiceForm.tsx
'use client'

import { useState, useEffect, FormEvent } from 'react'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number | string
  format: string
  category: string
  isActive: boolean
  isFeatured: boolean
  order: number
  imageUrl?: string
}

interface Category {
  value: string
  label: string
}

interface ServiceFormProps {
  service: Service | null
  categories: Category[]
  onSubmit: (serviceData: Partial<Service>) => Promise<void>
  onClose: () => void
}

interface FormData {
  name: string
  description: string
  duration: number | string
  price: number | string
  format: string
  category: string
  isActive: boolean
  isFeatured: boolean
  order: number | string
  imageUrl: string
}

export default function ServiceForm({ service, categories, onSubmit, onClose }: ServiceFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    duration: 60,
    price: '',
    format: 'both',
    category: 'coaching',
    isActive: true,
    isFeatured: false,
    order: 0,
    imageUrl: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        duration: service.duration || 60,
        price: service.price || '',
        format: service.format || 'both',
        category: service.category || 'coaching',
        isActive: service.isActive !== undefined ? service.isActive : true,
        isFeatured: service.isFeatured || false,
        order: service.order || 0,
        imageUrl: service.imageUrl || ''
      })
    }
  }, [service])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Service name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    
    const price = parseFloat(formData.price as string)
    if (isNaN(price) || price <= 0) newErrors.price = 'Valid price is required'
    
    const duration = parseInt(formData.duration as string)
    if (isNaN(duration) || duration <= 0) newErrors.duration = 'Valid duration is required'
    
    return newErrors
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        price: parseFloat(formData.price as string),
        duration: parseInt(formData.duration as string),
        order: parseInt(formData.order as string)
      })
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {service ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {service ? 'Update your coaching service details' : 'Create a new coaching service for your clients'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Service Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
              placeholder="e.g., Life Coaching Session"
            />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-3 rounded-lg border ${errors.description ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
              placeholder="Describe what clients can expect from this service..."
            />
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Category and Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Format *
              </label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              >
                <option value="virtual">Virtual Only</option>
                <option value="in-person">In-Person Only</option>
                <option value="both">Virtual & In-Person</option>
              </select>
            </div>
          </div>

          {/* Duration and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="15"
                step="15"
                className={`w-full px-4 py-3 rounded-lg border ${errors.duration ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                placeholder="e.g., 60"
              />
              {errors.duration && <p className="mt-2 text-sm text-red-600">{errors.duration}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Price (R) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">R</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.price ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Image URL (optional)
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Order and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                placeholder="0"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                Active
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-900">
                Featured
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {service ? 'Update Service' : 'Create Service'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}