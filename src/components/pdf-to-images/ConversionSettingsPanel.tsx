import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  PDF_TO_IMAGES_DPI,
  PDF_TO_IMAGES_QUALITY,
  type PdfToImagesDpi,
  type PdfToImagesFormat,
  type PdfToImagesQuality,
} from "@/lib/pdfToImages";

export interface ConversionSettingsValue {
  readonly dpi: PdfToImagesDpi;
  readonly format: PdfToImagesFormat;
  readonly quality: PdfToImagesQuality;
  readonly pages: string;
}

export interface ConversionSettingsPanelProps {
  value: ConversionSettingsValue;
  onChange: (next: Partial<ConversionSettingsValue>) => void;
  /** Validation message for the page range, shown live under the input. */
  pagesError?: string;
}

const DPI_HINTS: Record<number, string> = {
  72: "Screen",
  150: "Balanced",
  300: "Print",
  600: "Archive",
};

/** Settings card: resolution, output format and page range, with live range validation. */
export function ConversionSettingsPanel({
  value,
  onChange,
  pagesError,
}: ConversionSettingsPanelProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(20,20,43,0.4)] sm:p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <h3 className="text-[17px] font-bold text-neutral-800 dark:text-neutral-100">
        Conversion settings
      </h3>

      {/* Resolution */}
      <div className="mt-5">
        <Label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300">
          Resolution (DPI)
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PDF_TO_IMAGES_DPI.map((dpi) => {
            const selected = value.dpi === dpi;
            return (
              <button
                key={dpi}
                type="button"
                onClick={() => onChange({ dpi })}
                aria-pressed={selected}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
                  selected
                    ? "border-[#e5322d] bg-[#fff6f5] shadow-[0_8px_20px_-14px_rgba(229,50,45,0.7)] dark:bg-neutral-800"
                    : "border-neutral-200 hover:border-[#f0a19e] dark:border-neutral-700",
                )}
              >
                <span className="flex items-center justify-between text-[15px] font-bold text-neutral-800 dark:text-neutral-100">
                  {dpi}
                  {selected && <Check className="h-3.5 w-3.5 text-[#e5322d]" aria-hidden />}
                </span>
                <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
                  {DPI_HINTS[dpi]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Format */}
      <div className="mt-5">
        <Label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300">
          Image format
        </Label>
        <div className="mt-2 inline-flex rounded-xl border border-neutral-200 p-1 dark:border-neutral-700">
          {(["png", "jpg", "webp"] as const).map((format) => {
            const selected = value.format === format;
            return (
              <button
                key={format}
                type="button"
                onClick={() => onChange({ format })}
                aria-pressed={selected}
                className={cn(
                  "rounded-lg px-5 py-2 text-[14px] font-bold transition-colors duration-150",
                  selected
                    ? "bg-[#e5322d] text-white"
                    : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400",
                )}
              >
                {format.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* JPEG quality only matters for JPG */}
      {value.format === "jpg" && (
        <div className="mt-5 animate-fade-in">
          <Label className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300">
            JPG quality
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PDF_TO_IMAGES_QUALITY.map((quality) => (
              <button
                key={quality}
                type="button"
                onClick={() => onChange({ quality })}
                aria-pressed={value.quality === quality}
                className={cn(
                  "rounded-lg border px-4 py-2 text-[14px] font-semibold transition-colors duration-150",
                  value.quality === quality
                    ? "border-[#e5322d] bg-[#fff6f5] text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
                    : "border-neutral-200 text-neutral-500 hover:border-[#f0a19e] dark:border-neutral-700 dark:text-neutral-400",
                )}
              >
                {quality}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page range */}
      <div className="mt-5">
        <Label
          htmlFor="p2i-pages"
          className="text-[13px] font-semibold text-neutral-600 dark:text-neutral-300"
        >
          Page range
        </Label>
        <input
          id="p2i-pages"
          value={value.pages}
          onChange={(e) => onChange({ pages: e.target.value })}
          placeholder="All pages"
          aria-invalid={pagesError !== undefined}
          className={cn(
            "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-[15px] outline-none transition-colors duration-150 dark:bg-neutral-900 dark:text-neutral-100",
            pagesError
              ? "border-[#e5322d]"
              : "border-neutral-200 focus:border-[#e5322d] dark:border-neutral-700",
          )}
        />
        {pagesError ? (
          <p className="mt-2 text-[13px] font-semibold text-[#e5322d]">{pagesError}</p>
        ) : (
          <p className="mt-2 text-[13px] text-neutral-500 dark:text-neutral-400">
            Leave empty for all pages. Examples: 1, 1-5, 2,4,7 or 1-3,8-10.
          </p>
        )}
      </div>
    </div>
  );
}

export default ConversionSettingsPanel;
