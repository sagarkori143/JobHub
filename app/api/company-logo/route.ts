import { NextRequest, NextResponse } from "next/server"
import { GeminiService } from "@/lib/gemini-service"
import { getCompanyLogo } from "@/lib/company-logos"

export async function POST(request: NextRequest) {
  try {
    const { companyName } = await request.json()

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      )
    }

    // First check if we have the logo in our existing database
    const existingLogo = getCompanyLogo(companyName)
    
    // If we have a real logo (not placeholder), return it
    if (existingLogo && !existingLogo.includes("placeholder")) {
      return NextResponse.json({ logoUrl: existingLogo })
    }

    // If not found in our database, search with Gemini
    const logoUrl = await GeminiService.searchAndCacheCompanyLogo(companyName)
    
    return NextResponse.json({ logoUrl })
  } catch (error) {
    console.error("Error searching for company logo:", error)
    return NextResponse.json(
      { error: "Failed to search for company logo" },
      { status: 500 }
    )
  }
} 