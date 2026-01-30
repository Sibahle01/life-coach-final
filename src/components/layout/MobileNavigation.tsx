// src/components/layout/MobileNavigation.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
// ADDED: Import CartButton (assuming you have created this component)
import CartButton from '@/components/ui/CartButton'; 
import { Menu, X, Home, Utensils, Calendar, Image, Phone, ShoppingBag, MapPin, Info } from 'lucide-react';

// 🚀 UPDATED NAV_ITEMS array to include ALL pages
const NAV_ITEMS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Menu', href: '/menu', icon: Utensils },
  { name: 'Gallery', href: '/gallery', icon: Image }, // Added Gallery
  { name: 'Reservations', href: '/reservations', icon: Calendar },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: Phone },
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // 1. Scroll Effect Hook: Changes the header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80); // Trigger after scrolling 80px
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic Header Classes
  const headerClass = scrolled 
    ? "bg-white/95 backdrop-blur-md border-cream-dark shadow-md py-3" 
    : "bg-transparent border-transparent py-5";
    
  const desktopLinkClass = scrolled ? "text-charcoal hover:text-forest" : "text-cream hover:text-gold";

  // Split navigation for desktop layout (Updated to 3 sections for the logo gap)
  const leftNav = NAV_ITEMS.slice(0, 2); // Home, Menu
  const rightNav = NAV_ITEMS.slice(2, 6); // Gallery, Reservations, About, Contact
  // Note: The original split was confusing and spread over two different divs. 
  // I will combine center and right into one list for simplicity around the logo.

  // Helper component for the desktop links
  const DesktopNavLink = ({ item }: { item: typeof NAV_ITEMS[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`text-sm font-medium tracking-wider uppercase transition-colors relative group ${
          isActive ? 'text-forest font-semibold' : desktopLinkClass
        }`}
      >
        {item.name}
        <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gold transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
      </Link>
    );
  };

  return (
    <>
      {/* --- 1. TOP NAVIGATION BAR (Desktop & Mobile Hamburger) --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          
          {/* Desktop Left Links */}
          <div className="hidden md:flex items-center gap-8">
            {leftNav.map((item) => <DesktopNavLink key={item.name} item={item} />)}
          </div>

          {/* Logo - Centered on Desktop (Hidden on mobile when menu open) */}
          <Link href="/" className="flex items-center gap-2 group md:mx-auto">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${scrolled ? 'bg-forest text-cream' : 'bg-gold text-forest'}`}>
              <span className="font-serif font-bold text-xl">U</span>
            </div>
            <div className={`hidden sm:block transition-colors duration-300 ${scrolled ? 'text-forest' : 'text-white'}`}>
              <span className="font-bold text-xl tracking-tight leading-none block">Ubuntu</span>
              <span className="text-xs uppercase tracking-widest opacity-80 leading-none block">Garden Lounge</span>
            </div>
          </Link>

          {/* Right Side Actions & Desktop Right Links */}
          <div className="flex items-center gap-4">
            
            {/* Desktop Right Links (Gallery, Reservations, About, Contact) - Now one group */}
            <div className="hidden md:flex items-center gap-8">
                {rightNav.map((item) => <DesktopNavLink key={item.name} item={item} />)}
            </div>

            {/* Cart Button & CTA */}
            <div className="flex items-center gap-2"> 
                {/* REPLACED: Original Shopping Bag button with CartButton */}
                <CartButton 
                    iconColor={scrolled ? 'text-forest' : 'text-white'} 
                    hoverBg={scrolled ? 'hover:bg-cream-dark' : 'hover:bg-white/20'}
                />

                {/* Reservation Button - Desktop Only */}
                <Link 
                    href="/reservations"
                    className="hidden lg:block bg-gold hover:bg-gold-dark text-forest font-bold px-5 py-2.5 rounded-full text-sm transition-all shadow-lg hover:shadow-gold/20 active:scale-95"
                >
                    Reserve Table
                </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-forest hover:bg-cream-dark' : 'text-white hover:bg-white/20'}`}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* --- 2. MOBILE MENU OVERLAY (Right Slide-In) --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Menu Panel - Dark, Elegant Design */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-forest/95 backdrop-blur-md z-50 shadow-2xl md:hidden safe-area-top"
            >
              <div className="flex flex-col h-full text-white">
                
                {/* Menu Header (Title and Close Button) */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-serif text-xl font-light text-gold">Navigation</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-2">
                    {/* Maps over the main NAV_ITEMS */}
                    {NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      const isCTA = item.name === 'Reservations';
                      
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                            isCTA 
                                ? 'bg-gold text-forest font-bold hover:bg-gold-light'
                                : (isActive 
                                    ? 'bg-white/10 text-white font-medium'
                                    : 'hover:bg-white/5 text-cream font-light')
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-lg">{item.name}</span>
                          {isActive && !isCTA && (
                            <div className="ml-auto w-2 h-2 bg-gold rounded-full" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </nav>

                {/* Quick Contact Footer */}
                <div className="p-5 border-t border-white/10">
                  <div className="flex items-start gap-3 mb-3">
                    <MapPin className="text-gold mt-1" size={18} />
                    <div className="text-sm text-cream/70">
                      <p>123 Cultural District</p>
                      <p>Johannesburg, 2001</p>
                    </div>
                  </div>
                  <a href="tel:+27123456789" className="block text-gold font-medium hover:underline">
                    +27 12 345 6789
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- 3. FLOATING MOBILE BOTTOM DOCK (The Modern Pill) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden w-auto">
        <div className="flex items-center bg-charcoal/80 backdrop-blur-xl px-2 py-2 rounded-full shadow-2xl border border-white/10">
            
            {/* Dock items (Home, Menu, Gallery, Reservations) */}
            {NAV_ITEMS.slice(0, 4).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative p-3 rounded-full transition-all duration-300 ${
                    isActive ? 'text-forest' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {/* Framer Motion Layout Animation for smooth pill movement */}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-bubble"
                      className="absolute inset-0 bg-gold rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
            
            <div className="w-[1px] h-6 bg-white/20 mx-1" />
            
            {/* Quick Call Button in the Dock */}
            <a 
                href="tel:+27123456789" 
                className="pl-3 pr-4 py-2 flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-wider hover:text-white transition-colors"
            >
                <Phone size={18} /> 
                Call
            </a>
        </div>
      </div>
    </>
  );
}