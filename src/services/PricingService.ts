// src/services/PricingService.ts
// Resolves the effective sell price for a material, respecting:
//   1. Manual price override (price_override = true)
//   2. Item-level markup %
//   3. Category-level default markup %
//   4. Business-level default markup %

import type { Material, MaterialCategory } from '../types/models';
import { computeSellPrice } from '../utils/calculations';

interface PricingContext {
  businessDefaultMarkupPct: number;
}

export function resolveSellPrice(
  material: Pick<Material, 'costPrice' | 'sellPrice' | 'priceOverride' | 'markupPct'>,
  category: Pick<MaterialCategory, 'defaultMarkupPct'> | undefined,
  ctx: PricingContext
): number {
  if (material.priceOverride) {
    return material.sellPrice;
  }

  const markupPct =
    material.markupPct != null
      ? material.markupPct
      : category?.defaultMarkupPct ?? ctx.businessDefaultMarkupPct;

  return computeSellPrice(material.costPrice, markupPct);
}

export function resolveMarkupPct(
  material: Pick<Material, 'markupPct'>,
  category: Pick<MaterialCategory, 'defaultMarkupPct'> | undefined,
  ctx: PricingContext
): number {
  return (
    material.markupPct ??
    category?.defaultMarkupPct ??
    ctx.businessDefaultMarkupPct
  );
}

export const PricingService = {
  resolveSellPrice,
  resolveMarkupPct,
  calculateSellPrice(
    costPrice: number,
    markupPct?: number,
    categoryDefaultMarkupPct?: number,
    businessDefaultMarkupPct = 25
  ): number {
    const effectiveMarkup = markupPct ?? categoryDefaultMarkupPct ?? businessDefaultMarkupPct;
    return computeSellPrice(costPrice, effectiveMarkup);
  },
};
