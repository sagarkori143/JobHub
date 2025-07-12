import { NextRequest, NextResponse } from "next/server"
import { emailNotificationService } from "@/services/email-notification-service"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    const notifications = await emailNotificationService.getUserNotificationHistory(userId, limit)

    return NextResponse.json({ 
      success: true, 
      notifications,
      count: notifications.length
    })

  } catch (error) {
    console.error("Error fetching notification history:", error)
    return NextResponse.json(
      { error: "Failed to fetch notification history" },
      { status: 500 }
    )
  }
} 