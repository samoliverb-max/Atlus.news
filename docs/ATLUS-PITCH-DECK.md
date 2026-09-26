---
theme: default
title: Atlus — pitch deck
info: A finite, personal daily paper.
class: text-left
transition: fade-out
clickAnimation: up
mdc: true
fonts:
  sans: PT Serif
  serif: Playfair Display
exportFilename: Atlus-Pitch-Deck
---

<!--
ATLUS PITCH DECK

This is the editable source of truth. One `---` creates one slide.

Preview / present:
  npx --package=@slidev/cli slidev docs/ATLUS-PITCH-DECK.md

Export an editable PowerPoint:
  npx --package=@slidev/cli slidev export docs/ATLUS-PITCH-DECK.md --format pptx-editable --output Atlus-Pitch-Deck

The editable export keeps text, cards and simple shapes as native PowerPoint objects. Reenie Beanie,
PT Serif and Playfair Display need to be installed on the editing computer to prevent font substitution.
Each click build becomes a separate PowerPoint slide when exporting; use `--with-clicks false` to export
one static version of every slide. Keep edits inside the existing content blocks, duplicate a slide to
add a section, and reuse the classes below to retain the Atlus visual system.
-->

<style>
@import url('https://fonts.googleapis.com/css2?family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Reenie+Beanie&display=swap');

:root {
  --royal: #0D1B2A;
  --royal-soft: #142234;
  --platinum: #F8F9FA;
  --amber: #FF6B35;
  --amber-ink: #B83A0C;
  --line-light: rgba(248, 249, 250, .22);
  --line-dark: rgba(13, 27, 42, .15);
}

