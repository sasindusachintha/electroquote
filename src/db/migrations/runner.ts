// src/db/migrations/runner.ts
// Applies pending SQL migrations in order, tracking versions in schema_migrations.
// SQL is embedded as string constants (no asset bundling required).

import type * as SQLite from 'expo-sqlite';
import { MIGRATION_001 } from './001_initial_schema';
import { MIGRATION_002 } from './002_seed_catalogue';
import { MIGRATION_003 } from './003_add_assembly_unit';
import { MIGRATION_004 } from './004_update_project_statuses';
import { MIGRATION_005 } from './005_add_settings_fields';
import { MIGRATION_006 } from './006_sinhala_names';

interface Migration {
  version: number;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  { version: 1, sql: MIGRATION_001 },
  { version: 2, sql: MIGRATION_002 },
  { version: 3, sql: MIGRATION_003 },
  { version: 4, sql: MIGRATION_004 },
  { version: 5, sql: MIGRATION_005 },
  { version: 6, sql: MIGRATION_006 },
];

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Bootstrap: create the migrations tracking table first
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC'
  );
  const appliedSet = new Set(applied.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (appliedSet.has(migration.version)) continue;

    console.log(`[ElectroQuote DB] Applying migration v${migration.version}...`);
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.runAsync(
        'INSERT INTO schema_migrations (version) VALUES (?)',
        [migration.version]
      );
    });
    console.log(`[ElectroQuote DB] Migration v${migration.version} complete.`);
  }
}
