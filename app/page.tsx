import type { Metadata } from "next";
import { phones, sources, type PhoneRecord, type SourceId, type SourcedValue } from "@/data/catalog";

export const metadata: Metadata = {
  title: "iPhone 16 vs Pixel 9 — Phone Compare",
  description: "A sourced, side-by-side comparison of the Apple iPhone 16 and Google Pixel 9."
};

const sourceNumber = new Map<SourceId, number>(
  (Object.keys(sources) as SourceId[]).map((sourceId, index) => [sourceId, index + 1])
);

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

function SourceMarks({ ids }: { ids: readonly SourceId[] }) {
  return (
    <span className="source-marks" aria-label="Sources">
      {ids.map((id) => (
        <a key={id} href={`#source-${id}`} aria-label={`Source ${sourceNumber.get(id)}: ${sources[id].title}`}>
          {sourceNumber.get(id)}
        </a>
      ))}
    </span>
  );
}

function Fact({ fact, fallback = "Not stated" }: { fact: SourcedValue<string | null>; fallback?: string }) {
  return (
    <>
      <span className={fact.value === null ? "not-stated" : undefined}>{fact.value ?? fallback}</span>
      <SourceMarks ids={fact.sourceIds} />
      {fact.qualification ? <small>{fact.qualification}</small> : null}
    </>
  );
}

function Price({ phone }: { phone: PhoneRecord }) {
  const { amount, currency, market, configuration } = phone.originalPrice.value;
  return (
    <>
      <span>{formatPrice(amount, currency)}</span>
      <SourceMarks ids={phone.originalPrice.sourceIds} />
      <small>{market} · {configuration}</small>
    </>
  );
}

function DateFact({ fact }: { fact: SourcedValue<string> }) {
  return (
    <>
      <time dateTime={fact.value}>{formatDate(fact.value)}</time>
      <SourceMarks ids={fact.sourceIds} />
    </>
  );
}

function PhoneCard({ phone, variant }: { phone: PhoneRecord; variant: "apple" | "pixel" }) {
  return (
    <article className={`phone-card ${variant}-card`}>
      <div className={`phone-silhouette ${variant}-phone`} aria-hidden="true"><i /><b /><b /></div>
      <div>
        <span>{phone.maker.value}<SourceMarks ids={phone.maker.sourceIds} /></span>
        <strong>{phone.model.value}<SourceMarks ids={phone.model.sourceIds} /></strong>
        <small>Released <DateFact fact={phone.releasedOn} /></small>
      </div>
    </article>
  );
}

const comparisonRows: readonly {
  label: string;
  render: (phone: PhoneRecord) => React.ReactNode;
  note?: string;
}[] = [
  { label: "Original price", render: (phone) => <Price phone={phone} /> },
  { label: "Release date", render: (phone) => <DateFact fact={phone.releasedOn} /> },
  { label: "Display size", render: (phone) => <Fact fact={phone.display.size} /> },
  { label: "Display", render: (phone) => <Fact fact={phone.display.panel} /> },
  { label: "Resolution", render: (phone) => <Fact fact={phone.display.resolution} /> },
  { label: "Refresh rate", render: (phone) => <Fact fact={phone.display.refreshRate} /> },
  { label: "Peak brightness", render: (phone) => <Fact fact={phone.display.peakBrightness} /> },
  { label: "Weight", render: (phone) => <Fact fact={phone.weight} /> },
  { label: "Storage", render: (phone) => <Fact fact={phone.storage} /> },
  { label: "Processor", render: (phone) => <Fact fact={phone.processor} /> },
  { label: "Rear cameras", render: (phone) => <Fact fact={phone.rearCameras} /> },
  {
    label: "Battery claim",
    render: (phone) => <Fact fact={phone.batteryClaim} />,
    note: "Manufacturer battery claims use different measures, so these figures should not be ranked directly."
  },
  { label: "Water & dust", render: (phone) => <Fact fact={phone.resistance} /> }
];

