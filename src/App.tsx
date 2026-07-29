import { useEffect, useState, useCallback } from 'react'
import { InputPane } from './components/InputPane'
import { OutputPane } from './components/OutputPane'
import { CommandHeader } from './components/layout/CommandHeader'
import { OperationLibrary } from './components/OperationLibrary'
import { PipelineStrip } from './components/pipeline/PipelineStrip'
import { StatusTray } from './components/StatusTray'
import { useAppStore } from './store/useAppStore'
import { applyThemeToDocument } from './core/themes'
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
  const [suggestPulse, setSuggestPulse] = useState(false)

  useEffect(() => {
    hydrateRecipeFromUrl()
  }, [hydrateRecipeFromUrl])

  useEffect(() => {
    applyThemeToDocument(theme)
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => applyThemeToDocument('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
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

  const focusSuggestions = useCallback(() => {
    const el = document.getElementById('magic-suggestions')
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    setSuggestPulse(true)
    window.setTimeout(() => setSuggestPulse(false), 800)
  }, [])

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
          <div className="cb-col-label">// operations</div>
          <div className="cb-col-body">
            <OperationLibrary />
          </div>
        </aside>

        <aside className="cb-col">
          <div className="cb-col-label">// recipe · {stepLabel}</div>
          <div className="cb-col-body">
            <PipelineStrip layout="vertical" />
          </div>
        </aside>

        <section className="cb-col" id="workbench">
          <div className="cb-io">
            <InputPane suggestPulse={suggestPulse} />
            <OutputPane />
            <StatusTray onFocusSuggestions={focusSuggestions} />
          </div>
        </section>
      </div>

      <footer className="cb-footer">
        <span>
          <span className="cb-live-dot" aria-hidden />
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
            className="border-none bg-transparent p-0 font-code text-[var(--text-dim)] underline-offset-2 transition-colors hover:text-[var(--accent)] hover:underline"
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
