'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClient } from '@supabase/supabase-js'

// ── Supabase client (reads your existing env vars) ──────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── Types ────────────────────────────────────────────────────────────────────
interface Book {
  id: string
  title: string
  description: string
  author: string
  price: any
  coverImageUrl?: string
  ebookFileUrl?: string
  galleryImages?: string[]
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

// ── Upload helper ────────────────────────────────────────────────────────────
async function uploadToSupabase(
  file: File,
  bucket: string,
  folder: string,
  prefix: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${prefix}-${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}

// ── Component ────────────────────────────────────────────────────────────────
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

  // Upload states
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  const [categories] = useState<Category[]>([
    { value: 'self-help',      label: 'Self-Help & Personal Development' },
    { value: 'business',       label: 'Business & Leadership' },
    { value: 'relationships',  label: 'Relationships & Communication' },
    { value: 'mindfulness',    label: 'Mindfulness & Wellness' },
    { value: 'inspiration',    label: 'Inspiration & Motivation' },
    { value: 'workbook',       label: 'Workbook & Guide' },
  ])

  const emptyForm = {
    title: '', description: '', author: '', price: '',
    coverImageUrl: '', ebookFileUrl: '',
    isbn: '', format: [] as string[],
    stockQuantity: 0, isFeatured: false, isAvailable: true,
    category: 'self-help', pages: '', publicationDate: '',
    order: 0, galleryImages: [] as string[],
  }

  const [formData, setFormData] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => { fetchBooks() }, [])

