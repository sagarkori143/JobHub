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
  // No artificial cap on streak length now

  private static formatDateLocal(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Generate calendar data for current month
  static generateCalendarData(loginDates: string[] = []): CalendarDay[] {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayString = this.formatDateLocal(today)
    
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()
    const firstDayWeekday = firstDayOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    const calendar: CalendarDay[] = []
    
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i
      const date = new Date(currentYear, currentMonth - 1, day)
      const dateString = this.formatDateLocal(date)
      calendar.push({
        date: dateString,
        day,
        isCurrentMonth: false,
        isToday: dateString === todayString,
        isLoggedIn: loginDates.includes(dateString),
        isStreakDay: false
      })
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateString = this.formatDateLocal(date)
      
      calendar.push({
        date: dateString,
        day,
        isCurrentMonth: true,
        isToday: dateString === todayString,
        isLoggedIn: loginDates.includes(dateString),
        isStreakDay: false
      })
    }
    
    const remainingDays = 42 - calendar.length // 6 rows * 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(currentYear, currentMonth + 1, day)
      const dateString = this.formatDateLocal(date)
      calendar.push({
        date: dateString,
        day,
        isCurrentMonth: false,
        isToday: dateString === todayString,
        isLoggedIn: loginDates.includes(dateString),
        isStreakDay: false
      })
    }
    
    return calendar
  }

  // Update streaks when user logs in
  static updateLoginStreak(currentStreaks: StreakData | null): StreakData {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayString = this.formatDateLocal(today)
    
    if (!currentStreaks) {
      return {
        currentStreak: 1,
        longestStreak: 1,
        totalApplications: 0,
        loginDates: [todayString],
        lastLoginDate: todayString,
        lastApplicationDate: null
      }
    }

    if (currentStreaks.loginDates.includes(todayString)) {
      return currentStreaks
    }

    const loginDates = [...currentStreaks.loginDates, todayString]
    const lastLoginDate = currentStreaks.lastLoginDate ? new Date(currentStreaks.lastLoginDate) : null
    
    let newCurrentStreak = currentStreaks.currentStreak
    let newLongestStreak = currentStreaks.longestStreak

    if (lastLoginDate) {
      const daysSinceLastLogin = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastLogin === 1) {
        // Consecutive day
        newCurrentStreak = Math.min(currentStreaks.currentStreak + 1, 7) // Keep the artificial cap
      } else if (daysSinceLastLogin > 1) {
        // Streak broken
        newCurrentStreak = 1
      }
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
      lastLoginDate: todayString
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
    return Math.min((streaks.currentStreak / 7) * 100, 100) // Use 7 as the cap
  }

  // Check if streak is at max
  static isMaxStreak(streaks: StreakData): boolean {
    return streaks.currentStreak >= 7 // Use 7 as the cap
  }

  // Get month name
  static getMonthName(date: Date = new Date()): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Get week day names
  static getWeekDays(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  }

  static calculateStreaks(loginDates: string[]): { current: number; longest: number } {
    if (loginDates.length === 0) return { current: 0, longest: 0 };

    // sort dates ascending
    const dates = [...loginDates].sort();
    let longest = 1;
    let current = 1;

    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current += 1;
      } else if (diff > 1) {
        current = 1;
      }
      longest = Math.max(longest, current);
    }

    // Current streak should be consecutive up to most recent date
    const todayString = this.formatDateLocal(new Date());
    const latestDate = dates[dates.length - 1];
    if (latestDate !== todayString) {
      // if last login wasn't today, need to recalc current streak ending at latestDate but not today
      // already handled above so do nothing
    }

    return { current, longest };
  }
}