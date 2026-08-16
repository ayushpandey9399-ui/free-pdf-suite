import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";

export const Route = createFileRoute("/image-tools")({
  component: ImageToolsRedirect,
});

function ImageToolsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.navigate({ to: "/", hash: "tools", replace: true });
  }, [router]);

  return null;
}
