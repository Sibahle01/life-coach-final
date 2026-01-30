// File: /src/app/admin/book-orders/page.tsx
'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

// Define TypeScript interfaces that MATCH YOUR SCHEMA
interface Book {
  id: string
  title: string
  author: string
  price: any
  format: string[]
  coverImageUrl?: string
}

interface BookOrderItem {
  id: string
  bookId: string
  bookOrderId: string
  book: Book
  quantity: number
  price: any
  format: string
  createdAt: string
}

interface BookOrder {
  id: string
  orderNumber: string
  status: string  // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  paymentStatus: string  // PENDING, PAID, REFUNDED, FAILED
  paymentId?: string
  
  // Customer details
  customerName: string
  customerEmail: string
  customerPhone: string
  
  // Shipping details
  shippingAddress?: string
  shippingCity?: string
  shippingProvince?: string
  shippingPostalCode?: string
  shippingCountry: string
  shippingMethod: string
  
  // Order details
  subtotal: any
  shippingCost: any
  tax: any
  total: any
  currency: string
  
  // eBook delivery tracking
  ebookDelivered: boolean
  ebookDeliveryDate?: string
  downloadLink?: string
  downloadExpires?: string
  
  // Physical delivery tracking
  trackingNumber?: string
  carrier?: string
  estimatedDelivery?: string
  deliveredDate?: string
  
  notes?: string
  items: BookOrderItem[]
  createdAt: string
  updatedAt: string
}

