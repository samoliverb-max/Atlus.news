# Atlus — style guide

Pulled from what's actually implemented across both front ends: `marketing-site/` (the public site) and `frontend/onboarding-prototype.html` (the onboarding flow). Every value below is a real token in the code, not an approximation — file and line noted throughout, so you can find and change the source of truth rather than a description of it.

The two front ends share a design language but not a stylesheet — the marketing site is Tailwind v4 with CSS custom properties, the onboarding flow is hand-written CSS in one file. Colours and fonts match; component patterns (buttons, cards, chips) are separately implemented in each. That's noted per-section below.

---

## 1. Colour

### 1.1 The live palette ("15a")

Three colours carry the entire brand. Defined in [marketing-site/src/styles.css:88-99](../marketing-site/src/styles.css) and mirrored in [frontend/onboarding-prototype.html:17](../frontend/onboarding-prototype.html) under different variable names.

| Role | Marketing token | Onboarding token | Hex | Swatch |
|---|---|---|---|---|
| Deep royal blue — the dark ground | `--color-royal` | `--bg` | `#0D1B2A` | ![#0D1B2A](https://placehold.co/16x16/0D1B2A/0D1B2A.png) |
| Royal, one step lighter — cards on dark | `--color-royal-soft` | `--card` | `#142234` | ![#142234](https://placehold.co/16x16/142234/142234.png) |
| Platinum — the light ground | `--color-platinum` | `--ink` (as a colour value, confusingly) | `#F8F9FA` | ![#F8F9FA](https://placehold.co/16x16/F8F9FA/F8F9FA.png) |
| Amber / burnt orange — the one accent | `--color-amber` | `--accent` | `#FF6B35` | ![#FF6B35](https://placehold.co/16x16/FF6B35/FF6B35.png) |
| Amber, lighter | `--color-amber-soft` | `--accent-soft` | `#FF8656` | ![#FF8656](https://placehold.co/16x16/FF8656/FF8656.png) |
| Amber, darkened for AA on light grounds | `--color-amber-ink` | *(none — see 1.2)* | `#B83A0C` | ![#B83A0C](https://placehold.co/16x16/B83A0C/B83A0C.png) |

That's the whole palette for brand moments — logo, CTA, accents, headline colour. Everything else is royal, platinum, and the greys between them.

**An older, unused palette still sits in the CSS** — `--parchment`, `--peach`, `--sky`, `--butter`, `--coral`, `--teal`, `--purple`, `--blue`, `--lime`, defined at [styles.css:70-86](../marketing-site/src/styles.css). Nothing in either front end references them (verified — zero hits across `marketing-site/src` and `frontend/`). Treat them as dead code, not a secondary palette to draw from.

### 1.2 The contrast rule — the one thing that isn't obvious from looking

**Raw amber (`#FF6B35`) only passes WCAG AA as text on the royal (dark) background.** On platinum or any light ground it measures 2.7:1 — below the 4.5:1 AA floor, and below even the 3:1 large-text minimum. This was a real, shipped bug (see the comment at [styles.css:99](../marketing-site/src/styles.css)), fixed by adding `--amber-ink` (`#B83A0C`, 5.5:1 on platinum) and swapping to it automatically wherever a section isn't on the royal ground:

```tsx
// index.tsx — Section component, marketing-site/src/routes/index.tsx:73-77
const onRoyal = (bg ?? "").includes("royal");
style={{
  ...(onRoyal ? {} : { ["--color-amber" as string]: "var(--color-amber-ink)" }),
}}
```

**The rule to carry forward:** amber text/accents on a dark (royal) ground use `--color-amber`. Amber text/accents on a light (platinum) ground must use `--color-amber-ink` instead — never raw `--color-amber`. If you add a new section or component, check which ground it sits on before picking the amber variable.

The onboarding flow doesn't have this problem because it never puts amber text on a light background — it's dark-mode throughout.

### 1.3 Supporting colours (onboarding flow only)

The onboarding UI's category tags and secondary states use a slightly wider set, all defined at [onboarding-prototype.html:17-20](../frontend/onboarding-prototype.html):

| Token | Hex | Used for |
|---|---|---|
| `--green` | `#3F9E93` | "Core" article category tag |
| `--purple` | `#A57CE0` | "Discovery" article category tag, Knowledge-vector rows |
| `--blue` | `#6E9BE8` | Political-vantage rows |
| `--danger` | `#E56A5C` | Excluded-topic chips, geography "not interested" state |
| `--muted` | `rgba(248,249,250,.62)` | Secondary/helper text — platinum at 62% opacity |
| `--line` | `rgba(248,249,250,.16)` | Borders, dividers — platinum at 16% opacity |

These don't appear in the marketing site. If the marketing site ever needs to show reading-mode categories (Core/Stretch/Discovery) to explain the product, reuse these three — green/amber/purple — rather than inventing new ones.

---

## 2. Typography

### 2.1 The font stack

Six families, each with one job. Loaded via Google Fonts in [marketing-site/src/routes/\_\_root.tsx:88](../marketing-site/src/routes/__root.tsx):

| Token | Family | Role |
|---|---|---|
| `--font-display` | Playfair Display | Headlines — the serif display face. Weight 700–800 only. |
| `--font-serif` | PT Serif | Body copy, buttons, UI labels. The workhorse font — almost everything that isn't a headline. |
| `--font-hand` | Reenie Beanie | The handwritten "u" in the logo, and hand-drawn annotations (arrows, circles, underlines). |
| `--font-hand-alt` | Caveat | Fallback/alternate handwriting — used sparingly. |
| `--font-marker` | Permanent Marker | Not currently used in either front end — reserved. |
| `--font-scrawl` | Kalam | Not currently used in either front end — reserved. |

The onboarding flow only defines and uses three of these — `--font-display`, `--font-serif`, `--font-hand` — since it has no need for the marker/scrawl variants.

### 2.2 The Reenie Beanie weight bug — a real fix, don't undo it

Reenie Beanie ships **one weight (400)**. The handwritten "u" sits inside brand wordmarks set at weight 800 (Playfair Display), and without an explicit override it inherited that 800 and the browser synthesized a fake bold by smearing the glyph — which made the handwriting stop looking like handwriting. Fixed once, centrally, in both codebases:

```css
/* marketing-site/src/styles.css — .hand utility class */
.hand {
  font-family: var(--font-hand);
  font-weight: 400;
  font-synthesis-weight: none;
  font-synthesis: none;
}
```

```css
/* onboarding-prototype.html:28 — the equivalent, scoped to logo instances */
.logo .u, .site-header .brand .u, .footer-wordmark .u {
  font-weight: 400;
  font-synthesis-weight: none;
  font-synthesis: none;
}
```

**Rule:** any new handwritten element (`--font-hand` or `--font-hand-alt`) sitting inside a bold-weight parent needs this same override, or the bug comes back. Apply the `.hand` class rather than setting `font-family` directly.

### 2.3 Scale

Sizes are fluid (`clamp()`) on the marketing site, fixed pixels in the onboarding flow (it's a fixed-width card layout, not a responsive page).

| Use | Marketing site | Onboarding flow |
|---|---|---|
| Hero headline | `clamp(4.5rem, 14vw, 11rem)`, weight 800, `leading-[0.95]`, Playfair Display | — (no hero) |
| Section heading (h2) | `clamp(2rem, 4.5vw, 3.6rem)`, weight 700, `leading-[1.05]`, Playfair Display | `h1`: 25px, weight 800, `line-height:1.22`, Playfair Display |
| Eyebrow label | `text-sm`, `tracking-[0.25em]`, uppercase, PT Serif, amber | — |
| Body / explainer | `text-lg`, `leading-relaxed`, PT Serif | `.sub`: 14.5px, `line-height:1.6`, muted colour |
| Handwritten slogan | `clamp(1.5rem, 3vw, 2.4rem)`, `leading-[1.1]`, Reenie Beanie | — |
| Chip / button label | `text-sm` | 13.5–14.5px, PT Serif |
| Uppercase tag (category, kicker) | `tracking-[0.25em]` | `letter-spacing:.08–.1em`, `text-transform:uppercase` |

**Convention worth keeping:** uppercase labels always get letter-spacing (0.08–0.25em) — never uppercase text set tight. It's used consistently for eyebrows, category tags, and profile-row labels.

---

## 3. Shape, spacing, motion

### 3.1 Corner radius

Two values, used by role, not by component:

- **`rounded-full` / `border-radius: 999px`** — anything clickable: buttons, chips, pills, the CTA. This is the dominant radius across both front ends.
- **`rounded-2xl` / `18px` / `14px` / `12px`** — containers: cards, input fields, the onboarding `.card`, chip groups. Roughly "large radius for the outer container, this same family for anything nested inside it" rather than one fixed number.

There's no sharp corner (`rounded-none` / `0px`) anywhere in either front end. If you add a new component, round it — nothing in this system stays square.

### 3.2 Section rhythm (marketing site)

Every marketing section shares one padding pattern, from the `Section` component at [index.tsx:69](../marketing-site/src/routes/index.tsx):

```
px-6 py-24 sm:px-10 sm:py-32
```

i.e. generous vertical breathing room (24–32 Tailwind units ≈ 96–128px) that grows slightly on larger screens, content capped at `max-w-5xl` and centred. New sections should reuse the `Section` component rather than hand-rolling padding — that's what keeps the page's rhythm consistent as you scroll.

### 3.3 Motion

Deliberately minimal — nothing bounces, nothing spins.

- **Buttons on hover:** `translateY(-1px)` (onboarding) or `hover:-translate-y-0.5` (marketing) — a small lift, nothing more.
- **Transitions:** `transition-transform` / `transition: transform .15s` — fast, and scoped to the one property that's actually changing. No `transition: all`.
- **Progress bar fill, toast fade:** `.4s` / `.3s` — the only "slow" transitions in the system, both communicating state change rather than decoration.

---

## 4. Components

### 4.1 Buttons

**Primary** (amber fill) — the one call-to-action colour in the system:

```css
/* onboarding: button.btn */
background: var(--accent); color: #fff; font-weight: 700;
border-radius: 999px; padding: 12px 24px; border: none;
```
```jsx
{/* marketing: the waitlist / hero CTA */}
className="rounded-full px-6 py-3 text-sm font-semibold tracking-wide
           transition-transform hover:-translate-y-0.5"
style={{ background: "var(--color-amber)", color: "var(--color-royal)" }}
```

Note the text colour differs by context: white on the onboarding flow's dark ground, royal (not white) on the marketing site's amber button — because amber-on-white-text fails contrast in a way amber-on-royal-text doesn't. Check contrast before copying one pattern into the other's context.

**Secondary / ghost** — outlined, transparent fill, used for "Back", "Skip", "How it works":

```css
button.btn.ghost { background: none; border: 1px solid var(--line); color: var(--ink); }
```
```jsx
className="rounded-full border px-6 py-3 text-sm tracking-wide transition-colors hover:bg-white/5"
```

**Rule:** exactly one amber-filled button per view. Every other action is a ghost/outline button. This is what keeps the CTA meaningful — if everything is amber, nothing is.

### 4.2 Chips (onboarding flow)

The topic-picker, source-picker, and country-picker all reuse one chip pattern — [onboarding-prototype.html:39-43](../frontend/onboarding-prototype.html):

| State | Style |
|---|---|
| Default | `border: 1px solid var(--line)`, `background: var(--card2)`, pill radius |
| Hover | Border becomes `var(--accent)` |
| Selected (`.on`) | Filled `var(--accent)`, white text, weight 700 |
| Excluded/negative (`.excl.on`) | Filled `var(--danger)` instead of accent — same shape, different meaning |

This is a three-state toggle pattern (off / on / excluded) rather than a plain checkbox — worth preserving if you add new multi-select steps, since "excluded" is a distinct, deliberately red state from "not selected."

### 4.3 Cards

- **Onboarding `.card`:** `background: var(--card)`, `border: 1px solid var(--line)`, `border-radius: 18px`, `padding: 28px`, plus a two-layer shadow that lifts it off the dark ground:
  ```css
  box-shadow: 0 1px 2px rgba(0,0,0,.25), 0 20px 45px rgba(0,0,0,.35);
  ```
  Every step of the flow is one card, centred, `max-width: 680px`. This is the **only** shadow in either front end — reserved for "the one thing on screen you're meant to focus on," not applied to chips, buttons, or nested rows inside the card.
- **Marketing site:** cards are less prominent — content mostly sits directly in sections rather than boxed, and nothing there uses a shadow at all. Depth on the marketing site comes from colour contrast (royal-soft on royal, platinum on parchment) and border only.

### 4.4 Category tags (Core / Stretch / Discovery)

The three reading-mode categories each get a colour, a consistent 22%-opacity tinted background, and full-opacity text — never a solid fill:

```css
.cat.core      { background: rgba(63,158,147,.22);  color: var(--green); }
.cat.stretch   { background: rgba(255,107,53,.22);   color: var(--accent); }
.cat.discovery { background: rgba(165,124,224,.22);  color: var(--purple); }
```

If this trio ever needs to appear on the marketing site (e.g. explaining reading modes), reuse green/amber/purple at this same tint level rather than introducing new hues — it's already established as "these three colours mean these three categories" inside the product itself.

---

## 5. Voice and one recurring UI convention

Not a visual token, but worth stating because it shapes layout decisions: **every optional or sensitive field says so explicitly, inline, next to the label** — e.g. `Your political vantage point (optional)`, `Sensitive details (every field skippable)`. This isn't decorative copy; it's load-bearing for the product's "volunteered data only" promise (see [CLAUDE.md](../CLAUDE.md)). Any new form field touching political opinion or demographic data needs the same inline disclosure, styled as a smaller, muted span next to the heading — not a tooltip, not a separate paragraph.

---

## 6. Quick reference — copy-paste tokens

```css
/* Brand */
--royal:       #0D1B2A;   /* dark ground */
--royal-soft:  #142234;   /* cards on dark */
--platinum:    #F8F9FA;   /* light ground */
--amber:       #FF6B35;   /* accent — dark grounds only */
--amber-ink:   #B83A0C;   /* accent — light grounds only (AA-safe) */
--amber-soft:  #FF8656;

/* Fonts */
--font-display: "Playfair Display", Georgia, serif;   /* headlines, 700–800 */
--font-serif:   "PT Serif", Georgia, serif;            /* everything else */
--font-hand:    "Reenie Beanie", cursive;              /* pin weight:400, always */

/* Shape */
border-radius: 999px;   /* anything clickable */
border-radius: 12–18px; /* containers */

/* The one rule that matters most: */
/* amber text on dark ground → --amber   */
/* amber text on light ground → --amber-ink */
```
