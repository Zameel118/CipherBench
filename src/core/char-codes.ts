/** Build a string from char codes without spreading huge arrays (avoids stack limits). */
const CHAR_CODE_CHUNK = 8192

export function stringFromCharCodes(codes: ArrayLike<number>): string {
  const len = codes.length
  if (len === 0) return ''
  let out = ''
  for (let i = 0; i < len; i += CHAR_CODE_CHUNK) {
    const end = Math.min(i + CHAR_CODE_CHUNK, len)
    let chunk = ''
    for (let j = i; j < end; j++) {
      chunk += String.fromCharCode(codes[j]!)
    }
    out += chunk
  }
  return out
}
