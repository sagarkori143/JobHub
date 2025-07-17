import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("name, experience, issues, suggestions, created_at")
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Reviews GET error", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ reviews: data })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, experience, issues, suggestions } = body

    if (!experience || experience.trim() === "") {
      return NextResponse.json(
        { error: "Experience is required" },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("reviews").insert({
      id: crypto.randomUUID(),
      name: name || null,
      experience,
      issues: issues || null,
      suggestions: suggestions || null,
    })

    if (error) {
      console.error("Insert review error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: any) {
    console.error("Review POST error", err)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
} 