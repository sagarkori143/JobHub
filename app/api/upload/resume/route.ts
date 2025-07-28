import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scoreResumeWithGemini } from "@/lib/gemini-ats-score";

export async function POST(req: NextRequest) {
  try {
    const { userId, resumeText, jobDescription } = await req.json();
    console.log("[UPLOAD/RESUME] Request body:", { userId, hasResumeText: !!resumeText, jobDescription });
    
    if (!userId || !resumeText) {
      console.error("[UPLOAD/RESUME] Missing userId or resumeText");
      return NextResponse.json({ error: "userId and resumeText are required." }, { status: 400 });
    }
    
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("[UPLOAD/RESUME] Missing Gemini API key");
      return NextResponse.json({ 
        error: "Google Generative AI API key is missing. Set GOOGLE_GENERATIVE_AI_API_KEY in your environment." 
      }, { status: 500 });
    }
    
    // Use provided jobDescription or fallback
    const jobDesc = jobDescription || "Entry Level Software Engineer";
    let parsed;
    
    try {
      console.log("[UPLOAD/RESUME] Calling Gemini scoring...");
      parsed = await scoreResumeWithGemini({ resumeText, jobDescription: jobDesc, apiKey });
      console.log("[UPLOAD/RESUME] Gemini scoring result:", parsed);
      
      if (!parsed || typeof parsed.score !== 'number') {
        throw new Error("Invalid scoring result from Gemini");
      }
    } catch (e: any) {
      console.error("[UPLOAD/RESUME] Gemini scoring failed:", e);
      return NextResponse.json({ 
        error: `Error processing resume scoring request: ${e instanceof Error ? e.message : String(e)}` 
      }, { status: 500 });
    }
    
    // Save resumeText and score to the database for the user
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[UPLOAD/RESUME] Supabase credentials missing");
      return NextResponse.json({ error: "Supabase service credentials not set." }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch current resume_scores
    console.log("[UPLOAD/RESUME] Fetching user profile from Supabase...");
    const { data: userProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("resume_scores")
      .eq("id", userId)
      .single();
      
    if (fetchError) {
      console.error("[UPLOAD/RESUME] Failed to fetch user profile:", fetchError);
      return NextResponse.json({ error: "Failed to fetch user profile." }, { status: 500 });
    }
    
    const prevScores = userProfile?.resume_scores || [];
    const newScore = { score: parsed.score, date: new Date().toISOString() };
    const updatedScores = [...prevScores, newScore];
    
    console.log("[UPLOAD/RESUME] Updating scores:", { prevScores, newScore, updatedScores });
    
    // Update user profile
    console.log("[UPLOAD/RESUME] Updating user profile with new score...");
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        resume_text: resumeText,
        resume_scores: updatedScores
      })
      .eq("id", userId);
      
    if (updateError) {
      console.error("[UPLOAD/RESUME] Failed to update user profile:", updateError);
      return NextResponse.json({ error: "Failed to update user profile with score." }, { status: 500 });
    }
    
    console.log("[UPLOAD/RESUME] Success! Returning response.");
    return NextResponse.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("[UPLOAD/RESUME] Unhandled error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
} 