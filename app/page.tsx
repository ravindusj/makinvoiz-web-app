"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Receipt, Plus, Settings } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Welcome back, {user?.user_metadata?.full_name || "User"}!
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Professional quotation and billing system for{" "}
              {user?.user_metadata?.company_name || "your AC repair services"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl text-slate-800">Quotations</CardTitle>
                <CardDescription className="text-slate-600">
                  Create professional quotations for your AC repair services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/quotations" className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Quotation
                  </Button>
                </Link>
                <Link href="/quotations/list" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    View All Quotations
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl text-slate-800">Bills</CardTitle>
                <CardDescription className="text-slate-600">
                  Generate and manage bills for completed services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/bills" className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Bill
                  </Button>
                </Link>
                <Link href="/bills/list" className="block">
                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                  >
                    View All Bills
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-slate-600" />
                </div>
                <CardTitle className="text-2xl text-slate-800">Settings</CardTitle>
                <CardDescription className="text-slate-600">
                  Configure default company information and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/settings" className="block">
                  <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Settings
                  </Button>
                </Link>
                <Link href="/about" className="block">
                  <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100 bg-transparent">
                    About Invoice Manager
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
