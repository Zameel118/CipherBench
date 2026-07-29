export type ThemeId =
  | 'dark-modern'
  | 'light-modern'
  | 'dark-hc'
  | 'light-hc'
  | 'midnight'
  | 'system'

export interface ThemeOption {
  id: ThemeId
  label: string
  description: string
  /** Preview swatches for the picker (bg, panel, accent). */
  swatches: [string, string, string]
}

/** Cursor-style theme choices, remapped to CipherBench's mint CTF palette. */
export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark-modern',
    label: 'Dark Modern',
    description: 'Default ops floor',
    swatches: ['#0b0f15', '#151b24', '#4ade80'],
  },
  {
    id: 'light-modern',
    label: 'Light Modern',
    description: 'Bright lab bench',
    swatches: ['#f4f6f9', '#ffffff', '#16a34a'],
  },
  {
    id: 'dark-hc',
    label: 'Dark High Contrast',
    description: 'Max signal clarity',
    swatches: ['#000000', '#0a0a0a', '#39ff14'],
  },
  {
    id: 'light-hc',
    label: 'Light High Contrast',
    description: 'Print-friendly',
    swatches: ['#ffffff', '#f0f0f0', '#006600'],
  },
  {
    id: 'midnight',
    label: 'Midnight Terminal',
    description: 'Deep CTF shell',
    swatches: ['#05080c', '#0c1218', '#5eead4'],
  },
  {
    id: 'system',
    label: 'Match System',
    description: 'Follow OS preference',
    swatches: ['#0b0f15', '#f4f6f9', '#4ade80'],
  },
]

export const THEME_STORAGE_KEY = 'cipherbench_theme'

export function loadStoredTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (THEME_OPTIONS.some((t) => t.id === raw)) return raw as ThemeId
  } catch {
    // ignore
  }
  return 'dark-modern'
}

export function resolveTheme(theme: ThemeId): Exclude<ThemeId, 'system'> {
  if (theme !== 'system') return theme
  const prefersLight =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  return prefersLight ? 'light-modern' : 'dark-modern'
}

export function applyThemeToDocument(theme: ThemeId) {
  const resolved = resolveTheme(theme)
  const root = document.documentElement
  root.dataset.theme = resolved
  root.classList.toggle('light', resolved === 'light-modern' || resolved === 'light-hc')
  root.classList.toggle('dark', !(resolved === 'light-modern' || resolved === 'light-hc'))
  root.style.colorScheme =
    resolved === 'light-modern' || resolved === 'light-hc' ? 'light' : 'dark'
}
