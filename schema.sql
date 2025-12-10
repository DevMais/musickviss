-- Database schema for Music Quiz app
-- Run this in your Cloudflare D1 database

CREATE TABLE IF NOT EXISTS lobbies (
  session_code TEXT PRIMARY KEY,
  settings TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lobbies_created_at ON lobbies(created_at);

