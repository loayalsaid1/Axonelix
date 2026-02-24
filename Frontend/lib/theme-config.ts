export type ColorThemeId =
  | "default"
  | "alpine"
  | "starry-night"
  | "tiesen"
  | "brownies"
  | "meta-mask"

export interface ColorTheme {
  id: ColorThemeId
  label: string
  /** Representative color shown in the swatch (primary color of that theme) */
  swatch: string
  swatchDark?: string
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "default",
    label: "Default",
    swatch: "oklch(0.208 0.042 265.755)",
    swatchDark: "oklch(0.929 0.013 255.508)",
  },
  {
    id: "alpine",
    label: "Alpine",
    swatch: "oklch(0.4284 0.1720 259.7023)",
    swatchDark: "oklch(0.7222 0.1514 248.5089)",
  },
  {
    id: "starry-night",
    label: "Starry Night",
    swatch: "oklch(0.4815 0.1178 263.3758)",
    swatchDark: "oklch(0.4815 0.1178 263.3758)",
  },
  {
    id: "tiesen",
    label: "Tiesen",
    swatch: "oklch(0.5144 0.1605 267.4400)",
    swatchDark: "oklch(0.5144 0.1605 267.4400)",
  },
  {
    id: "brownies",
    label: "Brownies",
    swatch: "oklch(0.5517 0.1895 35.8697)",
    swatchDark: "oklch(0.7400 0.1734 49.3043)",
  },
  {
    id: "meta-mask",
    label: "Meta Mask",
    swatch: "oklch(0.3084 0.1285 300.5672)",
    swatchDark: "oklch(0.6056 0.2189 292.7172)",
  },
]

export const COLOR_THEME_STORAGE_KEY = "axonelix-color-theme"
