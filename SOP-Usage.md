# CipherBench SOP (SOC + CTF Workflow)

## 1) What CipherBench is
CipherBench is a client-side CTF/SOC encode/decode workbench that helps you:

- Build an ordered transformation recipe ("Ops chain")
- Decode/encode common artifacts (Base64, Hex, URLs, JWT, PowerShell -EncodedCommand)
- Hunt flags using a configurable flag regex
- Extract SOC indicators of compromise (IOCs) and safely share defanged artifacts
- Export/import recipes without including sensitive input text

All processing happens in your browser (no upload by default).

## 2) Safety and trust

- CipherBench is designed to be fully client-side so pasted data is not sent to a backend.
- Avoid using extremely complex user-provided regex patterns. CipherBench validates flag regex patterns to reduce catastrophic backtracking risk.

## 3) UI tour (what each region does)

### Left rail (navigation)
- **Portal**: focuses your **Intel ingest** input (Raw signal)
- **Ops chain**: scrolls to the Ops chain section
- **Arsenal**: scrolls to the operation library/search
- **Transmit**: scrolls to export/import sharing

### Command header
- **SOP guide**: full workflow and SOC/CTF tool reference (this document)
- **Run chain** (Ctrl+Enter): executes the armed Ops chain in order
- **Tour (?)** (also press `?`): interactive guided walkthrough

### Intel ingest (input)
- Paste raw data in any supported format (strings, encoded payloads, headers, blobs).
- **Magic suggestions** may propose likely next operations based on heuristic detection.

### Arsenal (operation search + arm)
- Use the search box to find operations by name/id/category/description.
- Add operations to your recipe by clicking the operation cards.
- Operations are configured with parameters inside the chain stages when needed.

### Ops chain (recipe stages)
- Each stage represents one operation + its params.
- Stages execute sequentially: output of step N becomes input of step N+1.

### Decrypted output (result + flag highlight)
- Shows the last successful stage output.
- Flag matching is highlighted using the current **Flag** regex pattern.

### Transmit (share)
- **Copy JSON**: share the recipe definition (operation ids + params only).
- **Copy portal link**: share via URL query (again, input text is excluded).
- **Import**: paste a recipe JSON to recreate the chain.

## 4) Quick-start SOP (recommended order)

1. **Paste input** into **Intel ingest**.
2. **Arm operations** from **Arsenal**
   - Search operations, add them to your recipe stages in the order you want.
3. **Tune parameters** (if required)
   - Examples: Base64 alphabet, XOR key/mode, JWT secret for HMAC verification.
4. **Run chain**
   - Press **Ctrl+Enter**.
5. **Verify output**
   - If you are hunting flags, adjust the **Flag** regex and re-run.
6. **Share recipe** (optional)
   - Use Transmit to export/import a recipe without sharing sensitive input.

## 5) Specialized tools - CTF

### CTF: Flag Detector (Find Flags)
Purpose:
- Extract likely `FLAG{...}`-style substrings from the current output.

When to use:
- After decoding steps when you expect flags to appear in plaintext.

How to use effectively:
- Ensure the chain produces text that contains the flags.
- Tune the **Flag** regex if your target flag format differs.

### CTF: Brute-Force Decode Chains (Brute-Force Chain)
Purpose:
- Try common decode chains automatically and rank outputs by flag-likeness.

Typical workflow:
- Paste an encoded blob (often Base64).
- Run Brute-Force Chain.
- Copy the best hit and optionally refine with manual stages.

Tips:
- If no hits appear, try:
  - different input cleanup (trim spaces, remove surrounding text)
  - adding explicit decode stages before brute force

## 6) Specialized tools - SOC

### SOC: Defang / Refang
Purpose:
- Convert URLs/hosts into a safe defanged form (for sharing) and restore them later.

When to use:
- Reporting: transform `http(s)://domain/...` into defanged representations.
- Incident review: refang back to original forms when needed.

Workflow:
- Use **Defang** to sanitize for communication.
- Use **Refang** to restore for internal analysis.

### SOC: PowerShell -EncodedCommand (Decode/Encode)
Purpose:
- Decode or encode PowerShell -EncodedCommand payloads (UTF-16LE + Base64).

When to use:
- You'll often see an encoded blob in process command lines or scripts.

Workflow:
- Choose decode direction to recover the underlying script.
- Use encode direction if you need to build an -EncodedCommand blob again.

### SOC: JWT Decode (with optional HMAC verification)
Purpose:
- Decode JWT header/payload (base64url).
- Optionally verify HMAC signatures for HS256/HS384/HS512 using a secret you supply.

When to use:
- Triage suspicious tokens in logs, headers, or artifacts.

Workflow:
1. Paste the JWT.
2. Leave secret blank for decode/display-only.
3. Provide secret to verify HMAC validity.

### SOC: IOC Extractor
Purpose:
- Extract and sectionize common IOCs from unstructured text:
  - emails
  - IPv4
  - URLs
  - hashes (MD5/SHA256; and related patterns depending on operation logic)

When to use:
- Incident notes, ticket text, memory strings, log excerpts.

Workflow:
- Paste the blob.
- Run IOC Extractor.
- Review output sections; duplicates are collapsed.

### SOC: MIME Encoded-Word Decode
Purpose:
- Decode RFC 2047 encoded-words in email headers:
  - `=?UTF-8?B?...?=`
  - `=?UTF-8?Q?...?=`

When to use:
- Subjects/from fields that include encoded display names.

Workflow:
- Paste the header line.
- Run MIME Encoded-Word Decode to recover readable text.

## 7) Examples (copy/paste scenarios)

### Example A (CTF): Base64 -> find a flag
1. Paste: `SGVsbG8gQ2lwaGVyQmVuY2g=`
2. Add: Base64 decode
3. Add: Find Flags (if your decoded output includes flags)
4. Run chain

### Example B (CTF): XOR brute-force single-byte
1. First create a ciphertext (or paste a known one)
2. Add XOR Cipher
3. Enable brute-force single-byte mode
4. Run chain
5. Look for a ranked output line that matches your expected flag format

### Example C (SOC): PowerShell -EncodedCommand decode
1. Paste the -EncodedCommand blob (Base64)
2. Run PowerShell -EncodedCommand decode
3. Use the recovered script to identify additional payloads, URLs, or embedded commands

### Example D (SOC): JWT decode + verify (HS256)
1. Paste JWT
2. Provide the HMAC secret (if available)
3. Run JWT Decode
4. Confirm whether the HMAC verification is VALID or INVALID

### Example E (SOC): IOC extraction from text
1. Paste a text blob containing mixed indicators
2. Run IOC Extractor
3. Review sections (Emails, IPv4, URLs, hashes)

## 8) Shortcuts

- `Ctrl/Cmd+Enter`: run current recipe
- `Ctrl/Cmd+K`: focus operation search
- `?`: open Tour guide (unless focus is inside an input/control)
- `Esc`: dismiss the Tour guide or SOP panel
- Tour navigation: `ArrowLeft`/`ArrowRight` and `Enter`

## 9) Troubleshooting

- Output looks wrong or empty:
  - verify your stage order
  - confirm operation parameters (alphabet, XOR key/mode, JWT secret, etc.)
- Flag regex compile error:
  - lower complexity of the regex
  - use the default `FLAG{...}`-style pattern and adjust gradually
- Recipe import issues:
  - ensure recipe JSON matches the operation ids registered in this build
