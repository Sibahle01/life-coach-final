// src/components/layout/MobileNavigation.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, BookOpen, Calendar, User, Phone, Podcast, Video } from 'lucide-react';

// Update the Services href to point to /book/flow
const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Services', href: '/book/flow', icon: BookOpen }, // Changed from '/services' to '/book/flow'
  { name: 'Books', href: '/books', icon: BookOpen },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'About', href: '/about', icon: User },
  { name: 'Contact', href: '/contact', icon: Phone },
];

// Also update in the mobile dock
const MOBILE_DOCK_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Services', href: '/book/flow', icon: BookOpen }, // Changed from '/services' to '/book/flow'
  { name: 'Podcast', href: 'https://www.youtube.com/@pastorsifisonkabinde4087', icon: Video, external: true },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desktop navigation link component
  const DesktopNavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`text-sm font-light tracking-wide transition-all duration-300 relative group ${
          isActive ? 'text-white font-normal' : 'text-white/70 hover:text-white'
        }`}
      >
        {item.name}
        <span className={`absolute -bottom-1 left-0 w-full h-[1px] bg-white transform origin-left transition-transform duration-300 ${
          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        }`} />
      </Link>
    );
  };

  return (
    <>
      {/* MAIN NAVIGATION BAR - Glass Morphism */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/60 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/20' 
          : 'bg-black/30 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          
          {/* LEFT: Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              scrolled 
                ? 'bg-white/15 backdrop-blur-sm ring-1 ring-white/20' 
                : 'bg-white/10 backdrop-blur-sm'
            }`}>
              <span className="font-serif font-bold text-xl text-white">P</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-normal text-base tracking-tight leading-none block text-white">
                Pastor Sifiso
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 leading-none block mt-0.5">
                Spiritual Coach
              </span>
            </div>
          </Link>

          {/* RIGHT: Navigation & Actions */}
          <div className="flex items-center gap-6">
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <DesktopNavLink key={item.name} item={item} />
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {/* Podcast Button - Glass Effect */}
              <a
                href="https://www.youtube.com/@pastorsifisonkabinde4087"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  scrolled 
                    ? 'bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20' 
                    : 'bg-white/10 hover:bg-white/15 backdrop-blur-sm'
                } text-white`}
              >
                <Podcast size={16} />
                <span className="text-sm font-light">Podcast</span>
              </a>

              {/* Book Session Button - Premium White */}
              <Link 
                href="/booking"
                className="bg-white hover:bg-white/90 text-black font-medium px-5 py-2.5 rounded-lg text-sm transition-all duration-300 shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-95"
              >
                Book Session
              </Link>
            </div>
            
            {/* Mobile Menu Button - Glass Effect */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-all duration-300 ${
                scrolled 
                  ? 'bg-white/10 backdrop-blur-sm ring-1 ring-white/20' 
                  : 'bg-white/10 backdrop-blur-sm'
              } text-white hover:bg-white/20`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
            />
            
            {/* Menu Panel - Premium Glass */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-black/80 backdrop-blur-2xl z-50 shadow-2xl md:hidden safe-area-top border-l border-white/10"
            >
              <div className="flex flex-col h-full text-white">
                
                {/* Menu Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h2 className="font-light text-lg text-white">Navigation</h2>
                    <p className="text-xs text-white/60 mt-1">Spiritual Guidance</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-2">
                    {NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? 'bg-white/15 backdrop-blur-sm text-white ring-1 ring-white/20' 
                              : 'hover:bg-white/10 text-white/80 backdrop-blur-sm'
                          }`}
                        >
                          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                          <span className="text-base font-light">{item.name}</span>
                          {isActive && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full" />
                          )}
                        </Link>
                      );
                    })}
                    
                    {/* Podcast Link */}
                    <a
                      href="https://www.youtube.com/@pastorsifisonkabinde4087"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-white/10 text-white/80 backdrop-blur-sm"
                    >
                      <Podcast size={20} />
                      <span className="text-base font-light">Think Faith Podcast</span>
                    </a>
                  </div>
                </nav>

                {/* Quick Contact Footer */}
                <div className="p-5 border-t border-white/10">
                  <div className="mb-4">
                    <Link
                      href="/booking"
                      onClick={() => setIsOpen(false)}
                      className="block w-full bg-white hover:bg-white/90 text-black text-center font-medium py-3 px-4 rounded-lg transition-all duration-300 active:scale-95 shadow-lg"
                    >
                      Book Discovery Call
                    </Link>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-white/70 mb-2">Need guidance?</p>
                    <a 
                      href="tel:+27123456789" 
                      className="text-white font-light hover:underline"
                    >
                      +27 12 345 6789
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING MOBILE BOTTOM DOCK - FIXED CENTERING */}
      {!isOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ delay: 0.2 }}
          className="fixed bottom-4 left-0 right-0 z-40 md:hidden px-4"
        >
          <div className="mx-auto max-w-md w-full">
            <div className="flex items-center justify-around bg-black/70 backdrop-blur-2xl px-3 py-3 rounded-full shadow-2xl border border-white/10 ring-1 ring-white/5">
              
              {MOBILE_DOCK_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                if (item.external) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 flex-1 max-w-[70px] min-w-[60px] ${
                        isActive 
                          ? 'text-white bg-white/15 backdrop-blur-sm' 
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[9px] mt-1 font-light uppercase tracking-wide truncate w-full text-center">
                        {item.name}
                      </span>
                    </a>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 flex-1 max-w-[70px] min-w-[60px] relative ${
                      isActive 
                        ? 'text-white bg-white/15 backdrop-blur-sm' 
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[9px] mt-1 font-light uppercase tracking-wide truncate w-full text-center">
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-bubble"
                        className="absolute inset-0 bg-white/15 rounded-lg -z-10 backdrop-blur-sm"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}