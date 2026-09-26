# Atlus motion guide

Use this guide for the marketing site and onboarding UI. The aim is a calm, editorial rhythm: motion confirms a choice or helps the reader keep their place. The brand carries the continuity between the two separate apps: royal `#0D1B2A`, platinum `#F8F9FA`, amber `#FF6B35`, Playfair Display for the wordmark, PT Serif for supporting copy, and the handwritten Reenie Beanie `u`.

## Motion values

| Moment | Duration | Movement | Easing |
| --- | --- | --- | --- |
| Hero title | Same as closing Join Atlus | Static serif letters; shared handwriting reveal and double underline | Shared ink easing |
| Hero daily edit | About 5.6 s | Cards arrive, settle into an edition, reveal reasons, then finish | GSAP sequence at 0.7 speed |
| Handwriting | Up to 2.43 s per phrase | Solid glyphs reveal left to right without fading | Linear |
| Shared underline / arrow | About 1.07 s per stroke | Stroke draws along its path; second stroke begins 643 ms after the first | `power1.inOut` |
| Replay reset | 160 ms out, 300 ms in | Edition fades out before cards reset, then fades in as playback begins | `power1.out` |
| Button, chip, or choice hover | 150 ms | Rise 1–2 px | `ease` |
| Onboarding progress | 400 ms | Width only | `cubic-bezier(.22, 1, .36, 1)` |
| New onboarding step | 360 ms | Fade in and rise 8 px | `cubic-bezier(.22, 1, .36, 1)` |
| Marketing to onboarding handoff | 420 ms | Dark surface fades in; amber rule draws left to right | `cubic-bezier(.22, 1, .36, 1)` |
| Toast | 300 ms | Opacity only | browser default ease |

The marketing hero is a finite GSAP sequence. The title uses the closing Join Atlus components and viewport timing: the handwritten `u`, tagline, and double underline draw in while the serif letters stay still; loose story fragments and Core, Stretch, and Discovery cards gather into a small daily edition. It ends after the check mark and only runs again when the reader chooses **Replay**. Every orange Reenie Beanie phrase uses the shared `Handwriting` component and the same left-to-right glyph reveal. Timing lives in `marketing-site/src/lib/motion.ts`.

Timings in the table are visible durations, after the shared 0.7 playback rate. Source timeline values are divided by 0.7. For the hero heading and the rest of the page, `useInkReveal` triggers text and marks once as they enter the viewport and reverts inline animation styles if reduced motion is enabled. The brief navigation overlay keeps its wordmark fully visible so navigation cannot interrupt a half-written letter.

## Email handoff

1. The reader submits a valid email on the marketing page. Keep the form visible and show **Starting…** while `POST /onboarding/start` runs. Do not animate away on an error.
2. After a successful response with a `resume_token`, show the full-screen royal handoff. Centre the Atlus wordmark, draw a short amber rule, and say **Making this yours…**. This takes 420 ms.
3. Navigate to the onboarding origin with `?r=<resume_token>`. The onboarding app rehydrates that session and opens the next unanswered step. Its card enters with the 360 ms step motion. A returning reader sees the correct saved step, not the welcome screen.
4. If the reader prefers reduced motion, navigate immediately and render cards without entrance animation. Keep all labels, focus states, and progress information available.

The marketing site reads `VITE_ONBOARDING_URL` at build time. Locally it defaults to `http://localhost:4000`; the production fallback is `https://app.joinatlus.com`. Set it to the actual deployed onboarding origin before publishing. The backend must serve the onboarding UI at `/` and accept the marketing origin for `POST /onboarding/start`.

## Onboarding steps

- Animate the new card once after each step change. Keep the page background and header steady so the reader retains context.
- Progress width changes over 400 ms. Do not make it jump back between steps or run a continuous loading loop.
- Chips and choices respond within 150 ms. A selected choice must be clear from its fill and text color, without relying on motion alone.
- Keep hover movement to 1 px. Preserve a visible amber keyboard focus outline.
- Do not stagger every chip, animate the whole map, or add looping decoration to the form. The reader's answers should remain the focus.
- Save errors stay on the current step. The same card remains visible so the reader can retry.

## Implementation references

- Marketing email handoff: `marketing-site/src/routes/index.tsx` (`Waitlist`) and `marketing-site/src/styles.css` (`.onboarding-handoff`).
- Marketing hero composition: `marketing-site/src/components/atlus/Hero15a.tsx` and `AnimatedHero.tsx`.
- Marketing hero timing: `marketing-site/src/lib/motion.ts`; handwriting reveal: `marketing-site/src/lib/handwriting.ts`.
- Onboarding step, progress, choice and reduced-motion rules: `frontend/onboarding-prototype.html`.

When adding motion, animate `opacity` and `transform` where possible. Test at narrow and wide widths, with keyboard navigation and `prefers-reduced-motion: reduce` enabled.
