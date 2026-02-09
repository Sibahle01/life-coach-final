// src/components/sections/EventsSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const EVENT_GALLERY = [
  { id: 1, alt: "Workshop in progress", image: "/images/events/workshop-1.jpg" },
  { id: 2, alt: "Community gathering", image: "/images/events/gathering-2.jpg" },
  { id: 3, alt: "Leadership session", image: "/images/events/leadership-3.jpg" }
];

export default function EventsSection() {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % EVENT_GALLERY.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-16 md:py-24 bg-white overflow-hidden">
      {/* Black dots pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, black 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-[1px] w-8 bg-gradient-to-r from-transparent via-gray-400 to-transparent" 
            />
            <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-light">
              Events & Workshops
            </span>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-[1px] w-8 bg-gradient-to-r from-gray-400 via-transparent to-transparent" 
            />
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4 leading-tight">
            Join Our Community Events
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light">
            Transform your life through workshops, leadership summits, and spiritual gatherings
          </p>
        </motion.div>
        
        {/* DESKTOP: Content + BIGGER Image Gallery */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Text Content & CTA (6 columns) */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-light text-gray-900 mb-4 leading-tight">
                  Experience Transformative Growth
                </h3>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed font-light mb-4">
                  Our events bring together individuals seeking spiritual clarity, purpose, and community connection through biblical wisdom and practical guidance.
                </p>
                <p className="text-base text-gray-600 leading-relaxed font-light">
                  From intimate workshops to large-scale leadership summits, each event is designed to help you discover your divine purpose and strengthen your faith journey.
                </p>
              </div>

              {/* Event Types */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-1">Purpose Discovery Workshops</h4>
                    <p className="text-sm text-gray-600 font-light">Deep-dive sessions for finding your divine calling</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-1">Leadership Summits</h4>
                    <p className="text-sm text-gray-600 font-light">Multi-day intensives for emerging spiritual leaders</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-1">Community Gatherings</h4>
                    <p className="text-sm text-gray-600 font-light">Regular meetups for spiritual growth and connection</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/events"
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-medium px-8 py-4 rounded-lg transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <Calendar size={20} />
                  <span>View All Events</span>
                  <ArrowRight size={20} />
                </Link>
                
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-900 hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-medium px-8 py-4 rounded-lg transition-all duration-300 active:scale-95"
                >
                  <span>Book Private Session</span>
                </Link>
              </div>

              <p className="text-sm text-gray-500 font-light italic">
                "Every event is a step toward discovering your purpose and deepening your faith."
              </p>
            </motion.div>
          </div>

          {/* RIGHT: BIGGER Diagonal Stacked Real Images (6 columns) */}
          <div className="lg:col-span-6 relative h-[720px]">
            
            {/* Image 1 - Top Right, Rotated - MUCH BIGGER */}
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              whileInView={{ opacity: 1, rotate: 7 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute top-0 right-0 w-72 h-80 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Real image background */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: EVENT_GALLERY[0].image 
                    ? `url(${EVENT_GALLERY[0].image})` 
                    : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Placeholder content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <div className="w-10 h-10 bg-white/40 rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm text-gray-800 font-medium">Past Workshops</p>
              </div>
            </motion.div>

            {/* Image 2 - Center Left, LARGEST - MUCH BIGGER with REAL animation */}
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              whileInView={{ opacity: 1, rotate: -5 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute top-40 left-0 w-80 h-96 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              {/* Real animated image */}
              <motion.div 
                key={activeImage}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                  style={{ 
                    backgroundImage: EVENT_GALLERY[activeImage].image 
                      ? `url(${EVENT_GALLERY[activeImage].image})` 
                      : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={48} className="text-white/80" />
                    </div>
                    <p className="text-white font-light px-6 text-xl drop-shadow-lg">
                      {EVENT_GALLERY[activeImage].alt}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Animated dots indicator */}
              <div className="absolute top-5 left-5 flex gap-2">
                {EVENT_GALLERY.map((_, index) => (
                  <motion.div
                    key={index}
                    animate={{
                      width: activeImage === index ? 24 : 8,
                      backgroundColor: activeImage === index ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)'
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                  />
                ))}
              </div>

              <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-sm rounded-lg px-5 py-3">
                <p className="text-base text-gray-900 font-medium">Live Events Gallery</p>
              </div>
            </motion.div>

            {/* Image 3 - Bottom Right - MUCH BIGGER */}
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              whileInView={{ opacity: 1, rotate: 6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute bottom-0 right-8 w-64 h-72 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Real image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: EVENT_GALLERY[2].image 
                    ? `url(${EVENT_GALLERY[2].image})` 
                    : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Calendar size={32} className="text-white/80" />
                </div>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-sm text-gray-800 font-medium">Upcoming Events</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* MOBILE: Image First, Content Below */}
        <div className="lg:hidden space-y-8">
          
          {/* Mobile Image Gallery - BIGGER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-96 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl overflow-hidden shadow-xl"
          >
            <motion.div 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              {/* Real image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: EVENT_GALLERY[activeImage].image 
                    ? `url(${EVENT_GALLERY[activeImage].image})` 
                    : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={48} className="text-white/80" />
                  </div>
                  <p className="text-white font-light text-2xl drop-shadow-lg">
                    {EVENT_GALLERY[activeImage].alt}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Dots */}
            <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
              {EVENT_GALLERY.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    activeImage === index 
                      ? 'bg-white w-10' 
                      : 'bg-white/50 w-2'
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {/* Mobile Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-3 leading-tight">
                Experience Transformative Growth
              </h3>
              <p className="text-base text-gray-700 leading-relaxed font-light mb-4">
                Our events bring together individuals seeking spiritual clarity, purpose, and community connection.
              </p>
            </div>

            {/* Event Types - Mobile */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={18} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Purpose Discovery Workshops</h4>
                  <p className="text-xs text-gray-600 font-light">Deep-dive sessions for finding your divine calling</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users size={18} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Leadership Summits</h4>
                  <p className="text-xs text-gray-600 font-light">Multi-day intensives for emerging leaders</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar size={18} className="text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Community Gatherings</h4>
                  <p className="text-xs text-gray-600 font-light">Regular spiritual growth meetups</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons - Mobile */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/events"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-medium px-6 py-4 rounded-lg transition-all duration-300 active:scale-95 shadow-lg"
              >
                <Calendar size={20} />
                <span>View All Events</span>
                <ArrowRight size={20} />
              </Link>
              
              <Link
                href="/services"
                className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 font-medium px-6 py-4 rounded-lg transition-all duration-300 active:scale-95"
              >
                <span>Book Private Session</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}