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
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 max-w-sm mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calendar className="w-3 h-3 text-blue-600" />
          {monthName}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-0.5">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-[10px] font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`
                  h-6 flex items-center justify-center text-[10px] font-medium rounded-sm border
                  ${day.isCurrentMonth 
                    ? day.isLoggedIn && day.isToday
                      ? 'bg-green-100 border-blue-400 text-green-800'
                      : day.isToday 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : day.isLoggedIn 
                          ? 'bg-green-100 border-green-300 text-green-800' 
                          : 'bg-white border-gray-200 text-gray-700'
                    : 'bg-gray-50 border-gray-100 text-gray-400'
                  }
                  ${day.isLoggedIn ? 'relative' : ''}
                `}
              >
                {day.isLoggedIn && !day.isToday && (
                  <div className="absolute top-0 right-0 w-1 h-1 bg-green-500 rounded-full"></div>
                )}
                {day.day}
              </div>
            ))}
          </div>

          {/* Streak stats */}
          <div className="flex justify-center gap-4 pt-2 border-t border-gray-100">
            <div className="text-center">
              <div className="text-sm font-bold text-blue-700">{currentStreak}</div>
              <div className="text-[10px] text-gray-500">Current</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-green-700">{longestStreak}</div>
              <div className="text-[10px] text-gray-500">Best</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 