"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Palette, Sun } from "lucide-react"
import { useColorTheme } from "@/components/theme-provider"
import { COLOR_THEMES, type ColorThemeId } from "@/lib/theme-config"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/* ─── Mode options ─────────────────────────────────────────────────────────── */
const MODE_OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const

/* ─── Compact swatch dot ───────────────────────────────────────────────────── */
function ColorSwatch({
  color,
  active,
  label,
  onClick,
}: {
  color: string
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label={`Apply ${label} theme`}
          className={cn(
            "size-5 rounded-full ring-offset-1 transition-all",
            "hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active && "ring-2 ring-ring ring-offset-background"
          )}
          style={{ background: color }}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

/* ─── Expanded inline switcher ─────────────────────────────────────────────── */
function InlineSwitcher() {
  const { theme: mode, setTheme: setMode } = useTheme()
  const { colorTheme, setColorTheme } = useColorTheme()
  const isDark = mode === "dark"

  return (
    <SidebarGroup className="py-2 px-2">
      {/* Color theme swatches */}
      <div className="flex items-center gap-1 px-1 mb-2">
        <span className="text-xs text-muted-foreground mr-1 select-none">Theme</span>
        <div className="flex items-center gap-1.5">
          {COLOR_THEMES.map((t) => (
            <ColorSwatch
              key={t.id}
              label={t.label}
              color={isDark ? (t.swatchDark ?? t.swatch) : t.swatch}
              active={colorTheme === t.id}
              onClick={() => setColorTheme(t.id as ColorThemeId)}
            />
          ))}
        </div>
      </div>

      {/* Dark / Light / System toggle */}
      <div className="flex items-center gap-1 px-1">
        <span className="text-xs text-muted-foreground mr-1 select-none">Mode</span>
        <div className="flex items-center gap-0.5">
          {MODE_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setMode(value)}
                  aria-label={label}
                  className={cn(
                    "flex items-center justify-center rounded-md p-1 transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    mode === value &&
                    "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </SidebarGroup>
  )
}

/* ─── Collapsed icon-button + dropdown ─────────────────────────────────────── */
function CollapsedSwitcher() {
  const { theme: mode, setTheme: setMode } = useTheme()
  const { colorTheme, setColorTheme } = useColorTheme()
  const isDark = mode === "dark"

  const activeTheme = COLOR_THEMES.find((t) => t.id === colorTheme) ?? COLOR_THEMES[0]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="sm"
              tooltip="Theme"
              className="data-[state=open]:bg-sidebar-accent"
            >
              <Palette className="size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Color Theme
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {COLOR_THEMES.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onSelect={() => setColorTheme(t.id as ColorThemeId)}
                  className="gap-2"
                >
                  <span
                    className="size-4 rounded-full ring-1 ring-border shrink-0"
                    style={{
                      background: isDark ? (t.swatchDark ?? t.swatch) : t.swatch,
                    }}
                  />
                  <span>{t.label}</span>
                  {colorTheme === t.id && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Mode
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {MODE_OPTIONS.map(({ value, icon: Icon, label }) => (
                <DropdownMenuItem
                  key={value}
                  onSelect={() => setMode(value)}
                  className="gap-2"
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                  {mode === value && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/* ─── Main export ────────────────────────────────────────────────────────────── */
export function ThemeSwitcher() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <>
        <SidebarSeparator />
        {/* Placeholder for stability during hydration */}
        <SidebarGroup className="py-2 px-2 h-21" />
      </>
    )
  }

  return (
    <>
      <SidebarSeparator />
      {isCollapsed ? <CollapsedSwitcher /> : <InlineSwitcher />}
    </>
  )
}
