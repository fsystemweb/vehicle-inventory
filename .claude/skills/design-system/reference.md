# Nextlane Design System — Reference

> Source: extracted from the Staff AI Engineer Case Study HTML. Single source of truth for the visual language, layout philosophy, and component specs. Referenced by the `design-system` skill — read `SKILL.md` first for the summary and core rules.

## 1. Philosophy

Restrained rather than flashy: generous whitespace, strong typography, a restrained palette, excellent readability, subtle motion, minimal visual noise. Resembles Stripe docs, Linear, Vercel — trustworthy, technical, premium, calm, modern, focused. Content always outranks decoration.

- **Minimal** — near-everything is white, dark ink, or violet; avoid competing colors.
- **High readability** — large line heights, comfortable paragraph width (≤760px), balanced headings.
- **Strong hierarchy** — built with typography, whitespace, and background contrast, not borders everywhere.
- **Soft geometry** — no sharp corners anywhere, including info boxes.
- **Low visual noise** — light borders, subtle shadows, short animations, simple backgrounds.

### Core principles

1. Typography drives the interface — everything starts from text hierarchy.
2. Whitespace is a component — padding is generous, margins separate ideas, not just elements.
3. Accent color is precious — violet appears only for links, emphasis, interactive states, highlights, gradients.
4. Cards float lightly — separated by radius/border/elevation, not heavy shadows.
5. Dark sections create rhythm — alternate light → dark → light → dark across large content groups.

## 2. Design tokens

```css
:root {
  --violet: #6F3AF2;
  --violet-2: #9B6BFF;

  --ink: #0D0228;
  --ink-soft: #17093D;

  --paper: #FCFBFE;
  --mist: #F3EFFB;

  --line: #E5DCF6;

  --text: #1C1233;
  --muted: #6E6489;

  --good: #1F9D6B;

  --maxw: 1080px;
  --read: 760px;
}
```

These tokens should remain unchanged across projects; everything else references them.

Recommended additions (only one semantic token — `--good` — exists in the source):

```css
--warning: #F59E0B;
--danger: #DC2626;
--info: #2563EB;
```

## 3. Color system

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary | Violet | `#6F3AF2` | Links, borders, highlights, hover states, icons, progress bars, accent typography |
| Secondary | Soft Violet | `#9B6BFF` | Gradients, secondary emphasis, hero text, decorative elements |
| Background | Paper | `#FCFBFE` | Primary page background — nearly white, warmer than pure white, makes violet feel richer |
| Background | Mist | `#F3EFFB` | Badges, chips, callouts, highlighted notes, progress backgrounds — never a full-page background |
| Dark surface | Ink | `#0D0228` | Dark sections: hero, footer, dark bands |
| Dark surface | Ink Soft | `#17093D` | Gradient backgrounds, cards over dark sections, depth |
| Border | Line | `#E5DCF6` | Primary border color — subtle, low contrast, never distracting |
| Text | Text | `#1C1233` | Primary text |
| Text | Muted | `#6E6489` | Accompanies body copy, never replaces it |
| Semantic | Success | `#1F9D6B` | The only semantic color defined in source; promote to `--success` |

**Color hierarchy (priority order):** Text → Violet → Muted → Borders → Backgrounds. Accent colors should never dominate paragraphs.

**Gradients:**
- Hero text: `linear-gradient(92deg, #9B6BFF, #C9B2FF)` — premium feel, reserved for major headings, only one emphasized word, never a whole paragraph.
- Hero background: two low-opacity radial gradients, decorative only, never competing with content.
- Progress bars: `linear-gradient(90deg, #6F3AF2, #9B6BFF)` — simple, consistent, no extra colors.

**Do:** keep white dominant · use purple sparingly · prefer muted backgrounds · keep borders subtle · reserve gradients for hero sections.
**Don't:** bright saturated backgrounds · colored cards · multiple accent colors · heavy shadows · neon gradients.

## 4. Typography

