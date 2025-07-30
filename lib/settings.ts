import { supabase } from "./supabase-client"

export interface CompanySettings {
  id?: string
  user_id?: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
  companyWebsite: string
  logoUrl: string
  signatureUrl: string
  defaultTerms: string
  defaultNotes: string
  taxNumber: string
  bankDetails: string
}

// Synchronous version for immediate use (fallback)
export const getDefaultSettings = (): CompanySettings => {
  return getDefaultCompanySettings()
}

// Async version for loading from database
export const loadUserSettings = async (): Promise<CompanySettings> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return getDefaultCompanySettings()
    }

    const { data, error } = await supabase.from("company_settings").select("*").eq("user_id", user.id).single()

    if (error || !data) {
      return getDefaultCompanySettings()
    }

    return {
      id: data.id,
      user_id: data.user_id,
      companyName: data.company_name,
      companyAddress: data.company_address,
      companyPhone: data.company_phone,
      companyEmail: data.company_email,
      companyWebsite: data.company_website,
      logoUrl: data.logo_url,
      signatureUrl: data.signature_url || "",
      defaultTerms: data.default_terms,
      defaultNotes: data.default_notes,
      taxNumber: data.tax_number,
      bankDetails: data.bank_details,
    }
  } catch (error) {
    return getDefaultCompanySettings()
  }
}

const getDefaultCompanySettings = (): CompanySettings => {
  return {
    companyName: "<your-company-name>",
    companyAddress: "<your-company-address>",
    companyPhone: "<your-company-mobile-no>",
    companyEmail: "<your-company-email>",
    companyWebsite: "<your-company-web>",
    logoUrl: "",
    signatureUrl: "",
    defaultTerms: `1. Payment due within 15 days from the date of invoice, overdue interest @ 14% will be charged on delayed payments.

2. Please quote invoice number when remitting funds.

3. All services come with a 30-day warranty from the date of completion.

4. Emergency service calls are subject to additional charges.`,
    defaultNotes: `Thank you for choosing our AC repair services. We provide professional air conditioning repair, maintenance, and installation services with experienced technicians and quality parts.

For any technical support or warranty claims, please contact us within the warranty period.`,
    taxNumber: "",
    bankDetails: "",
  }
}

export const saveSettings = async (settings: CompanySettings): Promise<{ success: boolean; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Check if settings already exist for this user
    const { data: existingSettings, error: fetchError } = await supabase
      .from("company_settings")
      .select("id")
      .eq("user_id", user.id)
      .single()

    const settingsData = {
      user_id: user.id,
      company_name: settings.companyName,
      company_address: settings.companyAddress,
      company_phone: settings.companyPhone,
      company_email: settings.companyEmail,
      company_website: settings.companyWebsite,
      logo_url: settings.logoUrl,
      signature_url: settings.signatureUrl,
      default_terms: settings.defaultTerms,
      default_notes: settings.defaultNotes,
      tax_number: settings.taxNumber,
      bank_details: settings.bankDetails,
    }

    let saveError

    if (existingSettings?.id) {
      // Update existing settings
      const { error } = await supabase
        .from("company_settings")
        .update(settingsData)
        .eq("id", existingSettings.id)
      saveError = error
    } else {
      // Insert new settings
      const { error } = await supabase
        .from("company_settings")
        .insert([settingsData])
      saveError = error
    }

    if (saveError) {
      console.error('Settings save error:', saveError)
      return { success: false, error: saveError.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Settings save error:', error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to save settings" }
  }
}
