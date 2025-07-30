"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { updateProfile, updatePassword } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    companyName: "",
    email: "",
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.user_metadata?.full_name || "",
        companyName: user.user_metadata?.company_name || "",
        email: user.email || "",
      })
    }
  }, [user])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await updateProfile(profileData.fullName, profileData.companyName)

      if (error) {
        setError(error.message)
        return
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const { error } = await updatePassword(passwordData.newPassword)

      if (error) {
        setError(error.message)
        return
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })

      setPasswordData({ newPassword: "", confirmPassword: "" })
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-800">Profile Settings</h1>
            </div>
          </div>

          <Card className="border-0 shadow-lg max-w-2xl">
            <CardContent className="p-5 sm:p-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile" className="text-xs sm:text-sm sm:px-3">Profile Information</TabsTrigger>
                  <TabsTrigger value="password" className="text-xs sm:text-sm sm:px-3">Change Password</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h3>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Enter your full name"
                          disabled={loading}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="companyName" className="text-sm">Company Name</Label>
                        <Input
                          id="companyName"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Enter your company name"
                          disabled={loading}
                          className="text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm">Email Address</Label>
                        <Input id="email" value={profileData.email} disabled className="bg-slate-100 text-sm" />
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">This feature will be integrate soon!</p>
                      </div>

                      <Button type="submit" className="bg-slate-600 hover:bg-slate-700" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Profile
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </TabsContent>

                <TabsContent value="password" className="space-y-6 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Password</h3>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="Enter new password"
                            disabled={loading}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={loading}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="Confirm new password"
                            disabled={loading}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={loading}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button type="submit" className="bg-slate-600 hover:bg-slate-700" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Update Password
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
