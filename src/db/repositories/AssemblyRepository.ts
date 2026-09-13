// src/db/repositories/AssemblyRepository.ts

import type * as SQLite from 'expo-sqlite';
import type {
  Assembly,
  AssemblyDetail,
  AssemblyInput,
  AssemblyMaterialLine,
  AssemblyLabourLine,
  MaterialWithCategory,
  LabourItem,
  MaterialCategory,
} from '../../types/models';

function rowToAssembly(row: Record<string, unknown>): Assembly {
  return {
    id: row.id as number,
    name: row.name as string,
    description: row.description as string | undefined,
    categoryId: row.category_id as number | undefined,
    unit: (row.unit as string) || 'point',
    isFavourite: (row.is_favourite as number) === 1,
    isActive: (row.is_active as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class AssemblyRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(includeInactive = false): Promise<AssemblyDetail[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT a.*, mc.name AS cat_name, mc.default_markup_pct AS cat_markup, mc.sort_order AS cat_sort
       FROM assemblies a
       LEFT JOIN material_categories mc ON mc.id = a.category_id
       WHERE ${includeInactive ? '1=1' : 'a.is_active = 1'}
       ORDER BY a.is_favourite DESC, a.name COLLATE NOCASE ASC`
    );

    const assemblies: AssemblyDetail[] = [];
    for (const row of rows) {
      const detail = await this.enrichAssembly(row);
      assemblies.push(detail);
    }
    return assemblies;
  }

  async search(query: string, categoryId?: number): Promise<AssemblyDetail[]> {
    const pattern = `%${query}%`;
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT a.*, mc.name AS cat_name, mc.default_markup_pct AS cat_markup, mc.sort_order AS cat_sort
       FROM assemblies a
       LEFT JOIN material_categories mc ON mc.id = a.category_id
       WHERE a.is_active = 1
         AND (a.name LIKE ? OR a.description LIKE ?)
         ${categoryId != null ? 'AND a.category_id = ?' : ''}
       ORDER BY a.is_favourite DESC, a.name COLLATE NOCASE ASC`,
      categoryId != null ? [pattern, pattern, categoryId] : [pattern, pattern]
    );

    const assemblies: AssemblyDetail[] = [];
    for (const row of rows) {
      const detail = await this.enrichAssembly(row);
      assemblies.push(detail);
    }
    return assemblies;
  }

  async getById(id: number): Promise<AssemblyDetail | null> {
    const row = await this.db.getFirstAsync<Record<string, unknown>>(
      `SELECT a.*, mc.name AS cat_name, mc.default_markup_pct AS cat_markup, mc.sort_order AS cat_sort
       FROM assemblies a
       LEFT JOIN material_categories mc ON mc.id = a.category_id
       WHERE a.id = ?`,
      [id]
    );
    if (!row) return null;
    return this.enrichAssembly(row);
  }

  private async enrichAssembly(row: Record<string, unknown>): Promise<AssemblyDetail> {
    const assembly = rowToAssembly(row);
    const category: MaterialCategory | undefined = row.category_id
      ? {
          id: row.category_id as number,
          name: row.cat_name as string,
          defaultMarkupPct: row.cat_markup as number,
          sortOrder: row.cat_sort as number,
        }
      : undefined;

    // Fetch material lines
    const matRows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT aml.*, m.name AS mat_name, m.brand AS mat_brand, m.sku AS mat_sku,
              m.unit AS mat_unit, m.cost_price AS mat_cost, m.markup_pct AS mat_markup,
              m.sell_price AS mat_sell, m.price_override AS mat_override,
              m.wastage_pct AS mat_wastage, m.category_id AS mat_cat_id,
              mc.name AS mat_cat_name, mc.default_markup_pct AS mat_cat_default_markup
       FROM assembly_material_lines aml
       JOIN materials m ON m.id = aml.material_id
       LEFT JOIN material_categories mc ON mc.id = m.category_id
       WHERE aml.assembly_id = ?
       ORDER BY aml.sort_order ASC`,
      [assembly.id]
    );

    const materialLines: AssemblyMaterialLine[] = matRows.map((r) => {
      const material: MaterialWithCategory = {
        id: r.material_id as number,
        categoryId: r.mat_cat_id as number | undefined,
        name: r.mat_name as string,
        brand: r.mat_brand as string | undefined,
        sku: r.mat_sku as string | undefined,
        unit: r.mat_unit as string,
        costPrice: r.mat_cost as number,
        markupPct: r.mat_markup as number | undefined,
        sellPrice: r.mat_sell as number,
        priceOverride: (r.mat_override as number) === 1,
        wastagePct: (r.mat_wastage as number) ?? 0,
        isActive: true,
        createdAt: '',
        updatedAt: '',
        category: r.mat_cat_id
          ? {
              id: r.mat_cat_id as number,
              name: r.mat_cat_name as string,
              defaultMarkupPct: r.mat_cat_default_markup as number,
              sortOrder: 0,
            }
          : undefined,
      };

      return {
        id: r.id as number,
        assemblyId: r.assembly_id as number,
        materialId: r.material_id as number,
        quantity: r.quantity as number,
        includeWastage: (r.include_wastage as number) === 1,
        sortOrder: r.sort_order as number,
        material,
      };
    });

    // Fetch labour lines
    const labRows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT all_lines.*, l.name AS lab_name, l.description AS lab_desc,
              l.unit AS lab_unit, l.unit_rate AS lab_rate
       FROM assembly_labour_lines all_lines
       JOIN labour_items l ON l.id = all_lines.labour_item_id
       WHERE all_lines.assembly_id = ?
       ORDER BY all_lines.sort_order ASC`,
      [assembly.id]
    );

    const labourLines: AssemblyLabourLine[] = labRows.map((r) => {
      const labourItem: LabourItem = {
        id: r.labour_item_id as number,
        name: r.lab_name as string,
        description: r.lab_desc as string | undefined,
        unit: r.lab_unit as string,
        unitRate: r.lab_rate as number,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      };

      return {
        id: r.id as number,
        assemblyId: r.assembly_id as number,
        labourItemId: r.labour_item_id as number,
        quantity: r.quantity as number,
        sortOrder: r.sort_order as number,
        labourItem,
      };
    });

    return {
      ...assembly,
      category,
      materialLines,
      labourLines,
    };
  }

  async create(input: AssemblyInput): Promise<AssemblyDetail> {
    let createdId = 0;
    await this.db.withTransactionAsync(async () => {
      const result = await this.db.runAsync(
        `INSERT INTO assemblies (name, description, category_id, unit, is_favourite)
         VALUES (?, ?, ?, ?, ?)`,
        [
          input.name,
          input.description ?? null,
          input.categoryId ?? null,
          input.unit || 'point',
          input.isFavourite ? 1 : 0,
        ]
      );
      createdId = result.lastInsertRowId;

      // Insert material lines
      for (let i = 0; i < input.materialLines.length; i++) {
        const ml = input.materialLines[i];
        await this.db.runAsync(
          `INSERT INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [createdId, ml.materialId, ml.quantity, ml.includeWastage ? 1 : 0, i + 1]
        );
      }

      // Insert labour lines
      for (let i = 0; i < input.labourLines.length; i++) {
        const ll = input.labourLines[i];
        await this.db.runAsync(
          `INSERT INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
           VALUES (?, ?, ?, ?)`,
          [createdId, ll.labourItemId, ll.quantity, i + 1]
        );
      }
    });

    return (await this.getById(createdId))!;
  }

  async update(id: number, input: AssemblyInput): Promise<AssemblyDetail> {
    await this.db.withTransactionAsync(async () => {
      await this.db.runAsync(
        `UPDATE assemblies SET
           name = ?, description = ?, category_id = ?, unit = ?, is_favourite = ?, updated_at = datetime('now')
         WHERE id = ?`,
        [
          input.name,
          input.description ?? null,
          input.categoryId ?? null,
          input.unit || 'point',
          input.isFavourite ? 1 : 0,
          id,
        ]
      );

      // Re-create lines
      await this.db.runAsync('DELETE FROM assembly_material_lines WHERE assembly_id = ?', [id]);
      await this.db.runAsync('DELETE FROM assembly_labour_lines WHERE assembly_id = ?', [id]);

      for (let i = 0; i < input.materialLines.length; i++) {
        const ml = input.materialLines[i];
        await this.db.runAsync(
          `INSERT INTO assembly_material_lines (assembly_id, material_id, quantity, include_wastage, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [id, ml.materialId, ml.quantity, ml.includeWastage ? 1 : 0, i + 1]
        );
      }

      for (let i = 0; i < input.labourLines.length; i++) {
        const ll = input.labourLines[i];
        await this.db.runAsync(
          `INSERT INTO assembly_labour_lines (assembly_id, labour_item_id, quantity, sort_order)
           VALUES (?, ?, ?, ?)`,
          [id, ll.labourItemId, ll.quantity, i + 1]
        );
      }
    });

    return (await this.getById(id))!;
  }

  async duplicate(id: number): Promise<AssemblyDetail> {
    const original = await this.getById(id);
    if (!original) throw new Error('Assembly not found');

    const copyInput: AssemblyInput = {
      name: `${original.name} (Copy)`,
      description: original.description,
      categoryId: original.categoryId,
      unit: original.unit,
      isFavourite: original.isFavourite,
      materialLines: original.materialLines.map((ml) => ({
        materialId: ml.materialId,
        quantity: ml.quantity,
        includeWastage: ml.includeWastage,
        sortOrder: ml.sortOrder,
      })),
      labourLines: original.labourLines.map((ll) => ({
        labourItemId: ll.labourItemId,
        quantity: ll.quantity,
        sortOrder: ll.sortOrder,
      })),
    };

    return this.create(copyInput);
  }

  async toggleFavourite(id: number): Promise<void> {
    await this.db.runAsync(
      `UPDATE assemblies SET is_favourite = CASE WHEN is_favourite = 1 THEN 0 ELSE 1 END WHERE id = ?`,
      [id]
    );
  }

  async deactivate(id: number): Promise<void> {
    await this.db.runAsync(
      `UPDATE assemblies SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM assemblies WHERE id = ?', [id]);
  }
}
