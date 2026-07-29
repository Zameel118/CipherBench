import { useEffect } from 'react'
import { InputPane } from './components/InputPane'
import { OutputPane } from './components/OutputPane'
import { RecipeBuilder } from './components/RecipeBuilder'
import { useAppStore } from './store/useAppStore'

function App() {
  const hydrateRecipeFromUrl = useAppStore((s) => s.hydrateRecipeFromUrl)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const setOperationSearch = useAppStore((s) => s.setOperationSearch)

  useEffect(() => {
    hydrateRecipeFromUrl()
  }, [hydrateRecipeFromUrl])

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key === 'Enter') {
        event.preventDefault()
        runCurrentRecipe()
        return
      }
      if (event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOperationSearch('')
        const search = document.getElementById('op-search') as HTMLInputElement | null
        search?.focus()
        search?.select()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [runCurrentRecipe, setOperationSearch])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0e1a] text-slate-200 cyber-grid">
      {/* Header */}
      <header className="relative z-10 flex-shrink-0 border-b border-cyan-900/30 bg-[#0c1120]/90 px-4 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="logo-glow flex-shrink-0">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="30" height="30" rx="6" stroke="rgb(6 182 212)" strokeWidth="1.5" fill="rgba(6, 182, 212, 0.08)" />
                <path d="M16 6L16 10M16 22L16 26M6 16H10M22 16H26" stroke="rgb(6 182 212)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16" cy="16" r="5" stroke="rgb(6 182 212)" strokeWidth="1.5" fill="rgba(6, 182, 212, 0.1)" />
                <circle cx="16" cy="16" r="2" fill="rgb(6 182 212)" />
                <path d="M11.5 11.5L13.5 13.5M18.5 18.5L20.5 20.5M20.5 11.5L18.5 13.5M13.5 18.5L11.5 20.5" stroke="rgb(6 182 212)" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-cyan-400">
                CipherBench
              </h1>
              <p className="text-[11px] text-slate-500">
                Encode · Decode · Analyze
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden rounded border border-slate-700/60 bg-slate-800/50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline-block">
              Ctrl+Enter
            </kbd>
            <span className="hidden text-[10px] text-slate-600 sm:inline">run</span>
            <span className="hidden text-slate-700 sm:inline">·</span>
            <kbd className="hidden rounded border border-slate-700/60 bg-slate-800/50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline-block">
              Ctrl+K
            </kbd>
            <span className="hidden text-[10px] text-slate-600 sm:inline">search</span>
          </div>
        </div>
      </header>

      {/* Main 3-pane layout — fixed height, no page scroll */}
      <main className="mx-auto grid min-h-0 w-full max-w-[1920px] flex-1 grid-cols-1 gap-2 overflow-hidden p-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)]">
        <InputPane />
        <RecipeBuilder />
        <OutputPane />
      </main>
    </div>
  )
}

export default App
