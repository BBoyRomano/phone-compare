export interface ProductWorkerOptions {
  readonly name: string;
  readonly main?: string;
  readonly logSamplingRate?: number;
  readonly traceSamplingRate?: number;
}

/**
 * Shared, non-secret runtime defaults for the stateless product Workers.
 *
 * Worker identity, routes, bindings, and deployment credentials stay app-owned.
 */
export function productWorkerConfig({
  name,
  main = "./worker/index.ts",
  logSamplingRate = 0.1,
  traceSamplingRate = 0.01
}: ProductWorkerOptions) {
  return {
    name,
    main,
    compatibility_date: "2026-08-11",
    compatibility_flags: ["nodejs_compat"],
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
