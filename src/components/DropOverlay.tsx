import { useEffect, useRef, useState } from "react";

/**
 * Tracks a file drag anywhere over the window and reports the dropped files.
 * Returns whether a full area overlay should show.
 */
export function useWindowFileDrop(onFiles: (files: FileList | File[]) => void, enabled = true) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const cb = useRef(onFiles);
  cb.current = onFiles;

  useEffect(() => {
    if (!enabled) return;
    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current += 1;
      setDragging(true);
    };
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      const files = e.dataTransfer?.files;
      if (files && files.length) cb.current(files);
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [enabled]);

  return dragging;
}

/** Decorative full viewport overlay shown while a file is dragged over the page. */
export function DropOverlay({ visible, accent = "#e5322d" }: { visible: boolean; accent?: string }) {
  if (!visible) return null;
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[60] grid place-items-center bg-white/70 backdrop-blur-md"
    >
      <div
        className="m-6 grid h-[calc(100%-3rem)] w-[calc(100%-3rem)] place-items-center"
        style={{ border: `2px dashed ${accent}`, borderRadius: "20px" }}
      >
        <p className="text-[22px] font-extrabold sm:text-[28px]" style={{ color: accent }}>
          Drop your files here
        </p>
      </div>
    </div>
  );
}

export default DropOverlay;
