import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Health Analytics Dashboard",
  description: "Disease surveillance and analytics platform",
  icons: {
    icon: "/favicon.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
} 