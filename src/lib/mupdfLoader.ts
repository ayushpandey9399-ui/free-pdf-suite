// Lazy loader for mupdf. Keeps the ~14MB WASM out of the initial bundle.
let modPromise: Promise<typeof import("mupdf")> | null = null;
export function loadMupdf(): Promise<typeof import("mupdf")> {
  if (!modPromise) modPromise = import("mupdf");
  return modPromise;
}
