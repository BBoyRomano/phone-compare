export interface ProductWorkerOptions {
  readonly name: string;
  readonly catalogDatabase: {
    readonly name: string;
    readonly id: string;
  };
  readonly main?: string;
  readonly logSamplingRate?: number;
  readonly traceSamplingRate?: number;
}

/**
 * Shared, non-secret runtime defaults for product Workers.
 *
 * Worker identity and database resource identity stay app-owned; credentials are injected by CI.
 */
export function productWorkerConfig({
  name,
  catalogDatabase,
  main = "./worker/index.ts",
  logSamplingRate = 0.1,
  traceSamplingRate = 0.01
}: ProductWorkerOptions) {
  return {
    name,
    main,
    compatibility_date: "2026-08-11",
    compatibility_flags: ["nodejs_compat"],
    d1_databases: [{
      binding: "CATALOG_DB",
      database_name: catalogDatabase.name,
      database_id: catalogDatabase.id,
      migrations_dir: "../../packages/catalog/migrations"
    }],
    observability: {
      enabled: true,
      logs: {
        enabled: true,
        head_sampling_rate: logSamplingRate,
        invocation_logs: false
      },
      traces: {
        enabled: true,
        head_sampling_rate: traceSamplingRate
      }
    }
  };
}
