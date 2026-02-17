// File: /src/app/(public)/books/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShoppingCart, BookOpen, Download, Package, ArrowRight } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  price: number
  coverImageUrl?: string
  format: string[]
  description: string
  isAvailable: boolean
  stockQuantity: number
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<any[]>([])
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchBooks()
    loadCart()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (!response.ok) throw new Error('Failed to fetch books')
      const data = await response.json()
      setBooks(data)
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCart = () => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('book-cart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    }
  }

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    if (typeof window !== 'undefined') {
      localStorage.setItem('book-cart', JSON.stringify(newCart))
    }
  }

  const getAvailableFormats = (book: Book) => {
    return book.format.filter(f => {
      // Filter out physical format if stock is 0 or less
      if (f === 'physical' && book.stockQuantity <= 0) return false
      return true
    })
  }

  const addToCart = (book: Book) => {
    const availableFormats = getAvailableFormats(book)
    
    // Auto-select if only one format available
    const format = selectedFormat[book.id] || (availableFormats.length === 1 ? availableFormats[0] : null)
    
    if (!format) {
      alert(`Please select a format for "${book.title}"`)
      return
    }

    const cartItem = {
      id: `${book.id}-${format}-${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      format: format,
      quantity: 1,
      coverImageUrl: book.coverImageUrl
    }

    const newCart = [...cart, cartItem]
    saveCart(newCart)
    
    // Show success message (non-intrusive)
    const notification = document.createElement('div')
    notification.className = 'fixed bottom-4 right-4 bg-black text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up'
    notification.innerHTML = `✓ Added to cart`
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 2000)
  }

  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Black dots background - subtle */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content - with top padding to avoid navbar */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-16">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-light">
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <span>/</span>
                <span className="text-gray-900">Books</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3 leading-tight">
                Published Works
              </h1>
              <p className="text-base md:text-lg text-gray-600 font-light max-w-2xl">
                Explore transformative teachings and insights through our published books
              </p>
            </div>

            {/* Cart Button - Desktop */}
            <Link
              href="/cart"
              className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-lg transition-all duration-300 active:scale-95 font-medium whitespace-nowrap"
            >
              <ShoppingCart size={20} />
              <span>Cart ({cart.length})</span>
            </Link>
          </div>
        </motion.div>

        {/* Cart Button - Mobile Fixed */}
        <Link
          href="/cart"
          className="md:hidden fixed bottom-4 right-4 z-40 flex items-center gap-2 px-5 py-3 bg-black text-white rounded-full shadow-lg active:scale-95 transition-transform font-medium"
        >
          <ShoppingCart size={18} />
          <span>{cart.length}</span>
        </Link>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {books
            .filter(book => book.isAvailable)
            .map((book, index) => {
              const availableFormats = getAvailableFormats(book)
              const isOutOfStock = book.format.includes('physical') && book.stockQuantity <= 0

              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300"
                >
                  {/* Book Cover */}
                  <div className="relative h-64 md:h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {book.coverImageUrl ? (
                      <div className="relative h-full">
                        <img 
                          src={book.coverImageUrl} 
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
                          <BookOpen size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm font-light">No cover image</p>
                      </div>
                    )}

                    {/* Out of Stock Badge */}
                    {isOutOfStock && availableFormats.length > 0 && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full text-xs font-medium text-gray-700">
                        Physical sold out
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-5 md:p-6">
                    {/* Title & Author */}
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2 line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 font-light">
                      by {book.author}
                    </p>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 font-light line-clamp-3 mb-4 leading-relaxed">
                      {book.description}
                    </p>

                    {/* Price */}
                    <div className="mb-5">
                      <div className="text-2xl font-light text-gray-900">
                        {formatCurrency(book.price)}
                      </div>
                    </div>

                    {/* Format Selection - Multiple formats */}
                    {availableFormats.length > 1 && (
                      <div className="mb-4">
                        <label className="block text-xs uppercase tracking-wide text-gray-500 mb-2 font-medium">
                          Choose Format:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {availableFormats.map((format) => (
                            <button
                              key={format}
                              onClick={() => setSelectedFormat({...selectedFormat, [book.id]: format})}
                              className={`
                                px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                flex items-center justify-center gap-2
                                ${selectedFormat[book.id] === format
                                  ? 'bg-black text-white'
                                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }
                              `}
                            >
                              {format === 'ebook' ? <Download size={14} /> : <Package size={14} />}
                              <span className="capitalize">{format}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Single format - just display it */}
                    {availableFormats.length === 1 && (
                      <div className="mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200">
                          {availableFormats[0] === 'ebook' ? <Download size={14} /> : <Package size={14} />}
                          <span className="capitalize">{availableFormats[0]}</span>
                          {availableFormats[0] === 'ebook' && (
                            <span className="text-xs text-gray-500">• Instant</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(book)}
                      disabled={availableFormats.length === 0}
                      className={`
                        w-full py-3 rounded-lg font-medium transition-all duration-300
                        flex items-center justify-center gap-2
                        ${availableFormats.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-black active:scale-95 shadow-sm hover:shadow-md'
                        }
                      `}
                    >
                      {availableFormats.length === 0 ? (
                        'Not Available'
                      ) : (
                        <>
                          <ShoppingCart size={18} />
                          <span>Add to Cart</span>
                          {availableFormats.length > 1 && !selectedFormat[book.id] && (
                            <span className="text-xs opacity-70">• Select format</span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
        </div>

        {/* Empty State */}
        {books.filter(book => book.isAvailable).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 md:py-24"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-3">
              No Books Available
            </h3>
            <p className="text-gray-600 font-light mb-6">
              Check back soon for new releases
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-lg transition-all duration-300 active:scale-95 font-medium"
            >
              <span>Return Home</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        )}

        {/* Bottom spacing for mobile cart button */}
        <div className="h-20 md:hidden" />
      </div>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}