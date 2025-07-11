/**
 * POST /api/score-resume
 * Body: { resumeText: string; jobDescription: string }
 * Response: JSON { score, strengths[], improvements[], keywords: { found[], missing[] } }
 */
import { NextResponse } from "next/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = (await req.json()) as {
      resumeText?: string
      jobDescription?: string
    }

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Both resumeText and jobDescription are required." }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GOOGLE_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) in environment." },
        { status: 500 },
      )
    }

    /* Use a model that is available on the free tier */
    const model = google("models/gemini-1.0-pro", { apiKey })

    const prompt = `
You are an expert Applicant Tracking System (ATS) analyst.
Compare the resume to the job description and respond with strictly-valid JSON matching this schema:

{
  "score": number,          // 0–100
  "strengths": string[],    // up to 5 bullets
  "improvements": string[], // up to 5 bullets
  "keywords": {
    "found": string[],      // present in resume
    "missing": string[]     // absent from resume (max 10)
  }
}

Job Description:
${jobDescription}

Resume:
${resumeText}
`

    const { text } = await generateText({ model, prompt, temperature: 0.6 })
    const parsed = JSON.parse(text)

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error("Resume-scoring route error:", err)
    return NextResponse.json({ error: err?.message ?? "Internal Server Error" }, { status: 500 })
  }
}
