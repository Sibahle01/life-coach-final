// File: /src/app/(public)/checkout/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, 
  ShoppingCart, 
  Truck, 
  Download, 
  CreditCard,
  CheckCircle,
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react'

interface CartItem {
  id: string
  bookId: string
  title: string
  author: string
  price: number
  format: string
  quantity: number
  coverImageUrl?: string
}

interface CheckoutForm {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  shippingCity: string
  shippingProvince: string
  shippingPostalCode: string
  shippingCountry: string
  notes: string
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
    shippingCountry: 'South Africa',
    notes: ''
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
  const allEbooks = cart.every(item => item.format === 'ebook')

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
    return `R${amount.toFixed(2)}`
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const errors: string[] = []
    if (!form.customerName.trim()) errors.push('Name required')
    if (!form.customerEmail.trim()) errors.push('Email required')
    if (!form.customerPhone.trim()) errors.push('Phone required')
    
    if (hasPhysicalBooks) {
      if (!form.shippingAddress.trim()) errors.push('Address required')
      if (!form.shippingCity.trim()) errors.push('City required')
      if (!form.shippingProvince.trim()) errors.push('Province required')
      if (!form.shippingPostalCode.trim()) errors.push('Postal code required')
    }
    if (cart.length === 0) errors.push('Cart empty')
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      setError(errors.join(' • '))
      return
    }

    setSubmitting(true)
    setError('')

    try {
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
        notes: form.notes || null,
        items: cart.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
          price: item.price,
          format: item.format
        }))
      }

      const response = await fetch('/api/book-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Order failed')
      }

      const order = await response.json()
      
      setOrderNumber(order.orderNumber)
      setOrderCreated(true)
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (cart.length === 0 && !orderCreated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={22} className="text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm mb-5">Your cart is empty</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
            >
              <span>Browse Books</span>
              <ChevronLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-6 md:p-8 max-w-lg mx-auto"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                <CheckCircle size={22} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-xl font-light text-gray-900 text-center mb-1">
              Order Confirmed
            </h1>
            <p className="text-xs text-gray-500 text-center mb-5">
              #{orderNumber}
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-900/5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle size={12} className="text-gray-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 mb-1">What's next?</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-start gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span>Email confirmation sent</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span>{allEbooks ? 'eBooks ready for download' : hasPhysicalBooks ? 'Shipping within 2-3 days' : 'Processing order'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/books"
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors text-center"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => router.push('/')}
                className="flex-1 px-4 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
              >
                Return Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

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
            <Link href="/books" className="hover:text-gray-900">Books</Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-gray-900">Cart</Link>
            <span>/</span>
            <span className="text-gray-900">Checkout</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-light text-gray-900">Checkout</h1>
              <p className="text-xs text-gray-500">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            <Link
              href="/cart"
              className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Cart</span>
            </Link>
          </div>
        </div>

        {/* MOBILE: Order Summary - Sticky at top */}
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
              <span>{submitting ? 'Processing...' : 'Place Order'}</span>
            </button>
          </div>
          
          {/* Delivery indicator */}
          <div className="flex items-center gap-2 mt-1.5">
            <Truck size={12} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">
              {hasPhysicalBooks ? 'R100 shipping' : 'Free shipping'}
            </span>
            {allEbooks && (
              <>
                <span className="text-gray-300">•</span>
                <Download size={12} className="text-gray-400" />
                <span className="text-[10px] text-gray-500">Instant delivery</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - Forms */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-600" />
                    <h2 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Your Details
                    </h2>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                        Full Name <span className="text-gray-900">*</span>
                      </label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="customerName"
                          value={form.customerName}
                          onChange={handleFormChange}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                        Email <span className="text-gray-900">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="customerEmail"
                          value={form.customerEmail}
                          onChange={handleFormChange}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                        Phone <span className="text-gray-900">*</span>
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          name="customerPhone"
                          value={form.customerPhone}
                          onChange={handleFormChange}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                          placeholder="+27 12 345 6789"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information - Only for physical books */}
              {hasPhysicalBooks && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-600" />
                      <h2 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        Shipping Address
                      </h2>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                        Street Address <span className="text-gray-900">*</span>
                      </label>
                      <input
                        type="text"
                        name="shippingAddress"
                        value={form.shippingAddress}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                        placeholder="123 Main Street"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                          City <span className="text-gray-900">*</span>
                        </label>
                        <input
                          type="text"
                          name="shippingCity"
                          value={form.shippingCity}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                          placeholder="Johannesburg"
                        />
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                          Province <span className="text-gray-900">*</span>
                        </label>
                        <select
                          name="shippingProvince"
                          value={form.shippingProvince}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900"
                        >
                          <option value="" className="text-gray-500">Select</option>
                          {provinces.map(p => (
                            <option key={p} value={p} className="text-gray-900">{p}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] uppercase tracking-wide text-gray-500 mb-1.5 font-medium">
                          Postal Code <span className="text-gray-900">*</span>
                        </label>
                        <input
                          type="text"
                          name="shippingPostalCode"
                          value={form.shippingPostalCode}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                          placeholder="2000"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes - Optional */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-gray-600" />
                    <h2 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Additional Notes
                    </h2>
                    <span className="text-[9px] text-gray-400 ml-auto">Optional</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-gray-900 placeholder:text-gray-400"
                    placeholder="Any special instructions..."
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Order Summary - Desktop only */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-28">
                <h2 className="text-sm font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                  Order Summary
                </h2>
                
                {/* Cart items preview */}
                <div className="space-y-2.5 mb-4 max-h-48 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-start text-xs">
                      <div className="flex-1 pr-2">
                        <div className="font-medium text-gray-900 line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-gray-500 text-[10px] mt-0.5">
                          {item.quantity} × {formatCurrency(item.price)} 
                          <span className="ml-1 capitalize">({item.format})</span>
                        </div>
                      </div>
                      <div className="font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (15%)</span>
                    <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">Total</span>
                      <span className="text-lg font-light text-gray-900">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop checkout button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}