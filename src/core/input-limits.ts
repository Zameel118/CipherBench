/** Max input size for XOR brute-force and brute-force decode chains (main-thread DoS guard). */
export const BRUTE_FORCE_MAX_INPUT_CHARS = 500 * 1024

/** Max file size for drag-and-drop / file button ingest (10 MB). */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export function bruteForceInputTooLarge(length: number): string | undefined {
  if (length <= BRUTE_FORCE_MAX_INPUT_CHARS) return undefined
  const maxKb = Math.round(BRUTE_FORCE_MAX_INPUT_CHARS / 1024)
  return `Input is too large for automatic brute-force (${length} characters; max ${maxKb} KB). Trim the sample or decode manually in smaller chunks.`
}

export function fileTooLarge(sizeBytes: number): string | undefined {
  if (sizeBytes <= MAX_FILE_SIZE_BYTES) return undefined
  const maxMb = Math.round(MAX_FILE_SIZE_BYTES / 1024 / 1024)
  return `File is too large (${(sizeBytes / 1024 / 1024).toFixed(1)} MB, max ${maxMb} MB). Use a smaller sample.`
}
