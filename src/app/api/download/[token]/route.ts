// File: /src/app/api/download/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface Params {
  params: {
    token: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // Redirect ALL download tokens to the Circle of Seven eBook
    // In production: Validate token, check expiry, log download
    const ebookUrl = 'https://aoyuffbxdqgyqeyzzdxu.supabase.co/storage/v1/object/public/ebooks/Circle%20Of%20Seven%207-Sifiso%20Nkabinde.pdf'
    
    console.log('📥 eBook download requested:', {
      token: params.token,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    // Redirect to actual eBook
    return NextResponse.redirect(ebookUrl)
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Download failed' },
      { status: 500 }
    )
  }
}