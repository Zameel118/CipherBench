import { useEffect } from 'react'
import { InputPane } from './components/InputPane'
import { OutputPane } from './components/OutputPane'
import { RecipeBuilder } from './components/RecipeBuilder'
import { useAppStore } from './store/useAppStore'

function App() {
  const hydrateRecipeFromUrl = useAppStore((s) => s.hydrateRecipeFromUrl)
  const runCurrentRecipe = useAppStore((s) => s.runCurrentRecipe)
  const setOperationSearch = useAppStore((s) => s.setOperationSearch)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  useEffect(() => {
    hydrateRecipeFromUrl()
  }, [hydrateRecipeFromUrl])

  useEffect(() => {
    const stored = window.localStorage.getItem('cipherbench-theme')
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setTheme(stored)
    }
  }, [setTheme])

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const resolved = theme === 'system' ? (prefersDark.matches ? 'dark' : 'light') : theme
      root.classList.toggle('dark', resolved === 'dark')
      root.style.colorScheme = resolved
    }

    applyTheme()
    window.localStorage.setItem('cipherbench-theme', theme)
    prefersDark.addEventListener('change', applyTheme)
    return () => prefersDark.removeEventListener('change', applyTheme)
  }, [theme])

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
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              CipherBench
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Client-side encode/decode workbench for CTF and SOC workflows.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
              Ctrl/Cmd+Enter run
            </span>
            <span className="rounded-full border border-slate-200 px-2 py-1 dark:border-slate-700">
              Ctrl/Cmd+K search ops
            </span>
            <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
              <span>Theme</span>
              <select
                value={theme}
                onChange={(e) =>
                  setTheme(e.target.value as 'light' | 'dark' | 'system')
                }
                className="bg-transparent text-slate-700 outline-none dark:text-slate-200"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-h-0 w-full max-w-[1800px] flex-1 grid-cols-1 gap-3 p-3 md:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        <InputPane />
        <RecipeBuilder />
        <OutputPane />
      </main>
    </div>
  )
}

export default App
