
"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the access_token and refresh_token from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')
        
        // Also check URL search params for token (some email providers may use these)
        const urlAccessToken = searchParams.get('access_token')
        const urlRefreshToken = searchParams.get('refresh_token')
        const urlType = searchParams.get('type')

        const finalAccessToken = accessToken || urlAccessToken
        const finalRefreshToken = refreshToken || urlRefreshToken
        const finalType = type || urlType

        if (finalType === 'email' && finalAccessToken && finalRefreshToken) {
          // Set the session with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken,
          })

          if (error) {
            throw error
          }

          if (data.user) {
            setStatus('success')
            // Redirect to verified page after a short delay
            setTimeout(() => {
              router.push('/auth/verified')
            }, 1000)
          } else {
            throw new Error('No user data received')
          }
        } else if (finalType === 'signup') {
          // Handle signup verification
          setStatus('success')
          setTimeout(() => {
            router.push('/auth/verified')
          }, 1000)
        } else {
          // Check if there's an error in the URL
          const errorParam = hashParams.get('error') || searchParams.get('error')
          const errorDescription = hashParams.get('error_description') || searchParams.get('error_description')
          
          if (errorParam) {
            throw new Error(errorDescription || errorParam)
          }
          
          // If no specific type, try to get the current session
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            throw error
          }
          
          if (session) {
            setStatus('success')
            setTimeout(() => {
              router.push('/auth/verified')
            }, 1000)
          } else {
            throw new Error('Invalid verification link or link has expired')
          }
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err.message || 'An unexpected error occurred during verification')
        setStatus('error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <CardHeader className="text-center space-y-2 p-3 sm:p-6">
              <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-lime-600 animate-spin" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-lime-800">Verifying Your Email</CardTitle>
              <CardDescription>Please wait while we verify your email address...</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Alert className="border-lime-200 bg-lime-50">
                <Loader2 className="h-4 w-4 text-lime-600 animate-spin" />
                <AlertDescription className="text-lime-800">
                  Processing your email verification...
                </AlertDescription>
              </Alert>
            </CardContent>
          </>
        )

      case 'success':
        return (
          <>
            <CardHeader className="text-center space-y-2 p-3 sm:p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-green-800">Email Verified!</CardTitle>
              <CardDescription>Your email has been successfully verified. Redirecting you now...</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Success!</strong> Your account is now verified and active.
                </AlertDescription>
              </Alert>
            </CardContent>
          </>
        )

      case 'error':
        return (
          <>
            <CardHeader className="text-center space-y-2 p-3 sm:p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-red-800">Verification Failed</CardTitle>
              <CardDescription>There was an issue verifying your email address</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/verify')}
                  className="w-full bg-lime-600 hover:bg-lime-700"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Request New Verification Email
                </Button>
                
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="outline"
                  className="w-full border-lime-200 text-lime-700 hover:bg-lime-50"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md border-0 shadow-lg mx-2 sm:mx-0">
        {renderContent()}
      </Card>
    </div>
  )
}

// Loading component for Suspense fallback
function AuthCallbackLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md border-0 shadow-lg mx-2 sm:mx-0">
        <CardHeader className="text-center space-y-2 p-3 sm:p-6">
          <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-lime-600 animate-spin" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-lime-800">Loading...</CardTitle>
          <CardDescription>Preparing your verification page</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
