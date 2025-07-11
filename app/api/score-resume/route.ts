import { generateText } from "ai"
import { google } from "@ai-sdk/google"

/**
 * POST  /api/score-resume
 * Body: { resumeText: string; jobDescription: string }
 */
export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: "Resume text and job description are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Read the key explicitly and fail fast if it is missing.
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Google Generative AI API key is missing. Set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in your environment.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) and resume analyst.
Analyze the resume against the job description and return a JSON object:
{
  "score": number,           // 0-100
  "strengths": string[],     // what the resume does well
  "improvements": string[],  // what could be better
  "keywords": {
    "found": string[],       // keywords present in the resume
    "missing": string[]      // important keywords absent from the resume
  }
}

Job Description:
${jobDescription}

Resume:
${resumeText}
`

    const model = google("models/gemini-pro", { apiKey })

    const { text } = await generateText({ model, prompt, temperature: 0.7 })

    const result = JSON.parse(text)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Error processing resume scoring request:", error)
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
