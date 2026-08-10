"use client";

import { useId, useMemo, useState } from "react";

export interface PhonePickerOption {
  readonly slug: string;
  readonly maker: string;
  readonly model: string;
  readonly generation: "current" | "earlier";
  readonly formFactor: "slab" | "thin-slab" | "book-fold" | "flip-fold";
}

const formFactorLabels: Record<PhonePickerOption["formFactor"], string> = {
  slab: "Slab",
  "thin-slab": "Thin slab",
  "book-fold": "Book fold",
  "flip-fold": "Flip fold"
};

function searchable(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function optionLabel(option: PhonePickerOption): string {
  const formFactor = option.formFactor === "slab" ? "" : ` — ${formFactorLabels[option.formFactor]}`;
  return `${option.model}${formFactor} — ${option.generation}`;
}

export function PhonePicker({
  name,
  label,
  selectedSlug,
  options
}: {
  readonly name: "left" | "right";
  readonly label: string;
  readonly selectedSlug: string;
  readonly options: readonly PhonePickerOption[];
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [generation, setGeneration] = useState<"all" | PhonePickerOption["generation"]>("all");
  const [selected, setSelected] = useState(selectedSlug);
  const normalizedQuery = searchable(query).trim();
  const matches = useMemo(() => {
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return options.filter((option) => {
      if (generation !== "all" && option.generation !== generation) return false;
      const haystack = searchable(`${option.maker} ${option.model}`);
      return tokens.every((token) => haystack.includes(token));
    });
  }, [generation, normalizedQuery, options]);
  const selectedOption = options.find((option) => option.slug === selected);
  const selectedIsPinned = selectedOption !== undefined && !matches.some((option) => option.slug === selected);
  const manufacturers = [...new Set(matches.map((option) => option.maker))];

  return (
    <fieldset className="phone-picker">
      <legend>{label}</legend>
      <div className="picker-filters">
        <label htmlFor={`${id}-search`}>
          <span>Search catalogue</span>
          <input
            id={`${id}-search`}
            type="search"
            aria-label={`Search catalogue for ${name === "left" ? "first" : "second"} selection`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Maker or model"
            autoComplete="off"
          />
        </label>
        <label htmlFor={`${id}-generation`}>
          <span>Generation</span>
          <select
            id={`${id}-generation`}
            aria-label={`Generation for ${name === "left" ? "first" : "second"} selection`}
            value={generation}
            onChange={(event) => setGeneration(event.target.value as typeof generation)}
          >
            <option value="all">All</option>
            <option value="current">Current</option>
            <option value="earlier">Earlier</option>
          </select>
        </label>
      </div>
      <label className="picker-selection" htmlFor={`${id}-phone`}>
        <span>Phone</span>
        <select
          id={`${id}-phone`}
          name={name}
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          aria-label={label}
        >
          {selectedIsPinned && selectedOption ? (
            <optgroup label="Selected phone">
              <option value={selectedOption.slug}>{optionLabel(selectedOption)}</option>
            </optgroup>
          ) : null}
          {manufacturers.map((manufacturer) => (
            <optgroup label={manufacturer} key={manufacturer}>
              {matches.filter((option) => option.maker === manufacturer).map((option) => (
                <option value={option.slug} key={option.slug}>{optionLabel(option)}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <small className="picker-count" role="status" aria-live="polite">
        {matches.length === 0
          ? "No other phones match; your selected phone is preserved."
          : `${matches.length} of ${options.length} phones shown${selectedIsPinned ? "; your selected phone is also preserved." : "."}`}
      </small>
    </fieldset>
  );
}
