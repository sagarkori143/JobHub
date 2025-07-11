"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function AccountVerifiedPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const token = searchParams.get("token")
  const type = searchParams.get("type") // 'signup' or 'recovery'

  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your account...")
  const { verifyEmailOtp, verifyPasswordResetOtp } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const handleVerification = async () => {
      if (!email || !token || !type) {
        setVerificationStatus("error")
        setMessage("Invalid verification link. Missing email, token, or type.")
        toast({
          title: "Verification Failed",
          description: "Invalid verification link.",
          variant: "destructive",
        })
        return
      }

      let result: { success: boolean; message?: string }

      if (type === "signup") {
        result = await verifyEmailOtp(email, token)
      } else if (type === "recovery") {
        // For recovery, we only verify the OTP here, password reset happens in the modal
        result = await verifyPasswordResetOtp(email, token)
      } else {
        setVerificationStatus("error")
        setMessage("Invalid verification type.")
        toast({
          title: "Verification Failed",
          description: "Invalid verification type.",
          variant: "destructive",
        })
        return
      }

      if (result.success) {
        setVerificationStatus("success")
        setMessage(result.message || "Your account has been successfully verified!")
        toast({
          title: "Success!",
          description: result.message || "Account verified.",
        })
      } else {
        setVerificationStatus("error")
        setMessage(result.message || "Account verification failed. Please try again or request a new link.")
        toast({
          title: "Verification Failed",
          description: result.message || "Account verification failed.",
          variant: "destructive",
        })
      }
    }

    handleVerification()
  }, [email, token, type, verifyEmailOtp, verifyPasswordResetOtp, toast])

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {verificationStatus === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <CardTitle className="text-2xl font-bold">Verifying...</CardTitle>
              <CardDescription>{message}</CardDescription>
            </div>
          )}
          {verificationStatus === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <CardTitle className="text-2xl font-bold">Success!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </div>
          )}
          {verificationStatus === "error" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500" />
              <CardTitle className="text-2xl font-bold">Verification Failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {verificationStatus === "success" && (
            <Link href="/personal">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          )}
          {verificationStatus === "error" && (
            <Link href="/">
              <Button className="w-full bg-transparent" variant="outline">
                Go to Home
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
