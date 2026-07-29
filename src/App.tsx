import { useEffect } from 'react'
import { InputPane } from './components/InputPane'
import { OutputPane } from './components/OutputPane'
import { RecipeBuilder } from './components/RecipeBuilder'
import { useAppStore } from './store/useAppStore'

function App() {
  const hydrateRecipeFromUrl = useAppStore((s) => s.hydrateRecipeFromUrl)

  useEffect(() => {
    hydrateRecipeFromUrl()
  }, [hydrateRecipeFromUrl])

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">
          CipherBench
        </h1>
        <p className="text-sm text-slate-600">
          Client-side encode/decode workbench for CTF and SOC workflows.
        </p>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        <InputPane />
        <RecipeBuilder />
        <OutputPane />
      </main>
    </div>
  )
}

export default App
