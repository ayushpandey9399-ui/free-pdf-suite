import { createFileRoute, notFound } from "@tanstack/react-router";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { ClientOnly } from "@/components/ClientOnly";
import { getTool, categoryTint } from "@/tools/registry";
import { MergePdfSeo, mergeFaqJsonLd, mergeHowToJsonLd, mergeSoftwareJsonLd } from "@/components/MergePdfSeo";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug, name: tool.name, description: tool.description };
  },
  head: ({ loaderData, params }) => {
    if (loaderData?.slug === "merge") {
      const title =
        "Merge PDF Online Free — Combine PDF Files Without Uploading | PDFfree";
      const desc =
        "Merge PDF online free — combine PDF files in your browser with no upload. Your files never leave your device. No signup, no watermark, no limits.";
      const url = "/tools/merge";
      return {
        meta: [
          { title },
          { name: "description", content: desc },
          { property: "og:title", content: title },
          { property: "og:description", content: desc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: url },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: title },
          { name: "twitter:description", content: desc },
        ],
        links: [{ rel: "canonical", href: url }],
        scripts: [
          {
            type: "application/ld+json",
            children: JSON.stringify(mergeFaqJsonLd),
          },
          {
            type: "application/ld+json",
            children: JSON.stringify(mergeSoftwareJsonLd),
          },
        ],
      };
    }
    return {
      meta: loaderData
        ? [
            { title: `${loaderData.name} — PDFfree` },
            { name: "description", content: loaderData.description },
            { property: "og:title", content: `${loaderData.name} — PDFfree` },
            { property: "og:description", content: loaderData.description },
            { property: "og:url", content: `/tools/${params.slug}` },
          ]
        : [{ title: "Tool — PDFfree" }],
      links: loaderData ? [{ rel: "canonical", href: `/tools/${params.slug}` }] : [],
    };
  },
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

  const isMerge = slug === "merge";

  return (
    <>
      <ToolLayout
        title={isMerge ? "Merge PDF Files Online — Free & 100% Private" : tool.name}
        description={tool.description}
        icon={tool.icon}
        tint={categoryTint[tool.category]}
      >
        <ClientOnly fallback={fallback}>
          <Suspense fallback={fallback}>
            <Comp />
          </Suspense>
        </ClientOnly>
      </ToolLayout>
      {isMerge && <MergePdfSeo />}
    </>
  );
}
