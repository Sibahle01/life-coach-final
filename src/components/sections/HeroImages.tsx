// src/components/sections/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';

interface HeroSectionProps {
  backgroundImage?: string;
  backgroundAlt?: string;
}

export default function HeroSection({
  backgroundImage = '/images/hero/ambiance.jpg',
  backgroundAlt = 'Ubuntu Garden Lounge'
}: HeroSectionProps) {
  return (
    <>
      {/* MOBILE: Compact Hero */}
      <section className="md:hidden relative h-[50vh] min-h-[400px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundColor: '#1a4d2e', // Fallback color
            }}
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </div>

        {/* Content - Positioned at bottom */}
        <div className="relative h-full flex flex-col justify-end p-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Small decorative line */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-10 bg-gold" />
              <span className="text-gold-light text-xs uppercase tracking-[0.2em] font-semibold">
                Est. 2020
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl font-black text-white leading-none tracking-tight mb-2">
              UBUNTU
            </h1>
            <p className="text-2xl font-light italic text-gold-light mb-5" style={{ fontFamily: 'Georgia, serif' }}>
              Garden Lounge
            </p>

            {/* Tagline */}
            <p className="text-white/90 text-base mb-6 max-w-md leading-relaxed">
              Modern African cuisine meets elegant garden dining
            </p>

            {/* CTA Button */}
            <button className="bg-gold hover:bg-gold-light text-forest font-bold px-6 py-3 rounded-full text-sm shadow-lg transition-all hover:scale-105">
              Reserve a Table
            </button>
          </motion.div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-gold via-gold-light to-gold" />
      </section>

      {/* DESKTOP: Full Hero */}
      <section className="hidden md:block relative h-screen min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundColor: '#1a4d2e',
            }}
          />
          {/* Gradient overlay - darker on left for text */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="w-full px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-12 gap-8 items-center">
                
                {/* LEFT SIDE - Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="col-span-12 lg:col-span-6 xl:col-span-5"
                >
                  {/* Decorative accent */}
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "60px" }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="h-[2px] bg-gold"
                    />
                    <span className="text-gold-light font-semibold tracking-[0.3em] text-xs uppercase">
                      Since 2020
                    </span>
                  </div>

                  {/* Main Headline */}
                  <div className="mb-6">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-none tracking-tighter mb-3"
                    >
                      UBUNTU
                    </motion.h1>
                    
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="text-4xl lg:text-5xl xl:text-6xl font-light italic text-gold-light"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      Garden Lounge
                    </motion.p>

                    {/* Gold accent line */}
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                      className="w-24 h-1 bg-gold mt-4 origin-left"
                    />
                  </div>

                  {/* Tagline */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-xl mb-10"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Where <span className="text-gold-light italic">African heritage</span> meets 
                    modern culinary artistry in the heart of Johannesburg
                  </motion.p>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <button className="group relative px-8 py-4 bg-gold hover:bg-gold-light text-forest font-bold text-lg overflow-hidden transition-all duration-300 shadow-xl hover:shadow-gold/50 hover:scale-105">
                      <span className="relative z-10">Reserve Your Table</span>
                    </button>
                    
                    <button className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-forest font-bold text-lg transition-all duration-300 hover:scale-105">
                      View Menu
                    </button>
                  </motion.div>
                </motion.div>

                {/* RIGHT SIDE - Space for image to show through */}
                <div className="hidden lg:block lg:col-span-6 xl:col-span-7" />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-3">
          <div className="h-full bg-gradient-to-r from-gold via-gold-light to-gold" />
        </div>
      </section>
    </>
  );
}