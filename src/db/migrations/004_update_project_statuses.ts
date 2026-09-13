// src/db/migrations/004_update_project_statuses.ts
// Recreates `projects` table without restricted CHECK constraint to support all project statuses:
// ('draft', 'quoting', 'approved', 'in_progress', 'complete', 'cancelled', 'active', 'archived')

export const MIGRATION_004 = `-- Migration 004: Update project status constraints
-- Version: 4

CREATE TABLE IF NOT EXISTS projects_new (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  site_address TEXT,
  description  TEXT,
  status       TEXT    NOT NULL DEFAULT 'active',
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO projects_new (id, customer_id, name, site_address, description, status, created_at, updated_at)
SELECT id, customer_id, name, site_address, description, status, created_at, updated_at FROM projects;

DROP TABLE projects;

ALTER TABLE projects_new RENAME TO projects;

CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);
`;
