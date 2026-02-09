// src/app/api/books/featured/route.ts
import { NextResponse } from 'next/server';

// Static featured book data - use this while fixing DB
const STATIC_FEATURED_BOOK = {
  id: '1',
  title: "Circle of Seven: A Relationship Masterclass",
  description: "Transform your relationships through biblical principles and practical wisdom. This masterclass guides you through seven essential relationship circles for holistic connection.",
  category: "Relationships & Marriage",
  pages: 256,
  price: 100,
  coverImageUrl: "/images/books/circle-of-seven.jpg",
  formats: ["Paperback", "eBook"],
  featured: true,
  stockQuantity: 150,
  author: "Pastor Sifiso Nkabinde",
  isbn: "978-0-123456-78-9",
  isAvailable: true,
  order: 1
};

export async function GET() {
  try {
    // Try to fetch from database first
    // const book = await prisma.book.findFirst({
    //   where: { 
    //     isFeatured: true,
    //     isAvailable: true 
    //   },
    //   orderBy: [
    //     { order: 'asc' },
    //     { createdAt: 'desc' }
    //   ] // FIX: orderBy expects an ARRAY
    // });
    
    // For now, use static data while fixing DB connection
    // if (!book) {
    //   return NextResponse.json(STATIC_FEATURED_BOOK);
    // }
    
    return NextResponse.json(STATIC_FEATURED_BOOK);
    
  } catch (error) {
    console.error('Error fetching featured book:', error);
    
    // Return static data as fallback
    return NextResponse.json(STATIC_FEATURED_BOOK);
  }
}