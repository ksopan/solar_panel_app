-- Migration number: 0002        2025-04-02T12:00:00.000Z

-- Add the missing counters table if it doesn't exist
CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

-- Add the missing access_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  path TEXT,
  accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
