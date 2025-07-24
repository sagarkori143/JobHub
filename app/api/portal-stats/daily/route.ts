import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get("metric") || "users";
  const validMetrics = ["users", "jobs", "emails", "visits"];
  
  
  if (!validMetrics.includes(metric)) {
    return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
  }
  
  try {
    const { data, error } = await supabase
      .from("portal_stats_daily")
      .select(`date, ${metric}`)
      .order("date", { ascending: true })
      .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)); // last 30 days
    
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 