# Image tools test suite

Headless regression suite for the image-tools silo only. These tests run
under Bun's built-in test runner and MUST NOT import any PDF module.

Run:

```
bun test tests/image-tools
```

Scope:
- `src/lib/imageSafety.ts` (bomb guard, SVG guard, ZIP name safety, dedupe)
- `src/lib/imageMath.ts` (compressor math: saved %, keep-original decision,
  target-KB clamp, extension/mime helpers)

Pixel-fidelity, browser-matrix, and mobile checks are documented in the
Level 3 QA report and executed manually against the running preview; they
require a real browser (canvas, `createImageBitmap`, `heic2any`).
