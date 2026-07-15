"use client";

import { useId, useMemo, useState } from "react";

const inputClass =
  "rounded-md border border-line px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet";

const MAX_SUGGESTIONS = 8;

/**
 * Free-text "Make" field with autocomplete suggestions sourced from the
 * `brands` reference table. Any value can be typed and submitted — matching
 * a known brand is never required (see `getVehicleFormErrors`, which only
 * requires non-empty `make`).
 *
 * Submits as a plain `name="make"` text input (the form uses native
 * `<form action={formAction}>` + FormData), while a separate controlled
 * input drives the visible value/suggestions — same `value`/`onChange`/
 * `onBlur` plumbing as the other controlled fields in `VehicleForm`.
 */
export function MakeAutocomplete({
  id,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  ariaInvalid,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  options: string[];
  error?: string;
  ariaInvalid?: boolean;
}) {
  const listboxId = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const matches = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return [];

    return options
      .filter((option) => option.toLowerCase().includes(term))
      .slice(0, MAX_SUGGESTIONS);
  }, [options, value]);

  const isOpen = isFocused && matches.length > 0;

  function optionId(index: number) {
    return `${listboxId}-option-${index}`;
  }

  function selectOption(option: string) {
    onChange(option);
    setActiveIndex(-1);
    setIsFocused(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? matches.length - 1 : prev - 1));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < matches.length) {
        event.preventDefault();
        selectOption(matches[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setActiveIndex(-1);
      setIsFocused(false);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="text"
        required
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-invalid={ariaInvalid}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-activedescendant={
          isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        autoComplete="off"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setActiveIndex(-1);
          onBlur();
        }}
        onKeyDown={handleKeyDown}
        className={`${inputClass} w-full`}
      />
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-10 mt-1 w-full rounded-md border border-line bg-white py-1 text-sm shadow-md"
        >
          {matches.map((option, index) => (
            <li key={option} role="presentation">
              <button
                type="button"
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full px-3 py-1.5 text-left hover:bg-mist ${
                  index === activeIndex ? "bg-mist" : ""
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
