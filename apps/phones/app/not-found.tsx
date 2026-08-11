import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Phone Compare",
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Phone Compare home">
          <span aria-hidden="true">PC</span>
          Phone Compare
        </a>
      </header>
      <section aria-labelledby="not-found-title">
        <p className="eyebrow">404 · Off the comparison map</p>
        <h1 id="not-found-title">Page not found.</h1>
        <p>The address may be incomplete or out of date. Return to the catalogue to choose two sourced phones.</p>
        <a href="/">Compare phones</a>
      </section>
    </main>
  );
}
