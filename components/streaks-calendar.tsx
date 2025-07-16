"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle } from "lucide-react"
import { StreaksService, type CalendarDay } from "@/lib/streaks-service"

interface StreaksCalendarProps {
  loginDates: string[]
  currentStreak: number
  longestStreak: number
}

export function StreaksCalendar({ loginDates, currentStreak, longestStreak }: StreaksCalendarProps) {
  const calendarData = StreaksService.generateCalendarData(loginDates)
  const weekDays = StreaksService.getWeekDays()
  const monthName = StreaksService.getMonthName()

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-4 h-4 text-blue-600" />
          Activity Calendar - {monthName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`
                  aspect-[1.2] flex items-center justify-center text-xs font-medium rounded-md border
                  ${day.isCurrentMonth 
                    ? day.isToday 
                      ? 'bg-blue-100 border-blue-300 text-blue-800' 
                      : day.isLoggedIn 
                        ? 'bg-green-100 border-green-300 text-green-800' 
                        : 'bg-white border-gray-200 text-gray-700'
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                  }
                  ${day.isLoggedIn ? 'relative' : ''}
                `}
              >
                {day.isLoggedIn && (
                  <CheckCircle className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-green-600" />
                )}
                {day.day}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-green-100 border border-green-300 rounded"></div>
              <span>Logged in</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Today</span>
            </div>
          </div>

          {/* Streak stats */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-700">{currentStreak}</div>
              <div className="text-xs text-gray-500">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-700">{longestStreak}</div>
              <div className="text-xs text-gray-500">Best Streak</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 