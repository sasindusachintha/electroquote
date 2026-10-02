// src/services/ai/toolExecutor.ts
// Executes AI tool calls against the real ElectroQuote SQLite database.
// This is the anti-hallucination layer — ALL data comes from here, never from the model.

import type * as SQLite from 'expo-sqlite';
import { MaterialRepository } from '../../db/repositories/MaterialRepository';
import { AssemblyRepository } from '../../db/repositories/AssemblyRepository';
import { LabourRepository } from '../../db/repositories/LabourRepository';
import type { QuotationDraft, DraftTotals } from '../../types/models';
import { computeDraftTotals } from '../QuotationService';
import { generateUUID as uuidv4 } from '../../utils/id';
import type { QuoteProposal, ResolvedToolCall } from './types';

// ─── Result shape for tool execution ─────────────────────────────────────────

export interface ToolExecutionResult {
  /** The data to send back to the model as the tool response */
  toolResult: unknown;
  /** Optional proposals to surface in the approval UI */
  proposals?: QuoteProposal[];
  /** Human-readable label for the chat bubble */
  displayLabel: string;
}

// ─── Tool executor class ──────────────────────────────────────────────────────

export class ToolExecutor {
  private materialRepo: MaterialRepository;
  private assemblyRepo: AssemblyRepository;
  private labourRepo: LabourRepository;

  constructor(
    private db: SQLite.SQLiteDatabase,
    private getDraft: () => QuotationDraft
  ) {
    this.materialRepo = new MaterialRepository(db);
    this.assemblyRepo = new AssemblyRepository(db);
    this.labourRepo = new LabourRepository(db);
  }

