// src/db/migrations/003_add_assembly_unit.ts
// Adds `unit` column to `assemblies` table (defaults to 'point')

export const MIGRATION_003 = `-- Migration 003: Add unit column to assemblies
-- Version: 3

ALTER TABLE assemblies ADD COLUMN unit TEXT NOT NULL DEFAULT 'point';

UPDATE assemblies SET unit = 'socket' WHERE name LIKE '%Socket%';
UPDATE assemblies SET unit = 'fan' WHERE name LIKE '%Fan%';
UPDATE assemblies SET unit = 'point' WHERE name LIKE '%Point%' AND unit = 'point';
`;
