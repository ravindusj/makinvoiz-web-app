"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AuthGuard } from "@/components/auth-guard"
import { Navbar } from "@/components/navbar"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { getQuotations, deleteQuotation, type QuotationListItem } from "@/lib/quotations"

export default function QuotationListPage() {
  const [quotations, setQuotations] = useState<QuotationListItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadQuotations()
  }, [])

  const loadQuotations = async () => {
    setLoading(true)
    try {
      const result = await getQuotations()

      if (result.success && result.data) {
        setQuotations(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load quotations",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()),
  )



  // Open delete confirmation dialog
  const openDeleteDialog = (id: string) => {
    setQuotationToDelete(id)
    setDeleteDialogOpen(true)
  }

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false)
    setQuotationToDelete(null)
  }

  // Handle actual deletion
  const confirmDelete = async () => {
    if (!quotationToDelete) return

    try {
      const result = await deleteQuotation(quotationToDelete)

      if (!result.success) {
        throw new Error(result.error)
      }

      setQuotations(quotations.filter((q) => q.id !== quotationToDelete))
      toast({
        title: "Success",
        description: "Quotation deleted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete quotation.",
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
              <p className="text-slate-600">Loading quotations...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2 sm:p-3">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-2">Back to Home</span>
                </Button>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-800">All Quotations</h1>
            </div>
            <Link href="/quotations">
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-10 w-10 sm:h-auto sm:w-auto p-0 sm:p-3">
                <Plus className="w-6 h-6 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2">New Quotation</span>
              </Button>
            </Link>
          </div>

          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search quotations by client name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 h-9 sm:h-10 text-sm sm:text-base"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 sm:gap-4">
            {filteredQuotations.map((quotation) => (
              <Card key={quotation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-6">
                  <div className="block sm:flex sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                      <div className="flex items-start sm:items-center justify-between sm:justify-start gap-2 sm:gap-4 mb-2 sm:mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 truncate">{quotation.quotation_number}</h3>
                      </div>
                      <div className="space-y-1 sm:space-y-0.5">
                        <p className="text-sm sm:text-base text-slate-600">Client: {quotation.client_name}</p>
                        <p className="text-xs sm:text-sm text-slate-500">
                          Date: {new Date(quotation.quotation_date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-lg sm:text-2xl font-bold text-slate-800 mt-2 sm:hidden">
                        Rs. {Math.round(quotation.total_amount).toLocaleString('en-US')}/=
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 mt-3 sm:mt-0">
                      <p className="hidden sm:block text-lg sm:text-2xl font-bold text-slate-800 mb-2">
                        Rs. {Math.round(quotation.total_amount).toLocaleString('en-US')}/=
                      </p>
                      <div className="flex gap-3 sm:gap-2">
                        <Link href={`/quotations/view/${quotation.id}`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </Link>
                        <Link href={`/quotations/edit/${quotation.id}`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(quotation.id)}
                          className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredQuotations.length === 0 && (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-slate-500 mb-4">
                  {searchTerm ? "No quotations found matching your search" : "No quotations found"}
                </p>
                <Link href="/quotations">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4" />
                    <span className="ml-2">Create Your First Quotation</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
          title="Delete Quotation?"
          description="Are you sure you want to delete this quotation? This action cannot be undone."
          confirmText="Delete Quotation"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </AuthGuard>
  )
}
