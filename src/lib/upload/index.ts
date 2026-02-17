// File: /src/lib/upload/index.ts
import { supabase } from '../supabase'

export type UploadType = 
  | 'book-cover'
  | 'book-gallery'
  | 'event-poster'
  | 'event-gallery'

export interface UploadResult {
  url: string
  path: string
  bucket: string
}

export async function uploadImage(
  file: File,
  type: UploadType,
  itemId: string
): Promise<UploadResult> {
  try {
    // Determine bucket and path
    let bucket: string
    let folder: string
    
    switch (type) {
      case 'book-cover':
        bucket = 'book-images'
        folder = 'covers'
        break
      case 'book-gallery':
        bucket = 'book-images'
        folder = 'gallery'
        break
      case 'event-poster':
        bucket = 'event-images'
        folder = 'posters'
        break
      case 'event-gallery':
        bucket = 'event-images'
        folder = 'gallery'
        break
      default:
        throw new Error('Invalid upload type')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${itemId}-${Date.now()}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    console.log('📤 Uploading to:', bucket, filePath)

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    console.log('✅ Uploaded:', publicUrl)

    return {
      url: publicUrl,
      path: data.path,
      bucket
    }

  } catch (error) {
    console.error('Upload failed:', error)
    throw new Error('Failed to upload image')
  }
}

export async function uploadMultipleImages(
  files: File[],
  type: 'book-gallery' | 'event-gallery',
  itemId: string
): Promise<UploadResult[]> {
  const uploads = await Promise.all(
    files.map(file => uploadImage(file, type, itemId))
  )
  return uploads
}

export async function deleteImage(url: string) {
  try {
    // Extract path from URL
    // URL format: https://.../storage/v1/object/public/[bucket]/[path]
    const match = url.match(/\/public\/([^\/]+)\/(.+)/)
    if (!match) return

    const [, bucket, path] = match

    console.log('🗑️ Deleting from:', bucket, path)

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error

    console.log('✅ Deleted successfully')

  } catch (error) {
    console.error('Delete failed:', error)
  }
}