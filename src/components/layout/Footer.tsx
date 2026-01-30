// src/components/layout/Footer.tsx - PROFESSIONAL VERSION
'use client';

import Link from 'next/link';
import { 
  MapPin, Phone, Mail, Clock, 
  Facebook, Instagram, Twitter, ArrowUpRight,
  Heart, Leaf, Users
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-forest text-cream">
      {/* Top Section - Elegant divider */}
      <div className="border-t border-cream/10">
        <div className="px-4 sm:px-6 lg:px-8">
          
          {/* Main Content - Clean grid layout */}
          <div className="max-w-7xl mx-auto py-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
              
              {/* Brand Column */}
              <div className="md:col-span-4 lg:col-span-3">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 flex items-center justify-center">
                      <span className="font-serif font-bold text-2xl text-gold">U</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Ubuntu</h2>
                      <p className="text-sm opacity-90 font-light">Garden Lounge</p>
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-80 leading-relaxed">
                    A celebration of African culinary heritage, 
                    where traditional flavors meet contemporary 
                    elegance in the heart of Johannesburg.
                  </p>
                  
                  {/* Values */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Leaf size={12} className="text-gold" />
                      <span>Local Ingredients</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Users size={12} className="text-gold" />
                      <span>Community Focus</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Column */}
              <div className="md:col-span-4 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-cream/10">
                  Get in Touch
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                    <MapPin className="text-gold mt-1 flex-shrink-0" size={16} />
                    <div>
                      <p className="font-medium group-hover:text-gold transition-colors">
                        123 Cultural District
                      </p>
                      <p className="text-sm opacity-80">Johannesburg, 2001</p>
                    </div>
                  </div>
                  
                  <a 
                    href="tel:+27111234567" 
                    className="flex items-center gap-3 group"
                  >
                    <Phone className="text-gold" size={16} />
                    <div>
                      <p className="font-medium group-hover:text-gold transition-colors">
                        +27 11 123 4567
                      </p>
                      <p className="text-sm opacity-80">Reservations & Inquiries</p>
                    </div>
                  </a>
                  
                  <a 
                    href="mailto:info@ubuntugarden.co.za" 
                    className="flex items-center gap-3 group"
                  >
                    <Mail className="text-gold" size={16} />
                    <div>
                      <p className="font-medium group-hover:text-gold transition-colors">
                        info@ubuntugarden.co.za
                      </p>
                      <p className="text-sm opacity-80">General inquiries</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Hours Column */}
              <div className="md:col-span-4 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-cream/10">
                  Opening Hours
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Monday - Thursday</span>
                    <span className="font-medium">12:00 - 23:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Friday - Saturday</span>
                    <span className="font-medium">12:00 - 01:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Sunday</span>
                    <span className="font-medium">12:00 - 22:00</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-cream/10">
                    <p className="text-xs opacity-70 italic">
                      Last orders 1 hour before closing
                    </p>
                  </div>
                </div>
              </div>

              {/* Social & Links Column */}
              <div className="md:col-span-12 lg:col-span-3">
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-cream/10">
                  Connect With Us
                </h3>
                <div className="space-y-6">
                  {/* Social Media */}
                  <div className="flex gap-3">
                    <a 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-cream/10 hover:bg-cream/20 border border-cream/20 flex items-center justify-center transition-all hover:scale-105 group"
                      aria-label="Instagram"
                    >
                      <Instagram size={18} className="group-hover:text-gold transition-colors" />
                    </a>
                    <a 
                      href="https://facebook.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-cream/10 hover:bg-cream/20 border border-cream/20 flex items-center justify-center transition-all hover:scale-105 group"
                      aria-label="Facebook"
                    >
                      <Facebook size={18} className="group-hover:text-gold transition-colors" />
                    </a>
                    <a 
                      href="https://twitter.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-cream/10 hover:bg-cream/20 border border-cream/20 flex items-center justify-center transition-all hover:scale-105 group"
                      aria-label="Twitter"
                    >
                      <Twitter size={18} className="group-hover:text-gold transition-colors" />
                    </a>
                  </div>
                  
                  {/* Quick Links */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      href="/reservations" 
                      className="flex items-center justify-between p-3 rounded-lg bg-cream/5 hover:bg-cream/10 border border-cream/10 transition-all group"
                    >
                      <span className="text-sm">Reservations</span>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link 
                      href="/gallery" 
                      className="flex items-center justify-between p-3 rounded-lg bg-cream/5 hover:bg-cream/10 border border-cream/10 transition-all group"
                    >
                      <span className="text-sm">Gallery</span>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link 
                      href="/menu" 
                      className="flex items-center justify-between p-3 rounded-lg bg-cream/5 hover:bg-cream/10 border border-cream/10 transition-all group"
                    >
                      <span className="text-sm">View Menu</span>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link 
                      href="/contact" 
                      className="flex items-center justify-between p-3 rounded-lg bg-cream/5 hover:bg-cream/10 border border-cream/10 transition-all group"
                    >
                      <span className="text-sm">Contact</span>
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar - Elegant and clean */}
          <div className="border-t border-cream/10 pt-6 pb-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Copyright */}
                <div className="text-sm opacity-80 text-center md:text-left">
                  <p>© {currentYear} Ubuntu Garden Lounge. All rights reserved.</p>
                </div>
                
                {/* Legal Links */}
                <div className="flex items-center gap-6 text-sm">
                  <button 
                    onClick={scrollToTop}
                    className="opacity-80 hover:opacity-100 hover:text-gold transition-all flex items-center gap-1"
                  >
                    Back to top ↑
                  </button>
                  <span className="text-cream/30 hidden md:inline">•</span>
                  <Link href="/privacy" className="opacity-80 hover:opacity-100 transition-opacity">
                    Privacy
                  </Link>
                  <Link href="/terms" className="opacity-80 hover:opacity-100 transition-opacity">
                    Terms
                  </Link>
                  <Link href="/accessibility" className="opacity-80 hover:opacity-100 transition-opacity">
                    Accessibility
                  </Link>
                </div>
                
                {/* Made with love */}
                <div className="flex items-center gap-2 text-sm opacity-80">
                  <Heart size={12} className="text-red-400 animate-pulse" />
                  <span>Proudly South African</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}