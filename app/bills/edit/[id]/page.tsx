"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { BillForm } from "@/components/bill-form"
import { getBill, type BillData, updateBill } from "@/lib/bills"
import { useToast } from "@/hooks/use-toast"

export default function EditBillPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [billData, setBillData] = useState<BillData | null>(null)

  useEffect(() => {
    if (params.id) {
      loadBill(params.id as string)
    }
  }, [params.id])

  const loadBill = async (id: string) => {
    setLoading(true)
    try {
      const result = await getBill(id)

      if (result.success && result.data) {
        setBillData(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load bill",
          variant: "destructive",
        })
        router.push("/bills/list")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bill",
        variant: "destructive",
      })
      router.push("/bills/list")
    } finally {
      setLoading(false)
    }
  }

  const handleBillChange = (updatedBill: BillData) => {
    setBillData(updatedBill)
  }

  const handleSave = async () => {
    if (!billData) return

    try {
      const result = await updateBill(params.id as string, billData)

      if (result.success) {
        toast({
          title: "Success",
          description: "Bill updated successfully",
        })
        router.push(`/bills/view/${params.id}`)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update bill",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill",
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading bill...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!billData) {
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
              <h1 className="text-2xl font-bold text-slate-800">Edit Bill</h1>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <BillForm data={billData} onChange={handleBillChange} />
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
