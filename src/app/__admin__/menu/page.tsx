// src/app/admin/menu/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string | null
  isAvailable: boolean
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/menu')
      if (!response.ok) throw new Error('Failed to fetch menu items')
      
      // The API response price is a string (Decimal from Prisma) but our interface uses number. 
      // We will parse it here to match the local state interface, even though it's imperfect.
      const data = (await response.json()).map((item: any) => ({
        ...item,
        price: parseFloat(item.price) // Ensure price is a number for local use
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
        // Update local state
        setMenuItems(prev => prev.map(item => 
          item.id === id ? { ...item, isAvailable: !currentStatus } : item
        ))
      }
    } catch (err) {
      console.error('Error toggling availability:', err)
    }
  }

  // --- NEW DELETE FUNCTIONALITY ---
  const deleteMenuItem = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Optimistically update the UI by filtering the list
        setMenuItems(prev => prev.filter(item => item.id !== id));
        // Or, fetch the list again for full freshness:
        // fetchMenuItems() 
      } else {
        alert('Failed to delete menu item.')
      }
    } catch (err) {
      console.error('Delete error:', err)
      alert('Error deleting item. Check console for details.')
    }
  }
  // --- END NEW DELETE FUNCTIONALITY ---

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading menu items...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-green-700">Menu Management</h1>
              </div>
              <nav className="ml-10 flex space-x-8">
                <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700 font-medium px-3 py-2">
                  Dashboard
                </Link>
                <Link href="/admin/menu" className="text-green-700 font-medium border-b-2 border-green-700 px-3 py-2">
                  Menu Items
                </Link>
                <Link href="/admin/reservations" className="text-gray-500 hover:text-gray-700 font-medium px-3 py-2">
                  Reservations
                </Link>
                <Link href="/admin/orders" className="text-gray-500 hover:text-gray-700 font-medium px-3 py-2">
                  Orders
                </Link>
              </nav>
            </div>
            <div>
              <Link
                href="/admin/menu/new"
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
              >
                + Add New Item
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Banner */}
        <div className="px-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
                <p className="text-gray-600 mt-1">Manage your restaurant&apos;s menu offerings</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-green-600">{menuItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 mb-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items Table */}
        <div className="px-4">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg overflow-hidden">
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="h-10 w-10 object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center bg-gray-100">
                                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAvailability(item.id, item.isAvailable)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link
                            href={`/admin/menu/${item.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteMenuItem(item.id, item.name)} // <--- UPDATED HANDLER
                            className="text-red-600 hover:text-red-900"
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

            {/* Empty State */}
            {menuItems.length === 0 && !loading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new menu item.</p>
                <div className="mt-6">
                  <Link
                    href="/admin/menu/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    + Add New Item
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories Summary */}
        <div className="px-4 mt-8">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from(new Set(menuItems.map(item => item.category))).map(category => {
                const count = menuItems.filter(item => item.category === category).length
                const availableCount = menuItems.filter(item => item.category === category && item.isAvailable).length
                
                return (
                  <div key={category} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{category}</h4>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {count} items &middot; {availableCount} available
                      </p>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(availableCount / Math.max(count, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}