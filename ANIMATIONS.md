# Motion for the NHCX landing site — what could be animated, and how

A proposal. Nothing here is implemented; it describes animation the site could
carry, section by section, with the mechanism, timing and cost of each, so the
pieces can be picked and built in any order.

## 1. Principles

The site is a government programme's front door for integrators. Motion has to
explain or acknowledge, never entertain. Five rules keep it that way:

1. **Every animation encodes something true.** A packet moves because a claim
   moves between provider, exchange and payer. A number counts up because it is
   a live figure. Decoration that could sit on any site is left out.
2. **Short and eased-out.** Micro-interactions 120–160 ms, reveals 240–320 ms,
   one orchestrated "story" moment up to ~1.6 s. Entrances use an ease-out
   curve (`cubic-bezier(0.2, 0.7, 0.2, 1)`); exits ease-in and are faster.
3. **Only `transform` and `opacity`** (plus `stroke-dashoffset` on SVG). Nothing
   that triggers layout, nothing that shifts content the reader is looking at.
4. **Reduced motion wins.** `styles/globals.css` already zeroes every
   transition and animation under `prefers-reduced-motion: reduce`; every idea
   below must degrade to its final state under that rule, with no information
   lost.
5. **No JavaScript needed to see the content.** The site is a static export.
   Anything revealed on scroll starts *visible* and is only hidden once a small
   script has attached — a reader without JS, a crawler or a print sees the
   whole page.

Three tokens make timing consistent everywhere:

```css
:root {
  --motion-fast: 120ms;   /* hover, focus, toggles */
  --motion-base: 240ms;   /* reveals, panels */
  --motion-slow: 480ms;   /* count-ups, drawn strokes */
  --ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
}
```

## 2. Chrome (every page)

**Sticky navigation gains a hairline shadow once the page scrolls.** The
`.navbar` is sticky already; when the reader has scrolled past the masthead a
`0 1px 0 var(--line), 0 6px 20px rgba(20,33,61,.06)` shadow fades in over
`--motion-fast`. Tells the reader the bar is now floating over content.
*Mechanism:* an `IntersectionObserver` on a 1 px sentinel above the navbar
toggles `.is-stuck`. Cost: ~10 lines.

**Active link underline slides between items.** Instead of each link having
its own underline, one `::after` bar on the active link animates
`transform: translateX()` on hover across siblings and settles back on blur.
Optional; the plain per-link underline is fine.

**Cross-page fade.** Because every route is its own HTML file, use the View
Transitions API for navigations: `@view-transition { navigation: auto; }` gives
a 200 ms cross-fade between pages in Chromium and Safari, and is ignored
elsewhere. One declaration, zero JavaScript, and the header — which is now the
same width on every page — reads as staying put while the content swaps.

## 3. Home page, top to bottom

### Hero — the exchange diagram (`.xd`)

The most characteristic thing on the site: provider ↔ exchange ↔ payer with
arrows between them. It should be the one orchestrated moment.

- On first paint the three nodes fade-up in sequence (0, 80, 160 ms).
- Then a small packet (a 6 px circle, `--primary`) travels along the left
  arrow to the hub, pauses 200 ms, continues along the right arrow to the payer,
  and a second packet returns — one request, one response. Total ≈ 1.6 s,
  played once; after that the arrows idle with a slow `stroke-dashoffset` drift
  (12 s loop, barely perceptible) so the diagram feels live, not looping.
- *Mechanism:* `offset-path` along the existing `.xd-arrows` path data, or two
  CSS keyframes translating along a straight arrow. No library.

### Start tiles (`.start-grid .tile`)

Four tiles fade-up with a 60 ms stagger on load (they are above the fold, so
this is a load animation, not a scroll reveal). The hover arrow nudge
(`.tile:hover .tile-arrow`) exists already and stays.

### Actors strip

Nothing. A row of names should not move. At most a hover state that lifts the
text colour to `--primary` over `--motion-fast`.

### Auto-adjudication pipeline (`.flow`)

The second place motion explains rather than decorates.

- `.flow-link::before` is a dashed line: while the section is in view, animate
  `background-position` / `stroke-dashoffset` so the dashes march toward the
  hub — direction shows which way the claim travels. Loop, 1.2 s, linear.
- `.flow-packet` slides from the card to the hub once, when the section enters
  the viewport (`--motion-slow`, ease-out).
- `.flow-checks` items tick in one after another (each check icon draws its
  stroke in 240 ms, 120 ms apart) — the reader watches the checks being made.
- The `.figures` below count up (see Live stats).

### Capabilities checklist (`.checklist`)

Each `.check-icon` is an SVG tick: set `stroke-dasharray` to the path length
and animate `stroke-dashoffset` from that to 0 in `--motion-slow` when the row
scrolls in, 80 ms stagger. Fills `--green-tint` fades in behind. The tick
"being drawn" says *verified*, which is the section's claim.

### Split benefits

Left column slides in from −12 px, right from +12 px, both to 0 with opacity,
`--motion-base`. The two sides arriving from two directions matches "provider
side / payer side".

### Live stats (`.live-number`)

