"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, PrinterIcon as Print } from "lucide-react"
import Image from "next/image"
import { generatePDFFromElement } from "@/lib/pdf-utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { getDefaultSettings, loadUserSettings, type CompanySettings } from "@/lib/settings"

interface BillItem {
  id: number
  description: string
  quantity: number
  rate: number
  discount: number
  discountType?: 'percentage' | 'amount'
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
}

interface BillPreviewProps {
  data: BillData
  settings?: {
    logoUrl?: string
    signatureUrl?: string
  }
}

export function BillPreview({ data, settings }: BillPreviewProps) {
  const [showTerms, setShowTerms] = useState(true)
  const [showNotes, setShowNotes] = useState(true)
  const [showDiscount, setShowDiscount] = useState(true)
  const [showFinancialInfo, setShowFinancialInfo] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [userSettings, setUserSettings] = useState<CompanySettings | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await loadUserSettings()
        setUserSettings(settings)
      } catch (error) {
        console.error('Failed to load user settings:', error)
        setUserSettings(getDefaultSettings())
      }
    }
    fetchSettings()
  }, [])

  const numberToWords = (num: number): string => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ]
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ]
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return ""

      let result = ""

      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred "
        n %= 100
        if (n > 0) result += "and "
      }

      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " "
        n %= 10
      } else if (n >= 10) {
        result += teens[n - 10] + " "
        return result
      }

      if (n > 0) {
        result += ones[n] + " "
      }

      return result
    }

    if (num === 0) return "Zero"

    const wholePart = Math.floor(num)
    let result = ""
    let remaining = wholePart

    // Handle millions
    if (remaining >= 1000000) {
      result +=
        convertLessThanThousand(Math.floor(remaining / 1000000)) + "Million "
      remaining = remaining % 1000000
    }

    // Handle thousands
    if (remaining >= 1000) {
      result +=
        convertLessThanThousand(Math.floor(remaining / 1000)) + "Thousand "
      remaining = remaining % 1000
    }

    // Handle remaining hundreds
    result += convertLessThanThousand(remaining)

    // Handle decimal part
    const decimal = Math.round((num % 1) * 100)
    if (decimal > 0) {
      result = result.trim()
      result +=
        " and " + convertLessThanThousand(decimal).trim() + "Cents"
    }

    return result.trim()
  }

  // Format number with thousand separators and 2 decimal places
  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const calculateItemTotal = (item: BillItem) => {
    const subtotal = item.quantity * item.rate
    const discountType = item.discountType || 'percentage'
    const discountAmount = discountType === 'percentage' 
      ? (subtotal * item.discount) / 100 
      : item.discount
    return subtotal - discountAmount
  }

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  )
  const totalDiscount = data.items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.rate
    const discountType = item.discountType || 'percentage'
    const discountAmount = discountType === 'percentage' 
      ? (itemSubtotal * item.discount) / 100 
      : item.discount
    return sum + discountAmount
  }, 0)
  const total = subtotal - totalDiscount

  const handlePrint = () => {
    setIsPrinting(true)
    window.print()
    // Need to use setTimeout because print() is synchronous and doesn't provide callbacks
    setTimeout(() => {
      setIsPrinting(false)
    }, 1000)
  }

  const handleDownload = async () => {
    if (isMobile) {
      await handleMobileDownload()
    } else {
      await handleDesktopDownload()
    }
  }

  const handleDesktopDownload = async () => {
    const element = document.getElementById("bill-preview")
    if (!element) return

    setIsGenerating(true)
    try {
      // Add a delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await generatePDFFromElement(element, {
        fileName: `${data.billNumber || "draft"}.pdf`,
        scale: 2
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Mobile PDF download handler that maintains desktop layout
  const handleMobileDownload = async () => {
    const element = document.getElementById("bill-preview")
    if (!element) return

    setIsGenerating(true)
    try {
      // Temporarily override mobile styles for PDF generation
      const originalClassList = element.className
      const originalStyle = element.style.cssText
      
      // Store original mobile table display
      const mobileTableCards = element.querySelector('.md\\:hidden.space-y-4') as HTMLElement
      const desktopTable = element.querySelector('.hidden.md\\:block') as HTMLElement
      const originalMobileDisplay = mobileTableCards?.style.display
      const originalDesktopDisplay = desktopTable?.style.display
      
      // Apply desktop-like dimensions and show desktop table temporarily for PDF generation
      element.className = `w-[calc(210mm+4rem)] min-h-[297mm] bg-white p-8 mx-auto shadow-lg print:shadow-none rounded-xl transition-all duration-300 ${(isGenerating || isPrinting) ? 'blur-xl pointer-events-none' : ''}`
      element.style.cssText = `
        maxWidth: calc(210mm + 4rem) !important;
        minHeight: 297mm !important;
        backgroundColor: white !important;
        margin: 0 auto !important;
        padding: 2rem !important;
        boxSizing: border-box !important;
        borderRadius: 1rem !important;
        width: calc(210mm + 4rem) !important;
      `
      
      // Show desktop table and hide mobile cards for PDF
      if (mobileTableCards) mobileTableCards.style.display = 'none'
      if (desktopTable) desktopTable.style.display = 'block'

      await new Promise(resolve => setTimeout(resolve, 500))
      
      await generatePDFFromElement(element, {
        fileName: `${data.billNumber || "draft"}.pdf`,
        scale: 2
      })

      // Restore original mobile styles and table displays
      element.className = originalClassList
      element.style.cssText = originalStyle
      if (mobileTableCards) mobileTableCards.style.display = originalMobileDisplay || ''
      if (desktopTable) desktopTable.style.display = originalDesktopDisplay || ''
    } catch (error) {
      console.error("Error generating PDF:", error)
      // Ensure cleanup happens even on error
      const element = document.getElementById("bill-preview")
      if (element) {
        const mobileTableCards = element.querySelector('.md\\:hidden.space-y-4') as HTMLElement
        const desktopTable = element.querySelector('.hidden.md\\:block') as HTMLElement
        if (mobileTableCards) mobileTableCards.style.display = ''
        if (desktopTable) desktopTable.style.display = ''
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 p-2 md:p-4 bg-[#F6F6F6] rounded-2xl min-h-screen md:min-h-0">
      {/* Action Buttons - Desktop */}
      <div className="hidden md:flex items-center justify-between p-4 border-b print:hidden w-[calc(210mm+16rem)] mx-auto bg-white rounded-lg shadow-sm mb-2 relative z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 border-r pr-6">
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                checked={showTerms}
                onChange={(e) => setShowTerms(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Terms & Conditions
            </label>
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Additional Notes
            </label>
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                checked={showDiscount}
                onChange={(e) => setShowDiscount(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Discount
            </label>
            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <input
                type="checkbox"
                checked={showFinancialInfo}
                onChange={(e) => setShowFinancialInfo(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Financial Info
            </label>
          </div>
        </div>
        <div className="flex gap-4">
          <Button onClick={handlePrint} variant="outline" size="sm" disabled={isPrinting}>
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-800 mr-2"></div>
                Printing...
              </>
            ) : (
              <>
                <Print className="w-4 h-4 mr-2" />
                Print
              </>
            )}
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-800 mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons - Mobile */}
      <div className="md:hidden w-full print:hidden relative z-10">
        {/* Mobile Checkboxes */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h3 className="text-sm font-medium text-slate-700 mb-3">Display Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={showTerms}
                onChange={(e) => setShowTerms(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Terms & Conditions
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Additional Notes
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={showDiscount}
                onChange={(e) => setShowDiscount(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Discount
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={showFinancialInfo}
                onChange={(e) => setShowFinancialInfo(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show Financial Info
            </label>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex gap-3">
          <Button onClick={handlePrint} variant="outline" size="sm" disabled={isPrinting} className="flex-1">
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-800 mr-2"></div>
                Printing...
              </>
            ) : (
              <>
                <Print className="w-4 h-4 mr-2" />
                Print
              </>
            )}
          </Button>
          <Button onClick={handleDownload} variant="outline" size="sm" disabled={isGenerating} className="flex-1">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-800 mr-2"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="relative w-full">
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600"></div>
          </div>
        )}
        <div
          id="bill-preview"
          className={`
            w-full md:w-[calc(210mm+4rem)] 
            min-h-[297mm] 
            bg-white 
            p-4 md:p-8 
            mx-auto 
            shadow-lg print:shadow-none 
            rounded-xl 
            transition-all duration-300 
            ${(isGenerating || isPrinting) ? 'blur-xl pointer-events-none' : ''}
          `}
          style={{
            maxWidth: "calc(210mm + 4rem)",
            minHeight: "297mm",
            backgroundColor: "white",
            margin: "0 auto",
            boxSizing: "border-box",
            borderRadius: "1rem",
          }}
        >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 md:gap-0">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {settings?.logoUrl ? (
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                <Image
                  src={settings.logoUrl}
                  alt="Company Logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg md:text-xl">
                  {data.companyName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 break-words">
                {data.companyName}
              </h1>
              <p className="text-slate-600 text-xs md:text-sm break-words">{data.companyAddress}</p>
            </div>
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Bill</h2>
          </div>
        </div> 

        {/* Company and Client Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 mb-6">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-slate-800 mb-2 text-sm md:text-base">Bill by</h3>
            <p className="text-slate-700 font-medium text-sm md:text-base break-words">{data.companyName}</p>
            <p className="text-slate-600 text-xs md:text-sm whitespace-pre-line break-words">
              {data.companyAddress}
            </p>
            <p className="text-slate-600 text-xs md:text-sm break-words">{data.companyPhone}</p>
            <p className="text-slate-600 text-xs md:text-sm break-words">{data.companyEmail}</p>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-semibold text-slate-800 mb-2 text-sm md:text-base">Bill to</h3>
            <p className="text-slate-700 font-medium text-sm md:text-base break-words">
              {data.clientName || "Client Name"}
            </p>
            <p className="text-slate-600 text-xs md:text-sm whitespace-pre-line break-words">
              {data.clientAddress || "Client Address"}
            </p>
          </div>

          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 text-xs md:text-sm">Bill No:</span>
                <span className="font-medium text-xs md:text-sm break-words">{data.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 text-xs md:text-sm">Bill Date:</span>
                <span className="font-medium text-xs md:text-sm">
                  {new Date(data.billDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 text-xs md:text-sm">Due Date:</span>
                <span className="font-medium text-xs md:text-sm">
                  {new Date(data.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-3 text-left font-semibold text-sm">
                    Item #/Item description
                  </th>
                  <th className="border border-slate-300 p-3 text-center font-semibold text-sm">
                    Quantity
                  </th>
                  <th className="border border-slate-300 p-3 text-center font-semibold text-sm">
                    Rate
                  </th>
                  {showDiscount && (
                    <th className="border border-slate-300 p-3 text-center font-semibold text-sm">
                      Discount
                    </th>
                  )}
                  <th className="border border-slate-300 p-3 text-center font-semibold text-sm">
                    Amount
                    {showDiscount && <span className="text-xs font-normal block">(After Discount)</span>}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 p-3">
                      <div className="font-medium text-sm break-words">
                        {item.description || `Item ${index + 1}`}
                      </div>
                    </td>
                    <td className="border border-slate-300 p-3 text-center text-sm">
                      {item.quantity}
                    </td>
                    <td className="border border-slate-300 p-3 text-center text-sm whitespace-nowrap">
                      Rs. {formatCurrency(item.rate)}
                    </td>
                    {showDiscount && (
                      <td className="border border-slate-300 p-3 text-center text-sm">
                        {item.discountType === 'amount' ? `Rs. ${formatCurrency(item.discount)}` : `${item.discount}%`}
                      </td>
                    )}
                    <td className="border border-slate-300 p-3 text-center font-medium text-sm whitespace-nowrap">
                      Rs. {formatCurrency(showDiscount ? calculateItemTotal(item) : item.quantity * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {data.items.map((item, index) => (
              <div key={item.id} className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                <div className="font-medium text-sm mb-3 text-slate-800 break-words">
                  {item.description || `Item ${index + 1}`}
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Quantity:</span>
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rate:</span>
                    <span className="font-medium">Rs. {formatCurrency(item.rate)}</span>
                  </div>
                  {showDiscount && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Discount:</span>
                      <span className="font-medium">{item.discount}%</span>
                    </div>
                  )}
                  <div className="flex justify-between col-span-2 pt-2 border-t border-slate-300 mt-2">
                    <span className="text-slate-600 font-medium">Amount:</span>
                    <span className="font-bold text-orange-600">
                      Rs. {formatCurrency(showDiscount ? calculateItemTotal(item) : item.quantity * item.rate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-4 md:space-y-6">
            {/* Terms and Conditions */}
            {showTerms && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2 md:mb-3 text-sm md:text-base">
                  Terms and Conditions
                </h3>
                <p className="text-slate-600 text-xs md:text-sm whitespace-pre-line break-words">
                  {data.terms}
                </p>
              </div>
            )}

            {/* Additional Notes */}
            {showNotes && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2 md:mb-3 text-sm md:text-base">
                  Additional Notes
                </h3>
                <p className="text-slate-600 text-xs md:text-sm whitespace-pre-line break-words">
                  {data.notes}
                </p>
              </div>
            )}

            {/* Financial Information */}
            {showFinancialInfo && userSettings && (userSettings.taxNumber || userSettings.bankDetails) && (
              <div>
                <h3 className="font-semibold text-slate-800 mb-2 md:mb-3 text-sm md:text-base">Financial Information</h3>
                <div className="text-slate-600 text-xs md:text-sm space-y-1">
                  {userSettings.taxNumber && (
                    <div>
                      <span className="font-medium">Tax Number:</span> {userSettings.taxNumber}
                    </div>
                  )}
                  {userSettings.bankDetails && (
                    <div>
                      <span className="font-medium">Bank Details:</span>
                      <div className="whitespace-pre-line break-words mt-1">{userSettings.bankDetails}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 md:space-y-4">
            {/* Summary */}
            <div className="border border-slate-300">
              <div className="flex justify-between p-2 md:p-3 border-b border-slate-300">
                <span className="font-medium text-xs md:text-sm">Sub Total</span>
                <span className="font-medium text-xs md:text-sm">Rs. {formatCurrency(subtotal)}</span>
              </div>
              {showDiscount && totalDiscount > 0 && (
                <div className="flex justify-between p-2 md:p-3 border-b border-slate-300">
                  <span className="font-medium text-xs md:text-sm">Discount</span>
                  <span className="font-medium text-xs md:text-sm">Rs. {formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between p-2 md:p-3 bg-orange-600 text-white">
                <span className="font-bold text-xs md:text-sm">Total Amount</span>
                <span className="font-bold text-xs md:text-sm">Rs. {formatCurrency(showDiscount ? total : subtotal)}</span>
              </div>
            </div>

            {/* Total in Words */}
            <div className="border border-slate-300 p-2 md:p-3">
              <div className="font-medium mb-1 text-xs md:text-sm">Bill Total In Words:</div>
              <div className="text-xs md:text-sm text-slate-600 break-words">
                {numberToWords(showDiscount ? total : subtotal)} Sri Lankan Rupees Only
              </div>
            </div>
          </div>
        </div>

        {/* Signature - positioned at bottom right after additional notes */}
        <div className="flex justify-end mt-8 md:mt-12 pr-4 md:pr-6">
          <div className="inline-block">
            {settings?.signatureUrl ? (
              <div className="mb-0">
                <Image
                  src={settings.signatureUrl}
                  alt="Authorized Signature"
                  width={140}
                  height={60}
                  className="max-w-[140px] max-h-[60px] object-contain ml-2"
                />
                <div className="w-[140px] h-[1px] bg-slate-400"></div>
              </div>
            ) : (
              <div className="w-24 md:w-32 h-12 md:h-16 mb-2 relative">
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-400"></div>
              </div>
            )}
            <p className="text-xs md:text-sm text-slate-600 mt-1">Authorized Signature</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 pt-3 md:pt-4 border-t border-slate-300 text-center">
          <p className="text-slate-600 text-xs md:text-sm break-words px-2">
            For any enquiries, email us on {data.companyEmail} or call us on{" "}
            {data.companyPhone}
          </p>
        </div>
      </div>
    </div>
    </div>
  )
}
