import { useEffect, useState } from "react";
import {
  getToolSuccessCount,
  installDismissed,
  iosHintSeen,
  markInstallDismissed,
  markIosHintSeen,
} from "@/lib/pwa/installEvents";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const SUCCESS_THRESHOLD = 2;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    nav.standalone === true
  );
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIos && isSafari;
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosVisible, setIosVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (!installDismissed() && getToolSuccessCount() >= SUCCESS_THRESHOLD) {
        setVisible(true);
      }
    };
    const onSuccess = () => {
      if (deferred && !installDismissed() && getToolSuccessCount() >= SUCCESS_THRESHOLD) {
        setVisible(true);
      }
    };
    const onInstalled = () => {
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("fph:tool-success", onSuccess as EventListener);
    window.addEventListener("appinstalled", onInstalled);

    // iOS: show one-time gentle hint after a small delay.
    if (isIosSafari() && !iosHintSeen()) {
      const timer = window.setTimeout(() => setIosVisible(true), 8000);
      return () => {
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("fph:tool-success", onSuccess as EventListener);
        window.removeEventListener("appinstalled", onInstalled);
        window.clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("fph:tool-success", onSuccess as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [deferred]);

  const onInstall = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* noop */
    } finally {
      setDeferred(null);
      setVisible(false);
      markInstallDismissed();
    }
  };

  const onDismiss = () => {
    setVisible(false);
    markInstallDismissed();
  };

  const onDismissIos = () => {
    setIosVisible(false);
    markIosHintSeen();
  };

  if (visible && deferred) {
    return (
      <div className="fixed bottom-4 right-4 z-[80] w-[calc(100vw-2rem)] max-w-sm rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <img
            src="/icons/icon-192.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-md"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#14142b]">Install pdftoolconverteronline.com</p>
            <p className="mt-0.5 text-xs leading-snug text-[#4b5563]">
              Add the app to your device for one-tap access, works offline for tools you have opened.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={onInstall}
                className="rounded-md bg-[#e5322d] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#c8271f]"
              >
                Install
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="rounded-md border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#14142b] transition hover:bg-[#f9fafb]"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (iosVisible) {
    return (
      <div className="fixed bottom-4 left-1/2 z-[80] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <img
            src="/icons/apple-touch-icon-180.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-md"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#14142b]">Add to Home Screen</p>
            <p className="mt-0.5 text-xs leading-snug text-[#4b5563]">
              Tap the Share icon, then choose Add to Home Screen to install pdftoolconverteronline.com.
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={onDismissIos}
                className="rounded-md border border-[#e5e7eb] bg-white px-3 py-1.5 text-xs font-semibold text-[#14142b] transition hover:bg-[#f9fafb]"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
