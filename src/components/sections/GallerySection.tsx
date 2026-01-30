// src/components/sections/GallerySection.tsx - WITH AFRICAN DESIGN
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import Image from 'next/image';

const galleryImages = [
  {
    id: 1,
    title: "Romantic Evening",
    description: "Intimate dinners under candlelight",
    image: "/images/gallery/romantic-evening.jpg",
    thumbnail: "/images/gallery/romantic-evening.jpg",
    fallbackColor: "from-purple-600/50 to-pink-500/50",
    pattern: "diamond",
  },
  {
    id: 2,
    title: "Social Lounge",
    description: "Friends gathering with hubbly",
    image: "/images/gallery/social-lounge.jpg",
    thumbnail: "/images/gallery/social-lounge.jpg",
    fallbackColor: "from-blue-600/50 to-cyan-500/50",
    pattern: "triangle",
  },
  {
    id: 3,
    title: "Garden Dining",
    description: "Al fresco meals in our courtyard",
    image: "/images/gallery/garden-dining.jpg",
    thumbnail: "/images/gallery/garden-dining.jpg",
    fallbackColor: "from-emerald-600/50 to-green-500/50",
    pattern: "chevron",
  },
  {
    id: 4,
    title: "Live Music",
    description: "African rhythms and jazz nights",
    image: "/images/gallery/live-music.jpg",
    thumbnail: "/images/gallery/live-music.jpg",
    fallbackColor: "from-amber-600/50 to-orange-500/50",
    pattern: "wave",
  },
  {
    id: 5,
    title: "Culinary Art",
    description: "Chef's table presentations",
    image: "/images/gallery/culinary-art.jpg",
    thumbnail: "/images/gallery/culinary-art.jpg",
    fallbackColor: "from-rose-600/50 to-red-500/50",
    pattern: "circle",
  },
  {
    id: 6,
    title: "Sunset Views",
    description: "Panoramic Johannesburg sunsets",
    image: "/images/gallery/sunset-views.jpg",
    thumbnail: "/images/gallery/sunset-views.jpg",
    fallbackColor: "from-orange-600/50 to-yellow-500/50",
    pattern: "zigzag",
  },
];