- **Count-up** from 0 to the figure over `--motion-slow` × 2 (≈1 s) with an
  ease-out curve so the last digits settle slowly. `font-variant-numeric:
  tabular-nums` is already set, so the width does not jitter. Group separators
  are formatted with `Intl.NumberFormat('en-IN')` at every frame.
- **Status dot pulse** on `.status-dot.ok`: a soft ring (`box-shadow` of the
  green at 0 → 8 px, opacity 0.35 → 0) every 2.4 s. The one ambient loop on
  the page besides the hero drift; it says "live" without a word.

### Numbered process (`.process`)

This is a real sequence, so the numbering carries information and can be
animated as one: the `.process-num` badges scale from 0.8 → 1 with opacity,
100 ms apart, and a thin connecting rule under the row grows from 0 → 100 %
width over `--motion-slow`. Reads as "these happen in this order".

### DevTools section (`.kit-panel`)

`.kit-metric-value` figures count up like the live stats; `.kit-step` cards
fade-up with a 60 ms stagger. The primary button gets a `translateY(-1px)`
lift on hover (`--motion-fast`) — the only hover lift on the site, reserved
for the primary action.

### FAQ (`details`)

Native `<details>` snaps open. Replace with a height animation that keeps
`<details>` semantics: wrap the answer in a grid whose
`grid-template-rows` transitions `0fr → 1fr` over `--motion-base`, and rotate
`.faq-plus` 45° into a minus at the same time. No JavaScript, keyboard and
screen readers unaffected.

### CTA band

Nothing beyond the button hover states. A dark band that moves reads as an
advertisement.

## 4. Sub-pages

**DevTools page (`.kitp-flow`).** The source → connector → target row gets the
same marching dashes as the pipeline, and `.kitp-build` (the version card)
fades in 120 ms after the heading so the eye lands on the title first.

**Downloads page.** Table rows fade-up 40 ms apart on first view, group by
group; the download button gets a 2 px downward nudge on hover (the direction
a file goes), the counterpart of `.link-arrow`'s rightward nudge. On the
DevTools page, the "Recommended for this machine" card (`.dlt-pick`) arrives
after platform detection and should fade-up rather than pop.

**Documentation.** The assistant already animates in (`chatIn`, 160 ms). Add:
the active chapter marker in `.docs-nav` slides between entries instead of
jumping (`transform` on a single indicator element); the "on this page" list
cross-fades the active heading over `--motion-fast`; while an answer streams,
a 1 px-wide caret blinks at the end of the text (600 ms, steps(2)). Citations
that open a page in the reader scroll the reader with
`scroll-behavior: smooth` (already set) and flash the target heading's left
border in `--saffron` once, 800 ms, so the reader sees where they landed.

**Apply form.** On submit, the button label swaps to "Submitting…" — add a
14 px inline spinner (border-top in `--primary`, 700 ms linear rotation). On
success the `.ap-success` card fades-up and the application ID counts its
characters in like a typed receipt (40 ms per character). Validation errors
slide down 4 px with opacity rather than appearing.

**News and releases.** Entries fade-up on scroll with a 50 ms stagger; that
is all. A `.rn-channel` "production" pill could pulse once when the page
loads if the newest note is a production release.

## 5. Implementation shape

One small client component does all the scroll work:

```tsx
// components/Reveal.tsx — 'use client'
// Adds .is-armed to <html> after hydration (so CSS can hide .reveal elements
// only when JS is present), then observes every [data-reveal] and adds
// .is-in when it enters the viewport. Stagger comes from --i on the element.
```

```css
html.is-armed [data-reveal] { opacity: 0; transform: translateY(12px); }
html.is-armed [data-reveal].is-in {
  opacity: 1; transform: none;
  transition: opacity var(--motion-base) var(--ease-out),
              transform var(--motion-base) var(--ease-out);
  transition-delay: calc(var(--i, 0) * 60ms);
}
```

Count-ups are a second tiny component (`<CountUp value={…} />`) that renders
the final number on the server and animates only after mount — the static HTML
always contains the real figure. Drawn strokes and marching dashes are pure
CSS keyed off the same `.is-in` class. The hero packet is CSS keyframes on two
`<circle>` elements added to the existing SVG.

Everything above fits in roughly 120 lines of CSS and two components under
2 KB gzipped. No animation library.

## 6. Priority

| Tier | What | Why first |
| --- | --- | --- |
| 1 | Scroll reveal with stagger; nav shadow on scroll; FAQ height animation; live-stat count-up; view-transition cross-fade | Cheapest, touch every page, each fixes a small roughness the site has today |
| 2 | Hero packet sequence; pipeline marching dashes and check ticks; capability tick draw | The two places motion explains the product; a day of work together |
| 3 | Process rule grow; documentation chapter indicator; apply-form spinner and receipt; downloads row stagger | Polish; do when the pages they belong to are next touched |

## 7. What not to add

Parallax, scroll-jacking, background gradients that drift, autoplaying video,
hover effects on body text, animated counters that restart on every scroll,
anything longer than two seconds, and any motion that plays while the reader
is trying to read the documentation.
