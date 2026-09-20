// src/db/client.ts
// SQLite singleton — opens the database once and returns the same instance.
// All migrations are run on first open.

import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations/runner';

let _dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!_dbPromise) {
    _dbPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync('electroquote.db');
        await db.execAsync('PRAGMA journal_mode = WAL;');
        await db.execAsync('PRAGMA foreign_keys = ON;');
        await runMigrations(db);
        return db;
      } catch (err) {
        _dbPromise = null;
        throw err;
      }
    })();
  }
  return _dbPromise;
}

/** For use in tests — resets the singleton */
export function _resetDatabaseForTesting() {
  _dbPromise = null;
}
