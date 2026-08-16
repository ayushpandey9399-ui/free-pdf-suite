import { createFileRoute, redirect } from "@tanstack/react-router";

// /tools is a breadcrumb-only destination: send visitors to the tools grid
// on the homepage.
export const Route = createFileRoute("/tools/")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "tools", replace: true });
  },
});
