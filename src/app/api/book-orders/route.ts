// File: /src/app/api/book-orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all book orders (Including Items)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    const orders = await prisma.bookOrder.findMany({
      where,
      include: {
        items: {
          include: {
            book: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
    
    // Convert for response
    const ordersWithFormattedData = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentId: order.paymentId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingProvince: order.shippingProvince,
      shippingPostalCode: order.shippingPostalCode,
      shippingCountry: order.shippingCountry,
      shippingMethod: order.shippingMethod,
      subtotal: parseFloat(order.subtotal.toString()),
      shippingCost: parseFloat(order.shippingCost.toString()),
      tax: parseFloat(order.tax.toString()),
      total: parseFloat(order.total.toString()),
      currency: order.currency,
      ebookDelivered: order.ebookDelivered,
      ebookDeliveryDate: order.ebookDeliveryDate?.toISOString(),
      downloadLink: order.downloadLink,
      downloadExpires: order.downloadExpires?.toISOString(),
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      estimatedDelivery: order.estimatedDelivery?.toISOString(),
      deliveredDate: order.deliveredDate?.toISOString(),
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map(item => ({
        id: item.id,
        bookId: item.bookId,
        bookOrderId: item.bookOrderId,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        format: item.format,
        createdAt: item.createdAt.toISOString(),
        book: item.book ? {
          id: item.book.id,
          title: item.book.title,
          author: item.book.author,
          price: parseFloat(item.book.price.toString()),
          coverImageUrl: item.book.coverImageUrl,
          format: item.book.format,
        } : null
      }))
    }))
    
    return NextResponse.json(ordersWithFormattedData)
  } catch (error) {
    console.error('Error fetching book orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book orders' },
      { status: 500 }
    )
  }
}

// POST new book order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 1. Create the Order
    const order = await prisma.bookOrder.create({
      data: {
        // Generate a unique order number
        orderNumber: `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingProvince: body.shippingProvince,
        shippingPostalCode: body.shippingPostalCode,
        shippingCountry: body.shippingCountry || 'South Africa',
        shippingMethod: body.shippingMethod || 'Standard',
        subtotal: parseFloat(body.subtotal),
        shippingCost: parseFloat(body.shippingCost),
        tax: parseFloat(body.tax),
        total: parseFloat(body.total),
        status: body.status || 'PENDING',
        paymentStatus: body.paymentStatus || 'PENDING',
        notes: body.notes,
        ebookDelivered: body.ebookDelivered || false,
        trackingNumber: body.trackingNumber,
        carrier: body.carrier,
        estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : null,
      },
    })
    
    // 2. Create Order Items if they exist
    if (body.items && body.items.length > 0) {
      await Promise.all(
        body.items.map((item: any) => 
          prisma.bookOrderItem.create({
            data: {
              bookOrderId: order.id,
              bookId: item.bookId,
              quantity: item.quantity,
              price: parseFloat(item.price),
              format: item.format || 'physical'
            }
          })
        )
      )
    }
    
    // 3. Fetch the complete order with items and book info for the response
    const completeOrder = await prisma.bookOrder.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            book: true
          }
        }
      }
    })
    
    if (!completeOrder) {
      throw new Error('Failed to fetch created order')
    }
    
    // 4. Format for response
    const responseOrder = {
      ...completeOrder,
      subtotal: parseFloat(completeOrder.subtotal.toString()),
      shippingCost: parseFloat(completeOrder.shippingCost.toString()),
      tax: parseFloat(completeOrder.tax.toString()),
      total: parseFloat(completeOrder.total.toString()),
      createdAt: completeOrder.createdAt.toISOString(),
      updatedAt: completeOrder.updatedAt.toISOString(),
      items: completeOrder.items.map(item => ({
        ...item,
        price: parseFloat(item.price.toString()),
        createdAt: item.createdAt.toISOString(),
        book: item.book ? {
          ...item.book,
          price: parseFloat(item.book.price.toString()),
        } : null
      }))
    }
    
    return NextResponse.json(responseOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating book order:', error)
    return NextResponse.json(
      { error: 'Failed to create book order' },
      { status: 500 }
    )
  }
}