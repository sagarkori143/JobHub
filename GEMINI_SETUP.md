# Gemini API Setup for Company Logo Search

This application uses Google's Gemini API to search for company logos when they're not available in our existing database.

## Setup Instructions

1. **Get a Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Add the API Key to Environment Variables:**
   Create a `.env.local` file in the root directory and add:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Restart the Development Server:**
   ```bash
   npm run dev
   ```

## How It Works

1. When a job card is displayed, the system first checks if the company logo exists in our local database
2. If not found, it calls the Gemini API to search the web for the company's official logo
3. The logo URL is cached to avoid repeated API calls
4. If the API call fails, a placeholder logo is displayed

## API Endpoint

The logo search is handled by the `/api/company-logo` endpoint which:
- Accepts a POST request with `{ companyName: string }`
- Returns `{ logoUrl: string }`
- Uses Gemini to search for logos when not found locally

## Error Handling

- If Gemini API is not configured, placeholder logos are used
- If API calls fail, the system gracefully falls back to placeholders
- Logo URLs are validated before being used 