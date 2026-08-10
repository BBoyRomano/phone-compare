import type { PhoneRecord, SourceId } from "./catalog";

export interface ComparisonHighlight {
  readonly kind: "generation" | "form-factor" | "price" | "release" | "display" | "storage" | "weight";
  readonly label: string;
  readonly statement: string;
  readonly context: string;
  readonly sourceIds: readonly SourceId[];
}

const formFactorLabels: Record<PhoneRecord["formFactor"]["value"], string> = {
  slab: "slab",
  "thin-slab": "thin slab",
  "book-fold": "book fold",
  "flip-fold": "flip fold"
};

function generationHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  if (left.generation.value === right.generation.value) return null;

  const current = left.generation.value === "current" ? left : right;
  const earlier = left.generation.value === "earlier" ? left : right;
  return {
    kind: "generation",
    label: "Catalogue generation",
    statement: `${current.model.value} is in the current comparison-ready lineup`,
    context: `${earlier.model.value} is retained as an earlier-generation comparison. Classification does not assert current retail availability.`,
    sourceIds: uniqueSourceIds(left.generation.sourceIds, right.generation.sourceIds)
  };
}

function formFactorHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  if (left.formFactor.value === right.formFactor.value) return null;

  return {
    kind: "form-factor",
    label: "Form factor",
    statement: `${left.model.value} is a ${formFactorLabels[left.formFactor.value]}; ${right.model.value} is a ${formFactorLabels[right.formFactor.value]}`,
    context: "Display diagonal, weight, and physical use can mean different things across these sourced form factors.",
    sourceIds: uniqueSourceIds(left.formFactor.sourceIds, right.formFactor.sourceIds)
  };
}

function uniqueSourceIds(...sourceIdGroups: readonly (readonly SourceId[])[]): SourceId[] {
  return [...new Set(sourceIdGroups.flat())];
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

function parseMeasurement(value: string | null, unit: "inches" | "g"): number | null {
  if (value === null) return null;
  const match = value.match(new RegExp(`^(\\d+(?:\\.\\d+)?) ${unit}$`));
  return match ? Number(match[1]) : null;
}

function priceHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  const leftPrice = left.originalPrice.value;
  const rightPrice = right.originalPrice.value;

  if (leftPrice.amount === null || rightPrice.amount === null || leftPrice.currency === null || rightPrice.currency === null) return null;
  if (leftPrice.currency !== rightPrice.currency || leftPrice.market !== rightPrice.market) return null;

  const currency = leftPrice.currency;
  const sourceIds = uniqueSourceIds(left.originalPrice.sourceIds, right.originalPrice.sourceIds);
  if (leftPrice.amount === rightPrice.amount) {
    return {
      kind: "price",
      label: "Launch price",
      statement: `Same documented ${leftPrice.market} starting price`,
      context: `Both have a documented original price of ${formatPrice(leftPrice.amount, currency)} in ${leftPrice.market}. Configuration context remains attached in the table.`,
      sourceIds
    };
  }

  const leftIsLower = leftPrice.amount < rightPrice.amount;
  const lower = leftIsLower ? left : right;
  const lowerAmount = leftIsLower ? leftPrice.amount : rightPrice.amount;
  const higherAmount = leftIsLower ? rightPrice.amount : leftPrice.amount;
  const difference = higherAmount - lowerAmount;
  if (difference < 2) {
    return {
      kind: "price",
      label: "Launch price",
      statement: `Nearly the same documented ${leftPrice.market} starting price`,
      context: `${formatPrice(leftPrice.amount, currency)} versus ${formatPrice(rightPrice.amount, currency)} in ${leftPrice.market}. Configuration context remains attached in the table.`,
      sourceIds
    };
  }

  return {
    kind: "price",
    label: "Launch price",
    statement: `${lower.model.value} launched ${formatPrice(difference, currency)} lower`,
    context: `${formatPrice(lowerAmount, currency)} versus ${formatPrice(higherAmount, currency)} in the ${lower.originalPrice.value.market}; these are official launch prices, not current retail prices.`,
    sourceIds
  };
}

function releaseHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  const leftDate = left.releasedOn.value;
  const rightDate = right.releasedOn.value;
  if (leftDate === null || rightDate === null) return null;
  const leftBasis = left.releasedOn.basis ?? "availability";
  const rightBasis = right.releasedOn.basis ?? "availability";
  if (leftBasis !== rightBasis) return null;
  if (leftDate === rightDate) return null;

  const [later, laterDate, earlierDate] = leftDate > rightDate
    ? [left, leftDate, rightDate] as const
    : [right, rightDate, leftDate] as const;
  const isAnnouncement = leftBasis === "announcement";
  return {
    kind: "release",
    label: isAnnouncement ? "Announcement timing" : "Release timing",
    statement: `${later.model.value} was ${isAnnouncement ? "announced" : "released"} later`,
    context: `${formatDate(laterDate)} versus ${formatDate(earlierDate)}. This compares the cited official ${isAnnouncement ? "announcement" : "availability"} dates only.`,
    sourceIds: uniqueSourceIds(left.releasedOn.sourceIds, right.releasedOn.sourceIds)
  };
}

function displayHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  const leftSize = parseMeasurement(left.display.size.value, "inches");
  const rightSize = parseMeasurement(right.display.size.value, "inches");
  if (leftSize === null || rightSize === null || leftSize === rightSize) return null;

  const larger = leftSize > rightSize ? left : right;
  const smaller = leftSize > rightSize ? right : left;
  const difference = Math.abs(leftSize - rightSize);
  const differentFormFactors = left.formFactor.value !== right.formFactor.value;
  const formFactorContext = differentFormFactors
    ? ` These are ${formFactorLabels[left.formFactor.value]} and ${formFactorLabels[right.formFactor.value]} phones, so diagonal size does not describe equivalent display shape or use.`
    : "";
  return {
    kind: "display",
    label: "Main display size",
    statement: `${larger.model.value} has a ${difference.toFixed(1)}-inch larger listed main display`,
    context: `${larger.display.size.value} versus ${smaller.display.size.value}. Manufacturer measurement qualifications remain attached in the table.${formFactorContext}`,
    sourceIds: uniqueSourceIds(
      left.display.size.sourceIds,
      right.display.size.sourceIds,
      ...(differentFormFactors ? [left.formFactor.sourceIds, right.formFactor.sourceIds] : [])
    )
  };
}

function storageHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  const leftStart = left.storage.value.startsAtGb;
  const rightStart = right.storage.value.startsAtGb;
  if (leftStart === rightStart) return null;

  const higher = leftStart > rightStart ? left : right;
  const lower = leftStart > rightStart ? right : left;
  const difference = Math.abs(leftStart - rightStart);
  return {
    kind: "storage",
    label: "Starting storage",
    statement: `${higher.model.value}'s listed storage starts ${difference.toLocaleString("en-US")} GB higher`,
    context: `${higher.storage.value.startsAtGb.toLocaleString("en-US")} GB versus ${lower.storage.value.startsAtGb.toLocaleString("en-US")} GB. This compares cited storage options, not price configurations or channel availability.`,
    sourceIds: uniqueSourceIds(left.storage.sourceIds, right.storage.sourceIds)
  };
}

function weightHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  const leftWeight = parseMeasurement(left.weight.value, "g");
  const rightWeight = parseMeasurement(right.weight.value, "g");
  if (leftWeight === null || rightWeight === null || Math.abs(leftWeight - rightWeight) < 5) return null;

  const lighter = leftWeight < rightWeight ? left : right;
  const heavier = leftWeight < rightWeight ? right : left;
  const difference = Math.abs(leftWeight - rightWeight);
  return {
    kind: "weight",
    label: "Weight",
    statement: `${lighter.model.value} is ${difference.toLocaleString("en-US")} g lighter in the cited specifications`,
    context: `${lighter.weight.value} versus ${heavier.weight.value}. Values with unlike units are left to the sourced table instead of being converted silently.`,
    sourceIds: uniqueSourceIds(left.weight.sourceIds, right.weight.sourceIds)
  };
}

export function comparisonHighlights(left: PhoneRecord, right: PhoneRecord): readonly ComparisonHighlight[] {
  if (left.slug === right.slug) return [];

  return [
    generationHighlight(left, right),
    formFactorHighlight(left, right),
    priceHighlight(left, right),
    releaseHighlight(left, right),
    displayHighlight(left, right),
    storageHighlight(left, right),
    weightHighlight(left, right)
  ].filter((highlight): highlight is ComparisonHighlight => highlight !== null);
}
