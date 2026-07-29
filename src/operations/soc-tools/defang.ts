import type { Operation } from '../../core/types'

function defangText(text: string): string {
  let out = text
  out = out.replace(/https:\/\//gi, 'hxxps://')
  out = out.replace(/http:\/\//gi, 'hxxp://')
  // Bracket dots in IPv4 and hostname-like tokens (avoid rewriting decimals in prose when possible).
  out = out.replace(
    /\b((?:\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)+)\b/g,
    (host) => host.replace(/\./g, '[.]'),
  )
  return out
}

function refangText(text: string): string {
  let out = text
  out = out.replace(/hxxps:\/\//gi, 'https://')
  out = out.replace(/hxxp:\/\//gi, 'http://')
  out = out.replace(/\[\.\]/g, '.')
  out = out.replace(/\[@\]/g, '@')
  return out
}

export const defangRefang: Operation = {
  id: 'defang-refang',
  name: 'Defang / Refang',
  category: 'SOC Tools',
  description:
    'Defang or refang URLs and hostnames (hxxp(s)://, [.], [@]) for safe sharing or IOC restoration.',
  params: [
    {
      name: 'mode',
      type: 'select',
      default: 'defang',
      options: ['defang', 'refang'],
    },
  ],
  run: (input, params) => {
    if (input.data.length === 0) {
      return { data: '', type: 'string' }
    }
    const mode = String(params.mode ?? 'defang')
    if (mode === 'refang') {
      return { data: refangText(input.data), type: 'string' }
    }
    return { data: defangText(input.data), type: 'string' }
  },
}

export { defangText, refangText }
