// File: /src/app/(public)/books/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Book {
  id: string
  title: string
  author: string
  description: string
  price: number
  coverImageUrl?: string
  ebookFileUrl?: string
  isbn?: string
  format: string[]
  stockQuantity: number
  isAvailable: boolean
  isFeatured: boolean
  category: string
  pages?: number
  publicationDate?: string
  order: number
  createdAt: string
  updatedAt: string
}

export default function SingleBookPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    if (bookId) {
      fetchBook()
      loadCart()
    }
  }, [bookId])

  // Auto-select format if only one available
  useEffect(() => {
    if (book && !selectedFormat) {
      const availableFormats = getAvailableFormats(book)
      if (availableFormats.length === 1) {
        setSelectedFormat(availableFormats[0])
      }
    }
  }, [book, selectedFormat])

  const fetchBook = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/books/${bookId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Book not found')
          return
        }
        throw new Error('Failed to fetch book')
      }
      
      const data = await response.json()
      setBook(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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

  const getAvailableFormats = (bookData: Book) => {
    return bookData.format.filter(f => {
      // Filter out physical format if stock is 0 or less
      if (f === 'physical' && bookData.stockQuantity <= 0) return false
      return true
    })
  }

  const addToCart = () => {
    if (!book) {
      alert('Book not found')
      return
    }
    
    if (!selectedFormat) {
      alert(`Please select a format for "${book.title}"`)
      return
    }

    setAddingToCart(true)

    try {
      const cartItem = {
        id: `${book.id}-${selectedFormat}-${Date.now()}`,
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        format: selectedFormat,
        quantity: quantity,
        coverImageUrl: book.coverImageUrl
      }

      const newCart = [...cart, cartItem]
      setCart(newCart)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('book-cart', JSON.stringify(newCart))
      }

      setTimeout(() => {
        setAddingToCart(false)
        alert(`Added "${book.title}" (${selectedFormat}) to cart!`)
      }, 500)

    } catch (error) {
      setAddingToCart(false)
      alert('Failed to add to cart. Please try again.')
    }
  }

  const buyNow = () => {
    if (!book) {
      alert('Book not found')
      return
    }
    
    if (!selectedFormat) {
      alert(`Please select a format for "${book.title}"`)
      return
    }

    const cartItem = {
      id: `${book.id}-${selectedFormat}-${Date.now()}`,
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      format: selectedFormat,
      quantity: quantity,
      coverImageUrl: book.coverImageUrl
    }

    const newCart = [...cart, cartItem]
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('book-cart', JSON.stringify(newCart))
    }

    router.push('/checkout')
  }

  const formatCurrency = (amount: number) => {
    return `R ${amount.toFixed(2)}`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Book Not Found</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
            >
              ← Back to Book Store
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return null
  }

  const availableFormats = getAvailableFormats(book)
  const isPhysicalOutOfStock = book.format.includes('physical') && book.stockQuantity <= 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/books" className="hover:text-gray-900 transition-colors">
              Books
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{book.title}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Book Image & Basic Info */}
          <div>
            {/* Book Cover */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
              <div className="aspect-[3/4] max-w-md mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-lg">
                {book.coverImageUrl ? (
                  <img 
                    src={book.coverImageUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                    </svg>
                    <p className="text-gray-500 text-center">No cover image available</p>
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-6 flex flex-wrap gap-3">
                {book.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
                {isPhysicalOutOfStock && availableFormats.length > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Physical: Out of Stock
                  </span>
                )}
                {book.stockQuantity > 0 && book.stockQuantity <= 10 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Low Stock ({book.stockQuantity} left)
                  </span>
                )}
                {book.stockQuantity > 10 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    In Stock ({book.stockQuantity} available)
                  </span>
                )}
              </div>
            </div>

            {/* Book Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Book Details</h3>
              
              <div className="space-y-3">
                {book.isbn && (
                  <div className="flex">
                    <span className="w-32 text-gray-600">ISBN:</span>
                    <span className="font-medium font-mono">{book.isbn}</span>
                  </div>
                )}
                
                {book.pages && (
                  <div className="flex">
                    <span className="w-32 text-gray-600">Pages:</span>
                    <span className="font-medium">{book.pages}</span>
                  </div>
                )}
                
                {book.publicationDate && (
                  <div className="flex">
                    <span className="w-32 text-gray-600">Published:</span>
                    <span className="font-medium">{formatDate(book.publicationDate)}</span>
                  </div>
                )}
                
                <div className="flex">
                  <span className="w-32 text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{book.category.replace('-', ' ')}</span>
                </div>
                
                <div className="flex">
                  <span className="w-32 text-gray-600">Formats:</span>
                  <div className="flex flex-wrap gap-2">
                    {book.format.map(format => (
                      <span 
                        key={format}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium capitalize ${
                          format === 'physical' && book.stockQuantity <= 0
                            ? 'bg-gray-100 text-gray-500 line-through'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {format}
                        {format === 'physical' && book.stockQuantity <= 0 && ' (Out of stock)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Purchase Info */}
          <div>
            {/* Book Title & Author */}
            <div className="mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600">by {book.author}</p>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900">
                {formatCurrency(book.price)}
              </div>
              <p className="text-gray-600 mt-1">Inclusive of 15% VAT</p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
              <div className="prose max-w-none text-gray-700">
                {book.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Purchase Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase Options</h3>

              {/* Format Selection - Multiple formats */}
              {availableFormats.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Select Format:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableFormats.map(format => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 capitalize ${
                          selectedFormat === format
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {format === 'ebook' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          )}
                          {format === 'physical' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                          )}
                          {format === 'audiobook' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          )}
                        </svg>
                        <span>{format}</span>
                        {format === 'ebook' && (
                          <span className="text-xs opacity-75">(Instant)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Format - Display only */}
              {availableFormats.length === 1 && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-900 mb-2">Format:</div>
                  <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 capitalize">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {availableFormats[0] === 'ebook' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      )}
                      {availableFormats[0] === 'physical' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                      )}
                      {availableFormats[0] === 'audiobook' && (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      )}
                    </svg>
                    <span className="font-medium text-gray-900">{availableFormats[0]}</span>
                    {availableFormats[0] === 'ebook' && (
                      <span className="text-xs text-green-600">(Instant Download)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Warning for multi-format books */}
              {availableFormats.length > 1 && !selectedFormat && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-yellow-700">
                      Please select a format before adding to cart
                    </p>
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Quantity:
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">{formatCurrency(book.price * quantity)}</span>
                    <span className="text-sm ml-2">total</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={addToCart}
                  disabled={!selectedFormat || addingToCart || availableFormats.length === 0}
                  className={`w-full py-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    !selectedFormat || availableFormats.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-black'
                  }`}
                >
                  {addingToCart ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {selectedFormat ? `Add to Cart (${selectedFormat})` : 'Select Format First'}
                    </>
                  )}
                </button>

                <button
                  onClick={buyNow}
                  disabled={!selectedFormat || availableFormats.length === 0}
                  className={`w-full py-4 rounded-lg font-medium transition-colors capitalize ${
                    !selectedFormat || availableFormats.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 text-white hover:bg-gray-900 border border-gray-900'
                  }`}
                >
                  {selectedFormat ? `Buy Now (${selectedFormat})` : 'Select Format First'}
                </button>
              </div>

              {/* Format-specific info */}
              {selectedFormat === 'physical' && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Shipping Information</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• R100 shipping fee applies</li>
                        <li>• Delivery within 5-7 business days in South Africa</li>
                        <li>• Tracking number provided upon shipment</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedFormat === 'ebook' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-green-900 mb-1">Instant Delivery</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Download link sent immediately after payment</li>
                        <li>• Access on any device</li>
                        <li>• No shipping fees</li>
                        <li>• Available 24/7</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Back to Books */}
            <div className="mt-6">
              <Link
                href="/books"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:underline transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to All Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}