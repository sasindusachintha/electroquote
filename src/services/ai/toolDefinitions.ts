// src/services/ai/toolDefinitions.ts
// Defines the OpenAI-compatible tool schema sent to Ollama.
// These tell the model what functions it can call and what arguments to pass.
// The actual implementation is in toolExecutor.ts.

import type { OllamaTool } from './types';

export const ELECTROQUOTE_TOOLS: OllamaTool[] = [
  // ── Material tools ─────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'searchMaterials',
      description:
        'Search the ElectroQuote materials catalogue by name, brand or SKU. ' +
        'Always call this before quoting a price — never invent prices. ' +
        'Returns a list of materials with their current stored prices.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term, e.g. "2.5mm wire", "LED bulb", "switch"',
          },
          categoryId: {
            type: 'number',
            description: 'Optional: filter by category ID',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMaterialById',
      description:
        'Get full details for a specific material by its database ID, including its current price.',
      parameters: {
        type: 'object',
        properties: {
          materialId: {
            type: 'number',
            description: 'The numeric ID of the material',
          },
        },
        required: ['materialId'],
      },
    },
  },

  // ── Assembly tools ─────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'searchAssemblies',
      description:
        'Search ElectroQuote assemblies (pre-built point packages) by name. ' +
        'Assemblies contain all the materials and labour for a complete electrical point. ' +
        'Examples: "LED Point", "Socket Point", "Ceiling Fan Point". ' +
        'Prefer assemblies when the user describes a point or installation type.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term, e.g. "LED", "socket", "fan"',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAssemblyById',
      description:
        'Get full details of a specific assembly including all material lines, ' +
        'labour lines, quantities and prices.',
      parameters: {
        type: 'object',
        properties: {
          assemblyId: {
            type: 'number',
            description: 'The numeric ID of the assembly',
          },
        },
        required: ['assemblyId'],
      },
    },
  },

  // ── Labour tools ───────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'searchLabour',
      description:
        'Search ElectroQuote labour items by name or description. ' +
        'Returns labour rates per unit. Never invent labour rates.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term, e.g. "wiring", "conduit", "fan installation"',
          },
        },
        required: ['query'],
      },
    },
  },

  // ── Quotation read tools ───────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'getQuoteItems',
      description:
        'Get all current line items in the active quotation draft. ' +
        'Use this when the user asks about what is in their current quote, ' +
        'or before making any suggestions about the quote.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculateQuoteTotal',
      description:
        'Calculate the current totals for the active quotation draft. ' +
        'Returns subtotal for materials, labour, discounts, VAT and grand total. ' +
        'Use this when the user asks about the total cost.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'checkMissingMaterials',
      description:
        'Analyse the current quotation for common missing items based on ' +
        'what assemblies are present. For example, if socket points are added ' +
        'but no distribution board has been included.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },

  // ── Quotation write/proposal tools ─────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'proposeAddAssembly',
      description:
        'Propose adding an assembly to the quotation. ' +
        'This does NOT immediately change the quote — the user must approve it. ' +
        'Always search assemblies first to confirm the assembly exists. ' +
        'Show the user the proposal before confirming.',
      parameters: {
        type: 'object',
        properties: {
          assemblyId: {
            type: 'number',
            description: 'The ID of the assembly to add',
          },
          assemblyName: {
            type: 'string',
            description: 'The name of the assembly (for display)',
          },
          quantity: {
            type: 'number',
            description: 'How many of this assembly to add',
          },
          reason: {
            type: 'string',
            description: 'Why you are proposing this (shown to user)',
          },
        },
        required: ['assemblyId', 'assemblyName', 'quantity'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'proposeAddMaterial',
      description:
        'Propose adding a raw material line item to the quotation. ' +
        'This does NOT immediately change the quote — the user must approve it. ' +
        'Always search materials first to confirm the material exists and get its price. ' +
        'Do not use this for assemblies — use proposeAddAssembly for complete installation points.',
      parameters: {
        type: 'object',
        properties: {
          materialId: {
            type: 'number',
            description: 'The ID of the material to add',
          },
          materialName: {
            type: 'string',
            description: 'The name of the material (for display)',
          },
          quantity: {
            type: 'number',
            description: 'How many units to add',
          },
          unit: {
            type: 'string',
            description: 'Unit of measurement (e.g. m, each, roll)',
          },
          reason: {
            type: 'string',
            description: 'Why you are proposing this (shown to user)',
          },
        },
        required: ['materialId', 'materialName', 'quantity'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'proposeUpdateQuantity',
      description:
        'Propose changing the quantity of a line item already in the quotation. ' +
        'This does NOT immediately change the quote — the user must approve it. ' +
        'Call getQuoteItems first to find the correct lineLocalId.',
      parameters: {
        type: 'object',
        properties: {
          lineLocalId: {
            type: 'string',
            description: 'The localId of the line item to update',
          },
          sectionLocalId: {
            type: 'string',
            description: 'The localId of the section containing the line item',
          },
          description: {
            type: 'string',
            description: 'Description of the item (for display)',
          },
          newQuantity: {
            type: 'number',
            description: 'The new quantity to set',
          },
          reason: {
            type: 'string',
            description: 'Why you are proposing this (shown to user)',
          },
        },
        required: ['lineLocalId', 'sectionLocalId', 'description', 'newQuantity'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'proposeRemoveItem',
      description:
        'Propose removing a line item from the quotation. ' +
        'This does NOT immediately change the quote — the user must approve it. ' +
        'Call getQuoteItems first to find the correct lineLocalId.',
      parameters: {
        type: 'object',
        properties: {
          lineLocalId: {
            type: 'string',
            description: 'The localId of the line item to remove',
          },
          sectionLocalId: {
            type: 'string',
            description: 'The localId of the section containing the line item',
          },
          description: {
            type: 'string',
            description: 'Description of the item (for display in approval UI)',
          },
          reason: {
            type: 'string',
            description: 'Why you are proposing this (shown to user)',
          },
        },
        required: ['lineLocalId', 'sectionLocalId', 'description'],
      },
    },
  },
];
