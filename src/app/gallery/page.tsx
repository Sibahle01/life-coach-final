// src/app/gallery/page.tsx - DYNAMIC FROM DATABASE
'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Instagram, Share2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  category: string;
}

const galleryCategories = [
  { id: 'all', name: 'All Photos' },
  { id: 'ambiance', name: 'Ambiance' },
  { id: 'food', name: 'Food & Drinks' },
  { id: 'events', name: 'Events' },
  { id: 'people', name: 'People & Social' },
];

export default function GalleryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // Only fetch visible images for public gallery
      const response = await fetch('/api/gallery?visible=true');
      
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  return (
    <main className="min-h-screen bg-cream">
      {/* Hero Header */}
      <div className="relative h-[40vh] md:h-[50vh] bg-gradient-to-br from-forest to-charcoal overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Photo Gallery</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Experience Ubuntu through our lens
            </p>
          </div>
        </div>
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {galleryCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-forest text-cream'
                  : 'bg-white border border-forest/20 text-forest hover:bg-forest hover:text-cream'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
            <p className="mt-4 text-charcoal">Loading gallery...</p>
          </div>
        )}

        {/* Photo Grid */}
        {!loading && filteredImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedImage(photo)}
                className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                  <h3 className="text-white font-bold mb-1">{photo.title}</h3>
                  {photo.description && (
                    <p className="text-white/80 text-sm line-clamp-2">{photo.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-charcoal-light text-lg">
              {selectedCategory === 'all' 
                ? 'No images in gallery yet. Check back soon!' 
                : `No images in ${galleryCategories.find(c => c.id === selectedCategory)?.name} category yet.`}
            </p>
          </div>
        )}

        {/* Social Media CTA */}
        {!loading && images.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-forest/10 text-forest px-6 py-3 rounded-full mb-4">
              <Instagram size={20} />
              <span className="font-semibold">Tag us on Instagram</span>
            </div>
            <h3 className="text-2xl font-bold text-forest mb-2">
              Share Your Ubuntu Experience
            </h3>
            <p className="text-charcoal-light mb-6 max-w-2xl mx-auto">
              Use #UbuntuGardenLounge for a chance to be featured
            </p>
            <button 
              onClick={() => window.open('https://instagram.com', '_blank')}
              className="bg-gradient-to-r from-forest to-forest-light hover:from-forest-light hover:to-forest text-cream font-bold px-8 py-3 rounded-full transition-all shadow-lg active:scale-95"
            >
              Follow on Instagram
            </button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-all"
          >
            <X size={24} />
          </button>
          
          <div 
            className="relative max-w-4xl w-full max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[70vh] bg-black/50 rounded-lg overflow-hidden">
              <Image
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            
            <div className="bg-white rounded-lg p-6 mt-4">
              <h2 className="text-2xl font-bold text-forest mb-2">{selectedImage.title}</h2>
              {selectedImage.description && (
                <p className="text-charcoal-light">{selectedImage.description}</p>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: selectedImage.title,
                        text: selectedImage.description || '',
                        url: window.location.href
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-lg hover:bg-forest-light transition"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}