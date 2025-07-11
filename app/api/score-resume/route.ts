import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return new Response(JSON.stringify({ error: "Resume text and job description are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Ensure the API key is explicitly passed
    const googleModel = google("gemini-pro", {
      apiKey: process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })

    if (!googleModel.parameters.apiKey) {
      throw new Error(
        "Google Generative AI API key is missing. Please set GOOGLE_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
      )
    }

    const prompt = `Analyze the following resume against the job description. Provide a compatibility score (0-100), a list of strengths, a list of areas for improvement, and a list of keywords found in the resume that are also in the job description, and a list of keywords missing from the resume that are in the job description.

    Resume:
    ${resumeText}

    Job Description:
    ${jobDescription}

    Format your response as a JSON object with the following structure:
    {
      "score": number,
      "strengths": string[],
      "improvements": string[],
      "keywords": {
        "found": string[],
        "missing": string[]
      }
    }
    `

    const { text } = await generateText({
      model: googleModel,
      prompt: prompt,
      temperature: 0.7,
    })

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
