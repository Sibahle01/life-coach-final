// src/app/page.tsx (FINAL VERSION)
'use client';

import HeroSection from "@/components/sections/HeroSection";
import AboutBooksSection from "@/components/sections/AboutBooksSection";
import ServicesSection from "@/components/sections/ServicesSection";
import EventsSection from "@/components/sections/EventsSection";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection 
        backgroundImage="/images/hero/main-background.jpg"
        backgroundAlt="Pastor Sifiso Nkabinde - Spiritual Leadership Coach"
        showPatterns={true}
      />
      
      {/* About & Books Section */}
      <AboutBooksSection />
      
      {/* Services Section */}
      <ServicesSection />
      
      {/* Events Section */}
      <EventsSection />
      
    </>
  );
}