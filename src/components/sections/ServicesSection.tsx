// src/components/sections/ServicesSection.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const TESTIMONIAL_IMAGES = [
  { 
    id: 1, 
    alt: "Group coaching session",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80"
  },
  { 
    id: 2, 
    alt: "One-on-one guidance",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80"
  },
  { 
    id: 3, 
    alt: "Workshop participants",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
  },
  { 
    id: 4, 
    alt: "Speaking engagement",
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80"
  }
];

export default function ServicesSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % TESTIMONIAL_IMAGES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % TESTIMONIAL_IMAGES.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + TESTIMONIAL_IMAGES.length) % TESTIMONIAL_IMAGES.length);
  };

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-b from-black via-gray-800 to-white overflow-hidden">
      {/* Transitioning background dots - FASTER gradient */}
      <div className="absolute inset-0">
        {/* Top section - white dots on black */}
        <div className="absolute top-0 left-0 right-0 h-1/3 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Bottom section - black dots on white */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-[1px] w-8 bg-gradient-to-r from-transparent via-white to-transparent" 
            />
            <span className="text-xs uppercase tracking-[0.3em] text-white/70 font-light">
              Services
            </span>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-[1px] w-8 bg-gradient-to-r from-white via-transparent to-transparent" 
            />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-light text-white mb-2">
            Spiritual Guidance & Coaching
          </h2>
          <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto font-light">
            16+ years helping individuals find clarity and purpose
          </p>
        </motion.div>

        {/* COMPACT Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
          
          {/* LEFT: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Key offerings - COMPACT */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-medium text-base mb-1">One-on-One Coaching</h3>
                  <p className="text-white/70 text-sm font-light">Personalized spiritual guidance for your journey</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-medium text-base mb-1">Marriage Counseling</h3>
                  <p className="text-white/70 text-sm font-light">Strengthen relationships through biblical wisdom</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-medium text-base mb-1">Group Sessions</h3>
                  <p className="text-white/70 text-sm font-light">Community-based growth and support</p>
                </div>
              </div>
            </div>

            {/* Stats - INLINE */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-white/20">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-light text-white">3,500+</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wide mt-0.5">Lives</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-xl md:text-2xl font-light text-white">120+</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wide mt-0.5">Workshops</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-2xl font-light text-white">16+</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wide mt-0.5">Years</div>
              </div>
            </div>

            {/* CTA */}
            <div>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black font-medium px-6 py-3 rounded-lg transition-all duration-300 active:scale-95 shadow-lg w-full md:w-auto"
              >
                <Calendar size={18} />
                <span>Book Discovery Session</span>
                <ArrowRight size={18} />
              </Link>
              <p className="text-xs text-white/60 mt-2 font-light">
                Free 15-minute consultation
              </p>
            </div>
          </motion.div>

          {/* RIGHT: Image Slideshow with REAL IMAGES */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900 aspect-[4/3] md:aspect-[4/4] shadow-2xl">
              {/* Real Image with animation */}
              <motion.div 
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: TESTIMONIAL_IMAGES[currentImageIndex].image 
                      ? `url(${TESTIMONIAL_IMAGES[currentImageIndex].image})` 
                      : 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)'
                  }}
                />
                
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <div className="w-8 h-8 bg-white/30 rounded-full"></div>
                  </div>
                  <p className="text-base md:text-lg text-white font-light drop-shadow-lg">
                    {TESTIMONIAL_IMAGES[currentImageIndex].alt}
                  </p>
                </div>
              </motion.div>

              {/* Navigation arrows */}
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
              >
                <ChevronLeft size={18} className="text-gray-800" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
              >
                <ChevronRight size={18} className="text-gray-800" />
              </button>

              {/* Navigation dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {TESTIMONIAL_IMAGES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      currentImageIndex === index 
                        ? 'bg-white w-6' 
                        : 'bg-white/40 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Testimonial - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600 italic font-light">
            "Pastor Sifiso helped me find clarity when I needed it most"
          </p>
          <p className="text-xs text-gray-500 mt-1">— Recent client</p>
        </motion.div>
      </div>
    </section>
  );
}