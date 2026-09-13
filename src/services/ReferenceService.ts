// src/services/ReferenceService.ts
// Generates unique quotation reference numbers in the format EQ-YYYY-NNNN.
// Uses the quotation_sequence table to guarantee uniqueness.

import type * as SQLite from 'expo-sqlite';

export async function generateReferenceNo(
  db: SQLite.SQLiteDatabase
): Promise<string> {
  const year = new Date().getFullYear();
  let refNo = '';

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO quotation_sequence (year, next_seq)
       VALUES (?, 1)
       ON CONFLICT(year) DO NOTHING`,
      [year]
    );

    const row = await db.getFirstAsync<{ next_seq: number }>(
      'SELECT next_seq FROM quotation_sequence WHERE year = ?',
      [year]
    );

    const seq = row?.next_seq ?? 1;
    refNo = `EQ-${year}-${String(seq).padStart(4, '0')}`;

    await db.runAsync(
      'UPDATE quotation_sequence SET next_seq = next_seq + 1 WHERE year = ?',
      [year]
    );
  });

  return refNo;
}

export const ReferenceService = {
  generateReferenceNo,
  async next(db: SQLite.SQLiteDatabase): Promise<string> {
    return generateReferenceNo(db);
  },
};
