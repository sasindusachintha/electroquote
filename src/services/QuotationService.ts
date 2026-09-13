// src/services/QuotationService.ts
// Core business logic for building and mutating a quotation draft.
// All methods are pure (take draft + return new draft) — no DB access here.

import { generateUUID as uuidv4 } from '../utils/id';
import type {
  AssemblyDetail,
  BusinessProfile,
  DraftLineItem,
  DraftSection,
  DraftTotals,
  QuotationDraft,
  LabourItem,
  Material,
  MaterialCategory,
  MaterialWithCategory,
} from '../types/models';
import {
  applyWastage,
  computeLineTotal,
  computeDraftTotals,
  round2,
} from '../utils/calculations';
import { resolveSellPrice, resolveMarkupPct } from './PricingService';

interface ExpandAssemblyOptions {
  assembly: AssemblyDetail;
  multiplier: number;
  targetSectionLocalId: string;
  businessProfile: BusinessProfile;
}

/**
 * Create an empty quotation draft ready for editing.
 */
export function createEmptyDraft(
  customerId?: number,
  projectId?: number,
  businessProfile?: BusinessProfile
): QuotationDraft {
  const defaultSection: DraftSection = {
    localId: uuidv4(),
    name: 'General',
    sortOrder: 0,
    lineItems: [],
  };

  return {
    quotationId: undefined,
    customerId,
    projectId,
    title: '',
    sections: [defaultSection],
    discountType: undefined,
    discountValue: 0,
    discountNote: '',
    vatEnabled: businessProfile?.defaultVatEnabled ?? false,
    vatPct: businessProfile?.defaultVatPct ?? 0,
    notes: businessProfile?.defaultNotes ?? '',
    terms: businessProfile?.defaultPaymentTerms ?? '',
    isDirty: false,
  };
}

/**
 * Expand an assembly into draft line items and append them to the target section.
 * Each material line becomes a DraftLineItem (isMaterial=true).
 * Each labour line becomes a DraftLineItem (isMaterial=false).
 * All lines from one assembly addition share the same assemblyInstanceId (UUID).
 */
export function expandAssemblyIntoDraft(
  draft: QuotationDraft,
  options: ExpandAssemblyOptions
): QuotationDraft {
  const { assembly, multiplier, targetSectionLocalId, businessProfile } = options;
  const assemblyInstanceId = uuidv4();

  const newLines: DraftLineItem[] = [];
  let sortBase =
    (draft.sections
      .find((s) => s.localId === targetSectionLocalId)
      ?.lineItems.reduce((max, l) => Math.max(max, l.sortOrder), 0) ?? 0) + 1;

  // Material lines
  for (const ml of assembly.materialLines) {
    const material = ml.material;
    if (!material) continue;

    const baseQty = ml.quantity * multiplier;
    const qty = ml.includeWastage
      ? applyWastage(baseQty, material.wastagePct)
      : round2(baseQty);

    const markupPct = resolveMarkupPct(
      material,
      material.category,
      { businessDefaultMarkupPct: businessProfile.defaultMarkupPct }
    );
    const unitPrice = resolveSellPrice(
      material,
      material.category,
      { businessDefaultMarkupPct: businessProfile.defaultMarkupPct }
    );
    const lineTotal = computeLineTotal(qty, unitPrice);

    newLines.push({
      localId: uuidv4(),
      sourceType: 'assembly',
      sourceId: assembly.id,
      assemblyInstanceId,
      description: material.name,
      unit: material.unit,
      quantity: qty,
      unitCost: material.costPrice,
      markupPct,
      unitPrice,
      lineTotal,
      priceOverridden: material.priceOverride,
      lineDiscountValue: 0,
      isMaterial: true,
      sortOrder: sortBase++,
    });
  }

  // Labour lines
  for (const ll of assembly.labourLines) {
    const labour = ll.labourItem;
    if (!labour) continue;

    const qty = round2(ll.quantity * multiplier);
    const unitPrice = labour.unitRate;
    const lineTotal = computeLineTotal(qty, unitPrice);

    newLines.push({
      localId: uuidv4(),
      sourceType: 'assembly',
      sourceId: assembly.id,
      assemblyInstanceId,
      description: labour.name,
      unit: labour.unit,
      quantity: qty,
      unitCost: unitPrice,   // for labour, cost = rate (no separate cost concept)
      markupPct: 0,
      unitPrice,
      lineTotal,
      priceOverridden: false,
      lineDiscountValue: 0,
      isMaterial: false,
      sortOrder: sortBase++,
    });
  }

  // Append to the target section
  return {
    ...draft,
    isDirty: true,
    sections: draft.sections.map((section) => {
      if (section.localId !== targetSectionLocalId) return section;
      return {
        ...section,
        lineItems: [...section.lineItems, ...newLines],
      };
    }),
  };
}

/**
 * Add a single material as a line item (not from assembly).
 */
