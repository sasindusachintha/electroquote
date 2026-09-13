// src/db/repositories/BusinessProfileRepository.ts

import type * as SQLite from 'expo-sqlite';
import type { BusinessProfile, BusinessProfileInput } from '../../types/models';

function rowToProfile(row: Record<string, unknown>): BusinessProfile {
  return {
    id: 1,
    name: (row.name as string) ?? '',
    tradingName: row.trading_name as string | undefined,
    ownerName: row.owner_name as string | undefined,
    phone: row.phone as string | undefined,
    whatsappNumber: row.whatsapp_number as string | undefined,
    email: row.email as string | undefined,
    addressLine1: row.address_line1 as string | undefined,
    addressLine2: row.address_line2 as string | undefined,
    city: row.city as string | undefined,
    postalCode: row.postal_code as string | undefined,
    regNumber: row.reg_number as string | undefined,
    vatNumber: row.vat_number as string | undefined,
    logoUri: row.logo_uri as string | undefined,
    currencySymbol: (row.currency_symbol as string) ?? 'Rs.',
    defaultPaymentTerms: row.default_payment_terms as string | undefined,
    defaultValidityDays: (row.default_validity_days as number) ?? 30,
    bankName: row.bank_name as string | undefined,
    bankAccount: row.bank_account as string | undefined,
    bankBranch: row.bank_branch as string | undefined,
    defaultVatEnabled: (row.default_vat_enabled as number) === 1,
    defaultVatPct: (row.default_vat_pct as number) ?? 0,
    defaultMarkupPct: (row.default_markup_pct as number) ?? 0,
    defaultNotes: row.default_notes as string | undefined,
    pdfMode: ((row.pdf_mode as string) ?? 'detailed') as 'detailed' | 'simple',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export class BusinessProfileRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async get(): Promise<BusinessProfile> {
    const row = await this.db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM business_profile WHERE id = 1'
    );
    if (!row) throw new Error('Business profile row missing');
    return rowToProfile(row);
  }

  async update(input: BusinessProfileInput): Promise<BusinessProfile> {
    await this.db.runAsync(
      `UPDATE business_profile SET
        name = ?, trading_name = ?, owner_name = ?, phone = ?, whatsapp_number = ?, email = ?,
        address_line1 = ?, address_line2 = ?, city = ?, postal_code = ?,
        reg_number = ?, vat_number = ?, logo_uri = ?,
        currency_symbol = ?, default_payment_terms = ?, default_validity_days = ?,
        bank_name = ?, bank_account = ?, bank_branch = ?,
        default_vat_enabled = ?, default_vat_pct = ?, default_markup_pct = ?,
        default_notes = ?, pdf_mode = ?,
        updated_at = datetime('now')
       WHERE id = 1`,
      [
        input.name, input.tradingName ?? null, input.ownerName ?? null,
        input.phone ?? null, input.whatsappNumber ?? null, input.email ?? null,
        input.addressLine1 ?? null, input.addressLine2 ?? null,
        input.city ?? null, input.postalCode ?? null,
        input.regNumber ?? null, input.vatNumber ?? null, input.logoUri ?? null,
        input.currencySymbol, input.defaultPaymentTerms ?? null,
        input.defaultValidityDays,
        input.bankName ?? null, input.bankAccount ?? null, input.bankBranch ?? null,
        input.defaultVatEnabled ? 1 : 0, input.defaultVatPct, input.defaultMarkupPct,
        input.defaultNotes ?? null, input.pdfMode,
      ]
    );
    return this.get();
  }
}
