-- Users table
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id   TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email       TEXT NOT NULL,
  photo_url   TEXT,
  is_admin    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Matches table
CREATE TABLE matches (
  id          TEXT PRIMARY KEY,
  home_team   JSONB NOT NULL,
  away_team   JSONB NOT NULL,
  kickoff     TIMESTAMPTZ NOT NULL,
  lock_at     TIMESTAMPTZ NOT NULL,
  stage       TEXT NOT NULL,
  "group"     TEXT,
  status      TEXT NOT NULL DEFAULT 'SCHEDULED',
  score       JSONB,
  result      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Predictions table
CREATE TABLE predictions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id    TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  pick        TEXT NOT NULL,
  points      INT DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Standings view
CREATE VIEW standings AS
  SELECT
    u.id AS uid,
    u.display_name,
    u.photo_url,
    COUNT(DISTINCT p.id) FILTER (WHERE m.status = 'FINISHED') AS total_picks,
    COUNT(DISTINCT p.id) FILTER (WHERE p.pick = m.result AND m.status = 'FINISHED') AS correct_picks,
    COALESCE(SUM(p.points), 0)::INT AS total_points
  FROM users u
  LEFT JOIN predictions p ON p.user_id = u.id
  LEFT JOIN matches m ON m.id = p.match_id
  GROUP BY u.id, u.display_name, u.photo_url
  ORDER BY total_points DESC;

-- Create indexes for performance
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_matches_group ON matches("group");
