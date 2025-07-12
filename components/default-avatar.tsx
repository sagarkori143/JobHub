"use client"

import { cn } from "@/lib/utils"

interface DefaultAvatarProps {
  name: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg"
}

const colors = [
  "bg-red-500",
  "bg-blue-500", 
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-cyan-500"
]

export function DefaultAvatar({ name, size = "md", className }: DefaultAvatarProps) {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Generate consistent color based on name
  const colorIndex = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const bgColor = colors[colorIndex]

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold",
        bgColor,
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  )
} 