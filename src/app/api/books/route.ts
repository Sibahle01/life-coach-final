// File: /src/app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all books
export async function GET() {
  try {
    const books = await prisma.book.findMany({
      orderBy: { order: 'asc' },
    })
    
    // Convert Decimal to number for JSON serialization
    const booksWithNumbers = books.map(book => ({
      ...book,
      price: parseFloat(book.price.toString()),
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      publicationDate: book.publicationDate ? book.publicationDate.toISOString() : null
    }))
    
    return NextResponse.json(booksWithNumbers)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    )
  }
}

// POST new book - also fix this
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const book = await prisma.book.create({
      data: {
        title: body.title,
        description: body.description,
        author: body.author,
        price: parseFloat(body.price),
        coverImageUrl: body.coverImageUrl || null,
        ebookFileUrl: body.ebookFileUrl || null,
        isbn: body.isbn || null,
        format: body.format || [],
        stockQuantity: parseInt(body.stockQuantity),
        isFeatured: body.isFeatured || false,
        isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
        category: body.category,
        pages: body.pages ? parseInt(body.pages) : null,
        publicationDate: body.publicationDate ? new Date(body.publicationDate) : null,
        order: body.order ? parseInt(body.order) : 0
      }
    })
    
    // Convert Decimal to number for response
    const responseBook = {
      ...book,
      price: parseFloat(book.price.toString()),
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      publicationDate: book.publicationDate ? book.publicationDate.toISOString() : null
    }
    
    return NextResponse.json(responseBook, { status: 201 })
  } catch (error) {
    console.error('Error creating book:', error)
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    )
  }
}