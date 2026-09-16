# DATA-CONTRACT.md — the shape of onboarding answers and how they reach the backend

This is the interface between the frontend (prototype) and the backend Claude Code will build. Build both sides against this and they meet in the middle. Every payload below mirrors a step in `frontend/onboarding-prototype.html`.

## Principle

The frontend never sends "final weights". It sends **raw answers**. The backend runs spreading activation server-side and derives the weights. This keeps the algorithm in one place (the backend) and means answers can be re-processed if the algorithm improves.

All writes are **per step** and **idempotent** on `(user_id, step)`, so a reader can resume. Each response returns the current `onboarding_progress` so the frontend knows where to continue.

---

## Auth / resumability

Email-first, so onboarding starts before there is a password.

- `POST /onboarding/start` → `{ email }` → creates a user, returns `{ user_id, resume_token }`. Email the reader a magic link containing `resume_token`.
- Every subsequent call carries `resume_token` (header `X-Atlus-Resume`).
- `GET /onboarding/state?token=…` → returns all answers saved so far + `current_step`.

---

## The per-step endpoints and payloads

Each maps to one screen. `step` values match the prototype's `STEPS` array.

### 1. `POST /onboarding/topics`  (Preference)
```json
{ "step": "topics", "topic_qcodes": ["medtop:13000000","medtop:04000000","medtop:11000000"] }
```
Backend: `spread(P, qcode, 0.6)` for each. Min 3 enforced.

### 2. `POST /onboarding/depth`  (Preference, finer)
```json
{ "step": "depth", "subtopic_qcodes": ["medtop:20000575","medtop:20000344"] }
```
Backend: `spread(P, qcode, 0.75)`.

### 3. `POST /onboarding/sources`  (Preference + Knowledge)
```json
{ "step": "sources",
  "outlets": ["BBC News","Financial Times"],
  "platforms": ["Apple News","TikTok"] }
```
Backend: each source has a stored IPTC distribution (see `source_profiles` seed). Outlets add P (×0.4) and K (×0.5). Platforms add P only (×0.25), never K — reading news on a platform signals taste, not depth. Store the raw selections too: the platform list is a valuable read on the reader's current algorithmic diet.

### 4. `POST /onboarding/goals`  (Goal)
```json
{ "step": "goals", "goal_text": "I want a firmer grasp of economics and to follow AI without the hype." }
```
Backend: LLM (or keyword map at MVP) → goal nodes with an `intent` of `deepen` or `diverge`. `spread(G, node, 0.7)`. If empty, seed G from the top two P nodes, flagged `unconfirmed`.

### 5. `POST /onboarding/knowledge`  (Knowledge)
```json
{ "step": "knowledge",
  "levels": { "medtop:13000000": 0.9, "medtop:04000000": 0.45, "medtop:11000000": 0.1 } }
```
Values: new=0.1, casual=0.45, read-closely=0.9. Backend: `spread(K, node, value)`.

### 6. `POST /onboarding/political-consent`  (consent gate — REQUIRED before step 7)
```json
{ "step": "political_consent", "consent": true, "consented_at": "2026-07-24T10:00:00Z" }
```
If `false`, skip steps 7–8 entirely and record the refusal. Political opinion is UK GDPR Art. 9 data.

### 7. `POST /onboarding/political`  (political axes — only if consented)
```json
{ "step": "political",
  "issue_responses": [ { "id": 0, "axis": "econ", "dir": 1, "value": 90 }, { "id": 3, "axis": "soc", "dir": 1, "value": 40 } ] }
```
`value` 0–100 (disagree→agree). Backend folds to four axis scores in [-1,1]:
`signed = ((value-50)/50) * dir`, then average per axis into `user_political.{econ,soc,intl,inst}`. Unanswered issues omitted.

### 8. `POST /onboarding/lens`  (how to USE the politics — only if consented)
```json
{ "step": "lens",
  "lenses": { "medtop:11000000": "challenge", "medtop:04000000": "match", "medtop:14000000": "balance", "medtop:06000000": "balance" } }
```
Per charged topic: `match` | `balance` | `challenge`. Stored in `user_political.lenses` (jsonb). Drives the recommender's viewpoint modifier.

### 9. `POST /onboarding/geography`  (Geo)
```json
{ "step": "geography",
  "interests": { "CN": 2, "JP": 1, "US": -1 } }
```
Values: 2 very-interested, 1 interested, -1 rather-not. Stored per ISO-2 country in `user_geo`. Recommender boosts (+0.8 / +0.35) or damps (-0.8) articles tagged with those countries.

### 10. `POST /onboarding/reach`  (config)
```json
{ "step": "reach", "discovery_reach": 1, "excluded_qcodes": ["medtop:15000000","medtop:16000000"] }
```
`discovery_reach`: 0 Gentle / 1 Balanced / 2 Adventurous. Excluded nodes zeroed and never surfaced (incl. descendants).

### 11. `POST /onboarding/delivery`  (config)
```json
{ "step": "delivery", "mode": 3, "send_time": "07:00", "timezone": "Europe/London", "cadence": "daily" }
```
`mode`: 1 Light / 3 Standard / 5 Deep. `cadence`: daily | weekdays | weekends.

### 12. `POST /onboarding/demographics`  (non-sensitive; all optional)
```json
{ "step": "demographics",
  "age_band": "25-34", "education": "Postgraduate degree", "region": "London", "work_field": "Technology" }
```
Any field may be `null` ("prefer not to say").

### 13. `POST /onboarding/demographics-consent` + `POST /onboarding/sensitive`  (Art. 9; optional)
```json
{ "step": "sensitive_consent", "consent": true, "consented_at": "..." }
```
then, only if consented:
```json
{ "step": "sensitive",
  "ethnicity": "White", "religion": "No religion", "orientation": "Heterosexual / straight" }
```
Every field independently nullable and independently erasable.

### 14. `GET /onboarding/profile`  (read-back)
Returns the derived weights + all stored answers in plain form for the confirm screen. Must also be reachable post-onboarding as the editable profile page.

### 15. Complete
`POST /onboarding/complete` → marks profile active, schedules first send.

---

## The daily loop (post-onboarding)

- **Recommender job**: per active user, port of `recommend()` in the prototype → returns N articles with `{qcode_matches, category, explanation}`. Renders the email.
- **Feedback endpoint**: `GET /f/{signed_token}` where the token encodes `{user_id, article_id, qcodes, action}` and `action ∈ {more,less,basic,further}`. Applies:
  - `more`: `+0.15 P` on each node · `less`: `-0.20 P` · `basic`: `+0.20 K` · `further`: `+0.20 G`.
  Signed, single-purpose, no login. This is the volunteered, non-tracking profiling channel.

---

## Spreading activation (the one function to port exactly)

```
spread(vector, qcode, w):
    vector[qcode] += w                      # capped at 1.0
    for (neighbour, type) in edges(qcode):
        if type == "parent":   vector[neighbour] += w * 0.45
        elif type == "child":  vector[neighbour] += w * 0.35
        elif type == "related":vector[neighbour] += w * 0.40
        elif type == "sibling":vector[neighbour] += w * 0.15
```
`edges()` reads `topic_edges`. Weights are stored in `user_topic_weights(user_id, qcode, vector, weight, source)`.

Reference values for the recommender's modifiers (geo boosts, lens boosts, hop bands, category scores) are all in `recommend()` in the prototype — copy them; they are already tuned and tested.
