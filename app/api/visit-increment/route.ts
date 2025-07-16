import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    
    // Step 1: Update total visits in portal_stats table
    
    // Get current total visits
    const { data: stats, error: statsError } = await supabase
      .from("portal_stats")
      .select("total_visits")
      .eq("id", 1)
      .single();
    
    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }
    
    const currentTotalVisits = stats?.total_visits || 0;
    const newTotalVisits = currentTotalVisits + 1;
    
    // Update total visits
    const { error: updateError } = await supabase
      .from("portal_stats")
      .update({ 
        total_visits: newTotalVisits, 
        last_updated: new Date().toISOString() 
      })
      .eq("id", 1);
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Step 2: Update daily visits in portal_stats_daily table
    
    // Get current daily visits for today
    const { data: dailyStats, error: dailyStatsError } = await supabase
      .from("portal_stats_daily")
      .select("visits")
      .eq("date", today)
      .single();
    
    const currentDailyVisits = dailyStats?.visits || 0;
    const newDailyVisits = currentDailyVisits + 1;
    
    // Upsert daily stats (insert if doesn't exist, update if exists)
    const { error: dailyUpdateError } = await supabase
      .from("portal_stats_daily")
      .upsert({
        date: today,
        visits: newDailyVisits
      }, {
        onConflict: "date"
      });
    
    // Step 3: Verify both updates were successful
    
    // Verify total visits
    const { data: verifyStats, error: verifyStatsError } = await supabase
      .from("portal_stats")
      .select("total_visits")
      .eq("id", 1)
      .single();
    
    // Verify daily visits
    const { data: verifyDaily, error: verifyDailyError } = await supabase
      .from("portal_stats_daily")
      .select("visits")
      .eq("date", today)
      .single();
    
    return NextResponse.json({ 
      success: true, 
      totalVisits: newTotalVisits, 
      dailyVisits: newDailyVisits,
      date: today
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 