import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json({ 
        error: 'File and userId are required' 
      }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Only image files are allowed' 
      }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size must be less than 5MB' 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      
      // If bucket doesn't exist, provide helpful error message
      if (error.message?.includes('Bucket not found')) {
        return NextResponse.json({ 
          error: 'Storage bucket not configured. Please contact support.' 
        }, { status: 500 })
      }
      
      return NextResponse.json({ 
        error: 'Failed to upload file' 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update user profile with new avatar URL
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update profile' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      avatarUrl: urlData.publicUrl
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ 
        error: 'userId is required' 
      }, { status: 400 })
    }

    // Remove avatar URL from user profile
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ avatar_url: null })
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ 
        error: 'Failed to remove avatar' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('Avatar removal error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
} 