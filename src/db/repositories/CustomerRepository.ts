// src/db/repositories/CustomerRepository.ts

import type * as SQLite from 'expo-sqlite';
import type { Customer, CustomerInput } from '../../types/models';

function rowToCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as number,
    name: row.name as string,
    company: row.company as string | undefined,
    phone: row.phone as string | undefined,
    email: row.email as string | undefined,
    addressLine1: row.address_line1 as string | undefined,
    addressLine2: row.address_line2 as string | undefined,
    city: row.city as string | undefined,
    postalCode: row.postal_code as string | undefined,
    notes: row.notes as string | undefined,
    isArchived: (row.is_archived as number) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class CustomerRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(includeArchived = false): Promise<Customer[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM customers ${includeArchived ? '' : 'WHERE is_archived = 0'}
       ORDER BY name COLLATE NOCASE ASC`
    );
    return rows.map(rowToCustomer);
  }

  async search(query: string): Promise<Customer[]> {
    const pattern = `%${query}%`;
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT * FROM customers
       WHERE is_archived = 0
         AND (name LIKE ? OR company LIKE ? OR phone LIKE ? OR email LIKE ?)
       ORDER BY name COLLATE NOCASE ASC
       LIMIT 50`,
      [pattern, pattern, pattern, pattern]
    );
    return rows.map(rowToCustomer);
  }

  async getById(id: number): Promise<Customer | null> {
    const row = await this.db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    return row ? rowToCustomer(row) : null;
  }

  async getRecent(limit = 10): Promise<Customer[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT c.* FROM customers c
       LEFT JOIN quotations q ON q.customer_id = c.id
       WHERE c.is_archived = 0
       GROUP BY c.id
       ORDER BY MAX(q.created_at) DESC NULLS LAST, c.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows.map(rowToCustomer);
  }

  async create(input: CustomerInput): Promise<Customer> {
    const result = await this.db.runAsync(
      `INSERT INTO customers (name, company, phone, email,
         address_line1, address_line2, city, postal_code, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name, input.company ?? null, input.phone ?? null,
        input.email ?? null, input.addressLine1 ?? null,
        input.addressLine2 ?? null, input.city ?? null,
        input.postalCode ?? null, input.notes ?? null,
      ]
    );
    return (await this.getById(result.lastInsertRowId))!;
  }

  async update(id: number, input: CustomerInput): Promise<Customer> {
    await this.db.runAsync(
      `UPDATE customers SET
         name = ?, company = ?, phone = ?, email = ?,
         address_line1 = ?, address_line2 = ?, city = ?, postal_code = ?,
         notes = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [
        input.name, input.company ?? null, input.phone ?? null,
        input.email ?? null, input.addressLine1 ?? null,
        input.addressLine2 ?? null, input.city ?? null,
        input.postalCode ?? null, input.notes ?? null, id,
      ]
    );
    return (await this.getById(id))!;
  }

  async archive(id: number): Promise<void> {
    await this.db.runAsync(
      `UPDATE customers SET is_archived = 1, updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
  }
}
