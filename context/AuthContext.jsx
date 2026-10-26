"use client"

import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const permissions = user?.permissions || []

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me")

        const data = await res.json()

        if (data.success) {
          console.log("AUTH USER:", data.data)
          console.log("AUTH ROLE:", data.data.role)
          console.log("AUTH PERMISSIONS:", data.data.permissions)

          setUser(data.data)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        permissions,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
