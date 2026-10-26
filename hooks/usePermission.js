"use client"

import { useAuth } from "@/context/AuthContext"

export default function usePermission() {
  const { permissions } = useAuth()

  function can(permission) {
    return permissions.includes("*") || permissions.includes(permission)
  }

  return {
    can,
  }
}
