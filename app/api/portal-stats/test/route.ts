import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("🧪 Portal Stats Test: Checking current stats");
    
    // Get total visits
    const { data: totalStats, error: totalError } = await supabase
      .from("portal_stats")
      .select("total_visits, last_updated")
      .eq("id", 1)
      .single();
    
    if (totalError) {
      console.error("❌ Portal Stats Test: Error fetching total stats:", totalError);
      return NextResponse.json({ error: totalError.message }, { status: 500 });
    }
    
    // Get daily visits for today
    const today = new Date().toISOString().slice(0, 10);
    const { data: dailyStats, error: dailyError } = await supabase
      .from("portal_stats_daily")
      .select("visits")
      .eq("date", today)
      .single();
    
    if (dailyError && dailyError.code !== "PGRST116") {
      console.error("❌ Portal Stats Test: Error fetching daily stats:", dailyError);
    }
    
    // Get last 7 days of daily visits
    const { data: weeklyStats, error: weeklyError } = await supabase
      .from("portal_stats_daily")
      .select("date, visits")
      .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
      .order("date", { ascending: true });
    
    if (weeklyError) {
      console.error("❌ Portal Stats Test: Error fetching weekly stats:", weeklyError);
    }
    
    const result = {
      success: true,
      totalVisits: totalStats?.total_visits || 0,
      lastUpdated: totalStats?.last_updated,
      today: today,
      todayVisits: dailyStats?.visits || 0,
      weeklyStats: weeklyStats || [],
      hasDailyData: !!dailyStats,
      hasWeeklyData: !!weeklyStats && weeklyStats.length > 0
    };
    
    console.log("✅ Portal Stats Test: Current stats:", result);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Portal Stats Test: Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 