// Per-tool suggested "Continue to…" tool slugs shown on the success screen.
// Slugs must exist in src/tools/registry.tsx.
export const TOOL_SUGGESTIONS: Record<string, string[]> = {
  merge:           ["compress", "split", "watermark", "page-numbers", "rotate", "crop"],
  compress:        ["merge", "split", "watermark", "page-numbers", "rotate", "crop"],
  split:           ["merge", "delete-pages", "extract-pages", "rotate", "reorder-pages", "pdf-to-images"],
  "delete-pages":  ["extract-pages", "split", "reorder-pages", "rotate", "merge", "page-numbers"],
  "extract-pages": ["delete-pages", "split", "merge", "reorder-pages", "rotate", "pdf-to-images"],
  "reorder-pages": ["rotate", "delete-pages", "extract-pages", "merge", "split", "page-numbers"],
  rotate:          ["reorder-pages", "crop", "page-numbers", "watermark", "split", "merge"],
  "images-to-pdf": ["merge", "pdf-to-images", "watermark", "page-numbers", "rotate", "crop"],
  "pdf-to-images": ["pdf-to-text", "images-to-pdf", "split", "extract-pages", "compare", "crop"],
  "pdf-to-text":   ["pdf-to-images", "compare", "extract-pages", "split", "merge", "fill-forms"],
  "page-numbers":  ["watermark", "crop", "merge", "rotate", "reorder-pages", "split"],
  watermark:       ["page-numbers", "crop", "merge", "rotate", "split", "images-to-pdf"],
  crop:            ["rotate", "watermark", "page-numbers", "merge", "split", "pdf-to-images"],
  "fill-forms":    ["sign-pdf", "pdf-to-text", "page-numbers", "watermark", "merge", "split"],
  "sign-pdf":      ["fill-forms", "page-numbers", "watermark", "merge", "compress", "split"],
  compare:         ["pdf-to-text", "merge", "split", "extract-pages", "delete-pages", "reorder-pages"],
  "protect-pdf":   ["unlock-pdf", "compress", "sign-pdf", "watermark", "merge", "page-numbers"],
  "unlock-pdf":    ["protect-pdf", "compress", "merge", "split", "sign-pdf", "watermark"],
};
