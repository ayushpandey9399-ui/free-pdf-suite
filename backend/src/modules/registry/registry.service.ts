/**
 * Tool registry implementation.
 * Responsibility: hold tool manifests in memory, reject duplicates and invalid entries,
 * and answer lookups. It is deliberately empty in Phase 0: later phases register
 * manifests at boot by discovering tool folders, and no central file changes.
 */
import { AppError, ErrorCode } from '../../core/errors.js';
import { HttpStatus } from '../../shared/http-status.js';
import type { ToolManifest, ToolRegistry, ToolSummary } from './registry.types.js';

export class InMemoryToolRegistry implements ToolRegistry {
  private readonly tools = new Map<string, ToolManifest>();

  public register(manifest: ToolManifest): void {
    if (this.tools.has(manifest.slug)) {
      throw new AppError(`Tool "${manifest.slug}" is already registered`, {
        code: ErrorCode.E_INTERNAL,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        expected: false,
      });
    }
    this.tools.set(manifest.slug, manifest);
  }

  public get(slug: string): ToolManifest | undefined {
    return this.tools.get(slug);
  }

  public has(slug: string): boolean {
    return this.tools.has(slug);
  }

  public list(): readonly ToolManifest[] {
    // Stable ordering keeps API responses and snapshots deterministic.
    return [...this.tools.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  public listSummaries(): readonly ToolSummary[] {
    return this.list().map((tool) => ({
      slug: tool.slug,
      title: tool.title,
      version: tool.version,
      category: tool.category,
      enabled: tool.enabled,
      acceptedMimes: tool.acceptedMimes,
      outputMime: tool.outputMime,
    }));
  }

  public size(): number {
    return this.tools.size;
  }

  public clear(): void {
    this.tools.clear();
  }
}

/**
 * Process wide registry instance.
 * Phase 0 registers nothing into it on purpose.
 */
export const toolRegistry: ToolRegistry = new InMemoryToolRegistry();
