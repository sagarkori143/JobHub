"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { GoogleIcon } from "./google-icon" // Import the GoogleIcon component
import { SignUpModal } from "./signup-modal" // Import the new SignUpModal
import { ForgotPasswordModal } from "./forgot-password-modal" // Import the new ForgotPasswordModal

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false) // State for sign-up modal
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false) // State for forgot password modal
  const { login, loginWithGoogle } = useAuth() // Get loginWithGoogle
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({
        title: "Input Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      const result = await login(email, password) // Get the detailed result
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: result.message || "You have successfully signed in.",
        })
        onClose()
        setEmail("")
        setPassword("")
      } else {
        toast({
          title: "Sign in failed",
          description: result.message || "Invalid email or password.",
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

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
      // Supabase redirects, so no need for toast or onClose here immediately
    } catch (error) {
      console.error("Google login initiation failed:", error)
      toast({
        title: "Google Sign-in Failed",
        description: "Could not initiate Google sign-in. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openSignUpModal = () => {
    onClose() // Close login modal
    setIsSignUpModalOpen(true) // Open sign-up modal
  }

  const closeSignUpModal = () => {
    setIsSignUpModalOpen(false)
  }

  const openForgotPasswordModal = () => {
    onClose() // Close login modal
    setIsForgotPasswordModalOpen(true) // Open forgot password modal
  }

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          {" "}
          {/* Made responsive */}
          <DialogHeader>
            <DialogTitle className="text-center text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to JobHub
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sagar@gmail.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full mb-2 text-xs"
              onClick={() => {
                setEmail("sagarkoriup11@gmail.com");
                setPassword("666666");
              }}
            >
              Use Demo Credentials
            </Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <Button variant="link" className="w-full text-center text-sm" onClick={openForgotPasswordModal}>
            Forgot Password?
          </Button>
          <div className="relative ">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            
          </div>
          
          <Button variant="link" className="w-full text-center" onClick={openSignUpModal}>
            Don't have an account? Sign Up
          </Button>
        </DialogContent>
      </Dialog>
      <SignUpModal isOpen={isSignUpModalOpen} onClose={closeSignUpModal} />
      <ForgotPasswordModal isOpen={isForgotPasswordModalOpen} onClose={closeForgotPasswordModal} />
    </>
  )
}