  useEffect(() => {
    if (editingBook) {
      setFormData({
        title:           editingBook.title || '',
        description:     editingBook.description || '',
        author:          editingBook.author || '',
        price:           editingBook.price?.toString() || '',
        coverImageUrl:   editingBook.coverImageUrl || '',
        ebookFileUrl:    editingBook.ebookFileUrl || '',
        isbn:            editingBook.isbn || '',
        format:          editingBook.format || [],
        stockQuantity:   editingBook.stockQuantity || 0,
        isFeatured:      editingBook.isFeatured || false,
        isAvailable:     editingBook.isAvailable ?? true,
        category:        editingBook.category || 'self-help',
        pages:           editingBook.pages?.toString() || '',
        publicationDate: editingBook.publicationDate
                           ? editingBook.publicationDate.split('T')[0] : '',
        order:           editingBook.order || 0,
        galleryImages:   editingBook.galleryImages || [],
      })
    }
  }, [editingBook])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/books')
      if (!res.ok) throw new Error('Failed to fetch books')
      setBooks(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // ── Upload handlers ────────────────────────────────────────────────────────
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    setUploadMsg('Uploading cover image…')
    try {
      const url = await uploadToSupabase(
        file, 'book-images', 'covers',
        editingBook?.id || 'new'
      )
      setFormData(prev => ({ ...prev, coverImageUrl: url }))
      setUploadMsg('✓ Cover uploaded!')
    } catch {
      setUploadMsg('✗ Cover upload failed')
    } finally {
      setUploadingCover(false)
      setTimeout(() => setUploadMsg(''), 3000)
      e.target.value = ''   // reset input so same file can be re-selected
    }
  }

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploadingGallery(true)
    setUploadMsg(`Uploading ${files.length} image(s)…`)
    try {
      const urls = await Promise.all(
        files.map(f =>
          uploadToSupabase(f, 'book-images', 'gallery', editingBook?.id || 'new')
        )
      )
      setFormData(prev => ({
        ...prev,
        galleryImages: [...(prev.galleryImages || []), ...urls],
      }))
      setUploadMsg(`✓ ${files.length} image(s) uploaded!`)
    } catch {
      setUploadMsg('✗ Gallery upload failed')
    } finally {
      setUploadingGallery(false)
      setTimeout(() => setUploadMsg(''), 3000)
      e.target.value = ''
    }
  }

  const removeGalleryImage = (idx: number) =>
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== idx),
    }))

  // ── Form helpers ───────────────────────────────────────────────────────────
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name === 'format') {
        setFormData(prev => ({
          ...prev,
          format: checked
            ? [...prev.format, value]
            : prev.format.filter(f => f !== value),
        }))
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!formData.title.trim())                                   e.title = 'Title is required'
    if (!formData.description.trim())                             e.description = 'Description is required'
    if (!formData.author.trim())                                  e.author = 'Author is required'
    if (!formData.price || parseFloat(formData.price) <= 0)       e.price = 'Valid price is required'
    if (parseInt(formData.stockQuantity.toString()) < 0)          e.stockQuantity = 'Stock cannot be negative'
    return e
  }

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSubmitting(true)
    try {
      const url    = editingBook ? `/api/books/${editingBook.id}` : '/api/books'
      const method = editingBook ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price:         parseFloat(formData.price),
          stockQuantity: parseInt(formData.stockQuantity.toString()),
          pages:         formData.pages ? parseInt(formData.pages) : null,
          order:         parseInt(formData.order.toString()),
          galleryImages: formData.galleryImages,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to save book')
      fetchBooks()
      handleFormClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit  = (book: Book) => { setEditingBook(book); setIsFormOpen(true) }
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this book? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete')
      fetchBooks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false); setEditingBook(null); setSubmitting(false)
    setFormData(emptyForm); setFormErrors({})
  }

  // ── Formatting helpers ─────────────────────────────────────────────────────
  const formatCurrency = (amount: any) => {
    try {
      const n = typeof amount === 'object' && amount !== null
        ? parseFloat(amount.toString())
        : parseFloat(String(amount ?? 0))
      return `R ${isNaN(n) ? '0.00' : n.toFixed(2)}`
    } catch { return 'R 0.00' }
  }

  const stockBadge = (q: number) =>
    q === 0 ? 'bg-red-100 text-red-800'
    : q <= 10 ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800'

  const stockText = (q: number) =>
    q === 0 ? 'Out of Stock' : q <= 10 ? `Low Stock (${q})` : `In Stock (${q})`

  const statusBadge = (avail: boolean, feat: boolean) =>
    !avail ? 'bg-red-100 text-red-800'
    : feat  ? 'bg-yellow-100 text-yellow-800'
    : 'bg-green-100 text-green-800'

  const statusText = (avail: boolean, feat: boolean) =>
    !avail ? 'Unavailable' : feat ? 'Featured' : 'Available'

  const getCatLabel = (v: string) =>
    categories.find(c => c.value === v)?.label ?? v

  // ── Filtered list + stats ──────────────────────────────────────────────────
  const filtered = books.filter(b => {
    if (search) {
      const s = search.toLowerCase()
      if (![b.title, b.author, b.description].some(f => f.toLowerCase().includes(s))) return false
    }
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false
    if (stockFilter === 'out') return b.stockQuantity === 0
    if (stockFilter === 'low') return b.stockQuantity > 0 && b.stockQuantity <= 10
    if (stockFilter === 'in')  return b.stockQuantity > 10
    return true
  })

  const stats = {
    total:      books.length,
    inStock:    books.filter(b => b.stockQuantity > 0).length,
    outOfStock: books.filter(b => b.stockQuantity === 0).length,
    featured:   books.filter(b => b.isFeatured).length,
    totalStock: books.reduce((s, b) => s + b.stockQuantity, 0),
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books Shop</h1>
          <p className="text-gray-600 mt-2">Manage your published books, eBooks, and audiobooks</p>
        </div>
        <button onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Book
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total Books',   val: stats.total,      color: 'text-gray-900' },
          { label: 'In Stock',      val: stats.inStock,    color: 'text-green-600' },
          { label: 'Out of Stock',  val: stats.outOfStock, color: 'text-red-600' },
          { label: 'Featured',      val: stats.featured,   color: 'text-yellow-600' },
          { label: 'Total Stock',   val: stats.totalStock, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm font-medium text-gray-600">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search books…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900">
              <option value="all">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            <button onClick={fetchBooks}
              className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-6">
              {books.length === 0 ? 'Start by adding your first book' : 'Try adjusting your search or filter'}
            </p>
            <button onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
              Add Your First Book
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Book', 'Details', 'Stock & Price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="py-4 px-6 text-left text-sm font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {book.coverImageUrl ? (
                          <div className="w-16 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{book.title}</h4>
                          <p className="text-sm text-gray-600 truncate">by {book.author}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {book.format.map(f => (
                              <span key={f} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">{f}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 space-y-1 text-sm">
                      <div><span className="text-gray-600">Category: </span><span className="font-medium text-gray-900">{getCatLabel(book.category)}</span></div>
                      {book.pages && <div><span className="text-gray-600">Pages: </span><span className="font-medium text-gray-900">{book.pages}</span></div>}
                      {book.isbn  && <div><span className="text-gray-600">ISBN: </span><span className="font-mono font-medium text-gray-900">{book.isbn}</span></div>}
                      {(book.galleryImages?.length ?? 0) > 0 && (
                        <div><span className="text-gray-600">Gallery: </span><span className="font-medium text-gray-900">{book.galleryImages!.length} image(s)</span></div>
                      )}
                    </td>
                    <td className="py-4 px-6 space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stockBadge(book.stockQuantity)}`}>
                        {stockText(book.stockQuantity)}
                      </span>
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(book.price)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge(book.isAvailable, book.isFeatured)}`}>
                        {statusText(book.isAvailable, book.isFeatured)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(book)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(book.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* ── FORM MODAL ──────────────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBook ? 'Edit Book' : 'Add New Book'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {editingBook ? 'Update your book details' : 'Add a new book to your shop'}
                </p>
              </div>
              <button onClick={handleFormClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">

              {/* Upload progress banner */}
              {uploadMsg && (
                <div className={`p-3 rounded-lg border flex items-center gap-2 text-sm font-medium
                  ${uploadMsg.startsWith('✓')
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : uploadMsg.startsWith('✗')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                  {(uploadingCover || uploadingGallery) && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {uploadMsg}
                </div>
              )}

              {/* Title + Author + Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500`}
                    placeholder="Enter book title" />
                  {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input type="text" name="author" value={formData.author} onChange={handleFormChange}
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.author ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500`}
                    placeholder="Author name" />
                  {formErrors.author && <p className="mt-1 text-sm text-red-600">{formErrors.author}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900">
                    {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${formErrors.description ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500`}
                  placeholder="Describe the book…" />
                {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
              </div>

              {/* Price + Stock + Pages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (R) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                    <input type="number" name="price" value={formData.price} onChange={handleFormChange}
                      min="0" step="0.01"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${formErrors.price ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900`}
                      placeholder="0.00" />
                  </div>
                  {formErrors.price && <p className="mt-1 text-sm text-red-600">{formErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input type="number" name="stockQuantity" value={formData.stockQuantity}
                    onChange={handleFormChange} min="0"
                    className={`w-full px-4 py-3 rounded-lg border ${formErrors.stockQuantity ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900`} />
                  {formErrors.stockQuantity && <p className="mt-1 text-sm text-red-600">{formErrors.stockQuantity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pages (optional)</label>
                  <input type="number" name="pages" value={formData.pages} onChange={handleFormChange} min="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                    placeholder="Number of pages" />
                </div>
              </div>

              {/* ISBN + Publication Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ISBN (optional)</label>
                  <input type="text" name="isbn" value={formData.isbn} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                    placeholder="978-3-16-148410-0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publication Date (optional)</label>
                  <input type="date" name="publicationDate" value={formData.publicationDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900" />
                </div>
              </div>

              {/* ── COVER IMAGE ─────────────────────────────────────────────── */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <label className="block text-sm font-medium text-gray-700">Book Cover Image</label>

                {/* File picker */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Upload from device:</p>
                  <input type="file" accept="image/*" onChange={handleCoverUpload}
                    disabled={uploadingCover || uploadingGallery}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:text-sm file:font-medium file:bg-gray-900 file:text-white
                      hover:file:bg-black disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>

                {/* Live preview */}
                {formData.coverImageUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Preview:</p>
                    <div className="relative w-28 h-36">
                      <img src={formData.coverImageUrl} alt="Cover preview"
                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200" />
                      <button type="button"
                        onClick={() => setFormData(prev => ({ ...prev, coverImageUrl: '' }))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* Manual URL fallback */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Or paste a URL:</p>
                  <input type="url" name="coverImageUrl" value={formData.coverImageUrl}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                    placeholder="https://example.com/cover.jpg" />
                </div>
              </div>

              {/* ── GALLERY IMAGES ───────────────────────────────────────────── */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Gallery Images
                  {formData.galleryImages.length > 0 &&
                    <span className="ml-2 text-xs text-gray-500">({formData.galleryImages.length} added)</span>}
                </label>

                {/* Multi-file picker */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Upload from device (select multiple):</p>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload}
                    disabled={uploadingCover || uploadingGallery}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                      file:text-sm file:font-medium file:bg-gray-900 file:text-white
                      hover:file:bg-black disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>

                {/* Gallery grid preview */}
                {formData.galleryImages.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Gallery Preview:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {formData.galleryImages.map((url, i) => (
                        <div key={i} className="relative">
                          <img src={url} alt={`Gallery ${i + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                          <button type="button" onClick={() => removeGalleryImage(i)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual URL fallback */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Or paste URLs (comma-separated):</p>
                  <textarea
                    value={formData.galleryImages.join(', ')}
                    onChange={e => {
                      const urls = e.target.value.split(',').map(u => u.trim()).filter(Boolean)
                      setFormData(prev => ({ ...prev, galleryImages: urls }))
                    }}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                    placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
                </div>
              </div>

              {/* ── eBOOK FILE URL ───────────────────────────────────────────── */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">eBook File URL (PDF)</label>
                <input type="url" name="ebookFileUrl" value={formData.ebookFileUrl}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900"
                  placeholder="https://…supabase.co/storage/v1/object/public/ebooks/…pdf" />
                <p className="mt-1 text-xs text-gray-500">
                  Upload the PDF to the <code className="bg-gray-200 px-1 rounded">ebooks</code> bucket in Supabase Storage and paste the public URL here.
                </p>
              </div>

              {/* Format checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Formats</label>
                <div className="flex flex-wrap gap-4">
                  {['physical', 'ebook', 'audiobook'].map(fmt => (
                    <label key={fmt} className="flex items-center gap-2">
                      <input type="checkbox" name="format" value={fmt}
                        checked={formData.format.includes(fmt)} onChange={handleFormChange}
                        className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 bg-white" />
                      <span className="text-sm font-medium text-gray-700 capitalize">{fmt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order + flags */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-gray-900" />
                </div>
                {[
                  { id: 'isAvailable', label: 'Available' },
                  { id: 'isFeatured',  label: 'Featured' },
                ].map(f => (
                  <div key={f.id} className="flex items-center gap-3 pt-6">
                    <input type="checkbox" id={f.id} name={f.id}
                      checked={(formData as any)[f.id]} onChange={handleFormChange}
                      className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900 bg-white" />
                    <label htmlFor={f.id} className="text-sm font-medium text-gray-700">{f.label}</label>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <button type="button" onClick={handleFormClose} disabled={submitting}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || uploadingCover || uploadingGallery}
                  className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {editingBook ? 'Updating…' : 'Creating…'}
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