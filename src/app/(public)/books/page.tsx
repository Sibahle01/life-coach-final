// File: /src/app/(public)/books/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    alert(`Added "${book.title}" (${format}) to cart`)
  }

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Store</h1>
          <p className="text-gray-600">Browse and purchase books from our collection</p>
        </div>

        {/* Cart Indicator */}
        <div className="flex justify-end mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            View Cart ({cart.length} items)
          </Link>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books
            .filter(book => book.isAvailable)
            .map((book) => {
              const availableFormats = getAvailableFormats(book)
              const isOutOfStock = book.format.includes('physical') && book.stockQuantity <= 0

              return (
                <div key={book.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Book Cover */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {book.coverImageUrl ? (
                      <img 
                        src={book.coverImageUrl} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                        </svg>
                        <p className="text-gray-500 mt-2">No cover image</p>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 mb-4">by {book.author}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 line-clamp-3">{book.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(book.price)}
                      </div>
                      {isOutOfStock && availableFormats.length > 0 && (
                        <div className="text-sm text-red-600 mt-1">
                          Physical copies out of stock
                        </div>
                      )}
                    </div>

                    {/* Format Selection - Only show if multiple formats available */}
                    {availableFormats.length > 1 && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Format:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableFormats.map((format) => (
                            <button
                              key={format}
                              onClick={() => setSelectedFormat({...selectedFormat, [book.id]: format})}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                                selectedFormat[book.id] === format
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {format}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Single format - just display it */}
                    {availableFormats.length === 1 && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">Format:</div>
                        <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                          {availableFormats[0]}
                          {availableFormats[0] === 'ebook' && ' (Instant Download)'}
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(book)}
                      disabled={availableFormats.length === 0}
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        availableFormats.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-900 text-white hover:bg-black'
                      }`}
                    >
                      {availableFormats.length === 0
                        ? 'Not Available'
                        : availableFormats.length === 1
                        ? `Add to Cart (${availableFormats[0]})`
                        : selectedFormat[book.id]
                        ? `Add to Cart (${selectedFormat[book.id]})`
                        : 'Select Format to Add to Cart'}
                    </button>
                  </div>
                </div>
              )
            })}
        </div>

        {books.filter(book => book.isAvailable).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books available</h3>
            <p className="text-gray-600">Check back soon for new releases</p>
          </div>
        )}
      </div>
    </div>
  )
}