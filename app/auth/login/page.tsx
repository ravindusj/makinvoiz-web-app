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
import { signIn } from "@/lib/auth"
import { getSavedCredentials } from "@/lib/auth-cookies"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Files } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = getSavedCredentials()
    if (savedCredentials) {
      setEmail(savedCredentials.email)
      setPassword(savedCredentials.password)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await signIn(email, password) // Automatically remember all users

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
        })
        router.push("/")
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md border-0 shadow-lg mx-2 sm:mx-0">
        <CardHeader className="text-center space-y-2 p-3 sm:p-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-4">
            <Files className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-cyan-800">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-9 sm:h-10 placeholder:text-sm sm:placeholder:text-sm"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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

            <div className="mt-6 sm:mt-0">
              <Button
                type="submit"
                className="w-full h-10 sm:h-10 text-sm sm:text-base bg-cyan-600 hover:bg-cyan-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="text-sm sm:text-base">Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>

            <div className="text-center space-y-1.5 sm:space-y-2 mt-4">
              <Link href="/auth/forgot-password" className="text-sm sm:text-sm text-cyan-500 hover:underline block">
                Forgot your password?
              </Link>
              <p className="text-sm sm:text-sm text-slate-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-cyan-500 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
