import { supabase } from "./supabase-client"

// Generate unique quotation number
const generateUniqueQuotationNumber = async (): Promise<string> => {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
    const quotationNumber = `QUO-${randomNum}`
    
    // Check if this number already exists
    const { data, error } = await supabase
      .from('quotations')
      .select('id')
      .eq('quotation_number', quotationNumber)
      .single()
    
    if (error || !data) {
      // Number doesn't exist, we can use it
      return quotationNumber
    }
    
    attempts++
  }
  
  // Fallback to timestamp + random if all attempts fail
  return `QUO-${Date.now().toString().slice(-6)}`
}

export interface QuotationItem {
  id: number
  description: string
  quantity: number
  rate: number
  discount: number
  discountType?: 'percentage' | 'amount'
}

export interface QuotationData {
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
  status?: "draft" | "sent" | "accepted" | "rejected"
}

export interface QuotationListItem {
  id: string
  quotation_number: string
  client_name: string
  quotation_date: string
  total_amount: number
  status: "draft" | "sent" | "accepted" | "rejected"
}

// Calculate totals for quotation
const calculateTotals = (items: QuotationItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const totalDiscount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.rate
    const discountType = item.discountType || 'percentage'
    const discountAmount = discountType === 'percentage' 
      ? (itemSubtotal * item.discount) / 100 
      : item.discount
    return sum + discountAmount
  }, 0)
  const total = subtotal - totalDiscount
  return { subtotal, totalDiscount, total }
}

// Save quotation to Supabase
export const saveQuotation = async (
  quotationData: QuotationData,
): Promise<{ success: boolean; error?: string; id?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { subtotal, totalDiscount, total } = calculateTotals(quotationData.items)

    // Generate unique quotation number if there's a conflict
    let quotationNumber = quotationData.quotationNumber
    if (!quotationData.id) {
      // Only generate new number for new quotations
      const { data: existingQuotation } = await supabase
        .from('quotations')
        .select('id')
        .eq('quotation_number', quotationNumber)
        .single()
      
      if (existingQuotation) {
        quotationNumber = await generateUniqueQuotationNumber()
      }
    }

    // Prepare quotation data
    const quotationRecord = {
      quotation_number: quotationNumber,
      company_name: quotationData.companyName,
      company_address: quotationData.companyAddress,
      company_phone: quotationData.companyPhone,
      company_email: quotationData.companyEmail,
      client_name: quotationData.clientName,
      client_address: quotationData.clientAddress,
      quotation_date: quotationData.quotationDate,
      due_date: quotationData.dueDate,
      subtotal,
      total_discount: totalDiscount,
      total_amount: total,
      terms: quotationData.terms,
      notes: quotationData.notes,
      signature: quotationData.signature,
      status: quotationData.status || "draft",
      user_id: user.id,
    }

    let quotationId: string

    if (quotationData.id) {
      // Update existing quotation
      const { data, error } = await supabase
        .from("quotations")
        .update(quotationRecord)
        .eq("id", quotationData.id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }
      quotationId = data.id
    } else {
      // Create new quotation
      const { data, error } = await supabase.from("quotations").insert(quotationRecord).select().single()

      if (error) {
        return { success: false, error: error.message }
      }
      quotationId = data.id
    }

    // Delete existing items if updating
    if (quotationData.id) {
      await supabase.from("quotation_items").delete().eq("quotation_id", quotationId)
    }

    // Insert quotation items
    const itemsToInsert = quotationData.items.map((item) => {
      const discountType = item.discountType || 'percentage'
      const itemSubtotal = item.quantity * item.rate
      const discountAmount = discountType === 'percentage' 
        ? (itemSubtotal * item.discount) / 100 
        : item.discount
      
      return {
        quotation_id: quotationId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        discount_type: discountType,
        amount: itemSubtotal - discountAmount,
      }
    })

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase.from("quotation_items").insert(itemsToInsert)

      if (itemsError) {
        return { success: false, error: itemsError.message }
      }
    }

    return { success: true, id: quotationId }
  } catch (error) {
    return { success: false, error: "Failed to save quotation" }
  }
}

