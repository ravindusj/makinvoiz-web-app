"use client"

import { useState } from "react"
import { BillForm } from "@/components/bill-form"
import { BillPreview } from "@/components/bill-preview"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Add imports
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { generateBillNumber } from "@/lib/id-utils"

interface BillItem {
  id: number
  description: string
  quantity: number
  rate: number
  discount: number
  discountType: 'percentage' | 'amount'
}

interface BillData {
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  clientName: string
  clientAddress: string
  billNumber: string
  billDate: string
  dueDate: string
  items: BillItem[]
  terms: string
  notes: string
  signature: string
  id?: string
}

// Wrap the component content
export default function BillsPage() {
  const [isPreview, setIsPreview] = useState(false)
  const [billData, setBillData] = useState<BillData>({
    companyName: "<your-company-name>",
    companyAddress: "<your-company-address>",
    companyPhone: "<your-company-mobile-no>",
    companyEmail: "<your-company-email>",
    clientName: "",
    clientAddress: "",
    billNumber: generateBillNumber(),
    billDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: [
      {
        id: 1,
        description: "Default Bill Item",
        quantity: 1,
        rate: 150,
        discount: 0,
        discountType: 'percentage' as 'percentage' | 'amount',
      },
    ],
    terms: "Payment due within 15 days. Service warranty applies for 30 days.",
    notes: "Thank you for choosing our services.",
    signature: "",
  })

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3 flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Button>
              </Link>
              <h1 className="text-lg md:text-2xl font-bold text-slate-800 truncate">
                {isPreview ? "Preview Bill" : "Create Bill"}
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
                  <span>Edit</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </>
              )}
            </Button>
          </div>

          <Card className="border-0 shadow-lg">
            {isPreview ? <BillPreview data={billData} /> : <BillForm data={billData} onChange={setBillData} />}
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
