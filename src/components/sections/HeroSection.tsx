// src/components/sections/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface HeroSectionProps {
  backgroundImage?: string;
  backgroundAlt?: string;
  showPatterns?: boolean;
}

export default function HeroSection({
  backgroundImage = '/images/hero/main-background.jpg',
  backgroundAlt = 'Life Coach background',
  showPatterns = true
}: HeroSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [yearsCount, setYearsCount] = useState(0);
  const [livesCount, setLivesCount] = useState(0);
  const [workshopsCount, setWorkshopsCount] = useState(0);

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
      
      const timer = setTimeout(() => {
        if (!imageLoaded) setImageLoaded(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [backgroundImage, imageLoaded]);

  // Counting animations for stats
  useEffect(() => {
    if (imageLoaded) {
      // Years counter (0 to 16)
      const yearsInterval = setInterval(() => {
        setYearsCount(prev => {
          if (prev >= 16) {
            clearInterval(yearsInterval);
            return 16;
          }
          return prev + 1;
        });
      }, 80);

      // Lives counter (0 to 3500)
      const livesInterval = setInterval(() => {
        setLivesCount(prev => {
          if (prev >= 100) {
            clearInterval(livesInterval);
            return 3600;
          }
          return prev + Math.ceil(3600 / 100);
        });
      }, 20);

      // Workshops counter (0 to 120)
      const workshopsInterval = setInterval(() => {
        setWorkshopsCount(prev => {
          if (prev >= 80) {
            clearInterval(workshopsInterval);
            return 80;
          }
          return prev + 2;
        });
      }, 30);

      return () => {
        clearInterval(yearsInterval);
        clearInterval(livesInterval);
        clearInterval(workshopsInterval);
      };
    }
  }, [imageLoaded]);

  const handlePodcastClick = () => {
    window.open('https://www.youtube.com/@pastorsifisonkabinde4087', '_blank');
  };

  const backgroundStyle = useFallback
    ? {
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };

  return (
    <section className="relative overflow-hidden md:h-screen">
      {/* MOBILE - OPTIMIZED FOR 360x640 */}
      <div className="md:hidden">
        <div
          className="relative min-h-[50vh] h-[60vh] max-h-[640px] transition-opacity duration-500"
          style={{
            ...backgroundStyle,
            opacity: imageLoaded ? 1 : 0.8,
          }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            </div>
          )}
          
          {/* Stronger gradient at top to prevent navbar overlap */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          
          {/* Extra gradient at top for very small screens */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent" />
          
          {/* UPDATED: More conservative padding for small screens */}
          <div className="relative h-full flex flex-col justify-end px-4 pb-6 pt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-[95%]"
            >
              {/* Smaller text sizes and reduced spacing for 360px */}
              <div className="flex items-center gap-1.5 mb-2">
                <div className="h-[1px] w-6 bg-white" />
                <span className="text-white text-[9px] uppercase tracking-widest font-light">Spiritual Guide</span>
              </div>

              {/* Even more conservative font sizes for very small screens */}
              <h1 className="text-[2.5rem] font-black text-white leading-none tracking-tight mb-1">
                TRANSFORM
              </h1>
              <p className="text-[1.125rem] font-light text-white/90 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
                Lives Through Faith
              </p>

              {/* Slightly smaller button for small screens */}
              <button
                onClick={handlePodcastClick}
                className="bg-white hover:bg-gray-100 text-black font-bold px-4 py-2 text-xs transition-colors active:scale-95 mb-4 w-full max-w-[200px]"
              >
                Think Faith Podcast
              </button>
              
              {/* Mobile Stats - EVEN MORE COMPACT */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ delay: 0.6 }}
                className="pt-3 border-t border-white/20"
              >
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-base font-light text-white">
                      {yearsCount}+
                    </div>
                    <div className="text-[9px] text-white/60">Years</div>
                  </div>
                  <div className="border-x border-white/20 px-1">
                    <div className="text-base font-light text-white">
                      {livesCount.toLocaleString()}+
                    </div>
                    <div className="text-[9px] text-white/60">Lives</div>
                  </div>
                  <div>
                    <div className="text-base font-light text-white">
                      {workshopsCount}+
                    </div>
                    <div className="text-[9px] text-white/60">Events</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* DESKTOP - UNCHANGED */}
      <div className="hidden md:block h-full">
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            ...backgroundStyle,
            opacity: imageLoaded ? 1 : 0.8,
          }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            </div>
          )}
          
          {/* Darker gradient overlay - stronger on left where text is */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90" />
        </div>

        <div className="relative h-full flex items-center">
          <div className="w-full px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-12 gap-8 items-center">
                
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: imageLoaded ? 1 : 0, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="col-span-6 xl:col-span-5 space-y-5"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: imageLoaded ? "60px" : 0 }}
                      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                      className="h-[2px] bg-gradient-to-r from-white to-white/60"
                    />
                    <span className="text-white font-light tracking-[0.3em] text-xs uppercase">
                      Since 2012
                    </span>
                  </div>

                  <div className="space-y-3">
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="leading-[0.9]"
                    >
                      <span className="block text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tighter">
                        PURPOSE
                      </span>
                      <span className="block text-2xl lg:text-3xl xl:text-4xl font-light text-white/90 mt-2 tracking-wide italic" 
                        style={{ fontFamily: 'Georgia, serif' }}>
                        & Success
                      </span>
                    </motion.h1>

                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: imageLoaded ? 1 : 0 }}
                      transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
                      className="w-20 lg:w-24 h-[2px] bg-gradient-to-r from-white via-white/60 to-transparent origin-left"
                    />
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="text-white/80 text-sm lg:text-base max-w-md font-light tracking-wide leading-relaxed"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    Guiding individuals toward spiritual fulfillment and meaningful purpose through faith.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="pt-3"
                  >
                    <button 
                      onClick={handlePodcastClick}
                      className="group relative px-6 lg:px-8 py-3 bg-white hover:bg-gray-100 text-black font-bold text-sm lg:text-base tracking-wide transition-all duration-300 active:scale-95 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="text-xs"
                        >
                          
                        </motion.span>
                        <span>Think Faith Podcast</span>
                      </span>
                      <motion.div
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                    </button>
                  </motion.div>
                </motion.div>

                <div className="hidden lg:block col-span-6 xl:col-span-7" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="bg-black/95 backdrop-blur-sm border-t border-white/10 py-4"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-6">
              
              {/* Stat 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1.0,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-light text-white mb-1" 
                  style={{ fontFamily: 'Georgia, serif' }}>
                  {yearsCount}+
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.5 }}
                  className="text-[10px] lg:text-xs text-white/60 uppercase tracking-[0.25em] font-light"
                >
                  Years Experience
                </motion.div>
              </motion.div>

              {/* Stat 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1.1,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-center border-x border-white/10"
              >
                <div className="text-3xl lg:text-4xl font-light text-white mb-1" 
                  style={{ fontFamily: 'Georgia, serif' }}>
                  {livesCount.toLocaleString()}+
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.6 }}
                  className="text-[10px] lg:text-xs text-white/60 uppercase tracking-[0.25em] font-light"
                >
                  Lives Transformed
                </motion.div>
              </motion.div>

              {/* Stat 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1.2,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-light text-white mb-1" 
                  style={{ fontFamily: 'Georgia, serif' }}>
                  {workshopsCount}+
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1.7 }}
                  className="text-[10px] lg:text-xs text-white/60 uppercase tracking-[0.25em] font-light"
                >
                  Workshops Held
                </motion.div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Pattern Divider */}
      {showPatterns && imageLoaded && (
        <div className="absolute bottom-0 left-0 right-0 h-2">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1200 8">
            <path d="M0,4 Q50,0 100,4 T200,4 Q250,8 300,4 T400,4 Q450,0 500,4 T600,4 Q650,8 700,4 T800,4 Q850,0 900,4 T1000,4 Q1050,8 1100,4 T1200,4"
                  stroke="#ffffff"
                  fill="none"
                  strokeWidth="2"
                  opacity="0.1"/>
          </svg>
        </div>
      )}
    </section>
  );
}