// src/db/repositories/QuotationRepository.ts
// Handles all DB persistence for quotations — the most complex repository.
// Saves in a single transaction: quotation header + sections + line items.

import type * as SQLite from 'expo-sqlite';
import type {
  Quotation,
  QuotationDetail,
  QuotationLineItem,
  QuotationSection,
  QuotationSummary,
  QuotationStatus,
  QuotationTotals,
  DraftLineItem,
  DraftSection,
  QuotationDraft,
} from '../../types/models';
import { computeDraftTotals } from '../../services/QuotationService';

// ─── Row mappers ─────────────────────────────────────

function rowToTotals(row: Record<string, unknown>): QuotationTotals {
  return {
    subtotalMaterials: row.subtotal_materials as number,
    subtotalLabour: row.subtotal_labour as number,
    subtotalBeforeDiscount: row.subtotal_before_discount as number,
    discountAmount: row.discount_amount as number,
    subtotalAfterDiscount: row.subtotal_after_discount as number,
    vatAmount: row.vat_amount as number,
    grandTotal: row.grand_total as number,
  };
}

function rowToQuotation(row: Record<string, unknown>): Quotation {
  return {
    id: row.id as number,
    projectId: row.project_id as number,
    customerId: row.customer_id as number,
    referenceNo: row.reference_no as string,
    title: row.title as string | undefined,
    status: row.status as QuotationStatus,
    revision: row.revision as number,
    parentId: row.parent_id as number | undefined,
    issueDate: row.issue_date as string,
    validUntil: row.valid_until as string | undefined,
    currencySymbol: row.currency_symbol as string,
    discountType: row.discount_type as 'pct' | 'fixed' | undefined,
    discountValue: (row.discount_value as number) ?? 0,
    discountNote: row.discount_note as string | undefined,
    vatEnabled: (row.vat_enabled as number) === 1,
    vatPct: (row.vat_pct as number) ?? 0,
    pdfMode: (row.pdf_mode as string ?? 'detailed') as 'detailed' | 'simple',
    totals: rowToTotals(row),
    notes: row.notes as string | undefined,
    terms: row.terms as string | undefined,
    pdfUri: row.pdf_uri as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToSection(row: Record<string, unknown>): QuotationSection {
  return {
    id: row.id as number,
    quotationId: row.quotation_id as number,
    name: row.name as string,
    sortOrder: row.sort_order as number,
  };
}

function rowToLineItem(row: Record<string, unknown>): QuotationLineItem {
  return {
    id: row.id as number,
    quotationId: row.quotation_id as number,
    sectionId: row.section_id as number | undefined,
    sourceType: row.source_type as any,
    sourceId: row.source_id as number | undefined,
    assemblyInstanceId: row.assembly_instance_id as string | undefined,
    description: row.description as string,
    unit: row.unit as string,
    quantity: row.quantity as number,
    unitCost: row.unit_cost as number,
    markupPct: row.markup_pct as number,
    unitPrice: row.unit_price as number,
    lineTotal: row.line_total as number,
    priceOverridden: (row.price_overridden as number) === 1,
    lineDiscountType: row.line_discount_type as 'pct' | 'fixed' | undefined,
    lineDiscountValue: (row.line_discount_value as number) ?? 0,
    isMaterial: (row.is_material as number) === 1,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── Repository ─────────────────────────────────────

export class QuotationRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(status?: QuotationStatus): Promise<QuotationSummary[]> {
    const rows = await this.db.getAllAsync<Record<string, unknown>>(
      `SELECT
         q.*,
         c.name AS customer_name, c.company AS customer_company,
         p.name AS project_name,
         COUNT(li.id) AS line_item_count
       FROM quotations q
       JOIN customers c ON c.id = q.customer_id
       JOIN projects p  ON p.id = q.project_id
       LEFT JOIN quotation_line_items li ON li.quotation_id = q.id
       ${status ? 'WHERE q.status = ?' : ''}
       GROUP BY q.id
       ORDER BY q.created_at DESC`,
      status ? [status] : []
    );
    return rows.map((row) => ({
      ...rowToQuotation(row),
      customer: {
        id: row.customer_id as number,
        name: row.customer_name as string,
        company: row.customer_company as string | undefined,
      },
      project: {
        id: row.project_id as number,
        name: row.project_name as string,
      },
      lineItemCount: row.line_item_count as number,
    }));
  }

  async getById(id: number): Promise<QuotationDetail | null> {
    const qRow = await this.db.getFirstAsync<Record<string, unknown>>(
      `SELECT q.*,
         c.id AS cust_id, c.name AS cust_name, c.company AS cust_company,
         c.phone AS cust_phone, c.email AS cust_email,
         c.address_line1 AS cust_addr1, c.address_line2 AS cust_addr2,
         c.city AS cust_city, c.postal_code AS cust_postal,
         c.is_archived AS cust_archived, c.created_at AS cust_created, c.updated_at AS cust_updated,
         p.id AS proj_id, p.name AS proj_name, p.site_address AS proj_site,
         p.description AS proj_desc, p.status AS proj_status,
         p.created_at AS proj_created, p.updated_at AS proj_updated
       FROM quotations q
       JOIN customers c ON c.id = q.customer_id
       JOIN projects  p ON p.id = q.project_id
       WHERE q.id = ?`,
      [id]
    );
    if (!qRow) return null;

    const sections = await this.db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM quotation_sections WHERE quotation_id = ? ORDER BY sort_order ASC',
      [id]
    );
    const lineItems = await this.db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM quotation_line_items WHERE quotation_id = ? ORDER BY sort_order ASC',
      [id]
    );

    return {
      ...rowToQuotation(qRow),
      customer: {
        id: qRow.cust_id as number,
        name: qRow.cust_name as string,
        company: qRow.cust_company as string | undefined,
        phone: qRow.cust_phone as string | undefined,
        email: qRow.cust_email as string | undefined,
        addressLine1: qRow.cust_addr1 as string | undefined,
        addressLine2: qRow.cust_addr2 as string | undefined,
        city: qRow.cust_city as string | undefined,
        postalCode: qRow.cust_postal as string | undefined,
        notes: undefined,
        isArchived: (qRow.cust_archived as number) === 1,
        createdAt: qRow.cust_created as string,
        updatedAt: qRow.cust_updated as string,
      },
      project: {
        id: qRow.proj_id as number,
        customerId: qRow.customer_id as number,
        name: qRow.proj_name as string,
        siteAddress: qRow.proj_site as string | undefined,
        description: qRow.proj_desc as string | undefined,
        status: qRow.proj_status as any,
        createdAt: qRow.proj_created as string,
        updatedAt: qRow.proj_updated as string,
      },
      sections: sections.map(rowToSection),
      lineItems: lineItems.map(rowToLineItem),
    };
  }

  /**
   * Persist a full draft to the database.
   * If draft.quotationId is set, it updates; otherwise it inserts.
   * referenceNo is optional — when omitted it is generated atomically
   * inside this transaction so we never nest two withTransactionAsync calls.
   * Returns the saved quotation's ID.
   */
  async saveDraft(
    draft: QuotationDraft,
    referenceNo: string | undefined,
    currencySymbol: string,
    validUntil?: string,
    pdfMode: 'detailed' | 'simple' = 'detailed'
  ): Promise<number> {
    const totals = computeDraftTotals(draft);
    let quotationId = draft.quotationId;
    // If no reference number was supplied we generate one here so that the
    // sequence-update and the quotation INSERT happen in the same transaction.
    let resolvedRefNo = referenceNo ?? '';

    await this.db.withTransactionAsync(async () => {
      if (!resolvedRefNo) {
        // Generate reference number atomically inside this transaction
        const year = new Date().getFullYear();
        await this.db.runAsync(
          `INSERT INTO quotation_sequence (year, next_seq) VALUES (?, 1) ON CONFLICT(year) DO NOTHING`,
          [year]
        );
        const row = await this.db.getFirstAsync<{ next_seq: number }>(
          'SELECT next_seq FROM quotation_sequence WHERE year = ?',
          [year]
        );
        const seq = row?.next_seq ?? 1;
        resolvedRefNo = `EQ-${year}-${String(seq).padStart(4, '0')}`;
        await this.db.runAsync(
          'UPDATE quotation_sequence SET next_seq = next_seq + 1 WHERE year = ?',
          [year]
        );
      }
      if (quotationId == null) {
        // INSERT new quotation
        const r = await this.db.runAsync(
          `INSERT INTO quotations (
             project_id, customer_id, reference_no, title, status,
             issue_date, valid_until, currency_symbol,
             discount_type, discount_value, discount_note,
             vat_enabled, vat_pct, pdf_mode,
             subtotal_materials, subtotal_labour, subtotal_before_discount,
             discount_amount, subtotal_after_discount, vat_amount, grand_total,
             notes, terms
           ) VALUES (?,?,?,?,?,date('now'),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          // referenceNo resolved above
          [
            draft.projectId!, draft.customerId!, resolvedRefNo,
            draft.title || null, 'draft',
            validUntil ?? null, currencySymbol,
            draft.discountType ?? null, draft.discountValue, draft.discountNote || null,
            draft.vatEnabled ? 1 : 0, draft.vatPct, pdfMode,
            totals.subtotalMaterials, totals.subtotalLabour,
            totals.subtotalBeforeDiscount, totals.discountAmount,
            totals.subtotalAfterDiscount, totals.vatAmount, totals.grandTotal,
            draft.notes || null, draft.terms || null,
          ]
        );
        quotationId = r.lastInsertRowId;
      } else {
        // UPDATE existing quotation
        await this.db.runAsync(
          `UPDATE quotations SET
             project_id = ?, customer_id = ?, title = ?,
             valid_until = ?, currency_symbol = ?,
             discount_type = ?, discount_value = ?, discount_note = ?,
             vat_enabled = ?, vat_pct = ?, pdf_mode = ?,
             subtotal_materials = ?, subtotal_labour = ?,
             subtotal_before_discount = ?, discount_amount = ?,
             subtotal_after_discount = ?, vat_amount = ?, grand_total = ?,
             notes = ?, terms = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [
            draft.projectId!, draft.customerId!, draft.title || null,
            validUntil ?? null, currencySymbol,
            draft.discountType ?? null, draft.discountValue, draft.discountNote || null,
            draft.vatEnabled ? 1 : 0, draft.vatPct, pdfMode,
            totals.subtotalMaterials, totals.subtotalLabour,
            totals.subtotalBeforeDiscount, totals.discountAmount,
            totals.subtotalAfterDiscount, totals.vatAmount, totals.grandTotal,
            draft.notes || null, draft.terms || null, quotationId,
          ]
        );
        // Delete old sections and lines (re-insert fresh)
        await this.db.runAsync(
          'DELETE FROM quotation_sections WHERE quotation_id = ?',
          [quotationId]
        );
        await this.db.runAsync(
          'DELETE FROM quotation_line_items WHERE quotation_id = ?',
          [quotationId]
        );
      }

      // Insert sections and line items
      for (const section of draft.sections) {
        const sr = await this.db.runAsync(
          `INSERT INTO quotation_sections (quotation_id, name, sort_order)
           VALUES (?, ?, ?)`,
          [quotationId!, section.name, section.sortOrder]
        );
        const sectionDbId = sr.lastInsertRowId;

        for (const line of section.lineItems) {
          await this.db.runAsync(
            `INSERT INTO quotation_line_items (
               quotation_id, section_id, source_type, source_id, assembly_instance_id,
               description, unit, quantity, unit_cost, markup_pct,
               unit_price, line_total, price_overridden,
               line_discount_type, line_discount_value, is_material, sort_order
             ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              quotationId!, sectionDbId,
              line.sourceType, line.sourceId ?? null, line.assemblyInstanceId ?? null,
              line.description, line.unit, line.quantity,
              line.unitCost, line.markupPct,
              line.unitPrice, line.lineTotal, line.priceOverridden ? 1 : 0,
              line.lineDiscountType ?? null, line.lineDiscountValue,
              line.isMaterial ? 1 : 0, line.sortOrder,
            ]
          );
        }
      }
    });

    return quotationId!;
  }

  async updatePdfMode(id: number, pdfMode: 'detailed' | 'simple'): Promise<void> {
    await this.db.runAsync(
      `UPDATE quotations SET pdf_mode = ?, updated_at = datetime('now') WHERE id = ?`,
      [pdfMode, id]
    );
  }

  async duplicate(id: number, newReferenceNo: string): Promise<number> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Original quotation not found');

    let newQuotationId: number = 0;
    await this.db.withTransactionAsync(async () => {
      const r = await this.db.runAsync(
        `INSERT INTO quotations (
           project_id, customer_id, reference_no, title, status,
           revision, parent_id, issue_date, valid_until, currency_symbol,
           discount_type, discount_value, discount_note,
           vat_enabled, vat_pct, pdf_mode,
           subtotal_materials, subtotal_labour, subtotal_before_discount,
           discount_amount, subtotal_after_discount, vat_amount, grand_total,
           notes, terms
         ) VALUES (?,?,?,?,?,?,?,date('now'),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          existing.projectId, existing.customerId, newReferenceNo,
          existing.title ? `${existing.title} (Copy)` : 'Copy of Quotation',
          'draft', existing.revision + 1, existing.id,
          existing.validUntil ?? null, existing.currencySymbol,
          existing.discountType ?? null, existing.discountValue, existing.discountNote || null,
          existing.vatEnabled ? 1 : 0, existing.vatPct, existing.pdfMode,
          existing.totals.subtotalMaterials, existing.totals.subtotalLabour,
          existing.totals.subtotalBeforeDiscount, existing.totals.discountAmount,
          existing.totals.subtotalAfterDiscount, existing.totals.vatAmount, existing.totals.grandTotal,
          existing.notes || null, existing.terms || null,
        ]
      );
      newQuotationId = r.lastInsertRowId;

      for (const section of existing.sections) {
        const sr = await this.db.runAsync(
          `INSERT INTO quotation_sections (quotation_id, name, sort_order)
           VALUES (?, ?, ?)`,
          [newQuotationId, section.name, section.sortOrder]
        );
        const sectionDbId = sr.lastInsertRowId;

        const linesForSection = existing.lineItems.filter((l) => l.sectionId === section.id);
        for (const line of linesForSection) {
          await this.db.runAsync(
            `INSERT INTO quotation_line_items (
               quotation_id, section_id, source_type, source_id, assembly_instance_id,
               description, unit, quantity, unit_cost, markup_pct,
               unit_price, line_total, price_overridden,
               line_discount_type, line_discount_value, is_material, sort_order
             ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              newQuotationId, sectionDbId,
              line.sourceType, line.sourceId ?? null, line.assemblyInstanceId ?? null,
              line.description, line.unit, line.quantity,
              line.unitCost, line.markupPct,
              line.unitPrice, line.lineTotal, line.priceOverridden ? 1 : 0,
              line.lineDiscountType ?? null, line.lineDiscountValue,
              line.isMaterial ? 1 : 0, line.sortOrder,
            ]
          );
        }
      }
    });

    return newQuotationId;
  }

  async updateStatus(id: number, status: QuotationStatus): Promise<void> {
    await this.db.runAsync(
      `UPDATE quotations SET status = ?, updated_at = datetime('now') WHERE id = ?`,
      [status, id]
    );
  }

  async updatePdfUri(id: number, pdfUri: string): Promise<void> {
    await this.db.runAsync(
      `UPDATE quotations SET pdf_uri = ?, updated_at = datetime('now') WHERE id = ?`,
      [pdfUri, id]
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM quotations WHERE id = ?', [id]);
  }

  async getCountByStatus(): Promise<Record<QuotationStatus, number>> {
    const rows = await this.db.getAllAsync<{ status: string; cnt: number }>(
      'SELECT status, COUNT(*) as cnt FROM quotations GROUP BY status'
    );
    const counts: any = {
      draft: 0, sent: 0, accepted: 0, declined: 0, revised: 0,
    };
    for (const r of rows) counts[r.status] = r.cnt;
    return counts;
  }
}
