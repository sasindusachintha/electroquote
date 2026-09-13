// src/db/repositories/LabourRepository.ts

import type * as SQLite from 'expo-sqlite';
import type { LabourItem, LabourItemInput } from '../../types/models';

function rowToLabourItem(row: Record<string, unknown>): LabourItem {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string | undefined,
    unit: row.unit as string,
    unitRate: row.unit_rate as number,
    isActive: (row.is_active as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class LabourRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(includeInactive = false): Promise<LabourItem[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM labour_items
       WHERE ${includeInactive ? '1=1' : 'is_active = 1'}
       ORDER BY name COLLATE NOCASE ASC`
    );
    return rows.map(rowToLabourItem);
  }

  async search(query: string): Promise<LabourItem[]> {
    const pattern = `%${query}%`;
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM labour_items
       WHERE is_active = 1
         AND (name LIKE ? OR description LIKE ?)
       ORDER BY name COLLATE NOCASE ASC
       LIMIT 100`,
      [pattern, pattern]
    );
    return rows.map(rowToLabourItem);
  }

  async getById(id: number): Promise<LabourItem | null> {
    const row = await this.db.getFirstAsync<Record<string, unknown>>(
      `SELECT * FROM labour_items WHERE id = ?`,
      [id]
    );
    return row ? rowToLabourItem(row) : null;
  }

  async create(input: LabourItemInput): Promise<LabourItem> {
    const result = await this.db.runAsync(
      `INSERT INTO labour_items (name, description, unit, unit_rate)
       VALUES (?, ?, ?, ?)`,
      [input.name, input.description ?? null, input.unit, input.unitRate]
    );
    return (await this.getById(result.lastInsertRowId))!;
  }

  async update(id: number, input: LabourItemInput): Promise<LabourItem> {
    await this.db.runAsync(
      `UPDATE labour_items SET
         name = ?, description = ?, unit = ?, unit_rate = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [input.name, input.description ?? null, input.unit, input.unitRate, id]
    );
    return (await this.getById(id))!;
  }

  async deactivate(id: number): Promise<void> {
    await this.db.runAsync(
      `UPDATE labour_items SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync(`DELETE FROM labour_items WHERE id = ?`, [id]);
  }
}
