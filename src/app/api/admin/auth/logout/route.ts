// src/app/api/admin/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  
  // Clear the admin_token cookie
  response.cookies.delete('admin_token')
  
  return response
}
