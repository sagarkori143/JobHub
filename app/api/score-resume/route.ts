import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { NextResponse } from "next/server"

async function retryGenerateText(model: any, prompt: string, maxAttempts = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await generateText({ model, prompt })
    } catch (error: any) {
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`)
      if (attempt === maxAttempts) throw error
      await new Promise((res) => setTimeout(res, delayMs * attempt)) // Exponential backoff
    }
  }
}

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Resume text and job description are required." }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Google Generative AI API key is missing. Pass it using the 'apiKey' parameter or the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
        },
        { status: 500 },
      )
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) and resume analyst.
Your task is to analyze a given resume against a job description and provide a compatibility score (out of 100),
identify strengths, areas for improvement, and list keywords found and missing.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide your analysis in a JSON format with the following structure:
{
  "score": number,
  "strengths": string[],
  "improvements": string[],
  "keywords": {
    "found": string[],
    "missing": string[]
  }
}
Ensure all arrays are populated, even if empty.
    `

    let text = ""

    // Use the specified model for free plans
    try {
      const model = google("models/gemini-1.0-pro", { apiKey })
      const result = await retryGenerateText(model, prompt)
      text = result.text
    } catch (e) {
      console.error("❌ Error with Gemini Pro model:", e)
      return NextResponse.json(
        { error: `Error processing resume scoring request: ${e instanceof Error ? e.message : String(e)}` },
        { status: 500 },
      )
    }

    // Clean markdown-style response if any
    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7, -3).trim()
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3, -3).trim()
    }

    try {
      const parsed = JSON.parse(cleanedText)
      return NextResponse.json(parsed)
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini response:", cleanedText)
      return NextResponse.json(
        {
          error: "Gemini did not return valid JSON.",
          rawResponse: cleanedText,
        },
        { status: 502 },
      )
    }
  } catch (error: any) {
    console.error("❌ Resume scoring failed:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
