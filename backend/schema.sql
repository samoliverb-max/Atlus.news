-- Atlus onboarding + recommendation schema (PostgreSQL)
-- Volunteered data only. Special-category data gated by explicit consent.

-- ---------- The IPTC topic graph (loaded once from cv.iptc.org, refreshed yearly) ----------
CREATE TABLE topics (
  qcode        text PRIMARY KEY,          -- e.g. 'medtop:20000344'
  label        text NOT NULL,
  definition   text,
  level        int,                       -- 1..5
  parent_qcode text REFERENCES topics(qcode),
  wikidata_id  text,
  retired      boolean DEFAULT false
);

CREATE TABLE topic_edges (
  from_qcode text NOT NULL REFERENCES topics(qcode),
  to_qcode   text NOT NULL REFERENCES topics(qcode),
  edge_type  text NOT NULL,               -- 'tree' | 'related'
  provenance text NOT NULL,               -- 'iptc-tree' | 'iptc-related' | 'wikidata' | 'co-occurrence'
  weight     real DEFAULT 1.0,
  PRIMARY KEY (from_qcode, to_qcode, edge_type)
);
CREATE INDEX ON topic_edges (from_qcode);

-- ---------- Articles (metadata only — never store body text) ----------
CREATE TABLE articles (
  id           bigserial PRIMARY KEY,
  url          text UNIQUE NOT NULL,
  title        text NOT NULL,
  description  text,
  source       text,
  published_at timestamptz,
  ingested_at  timestamptz DEFAULT now()
);

CREATE TABLE article_topics (
  article_id bigint NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  qcode      text   NOT NULL REFERENCES topics(qcode),
  confidence real   NOT NULL,
  source     text,                        -- 'publisher' | 'classifier' | 'embedding' | 'llm'
  PRIMARY KEY (article_id, qcode)
);
CREATE INDEX ON article_topics (qcode);

CREATE TABLE article_geo (               -- ISO-2 country tags for geography weighting
  article_id bigint NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  country    char(2) NOT NULL,
  PRIMARY KEY (article_id, country)
);

-- Optional viewpoint scoring for the political lens (nullable; only where inferable from metadata)
CREATE TABLE article_viewpoint (
  article_id bigint PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  econ real, soc real, intl real, inst real   -- each in [-1,1], null if unknown
);

-- ---------- Readers ----------
CREATE TABLE users (
  id           bigserial PRIMARY KEY,
  email        text UNIQUE NOT NULL,
  resume_token text UNIQUE NOT NULL,       -- magic-link resumability
  status       text DEFAULT 'onboarding',  -- 'onboarding' | 'active' | 'paused'
  created_at   timestamptz DEFAULT now()
);

-- The three vectors, one row per (user, node, vector). This is the heart of the profile.
CREATE TABLE user_topic_weights (
  user_id   bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qcode     text   NOT NULL REFERENCES topics(qcode),
  vector    text   NOT NULL CHECK (vector IN ('P','G','K')),
  weight    real   NOT NULL CHECK (weight >= 0 AND weight <= 1),
  source    text,                          -- which onboarding step or feedback tap set it
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, qcode, vector)
);
CREATE INDEX ON user_topic_weights (user_id, vector);

CREATE TABLE user_config (
  user_id         bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  discovery_reach int  DEFAULT 1,          -- 0 gentle / 1 balanced / 2 adventurous
  excluded_qcodes text[] DEFAULT '{}',
  mode            int  DEFAULT 3,          -- 1 / 3 / 5
  send_time       time DEFAULT '07:00',
  timezone        text DEFAULT 'Europe/London',
  cadence         text DEFAULT 'daily'
);

-- Special-category: political opinion (UK GDPR Art. 9) — only rows that exist have consent
CREATE TABLE user_political (
  user_id      bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  consented_at timestamptz NOT NULL,
  econ real, soc real, intl real, inst real,   -- axis scores in [-1,1]
  raw_responses jsonb,                          -- the per-issue answers, for reprocessing
  lenses        jsonb                           -- { qcode: 'match'|'balance'|'challenge' }
);

CREATE TABLE user_geo (
  user_id  bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country  char(2) NOT NULL,
  interest int NOT NULL,                    -- 2 very / 1 some / -1 rather-not
  PRIMARY KEY (user_id, country)
);

CREATE TABLE user_demographics (            -- non-sensitive; all nullable
  user_id    bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age_band   text,
  education  text,
  region     text,
  work_field text
);

-- Special-category: sensitive demographics (Art. 9) — separate table, separate consent
CREATE TABLE user_sensitive (
  user_id      bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  consented_at timestamptz NOT NULL,
  ethnicity    text,       -- each independently nullable & erasable
  religion     text,
  orientation  text
);

CREATE TABLE user_read_history (            -- repetition avoidance + feedback log
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id bigint NOT NULL REFERENCES articles(id),
  qcodes     text[] NOT NULL,
  sent_at    timestamptz,
  feedback   text,                          -- 'more'|'less'|'basic'|'further'|null
  PRIMARY KEY (user_id, article_id)
);

-- Resumable onboarding: raw answers saved per step, idempotent on (user, step)
CREATE TABLE onboarding_progress (
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step        text   NOT NULL,
  payload     jsonb  NOT NULL,              -- the raw answer for this step
  saved_at    timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, step)
);

-- Source fingerprints used by the sources step (seed from the prototype's SOURCES list)
CREATE TABLE source_profiles (
  name        text PRIMARY KEY,
  kind        text NOT NULL,                -- 'outlet' | 'platform'
  distribution jsonb NOT NULL               -- { qcode: weight }
);