export function addMaterialLine(
  draft: QuotationDraft,
  sectionLocalId: string,
  material: MaterialWithCategory,
  quantity: number,
  businessProfile: BusinessProfile
): QuotationDraft {
  const markupPct = resolveMarkupPct(
    material,
    material.category,
    { businessDefaultMarkupPct: businessProfile.defaultMarkupPct }
  );
  const unitPrice = resolveSellPrice(
    material,
    material.category,
    { businessDefaultMarkupPct: businessProfile.defaultMarkupPct }
  );
  const lineTotal = computeLineTotal(quantity, unitPrice);

  const nextSortOrder =
    (draft.sections
      .find((s) => s.localId === sectionLocalId)
      ?.lineItems.reduce((max, l) => Math.max(max, l.sortOrder), -1) ?? -1) + 1;

  const newLine: DraftLineItem = {
    localId: uuidv4(),
    sourceType: 'material',
    sourceId: material.id,
    description: material.name,
    unit: material.unit,
    quantity,
    unitCost: material.costPrice,
    markupPct,
    unitPrice,
    lineTotal,
    priceOverridden: material.priceOverride,
    lineDiscountValue: 0,
    isMaterial: true,
    sortOrder: nextSortOrder,
  };

  return appendLineToSection(draft, sectionLocalId, newLine);
}

/**
 * Add a single labour item as a line item.
 */
export function addLabourLine(
  draft: QuotationDraft,
  sectionLocalId: string,
  labourItem: LabourItem,
  quantity: number
): QuotationDraft {
  const lineTotal = computeLineTotal(quantity, labourItem.unitRate);

  const nextSortOrder =
    (draft.sections
      .find((s) => s.localId === sectionLocalId)
      ?.lineItems.reduce((max, l) => Math.max(max, l.sortOrder), -1) ?? -1) + 1;

  const newLine: DraftLineItem = {
    localId: uuidv4(),
    sourceType: 'labour',
    sourceId: labourItem.id,
    description: labourItem.name,
    unit: labourItem.unit,
    quantity,
    unitCost: labourItem.unitRate,
    markupPct: 0,
    unitPrice: labourItem.unitRate,
    lineTotal,
    priceOverridden: false,
    lineDiscountValue: 0,
    isMaterial: false,
    sortOrder: nextSortOrder,
  };

  return appendLineToSection(draft, sectionLocalId, newLine);
}

/**
 * Update a single field on a line item and recompute its line total.
 */
export function updateLineItem(
  draft: QuotationDraft,
  sectionLocalId: string,
  lineLocalId: string,
  patch: Partial<DraftLineItem>
): QuotationDraft {
  return {
    ...draft,
    isDirty: true,
    sections: draft.sections.map((section) => {
      if (section.localId !== sectionLocalId) return section;
      return {
        ...section,
        lineItems: section.lineItems.map((line) => {
          if (line.localId !== lineLocalId) return line;
          const updated = { ...line, ...patch };
          // Recompute unitPrice if quantity, cost, or markup changed (and not overridden)
          if (!updated.priceOverridden) {
            updated.unitPrice = updated.unitCost * (1 + updated.markupPct / 100);
            updated.unitPrice = round2(updated.unitPrice);
          }
          updated.lineTotal = computeLineTotal(
            updated.quantity,
            updated.unitPrice,
            updated.lineDiscountType,
            updated.lineDiscountValue
          );
          return updated;
        }),
      };
    }),
  };
}

/**
 * Remove a line item from a section.
 */
export function removeLineItem(
  draft: QuotationDraft,
  sectionLocalId: string,
  lineLocalId: string
): QuotationDraft {
  return {
    ...draft,
    isDirty: true,
    sections: draft.sections.map((section) => {
      if (section.localId !== sectionLocalId) return section;
      return {
        ...section,
        lineItems: section.lineItems.filter((l) => l.localId !== lineLocalId),
      };
    }),
  };
}

/**
 * Add a new section to the draft.
 */
export function addSection(draft: QuotationDraft, name: string): QuotationDraft {
  const nextOrder =
    draft.sections.reduce((max, s) => Math.max(max, s.sortOrder), -1) + 1;
  return {
    ...draft,
    isDirty: true,
    sections: [
      ...draft.sections,
      {
        localId: uuidv4(),
        name,
        sortOrder: nextOrder,
        lineItems: [],
      },
    ],
  };
}

/**
 * Remove a section and all its line items.
 */
export function removeSection(
  draft: QuotationDraft,
  sectionLocalId: string
): QuotationDraft {
  return {
    ...draft,
    isDirty: true,
    sections: draft.sections.filter((s) => s.localId !== sectionLocalId),
  };
}

/**
 * Rename a section.
 */
export function renameSection(
  draft: QuotationDraft,
  sectionLocalId: string,
  name: string
): QuotationDraft {
  return {
    ...draft,
    isDirty: true,
    sections: draft.sections.map((s) =>
      s.localId === sectionLocalId ? { ...s, name } : s
    ),
  };
}

// ─── Helpers ─────────────────────────────────────────

function appendLineToSection(
  draft: QuotationDraft,
  sectionLocalId: string,
  line: DraftLineItem
): QuotationDraft {
  return {
    ...draft,
    isDirty: true,
    sections: draft.sections.map((section) => {
      if (section.localId !== sectionLocalId) return section;
      return { ...section, lineItems: [...section.lineItems, line] };
    }),
  };
}

/** Re-export computeDraftTotals for convenience */
export { computeDraftTotals };
