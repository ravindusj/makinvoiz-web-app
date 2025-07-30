"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { resetPassword } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Receipt, CreditCard, FileText, Calculator, ArrowLeft, Mail } from "lucide-react"

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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { error } = await resetPassword(email)

            if (error) {
                setError(error.message)
                return
            }

            setSuccess(true)
            toast({
                title: "Reset link sent!",
                description: "Check your email for the password reset link.",
            })
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
                            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600" />
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Check Your Email</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            We've sent a password reset link to <strong>{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-6 space-y-4">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-slate-600">
                                Click the link in your email to reset your password. The link will expire in 1 hour.
                            </p>
                            <p className="text-sm text-slate-600">
                                Didn't receive the email? Check your spam folder or{" "}
                                <button
                                    onClick={() => {
                                        setSuccess(false)
                                        setEmail("")
                                    }}
                                    className="text-cyan-500 hover:underline"
                                >
                                    try again
                                </button>
                            </p>
                            <br />
                        </div>
                        <Link href="/auth/login">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
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
                    <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Forgot Password</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                        Enter your email address and we'll send you a link to reset your password
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
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="h-9 sm:h-10 placeholder:text-sm sm:placeholder:text-sm"
                            />
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
                                        <span className="text-sm sm:text-base">Sending...</span>
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </div>

                        <div className="text-center mt-4">
                            <Link href="/auth/login" className="text-sm sm:text-sm text-cyan-500 hover:underline inline-flex items-center">
                                <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}