CREATE TABLE IF NOT EXISTS user_profiles (
  user_id text PRIMARY KEY,
  timezone text NOT NULL,
  ai_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credits_daily (
  user_id text NOT NULL,
  date_key text NOT NULL,
  used integer NOT NULL DEFAULT 0,
  "limit" integer NOT NULL DEFAULT 10,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, date_key)
);

CREATE TABLE IF NOT EXISTS credits_ledger (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  date_key text NOT NULL,
  feature text NOT NULL,
  cost integer NOT NULL,
  request_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credits_ledger_user_date_idx
  ON credits_ledger (user_id, date_key);
