// src/app/page.tsx
'use client';

import HeroSection from "@/components/sections/HeroSection";
import FeaturedMenu from "@/components/sections/FeaturedMenu";
import GallerySection from '@/components/sections/GallerySection';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection 
        backgroundImage="/images/hero/main-background.jpg"
        backgroundAlt="Ubuntu Garden Lounge ambiance"
        showPatterns={true}
      />
      
      {/* Featured Menu Section */}
      <FeaturedMenu />
      
      {/* Gallery Section - Experience African Elegance */}
      <GallerySection />
      
      {/* Page ends here - Footer will follow automatically */}
    </>
  );
}