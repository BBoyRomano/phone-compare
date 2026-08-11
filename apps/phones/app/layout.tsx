import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const fallbackOrigin = "https://phone-compare.bboyromano.workers.dev";
const title = "Phone Compare — evidence before opinion";
const description = "Compare meaningful phone differences with clear, first-party sources.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim() ?? requestHeaders.get("host");
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol === "http" ? "http" : "https";
  let origin = fallbackOrigin;
  if (host) {
    try {
      origin = new URL(`${protocol}://${host}`).origin;
    } catch {
      origin = fallbackOrigin;
    }
  }
  const imageUrl = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Phone Compare",
      title,
      description,
      images: [{ url: imageUrl, width: 1731, height: 909, alt: "Phone Compare — See the difference. See the source." }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl]
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
