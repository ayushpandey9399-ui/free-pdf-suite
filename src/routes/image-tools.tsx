import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for /image-tools/*. Must only render an Outlet so
// /image-tools/$slug and /image-tools/ can mount.
export const Route = createFileRoute("/image-tools")({
  component: () => <Outlet />,
});
