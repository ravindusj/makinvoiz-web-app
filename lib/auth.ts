import { createClient } from "@supabase/supabase-js"
import type { User } from "@supabase/supabase-js"
import { saveUserCredentialsAutomatically, getSavedCredentials, clearSavedCredentials, extendRememberMe } from "./auth-cookies"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthUser extends User {
  user_metadata: {
    full_name?: string
    company_name?: string
  } & User['user_metadata']
}

// Auth functions
export const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: fullName,
        company_name: companyName,
      },
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (data.user && !error) {
    // Always save credentials for automatic login
    saveUserCredentialsAutomatically(email, password)
  }
  
  return { data, error }
}

export const signOut = async () => {
  // Clear saved credentials on sign out
  clearSavedCredentials()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user as AuthUser | null
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  return { data, error }
}

export const resendVerificationEmail = async (email: string) => {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  return { data, error }
}

export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password,
  })
  return { data, error }
}

export const updateProfile = async (fullName: string, companyName: string) => {
  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      company_name: companyName,
    },
  })
  return { data, error }
}

export const attemptAutoLogin = async () => {
  const savedCredentials = getSavedCredentials()
  if (savedCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: savedCredentials.email,
        password: savedCredentials.password,
      })
      
      if (data.user && !error) {
        // Extend the remember me period
        extendRememberMe()
        return { data, error: null }
      } else {
        // Clear invalid credentials
        clearSavedCredentials()
        return { data: null, error }
      }
    } catch (err) {
      // Clear invalid credentials
      clearSavedCredentials()
      return { data: null, error: err }
    }
  }
  
  return { data: null, error: null }
}
