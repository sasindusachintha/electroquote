// src/db/repositories/ProjectRepository.ts

import type * as SQLite from 'expo-sqlite';
import type { Project, ProjectWithCustomer, ProjectInput, ProjectStatus, Customer } from '../../types/models';

function rowToProject(row: Record<string, unknown>): ProjectWithCustomer {
  const customer: Customer = {
    id: row.customer_id as number,
    name: (row.cust_name as string) || '',
    company: row.cust_company as string | undefined,
    phone: row.cust_phone as string | undefined,
    email: row.cust_email as string | undefined,
    addressLine1: row.cust_address as string | undefined,
    isArchived: (row.cust_archived as number) === 1,
    createdAt: '',
    updatedAt: '',
  };

  return {
    id: row.id as number,
    customerId: row.customer_id as number,
    name: row.name as string,
    siteAddress: row.site_address as string | undefined,
    description: row.description as string | undefined,
    status: (row.status as ProjectStatus) || 'active',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    customer,
    quotationCount: (row.quotation_count as number) || 0,
  };
}

const WITH_CUSTOMER_SQL = `
  SELECT
    p.*,
    c.name AS cust_name,
    c.company AS cust_company,
    c.phone AS cust_phone,
    c.email AS cust_email,
    c.address_line1 AS cust_address,
    c.is_archived AS cust_archived,
    (SELECT COUNT(*) FROM quotations q WHERE q.project_id = p.id) AS quotation_count
  FROM projects p
  JOIN customers c ON c.id = p.customer_id
`;

export class ProjectRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(includeArchived = false): Promise<ProjectWithCustomer[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `${WITH_CUSTOMER_SQL}
       WHERE ${includeArchived ? '1=1' : "p.status != 'archived'"}
       ORDER BY p.updated_at DESC`
    );
    return rows.map(rowToProject);
  }

  async getByCustomerId(customerId: number, includeArchived = false): Promise<ProjectWithCustomer[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `${WITH_CUSTOMER_SQL}
       WHERE p.customer_id = ? ${includeArchived ? '' : "AND p.status != 'archived'"}
       ORDER BY p.updated_at DESC`,
      [customerId]
    );
    return rows.map(rowToProject);
  }

  async getById(id: number): Promise<ProjectWithCustomer | null> {
    const row = await this.db.getFirstAsync<Record<string, unknown>>(
      `${WITH_CUSTOMER_SQL} WHERE p.id = ?`,
      [id]
    );
    return row ? rowToProject(row) : null;
  }

  async search(query: string, customerId?: number): Promise<ProjectWithCustomer[]> {
    const pattern = `%${query}%`;
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `${WITH_CUSTOMER_SQL}
       WHERE p.status != 'archived'
         AND (p.name LIKE ? OR p.site_address LIKE ? OR c.name LIKE ?)
         ${customerId != null ? 'AND p.customer_id = ?' : ''}
       ORDER BY p.updated_at DESC
       LIMIT 50`,
      customerId != null ? [pattern, pattern, pattern, customerId] : [pattern, pattern, pattern]
    );
    return rows.map(rowToProject);
  }

  async create(input: ProjectInput): Promise<ProjectWithCustomer> {
    const result = await this.db.runAsync(
      `INSERT INTO projects (customer_id, name, site_address, description, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.customerId,
        input.name,
        input.siteAddress ?? null,
        input.description ?? null,
        input.status || 'active',
      ]
    );
    return (await this.getById(result.lastInsertRowId))!;
  }

  async update(id: number, input: ProjectInput): Promise<ProjectWithCustomer> {
    await this.db.runAsync(
      `UPDATE projects SET
         customer_id = ?, name = ?, site_address = ?, description = ?,
         status = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        input.customerId,
        input.name,
        input.siteAddress ?? null,
        input.description ?? null,
        input.status || 'active',
        id,
      ]
    );
    return (await this.getById(id))!;
  }

  async updateStatus(id: number, status: ProjectStatus): Promise<void> {
    await this.db.runAsync(
      `UPDATE projects SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, id]
    );
  }

  async archive(id: number): Promise<void> {
    await this.updateStatus(id, 'archived');
  }

  async delete(id: number): Promise<void> {
    // Safe deletion: check if referenced by quotations
    const qCount = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM quotations WHERE project_id = ?',
      [id]
    );

    if (qCount && qCount.count > 0) {
      // Archive instead of hard deleting to preserve quotation relationship
      await this.archive(id);
    } else {
      await this.db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
    }
  }
}
