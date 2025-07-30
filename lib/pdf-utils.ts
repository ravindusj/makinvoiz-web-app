import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export interface PDFGenerationOptions {
  fileName?: string
  scale?: number
  quality?: number
}

export async function generatePDFFromElement(
  element: HTMLElement,
  options: PDFGenerationOptions = {}
): Promise<void> {
  const {
    fileName = "document.pdf",
    scale = 2,
    quality = 1,
  } = options

  if (!element) return

  try {
    // Check if we're dealing with a bill or quotation
    const isBill = element.id === 'bill-preview'
    
    // Store original styles
    const originalStyle = element.style.cssText

    // Set temporary styles for better PDF generation
    element.style.border = "none"
    element.style.borderRadius = "0"
    element.style.boxShadow = "none"

    // Adjust logo position
    const logoContainer = element.querySelector('.w-14.h-14, .w-12.h-12') as HTMLElement
    const originalLogoStyle = logoContainer?.style.cssText
    if (logoContainer) {
      logoContainer.style.position = 'relative'
      logoContainer.style.top = '8px'
    }

    // Adjust company header name and address size (next to logo)
    const headerAddress = element.querySelector('.flex.justify-between.items-start .text-slate-600.text-sm') as HTMLElement
    const headerCompanyName = element.querySelector('.flex.justify-between.items-start .text-slate-800.text-xl, .flex.justify-between.items-start .text-slate-800.text-2xl') as HTMLElement
    const documentTitle = element.querySelector('.text-right .text-2xl, .text-right .text-3xl') as HTMLElement
    const originalHeaderAddressStyle = headerAddress?.style.cssText
    const originalHeaderCompanyNameStyle = headerCompanyName?.style.cssText
    const originalDocumentTitleStyle = documentTitle?.style.cssText

    if (headerAddress) {
      headerAddress.style.fontSize = '13px'
      headerAddress.style.lineHeight = '1.6'  // Increased for better spacing
      headerAddress.style.marginTop = '8px'   // Add explicit top margin
      headerAddress.style.display = 'block'   // Ensure block display
      headerAddress.style.whiteSpace = 'pre-line'  // Preserve line breaks
    }

    if (headerCompanyName) {
      // Larger font size for quotation, smaller for bill
      headerCompanyName.style.fontSize = isBill ? '24px' : '24px'
      headerCompanyName.style.lineHeight = '1.3'  // Slightly increased
      headerCompanyName.style.fontWeight = '700'
      headerCompanyName.style.marginBottom = '4px'  // Add explicit bottom margin
      headerCompanyName.style.display = 'block'     // Ensure block display
    }

    if (documentTitle) {
      // Larger "Quotation" text for quotations
      documentTitle.style.fontSize = isBill ? '28px' : '28px'
      documentTitle.style.fontWeight = '700'
      documentTitle.style.marginBottom = isBill ? '8px' : '0'
    }

    // Adjust heading and company/client name sizes
    const sectionTitles = element.querySelectorAll('h3.font-semibold') as NodeListOf<HTMLElement>
    const originalTitleStyles: { [key: string]: string } = {}
    sectionTitles.forEach((title, i) => {
      originalTitleStyles[i] = title.style.cssText
      title.style.fontSize = '15px'
      title.style.marginBottom = isBill ? '8px' : '8px'
      title.style.fontWeight = '600'
    })

    // Adjust company and client names
    const companyClientNames = element.querySelectorAll('.text-slate-700.font-medium') as NodeListOf<HTMLElement>
    const originalNameStyles: { [key: string]: string } = {}
    companyClientNames.forEach((name, i) => {
      originalNameStyles[i] = name.style.cssText
      name.style.fontSize = '13px'
      name.style.display = 'block'       // Force block display
      name.style.lineHeight = '1.4'      // Consistent line height
      name.style.marginBottom = '6px'    // Consistent bottom margin
      name.style.whiteSpace = 'pre-line' // Preserve line breaks
      
      if (isBill) {
        const parentSection = name.closest('div')
        const isBillBySection = parentSection?.querySelector('h3')?.textContent?.includes('Bill by')
        
        if (isBillBySection) {
          name.style.marginBottom = '8px'  // More spacing for company name in Bill by section
          name.style.paddingTop = '4px'    // Add some top spacing
          name.style.lineHeight = '1.5'    // Increased line height for company name
        }
      }
    })

    // Adjust company and client details (address, phone, email)
    const detailsTexts = element.querySelectorAll('.text-slate-600.text-sm') as NodeListOf<HTMLElement>
    const quotationDetails = element.querySelectorAll('.space-y-2 .flex.justify-between, .space-y-1 .flex.justify-between') as NodeListOf<HTMLElement>
    const originalDetailsStyles: { [key: string]: string } = {}
    const originalQuotationDetailsStyles: { [key: string]: string } = {}
    
    detailsTexts.forEach((text, i) => {
      originalDetailsStyles[i] = text.style.cssText
      text.style.fontSize = '12.5px'
      text.style.lineHeight = '1.5'  // Consistent line height
      text.style.display = 'block'   // Force block display
      text.style.marginBottom = '4px'  // Consistent margin
      text.style.whiteSpace = 'pre-line'  // Preserve line breaks
      
      // Special handling for bill company details
      if (isBill) {
        const parentSection = text.closest('div')
        const isBillBySection = parentSection?.querySelector('h3')?.textContent?.includes('Bill by')
        
        if (isBillBySection) {
          text.style.lineHeight = '1.8'  // Increased line height for Bill by section
          text.style.marginBottom = '6px'  // More spacing between lines
          text.style.paddingTop = '2px'    // Additional top spacing
        }
      }
    })

    // Adjust spacing for quotation/bill details (number, date, due date)
    quotationDetails.forEach((detail, i) => {
      originalQuotationDetailsStyles[i] = detail.style.cssText
      if (!isBill) {  // Only for quotations
        detail.style.marginBottom = '8px'  // Increase space between lines
        const label = detail.querySelector('.text-slate-600') as HTMLElement
        const value = detail.querySelector('.font-medium') as HTMLElement
        if (label && value) {
          label.style.lineHeight = '1.6'
          value.style.lineHeight = '1.6'
        }
      }
    })

    // Temporarily adjust spacing for PDF generation
    const paragraphs = element.getElementsByTagName('p')
    const originalPStyles: { [key: string]: string } = {}
    for (let i = 0; i < paragraphs.length; i++) {
      originalPStyles[i] = paragraphs[i].style.cssText
      paragraphs[i].style.marginBottom = '0'
      paragraphs[i].style.lineHeight = '1.2'
    }

    // Adjust table cells and headers if present
    const cells = element.getElementsByTagName('td')
    const headerCells = element.getElementsByTagName('th')
    const originalCellStyles: { [key: string]: string } = {}
    const originalHeaderStyles: { [key: string]: string } = {}
    
    // Adjust summary boxes padding
    const summaryBoxes = element.querySelectorAll('.border.border-slate-300 .flex.justify-between') as NodeListOf<HTMLElement>
    const totalInWordsBox = element.querySelector('.border.border-slate-300 .font-medium.mb-1')?.parentElement as HTMLElement
    const originalSummaryStyles: { [key: string]: string } = {}
    
    summaryBoxes.forEach((box, i) => {
      originalSummaryStyles[`summary_${i}`] = box.style.cssText
      box.style.padding = '10px 11px'  // Reduced from default padding
    })
    
    if (totalInWordsBox) {
      originalSummaryStyles['words_box'] = totalInWordsBox.style.cssText
      totalInWordsBox.style.padding = '10px 11px'  // Reduced from default padding
    }

    // Enhance table styling
    const table = element.querySelector('table') as HTMLElement
    const originalTableStyle = table?.style.cssText
    if (table) {
      table.style.fontSize = '13px'
      table.style.width = '100%'
      table.style.marginBottom = '16px'
    }

    // Adjust regular cells with larger text and padding
    const columnCount = headerCells.length;
    for (let i = 0; i < cells.length; i++) {
      originalCellStyles[i] = cells[i].style.cssText
      cells[i].style.padding = '9px 12px'
      cells[i].style.fontSize = '13px'
      cells[i].style.lineHeight = '1.4'
      cells[i].style.textAlign = i % columnCount === 0 ? 'left' : 'center'
      
      // Make description column text slightly larger
      if (i % columnCount === 0) { // First cell in each row (description)
        cells[i].style.fontSize = '13.5px'
        cells[i].style.fontWeight = '500'
      }
    }
    
    // Adjust header cells - enhance visibility with appropriate height
    const hasDiscountColumn = headerCells.length > 4;
    for (let i = 0; i < headerCells.length; i++) {
      originalHeaderStyles[i] = headerCells[i].style.cssText
      // Use taller headers when discount is hidden (4 columns instead of 5)
      headerCells[i].style.padding = hasDiscountColumn ? '10px 12px' : '12px 12px'
      headerCells[i].style.fontSize = '13.5px'
      headerCells[i].style.lineHeight = '1.4'
      headerCells[i].style.fontWeight = '600'
      headerCells[i].style.backgroundColor = '#f1f5f9'
      headerCells[i].style.color = '#1e293b'
      headerCells[i].style.textAlign = i === 0 ? 'left' : 'center' // First column left-aligned, others centered
      
      // Adjust the "After Discount" text if present
      const smallText = headerCells[i].querySelector('.text-xs') as HTMLElement
      if (smallText) {
        smallText.style.marginTop = '2px'
        smallText.style.fontSize = '11px'
        smallText.style.lineHeight = '1.2'
      }
    }

    // Adjust signature section styling for PDF
    const signatureSection = element.querySelector('.text-right .inline-block') as HTMLElement
    const originalSignatureStyle = signatureSection?.style.cssText
    const signatureImage = signatureSection?.querySelector('img') as HTMLElement
    const signaturePlaceholder = signatureSection?.querySelector('.border-b.border-slate-400') as HTMLElement
    const originalSignatureImageStyle = signatureImage?.style.cssText
    const originalSignaturePlaceholderStyle = signaturePlaceholder?.style.cssText

    if (signatureSection) {
      signatureSection.style.marginTop = '24px'
    }

    // Ensure signature image has proper border line
    if (signatureImage) {
      signatureImage.style.borderBottom = '1px solid #94a3b8'
      signatureImage.style.paddingBottom = '2px'
      signatureImage.style.display = 'block'
      signatureImage.style.marginBottom = '8px'
    }

    // Ensure placeholder line is visible
    if (signaturePlaceholder) {
      signaturePlaceholder.style.borderBottom = '1px solid #94a3b8'
      signaturePlaceholder.style.marginBottom = '8px'
    }

    // Generate canvas with optimized settings
    const canvas = await html2canvas(element, {
      scale, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      logging: false,
      backgroundColor: "#ffffff",
      imageTimeout: 15000, // Increase timeout for image loading
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        // Additional adjustments to the cloned document if needed
        const clonedElement = clonedDoc.getElementById(element.id)
        if (clonedElement) {
          // Ensure consistent font sizing
          clonedElement.style.fontSize = '12px'
          
          // Adjust spacing between sections
          const sections = clonedElement.getElementsByClassName('mb-8')
          for (let i = 0; i < sections.length; i++) {
            const section = sections[i] as HTMLElement
            section.style.marginBottom = '16px'
          }
          
          // Force consistent line spacing for header elements
          const clonedHeaderAddress = clonedElement.querySelector('.flex.justify-between.items-start .text-slate-600.text-sm') as HTMLElement
          const clonedHeaderCompanyName = clonedElement.querySelector('.flex.justify-between.items-start .text-slate-800.text-xl, .flex.justify-between.items-start .text-slate-800.text-2xl') as HTMLElement
          
          if (clonedHeaderAddress) {
            clonedHeaderAddress.style.lineHeight = '1.7'
            clonedHeaderAddress.style.marginTop = '8px'
            clonedHeaderAddress.style.display = 'block'
            clonedHeaderAddress.style.whiteSpace = 'pre-line'
          }
          
          if (clonedHeaderCompanyName) {
            clonedHeaderCompanyName.style.lineHeight = '1.3'
            clonedHeaderCompanyName.style.marginBottom = '4px'
            clonedHeaderCompanyName.style.display = 'block'
          }
          
          // Force consistent spacing for all detail texts
          const clonedDetailsTexts = clonedElement.querySelectorAll('.text-slate-600.text-sm') as NodeListOf<HTMLElement>
          clonedDetailsTexts.forEach((text) => {
            text.style.lineHeight = '1.5'
            text.style.display = 'block'
            text.style.marginBottom = '4px'
            text.style.whiteSpace = 'pre-line'
          })
          
          // Force consistent spacing for company/client names
          const clonedNames = clonedElement.querySelectorAll('.text-slate-700.font-medium') as NodeListOf<HTMLElement>
          clonedNames.forEach((name) => {
            name.style.lineHeight = '1.4'
            name.style.display = 'block'
            name.style.marginBottom = '6px'
            name.style.whiteSpace = 'pre-line'
          })
        }
      }
    })

    // Reset all temporary styles
    element.style.cssText = originalStyle
    // Reset table style
    if (table) {
      table.style.cssText = originalTableStyle || ''
    }
    // Reset logo style
    if (logoContainer) {
      logoContainer.style.cssText = originalLogoStyle || ''
    }
    // Reset header address and company name styles
    if (headerAddress) {
      headerAddress.style.cssText = originalHeaderAddressStyle || ''
    }
    if (headerCompanyName) {
      headerCompanyName.style.cssText = originalHeaderCompanyNameStyle || ''
    }
    if (documentTitle) {
      documentTitle.style.cssText = originalDocumentTitleStyle || ''
    }
    // Reset section title styles
    sectionTitles.forEach((title, i) => {
      title.style.cssText = originalTitleStyles[i] || ''
    })
    // Reset company/client name styles
    companyClientNames.forEach((name, i) => {
      name.style.cssText = originalNameStyles[i] || ''
    })
    // Reset details text styles
    detailsTexts.forEach((text, i) => {
      text.style.cssText = originalDetailsStyles[i] || ''
    })
    // Reset quotation details styles
    quotationDetails.forEach((detail, i) => {
      detail.style.cssText = originalQuotationDetailsStyles[i] || ''
      const label = detail.querySelector('.text-slate-600') as HTMLElement
      const value = detail.querySelector('.font-medium') as HTMLElement
      if (label) label.style.cssText = ''
      if (value) value.style.cssText = ''
    })
    // Reset paragraph styles
    for (let i = 0; i < paragraphs.length; i++) {
      paragraphs[i].style.cssText = originalPStyles[i]
    }
    // Reset cell styles
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.cssText = originalCellStyles[i]
    }
    // Reset header styles
    for (let i = 0; i < headerCells.length; i++) {
      headerCells[i].style.cssText = originalHeaderStyles[i]
      const smallText = headerCells[i].querySelector('.text-xs') as HTMLElement
      if (smallText) {
        smallText.style.cssText = ''
      }
    }

    // Reset summary box styles
    summaryBoxes.forEach((box, i) => {
      box.style.cssText = originalSummaryStyles[`summary_${i}`] || ''
    })
    
    if (totalInWordsBox) {
      totalInWordsBox.style.cssText = originalSummaryStyles['words_box'] || ''
    }

    // Reset signature styles
    if (signatureSection) {
      signatureSection.style.cssText = originalSignatureStyle || ''
    }
    if (signatureImage) {
      signatureImage.style.cssText = originalSignatureImageStyle || ''
    }
    if (signaturePlaceholder) {
      signaturePlaceholder.style.cssText = originalSignaturePlaceholderStyle || ''
    }

    // A4 size in pts (points)
    const a4Width = 595
    const a4Height = 842

    // Use full page dimensions without margins
    const imgWidth = a4Width
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Create PDF with A4 dimensions (always portrait for quotations)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [a4Width, a4Height]
    })

    // No offset - use full page
    const xOffset = 0
    const yOffset = 0

    // Add the image to the PDF with high quality settings
    pdf.addImage(
      canvas.toDataURL("image/png", Math.min(quality, 0.95)), // Limit quality to 0.95 for file size
      "PNG",
      xOffset,
      yOffset,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    )

    // Download the PDF
    pdf.save(fileName)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw error
  }
}
