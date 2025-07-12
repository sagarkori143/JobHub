/**
 * Utility functions for image processing and optimization
 */

export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Get image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Resize image to fit within max dimensions while maintaining aspect ratio
 */
export function resizeImage(
  file: File, 
  maxWidth: number = 400, 
  maxHeight: number = 400
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw resized image
      ctx?.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to resize image'))
          }
        },
        'image/jpeg',
        0.9
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Crop image to square aspect ratio
 */
export function cropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      const size = Math.min(img.width, img.height)
      const x = (img.width - size) / 2
      const y = (img.height - size) / 2

      canvas.width = size
      canvas.height = size

      ctx?.drawImage(img, x, y, size, size, 0, 0, size, size)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to crop image'))
          }
        },
        'image/jpeg',
        0.9
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' }
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File size must be less than 5MB' }
  }

  return { valid: true }
}

/**
 * Generate a preview URL for an image file
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
} 