**Font stack:** `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif` — native platform fonts for fast loading, native appearance, no Google Fonts dependency.

**Monospace:** `ui-monospace, SF Mono, Menlo, Consolas, Liberation Mono, monospace` — tokens, code, labels, percentages, metadata only.

| Element | Size | Weight | Notes |
|---|---|---|---|
| H1 | `clamp(40px,6.4vw,72px)` | 800 | letter-spacing `-0.02em` |
| H2 | `clamp(26px,3.4vw,38px)` | 800 | |
| H3 | 19px | 700 | |
| Body | 17px | — | line-height 1.65, larger than typical for long-form reading |
| Subtitle | 18px | — | muted color |
| Lead paragraph | `clamp(18px,2.2vw,22px)` | — | longer line-height, hero only |
| Eyebrow | 12px | 700 | uppercase, 0.18em tracking, section labels |
| Caption | 11–14px | — | uppercase, high tracking, muted |

Headings: bold, compact, balanced. Paragraphs: relaxed, readable, never exceed ~760px. Uppercase text is for metadata only, never paragraphs.

## 5. Spacing

8px rhythm. Observed values: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 26, 28, 30, 32, 36, 40, 48, 56, 64, 72, 76, 88.

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 20px;  --space-6: 24px;  --space-7: 32px;  --space-8: 40px;
--space-9: 48px;  --space-10: 64px; --space-11: 72px; --space-12: 88px;
```

Small spacing = within components. Medium = between related elements. Large = between sections. Whitespace communicates hierarchy more than borders.

## 6. Layout & grid

- **Page container:** 1080px (`--maxw`) — overall content width.
- **Reading container:** 760px (`--read`) — text-heavy sections; avoid paragraphs wider than this.
- **Horizontal padding:** 28px, applied consistently.
- **Section padding:** default 72px · compact 56px · dark sections 76px — the variation creates rhythm without feeling inconsistent.
- **Grid:** main page is single-column reading layout. Cards: 2 columns desktop, 1 column mobile, 18px gap.

## 7. Radius & elevation

```css
--radius-sm: 6px;  --radius-md: 12px;  --radius-lg: 18px;
--radius-xl: 20px; --radius-full: 999px;
```

Radius is used generously; very few square edges exist.

Depth comes from borders, soft radius, and subtle hover motion rather than large shadows. Standard elevated-card hover shadow:

```css
box-shadow: 0 18px 40px -24px rgba(111, 58, 242, .45);
```

## 8. Components

A small set of highly reusable components rather than many specialized elements: Hero, Top Navigation, Eyebrow, Content Sections, Cards, Chips, Lead Notes, Progress Bars, Checklist, Callout, Footer.

**Composition hierarchy:** Section → Eyebrow → Heading → Subtitle → Content → Callout (optional) → Cards/Lists/Diagram. Avoid nesting cards inside cards, multiple callouts in succession, excessive gradients, colorful backgrounds, inconsistent border radii.

### Hero
Establishes brand identity, hierarchy, visual tone, page purpose — communicates authority, not excitement; avoids illustrations/CTAs. Structure: dark-surface background (`var(--ink)`) with low-opacity decorative radial gradients and "lane stripe" graphics (decorative only, never carry information) → top bar (logo + metadata, `flex; justify-content:space-between`) → eyebrow → large heading (≤14 chars/line, gradient on one emphasized word only) → lead paragraph (max 60ch) → metadata chips (wrap on mobile, single row on desktop). Vertical rhythm: 38px top padding → topbar → 64px → eyebrow → heading → 24px → lead → 40px → metadata chips.

### Eyebrow
Section identifier, always precedes a heading (never used alone). Uppercase, bold, 12px, wide tracking, violet (`--violet-2` on dark sections). One per section; stays visually lightweight.

### Section
Every content block follows: Eyebrow → Heading → Subtitle → Content. Padding: 72px default, 56px compact, 76px dark.

### Cards
Primary reusable surface for features, docs, artifacts, services, summaries. Anatomy: number badge → heading → description → metadata. Style: white background, 1px border, 18px radius, 26px padding.
- Hover: lift + shadow + violet border, `transform: translateY(-3px)`, 180ms transition, shadow `0 18px 40px -24px`. Elegant, never exaggerated.
- States: default (white, gray border, no shadow) · hover (violet border, soft shadow, lift) · active (`translateY(-1px)`, smaller shadow) · disabled (`opacity:.6; pointer-events:none`).

### Number Badge
Small monospace violet badge with rounded border and small padding, e.g. `01`, used for visual indexing inside cards.

### Code Pills
Represent filenames, directories, commands, technologies. Mist background, rounded, monospace, small. Should wrap naturally, never truncate.

### Lead Note
High-importance callout for warnings, tips, key ideas. Structure: colored left border (3px) → mist background → content, only the right side rounded (subtle document-annotation effect). Avoid stacking multiple consecutively.

### Chips
Compact metadata (e.g. `Time / 1–2 days`, `Deploy / Free Tier`). Label → value structure. Semi-transparent white background, subtle border, 12px radius. Keep concise, max two lines.

### Progress Bars
Represent proportional information: label → percentage → progress. Mist background, violet gradient fill, rounded ends. Not animated by default; if animated, 200–300ms width transition. Always show the percentage numerically — never rely on color alone.

### Rubric Row
List item: title → description → percentage → progress bar. Used for scoring, completion, analytics.

### Checklist
Displays deliverables: icon → title → description, in a white card (rounded, bordered, padded, no shadow). Icons stay aligned; descriptions wrap naturally. **Checklist icon:** small rounded square, mist background, violet icon — never colorful icons, consistency over variety.

### Callout
Highest-emphasis component, appears once, reserved for major announcements. Dark gradient background, white text, large radius, violet border. Structure: eyebrow → heading → body. Use for major warnings, announcements, onboarding, next steps, critical information. Avoid overusing — must stay visually special.

### Dark Band
Separates large content groups for visual rhythm; usually holds diagrams, timelines, architecture, illustrations. Dark background, centered content, white typography, violet accents.

### Diagrams
SVG-first (scalable, lightweight, accessible, editable). Dark nodes, violet borders, white labels, simple geometry, minimal decoration. Prefer rectangles/circles; avoid unnecessary complexity.

### Timeline
Horizontal: step → arrow → step → arrow → step, each step with number/title/subtitle. On mobile, convert to a vertical timeline (stacked steps) rather than a horizontal scroll.

### Legend
Explains diagrams. Centered, muted, short — never exceed one sentence.

### Footer
Closes the document, reinforces branding. Structure: logo → metadata. Dark background, low visual weight. Informational only — no navigation.

## 9. Interaction states

- **Hover:** subtle elevation, violet border, underline links.
- **Focus:** `outline: 2px solid var(--violet); outline-offset: 3px;` — must be keyboard accessible; use `:focus-visible`, never remove outlines.
- **Active:** slight downward movement, reduced shadow.
- **Disabled:** reduced opacity, `pointer-events: none`, `cursor: not-allowed`.

## 10. Motion

Every animation must answer "what changed?" — if it doesn't aid understanding, remove it. Never used to entertain.

- **Timing:** default 180ms, fast 120ms, slow 250ms, never exceed 300ms.
- **Easing:** `ease` default; `ease-out` for entering, `ease-in` for exiting.
- **Animate:** `opacity`, `transform`, `border-color`, `box-shadow` (GPU-friendly). **Avoid animating:** `width`, `height`, `margin`, `padding`, `top`, `left`.
- **Hover motion:** cards `translateY(-3px)`; links underline + color transition; buttons small elevation, no scaling.
- **Avoid:** parallax, scroll hijacking, large page transitions, exaggerated reveals, spinners (prefer skeleton loaders/shimmer/fade). Content should appear immediately.
- **Feedback:** success = small check icon, fade in, auto-dismiss, no intrusive modals. Errors = simple, readable, high contrast, never color-only.

## 11. Responsive system

Mobile-first: build small-screen-first, progressively enhance. Fewer layout variations, predictable spacing, easier maintenance.

- **Primary breakpoint:** `@media (min-width: 720px)` — separates phones from tablet/desktop. No unnecessary extra breakpoints; rely on fluid `clamp()` sizing instead.
- **Extended (if needed):** `--mobile: 480px; --tablet: 720px; --desktop: 1080px; --wide: 1440px` — only add when the layout genuinely requires it.
- **Fluid typography:** `font-size: clamp(min, preferred, max)`, e.g. `clamp(40px, 6.4vw, 72px)` for every major heading — fewer media queries, smoother scaling.
- **Layout:** mobile = single column everywhere; desktop = cards become 2-column grid, content never stretches past its max width.
- **Spacing scales up continuously:** mobile 16–24px → tablet 24–32px → desktop 32–40px, not abrupt jumps.
- **Images/SVG:** `max-width: 100%; height: auto;` — never fixed dimensions.
- Never "fill" large screens by adding component count — increase whitespace instead.

## 12. Accessibility

- Body text stays comfortably readable; large headings aid scanning; paragraph width stays constrained.
- Dark sections: white text on dark background. Light sections: dark text on white. High contrast throughout.
- Violet is never the only indicator of meaning — labels/structure reinforce it too.
- Use `:focus-visible` (not `:focus`) with `outline: 2px solid var(--violet); outline-offset: 3px;` — never remove outlines.
- Minimum touch target: 44px, especially on mobile.
- Decorative icons: `aria-hidden="true"`. Meaningful icons: require accessible labels.
- Every informative SVG diagram includes `<title>` and `<desc>`.
- Links identifiable without relying on color alone — underline on hover, persistent underline in article content.
- Respect `prefers-reduced-motion: reduce` by disabling animation/transition.

## 13. Branding & tone

Understated — communicates competence, not marketing. Tone: professional, technical, calm, minimal, premium. Personality: confident, never loud, playful, or corporate-heavy — reads like documentation written by engineers.

- **Visual identity:** whitespace, violet accent, rounded geometry, large typography, subtle shadows — these four elements define it.
- **Logo:** simple, flat, minimal, no gradients/heavy decoration; should carry less visual weight than the page title.
- **Illustration:** SVG, flat, minimal, simple geometry, limited palette, high contrast. Avoid 3D, skeuomorphism, heavy textures, realistic imagery.
- **Iconography:** outlined, simple, geometric, monochromatic. Preferred libraries: Lucide, Heroicons, Phosphor, Tabler. Avoid colorful icon packs.
- **Photography (if introduced):** soft lighting, clean backgrounds, neutral colors; avoid stock-photo aesthetics and oversaturation.
- **Copywriting:** short, direct, technical, readable — e.g. "Build a complete solution demonstrating engineering judgment," not "Leverage innovative paradigms to maximize stakeholder value." Clarity over marketing language.
- **Visual hierarchy order:** Typography → Spacing → Color → Elevation → Borders. Never reverse — e.g. don't use bright colors to compensate for weak typography.

## 14. Design rules

1. Content always outranks decoration.
2. Whitespace is a design element — never compress layouts unnecessarily.
3. Purple is an accent, not a background color.
4. One visual focal point per section.
5. Every component should feel related — shared radius, spacing, typography, borders.
6. Prefer consistency over creativity; build a cohesive system, not a collection of unique components.
7. Design for scanning first, reading second — structure should read within seconds.
8. Use elevation sparingly — separation comes from spacing, not shadows.
9. Avoid visual noise — if an element doesn't communicate information or aid usability, remove it.
10. The system should feel timeless — avoid trend-chasing (glassmorphism, neon gradients, overly animated interfaces).
