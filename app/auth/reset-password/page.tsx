"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updatePassword } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Receipt, CreditCard, FileText, Calculator, CheckCircle } from "lucide-react"

// Swapping Logo Component
const SwappingLogo = () => {
  const [currentIcon, setCurrentIcon] = useState(0)
  const icons = [Receipt, CreditCard, FileText, Calculator]
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const IconComponent = icons[currentIcon]

  return (
    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4 overflow-hidden">
      <IconComponent
        key={currentIcon}
        className="w-6 h-6 sm:w-8 sm:h-8 text-white transition-all duration-500 ease-in-out transform hover:scale-110 animate-fade-in"
      />
    </div>
  )
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Check if we have the required tokens from the URL
  useEffect(() => {
    // Supabase sends tokens as URL fragments, not query params
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1)) // Remove the # and parse
    
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')
    
    if (!accessToken || !refreshToken || type !== 'recovery') {
      setError("Invalid or expired reset link. Please request a new password reset.")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const { error } = await updatePassword(password)

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      toast({
        title: "Password updated!",
        description: "Your password has been successfully updated.",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-md border-0 shadow-lg mx-2 sm:mx-0">
          <CardHeader className="text-center space-y-2 p-3 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Password Updated</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your password has been successfully updated
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600">
                You will be redirected to the login page in a few seconds...
              </p>
              <br/>
            </div>
            <Link href="/auth/login">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                Continue to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md border-0 shadow-lg mx-2 sm:mx-0">
        <CardHeader className="text-center space-y-2 p-3 sm:p-6">
          <SwappingLogo />
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Reset Password</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-9 sm:h-10 placeholder:text-sm sm:placeholder:text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 sm:px-3 py-1 sm:py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-9 sm:h-10 placeholder:text-sm sm:placeholder:text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 sm:px-3 py-1 sm:py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                </Button>
              </div>
            </div>

            <div className="mt-6 sm:mt-0">
              <Button
                type="submit"
                className="w-full h-10 sm:h-10 text-sm sm:text-base bg-cyan-600 hover:bg-cyan-700"
                disabled={loading || !!error}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="text-sm sm:text-base">Updating...</span>
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>

            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-sm sm:text-sm text-cyan-500 hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}