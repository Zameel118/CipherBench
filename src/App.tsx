import { useEffect, useState, useCallback } from 'react'
import { InputPane } from './components/InputPane'
import { OutputPane } from './components/OutputPane'
import { CommandHeader } from './components/layout/CommandHeader'
import { OperationLibrary } from './components/OperationLibrary'
import { PipelineStrip } from './components/pipeline/PipelineStrip'
import { StatusTray } from './components/StatusTray'
import { MagicSuggestions } from './components/MagicSuggestions'
import { useAppStore } from './store/useAppStore'
import { TourGuide, shouldAutoShowTour } from './components/TourGuide'
import { SopGuidePanel } from './components/SopGuidePanel'

function App() {
  const hydrateRecipeFromUrl = useAppStore((s) => s.hydrateRecipeFromUrl)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const setOperationSearch = useAppStore((s) => s.setOperationSearch)
  const recipe = useAppStore((s) => s.recipe)
  const input = useAppStore((s) => s.input)
  const lastRunMs = useAppStore((s) => s.lastRunMs)
  const theme = useAppStore((s) => s.theme)
  const [runFlash, setRunFlash] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [sopOpen, setSopOpen] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)

  useEffect(() => {
    hydrateRecipeFromUrl()
  }, [hydrateRecipeFromUrl])

  useEffect(() => {
    const root = document.documentElement
    const resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
        : theme
    root.classList.toggle('light', resolved === 'light')
    root.classList.toggle('dark', resolved === 'dark')
    root.style.colorScheme = resolved
  }, [theme])

  useEffect(() => {
    if (!shouldAutoShowTour()) return
    const t = window.setTimeout(() => setTourOpen(true), 700)
    return () => window.clearTimeout(t)
  }, [])

  const flashRun = useCallback(() => {
    runCurrentRecipe()
    setRunFlash(true)
    window.setTimeout(() => setRunFlash(false), 500)
  }, [runCurrentRecipe])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '?') return
      if (event.metaKey || event.ctrlKey) return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      event.preventDefault()
      setTourOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key === 'Enter') {
        event.preventDefault()
        flashRun()
        return
      }
      if (event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOperationSearch('')
        window.setTimeout(() => {
          const el = document.getElementById('op-search') as HTMLInputElement | null
          el?.focus()
          el?.select()
        }, 50)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flashRun, setOperationSearch])

  const byteCount = byteLengthOf(input)
  const stepLabel = `${recipe.length} step${recipe.length !== 1 ? 's' : ''}`

  return (
    <div className="cb-root">
      <CommandHeader
        recipeCount={recipe.length}
        onExecute={flashRun}
        runFlash={runFlash}
        onOpenTour={() => setTourOpen(true)}
        onOpenSop={() => setSopOpen(true)}
      />

      <div className="cb-main">
        <aside className="cb-col">
          <div className="cb-col-label">Operations</div>
          <div className="cb-col-body">
            <OperationLibrary />
          </div>
        </aside>

        <aside className="cb-col">
          <div className="cb-col-label">Recipe · {stepLabel}</div>
          <div className="cb-col-body">
            <PipelineStrip layout="vertical" />
          </div>
        </aside>

        <section className="cb-col" id="workbench">
          <MagicSuggestions open={suggestionsOpen} />
          <div className="cb-io">
            <InputPane />
            <OutputPane />
            <StatusTray onShowSuggestions={() => setSuggestionsOpen((v) => !v)} />
          </div>
        </section>
      </div>

      <footer className="cb-footer">
        <span>
          {recipe.length} op{recipe.length !== 1 ? 's' : ''} armed
        </span>
        <div className="cb-footer-metrics">
          <span>{input.length.toLocaleString()} chars</span>
          <span>·</span>
          <span>{byteCount.toLocaleString()} bytes</span>
          <span>·</span>
          <span>{lastRunMs !== null ? `${lastRunMs}ms` : '-'}</span>
          <span className="mx-1">·</span>
          <button
            type="button"
            onClick={() => setSopOpen(true)}
            className="border-none bg-transparent p-0 text-[var(--text-dim)] underline-offset-2 hover:text-[var(--accent)] hover:underline"
          >
            SOP
          </button>
        </div>
      </footer>

      <TourGuide open={tourOpen} onClose={() => setTourOpen(false)} onOpenSop={() => setSopOpen(true)} />
      <SopGuidePanel open={sopOpen} onClose={() => setSopOpen(false)} />
    </div>
  )
}

function byteLengthOf(text: string) {
  try {
    return new TextEncoder().encode(text).length
  } catch {
    return text.length
  }
}

export default App
