/** Max input size for XOR brute-force and brute-force decode chains (main-thread DoS guard). */
export const BRUTE_FORCE_MAX_INPUT_CHARS = 500 * 1024

export function bruteForceInputTooLarge(length: number): string | undefined {
  if (length <= BRUTE_FORCE_MAX_INPUT_CHARS) return undefined
  const maxKb = Math.round(BRUTE_FORCE_MAX_INPUT_CHARS / 1024)
  return `Input is too large for automatic brute-force (${length} characters; max ${maxKb} KB). Trim the sample or decode manually in smaller chunks.`
}
