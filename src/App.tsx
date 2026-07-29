import { useEffect, useState, useCallback } from 'react'
import { InputPane } from './components/InputPane'
import { OutputPane } from './components/OutputPane'
import { CommandHeader } from './components/layout/CommandHeader'
import { SideRail } from './components/layout/SideRail'
import { OpsDeck, type DeckTab } from './components/layout/OpsDeck'
import { useAppStore } from './store/useAppStore'

function App() {
  const hydrateRecipeFromUrl = useAppStore((s) => s.hydrateRecipeFromUrl)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const setOperationSearch = useAppStore((s) => s.setOperationSearch)
  const recipe = useAppStore((s) => s.recipe)
  const [runFlash, setRunFlash] = useState(false)
  const [deckTab, setDeckTab] = useState<DeckTab>('arsenal')

  useEffect(() => {
    hydrateRecipeFromUrl()
  }, [hydrateRecipeFromUrl])

  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  const flashRun = useCallback(() => {
    runCurrentRecipe()
    setRunFlash(true)
    window.setTimeout(() => setRunFlash(false), 500)
  }, [runCurrentRecipe])

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
        setDeckTab('arsenal')
        setOperationSearch('')
        const el = document.getElementById('op-search') as HTMLInputElement | null
        el?.focus()
        el?.select()
        document.getElementById('ops-deck')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flashRun, setOperationSearch])

  const scrollWorkbench = () => {
    document.getElementById('workbench-input')?.scrollIntoView({ behavior: 'smooth' })
  }

  const onDeckTab = (tab: DeckTab) => {
    setDeckTab(tab)
    document.getElementById('ops-deck')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="cb-root cb-scanlines flex h-screen overflow-hidden">
      <SideRail deckTab={deckTab} onDeckTab={onDeckTab} onScrollWorkbench={scrollWorkbench} />
      <div className="cb-shell">
        <CommandHeader recipeCount={recipe.length} onExecute={flashRun} runFlash={runFlash} />
        <div className="cb-stage" id="workbench">
          <InputPane />
          <OutputPane />
        </div>
        <OpsDeck tab={deckTab} onTab={setDeckTab} />
        <footer className="flex flex-shrink-0 items-center justify-between border-t border-[rgba(37,99,235,0.2)] px-6 py-2 text-[11px] text-[#6b7194]">
          <span>CipherBench · client-side CTF/SOC workbench</span>
          <span className="font-code">
            {recipe.length} op{recipe.length !== 1 ? 's' : ''} armed
          </span>
        </footer>
      </div>
    </div>
  )
}

export default App
