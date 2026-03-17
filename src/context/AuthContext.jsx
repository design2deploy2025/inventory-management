import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // Fetch profile when user changes
  useEffect(() => {
    let ignore = false

    if (user) {
      setProfileLoading(true)
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!ignore) {
            if (error) {
              console.error('Error fetching profile:', error.message)
              setProfile(null)
            } else {
              setProfile(data)
            }
          }
        })
        .finally(() => {
          if (!ignore) {
            setProfileLoading(false)
          }
        })
    } else {
      setProfile(null)
      setProfileLoading(false)
    }

    return () => {
      ignore = true
    }
  }, [user])

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])


  const logout = async () => {
    setProfile(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

