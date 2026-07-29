# CipherBench

CipherBench is a browser-based, client-side encode/decode workbench for CTF players and SOC analysts. It is inspired by CyberChef's workflow, but scoped toward fast recipe building, flag hunting, incident-response decoding tasks, and explainable transformations you can follow step by step.

## Why This Project Exists

CipherBench is built for two overlapping workflows:

- CTF players who need to quickly chain decoders, brute-force simple transforms, and surface likely flag candidates.
- SOC analysts and incident responders who need to safely inspect suspicious strings, encoded PowerShell, JWTs, defanged indicators, and raw email artifacts.

The goal is depth over breadth: fewer operations than CyberChef, but cleaner architecture, more focused tooling, and enough test coverage to defend the design in a technical interview.

## Features

- Live three-pane workflow: `Input -> Recipe -> Output`
- Extensible operation registry with isolated transformation logic
- Heuristic Magic suggestions for likely next operations
- Flag highlighting with configurable regex
- Shareable recipes via JSON or URL query parameter
- CTF-focused brute-force chains
- SOC-focused tools for PowerShell, JWTs, IOCs, MIME headers, and defanging
- Dark mode with system preference support
- Keyboard shortcuts:
  - `Ctrl/Cmd+Enter` to run the current recipe
  - `Ctrl/Cmd+K` to focus operation search

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Zustand
- `crypto-js`
- `js-base64`
- `pako`
- Vitest

## Architecture

CipherBench is built around an `Operation` abstraction and a pure recipe engine.

### Operation Pattern

Each transformation is an operation with:

- metadata (`id`, `name`, `category`, `description`)
- parameter definitions
- a pure `run()` function
- optional detectability heuristics for Magic suggestions

Operations live under `src/operations/` and remain completely independent from React. That separation keeps transformation logic:

- easy to unit test
- easy to extend
- reusable by the recipe engine, UI, and future integrations

### Recipe Engine

`src/core/recipe-engine.ts` runs an ordered recipe:

1. Take input text
2. Execute operation 1
3. Feed its output into operation 2
4. Continue until the chain finishes or an operation returns an error

The engine is pure and UI-agnostic. React components never implement transformation logic themselves; they only orchestrate input, parameters, and rendering.

### State Management

Zustand stores:

- input text
- active recipe steps
- output text / errors
- operation library search state
- flag pattern
- theme preference

### Recipe Sharing

Recipes are serialized in `src/core/recipe-serializer.ts` as operation ids plus params only. Input data is intentionally excluded. Recipes can be:

- copied as JSON
- embedded into a URL query string
- loaded back into the app

## Security Rationale: Fully Client-Side, No Backend

CipherBench is intentionally fully client-side.

That matters because users may paste:

- suspicious JWTs
- malware delivery commands
- defanged indicators
- email headers
- captured challenge artifacts
- potentially sensitive internal logs

Keeping all processing in the browser means no server ever receives pasted data by default. That reduces exposure, removes backend storage concerns, and makes the tool easier to trust for quick analysis workflows.

This also aligns with the project constraint that CipherBench should act as a local workbench, not a hosted inspection pipeline.

## Current Operations

### Encoding

- To / From Base64
- To / From Hex
- URL Encode / Decode
- Text to Binary / Binary to Text
- Reverse
- Uppercase / Lowercase
- Trim Whitespace
- Normalize Whitespace

### Encryption / Crypto Helpers

- ROT13 / Caesar
- XOR (single-byte, repeating key, brute-force single-byte)
- MD5
- SHA-1
- SHA-256

### CTF Tools

- Find Flags
- Brute-Force Decode Chains

### SOC Tools

- Defang / Refang
- PowerShell `-EncodedCommand`
- JWT Decode
- IOC Extractor
- MIME Encoded-Word Decode

## Project Structure

```text
src/
  components/
  core/
  operations/
    encoding/
    encryption/
    hashing/
    ctf-tools/
    soc-tools/
  store/
tests/
  core/
  operations/
```

## Local Development

### Requirements

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Start the app

```bash
npm run dev
```

Open the local Vite URL shown in the terminal.

### Run tests

```bash
npm test
```

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Docker

Phase 5 adds local Docker preview:

### Production-style preview (static nginx)

Build and run:

```bash
docker compose up --build
```

Then open: `http://localhost:5173`

### Dev-mode hot reload (Vite inside the container)

Run:

```bash
docker compose -f docker-compose.dev.yml up
```

Then open: `http://localhost:5173`

In dev mode, the project directory is mounted into the container so changes hot-reload.

### Notes

- Everything stays client-side; containers serve static assets only in preview mode.
- If port `5173` is already in use on your host, choose another free port by editing the `docker-compose*.yml` mappings.

## Screenshots

Placeholder references for now:

- `docs/screenshots/light-home.png`
- `docs/screenshots/dark-home.png`
- `docs/screenshots/recipe-chain.png`
- `docs/screenshots/soc-tools.png`

## Testing

The project uses Vitest with focused tests for:

- core recipe execution
- operation heuristics
- recipe serialization
- each operation module

Every operation is expected to handle:

- normal input
- empty input
- malformed input
- unicode input where relevant

Errors should be surfaced through `OperationOutput.error`, not uncaught exceptions.

## Design Constraints

- No backend
- No `eval()` or `new Function()`
- No hand-rolled cryptographic primitives
- Operation logic stays free of React imports
- Extensibility should require only:
  1. add operation file
  2. register operation
  3. add tests

## Status

Implemented through Phase 4:

- core architecture
- MVP UI
- CTF helpers
- SOC helpers
- dark mode
- keyboard shortcuts
- responsive layout polish

Remaining planned work:

- Docker workflow
- deployment configuration for GitHub Pages
