// File: /src/app/(public)/cart/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, 
  ArrowRight, 
  Trash2, 
  Minus, 
  Plus, 
  Package, 
  Download,
  Truck,
  CreditCard,
  ChevronLeft
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

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isClearing, setIsClearing] = useState(false)
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
    setIsClearing(true)
    setTimeout(() => {
      saveCart([])
      setIsClearing(false)
    }, 300)
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shipping = cart.some(item => item.format === 'physical') ? 100 : 0
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
    return `R${amount.toFixed(2)}`
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      const notification = document.createElement('div')
      notification.className = 'fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up'
      notification.innerHTML = `✓ Cart is empty`
      document.body.appendChild(notification)
      setTimeout(() => notification.remove(), 2000)
      return
    }
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
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

      {/* Content - minimal top padding */}
      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16">
        
        {/* COMPACT HEADER - Mobile optimized */}
        <div className="mb-5">
          {/* Breadcrumb - smaller */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
            <Link href="/" className="hover:text-gray-900">Home</Link>
            <span>/</span>
            <Link href="/books" className="hover:text-gray-900">Books</Link>
            <span>/</span>
            <span className="text-gray-900">Cart</span>
          </div>

          {/* Title row - compact */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-light text-gray-900">Cart</h1>
              <p className="text-sm text-gray-500">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </p>
            </div>
            
            {/* Continue shopping - subtle */}
            <Link
              href="/books"
              className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Shop</span>
            </Link>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-600 text-sm mb-4">Your cart is empty</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-colors"
            >
              <span>Browse Books</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* MOBILE: Order Summary - Compact and sticky */}
            <div className="lg:hidden sticky top-[72px] z-10 -mx-4 px-4 pt-2 pb-3 bg-white/95 backdrop-blur-sm border-b border-gray-200 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500">Total</span>
                  <div className="text-xl font-light text-gray-900">{formatCurrency(total)}</div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <CreditCard size={16} />
                  <span>Checkout</span>
                </button>
              </div>
              
              {/* Shipping indicator - subtle */}
              <div className="flex items-center gap-2 mt-1">
                <Truck size={12} className="text-gray-400" />
                <span className="text-[10px] text-gray-500">
                  {hasPhysicalBooks ? 'R100 shipping' : 'Free shipping'}
                </span>
                {cart.every(item => item.format === 'ebook') && (
                  <>
                    <span className="text-gray-300">•</span>
                    <Download size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500">Instant</span>
                  </>
                )}
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Cart Header - minimal */}
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={14} className="text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Items</span>
                    </div>
                    <button
                      onClick={clearCart}
                      disabled={isClearing}
                      className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {isClearing ? 'Clearing...' : 'Clear all'}
                    </button>
                  </div>
                  
                  {/* Cart Items List */}
                  <AnimatePresence>
                    <div className="divide-y divide-gray-100">
                      {cart.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-4"
                        >
                          <div className="flex gap-3">
                            {/* Book Cover - smaller */}
                            <div className="w-14 h-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                              {item.coverImageUrl ? (
                                <img 
                                  src={item.coverImageUrl} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={16} className="text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Item Details - compact */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {item.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 mb-1">{item.author}</p>
                                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border border-gray-200 rounded">
                                    {item.format === 'ebook' ? (
                                      <Download size={10} className="text-gray-500" />
                                    ) : (
                                      <Package size={10} className="text-gray-500" />
                                    )}
                                    <span className="text-[9px] font-medium capitalize text-gray-600">
                                      {item.format}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(item.price * item.quantity)}
                                  </div>
                                </div>
                              </div>

                              {/* Quantity & Remove - inline */}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-400">Qty</span>
                                  <div className="flex items-center border border-gray-200 rounded">
                                    <button
                                      onClick={() => updateQuantity(item.id, -1)}
                                      disabled={item.quantity <= 1}
                                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                      <Minus size={10} />
                                    </button>
                                    <span className="w-6 text-center text-xs text-gray-700">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, 1)}
                                      className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100"
                                    >
                                      <Plus size={10} />
                                    </button>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                </div>
              </div>

              {/* DESKTOP: Order Summary - Compact sidebar */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-5 sticky top-28">
                  <h2 className="text-sm font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-gray-900">
                        {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
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

                  <button
                    onClick={handleCheckout}
                    className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} />
                    <span>Checkout</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}