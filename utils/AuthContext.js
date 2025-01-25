import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getCurrentUser } from './supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for initial session
    const initializeAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser()
        setUser(currentUser || null)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      authListener?.unsubscribe()
    }
  }, [])

  // Provide loading state to prevent flash of content
  if (loading) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
