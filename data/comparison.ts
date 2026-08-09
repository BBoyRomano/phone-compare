import type { PhoneRecord, SourceId } from "./catalog";

export interface ComparisonHighlight {
  readonly kind: "price" | "release" | "display" | "weight";
  readonly label: string;
  readonly statement: string;
  readonly context: string;
  readonly sourceIds: readonly SourceId[];
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

function parseMeasurement(value: string, unit: "inches" | "g"): number | null {
  const match = value.match(new RegExp(`^(\\d+(?:\\.\\d+)?) ${unit}$`));
  return match ? Number(match[1]) : null;
}

function priceHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  const leftPrice = left.originalPrice.value;
  const rightPrice = right.originalPrice.value;

  if (leftPrice.currency !== rightPrice.currency || leftPrice.market !== rightPrice.market) return null;

  const sourceIds = uniqueSourceIds(left.originalPrice.sourceIds, right.originalPrice.sourceIds);
  if (leftPrice.amount === rightPrice.amount) {
    return {
      kind: "price",
      label: "Launch price",
      statement: "Same documented U.S. starting price",
      context: `Both were announced from ${formatPrice(leftPrice.amount, leftPrice.currency)}. Configuration context remains attached in the table.`,
      sourceIds
    };
  }

  const [lower, higher] = leftPrice.amount < rightPrice.amount ? [left, right] : [right, left];
  const difference = higher.originalPrice.value.amount - lower.originalPrice.value.amount;
  if (difference < 2) {
    return {
      kind: "price",
      label: "Launch price",
      statement: "Nearly the same documented U.S. starting price",
      context: `${formatPrice(leftPrice.amount, leftPrice.currency)} versus ${formatPrice(rightPrice.amount, rightPrice.currency)}. Configuration context remains attached in the table.`,
      sourceIds
    };
  }

  return {
    kind: "price",
    label: "Launch price",
    statement: `${lower.model.value} launched ${formatPrice(difference, lower.originalPrice.value.currency)} lower`,
    context: `${formatPrice(lower.originalPrice.value.amount, lower.originalPrice.value.currency)} versus ${formatPrice(higher.originalPrice.value.amount, higher.originalPrice.value.currency)} in the ${lower.originalPrice.value.market}; these are official launch prices, not current retail prices.`,
    sourceIds
  };
}

function releaseHighlight(left: PhoneRecord, right: PhoneRecord): ComparisonHighlight | null {
  if (left.releasedOn.value === right.releasedOn.value) return null;

  const [later, earlier] = left.releasedOn.value > right.releasedOn.value ? [left, right] : [right, left];
  return {
    kind: "release",
    label: "Release timing",
    statement: `${later.model.value} was released later`,
    context: `${formatDate(later.releasedOn.value)} versus ${formatDate(earlier.releasedOn.value)}. This compares the cited official availability dates only.`,
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
  return {
    kind: "display",
    label: "Display size",
    statement: `${larger.model.value} has a ${difference.toFixed(1)}-inch larger listed display`,
    context: `${larger.display.size.value} versus ${smaller.display.size.value}. Manufacturer measurement qualifications remain attached in the table.`,
    sourceIds: uniqueSourceIds(left.display.size.sourceIds, right.display.size.sourceIds)
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
    priceHighlight(left, right),
    releaseHighlight(left, right),
    displayHighlight(left, right),
    weightHighlight(left, right)
  ].filter((highlight): highlight is ComparisonHighlight => highlight !== null);
}
