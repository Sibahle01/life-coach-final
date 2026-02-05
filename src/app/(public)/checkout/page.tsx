// File: /src/app/(public)/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CartItem {
  id: string
  bookId: string
  title: string
  author: string
  price: number
  format: string
  quantity: number
}

interface CheckoutForm {
  customerName: string
  customerEmail: string
  customerPhone: string
  
  // Shipping - only required for physical books
  shippingAddress: string
  shippingCity: string
  shippingProvince: string
  shippingPostalCode: string
  shippingCountry: string
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [orderCreated, setOrderCreated] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  
  const router = useRouter()

  const [form, setForm] = useState<CheckoutForm>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingProvince: '',
    shippingPostalCode: '',
    shippingCountry: 'South Africa'
  })

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('book-cart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    }
    setLoading(false)
  }

  const hasPhysicalBooks = cart.some(item => item.format === 'physical')

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = hasPhysicalBooks ? 100 : 0
    const tax = subtotal * 0.15
    const total = subtotal + shipping + tax
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }
  }

  const { subtotal, shipping, tax, total } = calculateTotals()

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const errors: string[] = []

    if (!form.customerName.trim()) errors.push('Name is required')
    if (!form.customerEmail.trim()) errors.push('Email is required')
    if (!form.customerPhone.trim()) errors.push('Phone number is required')
    
    if (hasPhysicalBooks) {
      if (!form.shippingAddress.trim()) errors.push('Shipping address is required')
      if (!form.shippingCity.trim()) errors.push('City is required')
      if (!form.shippingProvince.trim()) errors.push('Province is required')
      if (!form.shippingPostalCode.trim()) errors.push('Postal code is required')
    }

    if (cart.length === 0) errors.push('Your cart is empty')

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    setSubmitting(true)
    setError('')

    try {
      // Prepare order data for YOUR API
      const orderData = {
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        shippingAddress: hasPhysicalBooks ? form.shippingAddress : null,
        shippingCity: hasPhysicalBooks ? form.shippingCity : null,
        shippingProvince: hasPhysicalBooks ? form.shippingProvince : null,
        shippingPostalCode: hasPhysicalBooks ? form.shippingPostalCode : null,
        shippingCountry: hasPhysicalBooks ? form.shippingCountry : null,
        shippingMethod: 'Standard',
        subtotal,
        shippingCost: shipping,
        tax,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        currency: 'ZAR',
        items: cart.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
          price: item.price,
          format: item.format
        }))
      }

      // Send to YOUR Book Orders API
      const response = await fetch('/api/book-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const order = await response.json()
      
      // Save order number and clear cart
      setOrderNumber(order.orderNumber)
      setOrderCreated(true)
      
      // Clear the cart
      localStorage.removeItem('book-cart')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
    'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (cart.length === 0 && !orderCreated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some books to checkout</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your order number is:
            </p>
            
            <div className="inline-block px-6 py-3 bg-gray-100 rounded-lg mb-6">
              <span className="text-xl font-bold text-gray-900 font-mono">#{orderNumber}</span>
            </div>
            
            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• You will receive an email confirmation</li>
                      <li>• eBooks will be delivered instantly via email</li>
                      <li>• Physical books will be shipped within 2-3 business days</li>
                      <li>• You can track your order in the admin panel</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/books"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => {
                  // In future: Link to order tracking page
                  alert('Order tracking coming soon!')
                }}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
              >
                Track My Order
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={form.customerName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={form.customerEmail}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={form.customerPhone}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                      placeholder="+27 12 345 6789"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Information - Conditionally shown */}
              {hasPhysicalBooks && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="shippingAddress"
                        value={form.shippingAddress}
                        onChange={handleFormChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="shippingCity"
                          value={form.shippingCity}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                          placeholder="Johannesburg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Province *
                        </label>
                        <select
                          name="shippingProvince"
                          value={form.shippingProvince}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                        >
                          <option value="">Select Province</option>
                          {provinces.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          name="shippingPostalCode"
                          value={form.shippingPostalCode}
                          onChange={handleFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                          placeholder="2000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="shippingCountry"
                        value={form.shippingCountry}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes (Optional) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    rows={3}
                    placeholder="Any special instructions or notes for your order..."
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="mb-6 space-y-4 max-h-60 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{item.title}</div>
                      <div className="text-sm text-gray-600">
                        {item.quantity} × {formatCurrency(item.price)}
                        <span className="ml-2 capitalize text-xs">({item.format})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 border-t border-gray-200 pt-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (15% VAT)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Payment Notice */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-yellow-700">
                    Note: This is a demo checkout. In production, this would connect to PayFast for payment processing.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full mt-6 py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Back to Cart */}
              <div className="mt-4 text-center">
                <Link
                  href="/cart"
                  className="text-gray-600 hover:text-gray-900 hover:underline transition-colors text-sm"
                >
                  ← Back to cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}