import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Quotation {
  id: string
  quotation_number: string
  company_name: string
  company_address?: string
  company_phone?: string
  company_email?: string
  client_name: string
  client_address?: string
  quotation_date: string
  due_date?: string
  subtotal: number
  total_discount: number
  total_amount: number
  terms?: string
  notes?: string
  signature?: string
  status: "draft" | "sent" | "accepted" | "rejected"
  created_at: string
  updated_at: string
}

export interface QuotationItem {
  id: string
  quotation_id: string
  description: string
  quantity: number
  rate: number
  discount: number
  amount: number
  created_at: string
}

export interface Bill {
  id: string
  bill_number: string
  company_name: string
  company_address?: string
  company_phone?: string
  company_email?: string
  client_name: string
  client_address?: string
  bill_date: string
  due_date?: string
  subtotal: number
  total_discount: number
  total_amount: number
  terms?: string
  notes?: string
  signature?: string
  status: "unpaid" | "paid" | "overdue" | "cancelled"
  created_at: string
  updated_at: string
}

export interface BillItem {
  id: string
  bill_id: string
  description: string
  quantity: number
  rate: number
  discount: number
  amount: number
  created_at: string
}
