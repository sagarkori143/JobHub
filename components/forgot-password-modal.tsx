"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState(1) // 1: Enter email, 2: Enter OTP & New Password
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { sendPasswordResetOtp, verifyPasswordResetOtp } = useAuth()
  const { toast } = useToast()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "Input Error",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      const result = await sendPasswordResetOtp(email)
      if (result.success) {
        toast({
          title: "OTP Sent!",
          description: result.message,
        })
        setStep(2) // Move to OTP verification step
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send OTP. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtpAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await verifyPasswordResetOtp(email, otp, newPassword)
      if (result.success) {
        toast({
          title: "Password Reset!",
          description: result.message,
        })
        onClose()
        setStep(1) // Reset for next time
        setEmail("")
        setOtp("")
        setNewPassword("")
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to reset password. Please check OTP and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {step === 1 ? "Forgot Password?" : "Verify OTP & Reset Password"}
          </DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Send Reset OTP"}
            </Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtpAndResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="reset-otp">OTP</Label>
              <Input
                id="reset-otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP from email"
                required
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting Password..." : "Reset Password"}
            </Button>
            <Button variant="link" onClick={() => setStep(1)} disabled={isLoading} className="w-full">
              Resend OTP
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
