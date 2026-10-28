import { Component, type ReactNode } from "react";

/**
 * Architecture Notes
 * ------------------
 * Why this exists: every tool is a lazily loaded chunk rendered inside a page
 * that also carries the tool's heading, breadcrumbs and help article. Without
 * a local boundary, any error while loading or running a tool bubbles up to
 * the root error screen, which replaces the whole page with a bare error
 * message. Crawlers then see an empty, error-like page on a URL that returns
 * 200, which is what Google classifies as a Soft 404 (this happened to
 * /tools/compare). Containing the failure here keeps the rest of the page
 * intact and gives the visitor a clear way to retry.
 */
export class ToolErrorBoundary extends Component<
  { children: ReactNode; toolName: string },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[tool] ${this.props.toolName} failed:`, error.message);
  }

  render() {
    if (this.state.error) {
      return <ToolLoadError toolName={this.props.toolName} />;
    }
    return this.props.children;
  }
}

/** Contained message shown in place of a tool that failed to load or crashed. */
export function ToolLoadError({ toolName }: { toolName: string }) {
  return (
    <div role="alert" className="mx-auto max-w-xl rounded-lg border border-border bg-card p-6 text-center">
      <p className="font-semibold text-foreground">{toolName} could not start in this browser tab.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        This is usually a dropped connection while the tool was loading. Your files were not uploaded.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-4 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Reload the tool
      </button>
    </div>
  );
}
