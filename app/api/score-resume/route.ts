import { NextResponse } from "next/server"
import { scoreResumeWithGemini } from "@/lib/gemini-ats-score"

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json()
    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Resume text and job description are required." }, { status: 400 })
    }
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Generative AI API key is missing. Pass it using the 'apiKey' parameter or the GOOGLE_GENERATIVE_AI_API_KEY environment variable." }, { status: 500 })
    }
    try {
      const parsed = await scoreResumeWithGemini({ resumeText, jobDescription, apiKey })
      return NextResponse.json(parsed)
    } catch (e: any) {
      return NextResponse.json({ error: e.message || "Gemini scoring failed." }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