export default function BookOrdersPage() {
  const [orders, setOrders] = useState<BookOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<BookOrder | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  // Status update form - ONLY fields that exist in your schema
  const [updateForm, setUpdateForm] = useState({
    status: '',
    paymentStatus: '',
    trackingNumber: '',
    carrier: '',
    notes: '',
    ebookDelivered: false,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingProvince: '',
    shippingPostalCode: '',
    estimatedDelivery: '',
    deliveredDate: ''
  })

  // Order statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
    ebookPending: 0,
    ebookDelivered: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (selectedOrder) {
      setUpdateForm({
        status: selectedOrder.status,
        paymentStatus: selectedOrder.paymentStatus,
        trackingNumber: selectedOrder.trackingNumber || '',
        carrier: selectedOrder.carrier || '',
        notes: selectedOrder.notes || '',
        ebookDelivered: selectedOrder.ebookDelivered,
        customerName: selectedOrder.customerName,
        customerEmail: selectedOrder.customerEmail,
        customerPhone: selectedOrder.customerPhone,
        shippingAddress: selectedOrder.shippingAddress || '',
        shippingCity: selectedOrder.shippingCity || '',
        shippingProvince: selectedOrder.shippingProvince || '',
        shippingPostalCode: selectedOrder.shippingPostalCode || '',
        estimatedDelivery: selectedOrder.estimatedDelivery || '',
        deliveredDate: selectedOrder.deliveredDate || ''
      })
    }
  }, [selectedOrder])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let url = '/api/book-orders'
      const params = []
      
      if (statusFilter !== 'all') params.push(`status=${statusFilter}`)
      
      if (params.length > 0) {
        url += `?${params.join('&')}`
      }
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data = await response.json()
      setOrders(data)
      calculateStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersData: BookOrder[]) => {
    const newStats = {
      total: ordersData.length,
      pending: ordersData.filter(o => o.status === 'PENDING').length,
      confirmed: ordersData.filter(o => o.status === 'CONFIRMED').length,
      shipped: ordersData.filter(o => o.status === 'SHIPPED').length,
      delivered: ordersData.filter(o => o.status === 'DELIVERED').length,
      cancelled: ordersData.filter(o => o.status === 'CANCELLED').length,
      totalRevenue: ordersData.reduce((sum, order) => {
        const total = parseFloat(order.total?.toString() || '0')
        return sum + total
      }, 0),
      ebookPending: ordersData.filter(o => 
        o.items.some(item => item.format === 'ebook') && !o.ebookDelivered
      ).length,
      ebookDelivered: ordersData.filter(o => 
        o.items.some(item => item.format === 'ebook') && o.ebookDelivered
      ).length
    }
    setStats(newStats)
  }

  const handleViewDetails = (order: BookOrder) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  const handleUpdateOrder = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    setUpdating(true)
    try {
      const response = await fetch(`/api/book-orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateForm.status,
          paymentStatus: updateForm.paymentStatus,
          trackingNumber: updateForm.trackingNumber,
          carrier: updateForm.carrier,
          notes: updateForm.notes,
          ebookDelivered: updateForm.ebookDelivered,
          customerName: updateForm.customerName,
          customerEmail: updateForm.customerEmail,
          customerPhone: updateForm.customerPhone,
          shippingAddress: updateForm.shippingAddress,
          shippingCity: updateForm.shippingCity,
          shippingProvince: updateForm.shippingProvince,
          shippingPostalCode: updateForm.shippingPostalCode,
          estimatedDelivery: updateForm.estimatedDelivery || undefined,
          deliveredDate: updateForm.deliveredDate || undefined
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update order')
      }

      fetchOrders()
      setIsDetailsOpen(false)
      setSelectedOrder(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return

    try {
      const response = await fetch(`/api/book-orders/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete order')
      }

      fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleSendEbook = async (orderId: string, customerEmail: string) => {
    if (!confirm(`Send eBook download link to ${customerEmail}?`)) return

    try {
      const response = await fetch(`/api/book-orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'DELIVERED',
          ebookDelivered: true,
          ebookDeliveryDate: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send eBook')
      }

      alert(`eBook download link sent to ${customerEmail}`)
      fetchOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send eBook')
    }
  }

  const formatCurrency = (amount: any) => {
    try {
      const num = typeof amount === 'object' && amount !== null 
        ? parseFloat(amount.toString()) 
        : typeof amount === 'string'
        ? parseFloat(amount)
        : typeof amount === 'number'
        ? amount
        : 0
      
      return `R ${isNaN(num) ? '0.00' : num.toFixed(2)}`
    } catch (error) {
      return 'R 0.00'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'SHIPPED': return 'bg-purple-100 text-purple-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending'
      case 'CONFIRMED': return 'Confirmed'
      case 'SHIPPED': return 'Shipped'
      case 'DELIVERED': return 'Delivered'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'REFUNDED': return 'bg-blue-100 text-blue-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending'
      case 'PAID': return 'Paid'
      case 'REFUNDED': return 'Refunded'
      case 'FAILED': return 'Failed'
      default: return status
    }
  }

  const hasEbooks = (order: BookOrder) => {
    return order.items.some(item => item.format === 'ebook')
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerEmail.toLowerCase().includes(searchLower) ||
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.trackingNumber?.toLowerCase().includes(searchLower) ||
        order.items.some(item => 
          item.book?.title.toLowerCase().includes(searchLower)
        )
      )
    }
    return true
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Book Orders</h1>
          <p className="text-gray-600 mt-2">Manage physical book shipments and eBook deliveries</p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Orders
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Revenue</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Pending eBooks</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.ebookPending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Delivered eBooks</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.ebookDelivered}</p>
        </div>
      </div>

      {/* Status Quick Stats */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {getStatusText(status)} ({stats[status.toLowerCase() as keyof typeof stats] || 0})
          </button>
        ))}
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All Orders
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by customer name, email, order number, tracking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              onClick={fetchOrders}
              className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {orders.length === 0 
                ? "No orders have been placed yet" 
                : "Try adjusting your search or filter"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Order Details</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Customer</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Items</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">#{order.orderNumber}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </div>
                        {order.trackingNumber && (
                          <div className="text-sm">
                            <span className="text-gray-600">Tracking: </span>
                            <span className="font-medium font-mono">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-600">{order.customerEmail}</div>
                        <div className="text-sm text-gray-600">{order.customerPhone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            {item.book?.coverImageUrl ? (
                              <div className="w-10 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                <img 
                                  src={item.book.coverImageUrl} 
                                  alt={item.book.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                </svg>
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {item.book?.title || 'Unknown Book'}
                              </div>
                              <div className="text-xs text-gray-600">
                                {item.quantity} × {formatCurrency(item.price)}
                                <span className="ml-2 capitalize">({item.format})</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-600">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                        {hasEbooks(order) && (
                          <div className="text-sm">
                            <span className="text-gray-600">eBook: </span>
                            <span className={`font-medium ${order.ebookDelivered ? 'text-green-600' : 'text-red-600'}`}>
                              {order.ebookDelivered ? 'Delivered' : 'Pending'}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                        >
                          View/Update
                        </button>
                        {hasEbooks(order) && !order.ebookDelivered && order.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleSendEbook(order.id, order.customerEmail)}
                            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 font-medium rounded-lg transition-colors"
                          >
                            Send eBook
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 font-medium rounded-lg transition-colors"
                        >
                          Delete
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

      {/* Order Details Modal */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => {
                    setIsDetailsOpen(false)
                    setSelectedOrder(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            <form onSubmit={handleUpdateOrder} className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={updateForm.customerName}
                      onChange={(e) => setUpdateForm({...updateForm, customerName: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={updateForm.customerEmail}
                      onChange={(e) => setUpdateForm({...updateForm, customerEmail: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Customer Phone
                    </label>
                    <input
                      type="text"
                      value={updateForm.customerPhone}
                      onChange={(e) => setUpdateForm({...updateForm, customerPhone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Shipping Address
                    </label>
                    <input
                      type="text"
                      value={updateForm.shippingAddress}
                      onChange={(e) => setUpdateForm({...updateForm, shippingAddress: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={updateForm.shippingCity}
                      onChange={(e) => setUpdateForm({...updateForm, shippingCity: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Province
                    </label>
                    <input
                      type="text"
                      value={updateForm.shippingProvince}
                      onChange={(e) => setUpdateForm({...updateForm, shippingProvince: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={updateForm.shippingPostalCode}
                      onChange={(e) => setUpdateForm({...updateForm, shippingPostalCode: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3 flex-1">
                        {item.book?.coverImageUrl ? (
                          <div className="w-16 h-20 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                            <img 
                              src={item.book.coverImageUrl} 
                              alt={item.book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-20 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.book?.title || 'Unknown Book'}
                          </h4>
                          <p className="text-sm text-gray-600">by {item.book?.author || 'Unknown Author'}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </span>
                            <span className="text-sm text-gray-600 capitalize">
                              Format: {item.format}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.price)} each
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(parseFloat(item.price.toString()) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-lg font-medium text-gray-900">{formatCurrency(selectedOrder.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-lg font-medium text-gray-900">{formatCurrency(selectedOrder.shippingCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tax</p>
                    <p className="text-lg font-medium text-gray-900">{formatCurrency(selectedOrder.tax)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                </div>
              </div>

              {/* Order Status Update */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Order Status
                    </label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={updateForm.paymentStatus}
                      onChange={(e) => setUpdateForm({...updateForm, paymentStatus: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="REFUNDED">Refunded</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="ebookDelivered"
                    checked={updateForm.ebookDelivered}
                    onChange={(e) => setUpdateForm({...updateForm, ebookDelivered: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <label htmlFor="ebookDelivered" className="text-sm font-medium text-gray-900">
                    eBook Delivered
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={updateForm.trackingNumber}
                      onChange={(e) => setUpdateForm({...updateForm, trackingNumber: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                      placeholder="Enter tracking number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Carrier
                    </label>
                    <select
                      value={updateForm.carrier}
                      onChange={(e) => setUpdateForm({...updateForm, carrier: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    >
                      <option value="">Select carrier</option>
                      <option value="post_office">South African Post Office</option>
                      <option value="postnet">PostNet</option>
                      <option value="the_courier_guy">The Courier Guy</option>
                      <option value="ram_couriers">RAM Couriers</option>
                      <option value="dhl">DHL</option>
                      <option value="fedex">FedEx</option>
                      <option value="ups">UPS</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Estimated Delivery
                    </label>
                    <input
                      type="date"
                      value={updateForm.estimatedDelivery?.split('T')[0] || ''}
                      onChange={(e) => setUpdateForm({...updateForm, estimatedDelivery: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Delivered Date
                    </label>
                    <input
                      type="date"
                      value={updateForm.deliveredDate?.split('T')[0] || ''}
                      onChange={(e) => setUpdateForm({...updateForm, deliveredDate: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={updateForm.notes}
                    onChange={(e) => setUpdateForm({...updateForm, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    placeholder="Add any notes about this order..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                  className="px-6 py-3 text-red-700 bg-red-50 hover:bg-red-100 font-medium rounded-lg transition-colors"
                >
                  Delete Order
                </button>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailsOpen(false)
                      setSelectedOrder(null)
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Update Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}