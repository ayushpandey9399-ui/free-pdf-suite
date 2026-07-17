import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { ClientOnly } from "@/components/ClientOnly";
import { getTool } from "@/tools/registry";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { name: tool.name, description: tool.description };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — PDFFree` },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: `${loaderData.name} — PDFFree` },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Tool — PDFFree" }],
  }),
  component: ToolPage,
});

function ToolPage() {
  const { slug } = Route.useParams();
  const tool = getTool(slug);
  if (!tool) return null;
  const Comp = tool.Component;

  const fallback = (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading tool…
    </div>
  );

  return (
    <ToolLayout title={tool.name} description={tool.description}>
      <ClientOnly fallback={fallback}>
        <Suspense fallback={fallback}>
          <Comp />
        </Suspense>
      </ClientOnly>
    </ToolLayout>
  );
}