  /**
   * Execute a tool call by name with parsed arguments.
   * Returns the result to send back to the model + any proposals for the UI.
   */
  async execute(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<ToolExecutionResult> {
    switch (toolName) {
      case 'searchMaterials':
        return this.searchMaterials(args.query as string, args.categoryId as number | undefined);

      case 'getMaterialById':
        return this.getMaterialById(args.materialId as number);

      case 'searchAssemblies':
        return this.searchAssemblies(args.query as string);

      case 'getAssemblyById':
        return this.getAssemblyById(args.assemblyId as number);

      case 'searchLabour':
        return this.searchLabour(args.query as string);

      case 'getQuoteItems':
        return this.getQuoteItems();

      case 'calculateQuoteTotal':
        return this.calculateQuoteTotal();

      case 'checkMissingMaterials':
        return this.checkMissingMaterials();

      case 'proposeAddAssembly':
        return this.proposeAddAssembly(
          args.assemblyId as number,
          args.assemblyName as string,
          args.quantity as number,
          args.reason as string | undefined
        );

      case 'proposeAddMaterial':
        return this.proposeAddMaterial(
          args.materialId as number,
          args.materialName as string,
          args.quantity as number,
          args.unit as string | undefined,
          args.reason as string | undefined
        );

      case 'proposeUpdateQuantity':
        return this.proposeUpdateQuantity(
          args.lineLocalId as string,
          args.sectionLocalId as string,
          args.description as string,
          args.newQuantity as number,
          args.reason as string | undefined
        );

      case 'proposeRemoveItem':
        return this.proposeRemoveItem(
          args.lineLocalId as string,
          args.sectionLocalId as string,
          args.description as string,
          args.reason as string | undefined
        );

      default:
        return {
          toolResult: { error: `Unknown tool: ${toolName}` },
          displayLabel: `Unknown tool: ${toolName}`,
        };
    }
  }

  // ── Material tools ──────────────────────────────────────────────────────────

  private async searchMaterials(query: string, categoryId?: number): Promise<ToolExecutionResult> {
    const materials = await this.materialRepo.search(query, categoryId);
    const slim = materials.slice(0, 10).map((m) => ({
      id: m.id,
      name: m.name,
      brand: m.brand ?? null,
      sku: m.sku ?? null,
      unit: m.unit,
      sellPrice: m.sellPrice,
      costPrice: m.costPrice,
      category: m.category?.name ?? 'Uncategorised',
    }));

    return {
      toolResult: slim.length > 0
        ? { found: slim.length, materials: slim }
        : { found: 0, materials: [], message: 'No materials found in the database for that search.' },
      displayLabel: `Searched materials for "${query}"`,
    };
  }

  private async getMaterialById(id: number): Promise<ToolExecutionResult> {
    const material = await this.materialRepo.getById(id);
    if (!material) {
      return {
        toolResult: { error: `Material with ID ${id} not found in the database.` },
        displayLabel: `Looked up material ID ${id}`,
      };
    }
    return {
      toolResult: {
        id: material.id,
        name: material.name,
        unit: material.unit,
        sellPrice: material.sellPrice,
        costPrice: material.costPrice,
        brand: material.brand ?? null,
        wastagePct: material.wastagePct,
        category: material.category?.name ?? 'Uncategorised',
      },
      displayLabel: `Looked up "${material.name}"`,
    };
  }

  // ── Assembly tools ──────────────────────────────────────────────────────────

  private async searchAssemblies(query: string): Promise<ToolExecutionResult> {
    const assemblies = await this.assemblyRepo.search(query);
    const slim = assemblies.slice(0, 8).map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description ?? null,
      unit: a.unit,
      materialLineCount: a.materialLines.length,
      labourLineCount: a.labourLines.length,
      isFavourite: a.isFavourite,
    }));
    return {
      toolResult: slim.length > 0
        ? { found: slim.length, assemblies: slim }
        : { found: 0, assemblies: [], message: 'No assemblies found in the database for that search.' },
      displayLabel: `Searched assemblies for "${query}"`,
    };
  }

  private async getAssemblyById(id: number): Promise<ToolExecutionResult> {
    const assembly = await this.assemblyRepo.getById(id);
    if (!assembly) {
      return {
        toolResult: { error: `Assembly with ID ${id} not found in the database.` },
        displayLabel: `Looked up assembly ID ${id}`,
      };
    }
    const materialCost = assembly.materialLines.reduce((sum, ml) => {
      const price = ml.material?.sellPrice ?? 0;
      return sum + price * ml.quantity;
    }, 0);
    const labourCost = assembly.labourLines.reduce((sum, ll) => {
      const rate = ll.labourItem?.unitRate ?? 0;
      return sum + rate * ll.quantity;
    }, 0);

    return {
      toolResult: {
        id: assembly.id,
        name: assembly.name,
        unit: assembly.unit,
        estimatedTotalPerUnit: Math.round((materialCost + labourCost) * 100) / 100,
        materialLines: assembly.materialLines.map((ml) => ({
          materialName: ml.material?.name ?? 'Unknown',
          quantity: ml.quantity,
          unit: ml.material?.unit ?? '',
          sellPrice: ml.material?.sellPrice ?? 0,
          includeWastage: ml.includeWastage,
        })),
        labourLines: assembly.labourLines.map((ll) => ({
          labourName: ll.labourItem?.name ?? 'Unknown',
          quantity: ll.quantity,
          unit: ll.labourItem?.unit ?? '',
          rate: ll.labourItem?.unitRate ?? 0,
        })),
      },
      displayLabel: `Looked up assembly "${assembly.name}"`,
    };
  }

  // ── Labour tools ────────────────────────────────────────────────────────────

  private async searchLabour(query: string): Promise<ToolExecutionResult> {
    const items = await this.labourRepo.search(query);
    const slim = items.slice(0, 10).map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description ?? null,
      unit: l.unit,
      unitRate: l.unitRate,
    }));
    return {
      toolResult: slim.length > 0
        ? { found: slim.length, labourItems: slim }
        : { found: 0, labourItems: [], message: 'No labour items found in the database for that search.' },
      displayLabel: `Searched labour for "${query}"`,
    };
  }

  // ── Quote read tools ────────────────────────────────────────────────────────

  private getQuoteItems(): ToolExecutionResult {
    const draft = this.getDraft();
    if (!draft.sections || draft.sections.length === 0) {
      return {
        toolResult: { message: 'The current quotation is empty — no items have been added yet.' },
        displayLabel: 'Read current quote items',
      };
    }

    const allLines = draft.sections.flatMap((s) =>
      s.lineItems.map((l) => ({
        sectionName: s.name,
        sectionLocalId: s.localId,
        lineLocalId: l.localId,
        description: l.description,
        unit: l.unit,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
        isMaterial: l.isMaterial,
        sourceType: l.sourceType,
      }))
    );

    return {
      toolResult: {
        sectionCount: draft.sections.length,
        lineItemCount: allLines.length,
        items: allLines,
      },
      displayLabel: `Read ${allLines.length} line items from quote`,
    };
  }

  private calculateQuoteTotal(): ToolExecutionResult {
    const draft = this.getDraft();
    const totals: DraftTotals = computeDraftTotals(draft);
    return {
      toolResult: {
        subtotalMaterials: totals.subtotalMaterials,
        subtotalLabour: totals.subtotalLabour,
        subtotalBeforeDiscount: totals.subtotalBeforeDiscount,
        discountAmount: totals.discountAmount,
        subtotalAfterDiscount: totals.subtotalAfterDiscount,
        vatAmount: totals.vatAmount,
        grandTotal: totals.grandTotal,
      },
      displayLabel: 'Calculated quote totals',
    };
  }

  private checkMissingMaterials(): ToolExecutionResult {
    const draft = this.getDraft();
    const allLines = draft.sections.flatMap((s) => s.lineItems);
    const descriptions = allLines.map((l) => l.description.toLowerCase());

    const suggestions: string[] = [];

    // Heuristic checks — look for common missing items based on what's present
    const hasSockets = descriptions.some((d) => d.includes('socket'));
    const hasLED = descriptions.some((d) => d.includes('led') || d.includes('light'));
    const hasFan = descriptions.some((d) => d.includes('fan'));
    const hasDB = descriptions.some((d) =>
      d.includes('distribution board') || d.includes('consumer unit') || d.includes('db')
    );
    const hasMainBreaker = descriptions.some((d) =>
      d.includes('main') || d.includes('mcb') || d.includes('breaker')
    );
    const hasEarthing = descriptions.some((d) =>
      d.includes('earth') || d.includes('ground')
    );

    if ((hasSockets || hasLED || hasFan) && !hasDB) {
      suggestions.push(
        'No Distribution Board found — required for any wiring installation.'
      );
    }
    if ((hasSockets || hasLED) && !hasMainBreaker) {
      suggestions.push('No MCB/Circuit Breaker found — check if it is included in the DB assembly.');
    }
    if (allLines.length > 0 && !hasEarthing) {
      suggestions.push('No earthing/grounding material found — this is required by electrical standards.');
    }

    if (allLines.length === 0) {
      return {
        toolResult: { message: 'The quotation is empty. Add some items first.' },
        displayLabel: 'Checked for missing materials',
      };
    }

    return {
      toolResult: {
        suggestions: suggestions.length > 0 ? suggestions : ['No obvious missing items detected.'],
        analysedLineCount: allLines.length,
      },
      displayLabel: 'Checked for missing materials',
    };
  }

  // ── Proposal tools (write, but require user approval) ─────────────────────

  private async proposeAddAssembly(
    assemblyId: number,
    assemblyName: string,
    quantity: number,
    reason?: string
  ): Promise<ToolExecutionResult> {
    // Verify the assembly actually exists before proposing
    const assembly = await this.assemblyRepo.getById(assemblyId);
    if (!assembly) {
      return {
        toolResult: {
          error: `Assembly ID ${assemblyId} ("${assemblyName}") was not found in the database. Cannot propose adding it.`,
        },
        displayLabel: `Failed to propose: assembly ${assemblyId} not found`,
      };
    }

    const materialCost = assembly.materialLines.reduce((sum, ml) => {
      return sum + (ml.material?.sellPrice ?? 0) * ml.quantity * quantity;
    }, 0);
    const labourCost = assembly.labourLines.reduce((sum, ll) => {
      return sum + (ll.labourItem?.unitRate ?? 0) * ll.quantity * quantity;
    }, 0);

    const proposal: QuoteProposal = {
      id: uuidv4(),
      type: 'add_assembly',
      status: 'pending',
      assemblyId: assembly.id,
      quantity,
      label: `Add ${quantity} × ${assembly.name}`,
      detailLines: [
        `Estimated total: Rs. ${Math.round((materialCost + labourCost) * 100) / 100}`,
        reason ? `Reason: ${reason}` : '',
      ].filter(Boolean),
    };

    return {
      toolResult: {
        proposed: true,
        proposalId: proposal.id,
        assemblyId: assembly.id,
        assemblyName: assembly.name,
        quantity,
        estimatedCost: Math.round((materialCost + labourCost) * 100) / 100,
        message: `Proposal created: ${quantity} × ${assembly.name}. Waiting for your approval.`,
      },
      proposals: [proposal],
      displayLabel: `Proposed: ${quantity} × ${assembly.name}`,
    };
  }

  private async proposeAddMaterial(
    materialId: number,
    materialName: string,
    quantity: number,
    unit?: string,
    reason?: string
  ): Promise<ToolExecutionResult> {
    // Verify the material actually exists
    const material = await this.materialRepo.getById(materialId);
    if (!material) {
      return {
        toolResult: {
          error: `Material ID ${materialId} ("${materialName}") was not found in the database. Cannot propose adding it.`,
        },
        displayLabel: `Failed to propose: material ${materialId} not found`,
      };
    }

    const lineTotal = Math.round(material.sellPrice * quantity * 100) / 100;

    const proposal: QuoteProposal = {
      id: uuidv4(),
      type: 'add_material',
      status: 'pending',
      materialId: material.id,
      quantity,
      label: `Add ${quantity} ${unit ?? material.unit} of ${material.name}`,
      detailLines: [
        `Unit price: Rs. ${material.sellPrice} / ${material.unit}`,
        `Line total: Rs. ${lineTotal}`,
        reason ? `Reason: ${reason}` : '',
      ].filter(Boolean),
    };

    return {
      toolResult: {
        proposed: true,
        proposalId: proposal.id,
        materialId: material.id,
        materialName: material.name,
        quantity,
        unitPrice: material.sellPrice,
        estimatedCost: lineTotal,
        message: `Proposal created: ${quantity} ${material.unit} of ${material.name}. Waiting for your approval.`,
      },
      proposals: [proposal],
      displayLabel: `Proposed: ${quantity} ${material.unit} ${material.name}`,
    };
  }

  private proposeUpdateQuantity(
    lineLocalId: string,
    sectionLocalId: string,
    description: string,
    newQuantity: number,
    reason?: string
  ): ToolExecutionResult {
    const draft = this.getDraft();
    const section = draft.sections.find((s) => s.localId === sectionLocalId);
    const line = section?.lineItems.find((l) => l.localId === lineLocalId);

    if (!line) {
      return {
        toolResult: {
          error: `Line item "${description}" not found in the quotation. Call getQuoteItems to get current item IDs.`,
        },
        displayLabel: `Failed to propose quantity update: item not found`,
      };
    }

    const proposal: QuoteProposal = {
      id: uuidv4(),
      type: 'update_quantity',
      status: 'pending',
      lineLocalId,
      sectionLocalId,
      quantity: newQuantity,
      label: `Change quantity of "${description}": ${line.quantity} → ${newQuantity}`,
      detailLines: [
        `New line total: Rs. ${Math.round(line.unitPrice * newQuantity * 100) / 100}`,
        reason ? `Reason: ${reason}` : '',
      ].filter(Boolean),
    };

    return {
      toolResult: {
        proposed: true,
        proposalId: proposal.id,
        description,
        oldQuantity: line.quantity,
        newQuantity,
        message: `Proposal created: update ${description} quantity to ${newQuantity}. Waiting for your approval.`,
      },
      proposals: [proposal],
      displayLabel: `Proposed quantity change: "${description}"`,
    };
  }

  private proposeRemoveItem(
    lineLocalId: string,
    sectionLocalId: string,
    description: string,
    reason?: string
  ): ToolExecutionResult {
    const draft = this.getDraft();
    const section = draft.sections.find((s) => s.localId === sectionLocalId);
    const line = section?.lineItems.find((l) => l.localId === lineLocalId);

    if (!line) {
      return {
        toolResult: {
          error: `Line item "${description}" not found in the quotation. Call getQuoteItems to get current item IDs.`,
        },
        displayLabel: `Failed to propose removal: item not found`,
      };
    }

    const proposal: QuoteProposal = {
      id: uuidv4(),
      type: 'remove_item',
      status: 'pending',
      lineLocalId,
      sectionLocalId,
      label: `Remove "${description}" from quote`,
      detailLines: [
        `Would save: Rs. ${line.lineTotal}`,
        reason ? `Reason: ${reason}` : '',
      ].filter(Boolean),
    };

    return {
      toolResult: {
        proposed: true,
        proposalId: proposal.id,
        description,
        lineTotal: line.lineTotal,
        message: `Proposal created: remove "${description}". Waiting for your approval.`,
      },
      proposals: [proposal],
      displayLabel: `Proposed removal: "${description}"`,
    };
  }
}
