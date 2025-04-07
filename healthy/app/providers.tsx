"use client"

import { cookies } from "next/headers"
import { ActiveThemeProvider } from "@/components/active-theme"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<string | undefined>()
  const [isScaled, setIsScaled] = useState(false)
  const [defaultOpen, setDefaultOpen] = useState(false)

  useEffect(() => {
    // Get theme preferences from cookies on client side
    const activeThemeValue = document.cookie.split('; ')
      .find(row => row.startsWith('active_theme='))
      ?.split('=')[1]
    const sidebarState = document.cookie.split('; ')
      .find(row => row.startsWith('sidebar_state='))
      ?.split('=')[1]

    setActiveTheme(activeThemeValue)
    setIsScaled(activeThemeValue?.endsWith("-scaled") ?? false)
    setDefaultOpen(sidebarState === "true")
  }, [])

  return (
    <ActiveThemeProvider initialTheme={activeTheme}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
          } as React.CSSProperties
        }
      >
        {children}
      </SidebarProvider>
    </ActiveThemeProvider>
  )
} 