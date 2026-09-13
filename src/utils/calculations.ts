// src/utils/calculations.ts
// Pure calculation functions — no side effects, no DB access.
// All money values are in LKR (or whatever currency the business uses).

import type { DraftLineItem, DraftSection, QuotationDraft, DraftTotals } from '../types/models';

/** Round to 2 decimal places */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Compute the sell price from cost price + markup %.
 * markupPct is a percentage (e.g., 20 = 20%).
 */
export function computeSellPrice(costPrice: number, markupPct: number): number {
  return round2(costPrice * (1 + markupPct / 100));
}

/**
 * Compute markup % from cost and sell price.
 * Returns 0 if costPrice is 0 (avoid divide by zero).
 */
export function computeMarkupPct(costPrice: number, sellPrice: number): number {
  if (costPrice === 0) return 0;
  return round2(((sellPrice - costPrice) / costPrice) * 100);
}

/**
 * Apply wastage to a quantity.
 * wastagePct = 10 means add 10% extra.
 */
export function applyWastage(qty: number, wastagePct: number): number {
  return round2(qty * (1 + wastagePct / 100));
}

/**
 * Compute line total after optional line-level discount.
 */
export function computeLineTotal(
  quantity: number,
  unitPrice: number,
  lineDiscountType?: 'pct' | 'fixed',
  lineDiscountValue: number = 0
): number {
  const raw = round2(quantity * unitPrice);
  if (!lineDiscountType || lineDiscountValue <= 0) return raw;
  if (lineDiscountType === 'pct') {
    return round2(raw * (1 - lineDiscountValue / 100));
  }
  return round2(Math.max(0, raw - lineDiscountValue));
}

/**
 * Compute quotation-level discount amount from a subtotal.
 */
export function computeDiscountAmount(
  subtotal: number,
  discountType?: 'pct' | 'fixed',
  discountValue: number = 0
): number {
  if (!discountType || discountValue <= 0) return 0;
  if (discountType === 'pct') {
    return round2(subtotal * (discountValue / 100));
  }
  return round2(Math.min(subtotal, discountValue));
}

/**
 * Compute all totals for a quotation draft.
 * This is the single source of truth for the running total footer.
 */
export function computeDraftTotals(draft: QuotationDraft): DraftTotals {
  let subtotalMaterials = 0;
  let subtotalLabour = 0;

  for (const section of draft.sections) {
    for (const line of section.lineItems) {
      if (line.isMaterial) {
        subtotalMaterials += line.lineTotal;
      } else {
        subtotalLabour += line.lineTotal;
      }
    }
  }

  subtotalMaterials = round2(subtotalMaterials);
  subtotalLabour = round2(subtotalLabour);

  const subtotalBeforeDiscount = round2(subtotalMaterials + subtotalLabour);
  const discountAmount = computeDiscountAmount(
    subtotalBeforeDiscount,
    draft.discountType,
    draft.discountValue
  );
  const subtotalAfterDiscount = round2(subtotalBeforeDiscount - discountAmount);
  const vatAmount = draft.vatEnabled
    ? round2(subtotalAfterDiscount * (draft.vatPct / 100))
    : 0;
  const grandTotal = round2(subtotalAfterDiscount + vatAmount);

  return {
    subtotalMaterials,
    subtotalLabour,
    subtotalBeforeDiscount,
    discountAmount,
    subtotalAfterDiscount,
    vatAmount,
    grandTotal,
  };
}

/**
 * Format a number as LKR currency string.
 * e.g., 1234.5 → "Rs. 1,234.50"
 */
export function formatCurrency(
  amount: number,
  symbol: string = 'Rs.',
  decimals: number = 2
): string {
  const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol} ${formatted}`;
}

/**
 * Format a number compactly for display in tight spaces.
 * e.g., 1234.5 → "Rs.1,235"
 */
export function formatCurrencyCompact(
  amount: number,
  symbol: string = 'Rs.'
): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol}${formatted}`;
}
