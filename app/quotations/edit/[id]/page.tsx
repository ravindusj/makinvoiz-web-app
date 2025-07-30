"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { QuotationForm } from "@/components/quotation-form"
import { getQuotation, type QuotationData, updateQuotation } from "@/lib/quotations"
import { useToast } from "@/hooks/use-toast"

export default function EditQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [quotationData, setQuotationData] = useState<QuotationData | null>(null)

  useEffect(() => {
    if (params.id) {
      loadQuotation(params.id as string)
    }
  }, [params.id])

  const loadQuotation = async (id: string) => {
    setLoading(true)
    try {
      const result = await getQuotation(id)

      if (result.success && result.data) {
        setQuotationData(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load quotation",
          variant: "destructive",
        })
        router.push("/quotations/list")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quotation",
        variant: "destructive",
      })
      router.push("/quotations/list")
    } finally {
      setLoading(false)
    }
  }

  const handleQuotationChange = (updatedQuotation: QuotationData) => {
    console.log('Quotation data updated:', updatedQuotation);
    setQuotationData(updatedQuotation)
  }

  const handleSave = async () => {
    if (!quotationData) return

    try {
      const result = await updateQuotation(params.id as string, quotationData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Quotation updated successfully",
        })
        router.push(`/quotations/view/${params.id}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update quotation",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quotation",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-slate-50">
          <Navbar />
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading quotation...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!quotationData) {
    return null
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-slate-800">Edit Quotation</h1>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <QuotationForm data={quotationData} onChange={handleQuotationChange} />
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
