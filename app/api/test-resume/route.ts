import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    // Check environment variables
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const envCheck = {
      hasApiKey: !!apiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
    };
    
    console.log("[TEST-RESUME] Environment check:", envCheck);
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ 
        error: "Missing Supabase credentials",
        envCheck 
      }, { status: 500 });
    }
    
    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, email")
      .limit(1);
      
    if (error) {
      return NextResponse.json({ 
        error: "Supabase connection failed",
        supabaseError: error.message,
        envCheck 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: "All systems operational",
      envCheck,
      supabaseConnected: true,
      userCount: data?.length || 0
    });
    
  } catch (error: any) {
    console.error("[TEST-RESUME] Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
} 