import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const TOUR_KEY = 'cipherbench_tour_seen'
const TARGET_CLASS = 'cb-tour-target'

type Step = {
  id: string
  target: string
  title: string
  body: string
  placement: 'top' | 'bottom' | 'left' | 'right'
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    target: 'brand',
    title: 'CipherBench',
    body: 'Minimal client-side CTF/SOC workbench. Follow the highlights to learn the layout in under a minute.',
    placement: 'bottom',
  },
  {
    id: 'operations',
    target: 'arsenal-panel',
    title: 'Operations',
    body: 'Browse categories or search transforms. Click an op to add it to the recipe. Ctrl+K focuses search.',
    placement: 'right',
  },
  {
    id: 'recipe',
    target: 'ops-chain-panel',
    title: 'Recipe',
    body: 'Stages run top to bottom. Expand a step to tune params, drag to reorder, then hit Run.',
    placement: 'right',
  },
  {
    id: 'workbench',
    target: 'workbench-input',
    title: 'Input',
    body: 'Paste ciphertext, logs, JWTs, PowerShell blobs, or MIME headers. Output updates as the recipe runs.',
    placement: 'left',
  },
  {
    id: 'output',
    target: 'decrypted-output',
    title: 'Output',
    body: 'Decoded result with flag highlighting. Edit the flag regex in the output header to match your event format.',
    placement: 'left',
  },
  {
    id: 'share',
    target: 'transmit-panel',
    title: 'Share',
    body: 'Export recipes as JSON or URL. Your pasted input never leaves the browser and is not included.',
    placement: 'bottom',
  },
  {
    id: 'sop',
    target: 'sop-guide',
    title: 'SOP guide',
    body: 'Full SOC + CTF playbook: workflows, specialized tools, examples, and shortcuts.',
    placement: 'bottom',
  },
  {
    id: 'help',
    target: 'tour-help',
    title: 'You are set',
    body: 'Press ? to replay this tour. Esc closes overlays. Use SOP for deep reference.',
    placement: 'bottom',
  },
]

const PAD = 12

function getRect(selector: string) {
  const el = document.querySelector(`[data-tour="${selector}"]`) as HTMLElement | null
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
    bottom: r.bottom + PAD,
    right: r.right + PAD,
    el,
  }
}

function TourDim({
  rect,
  onDismiss,
}: {
  rect: ReturnType<typeof getRect>
  onDismiss: () => void
}) {
  const shade = 'cb-tour-shade'

  if (!rect) {
    return (
      <button type="button" className={`${shade} fixed inset-0`} onClick={onDismiss} aria-label="Close tour" />
    )
  }

  const { top, left, width, height } = rect
  const bottom = top + height
  const right = left + width

  return (
    <>
      <button
        type="button"
        className={`${shade} fixed inset-x-0 top-0`}
        style={{ height: Math.max(0, top) }}
        onClick={onDismiss}
        aria-hidden
      />
      <button
        type="button"
        className={shade}
        style={{ top, left: 0, width: Math.max(0, left), height, position: 'fixed' }}
        onClick={onDismiss}
        aria-hidden
      />
      <button
        type="button"
        className={shade}
        style={{ top, left: right, right: 0, height, position: 'fixed' }}
        onClick={onDismiss}
        aria-hidden
      />
      <button
        type="button"
        className={shade}
        style={{ top: bottom, left: 0, right: 0, bottom: 0, position: 'fixed' }}
        onClick={onDismiss}
        aria-hidden
      />
      <div className="cb-tour-spotlight" style={{ top, left, width, height }} aria-hidden />
    </>
  )
}

function tooltipStyle(
  rect: ReturnType<typeof getRect>,
  placement: Step['placement'],
  tipW: number,
  tipH: number,
) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const gap = 16

  if (!rect) {
    return {
      top: Math.max(24, (vh - tipH) / 2),
      left: Math.max(16, (vw - tipW) / 2),
    }
  }

  const tryPlace = (p: Step['placement']) => {
    if (p === 'bottom') {
      return { top: rect.bottom + gap, left: rect.left + rect.width / 2 - tipW / 2 }
    }
    if (p === 'top') {
      return { top: rect.top - tipH - gap, left: rect.left + rect.width / 2 - tipW / 2 }
    }
    if (p === 'right') {
      return { top: rect.top + rect.height / 2 - tipH / 2, left: rect.right + gap }
    }
    return { top: rect.top + rect.height / 2 - tipH / 2, left: rect.left - tipW - gap }
  }

  let pos = tryPlace(placement)
  pos.left = Math.min(Math.max(12, pos.left), vw - tipW - 12)
  pos.top = Math.min(Math.max(12, pos.top), vh - tipH - 12)

  if (placement === 'bottom' && rect.bottom + tipH + gap > vh - 8) {
    pos = tryPlace('top')
    pos.left = Math.min(Math.max(12, pos.left), vw - tipW - 12)
    pos.top = Math.min(Math.max(12, pos.top), vh - tipH - 12)
  }
  if (placement === 'right' && rect.right + tipW + gap > vw - 8) {
    pos = tryPlace('left')
    pos.left = Math.min(Math.max(12, pos.left), vw - tipW - 12)
  }

  return pos
}

