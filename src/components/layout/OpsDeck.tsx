import { OperationLibrary } from '../OperationLibrary'
import { PipelineStrip } from '../pipeline/PipelineStrip'
import { RecipeShare } from '../RecipeShare'

export type DeckTab = 'pipeline' | 'arsenal' | 'share'

export function OpsDeck({
  tab,
  onTab,
}: {
  tab: DeckTab
  onTab: (t: DeckTab) => void
}) {
  return (
    <section className="cb-deck" id="ops-deck">
      <div className="cb-deck-tabs">
        {(
          [
            ['pipeline', 'Ops chain'],
            ['arsenal', 'Arsenal'],
            ['share', 'Transmit'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="cb-deck-tab"
            data-active={tab === id}
            onClick={() => onTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="cb-deck-body">
        {tab === 'pipeline' && <PipelineStrip />}
        {tab === 'arsenal' && (
          <div className="h-full overflow-hidden p-4">
            <OperationLibrary />
          </div>
        )}
        {tab === 'share' && (
          <div className="p-4">
            <p className="mb-3 text-sm text-[#9499b8]">
              Export your ops chain as JSON or a shareable URL - input data is never included.
            </p>
            <RecipeShare />
          </div>
        )}
      </div>
    </section>
  )
}
