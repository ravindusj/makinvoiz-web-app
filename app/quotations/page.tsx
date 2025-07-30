"use client"

import { useState } from "react"
import { QuotationForm } from "@/components/quotation-form"
import { QuotationPreview } from "@/components/quotation-preview"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Add imports
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { generateQuotationNumber } from "@/lib/id-utils"

interface QuotationItem {
  id: number
  description: string
  quantity: number
  rate: number
  discount: number
  discountType: 'percentage' | 'amount'
}

interface QuotationData {
  id?: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  clientName: string
  clientAddress: string
  quotationNumber: string
  quotationDate: string
  dueDate: string
  items: QuotationItem[]
  terms: string
  notes: string
  signature: string
}

// Wrap the component content
export default function QuotationsPage() {
  const [isPreview, setIsPreview] = useState(false)
  const [quotationData, setQuotationData] = useState<QuotationData>({
    companyName: "<your-company-name>",
    companyAddress: "<your-company-address>",
    companyPhone: "<your-company-mobile-no>",
    companyEmail: "<your-company-email>",
    clientName: "",
    clientAddress: "",
    quotationNumber: generateQuotationNumber(),
    quotationDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: [
      {
        id: 1,
        description: "Default Quotation Item",
        quantity: 1,
        rate: 50,
        discount: 0,
        discountType: 'percentage' as 'percentage' | 'amount',
      },
    ],
    terms: "Payment due within 15 days. Service warranty applies for 30 days.",
    notes: "Professional AC repair and maintenance services.",
    signature: "",
  })

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3 flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
                {isPreview ? "Preview Quotation" : "Create Quotation"}
              </h1>
            </div>
            <Button 
              onClick={() => setIsPreview(!isPreview)} 
              variant="outline" 
              className="flex items-center gap-2 flex-shrink-0"
              size="sm"
            >
              {isPreview ? (
                <>
                  <Edit className="w-4 h-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Preview
                </>
              )}
            </Button>
          </div>

          <Card className="border-0 shadow-lg">
            {isPreview ? (
              <QuotationPreview data={quotationData} />
            ) : (
              <QuotationForm data={quotationData} onChange={setQuotationData} />
            )}
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