.slidev-layout { background: var(--platinum); color: var(--royal); font-family: 'PT Serif', Georgia, serif; }
h1, h2, h3, .display { font-family: 'Playfair Display', Georgia, serif; font-weight: 800; letter-spacing: -.045em; }
h1 { font-size: 2.65em; line-height: .98; }
h2 { font-size: 1.7em; line-height: 1.02; margin: 0 0 .42em; }
p { line-height: 1.42; }
.eyebrow { color: var(--amber-ink); font-size: .52em; font-weight: 700; letter-spacing: .22em; margin-bottom: .85em; text-transform: uppercase; }
.hand { color: var(--amber); font-family: 'Reenie Beanie', cursive; font-size: 1.38em; font-weight: 400; line-height: .7; }
.dark { background: var(--royal); color: var(--platinum); }
.dark .eyebrow { color: var(--amber); }
.dark .hand { color: var(--amber); }
.dark h1, .dark h2, .dark h3 { color: var(--platinum); }
.accent { color: var(--amber); }
.accent-ink { color: var(--amber-ink); }
.rule { background: var(--amber); height: 5px; margin: 18px 0 24px; width: 68px; }
.grid-2 { display: grid; gap: 20px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-3 { display: grid; gap: 16px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.card { border: 1px solid var(--line-dark); border-radius: 18px; padding: 18px; }
.dark .card { background: var(--royal-soft); border-color: var(--line-light); }
.light-card { background: #fff; border: 1px solid var(--line-dark); border-radius: 18px; padding: 18px; }
.stat { font-family: 'Playfair Display', Georgia, serif; font-size: 2.65em; font-weight: 800; letter-spacing: -.06em; line-height: .9; }
.label { color: var(--amber); font-size: .58em; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
.small { font-size: .6em; line-height: 1.35; }
.muted { opacity: .72; }
.quote { font-family: 'Playfair Display', Georgia, serif; font-size: 1.15em; line-height: 1.14; }
.pill { border: 1px solid currentColor; border-radius: 999px; display: inline-block; font-size: .56em; letter-spacing: .08em; padding: 6px 11px; text-transform: uppercase; }
.stretch { color: var(--amber); }
.core { color: #3F9E93; }
.discovery { color: #A57CE0; }
.two-line { display: flex; align-items: flex-end; justify-content: space-between; gap: 28px; }
.slidev-vclick-target { transition: opacity 360ms cubic-bezier(.22, 1, .36, 1), transform 360ms cubic-bezier(.22, 1, .36, 1); }
.slidev-vclick-hidden { opacity: 0; pointer-events: none; transform: translateY(8px); }
</style>

<!-- _class: dark -->

<div class="eyebrow">Atlus · September 2026</div>

# A daily paper<br><span class="accent">worth opening.</span>

<div class="rule"></div>

<p class="quote" style="max-width: 710px">A small, deliberate edition of news — chosen with the reader in mind, never sold about them.</p>

<div v-click style="margin-top: 92px">
  <span class="hand">News that makes you more curious.</span>
</div>

<!--
BUILD: Fade in the handwritten line after the title (800ms total). No looping motion.
SPEAKER NOTE: Atlus turns the daily news habit into a finite, intentional experience.
-->

---

<div class="eyebrow">01 · The problem</div>

# Mainstream news<br>is built to <span class="accent-ink">make you click.</span>

<div class="grid-2" style="margin-top: 30px">
  <div v-click class="card">
    <p class="stat accent-ink">42%</p>
    <p><strong>sometimes or often avoid the news.</strong></p>
    <p class="small muted">News feels overwhelming, negative and exhausting.</p>
  </div>
  <div v-click class="card">
    <p class="stat accent-ink">37%</p>
    <p><strong>global trust in news.</strong></p>
    <p class="small muted">The lowest figure since tracking began in 2015.</p>
  </div>
</div>

<p v-click class="quote" style="margin-top: 26px">The audience has not stopped wanting news. It has stopped trusting the way news reaches it.</p>

<!--
BUILD: Reveal 42%, then 37%, then the concluding line. Each rises 8px and fades in over 360ms.
SOURCE: Reuters Institute, Digital News Report 2026.
-->

---

<!-- _class: dark -->

<div class="eyebrow">02 · Who feels it first</div>

# Young people who want<br>to be informed — without<br><span class="accent">living in the feed.</span>

<div class="grid-3" style="margin-top: 28px">
  <div v-click class="card">
    <div class="label">Age</div>
    <p class="quote">18–30</p>
    <p class="small muted">Students and early-career professionals forming their news habits.</p>
  </div>
  <div v-click class="card">
    <div class="label">Behaviour</div>
    <p class="quote">News avoiders</p>
    <p class="small muted">They want to understand the world, but switch off when news feels like a burden.</p>
  </div>
  <div v-click class="card">
    <div class="label">Mindset</div>
    <p class="quote">Intentional readers</p>
    <p class="small muted">They use screen-time tools and value a smaller, better daily ritual.</p>
  </div>
</div>

<p v-click style="margin-top: 28px"><strong>52% of 18–24 year olds</strong> say social, video or AI is their main source of news.</p>

<!--
BUILD: Bring in the three audience cards left to right. Use 120ms offsets; no bounce.
SOURCE: Reuters Institute, Digital News Report 2026.
-->

---

<div class="eyebrow">03 · Why this is a migraine problem</div>

# The choice is currently<br><span class="accent-ink">too much</span> or <span class="accent-ink">nothing.</span>

<div class="grid-2" style="margin-top: 28px">
  <div v-click class="light-card">
    <div class="label" style="color: var(--amber-ink)">The feed</div>
    <p class="quote">Infinite, reactive and optimised for attention.</p>
    <p class="small muted">It creates a habit of exposure without a feeling of understanding.</p>
  </div>
  <div v-click class="light-card">
    <div class="label" style="color: var(--amber-ink)">Avoidance</div>
    <p class="quote">Quieter — but disconnected.</p>
    <p class="small muted">People stop opening the news because the cost to their time and mood feels too high.</p>
  </div>
</div>

<p v-click class="hand" style="color: var(--amber-ink); margin-top: 37px">A better option should feel finite, personal and useful.</p>

<!--
BUILD: Crossfade between the two cards; write the final Reenie Beanie line left to right over 1.6s.
-->

---

<!-- _class: dark -->

<div class="eyebrow">04 · Why we know</div>

# The evidence points in<br>the same direction.

<div class="grid-2" style="margin-top: 26px">
  <div v-click class="card">
    <div class="label">What readers tell us through research</div>
    <p class="quote"><strong>Young adults often engage with low-quality content they do not endorse</strong> — despite wanting high-quality information.</p>
    <p class="small muted">Kim, Buntain &amp; Ciampaglia, 2026 (preprint)</p>
  </div>
  <div v-click class="card">
    <div class="label">What feeds optimise</div>
    <p class="quote">Engagement ranking <strong>amplified hostile, emotionally charged content</strong>; ranking by stated preference reduced it.</p>
    <p class="small muted">Milli et al., PNAS Nexus, 2025</p>
  </div>
</div>

<div class="grid-2" style="margin-top: 16px">
  <div v-click class="card small"><strong>Opal, one sec, Bloom and Brick</strong> show people will pay to spend less time scrolling.</div>
  <div v-click class="card small"><strong>Newsletters and quality publishers</strong> prove there is demand for deliberate news, but do not solve daily personal relevance at scale.</div>
</div>

<!--
BUILD: Reveal research first, then the competitor proof. Keep citations visible with the claim.
SPEAKER NOTE: This slide should never overclaim interviews that have not been conducted. Add interview or pilot findings here as they arrive.
-->

---

<div class="eyebrow">05 · The solution</div>

# One deliberate daily edition.<br><span class="accent-ink">Three reasons to open it.</span>

<div class="grid-3" style="margin-top: 28px">
  <div v-click class="light-card">
    <div class="pill core">Core</div>
    <p class="quote">What you already care about.</p>
    <p class="small muted">A high-quality story close to your interests.</p>
  </div>
  <div v-click class="light-card">
    <div class="pill stretch">Stretch</div>
    <p class="quote">What you want to understand better.</p>
    <p class="small muted">A useful step towards a stated learning goal.</p>
  </div>
  <div v-click class="light-card">
    <div class="pill discovery">Discovery</div>
    <p class="quote">A perspective beyond your usual media diet.</p>
    <p class="small muted">Productive serendipity, within a reader-controlled reach.</p>
  </div>
</div>

<p v-click style="margin-top: 28px">Every recommendation is <strong>personal, visible and adjustable.</strong> The reader can see why it was chosen and change the brief.</p>

<!--
BUILD: Cards enter Core → Stretch → Discovery, 140ms apart. Use a 1px hover lift only in web presentation mode.
-->

---

<!-- _class: dark -->

<div class="eyebrow">06 · Why Atlus can be different</div>

# Built around what the reader<br><span class="accent">volunteers,</span> not what we watch.

<div class="grid-3" style="margin-top: 28px">
  <div v-click class="card"><div class="label">01 · Preferences</div><p class="quote">What you actually enjoy reading.</p></div>
  <div v-click class="card"><div class="label">02 · Goals</div><p class="quote">What you want to understand better.</p></div>
  <div v-click class="card"><div class="label">03 · Knowledge</div><p class="quote">What you already know, so we do not repeat it.</p></div>
</div>

<p v-click class="hand" style="margin-top: 41px">Personalisation should be something you can see and steer.</p>

<!--
BUILD: Reveal the three white cards together, then write the final hand line. Respect prefers-reduced-motion by showing all content immediately.
-->

---

<div class="eyebrow">07 · Early adopters</div>

# Start where the problem<br>is already <span class="accent-ink">felt every day.</span>

<div class="grid-2" style="margin-top: 28px">
  <div v-click class="light-card">
    <div class="label" style="color: var(--amber-ink)">Initial community</div>
    <p class="quote">Durham and Cambridge students, recent graduates, and their peers.</p>
    <p class="small muted">Accessible communities with high social-video news use and a clear reason to build an intentional news habit.</p>
  </div>
  <div v-click class="light-card">
    <div class="label" style="color: var(--amber-ink)">Early use case</div>
    <p class="quote">“Give me five minutes of news that makes me more informed.”</p>
    <p class="small muted">A finite daily edition for readers who want to replace unplanned feed consumption.</p>
  </div>
</div>

<p v-click style="margin-top: 28px"><strong>Acquisition:</strong> campus societies, founder networks, student media, and invite-only cohorts.</p>

<!--
BUILD: Fade the left card up, then the right card; final acquisition line appears on click.
-->

---

<!-- _class: dark -->

<div class="eyebrow">08 · Test the market</div>

# A focused pilot before<br>we build the whole newsroom.

<div class="grid-3" style="margin-top: 28px">
  <div v-click class="card"><div class="label">Recruit</div><p class="quote">50–100 early readers</p><p class="small muted">A defined campus and graduate cohort, invited personally.</p></div>
  <div v-click class="card"><div class="label">Deliver</div><p class="quote">A three-story daily email</p><p class="small muted">Human-curated, with lightweight stated-preference onboarding.</p></div>
  <div v-click class="card"><div class="label">Learn</div><p class="quote">Do they return?</p><p class="small muted">Track activation, 4-week retention, completion, saves and qualitative usefulness.</p></div>
</div>

<p v-click style="margin-top: 30px"><strong>Success gate:</strong> prove that readers open a finite edition repeatedly, describe it as useful, and refer a friend.</p>

<!--
BUILD: Step through Recruit → Deliver → Learn. The build sequence should tell the operating story, not decorate it.
-->

---

<div class="eyebrow">09 · Who we are</div>

# Two young people who<br>have <span class="accent-ink">lived the problem.</span>

<div class="grid-2" style="margin-top: 25px">
  <div v-click class="light-card">
    <div class="label" style="color: var(--amber-ink)">Sam Oliver · CEO &amp; Co-founder</div>
    <p class="quote">Historian with first-class honours from Durham.</p>
    <p class="small muted">Focus on economic history and natural language processing; Durham Venture School participant, 2026–27.</p>
  </div>
  <div v-click class="light-card">
    <div class="label" style="color: var(--amber-ink)">Henry B. Hudson · CTO &amp; Co-founder</div>
    <p class="quote">Computer scientist building the system behind the daily edition.</p>
    <p class="small muted">First-class honours from Durham; incoming Cambridge MPhil in MLMI; founder of the British Algorithmic Olympiad; previous recommendation-systems work at News UK.</p>
  </div>
</div>

<p v-click class="hand" style="color: var(--amber-ink); margin-top: 35px">Refreshingly inexperienced.</p>

<!--
BUILD: Founders arrive together, then draw the handwritten line.
IMAGE OPTION: add /marketing-site/public/images/founders.jpg full bleed on the right if presenting live. Keep this text in a platinum card for legibility.
-->

---

<!-- _class: dark -->

<div class="eyebrow">10 · The next milestone</div>

# Prove the daily habit<br>with a live <span class="accent">pilot cohort.</span>

<div class="grid-2" style="margin-top: 30px">
  <div v-click class="card">
    <div class="label">Next 90 days</div>
    <p class="quote">Launch the first 50–100 reader cohort and run the daily edition long enough to measure a real habit.</p>
  </div>
  <div v-click class="card">
    <div class="label">What we need</div>
    <p class="quote">Pilot readers, editorial partners, product feedback, and support to turn evidence into a repeatable acquisition loop.</p>
  </div>
</div>

<div v-click style="margin-top: 45px">
  <span class="hand">Help us build a better reason to open the news.</span>
  <div class="rule"></div>
  <p>sam@joinatlus.com · joinatlus.com</p>
</div>

<!--
BUILD: Reveal the milestone, then the ask, then the closing hand line. Hold on this slide; do not auto-advance.
-->
