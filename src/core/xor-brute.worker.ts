/// <reference lib="webworker" />

interface XorBruteRequest {
  type: 'xor-brute'
  text: string
}

interface XorBruteResponse {
  type: 'xor-brute'
  lines: string[]
}

function printableRatio(text: string): number {
  if (text.length === 0) return 0
  let printable = 0
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if ((code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13) printable++
  }
  return printable / text.length
}

function xorWithKey(text: string, key: number): string {
  let out = ''
  const chunk = 8192
  for (let i = 0; i < text.length; i += chunk) {
    let part = ''
    const end = Math.min(i + chunk, text.length)
    for (let j = i; j < end; j++) {
      part += String.fromCharCode(text.charCodeAt(j) ^ key)
    }
    out += part
  }
  return out
}

self.onmessage = (event: MessageEvent<XorBruteRequest>) => {
  if (event.data.type !== 'xor-brute') return
  const { text } = event.data
  const candidates: { key: number; text: string; score: number }[] = []
  for (let k = 0; k < 256; k++) {
    const decoded = xorWithKey(text, k)
    candidates.push({ key: k, text: decoded, score: printableRatio(decoded) })
  }
  candidates.sort((a, b) => b.score - a.score || a.key - b.key)
  const lines = candidates.map(
    (c) =>
      `key 0x${c.key.toString(16).padStart(2, '0')} (${c.key}) score ${c.score.toFixed(3)}: ${c.text}`,
  )
  const response: XorBruteResponse = { type: 'xor-brute', lines }
  self.postMessage(response)
}
