import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("portal_stats")
      .select("total_users, total_emails_generated, total_jobs_added, total_visits, last_updated")
      .eq("id", 1)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stats: data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { data, error } = await supabase
      .rpc("increment_portal_visits") // assume we may not have function yet; fallback update

    if (error) {
      // Fall back to manual update
      const { data: existing, error: err2 } = await supabase
        .from("portal_stats")
        .select("total_visits")
        .eq("id", 1)
        .single();
      if (err2) {
        return NextResponse.json({ error: err2.message }, { status: 500 });
      }
      const newCount = (existing?.total_visits || 0) + 1;
      const { error: updErr } = await supabase
        .from("portal_stats")
        .update({ total_visits: newCount, last_updated: new Date().toISOString() })
        .eq("id", 1);
      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, total_visits: newCount });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 