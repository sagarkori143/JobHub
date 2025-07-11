import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Resume text and job description are required." }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Generative AI API key is missing." }, { status: 500 })
    }

    // ✅ Use the lighter model
    const model = google("models/gemini-1.5-flash-latest", { apiKey })

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

    const { text } = await generateText({
      model: model,
      prompt: prompt,
    })

    // 🛠 Clean possible markdown code block formatting
    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7, -3).trim()
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3, -3).trim()
    }

    const result = JSON.parse(cleanedText)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error processing resume scoring request:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
