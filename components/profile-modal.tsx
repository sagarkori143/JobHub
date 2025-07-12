"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Briefcase, Calendar, Settings } from "lucide-react"
import Link from "next/link"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [role, setRole] = useState(user?.role || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ name, email, role })
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    })
    onClose()
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        {" "}
        {/* Made responsive */}
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Profile Settings</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <UserAvatar user={user} size="xl" className="ring-4 ring-blue-200" />

          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {new Date(user.joinedDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="role" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Current Role
            </Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {" "}
            {/* Made responsive */}
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
          
          <div className="text-center pt-2">
            <Link href="/profile">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Full Profile Settings
              </Button>
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
