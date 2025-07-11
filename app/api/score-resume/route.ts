/**
 * Server Route: POST /api/score-resume
 *
 * Body:
 *   {
 *     resumeText:       string
 *     jobDescription:   string
 *   }
 *
 * Response:
 *   {
 *     score: number
 *     strengths: string[]
 *     improvements: string[]
 *     keywords: {
 *       found: string[]
 *       missing: string[]
 *     }
 *   }
 */

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = (await req.json()) as {
      resumeText?: string
      jobDescription?: string
    }

    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: "Both resumeText and jobDescription are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Read the API key explicitly.
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Google Generative AI API key is missing. Set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    /* ------------------------------------------------------------------ */

    const prompt = `
You are an expert Applicant Tracking System (ATS) analyst.
Analyse the following resume against the job description.
Return JSON in exactly this structure:

{
  "score": number,          // 0-100
  "strengths": string[],    // up to 5 bullet points
  "improvements": string[], // up to 5 bullet points
  "keywords": {
    "found": string[],      // keywords present in resume
    "missing": string[]     // top 5-10 important keywords absent
  }
}

Job Description:
${jobDescription}

Resume:
${resumeText}
`

    // Use a model that is available for v1beta generateContent
    const model = google("models/gemini-1.5-pro-latest", { apiKey })

    const { text } = await generateText({
      model,
      prompt,
      temperature: 0.6,
    })

    const parsed = JSON.parse(text)

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error("Resume-scoring route error:", err)
    return new Response(JSON.stringify({ error: err?.message ?? "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
