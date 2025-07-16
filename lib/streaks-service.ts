// Streaks service for tracking user activity and applications
export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalApplications: number
  loginDates: string[]
  lastLoginDate: string | null
  lastApplicationDate: string | null
}

export interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isLoggedIn: boolean
  isStreakDay: boolean
}

export class StreaksService {
  private static readonly MAX_STREAK_DAYS = 7

  // Generate calendar data for current month
  static generateCalendarData(loginDates: string[] = []): CalendarDay[] {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    // Get first day of month and total days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    const calendar: CalendarDay[] = []
    
    // Add previous month's days to fill first week
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      const date = new Date(currentYear, currentMonth - 1, day)
      calendar.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
        isToday: false,
        isLoggedIn: loginDates.includes(date.toISOString().split('T')[0]),
        isStreakDay: false
      })
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateString = date.toISOString().split('T')[0]
      const isToday = dateString === today.toISOString().split('T')[0]
      
      calendar.push({
        date: dateString,
        day,
        isCurrentMonth: true,
        isToday,
        isLoggedIn: loginDates.includes(dateString),
        isStreakDay: false
      })
    }
    
    // Add next month's days to fill last week
    const remainingDays = 42 - calendar.length // 6 rows * 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day)
      calendar.push({
        date: date.toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
        isToday: false,
        isLoggedIn: loginDates.includes(date.toISOString().split('T')[0]),
        isStreakDay: false
      })
    }
    
    return calendar
  }

  // Update streaks when user logs in
  static updateLoginStreak(currentStreaks: StreakData | null): StreakData {
    const today = new Date().toISOString().split('T')[0]
    
    if (!currentStreaks) {
      return {
        currentStreak: 1,
        longestStreak: 1,
        totalApplications: 0,
        loginDates: [today],
        lastLoginDate: today,
        lastApplicationDate: null
      }
    }

    // Check if already logged in today
    if (currentStreaks.loginDates.includes(today)) {
      return currentStreaks
    }

    const loginDates = [...currentStreaks.loginDates, today]
    const lastLoginDate = currentStreaks.lastLoginDate ? new Date(currentStreaks.lastLoginDate) : null
    const todayDate = new Date(today)
    
    let newCurrentStreak = currentStreaks.currentStreak
    let newLongestStreak = currentStreaks.longestStreak

    if (lastLoginDate) {
      const daysSinceLastLogin = Math.floor((todayDate.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastLogin === 1) {
        // Consecutive day
        newCurrentStreak = Math.min(currentStreaks.currentStreak + 1, this.MAX_STREAK_DAYS)
      } else if (daysSinceLastLogin > 1) {
        // Streak broken
        newCurrentStreak = 1
      }
      // If daysSinceLastLogin === 0, it's the same day, keep current values
    } else {
      // First login
      newCurrentStreak = 1
    }

    newLongestStreak = Math.max(currentStreaks.longestStreak, newCurrentStreak)

    return {
      ...currentStreaks,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      loginDates,
      lastLoginDate: today
    }
  }

  // Update streaks when user sends an application
  static updateApplicationStreak(currentStreaks: StreakData | null): StreakData {
    const today = new Date().toISOString().split('T')[0]
    
    if (!currentStreaks) {
      return {
        currentStreak: 1,
        longestStreak: 1,
        totalApplications: 1,
        loginDates: [today],
        lastLoginDate: today,
        lastApplicationDate: today
      }
    }

    return {
      ...currentStreaks,
      totalApplications: currentStreaks.totalApplications + 1,
      lastApplicationDate: today
    }
  }

  // Get streak motivation message
  static getStreakMessage(streaks: StreakData): string {
    if (streaks.currentStreak >= streaks.longestStreak && streaks.currentStreak > 1) {
      return "🔥 New record! Keep the momentum going!"
    } else if (streaks.currentStreak >= 5) {
      return "🔥 Amazing streak! You're unstoppable!"
    } else if (streaks.currentStreak >= 3) {
      return "🔥 Great streak! You're on fire!"
    } else if (streaks.currentStreak >= 1) {
      return "💪 Good start! Keep it up!"
    } else {
      return "🚀 Start your streak today!"
    }
  }

  // Get streak progress percentage
  static getStreakProgress(streaks: StreakData): number {
    return Math.min((streaks.currentStreak / this.MAX_STREAK_DAYS) * 100, 100)
  }

  // Check if streak is at max
  static isMaxStreak(streaks: StreakData): boolean {
    return streaks.currentStreak >= this.MAX_STREAK_DAYS
  }

  // Get month name
  static getMonthName(date: Date = new Date()): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Get week day names
  static getWeekDays(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }
}