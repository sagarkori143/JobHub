import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const supabase = createServerSupabaseClient()
  console.log("[CheckEmail] lookup email", email)
  try {
    const emailLower = email.toLowerCase()
    const { data, error: adminErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (adminErr) {
      return NextResponse.json({ error: adminErr.message }, { status: 500 })
    }
    const user = data?.users?.find((u: any) => u.email?.toLowerCase() === emailLower)
    const verified = user ? !!user.email_confirmed_at : false
    return NextResponse.json({ exists: verified })
  } catch (err: any) {
    console.error("[CheckEmail] error", err)
    return NextResponse.json({ error: "Check failed" }, { status: 500 })
  }
} 