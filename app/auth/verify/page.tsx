"use client"

import type React from "react"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { resendVerificationEmail } from "@/lib/auth"
import { 
  Mail, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  AlertCircle 
} from "lucide-react"

function VerifyPageContent() {
  const [resendLoading, setResendLoading] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const email = searchParams.get('email')
    if (email) {
      setUserEmail(email)
      setEmailInput(email)
    } else {
      setShowEmailInput(true)
    }
  }, [searchParams])

  const handleResendEmail = async () => {
    const emailToUse = userEmail || emailInput

    if (!emailToUse) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setResendLoading(true)
    
    try {
      const { error } = await resendVerificationEmail(emailToUse)
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox for the new verification email.",
      })

      // Update the email state if it was entered manually
      if (!userEmail && emailInput) {
        setUserEmail(emailInput)
        setShowEmailInput(false)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md border-0 shadow-lg mx-2 sm:mx-0">
        <CardHeader className="text-center space-y-2 p-3 sm:p-6">
          <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-lime-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-lime-800">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            {userEmail ? (
              <>We've sent a verification link to <strong>{userEmail}</strong></>
            ) : (
              "We've sent a verification link to your email address"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4">
          <Alert className="border-slate-200 bg-slate-50">
            <CheckCircle className="h-4 w-4 text-lime-600" />
            <AlertDescription className="text-lime-800">
              <strong>Account created successfully!</strong> Please verify your email to continue.
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lime-600 font-bold text-xs">1</span>
              </div>
              <div>
                <p className="font-medium text-slate-700">Check your inbox</p>
                <p>Look for an email from our team with the subject "Verify your account"</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lime-600 font-bold text-xs">2</span>
              </div>
              <div>
                <p className="font-medium text-slate-700">Click the verification link</p>
                <p>Click the "Verify Email" button in the email to activate your account</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lime-600 font-bold text-xs">3</span>
              </div>
              <div>
                <p className="font-medium text-slate-700">Start using your account</p>
                <p>Once verified, you can sign in and start managing your invoices</p>
              </div>
            </div>
          </div>

          <Alert className="border-amber-200 bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Didn't receive the email?</strong> Check your spam folder or click the resend button below.
            </AlertDescription>
          </Alert>

          {showEmailInput && (
            <div className="space-y-2">
              <Label htmlFor="email">Enter your email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="h-9 sm:h-10"
              />
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full border-lime-200 text-lime-700 hover:bg-lime-50"
              disabled={resendLoading}
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend verification email
                </>
              )}
            </Button>

            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full bg-lime-600 hover:bg-lime-700"
            >
              Back to Sign In
            </Button>
          </div>

          <div className="text-center space-y-1.5 sm:space-y-2 mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Need help?{" "}
              <Link href="/about" className="text-lime-500 hover:underline">
                Contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading component for Suspense fallback
function VerifyPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md border-0 shadow-lg mx-2 sm:mx-0">
        <CardHeader className="text-center space-y-2 p-3 sm:p-6">
          <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-lime-600" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-lime-800">Loading...</CardTitle>
          <CardDescription className="text-center">
            Preparing your verification page
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyPageLoading />}>
      <VerifyPageContent />
    </Suspense>
  )
}
