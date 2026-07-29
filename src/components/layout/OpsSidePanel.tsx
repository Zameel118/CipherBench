import { useEffect, useRef, useCallback } from 'react'
import { OperationLibrary } from '../OperationLibrary'
import { PipelineStrip } from '../pipeline/PipelineStrip'
import { RecipeShare } from '../RecipeShare'

export type DeckTab = 'pipeline' | 'arsenal' | 'share'

const SECTIONS: { id: DeckTab; title: string; subtitle: string }[] = [
  { id: 'pipeline', title: 'Ops chain', subtitle: 'Stages execute in order' },
  { id: 'arsenal', title: 'Arsenal', subtitle: 'Add transforms to the chain' },
  { id: 'share', title: 'Transmit', subtitle: 'Export or import recipes' },
]

export function OpsSidePanel({
  activeTab,
  onTabChange,
  scrollRequest,
}: {
  activeTab: DeckTab
  onTabChange: (tab: DeckTab) => void
  scrollRequest: { tab: DeckTab; at: number } | null
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const programmaticScroll = useRef(false)

  const scrollSectionIntoView = useCallback((tab: DeckTab) => {
    const root = scrollRef.current
    const el = root?.querySelector(`#ops-section-${tab}`)
    if (!el || !root) return
    programmaticScroll.current = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      programmaticScroll.current = false
    }, 600)
  }, [])

  useEffect(() => {
    if (scrollRequest) scrollSectionIntoView(scrollRequest.tab)
  }, [scrollRequest, scrollSectionIntoView])

  useEffect(() => {
    const root = scrollRef.current
    if (!root) return

    const sections = root.querySelectorAll<HTMLElement>('[data-ops-section]')
    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScroll.current) return
        let best: { id: DeckTab; ratio: number } | null = null
        for (const entry of entries) {
          const id = entry.target.getAttribute('data-ops-section') as DeckTab | null
          if (!id) continue
          entry.target.setAttribute('data-inview', entry.isIntersecting ? 'true' : 'false')
          if (entry.isIntersecting) {
            const ratio = entry.intersectionRatio
            if (!best || ratio > best.ratio) {
              best = { id, ratio }
            }
          }
        }
        // Lower threshold so the next panel becomes "live" sooner while scrolling.
        if (best && best.ratio >= 0.22) {
          onTabChange(best.id)
        }
      },
      { root, threshold: [0.12, 0.22, 0.35, 0.55, 0.75], rootMargin: '-4% 0px -4% 0px' },
    )

    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [onTabChange])

  return (
    <aside className="cb-ops-rail flex min-h-0 flex-col">
      <div className="flex-shrink-0 border-b border-[rgba(37,99,235,0.22)] px-4 py-3">
        <p className="font-code text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7194]">
          Mission modules
        </p>
        <p className="text-xs text-[#9499b8]">Scroll the rail - focus unlocks each panel</p>
      </div>
      <div ref={scrollRef} className="cb-ops-scroll min-h-0 flex-1">
        {SECTIONS.map((sec) => (
          <section
            key={sec.id}
            id={`ops-section-${sec.id}`}
            data-ops-section={sec.id}
            data-tour={
              sec.id === 'pipeline'
                ? 'ops-chain-panel'
                : sec.id === 'share'
                  ? 'transmit-panel'
                  : 'arsenal-panel'
            }
            data-inview={activeTab === sec.id ? 'true' : 'false'}
            className="cb-ops-section"
          >
            <header className="mb-3 flex items-baseline justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-[#e879f9]">
                  {sec.title}
                </h3>
                <p className="text-[11px] text-[#6b7194]">{sec.subtitle}</p>
              </div>
              <span className="font-code text-[9px] text-[#4b556f]">
                {sec.id === activeTab ? '● live' : '○'}
              </span>
            </header>
            <div className="cb-ops-section-body min-h-[280px]">
              {sec.id === 'pipeline' && <PipelineStrip layout="vertical" />}
              {sec.id === 'arsenal' && <OperationLibrary compact />}
              {sec.id === 'share' && (
                <div>
                  <p className="mb-3 text-xs leading-relaxed text-[#9499b8]">
                    Share ops chains via JSON or URL. Input text is never included.
                  </p>
                  <RecipeShare />
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </aside>
  )
}
