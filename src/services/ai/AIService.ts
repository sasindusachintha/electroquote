// src/services/ai/AIService.ts
// Multi-provider AI service for ElectroQuote.
// Supports both local Ollama (offline) and free Cloud API endpoints (Hugging Face, OpenRouter, Groq).
// All providers use function calling to fetch DB data and make proposals.

import type {
  AIConfig,
  AIConnectionStatus,
  AIProvider,
  OllamaChatRequest,
  OllamaChatResponse,
  OllamaMessage,
  OllamaToolCall,
} from './types';
import { ELECTROQUOTE_TOOLS } from './toolDefinitions';

// ─── Default Configuration ────────────────────────────────────────────────────

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
  model: 'qwen2.5:1.5b',
  apiKey: '',
  temperature: 0.2,          // Low temperature = more factual, less creative
  maxContextTokens: 4096,
  systemPrompt: `You are the ElectroQuote AI Assistant, a specialist tool for Sri Lankan electricians.

CRITICAL RULES — you MUST follow these without exception:
1. NEVER invent material prices, labour rates, or stock quantities. Only use data returned by tool calls.
2. NEVER guess material names or assembly names. Always search first with search_materials or search_assemblies.
3. If a material or assembly is not found in the database, say so clearly: "That item is not in your ElectroQuote database."
4. For ALL quote modifications (add, remove, change), use the propose_* tools. Do NOT claim items have been added — they must be approved by the user first.
5. Always call get_active_quote before making suggestions about what to change in the current quote.
6. Speak simply and clearly — the user is an experienced electrician, not a software developer.
7. Currency is Sri Lankan Rupees (Rs.). Display prices in Rs.
8. When the user describes a job (e.g. "3 bedroom house"), search for relevant assemblies before responding.
9. Be concise. Avoid long explanations unless asked.

You help electricians:
- Create quotations from natural language job descriptions
- Add materials and assemblies from the local database
- Answer questions about the current quote
- Identify missing items
- Suggest optimisations (always with proposals, never secretly)`,
};

// Provider Presets
export const PROVIDER_PRESETS: Record<AIProvider, { baseUrl: string; defaultModel: string; label: string; requiresKey: boolean }> = {
  ollama: {
    label: 'Local Ollama (Offline)',
    baseUrl: 'http://localhost:11434',
    defaultModel: 'qwen2.5:1.5b',
    requiresKey: false,
  },
  huggingface: {
    label: 'Hugging Face (Free Open Models)',
    baseUrl: 'https://router.huggingface.co/hf-inference/v1',
    defaultModel: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    requiresKey: true,
  },
  openrouter: {
    label: 'OpenRouter (Free Tier)',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'qwen/qwen-2.5-coder-32b-instruct:free',
    requiresKey: true,
  },
  groq: {
    label: 'Groq Cloud (Free Tier - Super Fast)',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'qwen-2.5-coder-32b',
    requiresKey: true,
  },
  custom: {
    label: 'Custom OpenAI-Compatible API',
    baseUrl: 'http://localhost:8000/v1',
    defaultModel: 'default-model',
    requiresKey: false,
  },
};

// ─── AI Service ───────────────────────────────────────────────────────────────

export class AIService {
  constructor(private config: AIConfig = DEFAULT_AI_CONFIG) {}

  updateConfig(patch: Partial<AIConfig>): void {
    Object.assign(this.config, patch);
  }

  getConfig(): AIConfig {
    return { ...this.config };
  }

