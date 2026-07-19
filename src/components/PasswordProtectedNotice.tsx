import { Lock } from "lucide-react";

export function PasswordProtectedNotice({
  onReset,
  fileName,
}: {
  onReset: () => void;
  fileName?: string;
}) {
  return (
    <div
      className="mt-6 flex flex-col items-center gap-4 rounded-2xl px-6 py-10 text-center"
      style={{
        backgroundColor: "#fffaf9",
        border: "1px solid #f0c9c7",
      }}
    >
      <div
        className="grid h-14 w-14 place-items-center rounded-2xl text-white"
        style={{
          backgroundImage: "linear-gradient(135deg, #ff5a5f, #e5322d)",
          boxShadow: "0 14px 28px -10px rgba(229,50,45,0.5)",
        }}
      >
        <Lock className="h-6 w-6" />
      </div>
      <div className="max-w-md">
        <p className="text-[16px] font-bold" style={{ color: "#33333c" }}>
          {fileName ? `"${fileName}" is password-protected` : "This PDF is password-protected"}
        </p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "#5a5a66" }}>
          Please remove the password first (e.g. using a PDF unlocking tool) before using this
          feature, or upload an unprotected version.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center rounded-lg px-6 py-2.5 text-sm font-bold uppercase text-white transition-colors hover:bg-[#c72620]"
        style={{ backgroundColor: "#e5322d", letterSpacing: "0.04em" }}
      >
        Try a different file
      </button>
    </div>
  );
}
