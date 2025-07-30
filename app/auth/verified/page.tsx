"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Files, CheckCircle, Loader2 } from "lucide-react"

export default function VerifiedPage() {
  const [countdown, setCountdown] = useState(5)
  const [redirecting, setRedirecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setRedirecting(true)
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [router])

  const handleGoToAccount = () => {
    setRedirecting(true)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md border-0 shadow-lg mx-2 sm:mx-0">
        <CardHeader className="text-center space-y-2 p-3 sm:p-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
            <Files className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-cyan-800">You're Verified!</CardTitle>
          <CardDescription>Your email has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Email verified successfully!</strong> Your account is now active and ready to use.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-slate-600">
                Welcome to your invoice management system! You can now create bills, quotations, and manage your business finances.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-2">
                Redirecting to your account in
              </p>
              <div className="text-2xl font-bold text-cyan-600 mb-2">
                {countdown}
              </div>
              <p className="text-xs text-slate-500">
                seconds
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoToAccount}
                className="w-full h-10 sm:h-10 text-sm sm:text-base bg-cyan-600 hover:bg-cyan-700"
                disabled={redirecting}
              >
                {redirecting ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="text-sm sm:text-base">Redirecting...</span>
                  </>
                ) : (
                  "Go to Your Account"
                )}
              </Button>

              <Button
                onClick={() => router.push("/auth/login")}
                variant="outline"
                className="w-full h-10 sm:h-10 text-sm sm:text-base border-cyan-200 text-cyan-700 hover:bg-cyan-50"
                disabled={redirecting}
              >
                Sign In Instead
              </Button>
            </div>

            <div className="text-center space-y-1.5 sm:space-y-2 mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm sm:text-sm text-slate-600">
                Need help getting started?{" "}
                <Link href="/about" className="text-cyan-500 hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
