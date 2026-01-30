// src/app/menu/page.tsx - UPDATED WITH PROPER IMAGE URL HANDLING
'use client';

import MenuHero from '@/components/sections/MenuHero';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Flame, Leaf } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';

// Updated interface to match your Prisma schema
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string; // Comes as string from API (Decimal type)
  category: string; // To match your DB (e.g., 'APPETIZERS')
  imageUrl?: string; // To match your DB
  isFeatured: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  isAvailable: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// --- CONFIGURATION ---

// Map your database categories to frontend categories
const categoryMap: Record<string, string> = {
  'APPETIZERS': 'starters',
  'APPETIZER': 'starters',
  'MAIN_COURSES': 'mains',
  'MAIN_COURSE': 'mains',
  'DESSERTS': 'desserts',
  'DESSERT': 'desserts',
  'DRINKS': 'drinks',
  'DRINK': 'drinks',
  'PLATTERS': 'platters',
  'PLATTER': 'platters',
};

const categories = [
  { id: 'all', name: 'All Items' },
  { id: 'starters', name: 'Starters' },
  { id: 'mains', name: 'Mains' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'platters', name: 'Platters' },
];

const formatPrice = (price: string) => {
  const priceNum = parseFloat(price);
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(priceNum);
};

// Fallback images using Unsplash URLs based on category
const categoryFallbackImages: Record<string, string> = {
  'APPETIZERS': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop&auto=format',
  'APPETIZER': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop&auto=format',
  'MAIN_COURSES': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&auto=format',
  'MAIN_COURSE': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop&auto=format',
  'DESSERTS': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=600&fit=crop&auto=format',
  'DESSERT': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&h=600&fit=crop&auto=format',
  'DRINKS': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=600&fit=crop&auto=format',
  'DRINK': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&h=600&fit=crop&auto=format',
  'DEFAULT': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&auto=format',
};

// Enhanced image helper with proper local/remote handling
const getImageUrl = (item: MenuItem): string => {
  // 1. If we have an imageUrl from database
  if (item.imageUrl) {
    // Check if it's a full URL (http/https)
    if (item.imageUrl.startsWith('http')) {
      return item.imageUrl;
    }
    
    // Check if it already starts with /uploads/
    if (item.imageUrl.startsWith('/uploads/')) {
      return item.imageUrl;
    }
    
    // Assume it's a filename, prepend the upload path
    // Your upload API saves to: /uploads/menu/filename.jpg
    return `/uploads/menu/${item.imageUrl}`;
  }
  
  // 2. Use a category-based fallback
  // Handle both singular and plural forms
  const fallbackCategory = item.category.endsWith('S') ? item.category : `${item.category}S`;
  return categoryFallbackImages[item.category] || categoryFallbackImages[fallbackCategory] || categoryFallbackImages['DEFAULT'];
};


export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, totalItems } = useCart();

  // Fetch menu items from API
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/menu'); 
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        setMenuItems(data);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Transform database category to frontend category
  const getFrontendCategory = (dbCategory: string): string => {
    return categoryMap[dbCategory] || dbCategory.toLowerCase(); 
  };

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => getFrontendCategory(item.category) === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      imageUrl: getImageUrl(item),
      category: getFrontendCategory(item.category),
    });
  };

  // --- RENDERING STATES ---

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <MenuHero />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-charcoal">Loading menu items...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="min-h-screen bg-cream">
        <MenuHero />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gold text-forest px-6 py-2 rounded-full font-semibold hover:bg-gold-light transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // --- MAIN RENDER ---

  return (
    <main className="min-h-screen bg-cream">
      <MenuHero />
      
      {/* Category Filter */}
      <div className="sticky top-0 z-30 bg-white shadow-md border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 snap-center px-4 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-gold text-forest shadow-md'
                    : 'bg-cream text-charcoal hover:bg-cream-dark'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-32 md:pb-8">
        {filteredItems.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-forest/20 to-gold/20">
                  {/* Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {item.isFeatured && (
                      <span className="bg-gold text-forest text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star size={10} className="sm:w-3 sm:h-3" /> Featured
                      </span>
                    )}
                    {item.isSpicy && (
                      <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Flame size={10} className="sm:w-3 sm:h-3" /> Spicy
                      </span>
                    )}
                    {item.isVegetarian && (
                      <span className="bg-green-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Leaf size={10} className="sm:w-3 sm:h-3" /> Veg
                      </span>
                    )}
                    {!item.isAvailable && (
                      <span className="bg-gray-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <Image
                    src={getImageUrl(item)}
                    alt={`${item.name} - Ubuntu Garden Lounge`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                    priority={index < 4}
                  />
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg text-forest mb-1 line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-charcoal-light mb-2 sm:mb-3 line-clamp-2 flex-grow">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-gold">
                      {formatPrice(item.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable}
                      className={`${
                        item.isAvailable 
                          ? 'bg-gold hover:bg-gold-light text-forest' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      } font-bold w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all active:scale-90 shadow-md`}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      {item.isAvailable ? '+' : '×'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-charcoal-light text-lg">No items found in this category</p>
          </div>
        )}

        {/* Show message if no items at all */}
        {menuItems.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-charcoal-light text-lg mb-4">No menu items available</p>
            <p className="text-charcoal-light text-sm">Check back soon or contact us for today's specials</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => {
            const cartButton = document.querySelector('[aria-label*="Shopping cart"]');
            if (cartButton) {
              (cartButton as HTMLButtonElement).click();
            }
          }}
          className="fixed bottom-24 md:bottom-6 right-6 bg-forest text-cream w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center hover:bg-forest-light transition-all z-30 md:hidden"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-1 -right-1 bg-gold text-forest w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        </motion.button>
      )}
    </main>
  );
}