// Update existing quotation in Supabase
export const updateQuotation = async (
  id: string,
  quotationData: QuotationData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { subtotal, totalDiscount, total } = calculateTotals(quotationData.items)

    // Prepare quotation data
    const quotationRecord = {
      quotation_number: quotationData.quotationNumber,
      company_name: quotationData.companyName,
      company_address: quotationData.companyAddress,
      company_phone: quotationData.companyPhone,
      company_email: quotationData.companyEmail,
      client_name: quotationData.clientName,
      client_address: quotationData.clientAddress,
      quotation_date: quotationData.quotationDate,
      due_date: quotationData.dueDate,
      subtotal,
      total_discount: totalDiscount,
      total_amount: total,
      terms: quotationData.terms,
      notes: quotationData.notes,
      signature: quotationData.signature,
      status: quotationData.status || "draft",
      updated_at: new Date().toISOString(),
    }

    // Update the quotation
    const { error: quotationError } = await supabase
      .from("quotations")
      .update(quotationRecord)
      .eq("id", id)
      .eq("user_id", user.id)

    if (quotationError) {
      throw quotationError
    }

    // Delete existing items
    const { error: deleteError } = await supabase
      .from("quotation_items")
      .delete()
      .eq("quotation_id", id)

    if (deleteError) {
      throw deleteError
    }

    // Insert new items
    const quotationItems = quotationData.items.map((item) => {
      const discountType = item.discountType || 'percentage'
      const itemSubtotal = item.quantity * item.rate
      const discountAmount = discountType === 'percentage' 
        ? (itemSubtotal * item.discount) / 100 
        : item.discount
      
      return {
        quotation_id: id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        discount_type: discountType,
        amount: itemSubtotal - discountAmount,
      }
    })

    const { error: itemsError } = await supabase.from("quotation_items").insert(quotationItems)

    if (itemsError) {
      throw itemsError
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating quotation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update quotation",
    }
  }
}

// Get all quotations for current user
export const getQuotations = async (): Promise<{ success: boolean; data?: QuotationListItem[]; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data, error } = await supabase
      .from("quotations")
      .select("id, quotation_number, client_name, quotation_date, total_amount, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: "Failed to fetch quotations" }
  }
}

// Get single quotation with items
export const getQuotation = async (id: string): Promise<{ success: boolean; data?: QuotationData; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get quotation
    const { data: quotation, error: quotationError } = await supabase
      .from("quotations")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (quotationError) {
      return { success: false, error: quotationError.message }
    }

    // Get quotation items
    const { data: items, error: itemsError } = await supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", id)
      .order("created_at", { ascending: true })

    if (itemsError) {
      return { success: false, error: itemsError.message }
    }

    const quotationData: QuotationData = {
      id: quotation.id,
      companyName: quotation.company_name,
      companyAddress: quotation.company_address,
      companyPhone: quotation.company_phone,
      companyEmail: quotation.company_email,
      clientName: quotation.client_name,
      clientAddress: quotation.client_address,
      quotationNumber: quotation.quotation_number,
      quotationDate: quotation.quotation_date,
      dueDate: quotation.due_date,
      terms: quotation.terms,
      notes: quotation.notes,
      signature: quotation.signature,
      status: quotation.status,
      items: items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        rate: parseFloat(item.rate) || 0,
        discount: parseFloat(item.discount) || 0,
        discountType: item.discount_type || 'percentage',
      })),
    }

    return { success: true, data: quotationData }
  } catch (error) {
    return { success: false, error: "Failed to fetch quotation" }
  }
}

// Delete quotation
export const deleteQuotation = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase.from("quotations").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete quotation" }
  }
}
