import { useEffect, useState } from 'react'
import { InputPane } from './components/InputPane'
import { OutputPane } from './components/OutputPane'
import { RecipeBuilder } from './components/RecipeBuilder'
import { Logo } from './components/Logo'
import { useAppStore } from './store/useAppStore'

function App() {
  const hydrateRecipeFromUrl = useAppStore((s) => s.hydrateRecipeFromUrl)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const setOperationSearch = useAppStore((s) => s.setOperationSearch)
  const recipe = useAppStore((s) => s.recipe)
  const [runFlash, setRunFlash] = useState(false)

  useEffect(() => { hydrateRecipeFromUrl() }, [hydrateRecipeFromUrl])
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return
      if (event.key === 'Enter') {
        event.preventDefault()
        runCurrentRecipe()
        setRunFlash(true)
        setTimeout(() => setRunFlash(false), 500)
        return
      }
      if (event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOperationSearch('')
        const el = document.getElementById('op-search') as HTMLInputElement | null
        el?.focus()
        el?.select()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [runCurrentRecipe, setOperationSearch])

  const handleRun = () => {
    runCurrentRecipe()
    setRunFlash(true)
    setTimeout(() => setRunFlash(false), 500)
  }

  return (
    <div className="scanline relative flex h-screen flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* ─── HEADER ─── */}
      <header className="relative z-10 flex-shrink-0 px-5 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="mx-auto flex max-w-[1920px] items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <h1 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--accent)' }}>
                CipherBench
              </h1>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Decode &middot; Analyze &middot; Hunt Flags
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleRun}
              disabled={recipe.length === 0}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold transition-all disabled:opacity-25 ${
                runFlash
                  ? 'scale-105 text-black shadow-[0_0_24px_rgba(0,255,136,0.5)]'
                  : 'text-black hover:shadow-[0_0_16px_rgba(0,255,136,0.3)]'
              }`}
              style={{ background: runFlash ? '#00ff88' : 'var(--accent-dim)' }}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Execute
            </button>
            <div className="hidden items-center gap-2 lg:flex">
              <kbd className="font-code rounded-md px-2 py-1 text-xs font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Ctrl+Enter
              </kbd>
              <kbd className="font-code rounded-md px-2 py-1 text-xs font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                Ctrl+K
              </kbd>
            </div>
          </div>
        </div>
        {/* Accent line */}
        <div className="glow-line absolute bottom-0 left-0 right-0" />
      </header>

      {/* ─── MAIN ─── */}
      <main className="mx-auto grid min-h-0 w-full max-w-[1920px] flex-1 grid-cols-1 gap-3 overflow-hidden p-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
        <InputPane />
        <RecipeBuilder />
        <OutputPane />
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="flex-shrink-0 px-5 py-1.5" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="mx-auto flex max-w-[1920px] items-center justify-between">
          <span className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
            Secure — all processing runs locally in your browser
          </span>
          <span className="font-code text-xs" style={{ color: 'var(--text-muted)' }}>
            {recipe.length} step{recipe.length !== 1 ? 's' : ''} loaded
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
