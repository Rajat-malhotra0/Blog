'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import React from 'react'

// Properly type the component using React's type utilities
type NextThemesProviderProps = React.ComponentPropsWithoutRef<typeof NextThemesProvider>

export function ThemeProvider(props: NextThemesProviderProps) {
  return <NextThemesProvider {...props} />
}