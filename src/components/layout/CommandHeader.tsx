import { Logo } from '../Logo'
import { MissionPresets } from '../MissionPresets'

export function CommandHeader({
  recipeCount,
  onExecute,
  runFlash,
}: {
  recipeCount: number
  onExecute: () => void
  runFlash: boolean
}) {
  return (
    <header className="cb-grid-bg relative flex-shrink-0 border-b border-[rgba(37,99,235,0.28)] px-4 py-3 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 lg:hidden">
          <Logo size={32} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9499b8]">
              CTF · SOC Mission Deck
            </p>
            <h1 className="text-lg font-extrabold tracking-tight text-white">CipherBench</h1>
          </div>
        </div>

        <div className="hidden flex-col gap-1 lg:flex">
          <div className="flex items-center gap-3">
            <span className="cb-live-pill">Local secure</span>
            <span className="font-code text-[10px] uppercase tracking-widest text-[#6b7194]">
              Incident decode terminal
            </span>
          </div>
          <h1 className="bg-gradient-to-r from-[#e879f9] via-[#a855f7] to-[#22d3ee] bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            CipherBench Portal
          </h1>
          <p className="max-w-xl text-sm text-[#9499b8]">
            Trace the signal. Chain transforms. Hunt flags — inspired by elite CTF ops floors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <MissionPresets />
          <button
            type="button"
            onClick={onExecute}
            disabled={recipeCount === 0}
            className={`cb-btn cb-btn-primary ${runFlash ? 'scale-105' : ''}`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            Run chain
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <kbd className="font-code rounded-md border border-[rgba(148,153,184,0.25)] bg-[rgba(0,0,0,0.35)] px-2 py-1 text-[10px] text-[#9499b8]">
              Ctrl+Enter
            </kbd>
            <kbd className="font-code rounded-md border border-[rgba(148,153,184,0.25)] bg-[rgba(0,0,0,0.35)] px-2 py-1 text-[10px] text-[#9499b8]">
              Ctrl+K
            </kbd>
          </div>
        </div>
      </div>
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), rgba(34,211,238,0.5), transparent)',
        }}
      />
    </header>
  )
}
