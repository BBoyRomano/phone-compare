import { catalogueMetadata } from "@product-compare/web";
import "@product-compare/web/styles.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { tabletCatalogue } from "../data/catalog";

const fallbackOrigin = "https://product-compare-tablets.bboyromano.workers.dev";
export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() === "http" ? "http" : "https";
  let origin = fallbackOrigin;
  if (host) { try { origin = new URL(`${protocol}://${host}`).origin; } catch { origin = fallbackOrigin; } }
  return catalogueMetadata(tabletCatalogue, origin) as Metadata;
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
