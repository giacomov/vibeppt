# Commands

## Development

### `npm run dev`

Start the Vite development server with hot module reload.

```bash
npm run dev
```

Open the URL printed in the terminal (typically `http://localhost:5173`). The deck picker dashboard loads automatically. Any change to a presentation file or template reloads the affected slide instantly.

### `npm run build`

Compile TypeScript and produce an optimized production bundle in `dist/`.

```bash
npm run build
```

Run this and fix all errors before considering work done. TypeScript errors that slip past the editor will surface here.

### `npm run preview`

Serve the production bundle locally for a final sanity check before deployment.

```bash
npm run preview
```

Requires a successful `npm run build` first.

## Type-Checking

To type-check a single file without a full build (faster feedback loop):

```bash
npx tsc --noEmit presentations/<deck>/<file>.tsx
```

## Export

Export slides to PNG images or a PDF. Requires the dev server to be running (or use a separate terminal).

### Basic usage

```bash
npm run export -- --deck=<name> --format=<format>
```

`<name>` is the folder name under `presentations/`. `<format>` is one of `png`, `pdf`, or `both`.

### Examples

```bash
# Export all slides as PNGs
npm run export -- --deck=my-deck --format=png

# Export all slides as a single PDF
npm run export -- --deck=my-deck --format=pdf

# Export both PNG and PDF
npm run export -- --deck=my-deck --format=both

# Export only slide 3
npm run export -- --deck=my-deck --format=png --slides=3

# Export slides 1, 4, and 7
npm run export -- --deck=my-deck --format=png --slides=1,4,7

# Export slides 2 through 5
npm run export -- --deck=my-deck --format=png --slides=2-5

# Mixed ranges: individual slides and a range
npm run export -- --deck=my-deck --format=png --slides=1,3-5,8
```

### Output

- PNGs are written to `exports/<name>/slide-001.png`, `slide-002.png`, etc.
- The PDF is written to `exports/<name>/slides.pdf`.

### How it works

The exporter launches a headless Playwright browser, navigates to each slide (appending `?export=1` to the URL), fast-forwards all JS timers, snaps CSS/Web Animations to their final state, and takes a screenshot. Use the exported PNGs to verify that every slide looks correct — overflow, missing content, and layout issues are easiest to catch this way.
