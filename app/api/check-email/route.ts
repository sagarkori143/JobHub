import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const supabase = createServerSupabaseClient()
  console.log("[CheckEmail] lookup email", email)
  try {
    const { data } = await supabase.auth.admin.listUsers({ email })
    console.log("[CheckEmail] admin listUsers result", data)
    const exists = data?.users?.length > 0
    return NextResponse.json({ exists })
  } catch (err: any) {
    console.error("[CheckEmail] error", err)
    return NextResponse.json({ error: "Check failed" }, { status: 500 })
  }
} 