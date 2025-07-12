import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Get the most recent job update timestamp from the database
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error fetching job metadata:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch job metadata',
        lastUpdated: null 
      }, { status: 500 })
    }

    // If no jobs exist, return null for lastUpdated
    const lastUpdated = jobs && jobs.length > 0 ? jobs[0].updated_at : null

    // Get total job count
    const { count: totalJobs, error: countError } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting jobs:', countError)
    }

    return NextResponse.json({
      success: true,
      lastUpdated,
      totalJobs: totalJobs || 0,
      hasData: jobs && jobs.length > 0
    })
  } catch (error) {
    console.error('Error in jobs metadata API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      lastUpdated: null 
    }, { status: 500 })
  }
} 