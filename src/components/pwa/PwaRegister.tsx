import { useEffect } from "react";
import { toast } from "sonner";
import { registerServiceWorker } from "@/lib/pwa/registerSW";
import { installGlobalBridge } from "@/lib/pwa/installEvents";

export function PwaRegister() {
  useEffect(() => {
    installGlobalBridge();

    let cancelled = false;
    const kickoff = () => {
      if (cancelled) return;
      registerServiceWorker((activate) => {
        toast("A new version is available", {
          description: "Refresh to load the latest pdftoolconverteronline.com.",
          duration: Infinity,
          action: {
            label: "Refresh",
            onClick: () => activate(),
          },
        });
      });
    };

    if (document.readyState === "complete") {
      kickoff();
    } else {
      window.addEventListener("load", kickoff, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", kickoff);
    };
  }, []);

  return null;
}
