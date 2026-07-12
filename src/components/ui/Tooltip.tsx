"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

function InfoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
    >
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v3.5" />
      <path d="M8 5.25h.01" />
    </svg>
  );
}

export function Tooltip({ label }: { label: string }) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  function show() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    setOpen(true);
  }

  function hide() {
    setOpen(false);
  }

  return (
    <span className="inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={id}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(event) => {
          if (event.key === "Escape") hide();
        }}
        className="inline-flex size-4 items-center justify-center rounded-full text-muted hover:text-violet focus:text-violet focus:outline-none"
      >
        <InfoIcon />
        <span className="sr-only">More info</span>
      </button>
      {open &&
        createPortal(
          <span
            role="tooltip"
            id={id}
            style={{ top: position.top, left: position.left }}
            className="pointer-events-none fixed z-50 w-max max-w-[200px] -translate-x-1/2 -translate-y-full rounded-md border border-line bg-foreground px-2.5 py-1.5 text-xs font-normal tracking-normal text-background normal-case shadow-lg"
          >
            {label}
          </span>,
          document.body,
        )}
    </span>
  );
}
