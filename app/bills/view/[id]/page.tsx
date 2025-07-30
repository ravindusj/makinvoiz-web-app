"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { BillPreview } from "@/components/bill-preview"
import { getBill, type BillData } from "@/lib/bills"
import { loadUserSettings } from "@/lib/settings"
import { useToast } from "@/hooks/use-toast"

export default function ViewBillPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [billData, setBillData] = useState<BillData | null>(null)
  const [settings, setSettings] = useState<{ logoUrl?: string; signatureUrl?: string }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (params.id) {
        await loadBill(params.id as string)
        const savedSettings = await loadUserSettings()
        setSettings({ 
          logoUrl: savedSettings.logoUrl,
          signatureUrl: savedSettings.signatureUrl
        })
      }
    }
    loadData()
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
              <Link href="/bills/list">
                <Button variant="ghost" size="sm" className="h-8 sm:h-9">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to List</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-800">View Bill</h1>
            </div>
            <Link href={`/bills/edit/${params.id}`}>
              <Button variant="outline" size="sm" className="h-8 sm:h-9 bg-transparent">
                <Edit className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
                <span className="sm:hidden">Edit</span>
              </Button>
            </Link>
          </div>

          <Card className="border-0 shadow-lg">
            <BillPreview data={billData} settings={settings} />
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
