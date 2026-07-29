import type { Operation } from '../../core/types'

export interface ExtractedIocs {
  ipv4: string[]
  domains: string[]
  urls: string[]
  md5: string[]
  sha1: string[]
  sha256: string[]
  emails: string[]
}

const RE = {
  ipv4: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
  url: /\bhttps?:\/\/[^\s<>"'`,;)]+/gi,
  email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
  md5: /\b[a-fA-F0-9]{32}\b/g,
  sha1: /\b[a-fA-F0-9]{40}\b/g,
  sha256: /\b[a-fA-F0-9]{64}\b/g,
  domain:
    /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:[a-zA-Z]{2,})\b/g,
}

function uniqueSorted(matches: Iterable<string>): string[] {
  return [...new Set(matches)].sort((a, b) => a.localeCompare(b))
}

function extractFromText(text: string): ExtractedIocs {
  const urls = uniqueSorted(text.match(RE.url) ?? [])
  const emails = uniqueSorted(text.match(RE.email) ?? [])
  const ipv4 = uniqueSorted(text.match(RE.ipv4) ?? [])
  const md5 = uniqueSorted(text.match(RE.md5) ?? [])
  const sha1 = uniqueSorted(text.match(RE.sha1) ?? [])
  const sha256 = uniqueSorted(text.match(RE.sha256) ?? [])

  const urlHosts = new Set<string>()
  for (const u of urls) {
    try {
      urlHosts.add(new URL(u).hostname.toLowerCase())
    } catch {
      // ignore malformed URL matches
    }
  }

  const domains = uniqueSorted(
    (text.match(RE.domain) ?? []).filter((d) => {
      const lower = d.toLowerCase()
      if (emails.some((e) => e.toLowerCase().endsWith(`@${lower}`))) {
        return false
      }
      if (urlHosts.has(lower)) return true
      // Keep standalone domains not already covered as URL hostnames.
      return !urls.some((u) => u.toLowerCase().includes(lower))
    }),
  )

  return { ipv4, domains, urls, md5, sha1, sha256, emails }
}

function formatIocs(iocs: ExtractedIocs): string {
  const sections: string[] = []
  const push = (label: string, items: string[]) => {
    sections.push(`## ${label} (${items.length})`)
    sections.push(items.length ? items.join('\n') : '(none)')
    sections.push('')
  }

  push('IPv4', iocs.ipv4)
  push('Domains', iocs.domains)
  push('URLs', iocs.urls)
  push('MD5', iocs.md5)
  push('SHA1', iocs.sha1)
  push('SHA256', iocs.sha256)
  push('Emails', iocs.emails)

  return sections.join('\n').trimEnd()
}

export const iocExtract: Operation = {
  id: 'ioc-extract',
  name: 'IOC Extractor',
  category: 'SOC Tools',
  description:
    'Extract IPv4, domains, URLs, file hashes (MD5/SHA1/SHA256), and email addresses from unstructured text.',
  params: [],
  run: (input) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    const iocs = extractFromText(input.data)
    return { data: formatIocs(iocs), type: 'string' }
  },
}

export { extractFromText, formatIocs }
