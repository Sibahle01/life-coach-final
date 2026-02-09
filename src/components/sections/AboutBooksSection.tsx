// src/components/sections/AboutBooksSection.tsx
'use client';

import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Book {
  id: string;
  title: string;
  description: string;
  category: string;
  pages: number;
  price: number;
  coverImageUrl?: string;
  formats: string[];
  featured: boolean;
  stockQuantity: number;
  author: string;
}

export default function AboutBooksSection() {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const defaultBook: Book = {
          id: '1',
          title: "Circle of Seven: A Relationship Masterclass",
          description: "Transform your relationships through biblical principles and practical wisdom. This masterclass guides you through seven essential relationship circles for holistic connection.",
          category: "Relationships & Marriage",
          pages: 52,
          price: 100,
          coverImageUrl: '/images/books/circle-of-seven.jpg',
          formats: ["Paperback", "eBook"],
          featured: true,
          stockQuantity: 150,
          author: "Pastor Sifiso Nkabinde"
        };
        
        setBook(defaultBook);
      } catch (error) {
        console.error('Error loading book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, []);

  if (loading) {
    return (
      <section className="relative py-12 md:py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-800/50 rounded-lg mb-12"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-12 md:py-24 bg-black text-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Seven Circles Background Element - Interconnected chain on the left */}
      <div className="absolute top-1/4 -left-8 md:-left-12 lg:-left-16 w-40 md:w-56 lg:w-72 h-full opacity-[0.12] pointer-events-none">
        <svg 
          viewBox="0 0 300 700" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{ filter: 'blur(0.5px)' }}
        >
          {/* Circle 1 - Top */}
          <circle cx="60" cy="80" r="28" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
          <circle cx="60" cy="80" r="22" fill="white" fillOpacity="0.03" />
          
          {/* Circle 2 - Overlaps with Circle 1 */}
          <circle cx="70" cy="130" r="26" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.28" />
          <circle cx="70" cy="130" r="20" fill="white" fillOpacity="0.03" />
          
          {/* Circle 3 - Overlaps with Circle 2 */}
          <circle cx="65" cy="185" r="30" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
          <circle cx="65" cy="185" r="24" fill="white" fillOpacity="0.03" />
          
          {/* Circle 4 - Center, overlaps with Circle 3 - LARGEST */}
          <circle cx="75" cy="240" r="34" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.35" />
          <circle cx="75" cy="240" r="28" fill="white" fillOpacity="0.04" />
          
          {/* Circle 5 - Overlaps with Circle 4 */}
          <circle cx="80" cy="300" r="30" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
          <circle cx="80" cy="300" r="24" fill="white" fillOpacity="0.03" />
          
          {/* Circle 6 - Overlaps with Circle 5 */}
          <circle cx="75" cy="355" r="26" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.28" />
          <circle cx="75" cy="355" r="20" fill="white" fillOpacity="0.03" />
          
          {/* Circle 7 - Bottom, overlaps with Circle 6 */}
          <circle cx="70" cy="400" r="28" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" />
          <circle cx="70" cy="400" r="22" fill="white" fillOpacity="0.03" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* About Section */}
        <div className="mb-12 md:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            
            {/* Left: Title */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-4"
            >
              <div className="lg:sticky lg:top-24">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-[1px] w-8 bg-gradient-to-r from-white/40 to-transparent origin-left" 
                  />
                  <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-light">
                    About Pastor
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-light text-white leading-tight mb-2">
                  SIFISO
                </h2>
                <p className="text-2xl md:text-3xl font-serif italic text-white/90 mb-6">
                  Nkabinde
                </p>
                
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="h-[2px] w-16 bg-gradient-to-r from-white/30 to-transparent origin-left"
                />
              </div>
            </motion.div>

            {/* Right: Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="lg:col-span-8"
            >
              <div className="max-w-2xl">
                <p className="text-lg md:text-xl text-white/90 leading-relaxed font-light mb-6">
                  Pastor Sifiso Nkabinde combines <strong className="font-normal text-white">16 years of ministry</strong> with practical coaching to help individuals discover their divine purpose.
                </p>
                <p className="text-base md:text-lg text-white/80 leading-relaxed font-light">
                  His approach bridges biblical wisdom with modern life challenges, guiding people toward spiritual clarity and meaningful transformation through faith-based coaching and published works.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Book Section */}
        <div className="pt-12 md:pt-20 border-t border-white/20">
          
          {/* MOBILE: Book image first, details below */}
          <div className="md:hidden space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="h-[1px] w-8 bg-gradient-to-r from-white/40 to-transparent origin-left"
                />
                <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-light">
                  Featured Publication
                </span>
              </div>

              {/* Book Cover */}
              <div className="relative max-w-[240px] mx-auto">
                <div className="absolute -inset-4 bg-gradient-to-br from-gray-500/20 via-transparent to-gray-700/15 rounded-2xl blur-xl opacity-50" />
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="relative rounded-xl shadow-2xl overflow-hidden">
                    <div className="relative aspect-[3/4] bg-black">
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                          backgroundImage: book?.coverImageUrl 
                            ? `url(${book.coverImageUrl})` 
                            : 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)'
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                      
                      <div className="relative h-full px-5 py-5 flex flex-col justify-between">
                        <div>
                          <div className="mb-2">
                            <span className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-light">
                              {book?.category || "Relationships"}
                            </span>
                          </div>
                          
                          <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-black text-[9px] font-bold px-2 py-1 rounded-full shadow-lg">
                            <Sparkles size={9} className="text-yellow-500" />
                            FEATURED
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-white/60">
                            <BookOpen size={12} />
                            <span className="text-xs font-light">
                              {book ? `${book.pages} pages` : "52 pages"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Book Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-light text-white text-center leading-tight">
                  {book?.title || "Circle of Seven: A Relationship Masterclass"}
                </h3>

                <p className="text-sm text-white/80 leading-relaxed font-light text-center">
                  {book?.description || "Transform your relationships through biblical principles and practical wisdom."}
                </p>

                <div className="flex justify-center gap-2">
                  <span className="px-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white/90 backdrop-blur-sm">
                    Paperback
                  </span>
                  <span className="px-3 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white/90 backdrop-blur-sm">
                    eBook
                  </span>
                </div>

                <div className="text-center space-y-3">
                  <Link
                    href="/books"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-medium px-6 py-3 rounded-lg transition-all duration-300 active:scale-95 shadow-lg"
                  >
                    <span>View All Publications</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* DESKTOP */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center"
            >
              
              <div className="lg:col-span-5 relative">
                <div className="relative max-w-[280px] md:max-w-sm mx-auto lg:mx-0">
                  
                  <div className="absolute -inset-6 bg-gradient-to-br from-gray-500/20 via-transparent to-gray-700/15 rounded-2xl blur-3xl opacity-60" />
                  
                  <motion.div
                    whileHover={{ scale: 1.03, rotateY: -4 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="relative rounded-xl shadow-2xl overflow-hidden">
                      
                      <div className="relative aspect-[3/4] bg-black">
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ 
                            backgroundImage: book?.coverImageUrl 
                              ? `url(${book.coverImageUrl})` 
                              : 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)'
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                        
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/90 via-black/70 to-black/60 border-r border-white/10 shadow-inner">
                          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/40" />
                        </div>
                        
                        <div className="relative h-full px-6 md:px-8 py-6 md:py-8 flex flex-col justify-between">
                          
                          <div>
                            <div className="mb-3">
                              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/50 font-light">
                                {book?.category || "Relationships"}
                              </span>
                            </div>
                            
                            <div className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-black text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                              <Sparkles size={9} className="text-yellow-500" />
                              FEATURED
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/60">
                              <BookOpen size={13} />
                              <span className="text-xs font-light">
                                {book ? `${book.pages} pages` : "52 pages"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-4 left-4 right-4 h-8 bg-gradient-to-b from-black/40 to-transparent blur-xl -z-10" />
                  </motion.div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-5">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="h-[1px] w-8 bg-gradient-to-r from-white/40 to-transparent origin-left"
                    />
                    <span className="text-xs uppercase tracking-[0.3em] text-white/60 font-light">
                      Featured Publication
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-light text-white mb-4 leading-tight">
                    {book?.title || "Circle of Seven: A Relationship Masterclass"}
                  </h3>

                  <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6 font-light">
                    {book?.description || "Transform your relationships through biblical principles and practical wisdom. This masterclass guides you through seven essential relationship circles for holistic connection."}
                  </p>

                  <div className="mb-8">
                    <p className="text-sm text-white/60 mb-3 font-light uppercase tracking-wide">Available In:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white/90 backdrop-blur-sm">
                        Paperback
                      </span>
                      <span className="px-3 py-1.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white/90 backdrop-blur-sm">
                        eBook
                      </span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-sm text-white/60 mt-2">
                      Instant access to eBook upon purchase
                    </p>
                  </div>

                  <Link
                    href="/books"
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-medium px-6 py-3.5 rounded-lg transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    <span>View All Publications</span>
                    <ArrowRight size={18} />
                  </Link>

                  <p className="text-xs text-white/40 mt-6 pt-4 border-t border-white/20 font-light">
                    Book details updated in real-time from admin panel
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}