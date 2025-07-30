"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Upload, X } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { loadUserSettings, saveSettings } from "@/lib/settings"
import { supabase } from "@/lib/supabase-client"
import { Navbar } from "@/components/navbar"
import { SignaturePad } from "@/components/signature-pad"

interface CompanySettings {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  logoUrl: string
  signatureUrl: string
  defaultTerms: string
  defaultNotes: string
  taxNumber: string
  bankDetails: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<CompanySettings>({
    companyName: "<your-company-name>",
    companyAddress: "<your-company-address>",
    companyPhone: "<your-company-mobile-no>",
    companyEmail: "<your-company-email>",
    companyWebsite: "<your-company-web>",
    logoUrl: "",
    signatureUrl: "",
    defaultTerms: `1. Payment due within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.

2. Please quote invoice number when remitting funds.

3. All services come with a 30-day warranty from the date of completion.

4. Emergency service calls are subject to additional charges.`,
    defaultNotes: `Thank you for choosing our AC repair services. We provide professional air conditioning repair, maintenance, and installation services with experienced technicians and quality parts.

For any technical support or warranty claims, please contact us within the warranty period.`,
    taxNumber: "",
    bankDetails: "",
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")
  const [signatureData, setSignatureData] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await loadUserSettings()
      setSettings(savedSettings)
      if (savedSettings.logoUrl) {
        setLogoPreview(savedSettings.logoUrl)
      }
      if (savedSettings.signatureUrl) {
        setSignatureData(savedSettings.signatureUrl)
      }
    }

    loadSettings()
  }, [])

  const handleInputChange = (field: keyof CompanySettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateFile = (file: File) => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Please upload a valid image file (JPG, PNG, or WebP)')
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size should be less than 2MB')
    }
  }

  const uploadLogo = async (file: File): Promise<string> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    // Create a unique filename with user ID to avoid conflicts
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // If there's an existing logo, delete it first
    if (settings.logoUrl) {
      const oldFileName = settings.logoUrl.split('/').pop()
      if (oldFileName) {
        await supabase.storage
          .from('logos')
          .remove([oldFileName])
      }
    }

    // Upload the new logo
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const uploadSignature = async (signatureDataUrl: string): Promise<string> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    // Convert data URL to blob
    const response = await fetch(signatureDataUrl)
    const blob = await response.blob()
    
    // Create a unique filename
    const fileName = `signature-${user.id}-${Date.now()}.png`

    // If there's an existing signature, delete it first
    if (settings.signatureUrl) {
      const oldFileName = settings.signatureUrl.split('/').pop()
      if (oldFileName) {
        await supabase.storage
          .from('signatures')
          .remove([oldFileName])
      }
    }

    // Upload the new signature
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('signatures')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      validateFile(file)
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogoPreview(result)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      })
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview("")
    setSettings((prev) => ({ ...prev, logoUrl: "" }))
  }

  const handleSignatureChange = (signature: string) => {
    setSignatureData(signature)
    setSettings((prev) => ({ ...prev, signatureUrl: signature }))
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      let logoUrl = settings.logoUrl
      let signatureUrl = settings.signatureUrl

      if (logoFile) {
        try {
          logoUrl = await uploadLogo(logoFile)
        } catch (error) {
          throw new Error('Error uploading logo: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
      }

      if (signatureData && signatureData !== settings.signatureUrl) {
        try {
          signatureUrl = await uploadSignature(signatureData)
        } catch (error) {
          throw new Error('Error uploading signature: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
      }

      // Save settings to database
      const { success, error } = await saveSettings({
        ...settings,
        logoUrl,
        signatureUrl
      })

      if (!success) {
        throw new Error(error || 'Failed to save settings')
      }

      setLogoFile(null) // Clear the file after successful upload
      toast({
        title: "Success",
        description: "Settings saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = async () => {
    try {
      setIsSaving(true)
      const defaultSettings = {
        companyName: "<your-company-name>",
        companyAddress: "<your-company-address>",
        companyPhone: "<your-company-mobile-no>",
        companyEmail: "<your-company-email>",
        companyWebsite: "<your-company-web>",
        logoUrl: "",
        signatureUrl: "",
        defaultTerms: `1. Payment due within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.

2. Please quote invoice number when remitting funds.

3. All services come with a 30-day warranty from the date of completion.

4. Emergency service calls are subject to additional charges.`,
        defaultNotes: `Thank you for choosing our AC repair services. We provide professional air conditioning repair, maintenance, and installation services with experienced technicians and quality parts.

For any technical support or warranty claims, please contact us within the warranty period.`,
        taxNumber: "",
        bankDetails: "",
      }

      // Update the database with default settings
      const { success, error } = await saveSettings(defaultSettings)

      if (!success) {
        throw new Error(error || 'Failed to reset settings')
      }

      // Update local state
      setSettings(defaultSettings)
      setLogoPreview("")
      setSignatureData("")
      setLogoFile(null)

      toast({
        title: "Success",
        description: "Settings have been reset to defaults",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
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
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800">Settings</h1>
          </div>
          <div className="flex gap-3 -ml-2">
            <Button onClick={resetToDefaults} variant="outline" disabled={isSaving} size="sm" className="h-8 px-3 sm:h-9 sm:px-4">
              <span className="hidden sm:inline">Reset to Defaults</span>
              <span className="sm:hidden text-sm">Reset</span>
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-slate-600 hover:bg-slate-700 h-8 px-3 sm:h-9 sm:px-4"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                  <span className="hidden sm:inline">Saving changes...</span>
                  <span className="sm:hidden">Saving changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="company" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
                  <TabsTrigger value="company" className="text-xs sm:text-sm py-2 px-2 sm:px-3">Company Info</TabsTrigger>
                  <TabsTrigger value="logo" className="text-xs sm:text-sm py-2 px-2 sm:px-3">Logo & Branding</TabsTrigger>
                  <TabsTrigger value="templates" className="text-xs sm:text-sm py-2 px-2 sm:px-3">Templates</TabsTrigger>
                  <TabsTrigger value="financial" className="text-xs sm:text-sm py-2 px-2 sm:px-3">Financial Info</TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="space-y-6 mt-6">
                  <div className="p-4 sm:p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Company Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <Label htmlFor="companyName" className="text-xs">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={settings.companyName}
                        onChange={(e) => handleInputChange("companyName", e.target.value)}
                        placeholder="Your Company Name"
                        className="text-xs sm:text-sm h-8 sm:h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyPhone" className="text-sm">Phone Number *</Label>
                      <Input
                        id="companyPhone"
                        value={settings.companyPhone}
                        onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail" className="text-sm">Email Address *</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                        placeholder="info@company.com"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyWebsite" className="text-sm">Website</Label>
                      <Input
                        id="companyWebsite"
                        value={settings.companyWebsite}
                        onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                        placeholder="www.company.com"
                        className="text-sm"
                      />
                    </div>
                    <div className="sm:col-span-1 md:col-span-2">
                      <Label htmlFor="companyAddress" className="text-sm sm:text-base">Company Address *</Label>
                      <Textarea
                        id="companyAddress"
                        value={settings.companyAddress}
                        onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                        placeholder="Street Address, City, State - ZIP Code"
                        rows={3}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="logo" className="space-y-6 mt-6">
                <div className="p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Logo & Branding</h3>
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <Label className="text-sm">Company Logo</Label>
                      <div className="mt-2">
                        {logoPreview ? (
                          <div className="relative inline-block">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                              <Image
                                src={logoPreview || "/placeholder.svg"}
                                alt="Company Logo"
                                width={120}
                                height={120}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <Button
                              onClick={removeLogo}
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                            <div className="text-center">
                              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 mx-auto mb-1 sm:mb-2" />
                              <p className="text-xs sm:text-sm text-slate-500">No logo uploaded</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 sm:mt-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <Button asChild variant="outline" className="text-sm sm:text-base">
                            <span>
                              <Upload className="w-4 h-4 mr-1 sm:mr-2" />
                              Upload Logo
                            </span>
                          </Button>
                        </Label>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-2">
                        Recommended: PNG or JPG format, max 2MB, square aspect ratio works best
                      </p>
                    </div>

                    <div className="border-t pt-6">
                      <Label className="text-sm">Digital Signature</Label>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-4">
                        Draw your signature below. This will be used on bills and quotations.
                      </p>
                      <div className="w-full overflow-hidden">
                        <SignaturePad
                          value={signatureData}
                          onChange={handleSignatureChange}
                          width={350}
                          height={150}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6 mt-6">
                <div className="p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Default Templates</h3>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <Label htmlFor="defaultTerms" className="text-sm">Default Terms and Conditions</Label>
                      <Textarea
                        id="defaultTerms"
                        value={settings.defaultTerms}
                        onChange={(e) => handleInputChange("defaultTerms", e.target.value)}
                        placeholder="Enter your default terms and conditions..."
                        rows={12}
                        className="mt-2 text-sm sm:text-sm sm:rows-6"
                      />
                      <p className="text-xs sm:text-sm text-slate-500 mt-2">
                        These terms will be automatically added to new quotations and bills
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="defaultNotes" className="text-sm">Default Additional Notes</Label>
                      <Textarea
                        id="defaultNotes"
                        value={settings.defaultNotes}
                        onChange={(e) => handleInputChange("defaultNotes", e.target.value)}
                        placeholder="Enter your default additional notes..."
                        rows={7}
                        className="mt-2 text-sm sm:text-sm sm:rows-5"
                      />
                      <p className="text-xs sm:text-sm text-slate-500 mt-2">
                        These notes will be automatically added to new quotations and bills
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-6 mt-6">
                <div className="p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Financial Information</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="taxNumber" className="text-sm">Tax/GST Number</Label>
                      <Input
                        id="taxNumber"
                        value={settings.taxNumber}
                        onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                        placeholder="Enter your tax/GST number"
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bankDetails" className="text-sm">Bank Details</Label>
                      <Textarea
                        id="bankDetails"
                        value={settings.bankDetails}
                        onChange={(e) => handleInputChange("bankDetails", e.target.value)}
                        placeholder="Bank Name, Account Number, Routing Number, etc."
                        rows={3}
                        className="text-sm"
                      />
                      <p className="text-xs sm:text-sm text-slate-500 mt-2">Optional: Add bank details for payment instructions</p>
                    </div>
                  </div>
                </div>
              </TabsContent>


              </Tabs>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
