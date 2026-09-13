// src/constants/units.ts
// Common electrical units for Sri Lankan work

export const MATERIAL_UNITS = [
  { label: 'Each (pcs)', value: 'each' },
  { label: 'Metre (m)', value: 'm' },
  { label: 'Roll (roll)', value: 'roll' },
  { label: 'Box (box)', value: 'box' },
  { label: 'Pack (pack)', value: 'pack' },
  { label: 'Pair (pair)', value: 'pair' },
  { label: 'Set (set)', value: 'set' },
  { label: 'Lot (lot)', value: 'lot' },
  { label: 'Kg (kg)', value: 'kg' },
  { label: 'Litre (L)', value: 'L' },
] as const;

export const LABOUR_UNITS = [
  { label: 'Per Point', value: 'per point' },
  { label: 'Per Hour', value: 'per hour' },
  { label: 'Per Day', value: 'per day' },
  { label: 'Per Job (Lump Sum)', value: 'lump sum' },
  { label: 'Per Metre', value: 'per metre' },
  { label: 'Per DB Board', value: 'per DB' },
  { label: 'Per Circuit', value: 'per circuit' },
  { label: 'Per Fitting', value: 'per fitting' },
] as const;

export type MaterialUnit = typeof MATERIAL_UNITS[number]['value'];
export type LabourUnit = typeof LABOUR_UNITS[number]['value'];

// ─────────────────────────────────────────────────────
// src/constants/seedCategories.ts
// Sri Lankan electrical material categories with suggested markup
// ─────────────────────────────────────────────────────

export const SEED_CATEGORIES = [
  { name: 'Cables & Wires', defaultMarkupPct: 20, sortOrder: 1 },
  { name: 'Conduit & Trunking', defaultMarkupPct: 20, sortOrder: 2 },
  { name: 'Sockets & Switches', defaultMarkupPct: 25, sortOrder: 3 },
  { name: 'Distribution Boards', defaultMarkupPct: 20, sortOrder: 4 },
  { name: 'MCBs & Protection', defaultMarkupPct: 25, sortOrder: 5 },
  { name: 'Lighting', defaultMarkupPct: 30, sortOrder: 6 },
  { name: 'Ceiling Fans', defaultMarkupPct: 20, sortOrder: 7 },
  { name: 'AC & Water Heater Wiring', defaultMarkupPct: 20, sortOrder: 8 },
  { name: 'Accessories & Hardware', defaultMarkupPct: 30, sortOrder: 9 },
  { name: 'Miscellaneous', defaultMarkupPct: 20, sortOrder: 10 },
] as const;
