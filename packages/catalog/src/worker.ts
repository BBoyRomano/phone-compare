interface CatalogueStatement {
  bind(...values: readonly unknown[]): CatalogueStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ readonly results: readonly T[] }>;
}
export interface CatalogueDatabase {
  prepare(query: string): CatalogueStatement;
}

export interface CatalogueWorkerEnvironment {
  readonly CATALOG_DB: CatalogueDatabase;
  readonly ASSETS?: { fetch(request: Request): Promise<Response> | Response };
}

type AppFetch = (request: Request, environment?: object, context?: object) => Promise<Response>;

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: { "cache-control": status === 200 ? "public, max-age=300" : "no-store" }
  });
}

export function withCatalogueApi<Handler extends { readonly fetch: (...arguments_: never[]) => Promise<Response> }>(handler: Handler, appId: string) {
  const appFetch = handler.fetch as unknown as AppFetch;
  return {
    async fetch(request: Request, environment: CatalogueWorkerEnvironment, context?: object): Promise<Response> {
      const pathname = new URL(request.url).pathname;
      if (pathname === "/api/catalog/status") {
        const release = await environment.CATALOG_DB.prepare(`
          SELECT r.version, r.assessed_at AS assessedAt, r.source_commit AS sourceCommit,
                 r.projection_revision AS projectionRevision, r.record_count AS recordCount
          FROM catalog_state s
          JOIN catalog_releases r ON r.version = s.active_version
          WHERE s.app_id = ?1
        `).bind(appId).first<Record<string, unknown>>();
        return release ? json({ appId, release }) : json({ appId, error: "No active catalogue release." }, 503);
      }
      if (pathname === "/api/catalog/products") {
        const { results } = await environment.CATALOG_DB.prepare(`
          SELECT f.family_id AS id, b.name AS brand, f.name, f.segment, o.market,
                 o.lifecycle_status AS lifecycleStatus, v.variant_id AS variantId
          FROM catalog_state s
          JOIN product_families f ON f.release_version = s.active_version
          JOIN brands b ON b.release_version = f.release_version AND b.brand_id = f.brand_id
          JOIN market_offerings o ON o.release_version = f.release_version AND o.family_id = f.family_id
          JOIN variants v ON v.release_version = o.release_version AND v.offering_id = o.offering_id
          WHERE s.app_id = ?1
          ORDER BY b.name, f.name, v.name
          LIMIT 500
        `).bind(appId).all<Record<string, unknown>>();
        return json({ appId, products: results });
      }
      return appFetch(request, environment, context);
    }
  };
}
