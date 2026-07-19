// Small event bus for install-prompt eligibility. Tools do not need to be
// modified: any code (including our observer in InstallPrompt) can bump the
// counter via `bumpToolSuccess()`.

const KEY_COUNT = "fph:tool-success-count";
const KEY_INSTALL_DISMISSED = "fph:install-dismissed";
const KEY_IOS_HINT_SEEN = "fph:ios-hint-seen";

export function bumpToolSuccess(): void {
  if (typeof window === "undefined") return;
  try {
    const n = Number(localStorage.getItem(KEY_COUNT) || "0") + 1;
    localStorage.setItem(KEY_COUNT, String(n));
    window.dispatchEvent(new CustomEvent("fph:tool-success", { detail: { count: n } }));
  } catch {
    /* noop */
  }
}

export function getToolSuccessCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(KEY_COUNT) || "0");
  } catch {
    return 0;
  }
}

export function installDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(KEY_INSTALL_DISMISSED) === "1";
  } catch {
    return false;
  }
}

export function markInstallDismissed(): void {
  try {
    localStorage.setItem(KEY_INSTALL_DISMISSED, "1");
  } catch {
    /* noop */
  }
}

export function iosHintSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(KEY_IOS_HINT_SEEN) === "1";
  } catch {
    return false;
  }
}

export function markIosHintSeen(): void {
  try {
    localStorage.setItem(KEY_IOS_HINT_SEEN, "1");
  } catch {
    /* noop */
  }
}

// Expose a global so tools (if ever wired up) can call it without an import.
declare global {
  interface Window {
    __fphToolSuccess?: () => void;
  }
}

export function installGlobalBridge(): void {
  if (typeof window === "undefined") return;
  window.__fphToolSuccess = bumpToolSuccess;
}
