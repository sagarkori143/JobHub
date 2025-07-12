"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Bell, Database, Users, Mail, Settings, RefreshCw } from "lucide-react"

export default function DebugNotificationsPage() {
  const [hashMapStats, setHashMapStats] = useState<any>(null)
  const [hashMapDetails, setHashMapDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { user, jobPreferences } = useAuth()
  const { toast } = useToast()

  const testNotifications = async () => {
    setLoading(true)
    try {
      if (!user?.email) throw new Error('No user email found');
      const response = await fetch(`/api/notifications/process?testUserEmail=${encodeURIComponent(user.email)}`, {
        method: 'GET'
      })
      const data = await response.json()
      
      if (data.success) {
        setHashMapStats(data.stats)
        setHashMapDetails(data.details)
        toast({
          title: "Test Notifications Sent!",
          description: `Processed ${data.jobsProcessed} mock job notifications using hash map approach.`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send test notifications",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Notification Debug Center
          </h1>
          <p className="text-gray-600 text-lg">
            Debug and test the hash map notification system
          </p>
        </div>

        {/* Current User Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Current User Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">User Info</h3>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Job Preferences</h3>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div>
                      <p className="font-medium">Keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {jobPreferences.keywords.map((keyword) => (
                          <Badge key={keyword} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">Industries:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {jobPreferences.industries.map((industry) => (
                          <Badge key={industry} variant="secondary">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">Locations:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {jobPreferences.locations.map((location) => (
                          <Badge key={location} variant="secondary">
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium">Job Types:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {jobPreferences.jobTypes.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Please sign in to view preferences</p>
            )}
          </CardContent>
        </Card>

        {/* Test Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <span>Test Hash Map Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Test the hash map notification system with mock job data. This will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>Build preference hash maps from all users</li>
                <li>Match mock jobs against user preferences</li>
                <li>Create user email queue with matched jobs</li>
                <li>Send structured emails to matching users</li>
              </ul>
              
              <Button
                onClick={testNotifications}
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Testing...' : 'Test Hash Map Notifications'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hash Map Statistics */}
        {hashMapStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-green-600" />
                <span>Hash Map Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{hashMapStats.techStacks}</div>
                  <div className="text-sm text-blue-600">Tech Stacks</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{hashMapStats.industries}</div>
                  <div className="text-sm text-green-600">Industries</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{hashMapStats.locations}</div>
                  <div className="text-sm text-purple-600">Locations</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{hashMapStats.jobTypes}</div>
                  <div className="text-sm text-orange-600">Job Types</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{hashMapStats.experienceLevels}</div>
                  <div className="text-sm text-red-600">Experience Levels</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">{hashMapStats.userEmailQueue}</div>
                  <div className="text-sm text-indigo-600">Users in Queue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hash Map Details */}
        {hashMapDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Hash Map Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Tech Stacks */}
                <div>
                  <h3 className="font-semibold mb-2">Tech Stacks Hash Map</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="text-xs">
                      {JSON.stringify(hashMapDetails.preferenceHashMaps.techStacks, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Industries */}
                <div>
                  <h3 className="font-semibold mb-2">Industries Hash Map</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="text-xs">
                      {JSON.stringify(hashMapDetails.preferenceHashMaps.industries, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* User Email Queue */}
                <div>
                  <h3 className="font-semibold mb-2">User Email Queue</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                    <pre className="text-xs">
                      {JSON.stringify(hashMapDetails.userEmailQueue, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 