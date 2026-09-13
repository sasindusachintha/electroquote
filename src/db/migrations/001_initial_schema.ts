export const MIGRATION_001 = `-- Migration 001: ElectroQuote full schema
-- Version: 1
-- Applied by: src/db/migrations/runner.ts

-- =====================================================
-- BUSINESS PROFILE
-- =====================================================
CREATE TABLE IF NOT EXISTS business_profile (
  id                    INTEGER PRIMARY KEY DEFAULT 1,
  name                  TEXT    NOT NULL DEFAULT '',
  trading_name          TEXT,
  phone                 TEXT,
  email                 TEXT,
  address_line1         TEXT,
  address_line2         TEXT,
  city                  TEXT,
  postal_code           TEXT,
  reg_number            TEXT,
  vat_number            TEXT,
  logo_uri              TEXT,
  currency_symbol       TEXT    NOT NULL DEFAULT 'Rs.',
  default_payment_terms TEXT,
  default_validity_days INTEGER NOT NULL DEFAULT 30,
  bank_name             TEXT,
  bank_account          TEXT,
  bank_branch           TEXT,
  default_vat_pct       REAL    NOT NULL DEFAULT 0,
  default_markup_pct    REAL    NOT NULL DEFAULT 0,
  pdf_mode              TEXT    NOT NULL DEFAULT 'detailed'
                        CHECK(pdf_mode IN ('detailed','simple')),
  created_at            TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Ensure exactly one row exists
INSERT OR IGNORE INTO business_profile (id) VALUES (1);

-- =====================================================
-- CUSTOMERS
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  company       TEXT,
  phone         TEXT,
  email         TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city          TEXT,
  postal_code   TEXT,
  notes         TEXT,
  is_archived   INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- =====================================================
-- PROJECTS
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id  INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  site_address TEXT,
  description  TEXT,
  status       TEXT    NOT NULL DEFAULT 'active'
               CHECK(status IN ('active','complete','archived')),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_projects_customer ON projects(customer_id);

-- =====================================================
-- MATERIAL CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS material_categories (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  name               TEXT    NOT NULL UNIQUE,
  default_markup_pct REAL    NOT NULL DEFAULT 20.0,
  sort_order         INTEGER NOT NULL DEFAULT 0
);

-- =====================================================
-- MATERIALS
-- =====================================================
CREATE TABLE IF NOT EXISTS materials (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id    INTEGER REFERENCES material_categories(id) ON DELETE SET NULL,
  name           TEXT    NOT NULL,
  brand          TEXT,
  sku            TEXT,
  unit           TEXT    NOT NULL DEFAULT 'each',
  cost_price     REAL    NOT NULL DEFAULT 0,
  markup_pct     REAL,            -- NULL = use category default
  sell_price     REAL    NOT NULL DEFAULT 0,  -- always stored (manual or computed)
  price_override INTEGER NOT NULL DEFAULT 0,  -- 1 = sell_price was set manually
  wastage_pct    REAL    NOT NULL DEFAULT 0,
  notes          TEXT,
  is_active      INTEGER NOT NULL DEFAULT 1,
  is_seed        INTEGER NOT NULL DEFAULT 0,  -- 1 = came from seed data (display notice)
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category_id);
CREATE INDEX IF NOT EXISTS idx_materials_name     ON materials(name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_materials_active   ON materials(is_active);

-- =====================================================
-- LABOUR ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS labour_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT,
  unit        TEXT    NOT NULL DEFAULT 'per point',
  unit_rate   REAL    NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  is_seed     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_labour_name ON labour_items(name COLLATE NOCASE);

-- =====================================================
-- ASSEMBLIES
-- =====================================================
CREATE TABLE IF NOT EXISTS assemblies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES material_categories(id) ON DELETE SET NULL,
  is_favourite INTEGER NOT NULL DEFAULT 0,
  is_active   INTEGER NOT NULL DEFAULT 1,
  is_seed     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assembly_material_lines (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  assembly_id   INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
  material_id   INTEGER NOT NULL REFERENCES materials(id),
  quantity      REAL    NOT NULL DEFAULT 1,
  include_wastage INTEGER NOT NULL DEFAULT 1,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assembly_labour_lines (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  assembly_id    INTEGER NOT NULL REFERENCES assemblies(id) ON DELETE CASCADE,
  labour_item_id INTEGER NOT NULL REFERENCES labour_items(id),
  quantity       REAL    NOT NULL DEFAULT 1,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_asm_mat_lines ON assembly_material_lines(assembly_id);
CREATE INDEX IF NOT EXISTS idx_asm_lab_lines ON assembly_labour_lines(assembly_id);

-- =====================================================
-- QUOTATION REFERENCE SEQUENCE
-- =====================================================
CREATE TABLE IF NOT EXISTS quotation_sequence (
  year     INTEGER NOT NULL,
  next_seq INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (year)
);

-- =====================================================
-- QUOTATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS quotations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id    INTEGER NOT NULL REFERENCES projects(id),
  customer_id   INTEGER NOT NULL REFERENCES customers(id),
  reference_no  TEXT    NOT NULL UNIQUE,
  title         TEXT,
  status        TEXT    NOT NULL DEFAULT 'draft'
                CHECK(status IN ('draft','sent','accepted','declined','revised')),
  revision      INTEGER NOT NULL DEFAULT 1,
  parent_id     INTEGER REFERENCES quotations(id),
  issue_date    TEXT    NOT NULL DEFAULT (date('now')),
  valid_until   TEXT,
  currency_symbol TEXT  NOT NULL DEFAULT 'Rs.',
  -- Discount
  discount_type  TEXT   CHECK(discount_type IN ('pct','fixed') OR discount_type IS NULL),
  discount_value REAL   NOT NULL DEFAULT 0,
  discount_note  TEXT,
  -- VAT â€” snapshotted at save time
  vat_enabled   INTEGER NOT NULL DEFAULT 0,
  vat_pct       REAL    NOT NULL DEFAULT 0,
  -- PDF mode at generation time
  pdf_mode      TEXT    NOT NULL DEFAULT 'detailed'
                CHECK(pdf_mode IN ('detailed','simple')),
  -- Cached totals
  subtotal_materials        REAL NOT NULL DEFAULT 0,
  subtotal_labour           REAL NOT NULL DEFAULT 0,
  subtotal_before_discount  REAL NOT NULL DEFAULT 0,
  discount_amount           REAL NOT NULL DEFAULT 0,
  subtotal_after_discount   REAL NOT NULL DEFAULT 0,
  vat_amount                REAL NOT NULL DEFAULT 0,
  grand_total               REAL NOT NULL DEFAULT 0,
  -- Content
  notes         TEXT,
  terms         TEXT,
  -- PDF
  pdf_uri       TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quotations_project  ON quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status   ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_date     ON quotations(issue_date DESC);

-- =====================================================
-- QUOTATION SECTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS quotation_sections (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL DEFAULT 'General',
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sections_quotation ON quotation_sections(quotation_id);

-- =====================================================
-- QUOTATION LINE ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS quotation_line_items (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  quotation_id        INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  section_id          INTEGER REFERENCES quotation_sections(id) ON DELETE SET NULL,
  -- Source tracking
  source_type         TEXT    NOT NULL CHECK(source_type IN ('material','labour','assembly','custom')),
  source_id           INTEGER,
  assembly_instance_id TEXT,          -- UUID grouping lines from same assembly addition
  -- Snapshotted values (immutable)
  description         TEXT    NOT NULL,
  unit                TEXT    NOT NULL,
  quantity            REAL    NOT NULL DEFAULT 1,
  unit_cost           REAL    NOT NULL DEFAULT 0,
  markup_pct          REAL    NOT NULL DEFAULT 0,
  unit_price          REAL    NOT NULL DEFAULT 0,
  line_total          REAL    NOT NULL DEFAULT 0,
  price_overridden    INTEGER NOT NULL DEFAULT 0,
  -- Line discount
  line_discount_type  TEXT    CHECK(line_discount_type IN ('pct','fixed') OR line_discount_type IS NULL),
  line_discount_value REAL    NOT NULL DEFAULT 0,
  -- Classification
  is_material         INTEGER NOT NULL DEFAULT 1,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_line_items_quotation ON quotation_line_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_line_items_section   ON quotation_line_items(section_id);

-- =====================================================
-- APP SETTINGS (key-value)
-- =====================================================
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT NOT NULL PRIMARY KEY,
  value      TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Default settings
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('terms_template', 'Payment due within 30 days of invoice date. All materials remain property of the contractor until full payment is received.');

-- =====================================================
-- SCHEMA VERSION TRACKER
-- =====================================================
CREATE TABLE IF NOT EXISTS schema_migrations (
  version    INTEGER PRIMARY KEY,
  applied_at TEXT    NOT NULL DEFAULT (datetime('now'))
);
`;
