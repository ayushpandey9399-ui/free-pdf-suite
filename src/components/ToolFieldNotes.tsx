import { TOOL_FIELD_NOTES } from "@/content/toolFieldNotes";

/**
 * Architecture Notes
 * WHY this exists: renders the tested, tool-specific notes for a page (see
 * src/content/toolFieldNotes.ts) in the server HTML, directly below the tool
 * and above the long help article, so visitors and crawlers see accurate facts
 * about this tool first. It renders nothing for slugs without notes, so routes
 * can mount it unconditionally. The screenshot is below the fold, so it is
 * lazy-loaded with fixed dimensions to avoid layout shift.
 */
export function ToolFieldNotes({ slug }: { slug: string }) {
  const note = TOOL_FIELD_NOTES[slug];
  if (!note) return null;
  const id = `field-notes-${slug}`;

  return (
    <section aria-labelledby={id} className="seo-content mx-auto max-w-4xl px-4 pt-14 pb-4">
      <h2 id={id}>{note.heading}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{note.intro}</p>

      {note.shot ? (
        <figure className="mt-6">
          <img
            src={note.shot.src}
            width={note.shot.width}
            height={note.shot.height}
            alt={note.shot.alt}
            loading="lazy"
            decoding="async"
            className="h-auto w-full rounded-xl border border-border bg-muted"
          />
          <figcaption className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{note.shot.caption}</figcaption>
        </figure>
      ) : null}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3>What happens to your file</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground">
            {note.whatHappens.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Limits to know about</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground">
            {note.limits.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="mt-8">Messages you might see</h3>
      <dl className="mt-3 divide-y divide-border rounded-xl border border-border">
        {note.errors.map((e) => (
          <div key={e.message} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4">
            <dt className="text-[14px] font-semibold text-foreground">{e.message}</dt>
            <dd className="text-[14px] leading-relaxed text-muted-foreground">{e.meaning}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-8">How to check the result</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground">
        {note.check.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>

      <p className="mt-6 text-[12px] text-muted-foreground">
        Checked against the tool with sample files on {note.testedOn}.
      </p>
    </section>
  );
}
