// src/app/api/admin/auth/me/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

// ✅ ADD THIS LINE - Forces dynamic rendering
export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Get user from database
    const user = await prisma.adminUser.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
    
  } catch (error) {
    console.error('Auth check error:', error)
    
    // If token is invalid, clear the cookie
    const response = NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
    
    // Clear the invalid cookie
    response.cookies.delete('admin_token')
    
    return response
  }
}