// src/components/sections/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ADDED: Import useRouter

interface HeroSectionProps {
  backgroundImage?: string;
  backgroundAlt?: string;
  showPatterns?: boolean;
}

export default function HeroSection({
  backgroundImage = '/images/hero/main-background.jpg',
  backgroundAlt = 'Ubuntu Garden Lounge ambiance',
  showPatterns = true
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const router = useRouter(); // ADDED: Initialize useRouter

  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      img.onload = () => {
        setImageLoaded(true);
        setUseFallback(false);
      };
      img.onerror = () => {
        console.warn(`Failed to load hero image: ${backgroundImage}`);
        setUseFallback(true);
        setImageLoaded(true);
      };
    }
  }, [backgroundImage]);

  // ADDED: Navigation handler
  const handleMenuClick = () => {
    router.push('/menu');
  };

  // Fallback gradient when image fails
  const backgroundStyle = useFallback
    ? {
        background: 'linear-gradient(135deg, #1a4d2e 0%, #2d5f3f 50%, #d4af37 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };

  return (
    // ADDED: h-screen class to make it full viewport height on desktop
    <section className="relative overflow-hidden md:h-screen">
      {/* MOBILE: Compact Hero */}
      <div className="md:hidden">
        <div
          className="relative h-[50vh] transition-opacity duration-500"
          style={{
            ...backgroundStyle,
            opacity: imageLoaded ? 1 : 0.8,
          }}
        >
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/80 to-gold/30 animate-pulse" />
          )}
          
          {/* Dark overlay for text readability - adjust based on image brightness */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          {/* Content */}
          <div className="relative h-full flex flex-col justify-end p-6 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Small accent line */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-[2px] w-12 bg-gold" />
                <span className="text-gold text-xs uppercase tracking-widest font-light">Since 2020</span>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-black text-cream leading-none tracking-tight mb-2">
                UBUNTU
              </h1>
              <p className="text-2xl font-light text-gold-light mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                Garden Lounge
              </p>

              {/* Quick CTA */}
              <button
                onClick={handleMenuClick} // UPDATED: Use handleMenuClick
                className="bg-gold hover:bg-gold-light text-forest font-bold px-6 py-3 rounded-full text-sm shadow-lg transition-colors active:scale-95"
              >
                View Menu
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* DESKTOP: Full Hero */}
      <div className="hidden md:block h-full">
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            ...backgroundStyle,
            opacity: imageLoaded ? 1 : 0.8,
          }}
        >
          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/80 to-gold/30 animate-pulse" />
          )}
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>

        <div className="relative h-full flex items-center">
          <div className="w-full px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-12 gap-8 items-center">
                
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: imageLoaded ? 1 : 0, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="col-span-6 xl:col-span-5 space-y-8"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: imageLoaded ? "60px" : 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="h-[2px] bg-gradient-to-r from-gold to-gold-light"
                    />
                    <span className="text-gold font-light tracking-[0.3em] text-xs uppercase">
                      Since 2020
                    </span>
                  </div>

                  <div className="space-y-3">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <span className="block text-7xl lg:text-8xl font-black text-cream leading-none tracking-tighter">
                        UBUNTU
                      </span>
                      <span className="block text-4xl lg:text-5xl font-light text-gold-light mt-2 tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                        Garden Lounge
                      </span>
                    </motion.h1>

                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: imageLoaded ? 1 : 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="w-24 h-1 bg-gradient-to-r from-gold via-gold-light to-transparent origin-left"
                    />
                  </div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-xl md:text-2xl text-cream/90 font-light leading-relaxed max-w-lg"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Where African heritage meets modern culinary artistry in the heart of Johannesburg.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 pt-4"
                  >
                    <button className="group relative px-8 py-4 bg-gold hover:bg-gold-light text-forest font-bold text-lg rounded-none overflow-hidden transition-all duration-300 shadow-lg hover:shadow-gold/50 active:scale-95">
                      <span className="relative z-10">Reserve Your Table</span>
                      <div className="absolute inset-0 bg-gold-light transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </button>
                    
                    <button
                      onClick={handleMenuClick} // UPDATED: Use handleMenuClick
                      className="group px-8 py-4 border-2 border-gold text-gold hover:bg-gold hover:text-forest font-semibold text-lg rounded-none transition-all duration-300 active:scale-95"
                    >
                      Explore Menu
                    </button>
                  </motion.div>
                </motion.div>

                <div className="hidden lg:block col-span-6 xl:col-span-7" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pattern Divider */}
      {showPatterns && imageLoaded && (
        <div className="absolute bottom-0 left-0 right-0 h-2">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 8">
            <path d="M0,4 Q50,0 100,4 T200,4 Q250,8 300,4 T400,4 Q450,0 500,4 T600,4 Q650,8 700,4 T800,4 Q850,0 900,4 T1000,4 Q1050,8 1100,4 T1200,4"
                  stroke="#f4c430"
                  fill="none"
                  strokeWidth="2"
                  opacity="0.6"/>
          </svg>
        </div>
      )}
    </section>
  );
}