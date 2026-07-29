/** Tiny helpers for clipboard + file downloads. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export function downloadTextFile(filename: string, contents: string, mime = 'text/plain') {
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Defer revocation so browsers (Firefox) have time to start the download
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function openSopInNewTab() {
  const base = import.meta.env.BASE_URL || '/'
  const url = new URL('sop.html', window.location.origin + base)
  window.open(url.toString(), '_blank', 'noopener,noreferrer')
}
