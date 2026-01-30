// src/app/api/gallery/route.ts
import { prisma } from '@/lib/prisma'; // Use the curly braces for named export!
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, imageUrl, category } = body;

    // This line will now work because 'prisma' is the updated singleton
    const newImage = await prisma.galleryImage.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        isVisible: true,
      },
    });

    return NextResponse.json(newImage);
  } catch (error) {
    console.error("POST Error:", error);
    // Returning the error message helps you debug in the browser
    return NextResponse.json({ error: "Database error", details: error }, { status: 500 });
  }
}