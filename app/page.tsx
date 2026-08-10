import type { Metadata } from "next";
import { comparisonHighlights } from "@/data/comparison";
import { factsFor, phones, sources, type PhoneRecord, type SourceId, type SourcedDate, type SourcedValue } from "@/data/catalog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

const defaultComparison = [
  phones.find((phone) => phone.slug === "apple-iphone-17")!,
  phones.find((phone) => phone.slug === "google-pixel-10")!
] as const;

interface SelectionResult {
  readonly phones: readonly [PhoneRecord, PhoneRecord];
  readonly replaced: readonly ("left" | "right")[];
}

async function selectedPhones(searchParams: SearchParams): Promise<SelectionResult> {
  const params = await searchParams;
  const leftSlug = firstValue(params.left);
  const rightSlug = firstValue(params.right);
  const left = phones.find((phone) => phone.slug === leftSlug);
  const right = phones.find((phone) => phone.slug === rightSlug);
  return {
    phones: [left ?? defaultComparison[0], right ?? defaultComparison[1]],
    replaced: [
      ...(leftSlug !== undefined && left === undefined ? ["left" as const] : []),
      ...(rightSlug !== undefined && right === undefined ? ["right" as const] : [])
    ]
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { phones: [left, right] } = await selectedPhones(searchParams);
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

function StorageFact({ phone, sourceNumbers }: { phone: PhoneRecord; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  return (
    <>
      <span>{phone.storage.value.options}</span>
      <SourceMarks ids={phone.storage.sourceIds} sourceNumbers={sourceNumbers} />
      {phone.storage.qualification ? <small>{phone.storage.qualification}</small> : null}
    </>
  );
}

function Price({ phone, sourceNumbers }: { phone: PhoneRecord; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  const { amount, currency, market, configuration } = phone.originalPrice.value;
  return (
    <>
      <span className={amount === null ? "not-stated" : undefined}>{amount === null ? "Not stated" : formatPrice(amount, currency)}</span>
      <SourceMarks ids={phone.originalPrice.sourceIds} sourceNumbers={sourceNumbers} />
      <small>{market} · {configuration}</small>
      {phone.originalPrice.qualification ? <small>{phone.originalPrice.qualification}</small> : null}
    </>
  );
}

function DateFact({ fact, sourceNumbers }: { fact: SourcedDate; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  return (
    <>
      <time dateTime={fact.value}>{formatDate(fact.value)}</time>
      <SourceMarks ids={fact.sourceIds} sourceNumbers={sourceNumbers} />
      {fact.qualification ? <small>{fact.qualification}</small> : null}
    </>
  );
}

function OptionalFact({
  fact,
  sourceNumbers
}: {
  fact: SourcedValue<string> | undefined;
  sourceNumbers: ReadonlyMap<SourceId, number>;
}) {
  if (fact) return <Fact fact={fact} sourceNumbers={sourceNumbers} />;
  return (
    <>
      <span className="not-stated">Not captured</span>
      <small>Optional field added for newer catalogue records; no value inferred.</small>
    </>
  );
}

function GenerationFact({ phone, sourceNumbers }: { phone: PhoneRecord; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  return (
    <>
      <span>{phone.generation.value === "current" ? "Current generation" : "Earlier generation"}</span>
      <SourceMarks ids={phone.generation.sourceIds} sourceNumbers={sourceNumbers} />
      {phone.generation.qualification ? <small>{phone.generation.qualification}</small> : null}
    </>
  );
}

const formFactorLabels = {
  slab: "Slab",
  "thin-slab": "Thin slab",
  "book-fold": "Book fold",
  "flip-fold": "Flip fold"
} as const;

function FormFactorFact({ phone, sourceNumbers }: { phone: PhoneRecord; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  return (
    <>
      <span>{formFactorLabels[phone.formFactor.value]}</span>
      <SourceMarks ids={phone.formFactor.sourceIds} sourceNumbers={sourceNumbers} />
      {phone.formFactor.qualification ? <small>{phone.formFactor.qualification}</small> : null}
    </>
  );
}

function SecondaryDisplay({ phone, sourceNumbers }: { phone: PhoneRecord; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  if (phone.secondaryDisplay) return <Fact fact={phone.secondaryDisplay} sourceNumbers={sourceNumbers} />;
  return (
    <>
      <span className="not-stated">Not applicable</span>
      <SourceMarks ids={phone.formFactor.sourceIds} sourceNumbers={sourceNumbers} />
      <small>{formFactorLabels[phone.formFactor.value]} phone with one display</small>
    </>
  );
}

function PhoneCard({ phone, sourceNumbers }: { phone: PhoneRecord; sourceNumbers: ReadonlyMap<SourceId, number> }) {
  const makerClass = `${phone.maker.value.toLowerCase()}-phone`;
  const timingLabel = phone.releasedOn.basis === "announcement" ? "Announced" : "Released";
  return (
    <article className="phone-card">
      <div className={`phone-silhouette ${makerClass}`} aria-hidden="true"><i /><b /><b /></div>
      <div>
        <span className={`generation-badge generation-${phone.generation.value}`}>
          {phone.generation.value === "current" ? "Current generation" : "Earlier generation"}
          <SourceMarks ids={phone.generation.sourceIds} sourceNumbers={sourceNumbers} />
        </span>
        <span className="form-factor-label">
          {formFactorLabels[phone.formFactor.value]}
          <SourceMarks ids={phone.formFactor.sourceIds} sourceNumbers={sourceNumbers} />
        </span>
        <span>{phone.maker.value}<SourceMarks ids={phone.maker.sourceIds} sourceNumbers={sourceNumbers} /></span>
        <strong>{phone.model.value}<SourceMarks ids={phone.model.sourceIds} sourceNumbers={sourceNumbers} /></strong>
        <small>{timingLabel} <DateFact fact={phone.releasedOn} sourceNumbers={sourceNumbers} /></small>
      </div>
    </article>
  );
}

function PhoneSelect({ name, label, phone }: { name: "left" | "right"; label: string; phone: PhoneRecord }) {
  const manufacturers = [...new Set(phones.map((option) => option.maker.value))];

  return (
    <label>
      <span>{label}</span>
      <select name={name} defaultValue={phone.slug}>
        {manufacturers.map((manufacturer) => (
          <optgroup label={manufacturer} key={manufacturer}>
            {phones.filter((option) => option.maker.value === manufacturer).map((option) => (
              <option value={option.slug} key={option.slug}>
                {option.model.value}
                {option.formFactor.value === "slab" ? "" : ` — ${formFactorLabels[option.formFactor.value]}`}
                {option.generation.value === "earlier" ? " — earlier" : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function SelectionNotice({ replaced }: { replaced: SelectionResult["replaced"] }) {
  if (replaced.length === 0) return null;
  const message = replaced.length === 2
    ? "The link requested unavailable phones for both selections, so current defaults were used."
    : `The link requested an unavailable phone for ${replaced[0] === "left" ? "the first selection" : "the second selection"}, so the current default was used.`;
  return (
    <div className="selection-notice" role="status">
      <strong>Shared selection adjusted</strong>
      <span>{message} Review the selectors before comparing.</span>
    </div>
  );
}

function KeyDifferences({
  left,
  right,
  sourceNumbers
}: {
  left: PhoneRecord;
  right: PhoneRecord;
  sourceNumbers: ReadonlyMap<SourceId, number>;
}) {
  const highlights = comparisonHighlights(left, right);
  const samePhone = left.slug === right.slug;

  return (
    <section className="key-differences" aria-labelledby="key-differences-title">
      <div className="key-differences-heading">
        <div>
          <p className="eyebrow">Key differences</p>
          <h3 id="key-differences-title">What the sources establish</h3>
        </div>
        <p>Only directly comparable facts are summarized. The sourced table preserves the full context.</p>
      </div>

      {samePhone ? (
        <div className="same-phone-note">
          <span aria-hidden="true">↔</span>
          <p><strong>Same phone selected</strong>Choose two different models to see their key differences.</p>
        </div>
      ) : (
        <div className="highlight-grid">
          {highlights.map((highlight) => (
            <article className={`highlight-card highlight-${highlight.kind}`} key={highlight.kind}>
              <div>
                <span>{highlight.label}</span>
                <SourceMarks ids={highlight.sourceIds} sourceNumbers={sourceNumbers} />
              </div>
              <h4>{highlight.statement}</h4>
              <p>{highlight.context}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

type ComparisonRow = {
  label: string;
  render: (phone: PhoneRecord, sourceNumbers: ReadonlyMap<SourceId, number>) => React.ReactNode;
  note?: string;
};

const coreComparisonRows: readonly ComparisonRow[] = [
  {
    label: "Generation",
    render: (phone, sourceNumbers) => <GenerationFact phone={phone} sourceNumbers={sourceNumbers} />,
    note: "A model in the manufacturer's latest comparison-ready lineup, based on official U.S. catalogue and launch data. This does not assert current retail availability."
  },
  { label: "Form factor", render: (phone, sourceNumbers) => <FormFactorFact phone={phone} sourceNumbers={sourceNumbers} /> },
  { label: "Original price", render: (phone, sourceNumbers) => <Price phone={phone} sourceNumbers={sourceNumbers} /> },
  {
    label: "Launch timing",
    render: (phone, sourceNumbers) => <DateFact fact={phone.releasedOn} sourceNumbers={sourceNumbers} />,
    note: "Availability dates and announcement dates are distinguished in each record; mixed bases are never ranked as if equivalent."
  },
  { label: "Main display size", render: (phone, sourceNumbers) => <Fact fact={phone.display.size} sourceNumbers={sourceNumbers} /> },
  { label: "Main display", render: (phone, sourceNumbers) => <Fact fact={phone.display.panel} sourceNumbers={sourceNumbers} /> },
  { label: "Resolution", render: (phone, sourceNumbers) => <Fact fact={phone.display.resolution} sourceNumbers={sourceNumbers} /> },
  { label: "Refresh rate", render: (phone, sourceNumbers) => <Fact fact={phone.display.refreshRate} sourceNumbers={sourceNumbers} /> },
  { label: "Peak brightness", render: (phone, sourceNumbers) => <Fact fact={phone.display.peakBrightness} sourceNumbers={sourceNumbers} /> },
  { label: "Cover display", render: (phone, sourceNumbers) => <SecondaryDisplay phone={phone} sourceNumbers={sourceNumbers} /> },
  { label: "Weight", render: (phone, sourceNumbers) => <Fact fact={phone.weight} sourceNumbers={sourceNumbers} /> },
  { label: "Storage", render: (phone, sourceNumbers) => <StorageFact phone={phone} sourceNumbers={sourceNumbers} /> },
  { label: "Processor", render: (phone, sourceNumbers) => <Fact fact={phone.processor} sourceNumbers={sourceNumbers} /> },
  { label: "Rear cameras", render: (phone, sourceNumbers) => <Fact fact={phone.rearCameras} sourceNumbers={sourceNumbers} /> },
  {
    label: "Battery claim",
    render: (phone, sourceNumbers) => <Fact fact={phone.batteryClaim} sourceNumbers={sourceNumbers} />,
    note: "Manufacturer battery claims use different measures, so these figures should not be ranked directly."
  },
  { label: "Water & dust", render: (phone, sourceNumbers) => <Fact fact={phone.resistance} sourceNumbers={sourceNumbers} /> }
];

const optionalComparisonRows: readonly (ComparisonRow & { field: "configurations" | "colors" | "dimensions" | "charging" })[] = [
  { field: "configurations", label: "Configurations", render: (phone, sourceNumbers) => <OptionalFact fact={phone.configurations} sourceNumbers={sourceNumbers} /> },
  { field: "colors", label: "Colors", render: (phone, sourceNumbers) => <OptionalFact fact={phone.colors} sourceNumbers={sourceNumbers} /> },
  { field: "dimensions", label: "Dimensions", render: (phone, sourceNumbers) => <OptionalFact fact={phone.dimensions} sourceNumbers={sourceNumbers} /> },
  { field: "charging", label: "Charging", render: (phone, sourceNumbers) => <OptionalFact fact={phone.charging} sourceNumbers={sourceNumbers} /> }
];

function comparisonRowsFor(left: PhoneRecord, right: PhoneRecord): readonly ComparisonRow[] {
  const optionalRows = optionalComparisonRows.filter(({ field }) => left[field] || right[field]);
  const storageIndex = coreComparisonRows.findIndex(({ label }) => label === "Storage") + 1;
  return [...coreComparisonRows.slice(0, storageIndex), ...optionalRows, ...coreComparisonRows.slice(storageIndex)];
}

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const { phones: [left, right], replaced } = await selectedPhones(searchParams);
  const comparisonRows = comparisonRowsFor(left, right);
  const usedSourceIdSet = new Set([...factsFor(left), ...factsFor(right)].flatMap((fact) => fact.sourceIds));
  const usedSourceIds = (Object.keys(sources) as SourceId[]).filter((sourceId) => usedSourceIdSet.has(sourceId));
  const sourceNumbers = new Map<SourceId, number>(
    usedSourceIds.map((sourceId, index) => [sourceId, index + 1])
  );
  const latestAccessDate = usedSourceIds
    .map((sourceId) => sources[sourceId].accessedAt)
    .sort()
    .at(-1)!;
  const currentGenerationCount = phones.filter((phone) => phone.generation.value === "current").length;
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Phone Compare home">
          <span aria-hidden="true">PC</span>
          Phone Compare
        </a>
        <nav className="header-links" aria-label="Page links">
          <a href="#sources">View sources</a>
          <a href="#support">Support</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">Evidence-led phone comparison</p>
        <h1>See the difference.<br /><em>See the source.</em></h1>
        <p className="hero-copy">
          Choose two phones from a carefully verified catalogue. Every comparison uses first-party manufacturer sources,
          with market context and unknowns kept visible.
        </p>
        <div className="trust-row" aria-label="Data quality summary">
          <span>{phones.length} phones</span>
          <span>{currentGenerationCount} current generation</span>
          <span>{comparisonRows.length} comparison points</span>
          <span>{usedSourceIds.length} cited sources</span>
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

        <SelectionNotice replaced={replaced} />

        <form className="phone-selector" action="/" method="get" aria-label="Choose phones to compare">
          <p className="selector-help">
            Open a manufacturer group to find its current phones; useful earlier-generation models are labeled.
          </p>
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

        <KeyDifferences left={left} right={right} sourceNumbers={sourceNumbers} />

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
          <article><span>01</span><h3>Primary sources first</h3><p>Every displayed phone fact points to a manufacturer specification, announcement, or official catalogue.</p></article>
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
                  <p>{source.publisher} · {
                    source.kind === "manufacturer-specification"
                      ? "Technical specification"
                      : source.kind === "manufacturer-announcement"
                        ? "Official announcement"
                        : "Official U.S. catalogue"
                  }</p>
                  <h3>{source.title}</h3>
                  <small>Accessed {source.accessedAt}</small>
                </div>
                <a href={source.url} target="_blank" rel="noreferrer">Open source <span aria-hidden="true">↗</span></a>
              </li>
            );
          })}
        </ol>
      </section>

      <aside className="support" id="support" aria-labelledby="support-title">
        <div>
          <p className="eyebrow">Support the project</p>
          <h2 id="support-title">Help sustain independent comparison.</h2>
          <p>
            Phone Compare is independent and open source. Voluntary support helps cover development and operating costs;
            it never influences which phones are included, the product data, or the comparisons.
          </p>
        </div>
        <div className="support-links" aria-label="External support options">
          <a href="https://github.com/sponsors/BBoyRomano" target="_blank" rel="noreferrer">
            GitHub Sponsors <span aria-hidden="true">↗</span>
          </a>
          <a href="https://ko-fi.com/bboyromano" target="_blank" rel="noreferrer">
            Ko-fi <span aria-hidden="true">↗</span>
          </a>
          <small>Support opens on external websites.</small>
        </div>
      </aside>

      <footer>
        <a className="brand" href="/"><span aria-hidden="true">PC</span>Phone Compare</a>
        <p>Clear differences. Traceable facts.</p>
      </footer>
    </main>
  );
}
