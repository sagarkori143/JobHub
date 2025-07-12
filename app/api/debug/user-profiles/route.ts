import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, job_preferences')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userCount: users?.length || 0,
      users: users?.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        has_preferences: !!user.job_preferences,
        preferences: user.job_preferences,
        email_enabled: user.job_preferences?.notifications?.email,
        industries: user.job_preferences?.industries || [],
        keywords: user.job_preferences?.keywords || [],
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 