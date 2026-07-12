---
name: design-system
description: Defines the Nextlane visual design system (colors, typography, spacing, radius, motion, components) that all UI in this repo follows. Use when building or styling any component or page, choosing colors/spacing/radius values, or reviewing a UI diff for visual consistency.
---

# Design System

Restrained, content-first aesthetic: generous whitespace, strong typography, a single violet accent, soft geometry, low visual noise. Think Stripe docs / Linear / Vercel, not a marketing landing page. Full token tables and per-component specs live in `reference.md` — read that before building a new component type; the quick reference below covers the values you'll need most often.

## Core rules

1. **Typography and whitespace create hierarchy first** — reach for color or shadow only after those are exhausted.
2. **Violet is an accent, never a background.** Reserve it for links, borders, hover/focus states, and one emphasized word per heading.
3. **Cards separate via radius + a light border**, not heavy shadows. Elevate on hover only (`translateY(-3px)`, soft purple-tinted shadow).
4. **No sharp corners** — every surface uses a rounded radius token.
5. **Reading content is width-constrained** (`--read: 760px`); page containers cap at `--maxw: 1080px`. Never let body copy stretch full-width.
6. **Motion is short and purposeful** (120–250ms, `ease`) — animate `opacity`/`transform`/`border-color`/`box-shadow` only, respect `prefers-reduced-motion`.

## Quick reference

Tokens (add to `src/app/globals.css` `:root`/`@theme inline` block, Tailwind v4 style, when first needed):

```css
--violet: #6F3AF2;      --violet-2: #9B6BFF;
--ink: #0D0228;          --ink-soft: #17093D;
--paper: #FCFBFE;        --mist: #F3EFFB;
--line: #E5DCF6;
--text: #1C1233;         --muted: #6E6489;
--good: #1F9D6B;         --warning: #F59E0B;
--danger: #DC2626;       --info: #2563EB;
--maxw: 1080px;          --read: 760px;
```

| Scale | Values |
|---|---|
| Spacing (8px rhythm) | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 72, 88px |
| Radius | sm 6px · md 12px · lg 18px · xl 20px · full 999px |
| Type | H1 `clamp(40px,6.4vw,72px)`/800 · H2 `clamp(26px,3.4vw,38px)`/800 · H3 19px/700 · Body 17px/1.65 · Eyebrow 12px/700 uppercase |
| Breakpoint | single `@media (min-width: 720px)`, fluid `clamp()` sizing otherwise |

Don't: bright saturated backgrounds, colored cards, more than one accent color, heavy shadows, neon gradients, nested cards, consecutive callouts.

See `reference.md` for the full color/typography/spacing tables, component anatomy (Hero, Cards, Callout, Chips, Progress Bars, Checklist, Timeline, etc.), interaction states, motion system, and accessibility rules.
