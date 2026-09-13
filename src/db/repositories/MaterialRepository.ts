// src/db/repositories/MaterialRepository.ts

import type * as SQLite from 'expo-sqlite';
import type {
  Material,
  MaterialInput,
  MaterialWithCategory,
  MaterialCategory,
} from '../../types/models';

function rowToMaterial(row: Record<string, unknown>): Material {
  return {
    id: row.id as number,
    categoryId: row.category_id as number | undefined,
    name: row.name as string,
    brand: row.brand as string | undefined,
    sku: row.sku as string | undefined,
    unit: row.unit as string,
    costPrice: row.cost_price as number,
    markupPct: row.markup_pct as number | undefined,
    sellPrice: row.sell_price as number,
    priceOverride: (row.price_override as number) === 1,
    wastagePct: (row.wastage_pct as number) ?? 0,
    notes: row.notes as string | undefined,
    isActive: (row.is_active as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToCategory(row: Record<string, unknown>): MaterialCategory {
  return {
    id: row.cat_id as number,
    name: row.cat_name as string,
    defaultMarkupPct: row.cat_markup as number,
    sortOrder: row.cat_sort as number,
  };
}

const WITH_CATEGORY_SQL = `
  SELECT
    m.*,
    mc.id   AS cat_id,
    mc.name AS cat_name,
    mc.default_markup_pct AS cat_markup,
    mc.sort_order AS cat_sort
  FROM materials m
  LEFT JOIN material_categories mc ON mc.id = m.category_id
`;

function rowToMaterialWithCategory(row: Record<string, unknown>): MaterialWithCategory {
  const material = rowToMaterial(row);
  const category: MaterialCategory | undefined =
    row.cat_id != null ? rowToCategory(row) : undefined;
  return { ...material, category };
}

export class MaterialRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(includeInactive = false): Promise<MaterialWithCategory[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `${WITH_CATEGORY_SQL}
       WHERE ${includeInactive ? '1=1' : 'm.is_active = 1'}
       ORDER BY mc.sort_order ASC, m.name COLLATE NOCASE ASC`
    );
    return rows.map(rowToMaterialWithCategory);
  }

  async search(
    query: string,
    categoryId?: number
  ): Promise<MaterialWithCategory[]> {
    const pattern = `%${query}%`;
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `${WITH_CATEGORY_SQL}
       WHERE m.is_active = 1
         AND (m.name LIKE ? OR m.sku LIKE ? OR m.brand LIKE ?)
         ${categoryId != null ? 'AND m.category_id = ?' : ''}
       ORDER BY m.name COLLATE NOCASE ASC
       LIMIT 100`,
      categoryId != null
        ? [pattern, pattern, pattern, categoryId]
        : [pattern, pattern, pattern]
    );
    return rows.map(rowToMaterialWithCategory);
  }

  async getById(id: number): Promise<MaterialWithCategory | null> {
    const row = await this.db.getFirstAsync<Record<string, unknown>>(
      `${WITH_CATEGORY_SQL} WHERE m.id = ?`,
      [id]
    );
    return row ? rowToMaterialWithCategory(row) : null;
  }

  async getByCategory(categoryId: number): Promise<MaterialWithCategory[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `${WITH_CATEGORY_SQL}
       WHERE m.category_id = ? AND m.is_active = 1
       ORDER BY m.name COLLATE NOCASE ASC`,
      [categoryId]
    );
    return rows.map(rowToMaterialWithCategory);
  }

  async create(input: MaterialInput): Promise<MaterialWithCategory> {
    const result = await this.db.runAsync(
      `INSERT INTO materials
         (category_id, name, brand, sku, unit, cost_price, markup_pct,
          sell_price, price_override, wastage_pct, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.categoryId ?? null, input.name, input.brand ?? null,
        input.sku ?? null, input.unit, input.costPrice,
        input.markupPct ?? null, input.sellPrice, input.priceOverride ? 1 : 0,
        input.wastagePct, input.notes ?? null,
      ]
    );
    return (await this.getById(result.lastInsertRowId))!;
  }

  async update(id: number, input: MaterialInput): Promise<MaterialWithCategory> {
    await this.db.runAsync(
      `UPDATE materials SET
         category_id = ?, name = ?, brand = ?, sku = ?, unit = ?,
         cost_price = ?, markup_pct = ?, sell_price = ?, price_override = ?,
         wastage_pct = ?, notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        input.categoryId ?? null, input.name, input.brand ?? null,
        input.sku ?? null, input.unit, input.costPrice,
        input.markupPct ?? null, input.sellPrice, input.priceOverride ? 1 : 0,
        input.wastagePct, input.notes ?? null, id,
      ]
    );
    return (await this.getById(id))!;
  }

  async deactivate(id: number): Promise<void> {
    await this.db.runAsync(
      `UPDATE materials SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM materials WHERE id = ?', [id]);
  }

  // ─── Categories ──────────────────────────────────────

  async getAllCategories(): Promise<MaterialCategory[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM material_categories ORDER BY sort_order ASC, name ASC'
    );
    return rows.map((r) => ({
      id: r.id as number,
      name: r.name as string,
      defaultMarkupPct: r.default_markup_pct as number,
      sortOrder: r.sort_order as number,
    }));
  }

  async createCategory(
    name: string,
    defaultMarkupPct: number,
    sortOrder?: number
  ): Promise<MaterialCategory> {
    const result = await this.db.runAsync(
      `INSERT INTO material_categories (name, default_markup_pct, sort_order)
       VALUES (?, ?, ?)`,
      [name, defaultMarkupPct, sortOrder ?? 0]
    );
    const row = await this.db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM material_categories WHERE id = ?',
      [result.lastInsertRowId]
    );
    return {
      id: row!.id as number,
      name: row!.name as string,
      defaultMarkupPct: row!.default_markup_pct as number,
      sortOrder: row!.sort_order as number,
    };
  }

  async updateCategory(
    id: number,
    name: string,
    defaultMarkupPct: number
  ): Promise<void> {
    await this.db.runAsync(
      'UPDATE material_categories SET name = ?, default_markup_pct = ? WHERE id = ?',
      [name, defaultMarkupPct, id]
    );
  }
}