// African pattern borders
const AfricanBorder = ({ position = 'top' }: { position?: 'top' | 'bottom' | 'both' }) => {
  const patterns = {
    top: "M0,8 Q30,0 60,8 T120,8 Q150,16 180,8 T240,8 Q270,0 300,8 T360,8 Q390,16 420,8 T480,8 Q510,0 540,8 T600,8",
    bottom: "M0,0 Q30,8 60,0 T120,0 Q150,-8 180,0 T240,0 Q270,8 300,0 T360,0 Q390,-8 420,0 T480,0 Q510,8 540,0 T600,0"
  };

  return (
    <div className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 h-4 overflow-hidden`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path 
          d={patterns[position === 'top' ? 'top' : 'bottom']} 
          fill="none" 
          stroke="currentColor"
          strokeWidth="2"
          className="text-gold/30"
        />
      </svg>
    </div>
  );
};

export default function GallerySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = useCallback(() => {
    setDirection(0);
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => prev === 0 ? galleryImages.length - 1 : prev - 1);
  }, []);

  const goToImage = useCallback((index: number) => {
    setDirection(index > activeIndex ? 0 : 1);
    setActiveIndex(index);
  }, [activeIndex]);

  const toggleAutoPlay = () => setIsAutoPlaying(!isAutoPlaying);
  const handleImageError = (id: number) => setImageErrors(prev => ({ ...prev, [id]: true }));

  const activeImage = galleryImages[activeIndex];
  const hasImageError = imageErrors[activeImage.id];

  return (
    <section className="relative bg-cream py-12 md:py-16 overflow-hidden">
      {/* African Pattern Top Border */}
      <AfricanBorder position="top" />
      
      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-gold/40" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/40" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-gold/40" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-gold/40" />

      <div className="relative px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Title with African design accent */}
          <div className="text-center mb-10 relative">
            {/* Decorative lines */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-gold/10 to-forest/10 rounded-full blur-sm" />
              <h2 className="relative text-4xl md:text-5xl font-bold text-forest px-8 py-2">
                Gallery
              </h2>
            </div>
            
            {/* Small pattern dots */}
            <div className="flex justify-center gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div 
                  key={dot}
                  className="w-1.5 h-1.5 rounded-full bg-gold/50"
                  style={{ animationDelay: `${dot * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* MAIN DISPLAY - with African frame */}
          <div className="mb-8 relative">
            {/* Decorative frame */}
            <div className="absolute -inset-4 md:-inset-6 border-2 border-gold/20 rounded-3xl pointer-events-none" />
            <div className="absolute -inset-2 md:-inset-4 border border-forest/10 rounded-2xl pointer-events-none" />
            
            <div className="relative aspect-video md:aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
              
              {/* African pattern overlay on image */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, ${activeImage.pattern === 'circle' ? '#d4af37' : 'transparent'} 2px, transparent 2px)`,
                  backgroundSize: '40px 40px',
                }} />
              </div>
              
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeImage.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction === 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction === 0 ? -100 : 100 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {hasImageError ? (
                    <div className={`absolute inset-0 bg-gradient-to-br ${activeImage.fallbackColor}`} />
                  ) : (
                    <Image
                      src={activeImage.image}
                      alt={activeImage.title}
                      fill
                      className="object-cover"
                      onError={() => handleImageError(activeImage.id)}
                      priority={activeIndex === 0}
                    />
                  )}
                  
                  {/* Gradient overlay with African color blend */}
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/40 via-transparent to-gold/20" />
                  
                  {/* Title with African-inspired typography */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-8">
                    <div className="relative">
                      {/* Text background */}
                      <div className="absolute -inset-4 bg-black/30 backdrop-blur-sm rounded-lg -z-10" />
                      <h3 className="text-2xl md:text-3xl font-bold text-white text-center px-6 py-3">
                        {activeImage.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation with African-inspired buttons */}
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-forest/90 to-forest/70 hover:from-forest hover:to-forest-light backdrop-blur-sm p-3 rounded-full transition-all z-20 shadow-lg hover:scale-110"
                aria-label="Previous"
              >
                <ChevronLeft size={24} className="text-cream" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-l from-forest/90 to-forest/70 hover:from-forest hover:to-forest-light backdrop-blur-sm p-3 rounded-full transition-all z-20 shadow-lg hover:scale-110"
                aria-label="Next"
              >
                <ChevronRight size={24} className="text-cream" />
              </button>

              {/* Auto-play toggle with African pattern */}
              <button
                onClick={toggleAutoPlay}
                className="absolute top-4 right-4 bg-gradient-to-br from-gold to-gold-dark hover:from-gold-light hover:to-gold backdrop-blur-sm p-2.5 rounded-full transition-all z-20 shadow-lg group"
                aria-label={isAutoPlaying ? "Pause" : "Play"}
              >
                {isAutoPlaying ? (
                  <Pause size={18} className="text-forest" />
                ) : (
                  <Play size={18} className="text-forest" />
                )}
                <div className="absolute inset-0 rounded-full border-2 border-gold/30 group-hover:border-gold/50 transition-colors" />
              </button>

              {/* African-inspired dot indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="flex gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToImage(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        activeIndex === idx 
                          ? 'bg-gold scale-125' 
                          : 'bg-cream/60 hover:bg-cream/80'
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* THUMBNAILS - with African pattern accents */}
          <div className="mb-8 relative">
            {/* Pattern background for thumbnails */}
            <div className="absolute inset-0 bg-gradient-to-b from-cream-dark/10 to-transparent rounded-2xl -z-10" />
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gold/20">
              {galleryImages.map((image, index) => {
                const hasThumbError = imageErrors[image.id];
                const isActive = activeIndex === index;
                
                return (
                  <button
                    key={image.id}
                    onClick={() => goToImage(index)}
                    className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 group ${
                      isActive 
                        ? 'ring-4 ring-gold scale-105 shadow-xl' 
                        : 'ring-2 ring-transparent hover:ring-gold/30 hover:scale-102'
                    }`}
                    aria-label={image.title}
                  >
                    {/* Pattern overlay based on image type */}
                    <div className={`absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-20 transition-opacity ${
                      image.pattern === 'diamond' ? 'bg-[linear-gradient(45deg,transparent_45%,#d4af37_50%,transparent_55%)] bg-[length:20px_20px]' :
                      image.pattern === 'triangle' ? 'bg-[linear-gradient(45deg,transparent_48%,#d4af37_50%,transparent_52%)] bg-[length:15px_15px]' :
                      image.pattern === 'chevron' ? 'bg-[linear-gradient(45deg,transparent_30%,#d4af37_35%,transparent_40%)] bg-[length:25px_25px]' :
                      'bg-none'
                    }`} />
                    
                    {hasThumbError ? (
                      <div className={`absolute inset-0 bg-gradient-to-br ${image.fallbackColor}`} />
                    ) : (
                      <Image
                        src={image.thumbnail}
                        alt=""
                        fill
                        className="object-cover"
                        onError={() => handleImageError(image.id)}
                        sizes="(max-width: 640px) 33vw, 16vw"
                      />
                    )}
                    
                    {/* Active state overlay with African pattern */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-forest/20" />
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Title appears on hover */}
                    <div className="absolute bottom-2 left-0 right-0 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white font-semibold text-center truncate">
                        {image.title.split(' ')[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA with African design */}
          <div className="text-center relative">
            {/* Decorative elements */}
            <div className="absolute left-1/4 top-1/2 w-12 h-px bg-gradient-to-r from-transparent to-gold/30" />
            <div className="absolute right-1/4 top-1/2 w-12 h-px bg-gradient-to-l from-transparent to-gold/30" />
            
            <button 
              onClick={() => window.location.href = '/gallery'}
              className="relative bg-gradient-to-r from-forest to-forest-dark hover:from-forest-light hover:to-forest text-cream font-semibold px-8 py-3 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 group overflow-hidden"
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" 
                style={{
                  backgroundImage: `linear-gradient(45deg, transparent 45%, #d4af37 50%, transparent 55%)`,
                  backgroundSize: '20px 20px'
                }}
              />
              
              <span className="relative flex items-center justify-center gap-2">
                View Full Gallery
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              
              {/* Bottom border accent */}
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent group-hover:from-gold-light group-hover:via-gold group-hover:to-gold-light transition-all" />
            </button>
          </div>

        </div>
      </div>

      {/* African Pattern Bottom Border */}
      <AfricanBorder position="bottom" />
    </section>
  );
}