export function TourGuide({
  open,
  onClose,
  onOpenSop,
}: {
  open: boolean
  onClose: () => void
  onOpenSop?: () => void
}) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<ReturnType<typeof getRect>>(null)
  const [tipReady, setTipReady] = useState(false)
  const [bodyKey, setBodyKey] = useState(0)
  const tipRef = useRef<HTMLDivElement>(null)
  const [tipSize, setTipSize] = useState({ w: 360, h: 200 })
  const highlightedRef = useRef<Element | null>(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const clearHighlight = useCallback(() => {
    if (highlightedRef.current) {
      highlightedRef.current.classList.remove(TARGET_CLASS)
      highlightedRef.current = null
    }
  }, [])

  const measure = useCallback(() => {
    if (!open || !current) return
    clearHighlight()
    if (!current.target) {
      setRect(null)
      return
    }

    const r = getRect(current.target)
    setRect(r)
    if (r?.el) {
      r.el.classList.add(TARGET_CLASS)
      highlightedRef.current = r.el
      r.el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }, [open, current, clearHighlight])

  useLayoutEffect(() => {
    if (!open) {
      setTipReady(false)
      return undefined
    }

    setStep(0)
    setTipReady(false)
    const t = requestAnimationFrame(() => setTipReady(true))
    return () => cancelAnimationFrame(t)
  }, [open])

  useLayoutEffect(() => {
    if (!open) return undefined
    setBodyKey((k) => k + 1)
    setTipReady(false)

    const t0 = requestAnimationFrame(() => {
      measure()
      setTimeout(() => {
        if (tipRef.current) {
          const b = tipRef.current.getBoundingClientRect()
          setTipSize({ w: b.width, h: b.height })
        }
        setTipReady(true)
      }, 80)
    })

    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      cancelAnimationFrame(t0)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open, step, measure])

  useEffect(() => {
    if (!open) clearHighlight()
    return () => clearHighlight()
  }, [open, clearHighlight])

  function finish() {
    clearHighlight()
    try {
      localStorage.setItem(TOUR_KEY, '1')
    } catch {
      /* ignore */
    }
    onClose()
  }

  function next() {
    if (isLast) finish()
    else setStep((s) => s + 1)
  }

  function prev() {
    setStep((s) => Math.max(0, s - 1))
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        next()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step])

  if (!open || !current) return null

  const tipPos = tooltipStyle(rect, current.placement || 'bottom', tipSize.w, tipSize.h)

  return (
    <div className="cb-tour-root" role="dialog" aria-modal="true" aria-label="Portal tour">
      <TourDim rect={rect} onDismiss={finish} />

      <div
        ref={tipRef}
        className={`cb-tour-tooltip cb-terminal-chrome ${tipReady ? 'is-ready' : 'is-entering'}`}
        style={{ top: tipPos.top, left: tipPos.left }}
      >
        <div className="cb-tour-tooltip-header">
          <div className="flex min-w-0 items-center gap-2">
            <span className="cb-tour-step font-code">
              {String(step + 1).padStart(2, '0')}/{String(STEPS.length).padStart(2, '0')}
            </span>
            <h2 key={`title-${bodyKey}`} className="cb-tour-body-fade truncate text-sm font-bold text-white">
              {current.title}
            </h2>
          </div>
          <button type="button" onClick={finish} className="cb-tour-close" aria-label="Close tour">
            ×
          </button>
        </div>

        <div className="px-4 py-3">
          <p key={`body-${bodyKey}`} className="cb-tour-body-fade text-sm leading-relaxed text-[#9499b8]">
            {current.body}
          </p>
          <div className="cb-tour-progress mt-3" aria-hidden>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`cb-tour-progress-seg ${i === step ? 'is-active' : i < step ? 'is-done' : ''}`}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="cb-tour-tooltip-footer">
          <button type="button" onClick={finish} className="cb-tour-skip font-code">
            Skip
          </button>
          <div className="flex flex-wrap gap-2">
            {current.id === 'sop' && onOpenSop ? (
              <button
                type="button"
                onClick={() => {
                  onOpenSop()
                  finish()
                }}
                className="cb-btn cb-btn-ghost !px-3 !py-1.5 !text-[11px]"
              >
                Open SOP
              </button>
            ) : null}
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="cb-btn cb-btn-ghost !px-3 !py-1.5 !text-[11px] disabled:opacity-40"
            >
              Back
            </button>
            <button type="button" onClick={next} className="cb-btn cb-btn-primary !px-4 !py-1.5 !text-[11px]">
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function shouldAutoShowTour(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) !== '1'
  } catch {
    return true
  }
}
