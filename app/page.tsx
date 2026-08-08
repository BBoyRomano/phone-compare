import type { Metadata } from "next";
import { factsFor, phones, sources, type PhoneRecord, type SourceId, type SourcedValue } from "@/data/catalog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function findPhone(slug: string | undefined, fallback: PhoneRecord): PhoneRecord {
  return phones.find((phone) => phone.slug === slug) ?? fallback;
}

const defaultComparison = [
  phones.find((phone) => phone.slug === "apple-iphone-16")!,
  phones.find((phone) => phone.slug === "google-pixel-9")!
] as const;

async function selectedPhones(searchParams: SearchParams): Promise<readonly [PhoneRecord, PhoneRecord]> {
  const params = await searchParams;
  return [
    findPhone(firstValue(params.left), defaultComparison[0]),
    findPhone(firstValue(params.right), defaultComparison[1])
  ];
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const [left, right] = await selectedPhones(searchParams);
  const title = `${left.model.value} vs ${right.model.value}`;
  return {
    title: `${title} — Phone Compare`,
    description: `A sourced, side-by-side comparison of the ${left.maker.value} ${left.model.value} and ${right.maker.value} ${right.model.value}.`
  };
}

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
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2
  }).format(amount);
}

function SourceMarks({ ids, sourceNumbers }: { ids: readonly SourceId[]; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  return (
    <span className="source-marks" aria-label="Sources">
      {ids.map((id) => (
        <a key={id} href={`#source-${id}`} aria-label={`Source ${sourceNumbers.get(id)}: ${sources[id].title}`}>
          {sourceNumbers.get(id)}
        </a>
      ))}
    </span>
  );
}

function Fact({
  fact,
  sourceNumbers,
  fallback = "Not stated"
}: {
  fact: SourcedValue<string | null>;
  sourceNumbers: ReadonlyMap<SourceId, number>;
  fallback?: string;
}) {
  return (
    <>
      <span className={fact.value === null ? "not-stated" : undefined}>{fact.value ?? fallback}</span>
      <SourceMarks ids={fact.sourceIds} sourceNumbers={sourceNumbers} />
      {fact.qualification ? <small>{fact.qualification}</small> : null}
    </>
  );
}

function Price({ phone, sourceNumbers }: { phone: PhoneRecord; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  const { amount, currency, market, configuration } = phone.originalPrice.value;
  return (
    <>
      <span>{formatPrice(amount, currency)}</span>
      <SourceMarks ids={phone.originalPrice.sourceIds} sourceNumbers={sourceNumbers} />
      <small>{market} · {configuration}</small>
    </>
  );
}

function DateFact({ fact, sourceNumbers }: { fact: SourcedValue<string>; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  return (
    <>
      <time dateTime={fact.value}>{formatDate(fact.value)}</time>
      <SourceMarks ids={fact.sourceIds} sourceNumbers={sourceNumbers} />
      {fact.qualification ? <small>{fact.qualification}</small> : null}
    </>
  );
}

function PhoneCard({ phone, sourceNumbers }: { phone: PhoneRecord; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  const makerClass = `${phone.maker.value.toLowerCase()}-phone`;
  return (
    <article className="phone-card">
      <div className={`phone-silhouette ${makerClass}`} aria-hidden="true"><i /><b /><b /></div>
      <div>
        <span>{phone.maker.value}<SourceMarks ids={phone.maker.sourceIds} sourceNumbers={sourceNumbers} /></span>
        <strong>{phone.model.value}<SourceMarks ids={phone.model.sourceIds} sourceNumbers={sourceNumbers} /></strong>
        <small>Released <DateFact fact={phone.releasedOn} sourceNumbers={sourceNumbers} /></small>
      </div>
    </article>
  );
}

function PhoneSelect({ name, label, phone }: { name: "left" | "right"; label: string; phone: PhoneRecord }) {
  return (
    <label>
      <span>{label}</span>
      <select name={name} defaultValue={phone.slug}>
        {phones.map((option) => (
          <option value={option.slug} key={option.slug}>{option.maker.value} {option.model.value}</option>
        ))}
      </select>
    </label>
  );
}

const comparisonRows: readonly {
  label: string;
  render: (phone: PhoneRecord, sourceNumbers: ReadonlyMap<SourceId, number>) => React.ReactNode;
  note?: string;
}[] = [
  { label: "Original price", render: (phone, sourceNumbers) => <Price phone={phone} sourceNumbers={sourceNumbers} /> },
  { label: "Release date", render: (phone, sourceNumbers) => <DateFact fact={phone.releasedOn} sourceNumbers={sourceNumbers} /> },
  { label: "Display size", render: (phone, sourceNumbers) => <Fact fact={phone.display.size} sourceNumbers={sourceNumbers} /> },
  { label: "Display", render: (phone, sourceNumbers) => <Fact fact={phone.display.panel} sourceNumbers={sourceNumbers} /> },
  { label: "Resolution", render: (phone, sourceNumbers) => <Fact fact={phone.display.resolution} sourceNumbers={sourceNumbers} /> },
  { label: "Refresh rate", render: (phone, sourceNumbers) => <Fact fact={phone.display.refreshRate} sourceNumbers={sourceNumbers} /> },
  { label: "Peak brightness", render: (phone, sourceNumbers) => <Fact fact={phone.display.peakBrightness} sourceNumbers={sourceNumbers} /> },
  { label: "Weight", render: (phone, sourceNumbers) => <Fact fact={phone.weight} sourceNumbers={sourceNumbers} /> },
  { label: "Storage", render: (phone, sourceNumbers) => <Fact fact={phone.storage} sourceNumbers={sourceNumbers} /> },
  { label: "Processor", render: (phone, sourceNumbers) => <Fact fact={phone.processor} sourceNumbers={sourceNumbers} /> },
  { label: "Rear cameras", render: (phone, sourceNumbers) => <Fact fact={phone.rearCameras} sourceNumbers={sourceNumbers} /> },
  {
    label: "Battery claim",
    render: (phone, sourceNumbers) => <Fact fact={phone.batteryClaim} sourceNumbers={sourceNumbers} />,
    note: "Manufacturer battery claims use different measures, so these figures should not be ranked directly."
  },
  { label: "Water & dust", render: (phone, sourceNumbers) => <Fact fact={phone.resistance} sourceNumbers={sourceNumbers} /> }
];

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const [left, right] = await selectedPhones(searchParams);
  const usedSourceIdSet = new Set([...factsFor(left), ...factsFor(right)].flatMap((fact) => fact.sourceIds));
  const usedSourceIds = (Object.keys(sources) as SourceId[]).filter((sourceId) => usedSourceIdSet.has(sourceId));
  const sourceNumbers = new Map<SourceId, number>(
    usedSourceIds.map((sourceId, index) => [sourceId, index + 1])
  );
  const latestAccessDate = usedSourceIds
    .map((sourceId) => sources[sourceId].accessedAt)
    .sort()
    .at(-1)!;
  const sameStartingPrice =
    left.originalPrice.value.amount === right.originalPrice.value.amount &&
    left.originalPrice.value.currency === right.originalPrice.value.currency &&
    left.originalPrice.value.market === right.originalPrice.value.market;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Phone Compare home">
          <span aria-hidden="true">PC</span>
          Phone Compare
        </a>
        <a className="header-link" href="#sources">View sources</a>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">Evidence-led phone comparison</p>
        <h1>See the difference.<br /><em>See the source.</em></h1>
        <p className="hero-copy">
          Choose two phones from a carefully verified catalogue. Every comparison uses manufacturer specifications and announcements,
          with market context and unknowns kept visible.
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
            <h2 id="comparison-title">{left.model.value} vs {right.model.value}</h2>
          </div>
          <p>Facts checked {formatDate(latestAccessDate)}</p>
        </div>

        <form className="phone-selector" action="/" method="get" aria-label="Choose phones to compare">
          <PhoneSelect name="left" label="First phone" phone={left} />
          <span aria-hidden="true">vs</span>
          <PhoneSelect name="right" label="Second phone" phone={right} />
          <button type="submit">Compare phones</button>
        </form>

        <div className="phone-cards">
          <PhoneCard phone={left} sourceNumbers={sourceNumbers} />
          <div className="versus">vs</div>
          <PhoneCard phone={right} sourceNumbers={sourceNumbers} />
        </div>

        {sameStartingPrice ? (
          <div className="price-callout">
            <span className="match-dot" aria-hidden="true" />
            <p>
              <strong>
                Same documented U.S. starting price: {formatPrice(
                  left.originalPrice.value.amount,
                  left.originalPrice.value.currency
                )}
              </strong>
              <span>See each source note for configuration context.</span>
            </p>
            <SourceMarks
              ids={[...new Set([...left.originalPrice.sourceIds, ...right.originalPrice.sourceIds])]}
              sourceNumbers={sourceNumbers}
            />
          </div>
        ) : null}

        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th scope="col">Specification</th>
                <th scope="col"><span>{left.maker.value}</span>{left.model.value}</th>
                <th scope="col"><span>{right.maker.value}</span>{right.model.value}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">
                    {row.label}
                    {row.note ? <small>{row.note}</small> : null}
                  </th>
                  <td>{row.render(left, sourceNumbers)}</td>
                  <td>{row.render(right, sourceNumbers)}</td>
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
          <p>All catalogue sources are first-party.</p>
        </div>
        <ol className="source-list">
          {usedSourceIds.map((id) => {
            const source = sources[id];
            return (
              <li id={`source-${id}`} key={id}>
                <span>{sourceNumbers.get(id)}</span>
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
        <a className="brand" href="/"><span aria-hidden="true">PC</span>Phone Compare</a>
        <p>Clear differences. Traceable facts.</p>
      </footer>
    </main>
  );
}
