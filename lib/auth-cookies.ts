import Cookies from 'js-cookie'

const REMEMBER_ME_KEY = 'remember_me'
const SAVED_CREDENTIALS_KEY = 'saved_credentials'
const COOKIE_EXPIRY_DAYS = 30 // Automatically remember users for 30 days

export interface SavedCredentials {
  email: string
  password: string
}

export const saveCredentials = (email: string, password: string, rememberMe: boolean) => {
  if (rememberMe) {
    // Save credentials for 30 days with security options
    const credentials: SavedCredentials = { email, password }
    const cookieOptions = {
      expires: COOKIE_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'strict' as const,
      httpOnly: false // Must be false for client-side access
    }
    
    Cookies.set(SAVED_CREDENTIALS_KEY, JSON.stringify(credentials), cookieOptions)
    Cookies.set(REMEMBER_ME_KEY, 'true', cookieOptions)
  } else {
    // Remove saved credentials
    Cookies.remove(SAVED_CREDENTIALS_KEY)
    Cookies.remove(REMEMBER_ME_KEY)
  }
}

export const getSavedCredentials = (): SavedCredentials | null => {
  const rememberMe = Cookies.get(REMEMBER_ME_KEY)
  if (rememberMe !== 'true') {
    return null
  }

  const credentialsStr = Cookies.get(SAVED_CREDENTIALS_KEY)
  if (!credentialsStr) {
    return null
  }

  try {
    return JSON.parse(credentialsStr)
  } catch (error) {
    console.error('Failed to parse saved credentials:', error)
    return null
  }
}

export const clearSavedCredentials = () => {
  Cookies.remove(SAVED_CREDENTIALS_KEY)
  Cookies.remove(REMEMBER_ME_KEY)
}

export const isRememberMeEnabled = (): boolean => {
  return Cookies.get(REMEMBER_ME_KEY) === 'true'
}

export const extendRememberMe = () => {
  // Extend the remember me cookies for another 30 days
  const credentials = getSavedCredentials()
  if (credentials) {
    saveCredentials(credentials.email, credentials.password, true)
  }
}

// Helper function for automatic credential saving
export const saveUserCredentialsAutomatically = (email: string, password: string) => {
  saveCredentials(email, password, true)
}
