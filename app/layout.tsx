import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phone Compare — evidence before opinion",
  description: "Compare meaningful phone differences with clear, first-party sources."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
