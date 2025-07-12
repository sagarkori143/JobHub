// Gemini API service for searching company logos
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private static async callGeminiAPI(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key not found");
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content.parts[0]?.text || "";
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  static async searchCompanyLogo(companyName: string): Promise<string> {
    const prompt = `Search the web for the official logo URL of the company "${companyName}". 
    Return only the direct URL to the company's official logo image (preferably PNG or SVG format, high resolution).
    If you can't find the official logo, return a URL to a reliable logo from a trusted source.
    Return only the URL, nothing else.`;

    try {
      const logoUrl = await this.callGeminiAPI(prompt);
      
      // Clean up the response - remove any markdown formatting or extra text
      const cleanUrl = logoUrl.trim().replace(/^```.*\n?/, '').replace(/\n?```$/, '');
      
      // Validate that it looks like a URL
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        return cleanUrl;
      }
      
      throw new Error("Invalid logo URL returned");
    } catch (error) {
      console.error(`Failed to find logo for ${companyName}:`, error);
      throw error;
    }
  }

  static async searchAndCacheCompanyLogo(companyName: string): Promise<string> {
    try {
      const logoUrl = await this.searchCompanyLogo(companyName);
      
      // Test if the URL is accessible
      const testResponse = await fetch(logoUrl, { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error("Logo URL not accessible");
      }
      
      return logoUrl;
    } catch (error) {
      console.error(`Failed to get logo for ${companyName}:`, error);
      // Return a placeholder if all else fails
      return "/placeholder.svg?height=40&width=40";
    }
  }
} 