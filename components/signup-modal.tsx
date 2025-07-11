"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const [step, setStep] = useState(1) // 1: User details, 2: OTP verification
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [gender, setGender] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup, verifyEmailOtp } = useAuth()
  const { toast } = useToast()

  const handleSendOtpForSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name || !password || !gender) {
      toast({
        title: "Input Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)

    try {
      const result = await signup(name, email, password, gender)
      if (result.success) {
        toast({
          title: "OTP Sent!",
          description: result.message,
        })
        setStep(2) // Move to OTP verification step
      } else {
        toast({
          title: "Sign up failed",
          description: result.message || "Could not register. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong during sign up. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) {
      toast({
        title: "Input Error",
        description: "Please enter the OTP.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      const result = await verifyEmailOtp(email, otp)
      if (result.success) {
        toast({
          title: "Account Verified!",
          description: result.message,
        })
        onClose()
        setStep(1) // Reset for next time
        setName("")
        setEmail("")
        setPassword("")
        setGender("")
        setOtp("")
      } else {
        toast({
          title: "Verification Failed",
          description: result.message || "Invalid OTP. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong during OTP verification. Please try again.",
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
            {step === 1 ? "Create Your JobHub Account" : "Verify Your Email"}
          </DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <form onSubmit={handleSendOtpForSignup} className="space-y-4">
            <div>
              <Label htmlFor="signup-name">Name</Label>
              <Input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                required
              />
            </div>
            <div>
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>
            <div>
              <Label htmlFor="signup-gender">Gender</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger id="signup-gender">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Sign Up"}
            </Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              An OTP has been sent to <span className="font-semibold">{email}</span>. Please enter it below to verify
              your account.
            </p>
            <div>
              <Label htmlFor="otp-input">OTP</Label>
              <Input
                id="otp-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Account"}
            </Button>
            <Button variant="link" onClick={handleSendOtpForSignup} disabled={isLoading} className="w-full">
              Resend OTP
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
