import { createFileRoute, Link } from "@tanstack/react-router";
import { tools, type ToolCategory } from "@/tools/registry";
import { SITE_URL } from "@/lib/site";

const TITLE = "All PDF Tools: Organize, Convert, Edit, Secure | PDFToolConverter";
const DESCRIPTION =
  "Browse every free PDF tool by category: merge, split and compress, convert to and from PDF, edit pages, fill and sign forms, and protect or unlock files.";

const GROUPS: { title: string; intro: string; categories: ToolCategory[] }[] = [
  { title: "Organize PDF", intro: "Combine, split, shrink and rearrange pages.", categories: ["Organize PDF"] },
  { title: "Convert PDF", intro: "Turn PDFs into images, text or Word, and images or text into PDF.", categories: ["Convert PDF"] },
  { title: "Edit PDF", intro: "Add page numbers, watermarks and notes, crop pages, fill forms, sign and compare.", categories: ["Edit PDF", "Forms & Compare"] },
  { title: "Secure PDF", intro: "Add or remove a password and black out private details.", categories: ["Security"] },
];

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/tools` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/tools` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "PDF Tools", item: `${SITE_URL}/tools` },
          ],
        }),
      },
    ],
  }),
  component: ToolsHub,
});

function ToolsHub() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link> <span aria-hidden="true">›</span> PDF Tools
      </nav>
      <h1 className="mt-4">All PDF Tools</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Every PDF tool on the site, grouped by what it does. Most run in your browser; PDF to Word sends your file
        to our conversion server. Looking for photo tools? See the{" "}
        <Link to="/image-tools" className="font-semibold text-primary hover:underline">image tools</Link>.
      </p>
      {GROUPS.map((g) => {
        const list = tools.filter((t) => g.categories.includes(t.category));
        return (
          <section key={g.title} className="mt-10">
            <h2>{g.title}</h2>
            <p className="mt-1 text-muted-foreground">{g.intro}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => (
                <li key={t.slug}>
                  <Link
                    to="/tools/$slug"
                    params={{ slug: t.slug }}
                    className="block h-full rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
                  >
                    <h3 className="text-foreground">{t.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