export default function Home() {
  const [iphone, pixel] = phones;
  const latestAccessDate = Object.values(sources)
    .map((source) => source.accessedAt)
    .sort()
    .at(-1)!;
  const sameStartingPrice =
    iphone.originalPrice.value.amount === pixel.originalPrice.value.amount &&
    iphone.originalPrice.value.currency === pixel.originalPrice.value.currency &&
    iphone.originalPrice.value.market === pixel.originalPrice.value.market;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Phone Compare home">
          <span aria-hidden="true">PC</span>
          Phone Compare
        </a>
        <a className="header-link" href="#sources">View sources</a>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">Evidence-led phone comparison</p>
        <h1>See the difference.<br /><em>See the source.</em></h1>
        <p className="hero-copy">
          A focused comparison of two phones, using only manufacturer specifications and announcements.
          No mystery scores. No retailer pricing disguised as launch price.
        </p>
        <div className="trust-row" aria-label="Data quality summary">
          <span>{phones.length} phones</span>
          <span>{comparisonRows.length} comparison points</span>
          <span>{Object.keys(sources).length} first-party sources</span>
        </div>
      </section>

      <section className="comparison" aria-labelledby="comparison-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Side by side</p>
            <h2 id="comparison-title">{iphone.model.value} vs {pixel.model.value}</h2>
          </div>
          <p>Facts checked {formatDate(latestAccessDate)}</p>
        </div>

        <div className="phone-cards">
          <PhoneCard phone={iphone} variant="apple" />
          <div className="versus">vs</div>
          <PhoneCard phone={pixel} variant="pixel" />
        </div>

        {sameStartingPrice ? (
          <div className="price-callout">
            <span className="match-dot" aria-hidden="true" />
            <p>
              <strong>
                Same documented U.S. starting price: {formatPrice(
                  iphone.originalPrice.value.amount,
                  iphone.originalPrice.value.currency
                )}
              </strong>
              <span>Configuration details are not attached to either announcement’s price statement.</span>
            </p>
            <SourceMarks ids={["apple-iphone-16-announcement", "google-pixel-9-announcement"]} />
          </div>
        ) : null}

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th scope="col">Specification</th>
                <th scope="col"><span>Apple</span>{iphone.model.value}</th>
                <th scope="col"><span>Google</span>{pixel.model.value}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">
                    {row.label}
                    {row.note ? <small>{row.note}</small> : null}
                  </th>
                  <td>{row.render(iphone)}</td>
                  <td>{row.render(pixel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="method" aria-labelledby="method-title">
        <p className="eyebrow">How to read this</p>
        <h2 id="method-title">The footnotes are part of the product.</h2>
        <div className="method-grid">
          <article><span>01</span><h3>Primary sources first</h3><p>Every displayed phone fact points to a manufacturer specification or announcement.</p></article>
          <article><span>02</span><h3>Context stays attached</h3><p>Original price includes currency, market, and what the source does—or does not—say about configuration.</p></article>
          <article><span>03</span><h3>Unknown is not a guess</h3><p>When a cited source omits a detail, the comparison says so instead of filling the gap silently.</p></article>
        </div>
      </section>

      <section className="sources" id="sources" aria-labelledby="sources-title">
        <div className="section-heading">
          <div><p className="eyebrow">Provenance</p><h2 id="sources-title">Sources</h2></div>
          <p>All sources are first-party.</p>
        </div>
        <ol className="source-list">
          {(Object.keys(sources) as SourceId[]).map((id) => {
            const source = sources[id];
            return (
              <li id={`source-${id}`} key={id}>
                <span>{sourceNumber.get(id)}</span>
                <div>
                  <p>{source.publisher} · {source.kind === "manufacturer-specification" ? "Technical specification" : "Official announcement"}</p>
                  <h3>{source.title}</h3>
                  <small>Accessed {source.accessedAt}</small>
                </div>
                <a href={source.url} target="_blank" rel="noreferrer">Open source <span aria-hidden="true">↗</span></a>
              </li>
            );
          })}
        </ol>
      </section>

      <footer>
        <a className="brand" href="#top"><span aria-hidden="true">PC</span>Phone Compare</a>
        <p>Clear differences. Traceable facts.</p>
      </footer>
    </main>
  );
}
