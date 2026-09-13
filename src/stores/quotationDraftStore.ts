// src/stores/quotationDraftStore.ts
// Zustand store for the active quotation being built/edited.
// This is the in-memory state that drives the quotation builder screen.

import { create } from 'zustand';
import type {
  QuotationDraft,
  DraftTotals,
  AssemblyDetail,
  BusinessProfile,
  MaterialWithCategory,
  LabourItem,
} from '../types/models';
import {
  createEmptyDraft,
  expandAssemblyIntoDraft,
  addMaterialLine,
  addLabourLine,
  updateLineItem,
  removeLineItem,
  addSection,
  removeSection,
  renameSection,
  computeDraftTotals,
} from '../services/QuotationService';
import type { DraftLineItem } from '../types/models';

interface QuotationDraftState {
  draft: QuotationDraft;
  totals: DraftTotals;
  activeSectionLocalId: string;   // which section is currently selected

  // Actions
  initNewDraft: (customerId?: number, projectId?: number, profile?: BusinessProfile) => void;
  loadDraft: (draft: QuotationDraft) => void;
  setCustomer: (customerId: number) => void;
  setProject: (projectId: number) => void;
  setTitle: (title: string) => void;
  setActiveSection: (localId: string) => void;

  addAssembly: (assembly: AssemblyDetail, multiplier: number, profile: BusinessProfile) => void;
  addMaterial: (material: MaterialWithCategory, quantity: number, profile: BusinessProfile) => void;
  addLabour: (item: LabourItem, quantity: number) => void;
  updateLine: (sectionLocalId: string, lineLocalId: string, patch: Partial<DraftLineItem>) => void;
  removeLine: (sectionLocalId: string, lineLocalId: string) => void;

  addSectionToQuote: (name: string) => void;
  removeSectionFromQuote: (localId: string) => void;
  renameSectionInQuote: (localId: string, name: string) => void;

  setDiscount: (type: 'pct' | 'fixed' | undefined, value: number, note: string) => void;
  setVat: (enabled: boolean, pct: number) => void;
  setNotes: (notes: string) => void;
  setTerms: (terms: string) => void;

  markSaved: (quotationId: number) => void;
  resetDraft: () => void;
}

function computeTotals(draft: QuotationDraft): DraftTotals {
  return computeDraftTotals(draft);
}

const EMPTY_DRAFT = createEmptyDraft();

export const useQuotationDraftStore = create<QuotationDraftState>((set, get) => ({
  draft: EMPTY_DRAFT,
  totals: computeTotals(EMPTY_DRAFT),
  activeSectionLocalId: EMPTY_DRAFT.sections[0]?.localId ?? '',

  initNewDraft: (customerId, projectId, profile) => {
    const draft = createEmptyDraft(customerId, projectId, profile);
    set({
      draft,
      totals: computeTotals(draft),
      activeSectionLocalId: draft.sections[0]?.localId ?? '',
    });
  },

  loadDraft: (draft) => {
    set({
      draft,
      totals: computeTotals(draft),
      activeSectionLocalId: draft.sections[0]?.localId ?? '',
    });
  },

  setCustomer: (customerId) => {
    const draft = { ...get().draft, customerId, isDirty: true };
    set({ draft });
  },

  setProject: (projectId) => {
    const draft = { ...get().draft, projectId, isDirty: true };
    set({ draft });
  },

  setTitle: (title) => {
    const draft = { ...get().draft, title, isDirty: true };
    set({ draft });
  },

  setActiveSection: (localId) => set({ activeSectionLocalId: localId }),

  addAssembly: (assembly, multiplier, profile) => {
    const { draft, activeSectionLocalId } = get();
    const newDraft = expandAssemblyIntoDraft(draft, {
      assembly,
      multiplier,
      targetSectionLocalId: activeSectionLocalId,
      businessProfile: profile,
    });
    set({ draft: newDraft, totals: computeTotals(newDraft) });
  },

  addMaterial: (material, quantity, profile) => {
    const { draft, activeSectionLocalId } = get();
    const newDraft = addMaterialLine(draft, activeSectionLocalId, material, quantity, profile);
    set({ draft: newDraft, totals: computeTotals(newDraft) });
  },

  addLabour: (item, quantity) => {
    const { draft, activeSectionLocalId } = get();
    const newDraft = addLabourLine(draft, activeSectionLocalId, item, quantity);
    set({ draft: newDraft, totals: computeTotals(newDraft) });
  },

  updateLine: (sectionLocalId, lineLocalId, patch) => {
    const newDraft = updateLineItem(get().draft, sectionLocalId, lineLocalId, patch);
    set({ draft: newDraft, totals: computeTotals(newDraft) });
  },

  removeLine: (sectionLocalId, lineLocalId) => {
    const newDraft = removeLineItem(get().draft, sectionLocalId, lineLocalId);
    set({ draft: newDraft, totals: computeTotals(newDraft) });
  },

  addSectionToQuote: (name) => {
    const newDraft = addSection(get().draft, name);
    const newSection = newDraft.sections[newDraft.sections.length - 1];
    set({
      draft: newDraft,
      activeSectionLocalId: newSection.localId,
    });
  },

  removeSectionFromQuote: (localId) => {
    const { draft } = get();
    const newDraft = removeSection(draft, localId);
    const fallback = newDraft.sections[0]?.localId ?? '';
    set({
      draft: newDraft,
      totals: computeTotals(newDraft),
      activeSectionLocalId: fallback,
    });
  },

  renameSectionInQuote: (localId, name) => {
    const newDraft = renameSection(get().draft, localId, name);
    set({ draft: newDraft });
  },

  setDiscount: (type, value, note) => {
    const draft = {
      ...get().draft,
      discountType: type,
      discountValue: value,
      discountNote: note,
      isDirty: true,
    };
    set({ draft, totals: computeTotals(draft) });
  },

  setVat: (enabled, pct) => {
    const draft = { ...get().draft, vatEnabled: enabled, vatPct: pct, isDirty: true };
    set({ draft, totals: computeTotals(draft) });
  },

  setNotes: (notes) => {
    const draft = { ...get().draft, notes, isDirty: true };
    set({ draft });
  },

  setTerms: (terms) => {
    const draft = { ...get().draft, terms, isDirty: true };
    set({ draft });
  },

  markSaved: (quotationId) => {
    const draft = { ...get().draft, quotationId, isDirty: false };
    set({ draft });
  },

  resetDraft: () => {
    const empty = createEmptyDraft();
    set({
      draft: empty,
      totals: computeTotals(empty),
      activeSectionLocalId: empty.sections[0]?.localId ?? '',
    });
  },
}));
