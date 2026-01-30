// src/app/admin/menu/page.tsx - UPDATED WITH SIDEBAR ACCOMMODATION
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Plus, Package, Eye, EyeOff } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string | null
  isAvailable: boolean
  isFeatured: boolean
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'featured'>('all')

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/menu')
      if (!response.ok) throw new Error('Failed to fetch menu items')
      
      const data = (await response.json()).map((item: any) => ({
        ...item,
        price: parseFloat(item.price)
      }))
      setMenuItems(data)
    } catch (err) {
      setError('Error loading menu items')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus })
      })

      if (response.ok) {
        setMenuItems(prev => prev.map(item => 
          item.id === id ? { ...item, isAvailable: !currentStatus } : item
        ))
      }
    } catch (err) {
      console.error('Error toggling availability:', err)
    }
  }

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentStatus })
      })

      if (response.ok) {
        setMenuItems(prev => prev.map(item => 
          item.id === id ? { ...item, isFeatured: !currentStatus } : item
        ))
      }
    } catch (err) {
      console.error('Error toggling featured status:', err)
    }
  }

  const deleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setMenuItems(prev => prev.filter(item => item.id !== id))
      } else {
        alert('Failed to delete menu item.')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting item. Check console for details.')
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price)
  }

  const displayedItems = activeTab === 'featured' 
    ? menuItems.filter(item => item.isFeatured)
    : menuItems

  const featuredCount = menuItems.filter(item => item.isFeatured).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content Container - with proper padding for sidebar */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your restaurant's menu offerings</p>
              </div>
              <Link
                href="/admin/menu/new"
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
              >
                <Plus size={18} className="mr-2" />
                Add New Item
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Items</p>
                    <p className="text-3xl font-bold text-gray-900">{menuItems.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="text-gray-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Featured Items</p>
                    <p className="text-3xl font-bold text-green-600">{featuredCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Star className="text-green-600" size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Available</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {menuItems.filter(item => item.isAvailable).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Eye className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 sm:flex-none py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  All Items ({menuItems.length})
                </button>
                <button
                  onClick={() => setActiveTab('featured')}
                  className={`flex-1 sm:flex-none py-4 px-6 border-b-2 font-medium text-sm flex items-center justify-center gap-2 whitespace-nowrap ${
                    activeTab === 'featured'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Star size={16} />
                  Featured ({featuredCount})
                </button>
              </nav>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Menu Items - Responsive Table/Cards */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-lg overflow-hidden">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="h-12 w-12 object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 flex items-center justify-center bg-gray-100">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleFeatured(item.id, item.isFeatured)}
                          className={`p-2 rounded-lg transition ${
                            item.isFeatured
                              ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                              : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                          }`}
                          title={item.isFeatured ? 'Remove from featured' : 'Add to featured'}
                        >
                          <Star size={18} fill={item.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleAvailability(item.id, item.isAvailable)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition inline-flex items-center gap-1 ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item.isAvailable ? <Eye size={12} /> : <EyeOff size={12} />}
                          {item.isAvailable ? 'Available' : 'Hidden'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link
                            href={`/admin/menu/${item.id}/edit`}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteMenuItem(item.id, item.name)}
                            className="text-red-600 hover:text-red-900 font-medium"
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

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-200">
              {displayedItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 h-20 w-20 bg-gray-200 rounded-lg overflow-hidden">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="h-20 w-20 object-cover"
                        />
                      ) : (
                        <div className="h-20 w-20 flex items-center justify-center bg-gray-100">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <button
                          onClick={() => toggleFeatured(item.id, item.isFeatured)}
                          className={`p-1.5 rounded-lg transition flex-shrink-0 ${
                            item.isFeatured
                              ? 'text-yellow-600 bg-yellow-50'
                              : 'text-gray-400 bg-gray-50'
                          }`}
                        >
                          <Star size={16} fill={item.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {item.category}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        <button
                          onClick={() => toggleAvailability(item.id, item.isAvailable)}
                          className={`px-2 py-0.5 text-xs font-medium rounded-full transition inline-flex items-center gap-1 ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.isAvailable ? <Eye size={10} /> : <EyeOff size={10} />}
                          {item.isAvailable ? 'Available' : 'Hidden'}
                        </button>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <Link
                          href={`/admin/menu/${item.id}/edit`}
                          className="text-xs text-green-600 hover:text-green-900 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteMenuItem(item.id, item.name)}
                          className="text-xs text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {displayedItems.length === 0 && !loading && (
              <div className="text-center py-12 px-4">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {activeTab === 'featured' ? 'No featured items' : 'No menu items'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'featured' 
                    ? 'Click the star icon on items to feature them on your homepage.'
                    : 'Get started by creating a new menu item.'}
                </p>
                {activeTab === 'all' && (
                  <div className="mt-6">
                    <Link
                      href="/admin/menu/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <Plus size={18} className="mr-2" />
                      Add New Item
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categories Summary */}
          {menuItems.length > 0 && (
            <div className="mt-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from(new Set(menuItems.map(item => item.category))).map(category => {
                    const count = menuItems.filter(item => item.category === category).length
                    const availableCount = menuItems.filter(item => item.category === category && item.isAvailable).length
                    const percentage = Math.round((availableCount / Math.max(count, 1)) * 100)
                    
                    return (
                      <div key={category} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition">
                        <h4 className="font-medium text-gray-900 text-sm">{category}</h4>
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">
                            {count} items · {availableCount} available
                          </p>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full transition-all" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{percentage}% available</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}