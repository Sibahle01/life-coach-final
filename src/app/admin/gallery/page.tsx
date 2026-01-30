// src/app/admin/gallery/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'

interface GalleryImage {
  id: string
  title: string
  description: string | null
  imageUrl: string
  category: string
  isVisible: boolean
  order: number
  createdAt: string
}

const categories = [
  { id: 'ambiance', name: 'Ambiance' },
  { id: 'food', name: 'Food & Drinks' },
  { id: 'events', name: 'Events' },
  { id: 'people', name: 'People & Social' }
]

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gallery')
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !currentStatus })
      })

      if (response.ok) {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, isVisible: !currentStatus } : img
        ))
      }
    } catch (error) {
      console.error('Error toggling visibility:', error)
    }
  }

  const deleteImage = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== id))
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory)

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your restaurant photos</p>
          </div>
          <Link
            href="/admin/gallery/new"
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Upload size={18} />
            Upload Image
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Total Images</p>
            <p className="text-2xl font-bold text-gray-900">{images.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Visible</p>
            <p className="text-2xl font-bold text-green-600">
              {images.filter(img => img.isVisible).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Hidden</p>
            <p className="text-2xl font-bold text-gray-600">
              {images.filter(img => !img.isVisible).length}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Categories</p>
            <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Images ({images.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.name} ({images.filter(img => img.category === cat.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={image.imageUrl}
                alt={image.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              
              {/* Visibility Badge */}
              {!image.isVisible && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Hidden
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(image.id, image.isVisible);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-gray-100 transition pointer-events-auto"
                  title={image.isVisible ? 'Hide from public' : 'Show to public'}
                >
                  {image.isVisible ? (
                    <EyeOff size={18} className="text-gray-700" />
                  ) : (
                    <Eye size={18} className="text-gray-700" />
                  )}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteImage(image.id, image.title);
                  }}
                  className="p-2 bg-white rounded-lg hover:bg-red-50 transition pointer-events-auto"
                  title="Delete image"
                >
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h3 className="font-semibold text-sm text-gray-900 truncate">
                {image.title}
              </h3>
              <p className="text-xs text-gray-500 capitalize">{image.category}</p>
              {image.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{image.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredImages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCategory === 'all' 
              ? 'Get started by uploading your first image.'
              : `No images in ${categories.find(c => c.id === selectedCategory)?.name} category.`}
          </p>
          <div className="mt-6">
            <Link
              href="/admin/gallery/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Upload size={18} className="mr-2" />
              Upload Image
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}