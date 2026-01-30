// File: /lib/supabase/storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function uploadPaymentProof(
  file: File,
  bookingNumber: string,
  clientName: string
): Promise<{ url: string; path: string; size: number; mimeType: string }> {
  try {
    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB')
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPG, PNG, GIF, and PDF files are allowed')
    }

    // Generate safe filename
    const sanitizedName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop() || 'pdf'
    const fileName = `${timestamp}_${sanitizedName}_${bookingNumber}.${fileExt}`
    const filePath = `payment-proofs/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
      size: file.size,
      mimeType: file.type
    }

  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export async function deletePaymentProof(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('payment-proofs')
      .remove([filePath])
    
    if (error) throw error
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}