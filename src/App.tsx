import { useEffect, useState, useCallback } from 'react'
import { InputPane } from './components/InputPane'
import { OutputPane } from './components/OutputPane'
import { CommandHeader } from './components/layout/CommandHeader'
import { SideRail } from './components/layout/SideRail'
import { OpsSidePanel, type DeckTab } from './components/layout/OpsSidePanel'
import { useAppStore } from './store/useAppStore'
import { TourGuide, shouldAutoShowTour } from './components/TourGuide'
import { SopGuidePanel } from './components/SopGuidePanel'

function App() {
  const hydrateRecipeFromUrl = useAppStore((s) => s.hydrateRecipeFromUrl)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const setOperationSearch = useAppStore((s) => s.setOperationSearch)
  const recipe = useAppStore((s) => s.recipe)
  const [runFlash, setRunFlash] = useState(false)
  const [deckTab, setDeckTab] = useState<DeckTab>('arsenal')
  const [scrollRequest, setScrollRequest] = useState<{ tab: DeckTab; at: number } | null>(
    null,
  )
  const [tourOpen, setTourOpen] = useState(false)
  const [sopOpen, setSopOpen] = useState(false)

  useEffect(() => {
    hydrateRecipeFromUrl()
  }, [hydrateRecipeFromUrl])

  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

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

  const navigateOps = useCallback((tab: DeckTab) => {
    setDeckTab(tab)
    setScrollRequest({ tab, at: Date.now() })
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
        navigateOps('arsenal')
        setOperationSearch('')
        window.setTimeout(() => {
          const el = document.getElementById('op-search') as HTMLInputElement | null
          el?.focus()
          el?.select()
        }, 400)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flashRun, setOperationSearch, navigateOps])

  const focusInput = () => {
    const el = document.querySelector('#workbench-input textarea') as HTMLTextAreaElement | null
    el?.focus()
  }

  return (
    <div className="cb-root cb-scanlines flex h-screen overflow-hidden">
      <SideRail deckTab={deckTab} onDeckTab={navigateOps} onScrollWorkbench={focusInput} />
      <div className="cb-shell min-h-0">
        <CommandHeader
          recipeCount={recipe.length}
          onExecute={flashRun}
          runFlash={runFlash}
          onOpenTour={() => setTourOpen(true)}
          onOpenSop={() => setSopOpen(true)}
        />
        <div className="cb-workbench-row min-h-0 flex-1">
          <div className="cb-stage min-h-0 flex-1" id="workbench">
            <InputPane />
            <OutputPane />
          </div>
          <OpsSidePanel
            activeTab={deckTab}
            onTabChange={setDeckTab}
            scrollRequest={scrollRequest}
          />
        </div>
        <footer className="flex flex-shrink-0 items-center justify-between border-t border-[rgba(37,99,235,0.2)] px-6 py-2 text-[11px] text-[#6b7194]">
          <span>CipherBench · client-side CTF/SOC workbench</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSopOpen(true)}
              className="font-code text-[11px] text-[#9499b8] underline-offset-2 hover:text-[#e879f9] hover:underline"
            >
              SOP guide
            </button>
            <span className="font-code">
              {recipe.length} op{recipe.length !== 1 ? 's' : ''} armed
            </span>
          </div>
        </footer>
        <TourGuide open={tourOpen} onClose={() => setTourOpen(false)} onOpenSop={() => setSopOpen(true)} />
        <SopGuidePanel open={sopOpen} onClose={() => setSopOpen(false)} />
      </div>
    </div>
  )
}

export default App
