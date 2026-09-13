// ─────────────────────────────────────────────────────────────────────────────
// ElectroQuote — TypeScript Data Models
// All interfaces match the SQLite schema exactly.
// ─────────────────────────────────────────────────────────────────────────────

export type ISODateString = string;       // "2025-08-15"
export type ISODateTimeString = string;    // "2025-08-15T10:30:00"
export type CurrencySymbol = string;       // "Rs.", "$", "£"
export type DiscountType = 'pct' | 'fixed';
export type SourceType = 'material' | 'labour' | 'assembly' | 'custom';

// ─────────────────────────────────────────────────────
// Business Profile
// ─────────────────────────────────────────────────────

export interface BusinessProfile {
  id: 1;
  name: string;
  tradingName?: string;
  ownerName?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  regNumber?: string;
  vatNumber?: string;
  logoUri?: string;
  currencySymbol: CurrencySymbol;           // default: "Rs."
  defaultPaymentTerms?: string;
  defaultValidityDays: number;              // default: 30
  bankName?: string;
  bankAccount?: string;
  bankBranch?: string;
  defaultVatEnabled: boolean;              // default: false
  defaultVatPct: number;                    // default: 0
  defaultMarkupPct: number;                 // default: 0
  defaultNotes?: string;
  pdfMode: 'detailed' | 'simple';          // default: detailed
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export type BusinessProfileInput = Omit<
  BusinessProfile,
  'id' | 'createdAt' | 'updatedAt'
>;

// ─────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────

export interface Customer {
  id: number;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  isArchived: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export type CustomerInput = Omit<
  Customer,
  'id' | 'isArchived' | 'createdAt' | 'updatedAt'
>;

// ─────────────────────────────────────────────────────
// Projects
// ─────────────────────────────────────────────────────

export type ProjectStatus =
  | 'draft'
  | 'quoting'
  | 'approved'
  | 'in_progress'
  | 'complete'
  | 'cancelled'
  | 'active'
  | 'archived';

export interface Project {
  id: number;
  customerId: number;
  name: string;
  siteAddress?: string;
  description?: string;
  status: ProjectStatus;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface ProjectWithCustomer extends Project {
  customer: Customer;
  quotationCount?: number;
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

// ─────────────────────────────────────────────────────
// Material Categories
// ─────────────────────────────────────────────────────

export interface MaterialCategory {
  id: number;
  name: string;
  defaultMarkupPct: number;
  sortOrder: number;
}

export type MaterialCategoryInput = Omit<MaterialCategory, 'id'>;

// ─────────────────────────────────────────────────────
// Materials
// ─────────────────────────────────────────────────────

export interface Material {
  id: number;
  categoryId?: number;
  name: string;
  brand?: string;                   // optional brand/manufacturer
  sku?: string;
  unit: string;
  costPrice: number;                // what electrician pays
  markupPct?: number;               // null = use category default
  sellPrice: number;                // actual selling price (always stored)
  priceOverride: boolean;           // true = sellPrice set manually
  wastagePct: number;
  notes?: string;
  isActive: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface MaterialWithCategory extends Material {
  category?: MaterialCategory;
}

export type MaterialInput = Omit<
  Material,
  'id' | 'isActive' | 'createdAt' | 'updatedAt'
>;

// ─────────────────────────────────────────────────────
// Labour Items
// ─────────────────────────────────────────────────────

export interface LabourItem {
  id: number;
  name: string;
  description?: string;
  unit: string;
  unitRate: number;
  isActive: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export type LabourItemInput = Omit<
  LabourItem,
  'id' | 'isActive' | 'createdAt' | 'updatedAt'
>;

// ─────────────────────────────────────────────────────
// Assemblies
// ─────────────────────────────────────────────────────

export interface AssemblyMaterialLine {
  id: number;
  assemblyId: number;
  materialId: number;
  quantity: number;
  includeWastage: boolean;
  sortOrder: number;
  material?: MaterialWithCategory;
}

export interface AssemblyLabourLine {
  id: number;
  assemblyId: number;
  labourItemId: number;
  quantity: number;
  sortOrder: number;
  labourItem?: LabourItem;
}

export interface Assembly {
  id: number;
  name: string;
  description?: string;
  categoryId?: number;
  unit: string;                     // e.g. "point", "socket", "fan", "job"
  isFavourite: boolean;
  isActive: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface AssemblyDetail extends Assembly {
  category?: MaterialCategory;
  materialLines: AssemblyMaterialLine[];
  labourLines: AssemblyLabourLine[];
}

export type AssemblyInput = Omit<
  Assembly,
  'id' | 'isActive' | 'createdAt' | 'updatedAt'
> & {
  materialLines: Omit<AssemblyMaterialLine, 'id' | 'assemblyId' | 'material'>[];
  labourLines: Omit<AssemblyLabourLine, 'id' | 'assemblyId' | 'labourItem'>[];
};

// ─────────────────────────────────────────────────────
// Quotation
// ─────────────────────────────────────────────────────

export type QuotationStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'declined'
  | 'revised';

export interface QuotationSection {
  id: number;
  quotationId: number;
  name: string;
  sortOrder: number;
}

export interface QuotationLineItem {
  id: number;
  quotationId: number;
  sectionId?: number;
  // Source tracking (for audit trail; actual values are snapshotted below)
  sourceType: SourceType;
  sourceId?: number;
  assemblyInstanceId?: string;     // groups lines that came from same assembly addition
  // Snapshotted values (immutable after save)
  description: string;
  unit: string;
  quantity: number;
  unitCost: number;                // cost price at time of quoting
  markupPct: number;
  unitPrice: number;               // sell price at time of quoting
  lineTotal: number;               // quantity × unitPrice (after line discount)
  priceOverridden: boolean;
  // Line discount
  lineDiscountType?: DiscountType;
  lineDiscountValue: number;
  // Classification
  isMaterial: boolean;             // false = labour
  sortOrder: number;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface QuotationTotals {
  subtotalMaterials: number;
  subtotalLabour: number;
  subtotalBeforeDiscount: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  vatAmount: number;
  grandTotal: number;
}

export interface Quotation {
  id: number;
  projectId: number;
  customerId: number;
  referenceNo: string;             // EQ-2025-0001
  title?: string;
  status: QuotationStatus;
  revision: number;
  parentId?: number;
  issueDate: ISODateString;
  validUntil?: ISODateString;
  currencySymbol: CurrencySymbol;
  // Discount
  discountType?: DiscountType;
  discountValue: number;
  discountNote?: string;
  // VAT — snapshotted at save time
  vatEnabled: boolean;
  vatPct: number;                  // stored even if vatEnabled=false, for reference
  // Cached totals
  totals: QuotationTotals;
  // Content
  notes?: string;
  terms?: string;
  // PDF
  pdfUri?: string;
  // PDF display mode at time of generation
  pdfMode: 'detailed' | 'simple';
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface QuotationDetail extends Quotation {
  customer: Customer;
  project: Project;
  sections: QuotationSection[];
  lineItems: QuotationLineItem[];
}

export interface QuotationSummary extends Quotation {
  customer: Pick<Customer, 'id' | 'name' | 'company'>;
  project: Pick<Project, 'id' | 'name'>;
  lineItemCount: number;
}

// ─────────────────────────────────────────────────────
// Quotation Draft (Zustand in-memory state)
// ─────────────────────────────────────────────────────

export interface QuotationDraft {
  quotationId?: number;            // undefined = new quotation
  projectId?: number;
  customerId?: number;
  title: string;
  sections: DraftSection[];
  discountType?: DiscountType;
  discountValue: number;
  discountNote: string;
  vatEnabled: boolean;
  vatPct: number;
  notes: string;
  terms: string;
  isDirty: boolean;
}

export interface DraftSection {
  localId: string;                 // uuid — stable before DB save
  dbId?: number;
  name: string;
  sortOrder: number;
  lineItems: DraftLineItem[];
}

export interface DraftLineItem {
  localId: string;
  dbId?: number;
  sourceType: SourceType;
  sourceId?: number;
  assemblyInstanceId?: string;     // groups lines from same assembly tap
  description: string;
  unit: string;
  quantity: number;
  unitCost: number;
  markupPct: number;
  unitPrice: number;
  lineTotal: number;
  priceOverridden: boolean;
  lineDiscountType?: DiscountType;
  lineDiscountValue: number;
  isMaterial: boolean;
  sortOrder: number;
}

// ─────────────────────────────────────────────────────
// Computed totals helper (pure, derived from draft)
// ─────────────────────────────────────────────────────

export interface DraftTotals {
  subtotalMaterials: number;
  subtotalLabour: number;
  subtotalBeforeDiscount: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  vatAmount: number;
  grandTotal: number;
}

// ─────────────────────────────────────────────────────
// App Settings (key-value store)
// ─────────────────────────────────────────────────────

export interface AppSettings {
  lastBackupDate?: ISODateString;
  termsTemplate: string;
}

// ─────────────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────────────

export interface PDFOptions {
  quotation: QuotationDetail;
  businessProfile: BusinessProfile;
  mode: 'detailed' | 'simple';
}

// ─────────────────────────────────────────────────────
// Backup
// ─────────────────────────────────────────────────────

export interface BackupManifest {
  version: number;
  appVersion: string;
  exportedAt: ISODateTimeString;
  recordCounts: {
    customers: number;
    projects: number;
    materials: number;
    assemblies: number;
    quotations: number;
  };
}

export interface BackupFile {
  manifest: BackupManifest;
  businessProfile: BusinessProfile;
  materialCategories: MaterialCategory[];
  materials: Material[];
  labourItems: LabourItem[];
  assemblies: AssemblyDetail[];
  customers: Customer[];
  projects: Project[];
  quotations: QuotationDetail[];
}

// ─────────────────────────────────────────────────────
// Seed data flag
// ─────────────────────────────────────────────────────

export interface SeedMaterial extends Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> {
  categoryName: string;            // matched to seeded category by name
}
