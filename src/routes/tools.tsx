import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /tools/*. It MUST only render an Outlet so child tool
// routes (/tools/$slug) can mount. The /tools landing behaviour lives in
// tools.index.tsx.
export const Route = createFileRoute("/tools")({
  component: () => <Outlet />,
});
