// File: /src/app/api/book-orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    id: string
  }
}

// GET single book order
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const order = await prisma.bookOrder.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            book: true
          }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    // Convert for response
    const responseOrder = {
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
    }
    
    return NextResponse.json(responseOrder)
  } catch (error) {
    console.error('Error fetching book order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch book order' },
      { status: 500 }
    )
  }
}

// PUT update book order
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json()
    
    const order = await prisma.bookOrder.update({
      where: { id: params.id },
      data: {
        status: body.status,
        paymentStatus: body.paymentStatus,
        notes: body.notes,
        ebookDelivered: body.ebookDelivered,
        trackingNumber: body.trackingNumber,
        carrier: body.carrier,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        shippingAddress: body.shippingAddress,
        shippingCity: body.shippingCity,
        shippingProvince: body.shippingProvince,
        shippingPostalCode: body.shippingPostalCode,
        estimatedDelivery: body.estimatedDelivery ? new Date(body.estimatedDelivery) : null,
        deliveredDate: body.deliveredDate ? new Date(body.deliveredDate) : null
      },
    })
    
    // Fetch updated order with items
    const updatedOrder = await prisma.bookOrder.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            book: true
          }
        }
      }
    })
    
    if (!updatedOrder) {
      throw new Error('Failed to fetch updated order')
    }
    
    // Convert for response
    const responseOrder = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      paymentId: updatedOrder.paymentId,
      customerName: updatedOrder.customerName,
      customerEmail: updatedOrder.customerEmail,
      customerPhone: updatedOrder.customerPhone,
      shippingAddress: updatedOrder.shippingAddress,
      shippingCity: updatedOrder.shippingCity,
      shippingProvince: updatedOrder.shippingProvince,
      shippingPostalCode: updatedOrder.shippingPostalCode,
      shippingCountry: updatedOrder.shippingCountry,
      shippingMethod: updatedOrder.shippingMethod,
      subtotal: parseFloat(updatedOrder.subtotal.toString()),
      shippingCost: parseFloat(updatedOrder.shippingCost.toString()),
      tax: parseFloat(updatedOrder.tax.toString()),
      total: parseFloat(updatedOrder.total.toString()),
      currency: updatedOrder.currency,
      ebookDelivered: updatedOrder.ebookDelivered,
      ebookDeliveryDate: updatedOrder.ebookDeliveryDate?.toISOString(),
      downloadLink: updatedOrder.downloadLink,
      downloadExpires: updatedOrder.downloadExpires?.toISOString(),
      trackingNumber: updatedOrder.trackingNumber,
      carrier: updatedOrder.carrier,
      estimatedDelivery: updatedOrder.estimatedDelivery?.toISOString(),
      deliveredDate: updatedOrder.deliveredDate?.toISOString(),
      notes: updatedOrder.notes,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      items: updatedOrder.items.map(item => ({
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
    }
    
    return NextResponse.json(responseOrder)
  } catch (error) {
    console.error('Error updating book order:', error)
    return NextResponse.json(
      { error: 'Failed to update book order' },
      { status: 500 }
    )
  }
}

// DELETE book order
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // First delete all items (due to foreign key constraint)
    await prisma.bookOrderItem.deleteMany({
      where: { bookOrderId: params.id }
    })
    
    // Then delete the order
    await prisma.bookOrder.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting book order:', error)
    return NextResponse.json(
      { error: 'Failed to delete book order' },
      { status: 500 }
    )
  }
}