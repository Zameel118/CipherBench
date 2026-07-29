import { Logo } from '../Logo'

type DeckTab = 'pipeline' | 'arsenal' | 'share'

export function SideRail({
  deckTab,
  onDeckTab,
  onScrollWorkbench,
}: {
  deckTab: DeckTab
  onDeckTab: (tab: DeckTab) => void
  onScrollWorkbench: () => void
}) {
  const items: { id: string; label: string; tab?: DeckTab; action?: () => void }[] = [
    { id: 'portal', label: 'Portal', action: onScrollWorkbench },
    { id: 'chain', label: 'Ops Chain', tab: 'pipeline' },
    { id: 'arsenal', label: 'Arsenal', tab: 'arsenal' },
    { id: 'share', label: 'Transmit', tab: 'share' },
  ]

  return (
    <aside
      className="flex w-[56px] flex-shrink-0 flex-col items-center gap-2 border-r border-[rgba(37,99,235,0.25)] bg-[rgba(3,3,8,0.85)] py-4 backdrop-blur-md md:w-[72px]"
    >
      <Logo size={36} />
      <div className="mt-2 h-px w-8 bg-[rgba(168,85,247,0.35)]" />
      <nav className="flex flex-1 flex-col gap-1 pt-2">
        {items.map((item) => {
          const active = item.tab ? deckTab === item.tab : false
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => {
                if (item.tab) onDeckTab(item.tab)
                item.action?.()
              }}
              className="group flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-[9px] font-bold uppercase tracking-wider transition-colors"
              style={{
                color: active ? '#e879f9' : '#9499b8',
                background: active ? 'rgba(168,85,247,0.15)' : 'transparent',
              }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-lg border text-xs"
                style={{
                  borderColor: active ? 'rgba(232,121,249,0.5)' : 'rgba(148,153,184,0.2)',
                  boxShadow: active ? '0 0 16px rgba(168,85,247,0.25)' : 'none',
                }}
              >
                {item.id === 'portal' && '◎'}
                {item.id === 'chain' && '⇢'}
                {item.id === 'arsenal' && '＋'}
                {item.id === 'share' && '↗'}
              </span>
              <span className="max-w-[64px] truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
