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
  const toggleTheme = useAppStore((s) => s.toggleTheme)
  const theme = useAppStore((s) => s.theme)
  const [shareOpen, setShareOpen] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shareOpen) return
    const onDoc = (e: MouseEvent) => {
      if (!shareRef.current?.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [shareOpen])

  return (
    <header className="cb-header">
      <div className="cb-brand" data-tour="brand">
        <Logo size={30} />
        <div>
          <h1 className="cb-brand-name">CipherBench</h1>
          <p className="cb-brand-sub">CTF / SOC workbench</p>
        </div>
      </div>

      <div className="cb-header-actions">
        <div className="relative" ref={shareRef}>
          <button
            type="button"
            className="cb-btn cb-btn-ghost"
            data-tour="transmit-panel"
            onClick={() => setShareOpen((v) => !v)}
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
          </button>
          {shareOpen && (
            <div className="cb-share-pop">
              <p className="mb-3 text-xs text-[var(--text-muted)]">
                Export or import recipes. Input text is never included.
              </p>
              <RecipeShare />
            </div>
          )}
        </div>

        <button
          type="button"
          className="cb-btn cb-btn-ghost"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7 7 0 1 0 21 14.3Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          )}
          Theme
        </button>

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
          className={`cb-btn cb-btn-primary ${runFlash ? 'opacity-90' : ''}`}
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
