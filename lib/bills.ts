import { supabase } from "./supabase-client"

// Generate unique bill number
const generateUniqueBillNumber = async (): Promise<string> => {
  let attempts = 0
  const maxAttempts = 10
  
  while (attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
    const billNumber = `BILL-${randomNum}`
    
    // Check if this number already exists
    const { data, error } = await supabase
      .from('bills')
      .select('id')
      .eq('bill_number', billNumber)
      .single()
    
    if (error || !data) {
      // Number doesn't exist, we can use it
      return billNumber
    }
    
    attempts++
  }
  
  // Fallback to timestamp + random if all attempts fail
  return `BILL-${Date.now().toString().slice(-6)}`
}

export interface BillItem {
  id: number
  description: string
  quantity: number
  rate: number
  discount: number
  discountType?: 'percentage' | 'amount'
}

export interface BillData {
  id?: string
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
  status?: "unpaid" | "paid" | "overdue" | "cancelled"
}

export interface BillListItem {
  id: string
  bill_number: string
  client_name: string
  bill_date: string
  total_amount: number
  status: "unpaid" | "paid" | "overdue" | "cancelled"
}

// Calculate totals for bill
const calculateTotals = (items: BillItem[]) => {
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

// Save bill to Supabase
export const saveBill = async (billData: BillData): Promise<{ success: boolean; error?: string; id?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { subtotal, totalDiscount, total } = calculateTotals(billData.items)

    // Generate unique bill number if there's a conflict
    let billNumber = billData.billNumber
    if (!billData.id) {
      // Only generate new number for new bills
      const { data: existingBill } = await supabase
        .from('bills')
        .select('id')
        .eq('bill_number', billNumber)
        .single()
      
      if (existingBill) {
        billNumber = await generateUniqueBillNumber()
      }
    }

    // Prepare bill data
    const billRecord = {
      bill_number: billNumber,
      company_name: billData.companyName,
      company_address: billData.companyAddress,
      company_phone: billData.companyPhone,
      company_email: billData.companyEmail,
      client_name: billData.clientName,
      client_address: billData.clientAddress,
      bill_date: billData.billDate,
      due_date: billData.dueDate,
      subtotal,
      total_discount: totalDiscount,
      total_amount: total,
      terms: billData.terms,
      notes: billData.notes,
      signature: billData.signature,
      status: billData.status || "unpaid",
      user_id: user.id,
    }

    let billId: string

    if (billData.id) {
      // Update existing bill
      const { data, error } = await supabase
        .from("bills")
        .update(billRecord)
        .eq("id", billData.id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }
      billId = data.id
    } else {
      // Create new bill
      const { data, error } = await supabase.from("bills").insert(billRecord).select().single()

      if (error) {
        return { success: false, error: error.message }
      }
      billId = data.id
    }

    // Delete existing items if updating
    if (billData.id) {
      await supabase.from("bill_items").delete().eq("bill_id", billId)
    }

    // Insert bill items
    const itemsToInsert = billData.items.map((item) => {
      const discountType = item.discountType || 'percentage'
      const itemSubtotal = item.quantity * item.rate
      const discountAmount = discountType === 'percentage' 
        ? (itemSubtotal * item.discount) / 100 
        : item.discount
      
      return {
        bill_id: billId,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        discount_type: discountType,
        amount: itemSubtotal - discountAmount,
      }
    })

    if (itemsToInsert.length > 0) {
      const { error: itemsError } = await supabase.from("bill_items").insert(itemsToInsert)

      if (itemsError) {
        return { success: false, error: itemsError.message }
      }
    }

    return { success: true, id: billId }
  } catch (error) {
    return { success: false, error: "Failed to save bill" }
  }
}

// Update existing bill in Supabase
export const updateBill = async (
  id: string,
  billData: BillData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { subtotal, totalDiscount, total } = calculateTotals(billData.items)

    // Prepare bill data
    const billRecord = {
      bill_number: billData.billNumber,
      company_name: billData.companyName,
      company_address: billData.companyAddress,
      company_phone: billData.companyPhone,
      company_email: billData.companyEmail,
      client_name: billData.clientName,
      client_address: billData.clientAddress,
      bill_date: billData.billDate,
      due_date: billData.dueDate,
      subtotal,
      total_discount: totalDiscount,
      total_amount: total,
      terms: billData.terms,
      notes: billData.notes,
      signature: billData.signature,
      status: billData.status || "unpaid",
      updated_at: new Date().toISOString(),
    }

    // Update the bill
    const { error: billError } = await supabase
      .from("bills")
      .update(billRecord)
      .eq("id", id)
      .eq("user_id", user.id)

    if (billError) {
      throw billError
    }

    // Delete existing items
    const { error: deleteError } = await supabase
      .from("bill_items")
      .delete()
      .eq("bill_id", id)

    if (deleteError) {
      throw deleteError
    }

    // Insert new items
    const billItems = billData.items.map((item) => {
      const discountType = item.discountType || 'percentage'
      const itemSubtotal = item.quantity * item.rate
      const discountAmount = discountType === 'percentage' 
        ? (itemSubtotal * item.discount) / 100 
        : item.discount
      
      return {
        bill_id: id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        discount_type: discountType,
        amount: itemSubtotal - discountAmount,
      }
    })

    const { error: itemsError } = await supabase.from("bill_items").insert(billItems)

    if (itemsError) {
      throw itemsError
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating bill:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update bill",
    }
  }
}

// Get all bills for current user
export const getBills = async (): Promise<{ success: boolean; data?: BillListItem[]; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data, error } = await supabase
      .from("bills")
      .select("id, bill_number, client_name, bill_date, total_amount, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    return { success: false, error: "Failed to fetch bills" }
  }
}

// Get single bill with items
export const getBill = async (id: string): Promise<{ success: boolean; data?: BillData; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get bill
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (billError) {
      return { success: false, error: billError.message }
    }

    // Get bill items
    const { data: items, error: itemsError } = await supabase
      .from("bill_items")
      .select("*")
      .eq("bill_id", id)
      .order("created_at", { ascending: true })

    if (itemsError) {
      return { success: false, error: itemsError.message }
    }

    const billData: BillData = {
      id: bill.id,
      companyName: bill.company_name,
      companyAddress: bill.company_address,
      companyPhone: bill.company_phone,
      companyEmail: bill.company_email,
      clientName: bill.client_name,
      clientAddress: bill.client_address,
      billNumber: bill.bill_number,
      billDate: bill.bill_date,
      dueDate: bill.due_date,
      terms: bill.terms,
      notes: bill.notes,
      signature: bill.signature,
      status: bill.status,
      items: items.map((item) => ({
        id: Number.parseInt(item.id),
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        discountType: item.discount_type || 'percentage',
      })),
    }

    return { success: true, data: billData }
  } catch (error) {
    return { success: false, error: "Failed to fetch bill" }
  }
}

// Delete bill
export const deleteBill = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase.from("bills").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete bill" }
  }
}
