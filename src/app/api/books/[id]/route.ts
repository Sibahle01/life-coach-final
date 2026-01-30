// File: /src/app/api/books/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

// GET single book
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id },
      include: {
        bookOrderItems: true
      }
    })
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }
    
    // Convert Decimal to number
    const responseBook = {
      ...book,
      price: parseFloat(book.price.toString()),
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      publicationDate: book.publicationDate ? book.publicationDate.toISOString() : null
    }
    
    return NextResponse.json(responseBook)
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    )
  }
}

// PUT update book
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    const book = await prisma.book.update({
      where: { id: params.id },
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
        isFeatured: body.isFeatured,
        isAvailable: body.isAvailable,
        category: body.category,
        pages: body.pages ? parseInt(body.pages) : null,
        publicationDate: body.publicationDate ? new Date(body.publicationDate) : null,
        order: body.order ? parseInt(body.order) : 0
      }
    })
    
    // Convert Decimal to number
    const responseBook = {
      ...book,
      price: parseFloat(book.price.toString()),
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      publicationDate: book.publicationDate ? book.publicationDate.toISOString() : null
    }
    
    return NextResponse.json(responseBook)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    )
  }
}

// DELETE book
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await prisma.book.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    )
  }
}