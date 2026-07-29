import { useEffect, useRef, useState } from 'react'
import { Logo } from '../Logo'
import { RecipeShare } from '../RecipeShare'
import { useAppStore } from '../../store/useAppStore'

export function CommandHeader({
  recipeCount,
  onExecute,
  runFlash,
  onOpenTour,
  onOpenSop,
}: {
  recipeCount: number
  onExecute: () => void
  runFlash: boolean
  onOpenTour: () => void
  onOpenSop: () => void
}) {
  const setTheme = useAppStore((s) => s.setTheme)
  const theme = useAppStore((s) => s.theme)
  const [shareOpen, setShareOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shareOpen && !themeOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (shareOpen && !shareRef.current?.contains(t)) setShareOpen(false)
      if (themeOpen && !themeRef.current?.contains(t)) setThemeOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShareOpen(false)
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [shareOpen, themeOpen])

  return (
    <header className="cb-header">
      <div className="cb-brand" data-tour="brand">
        <Logo size={34} />
        <div>
          <h1 className="cb-brand-name">CipherBench</h1>
          <p className="cb-brand-sub">CTF / SOC workbench</p>
        </div>
      </div>

      <div className="cb-header-actions">
        <div className="cb-dropdown" ref={shareRef}>
          <button
            type="button"
            className="cb-btn cb-btn-ghost"
            data-tour="transmit-panel"
            aria-expanded={shareOpen}
            onClick={() => {
              setShareOpen((v) => !v)
              setThemeOpen(false)
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Share
            <span className="text-[10px] opacity-60">{shareOpen ? '▴' : '▾'}</span>
          </button>
          {shareOpen && (
            <div className="cb-share-pop">
              <p className="mb-3 font-code text-[11px] text-[var(--text-muted)]">
                Export / import recipes. Input never leaves the browser.
              </p>
              <RecipeShare />
            </div>
          )}
        </div>

        <div className="cb-dropdown" ref={themeRef}>
          <button
            type="button"
            className="cb-btn cb-btn-ghost"
            aria-expanded={themeOpen}
            aria-label="Theme menu"
            onClick={() => {
              setThemeOpen((v) => !v)
              setShareOpen(false)
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7 7 0 1 0 21 14.3Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Theme
            <span className="text-[10px] opacity-60">{themeOpen ? '▴' : '▾'}</span>
          </button>
          {themeOpen && (
            <div className="cb-menu" role="menu">
              {(
                [
                  ['dark', 'Dark ops'],
                  ['light', 'Light lab'],
                  ['system', 'System'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="menuitem"
                  className="cb-menu-item"
                  data-active={theme === value ? 'true' : undefined}
                  onClick={() => {
                    setTheme(value)
                    setThemeOpen(false)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="cb-btn cb-btn-ghost !px-2"
          onClick={onOpenSop}
          data-tour="sop-guide"
          title="SOP guide"
        >
          SOP
        </button>
        <button
          type="button"
          className="cb-btn cb-btn-ghost !px-2"
          onClick={onOpenTour}
          data-tour="tour-help"
          title="Tour"
        >
          ?
        </button>

        <button
          type="button"
          onClick={onExecute}
          disabled={recipeCount === 0}
          className={`cb-btn cb-btn-primary ${runFlash ? 'is-flash' : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
          Run
        </button>
      </div>
    </header>
  )
}
