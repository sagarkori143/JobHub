import { generateText } from "ai"
import { google } from "@ai-sdk/google"

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!GEMINI_API_KEY) {
  throw new Error(
    "A Gemini API key is required. Set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY in your environment.",
  )
}

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: "Resume text and job description are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const prompt = `
      You are an expert ATS (Applicant Tracking System) and resume analyst.
      Your task is to analyze a given resume against a job description and provide a compatibility score out of 100, along with detailed insights.

      Provide the output in a JSON format with the following structure:
      {
        "score": number, // Compatibility score out of 100
        "strengths": string[], // List of strengths of the resume related to the job description
        "improvements": string[], // List of areas for improvement in the resume to better match the job description
        "keywords": {
          "found": string[], // Keywords from the job description found in the resume
          "missing": string[] // Keywords from the job description NOT found in the resume (top 5-10 most important)
        }
      }

      ---
      Job Description:
      ${jobDescription}

      ---
      Resume Text:
      ${resumeText}
      ---

      Ensure the 'score' is an integer between 0 and 100.
      Provide concise bullet points for strengths and improvements.
      For missing keywords, list the most relevant ones that are absent.
    `

    const model = google("gemini-1.5-pro-latest", { apiKey: GEMINI_API_KEY })
    const { text } = await generateText({
      model,
      prompt,
    })

    // Attempt to parse the JSON response from the AI
    const result = JSON.parse(text)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error processing resume scoring request:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process request. Please ensure your GOOGLE_API_KEY is set and the API is accessible.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
