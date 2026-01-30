// File: /src/app/admin/books/page.tsx (COMPLETE FIXED VERSION)
'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

// Define TypeScript interfaces
interface Book {
  id: string
  title: string
  description: string
  author: string
  price: any // Handle Decimal type from Prisma
  coverImageUrl?: string
  ebookFileUrl?: string
  isbn?: string
  format: string[]
  stockQuantity: number
  isFeatured: boolean
  isAvailable: boolean
  category: string
  pages?: number
  publicationDate?: string
  order: number
  createdAt: string
  updatedAt: string
}

interface Category {
  value: string
  label: string
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const [categories] = useState<Category[]>([
    { value: 'self-help', label: 'Self-Help & Personal Development' },
    { value: 'business', label: 'Business & Leadership' },
    { value: 'relationships', label: 'Relationships & Communication' },
    { value: 'mindfulness', label: 'Mindfulness & Wellness' },
    { value: 'inspiration', label: 'Inspiration & Motivation' },
    { value: 'workbook', label: 'Workbook & Guide' }
  ])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: '',
    price: '',
    coverImageUrl: '',
    ebookFileUrl: '',
    isbn: '',
    format: [] as string[],
    stockQuantity: 0,
    isFeatured: false,
    isAvailable: true,
    category: 'self-help',
    pages: '',
    publicationDate: '',
    order: 0
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (editingBook) {
      setFormData({
        title: editingBook.title || '',
        description: editingBook.description || '',
        author: editingBook.author || '',
        price: editingBook.price?.toString() || '', // Handle Decimal conversion
        coverImageUrl: editingBook.coverImageUrl || '',
        ebookFileUrl: editingBook.ebookFileUrl || '',
        isbn: editingBook.isbn || '',
        format: editingBook.format || [],
        stockQuantity: editingBook.stockQuantity || 0,
        isFeatured: editingBook.isFeatured || false,
        isAvailable: editingBook.isAvailable !== undefined ? editingBook.isAvailable : true,
        category: editingBook.category || 'self-help',
        pages: editingBook.pages?.toString() || '',
        publicationDate: editingBook.publicationDate ? editingBook.publicationDate.split('T')[0] : '',
        order: editingBook.order || 0
      })
    }
  }, [editingBook])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/books')
      if (!response.ok) throw new Error('Failed to fetch books')
      const data = await response.json()
      setBooks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete book')
      }

      fetchBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingBook(null)
    setSubmitting(false)
    setFormData({
      title: '',
      description: '',
      author: '',
      price: '',
      coverImageUrl: '',
      ebookFileUrl: '',
      isbn: '',
      format: [],
      stockQuantity: 0,
      isFeatured: false,
      isAvailable: true,
      category: 'self-help',
      pages: '',
      publicationDate: '',
      order: 0
    })
    setFormErrors({})
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name === 'format') {
        const formatValue = e.target.value
        setFormData(prev => ({
          ...prev,
          format: checked 
            ? [...prev.format, formatValue]
            : prev.format.filter(f => f !== formatValue)
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.title.trim()) errors.title = 'Title is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.author.trim()) errors.author = 'Author is required'
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Valid price is required'
    if (!formData.stockQuantity || parseInt(formData.stockQuantity.toString()) < 0) errors.stockQuantity = 'Valid stock quantity is required'
    
    return errors
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books'
      const method = editingBook ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity.toString()),
          pages: formData.pages ? parseInt(formData.pages) : null,
          order: parseInt(formData.order.toString())
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save book')
      }

      fetchBooks()
      handleFormClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryLabel = (categoryValue: string) => {
    const category = categories.find(c => c.value === categoryValue)
    return category ? category.label : categoryValue
  }

  // FIXED: Handle Decimal type from Prisma
  const formatCurrency = (amount: any) => {
    try {
      // Convert to number safely
      const num = typeof amount === 'object' && amount !== null 
        ? parseFloat(amount.toString()) 
        : typeof amount === 'string'
        ? parseFloat(amount)
        : typeof amount === 'number'
        ? amount
        : 0;
      
      return `R ${isNaN(num) ? '0.00' : num.toFixed(2)}`;
    } catch (error) {
      return 'R 0.00';
    }
  }

  const getStockBadgeColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800'
    if (quantity <= 10) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStockText = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock'
    if (quantity <= 10) return `Low Stock (${quantity})`
    return `In Stock (${quantity})`
  }

  const getStatusBadgeColor = (isAvailable: boolean, isFeatured: boolean) => {
    if (!isAvailable) return 'bg-red-100 text-red-800'
    if (isFeatured) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (isAvailable: boolean, isFeatured: boolean) => {
    if (!isAvailable) return 'Unavailable'
    if (isFeatured) return 'Featured'
    return 'Available'
  }

  // Filter books
  const filteredBooks = books.filter(book => {
    if (search) {
      const searchLower = search.toLowerCase()
      if (!book.title.toLowerCase().includes(searchLower) &&
          !book.author.toLowerCase().includes(searchLower) &&
          !book.description.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    
    if (categoryFilter !== 'all' && book.category !== categoryFilter) return false
    
    if (stockFilter === 'out') return book.stockQuantity === 0
    if (stockFilter === 'low') return book.stockQuantity > 0 && book.stockQuantity <= 10
    if (stockFilter === 'in') return book.stockQuantity > 10
    
    return true
  })

  const stats = {
    total: books.length,
    inStock: books.filter(b => b.stockQuantity > 0).length,
    outOfStock: books.filter(b => b.stockQuantity === 0).length,
    featured: books.filter(b => b.isFeatured).length,
    totalStock: books.reduce((sum, book) => sum + book.stockQuantity, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books Shop</h1>
          <p className="text-gray-600 mt-2">Manage your published books, eBooks, and audiobooks</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Book
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Books</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">In Stock</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.inStock}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Featured</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.featured}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Stock</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalStock}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search books by title, author, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>

            <button
              onClick={fetchBooks}
              className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredBooks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-6">
              {books.length === 0 
                ? "Start by adding your first book to the shop" 
                : "Try adjusting your search or filter"}
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              Add Your First Book
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Book</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Details</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Stock & Price</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {book.coverImageUrl ? (
                          <div className="w-16 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img 
                              src={book.coverImageUrl} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{book.title}</h4>
                          <p className="text-sm text-gray-600 truncate">by {book.author}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {book.format.map(f => (
                              <span key={f} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-600">Category: </span>
                          <span className="font-medium">{getCategoryLabel(book.category)}</span>
                        </div>
                        {book.pages && (
                          <div className="text-sm">
                            <span className="text-gray-600">Pages: </span>
                            <span className="font-medium">{book.pages}</span>
                          </div>
                        )}
                        {book.isbn && (
                          <div className="text-sm">
                            <span className="text-gray-600">ISBN: </span>
                            <span className="font-medium font-mono">{book.isbn}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStockBadgeColor(book.stockQuantity)}`}>
                          {getStockText(book.stockQuantity)}
                        </span>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(book.price)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(book.isAvailable, book.isFeatured)}`}>
                        {getStatusText(book.isAvailable, book.isFeatured)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit book"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete book"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Form Modal - COMPLETE VERSION */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                {editingBook ? 'Update your book details' : 'Add a new book to your shop'}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                    placeholder="Enter book title"
                  />
                  {formErrors.title && <p className="mt-2 text-sm text-red-600">{formErrors.title}</p>}
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Author *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.author ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                    placeholder="Author name"
                  />
                  {formErrors.author && <p className="mt-2 text-sm text-red-600">{formErrors.author}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                  placeholder="Describe the book..."
                />
                {formErrors.description && <p className="mt-2 text-sm text-red-600">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price */}
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
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${formErrors.price ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.price && <p className="mt-2 text-sm text-red-600">{formErrors.price}</p>}
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleFormChange}
                    min="0"
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.stockQuantity ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors`}
                    placeholder="0"
                  />
                  {formErrors.stockQuantity && <p className="mt-2 text-sm text-red-600">{formErrors.stockQuantity}</p>}
                </div>

                {/* Pages */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Pages (optional)
                  </label>
                  <input
                    type="number"
                    name="pages"
                    value={formData.pages}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="Number of pages"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    ISBN (optional)
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="978-3-16-148410-0"
                  />
                </div>

                {/* Publication Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Publication Date (optional)
                  </label>
                  <input
                    type="date"
                    name="publicationDate"
                    value={formData.publicationDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Cover Image URL (optional)
                  </label>
                  <input
                    type="url"
                    name="coverImageUrl"
                    value={formData.coverImageUrl}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="https://example.com/cover.jpg"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    For testing: https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c
                  </p>
                </div>

                {/* eBook File URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    eBook File URL (optional)
                  </label>
                  <input
                    type="url"
                    name="ebookFileUrl"
                    value={formData.ebookFileUrl}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="https://example.com/ebook.pdf"
                  />
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Available Formats
                </label>
                <div className="flex flex-wrap gap-4">
                  {['physical', 'ebook', 'audiobook'].map(format => (
                    <label key={format} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="format"
                        value={format}
                        checked={formData.format.includes(format)}
                        onChange={handleFormChange}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      <span className="text-sm font-medium text-gray-900 capitalize">{format}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order and Status */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleFormChange}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-medium text-gray-900">
                    Available
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleFormChange}
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
                  onClick={handleFormClose}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingBook ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {editingBook ? 'Update Book' : 'Create Book'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}