"use client"

import { DefaultAvatar } from "./default-avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  user: {
    name: string
    avatar?: string | null
  }
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  if (!user.avatar) {
    return <DefaultAvatar name={user.name} size={size} className={className} />
  }

  return (
    <div className={cn("rounded-full overflow-hidden flex-shrink-0", className)}>
      <img
        src={user.avatar}
        alt={`${user.name}'s avatar`}
        className={cn(
          "w-full h-full object-cover object-center",
          size === "sm" && "w-8 h-8",
          size === "md" && "w-10 h-10",
          size === "lg" && "w-12 h-12",
          size === "xl" && "w-16 h-16"
        )}
        onError={(e) => {
          // Fallback to default avatar if image fails to load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            const defaultAvatar = document.createElement('div')
            defaultAvatar.innerHTML = `<div class="w-full h-full rounded-full flex items-center justify-center text-white font-semibold bg-blue-500">${user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>`
            parent.appendChild(defaultAvatar.firstElementChild!)
          }
        }}
        onLoad={(e) => {
          // Ensure proper sizing and centering
          const target = e.target as HTMLImageElement
          target.style.objectFit = 'cover'
          target.style.objectPosition = 'center'
        }}
      />
    </div>
  )
} 