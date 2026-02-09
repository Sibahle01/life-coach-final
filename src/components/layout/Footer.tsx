// src/components/layout/Footer.tsx - PASTORAL COACHING VERSION
'use client';

import Link from 'next/link';
import { 
  Phone, Mail, Clock, 
  Instagram, Facebook, Youtube, MessageCircle, ArrowUp,
  Heart, BookOpen, MapPin
} from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  const copyToClipboard = (text: string, type: 'email' | 'phone') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } else {
      setPhoneCopied(true);
      setTimeout(() => setPhoneCopied(false), 2000);
    }
  };

  return (
    <footer className="bg-black text-white">
      {/* Main Footer Content */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Main Grid - MOBILE FIRST */}
          <div className="py-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
              
              {/* Brand Column - Mobile First */}
              <div className="md:col-span-4 lg:col-span-3">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <span className="font-serif font-bold text-xl text-white">P</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Pastor Sifiso</h2>
                      <p className="text-sm opacity-80 font-light">Spiritual Coach & Mentor</p>
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-80 leading-relaxed font-light">
                    Guiding individuals toward spiritual fulfillment and meaningful purpose through faith-based coaching.
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="flex items-center gap-1.5 text-xs opacity-70">
                      <BookOpen size={12} />
                      <span>16+ Years</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs opacity-70">
                      <MessageCircle size={12} />
                      <span>3,500+ Lives</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links - Mobile Stacked */}
              <div className="md:col-span-4 lg:col-span-3">
                <h3 className="text-base font-medium mb-4 pb-2 border-b border-white/10">
                  Quick Links
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href="/" 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-white transition-all py-1.5"
                  >
                    Home
                  </Link>
                  <Link 
                    href="/services" 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-white transition-all py-1.5"
                  >
                    Services
                  </Link>
                  <Link 
                    href="/books" 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-white transition-all py-1.5"
                  >
                    Books
                  </Link>
                  <Link 
                    href="/events" 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-white transition-all py-1.5"
                  >
                    Events
                  </Link>
                  <Link 
                    href="/about" 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-white transition-all py-1.5"
                  >
                    About
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-sm opacity-80 hover:opacity-100 hover:text-white transition-all py-1.5"
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* Contact Info - Mobile Friendly */}
              <div className="md:col-span-4 lg:col-span-3">
                <h3 className="text-base font-medium mb-4 pb-2 border-b border-white/10">
                  Contact Info
                </h3>
                <div className="space-y-4">
                  {/* Phone */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={14} className="opacity-70" />
                      <span className="text-sm opacity-70 font-light">Phone/WhatsApp</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('+27 71 482 9894', 'phone')}
                      className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity group"
                    >
                      <span className="font-medium">+27 71 482 9894</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${phoneCopied ? 'bg-green-500/20 text-green-400' : 'bg-white/10'}`}>
                        {phoneCopied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>

                  {/* Email */}
                  <div className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={14} className="opacity-70" />
                      <span className="text-sm opacity-70 font-light">Email</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('pastor@nkabinde.com', 'email')}
                      className="flex items-center gap-2 text-sm opacity-90 hover:opacity-100 transition-opacity group"
                    >
                      <span className="font-medium">sifiso.nkabinde07@gmail.com</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${emailCopied ? 'bg-green-500/20 text-green-400' : 'bg-white/10'}`}>
                        {emailCopied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={14} className="opacity-70" />
                      <span className="text-sm opacity-70 font-light">Based In</span>
                    </div>
                    <p className="text-sm opacity-90 font-medium">Mpumalanga, South Africa</p>
                  </div>
                </div>
              </div>

              {/* Social Media - Mobile Optimized */}
              <div className="md:col-span-12 lg:col-span-3">
                <h3 className="text-base font-medium mb-4 pb-2 border-b border-white/10">
                  Connect
                </h3>
                <div className="space-y-4">
                  {/* Social Media Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {/* Instagram */}
                    <a 
                      href="https://www.instagram.com/thinkfaithpodcast" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 group"
                      aria-label="Instagram"
                    >
                      <Instagram size={20} className="mb-1" />
                      <span className="text-xs opacity-80">Instagram</span>
                    </a>
                    
                    {/* YouTube */}
                    <a 
                      href="https://www.youtube.com/@pastorsifisonkabinde4087" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 group"
                      aria-label="YouTube"
                    >
                      <Youtube size={20} className="mb-1" />
                      <span className="text-xs opacity-80">YouTube</span>
                    </a>
                    
                    {/* Facebook */}
                    <a 
                      href="https://web.facebook.com/Pastorsifisonkabinde" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 group"
                      aria-label="Facebook"
                    >
                      <Facebook size={20} className="mb-1" />
                      <span className="text-xs opacity-80">Facebook</span>
                    </a>
                    
                    {/* TikTok */}
                    <a 
                      href="https://www.tiktok.com/@pastor_sifiso_nkabinde" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="aspect-square rounded-lg bg-gradient-to-br from-gray-800/10 to-black hover:from-gray-800/20 hover:to-black border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 group"
                      aria-label="TikTok"
                    >
                      <div className="w-5 h-5 bg-white rounded mb-1 flex items-center justify-center">
                        <div className="w-3 h-3 bg-black rounded-sm"></div>
                      </div>
                      <span className="text-xs opacity-80">TikTok</span>
                    </a>
                  </div>
                  
                  {/* Podcast Button */}
                  <div>
                    <a 
                      href="https://www.youtube.com/@pastorsifisonkabinde4087"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-black font-medium px-4 py-2.5 rounded-lg transition-all duration-300 active:scale-95 text-sm w-full justify-center"
                    >
                      <MessageCircle size={16} />
                      <span>Think Faith Podcast</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar - Mobile Optimized */}
          <div className="border-t border-white/10 pt-6 pb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              
              {/* Copyright & Back to Top - Mobile Stacked */}
              <div className="order-2 md:order-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <p className="text-sm opacity-80">
                    © {currentYear} Pastor Sifiso Nkabinde. All rights reserved.
                  </p>
                  
                  <button 
                    onClick={scrollToTop}
                    className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100 hover:text-white transition-all md:ml-4"
                  >
                    <ArrowUp size={14} />
                    <span>Back to top</span>
                  </button>
                </div>
              </div>
              
              {/* Legal Links - Mobile Centered */}
              <div className="order-1 md:order-2 flex flex-wrap justify-center items-center gap-4 text-sm">
                <Link href="/privacy" className="opacity-80 hover:opacity-100 transition-opacity text-sm">
                  Privacy Policy
                </Link>
                <div className="w-px h-4 bg-white/20 hidden md:block"></div>
                <Link href="/terms" className="opacity-80 hover:opacity-100 transition-opacity text-sm">
                  Terms of Service
                </Link>
                <div className="w-px h-4 bg-white/20 hidden md:block"></div>
                <div className="flex items-center gap-2 opacity-80">
                  <Heart size={12} className="text-red-400 animate-pulse" />
                  <span className="text-sm">Mpumalanga, SA</span>
                </div>
              </div>
            </div>

            {/* Mobile-only note */}
            <div className="mt-6 pt-6 border-t border-white/10 text-center md:hidden">
              <p className="text-xs opacity-70 font-light">
                Need spiritual guidance? Book a discovery session today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}