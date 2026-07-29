import { getOperation } from '../operations'
import type { Recipe } from './types'
import { downloadTextFile } from './export'

export function buildCaseReportMarkdown(opts: {
  input: string
  output: string
  recipe: Recipe
  flagPattern: string
  lastRunMs: number | null
  forkSnapshot?: string | null
}): string {
  const lines: string[] = []
  lines.push('# CipherBench Case Report')
  lines.push('')
  lines.push(`Generated: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('## Recipe')
  if (opts.recipe.length === 0) {
    lines.push('_No operations armed (passthrough)._')
  } else {
    opts.recipe.forEach((step, i) => {
      const name = getOperation(step.operationId)?.name ?? step.operationId
      const params = Object.keys(step.params).length
        ? ` \`${JSON.stringify(step.params)}\``
        : ''
      lines.push(`${i + 1}. **${name}** (\`${step.operationId}\`)${params}`)
    })
  }
  lines.push('')
  lines.push(`Flag pattern: \`${opts.flagPattern}\``)
  if (opts.lastRunMs !== null) lines.push(`Last run: ${opts.lastRunMs} ms`)
  lines.push('')
  lines.push('## Input')
  lines.push('```')
  lines.push(opts.input.slice(0, 50_000) || '(empty)')
  lines.push('```')
  lines.push('')
  lines.push('## Output')
  lines.push('```')
  lines.push(opts.output.slice(0, 50_000) || '(empty)')
  lines.push('```')
  if (opts.forkSnapshot != null) {
    lines.push('')
    lines.push('## Fork snapshot (diff baseline)')
    lines.push('```')
    lines.push(opts.forkSnapshot.slice(0, 50_000) || '(empty)')
    lines.push('```')
  }
  lines.push('')
  lines.push('---')
  lines.push('_Client-side report from CipherBench. Print this Markdown to PDF if needed._')
  return lines.join('\n')
}

export function downloadCaseReport(opts: Parameters<typeof buildCaseReportMarkdown>[0]) {
  const md = buildCaseReportMarkdown(opts)
  downloadTextFile(`cipherbench-report-${Date.now()}.md`, md, 'text/markdown')
}