  /**
   * Check connection status for the configured provider.
   */
  async checkConnection(): Promise<AIConnectionStatus> {
    try {
      if (this.config.provider === 'ollama') {
        const response = await fetch(`${this.config.baseUrl}/api/tags`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) return 'error';
        const data = await response.json() as { models?: { name: string }[] };
        const models = data.models ?? [];
        const hasModel = models.some(
          (m) => m.name === this.config.model || m.name.startsWith(this.config.model.split(':')[0])
        );
        return hasModel ? 'connected' : 'error';
      }

      // Online OpenAI-compatible endpoint health check (models endpoint)
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }
      
      const endpoint = this.config.baseUrl.endsWith('/v1') 
        ? `${this.config.baseUrl}/models` 
        : `${this.config.baseUrl}/v1/models`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(6000),
      });

      return response.ok || response.status === 401 ? 'connected' : 'error';
    } catch {
      return 'disconnected';
    }
  }

  /**
   * Send a chat turn to Ollama or OpenAI-compatible Cloud API.
   */
  async chat(messages: OllamaMessage[]): Promise<OllamaChatResponse> {
    if (this.config.provider === 'ollama') {
      return this.chatOllama(messages);
    } else {
      return this.chatOpenAICompatible(messages);
    }
  }

  /**
   * Local Ollama chat implementation
   */
  private async chatOllama(messages: OllamaMessage[]): Promise<OllamaChatResponse> {
    const requestBody: OllamaChatRequest = {
      model: this.config.model,
      messages,
      tools: ELECTROQUOTE_TOOLS,
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_ctx: this.config.maxContextTokens,
      },
    };

    const response = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${errorText}`);
    }

    return response.json() as Promise<OllamaChatResponse>;
  }

  /**
   * OpenAI-compatible Cloud API implementation (Hugging Face, OpenRouter, Groq, Custom)
   */
  private async chatOpenAICompatible(messages: OllamaMessage[]): Promise<OllamaChatResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    if (this.config.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://electroquote.app';
      headers['X-Title'] = 'ElectroQuote AI';
    }

    const endpoint = this.config.baseUrl.endsWith('/chat/completions')
      ? this.config.baseUrl
      : this.config.baseUrl.endsWith('/v1')
        ? `${this.config.baseUrl}/chat/completions`
        : `${this.config.baseUrl}/v1/chat/completions`;

    const requestBody = {
      model: this.config.model,
      messages: messages.map((m) => ({
        role: m.role === 'tool' ? 'tool' : m.role,
        content: m.content,
        tool_calls: m.tool_calls,
        tool_call_id: m.tool_call_id,
        name: m.name,
      })),
      tools: ELECTROQUOTE_TOOLS,
      temperature: this.config.temperature,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloud API error ${response.status}: ${errorText}`);
    }

    const data = await response.json() as {
      model?: string;
      choices?: Array<{
        message: {
          role: string;
          content: string | null;
          tool_calls?: Array<{
            id: string;
            type: 'function';
            function: { name: string; arguments: string };
          }>;
        };
      }>;
    };

    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error('No completion returned from Cloud API.');
    }

    const toolCalls: OllamaToolCall[] | undefined = choice.message.tool_calls?.map((tc) => ({
      id: tc.id,
      type: 'function',
      function: {
        name: tc.function.name,
        arguments: typeof tc.function.arguments === 'string'
          ? tc.function.arguments
          : JSON.stringify(tc.function.arguments),
      },
    }));

    return {
      model: data.model || this.config.model,
      message: {
        role: 'assistant',
        content: choice.message.content,
        tool_calls: toolCalls,
      },
      done: true,
    };
  }

  /**
   * High-level agentic chat loop.
   */
  async runAgenticTurn(
    messages: OllamaMessage[],
    executeTools: (name: string, args: Record<string, unknown>) => Promise<{ toolResult: unknown; proposals?: import('./types').QuoteProposal[] }>,
    onToolCall?: (toolName: string, args: Record<string, unknown>, result: unknown) => void
  ): Promise<{
    finalMessage: string;
    allToolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }>;
    proposals: import('./types').QuoteProposal[];
  }> {
    const workingMessages = [...messages];
    const allToolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }> = [];
    const allProposals: import('./types').QuoteProposal[] = [];

    let iterations = 0;
    const MAX_ITERATIONS = 8;

    while (iterations < MAX_ITERATIONS) {
      iterations++;
      const response = await this.chat(workingMessages);
      const msg = response.message;

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        workingMessages.push({
          role: 'assistant',
          content: msg.content ?? '',
          tool_calls: msg.tool_calls,
        });

        for (const toolCall of msg.tool_calls) {
          const { name, arguments: argsStr } = toolCall.function;
          let args: Record<string, unknown> = {};
          try {
            args = typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;
          } catch {
            args = {};
          }

          const { toolResult, proposals } = await executeTools(name, args);
          if (proposals) allProposals.push(...proposals);
          allToolCalls.push({ name, args, result: toolResult });
          onToolCall?.(name, args, toolResult);

          workingMessages.push({
            role: 'tool',
            content: JSON.stringify(toolResult),
            tool_call_id: toolCall.id,
            name,
          });
        }

        continue;
      }

      return {
        finalMessage: msg.content ?? '',
        allToolCalls,
        proposals: allProposals,
      };
    }

    return {
      finalMessage: 'I reached my processing limit. Please try a simpler request.',
      allToolCalls,
      proposals: allProposals,
    };
  }

  buildMessages(
    conversationHistory: OllamaMessage[],
    newUserMessage: string
  ): OllamaMessage[] {
    const systemMessage: OllamaMessage = {
      role: 'system',
      content: this.config.systemPrompt,
    };
    return [
      systemMessage,
      ...conversationHistory,
      { role: 'user', content: newUserMessage },
    ];
  }
}

let _aiServiceInstance: AIService | null = null;

export function getAIService(config?: Partial<AIConfig>): AIService {
  if (!_aiServiceInstance) {
    _aiServiceInstance = new AIService({ ...DEFAULT_AI_CONFIG, ...config });
  } else if (config) {
    _aiServiceInstance.updateConfig(config);
  }
  return _aiServiceInstance;
}

export function resetAIService(): void {
  _aiServiceInstance = null;
}
