import { productFor, productsFor, type ProductCatalogue, type ResolvedProduct } from "@product-compare/catalog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function valueOf(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function ProductCard({ product, side }: { readonly product: ResolvedProduct; readonly side: "left" | "right" }) {
  return (
    <article className={`product-card product-card-${side}`}>
      <span>{product.segment}</span>
      <p>{product.brand.name}</p>
      <h3>{product.name}</h3>
      <small>{product.lifecycle.status} in {product.market} as assessed {product.lifecycle.assessedAt}</small>
      <a href={product.effectiveSourceUrl} target="_blank" rel="noreferrer">Open official source <span aria-hidden="true">↗</span></a>
    </article>
  );
}

function ProductSelect({ catalogue, name, selected }: { readonly catalogue: ProductCatalogue; readonly name: "left" | "right"; readonly selected: string }) {
  return (
    <label>
      <span>{name === "left" ? "First" : "Second"} {catalogue.singular}</span>
      <select name={name} defaultValue={selected} aria-label={`${name === "left" ? "First" : "Second"} ${catalogue.singular}`}>
        {catalogue.brands.map((brand) => (
          <optgroup label={brand.name} key={brand.slug}>
            {brand.products.map((product) => <option value={product.slug} key={product.slug}>{product.name} — {product.segment}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

export async function CataloguePage({ catalogue, searchParams }: { readonly catalogue: ProductCatalogue; readonly searchParams: SearchParams }) {
  const params = await searchParams;
  const requestedLeft = valueOf(params.left);
  const requestedRight = valueOf(params.right);
  const products = productsFor(catalogue);
  const left = productFor(catalogue, requestedLeft) ?? productFor(catalogue, catalogue.defaults[0])!;
  let right = productFor(catalogue, requestedRight) ?? productFor(catalogue, catalogue.defaults[1])!;
  if (right.slug === left.slug) {
    right = products.find((product) => product.slug !== left.slug)!;
  }
  const adjusted = Boolean(
    (requestedLeft && requestedLeft !== left.slug) ||
    (requestedRight && requestedRight !== right.slug) ||
    (requestedLeft && requestedRight && requestedLeft === requestedRight)
  );

  return (
    <main style={{ "--accent": catalogue.accent } as React.CSSProperties}>
      <header className="site-header">
        <a className="brand" href="/" aria-label={`${catalogue.title} home`}><span aria-hidden="true">PC</span><b>Product Compare</b><small>{catalogue.plural}</small></a>
        <nav aria-label="Page links"><a href="#catalogue">Browse catalogue</a><a href="#sources">Sources</a></nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Evidence-led {catalogue.singular} identity directory</p>
        <h1>Find the product.<br /><em>Follow the source.</em></h1>
        <p>{catalogue.description}</p>
        <div className="stats" aria-label="Catalogue summary"><span>{products.length} identity records</span><span>{catalogue.brands.length} in-scope brands</span><span>{catalogue.market}</span><span>Sources checked {catalogue.assessedAt}</span></div>
      </section>

      <section className="compare" aria-labelledby="compare-title">
        <div className="section-heading"><div><p className="eyebrow">Side by side</p><h2 id="compare-title">{left.name} vs {right.name}</h2></div><p>Identity and lifecycle comparison; detailed specifications remain unpublished until reviewed</p></div>
        {adjusted ? <div className="notice" role="status"><strong>Shared selection adjusted.</strong> An unavailable product was replaced with a current catalogue default.</div> : null}
        <form action="/" method="get" className="selector">
          <ProductSelect catalogue={catalogue} name="left" selected={left.slug} />
          <span aria-hidden="true">vs</span>
          <ProductSelect catalogue={catalogue} name="right" selected={right.slug} />
          <button type="submit">Compare {catalogue.plural}</button>
        </form>
        <div className="product-cards"><ProductCard product={left} side="left" /><span className="versus">vs</span><ProductCard product={right} side="right" /></div>
        <div className="table-shell">
          <table>
            <thead><tr><th>Field</th><th>{left.name}</th><th>{right.name}</th></tr></thead>
            <tbody>
              <tr><th scope="row">Brand</th><td>{left.brand.name}</td><td>{right.brand.name}</td></tr>
              <tr><th scope="row">Editorial segment</th><td>{left.segment}</td><td>{right.segment}</td></tr>
              <tr><th scope="row">Lifecycle</th><td>{left.lifecycle.status}, assessed {left.lifecycle.assessedAt}</td><td>{right.lifecycle.status}, assessed {right.lifecycle.assessedAt}</td></tr>
              <tr><th scope="row">Market scope</th><td>{left.market}</td><td>{right.market}</td></tr>
              <tr><th scope="row">Identity evidence</th><td>{left.primaryEvidence.basis}</td><td>{right.primaryEvidence.basis}</td></tr>
              <tr><th scope="row">Qualification</th><td>{left.note ?? left.primaryEvidence.qualification}</td><td>{right.note ?? right.primaryEvidence.qualification}</td></tr>
            </tbody>
          </table>
        </div>
        <p className="scope-note"><strong>Coverage boundary.</strong> {catalogue.coverageNote} <strong>Inclusion rule.</strong> {catalogue.coverageRule} Detailed specifications appear only after fact-level primary-source review.</p>
      </section>

      <section className="directory" id="catalogue" aria-labelledby="catalogue-title">
        <div className="section-heading"><div><p className="eyebrow">Verified identity directory</p><h2 id="catalogue-title">In-scope brands and product families</h2></div><p>{catalogue.taxonomyNote}</p></div>
        <div className="brand-grid">
          {catalogue.brands.map((brand) => (
            <article key={brand.slug} id={`brand-${brand.slug}`}>
              <header><div><p>{brand.products.length} products</p><h3>{brand.name}</h3></div><a href={brand.lineupSource.url} target="_blank" rel="noreferrer">Official lineup ↗</a></header>
              <ul>{brand.products.map((product) => <li key={product.slug}><span><b>{product.name}</b><small>{product.segment} · {product.lifecycle.status}</small></span><a href={product.evidence[0].source.url} target="_blank" rel="noreferrer" aria-label={`Open official identity source for ${brand.name} ${product.name}`}>Source ↗</a></li>)}</ul>
            </article>
          ))}
        </div>
      </section>

      <section className="method" id="sources" aria-labelledby="sources-title">
        <p className="eyebrow">Source policy</p><h2 id="sources-title">A directory that shows its boundary.</h2>
        <div><article><span>01</span><h3>Product-level evidence</h3><p>Every identity record explicitly carries first-party evidence instead of silently inheriting a brand link.</p></article><article><span>02</span><h3>Lifecycle and market attached</h3><p>Current, announced, archived, and unknown states are assessed for a named market and date.</p></article><article><span>03</span><h3>No invented specifications</h3><p>Segments aid navigation; they are not sourced specifications. Unknown product facts remain unpublished.</p></article></div>
      </section>

      <aside className="support" aria-labelledby="support-title"><div><p className="eyebrow">Independent by design</p><h2 id="support-title">Help sustain sourced comparison.</h2><p>Voluntary support helps cover development and operating costs; it never influences coverage, data, or comparisons.</p></div><div><a href="https://github.com/sponsors/BBoyRomano" target="_blank" rel="noreferrer">GitHub Sponsors ↗</a><a href="https://ko-fi.com/bboyromano" target="_blank" rel="noreferrer">Ko-fi ↗</a></div></aside>
      <footer><a className="brand" href="/"><span aria-hidden="true">PC</span><b>Product Compare</b></a><p>Clear products. Traceable sources.</p></footer>
    </main>
  );
}

export function catalogueMetadata(catalogue: ProductCatalogue, origin: string) {
  const title = `${catalogue.title} — official sources first`;
  const description = catalogue.description;
  const imageUrl = `${origin}/og.png`;
  return {
    metadataBase: new URL(origin), title, description,
    openGraph: { type: "website", siteName: "Product Compare", title, description, images: [{ url: imageUrl, width: 1731, height: 909, alt: `${catalogue.title} by Product Compare` }] },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] }
  };
}
