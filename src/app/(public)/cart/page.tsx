// File: /src/app/(public)/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart)
    if (typeof window !== 'undefined') {
      localStorage.setItem('book-cart', JSON.stringify(newCart))
    }
  }

  const updateQuantity = (id: string, change: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change)
        return { ...item, quantity: newQuantity }
      }
      return item
    })
    saveCart(newCart)
  }

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    saveCart(newCart)
  }

  const clearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      saveCart([])
    }
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Calculate shipping: R100 for physical books, free for eBooks
    const shipping = cart.some(item => item.format === 'physical') ? 100 : 0
    
    // Calculate tax (15% VAT in South Africa)
    const tax = subtotal * 0.15
    
    const total = subtotal + shipping + tax
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }
  }

  const hasPhysicalBooks = cart.some(item => item.format === 'physical')
  const { subtotal, shipping, tax, total } = calculateTotals()

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600">
              {cart.length === 0 ? 'Your cart is empty' : `${cart.length} items in your cart`}
            </p>
          </div>
          <Link
            href="/books"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some books to get started</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Cart Items</h2>
                    <button
                      onClick={clearCart}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Book Cover */}
                        <div className="w-20 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {item.coverImageUrl ? (
                            <img 
                              src={item.coverImageUrl} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-600">by {item.author}</p>
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {item.format}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatCurrency(item.price)} each
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
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

                {/* Shipping Notice */}
                {hasPhysicalBooks && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-700">
                        Physical books require shipping. R100 shipping fee included.
                      </p>
                    </div>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-lg"
                >
                  Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <div className="mt-6 text-center">
                  <Link
                    href="/books"
                    className="text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                  >
                    ← Continue shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}