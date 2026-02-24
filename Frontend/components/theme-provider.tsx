"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import {
  COLOR_THEMES,
  COLOR_THEME_STORAGE_KEY,
  type ColorThemeId,
} from "@/lib/theme-config"

/* ─── Color Theme Context ─────────────────────────────────────────────────── */

interface ColorThemeContextValue {
  colorTheme: ColorThemeId
  setColorTheme: (theme: ColorThemeId) => void
}

export const ColorThemeContext = React.createContext<ColorThemeContextValue>({
  colorTheme: "default",
  setColorTheme: () => {},
})

export function useColorTheme() {
  return React.useContext(ColorThemeContext)
}

/* ─── Color Theme Provider ────────────────────────────────────────────────── */

function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = React.useState<ColorThemeId>("default")

  // Read persisted theme on mount and apply to <html data-theme>
  React.useEffect(() => {
    const stored = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ColorThemeId | null
    const resolved =
      stored && COLOR_THEMES.some((t) => t.id === stored) ? stored : "default"
    setColorThemeState(resolved)
    applyColorTheme(resolved)
  }, [])

  const setColorTheme = React.useCallback((theme: ColorThemeId) => {
    setColorThemeState(theme)
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, theme)
    applyColorTheme(theme)
  }, [])

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  )
}

function applyColorTheme(theme: ColorThemeId) {
  const root = document.documentElement
  if (theme === "default") {
    root.removeAttribute("data-theme")
  } else {
    root.dataset.theme = theme
  }
}

/* ─── Inline script to prevent color-theme flash on load ─────────────────── */

export function ColorThemeScript() {
  const script = `
(function(){
  try {
    var s = localStorage.getItem('${COLOR_THEME_STORAGE_KEY}');
    var valid = ${JSON.stringify(COLOR_THEMES.map((t) => t.id))};
    if (s && s !== 'default' && valid.indexOf(s) !== -1) {
      document.documentElement.dataset.theme = s;
    }
  } catch(e){}
})();
`
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}

/* ─── Combined App Theme Provider ────────────────────────────────────────── */

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ColorThemeProvider>{children}</ColorThemeProvider>
    </NextThemesProvider>
  )
}
