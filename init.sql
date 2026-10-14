CREATE TABLE IF NOT EXISTS rankings (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_name VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  accuracy REAL NOT NULL,
  play_time REAL NOT NULL,
  created_at TIMESTAMPTZ NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_score ON rankings (score DESC);
CREATE INDEX IF NOT EXISTS idx_user_name ON rankings (user_name);
