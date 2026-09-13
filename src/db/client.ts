// src/db/client.ts
// SQLite singleton — opens the database once and returns the same instance.
// All migrations are run on first open.

import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations/runner';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('electroquote.db');
  // Enable WAL mode for better concurrent performance
  await _db.execAsync('PRAGMA journal_mode = WAL;');
  await _db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(_db);
  return _db;
}

/** For use in tests — resets the singleton */
export function _resetDatabaseForTesting() {
  _db = null;
}
