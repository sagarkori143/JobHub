import { NextRequest, NextResponse } from "next/server"
import { emailNotificationService } from "@/services/email-notification-service"

export async function GET() {
  try {
    const stats = await emailNotificationService.getNotificationStats()

    if (!stats) {
      return NextResponse.json(
        { error: "Failed to fetch notification stats" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      stats
    })

  } catch (error) {
    console.error("Error fetching notification stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch notification stats" },
      { status: 500 }
    )
  }
} 