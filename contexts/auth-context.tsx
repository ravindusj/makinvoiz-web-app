"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase, type AuthUser, attemptAutoLogin } from "@/lib/auth"
import { clearSavedCredentials } from "@/lib/auth-cookies"
import type { Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setSession(session)
        setUser(session?.user as AuthUser | null)
        setLoading(false)
      } else {
        // Try auto-login if no session exists
        const { data } = await attemptAutoLogin()
        if (data?.user) {
          setSession(data.session)
          setUser(data.user as AuthUser | null)
        }
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user as AuthUser | null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    // Clear saved credentials on manual sign out
    clearSavedCredentials()
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
