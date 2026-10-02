// src/services/ai/types.ts
// Types for the ElectroQuote AI Assistant feature.
// These are additive and do not touch existing models.ts.

// ─────────────────────────────────────────────────────────────────────────────
// Ollama / OpenAI-compatible API types
// ─────────────────────────────────────────────────────────────────────────────

export interface OllamaToolFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, OllamaToolProperty>;
    required?: string[];
  };
}

export interface OllamaToolProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  items?: { type: string };
}

export interface OllamaTool {
  type: 'function';
  function: OllamaToolFunction;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: OllamaToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface OllamaToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  tools?: OllamaTool[];
  stream: false;
  options?: {
    temperature?: number;
    num_ctx?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
  done_reason?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat UI message types (what the chat screen renders)
// ─────────────────────────────────────────────────────────────────────────────

export type ChatMessageRole = 'user' | 'assistant' | 'system' | 'tool_result';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: number;
  toolCalls?: ResolvedToolCall[];      // tools called by the AI for this turn
  proposals?: QuoteProposal[];         // quote change proposals to approve/reject
  isLoading?: boolean;                 // streaming/pending indicator
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool call results (displayed in chat as expandable cards)
// ─────────────────────────────────────────────────────────────────────────────

export interface ResolvedToolCall {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
  displayLabel: string;              // human-readable, e.g. "Searched materials for '2.5mm wire'"
}

// ─────────────────────────────────────────────────────────────────────────────
// Quote modification proposals (must be approved before they touch the draft)
// ─────────────────────────────────────────────────────────────────────────────

export type ProposalType =
  | 'add_material'
  | 'add_assembly'
  | 'update_quantity'
  | 'remove_item';

export interface QuoteProposal {
  id: string;               // uuid — for tracking approve/reject
  type: ProposalType;
  status: 'pending' | 'approved' | 'rejected';
  // Depending on type, one of these will be set:
  materialId?: number;
  assemblyId?: number;
  lineLocalId?: string;     // for update_quantity / remove_item
  sectionLocalId?: string;
  quantity?: number;
  // Human-readable summary for display
  label: string;            // e.g. "Add 20 × Socket Point"
  detailLines?: string[];   // e.g. ["Material: PVC conduit", "Labour: Socket installation"]
}

// ─────────────────────────────────────────────────────────────────────────────
// AI connection status
// ─────────────────────────────────────────────────────────────────────────────

export type AIConnectionStatus =
  | 'checking'
  | 'connected'
  | 'disconnected'
  | 'error';

export type AIProvider = 'ollama' | 'huggingface' | 'openrouter' | 'groq' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  baseUrl: string;           // e.g. "http://192.168.1.100:11434" or cloud URL
  apiKey?: string;           // Optional API key for online providers (Hugging Face, OpenRouter, Groq)
  model: string;             // e.g. "qwen2.5:1.5b", "meta-llama/Llama-3.2-3B-Instruct", "qwen/qwen-2.5-coder-32b-instruct:free"
  systemPrompt: string;
  temperature: number;
  maxContextTokens: number;
}
