export const MIGRATION_005 = `-- Migration 005: Add extra settings fields to business_profile
-- Version: 5

ALTER TABLE business_profile ADD COLUMN owner_name TEXT;
ALTER TABLE business_profile ADD COLUMN whatsapp_number TEXT;
ALTER TABLE business_profile ADD COLUMN default_vat_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE business_profile ADD COLUMN default_notes TEXT;
`;
