"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, MapPin, Briefcase } from "lucide-react"
import { mockJobs } from "@/data/mock-jobs" // Using mockJobs for dashboard stats

export default function MainDashboard() {
  const totalJobs = mockJobs.length
  const remoteJobs = mockJobs.filter((job) => job.remote).length
  const avgSalary = Math.round(
    mockJobs.reduce((sum, job) => sum + (job.salary.min + job.salary.max) / 2, 0) / mockJobs.length,
  )

  const topCompanies = mockJobs.reduce(
    (acc, job) => {
      acc[job.company] = (acc[job.company] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topIndustries = mockJobs.reduce(
    (acc, job) => {
      acc[job.industry] = (acc[job.industry] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-8 p-4 md:p-0">
      {" "}
      {/* Added responsive padding */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Job Market Overview</h1>
        <p className="text-gray-600 text-base md:text-lg">Latest insights and trends in the job market</p>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {" "}
        {/* Made responsive */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs Available</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">Active job listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remote Opportunities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remoteJobs}</div>
            <p className="text-xs text-muted-foreground">{Math.round((remoteJobs / totalJobs) * 100)}% of all jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgSalary.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(topCompanies).length}</div>
            <p className="text-xs text-muted-foreground">Companies hiring</p>
          </CardContent>
        </Card>
      </div>
      {/* Top Industries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Industries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(topIndustries)
              .sort(([, a], [, b]) => b - a)
              .map(([industry, count]) => (
                <Badge key={industry} variant="secondary">
                  {industry} ({count})
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
      {/* Recent Job Postings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-gray-600">
                    {job.company} • {job.location}
                  </p>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <Badge>{job.type}</Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    ${(job.salary.min / 1000).toFixed(0)}k - ${(job.salary.max / 1000).toFixed(0)}k
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
