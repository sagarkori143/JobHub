"use client"

import React from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CheckCircle, Github, Linkedin, Instagram, Mail, User as UserIcon } from "lucide-react"
import { JobHubWorkflow } from "@/components/jobhub-workflow"
import Image from "next/image"

const features = [
  "Job Search & Discovery with advanced filters",
  "Application Tracking (Applied, Interviewing, Offers, Rejected)",
  "Insightful Dashboard & Analytics",
  "Personal Job Management & Notes",
  "AI-powered Resume Scoring",
  "Real-time Job Notifications",
  "Portal Statistics & Trends",
  "Streaks Calendar & Gamified Progress",
]

const developers = [
  {
    name: "Sagar Kori",
    image: "/sagar-kori.jpg", // ensure image placed in public/
    linkedin: "https://www.linkedin.com/in/sagarkori143/",
    instagram: "https://www.instagram.com/sagarkori143/",
    email: "sagarkoriup11@gmail.com",
  },
  {
    name: "Alok Rai",
    image: "/alok-rai.jpg",
    linkedin: "https://www.linkedin.com/in/alok-rai158/",
    instagram: "https://www.instagram.com/158alokrai/",
  },
  {
    name: "Omkar Patil",
    image: "/omkar-patil.jpg",
    linkedin: "https://www.linkedin.com/in/omkar-patil-32b926253/",
    instagram: "https://www.instagram.com/skyom_11/",
  },
]

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
      <h1 className="text-4xl font-bold text-center text-gray-800">About JobHub</h1>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Platform Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
            {features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Workflow Section */}
      <JobHubWorkflow />

      {/* GitHub Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Github className="h-5 w-5" />
            GitHub Repository
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Explore the source code, report issues, or contribute on {" "}
            <Link
              href="https://github.com/yourusername/JobHub"
              target="_blank"
              className="text-blue-600 underline"
            >
              GitHub
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      {/* Developers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserIcon className="h-5 w-5" />
            Developers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm text-gray-700">
            {developers.map((dev) => (
              <div key={dev.name} className="flex flex-col items-center text-center space-y-3 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Image
                  src={dev.image}
                  alt={dev.name}
                  width={96}
                  height={96}
                  className="rounded-full object-cover border w-24 h-24"
                />
                <p className="font-semibold text-gray-800 text-sm md:text-base">{dev.name}</p>
                <div className="flex items-center gap-4">
                  <Link href={dev.linkedin} target="_blank" aria-label="LinkedIn">
                    <Linkedin className="h-5 w-5 text-[#0A66C2] hover:scale-110 transition-transform" />
                  </Link>
                  <Link href={dev.instagram} target="_blank" aria-label="Instagram">
                    <Instagram className="h-5 w-5 text-pink-500 hover:scale-110 transition-transform" />
                  </Link>
                  {dev.email && (
                    <Link href={`mailto:${dev.email}`} aria-label="Email">
                      <Mail className="h-5 w-5 text-red-500 hover:scale-110 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 