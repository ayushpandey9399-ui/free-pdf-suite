<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Every lazily loaded tool renders inside `ToolErrorBoundary` (tools.$slug and image-tools.$slug). Why: a tool crash must not replace the page heading and help article with the root error screen, which Google reads as a Soft 404.
- Search titles and descriptions for tool pages live in the per-slug map in `src/routes/tools.$slug.tsx` (and each image tool's SEO bundle). Why: one source per page keeps titles unique and avoids duplicate head tags.
- Tested, tool-specific notes (behavior, limits, error meanings, how to check, real screenshots) live in `src/content/toolFieldNotes.ts`, rendered by `ToolFieldNotes` above each tool's article. Why: one data source per tool, server-rendered, and must be updated whenever that tool's behavior changes so the page never contradicts the tool.
- Google Analytics loads only through `src/lib/consent.ts` after the visitor accepts in `CookieConsent`; never add a gtag script to the root head. Why: consent must come before any analytics cookie.
- Compress Image runs fully in the browser (`src/lib/compressImageLocal.ts`); PDF to Word is the only server tool. Why: privacy labels and copy must match where files are processed.
