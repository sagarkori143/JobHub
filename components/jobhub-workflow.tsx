"use client"

import React from "react"
import { ArrowRight, ArrowDown, Download, FileJson, Clock, Database, MailCheck, Send } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const steps = [
  {
    title: "Scrapers crawl career pages",
    icon: Download,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Generate JSON job files",
    icon: FileJson,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Cron job fetches JSON files",
    icon: Clock,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Update JobHub database",
    icon: Database,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Populate email queue",
    icon: MailCheck,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Deliver notifications",
    icon: Send,
    color: "bg-pink-100 text-pink-600",
  },
]

export function JobHubWorkflow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          Workflow Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
          {steps.map((step, idx) => (
            <React.Fragment key={step.title}>
              <div className="flex flex-col items-center text-center max-w-[120px]">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${step.color} shadow-md`}>
                  <step.icon className="w-8 h-8" />
                </div>
                <p className="mt-2 text-xs md:text-sm font-medium">{step.title}</p>
              </div>
              {idx < steps.length - 1 && (
                <>
                  {/* Arrow for desktop */}
                  <ArrowRight className="hidden md:block w-6 h-6 text-gray-400 animate-bounce-x" />
                  {/* Arrow for mobile */}
                  <ArrowDown className="md:hidden w-6 h-6 text-gray-400 animate-bounce-y" />
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 