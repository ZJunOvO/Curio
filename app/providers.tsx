'use client'

import { HeroUIProvider } from '@heroui/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  )
} 