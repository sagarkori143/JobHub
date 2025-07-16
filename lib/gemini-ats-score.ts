import { generateText } from "ai";
import { google } from "@ai-sdk/google";

const MODELS_TO_TRY = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

async function retryGenerateText(model: any, prompt: string, maxAttempts = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await generateText({ model, prompt });
    } catch (error: any) {
      if (attempt === maxAttempts) throw error;
      await new Promise((res) => setTimeout(res, delayMs * attempt));
    }
  }
}

export async function scoreResumeWithGemini({ resumeText, jobDescription, apiKey, promptOverride }: {
  resumeText: string,
  jobDescription: string,
  apiKey: string,
  promptOverride?: string
}) {
  const prompt = promptOverride || `
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
  `;

  let text = "";
  let lastError = null;
  for (const modelName of MODELS_TO_TRY) {
    try {
      // @ts-expect-error: apiKey is a valid runtime property for google() but not in the type definition
      const model = google(modelName, { apiKey });
      const result = await retryGenerateText(model, prompt);
      if (result && result.text) {
        text = result.text;
        break;
      }
    } catch (error: any) {
      lastError = error;
      continue;
    }
  }
  if (!text) {
    throw lastError || new Error("All available models failed. Please try again later.");
  }

  let cleanedText = text.trim();
  if (cleanedText.startsWith("```json")) {
    cleanedText = cleanedText.slice(7, -3).trim();
  } else if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText.slice(3, -3).trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (parseError) {
    throw new Error("Gemini did not return valid JSON. Raw response: " + cleanedText);
  }
  return parsed;
} 