import { useEffect, useRef, useState } from 'react'
import { Logo } from '../Logo'
import { RecipeShare } from '../RecipeShare'
import { THEME_OPTIONS } from '../../core/themes'
import { openSopInNewTab } from '../../core/export'
import { useAppStore } from '../../store/useAppStore'

export function CommandHeader({
  recipeCount,
  onExecute,
  runFlash,
  onOpenTour,
}: {
  recipeCount: number
  onExecute: () => void
  runFlash: boolean
  onOpenTour: () => void
}) {
  const setTheme = useAppStore((s) => s.setTheme)
  const theme = useAppStore((s) => s.theme)
  const autoRun = useAppStore((s) => s.autoRun)
  const setAutoRun = useAppStore((s) => s.setAutoRun)
  const [shareOpen, setShareOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shareOpen && !themeOpen) return undefined

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      // Defer close so menu item click handlers always run first.
      window.setTimeout(() => {
        if (shareOpen && shareRef.current && !shareRef.current.contains(t)) {
          setShareOpen(false)
        }
        if (themeOpen && themeRef.current && !themeRef.current.contains(t)) {
          setThemeOpen(false)
        }
      }, 0)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShareOpen(false)
        setThemeOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [shareOpen, themeOpen])

  const themeLabel =
    THEME_OPTIONS.find((t) => t.id === theme)?.label.replace(/ Modern| Terminal| Contrast/g, '') ??
    'Theme'

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
        <label className="cb-btn cb-btn-ghost !gap-2 !px-2" title="Auto-run recipe as input changes">
          <input
            type="checkbox"
            checked={autoRun}
            onChange={(e) => setAutoRun(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          <span className="hidden sm:inline">Auto</span>
        </label>

        <div className="cb-dropdown" ref={shareRef}>
          <button
            type="button"
            className="cb-btn cb-btn-share"
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
            <span className="text-[10px] opacity-70">{shareOpen ? '▴' : '▾'}</span>
          </button>
          {shareOpen && (
            <div
              className="cb-share-pop"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <RecipeShare onDone={() => setShareOpen(false)} />
            </div>
          )}
        </div>

        <div className="cb-dropdown" ref={themeRef}>
          <button
            type="button"
            className="cb-btn cb-btn-ghost"
            aria-expanded={themeOpen}
            aria-label="Color theme"
            onClick={() => {
              setThemeOpen((v) => !v)
              setShareOpen(false)
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            <span className="hidden md:inline">{themeLabel}</span>
            <span className="text-[10px] opacity-60">{themeOpen ? '▴' : '▾'}</span>
          </button>
          {themeOpen && (
            <div
              className="cb-menu cb-theme-menu"
              role="menu"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="menuitem"
                  className="cb-theme-option"
                  data-active={theme === opt.id ? 'true' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setTheme(opt.id)
                    setThemeOpen(false)
                  }}
                >
                  <span className="cb-theme-swatches" aria-hidden>
                    {opt.swatches.map((c) => (
                      <span key={c} className="cb-theme-swatch" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="cb-theme-meta">
                    <strong>{opt.label}</strong>
                    <span>{opt.description}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="cb-btn cb-btn-ghost !px-2"
          data-tour="sop-guide"
          title="Open full SOP in a new tab"
          onClick={() => openSopInNewTab()}
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
          title={recipeCount === 0 ? 'Add operations to the recipe first' : 'Run recipe (Ctrl+Enter)'}
          className={`cb-btn cb-btn-primary cb-btn-run ${runFlash ? 'is-flash' : ''} ${recipeCount > 0 ? 'is-armed' : ''}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
          Run
          <span className="cb-run-hint">⌃↵</span>
        </button>
      </div>
    </header>
  )
}
