import { useAppStore } from '../store/useAppStore'
import type { Recipe } from '../core/types'

const PRESETS: { label: string; recipe: Recipe }[] = [
  {
    label: 'CTF · Base64',
    recipe: [{ operationId: 'base64-decode', params: {} }],
  },
  {
    label: 'CTF · Hex',
    recipe: [{ operationId: 'hex-decode', params: {} }],
  },
  {
    label: 'SOC · JWT',
    recipe: [{ operationId: 'jwt-decode', params: { secret: '' } }],
  },
  {
    label: 'SOC · IOCs',
    recipe: [{ operationId: 'ioc-extract', params: {} }],
  },
]

export function MissionPresets() {
  const loadRecipe = useAppStore((s) => s.loadRecipe)
  const clearRecipe = useAppStore((s) => s.clearRecipe)

  return (
    <div className="flex max-w-[min(100vw,520px)] flex-wrap gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => loadRecipe(p.recipe)}
          className="cb-btn cb-btn-ghost !px-3 !py-2 !text-[11px]"
        >
          {p.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => clearRecipe()}
        className="cb-btn cb-btn-ghost !px-3 !py-2 !text-[11px] !text-[#fb7185]"
      >
        Reset
      </button>
    </div>
  )
}
