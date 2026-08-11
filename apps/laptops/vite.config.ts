import { cloudflare } from "@cloudflare/vite-plugin";
import { productWorkerConfig } from "@product-compare/build/cloudflare-worker";
import { sites } from "@product-compare/build/sites-vite-plugin";
import vinext from "vinext";
import { defineConfig } from "vite";
import appConfig from "./app.config.json" with { type: "json" };

export default defineConfig({
  plugins: [
    vinext(),
    sites(),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      config: productWorkerConfig({
        name: appConfig.workerName,
        catalogDatabase: {
          name: appConfig.databaseName,
          id: process.env.CLOUDFLARE_D1_DATABASE_ID ?? "00000000-0000-0000-0000-000000000000"
        }
      })
    })
  ]
});
