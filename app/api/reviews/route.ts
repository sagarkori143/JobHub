import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const reviewsFilePath = path.join(process.cwd(), "data", "reviews.json")

async function readReviews() {
  try {
    const data = await fs.readFile(reviewsFilePath, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeReviews(reviews: any) {
  await fs.writeFile(reviewsFilePath, JSON.stringify(reviews, null, 2))
}

export async function GET() {
  const reviews = await readReviews()
  return NextResponse.json({ reviews })
}

export async function POST(request: Request) {
  try {
    const { name, experience, issues, suggestions } = await request.json()
    if (!name || !experience) {
      return NextResponse.json({ error: "Name and experience are required" }, { status: 400 })
    }
    const newReview = {
      id: Date.now(),
      name,
      experience,
      issues,
      suggestions,
      created_at: new Date().toISOString(),
    }
    const reviews = await readReviews()
    reviews.push(newReview)
    await writeReviews(reviews)
    return NextResponse.json({ success: true, review: newReview }, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
} 