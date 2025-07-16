import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const metric = searchParams.get("metric") || "users";
  const validMetrics = ["users", "jobs", "emails", "visits"];
  
  console.log("📊 Daily Stats API: Requested metric:", metric);
  
  if (!validMetrics.includes(metric)) {
    console.error("❌ Daily Stats API: Invalid metric:", metric);
    return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
  }
  
  try {
    const { data, error } = await supabase
      .from("portal_stats_daily")
      .select(`date, ${metric}`)
      .order("date", { ascending: true })
      .gte("date", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)); // last 30 days
    
    console.log("📊 Daily Stats API: Query result for metric", metric, ":", { data, error });
    
    if (error) {
      console.error("❌ Daily Stats API: Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log("📊 Daily Stats API: Returning data for metric", metric, ":", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Daily Stats API: Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 