import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({ 
        error: sessionError.message,
        authenticated: false 
      }, { status: 500 })
    }

    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        message: "No active session found"
      })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        email_confirmed: session.user.email_confirmed_at,
        created_at: session.user.created_at
      },
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        has_preferences: !!profile.job_preferences,
        preferences: profile.job_preferences,
        email_enabled: profile.job_preferences?.notifications?.email
      } : null,
      profileError: profileError?.message
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Internal server error",
      authenticated: false 
    }, { status: 500 })
  }
} 