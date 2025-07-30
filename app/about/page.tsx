"use client"

import { Navbar } from "@/components/navbar"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Heart, Github, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto mb-6">
            <Button
              variant="ghost"
              className="gap-2 text-slate-600 hover:text-slate-800"
              asChild
            >
              <Link href="/">
                <ChevronLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <Card className="max-w-3xl mx-auto border-0 shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-slate-800 mb-1">Makinvoiz</CardTitle>
              <p className="text-sm text-slate-500">Version 1.1.0</p>
            </CardHeader>
            <CardContent className="space-y-8 px-6">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-lg font-medium text-slate-800 mb-3">About</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Makinvoiz is a professional quotation and billing system designed specifically for companies. 
                  It streamlines the process of creating, managing, and tracking quotations and bills, helping you focus more on your 
                  business and less on paperwork.
                </p>
                
                <h2 className="text-lg font-medium text-slate-800 mt-8 mb-3">Version Changes</h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-lime-100 text-lime-700 text-xs rounded-full">Latest</div>
                      <h3 className="text-sm font-medium text-slate-800">Version 1.1.0</h3>
                      <span className="text-xs text-slate-500">- July 11, 2025</span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-2 list-none pl-0">
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-lime-400 rounded-full"></div>
                        <span>Fully redesigned mobile layout for improved user experience 📱</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-lime-400 rounded-full"></div>
                        <span>Added signature pad to invoices for digital signing</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-lime-400 rounded-full"></div>
                        <span>Added cookie-based login session handling</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-lime-400 rounded-full"></div>
                        <span>General UI enhancements across the app</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-slate-800">Version 1.0.0</h3>
                      <span className="text-xs text-slate-500">- July 6, 2025</span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-2 list-none pl-0">
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <span>Initial release</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <span>Professional quotation and billing system</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <span>User authentication and company profiles</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-slate-800">Beta 0.9.0</h3>
                      <span className="text-xs text-slate-500">- June 29, 2025</span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-2 list-none pl-0">
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <span>Beta testing phase</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                        <span>Core functionality implementation</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center mt-10 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                    Built with{" "}
                    <span className="inline-block group">
                      <Heart 
                        className="h-3.5 w-3.5 text-red-500 stroke-red-500 transition-all duration-300 
                        group-hover:fill-red-500 group-hover:stroke-red-500 group-hover:scale-110" 
                      />
                    </span>
                    {" "}by{" "}
                    <span className="flex items-center gap-1.5">
                      <a 
                        href="https://github.com/ravindusj" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Github className="h-3.5 w-3.5" />
                      </a>
                      ravindusj
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
