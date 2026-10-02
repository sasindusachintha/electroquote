// src/stores/aiChatStore.ts
// Zustand store for the AI assistant chat state.
// Keeps conversation history, messages, proposals, and connection status.
// Independent of quotationDraftStore.

import { create } from 'zustand';
import { generateUUID as uuidv4 } from '../utils/id';
import type {
  ChatMessage,
  QuoteProposal,
  AIConnectionStatus,
  AIProvider,
  ResolvedToolCall,
  OllamaMessage,
} from '../services/ai/types';

interface AIChatState {
  // Connection & Provider
  connectionStatus: AIConnectionStatus;
  provider: AIProvider;
  serverUrl: string;
  modelName: string;
  apiKey: string;

  // Chat
  messages: ChatMessage[];
  isThinking: boolean;
  error: string | null;

  // Conversation history
  ollamaHistory: OllamaMessage[];

  // Pending proposals
  pendingProposals: QuoteProposal[];

  // Actions
  setConnectionStatus: (status: AIConnectionStatus) => void;
  setProvider: (provider: AIProvider) => void;
  setServerUrl: (url: string) => void;
  setModelName: (model: string) => void;
  setApiKey: (key: string) => void;

  addUserMessage: (text: string) => string;
  addAssistantMessage: (params: {
    content: string;
    toolCalls?: ResolvedToolCall[];
    proposals?: QuoteProposal[];
  }) => void;
  setThinking: (thinking: boolean) => void;
  setError: (error: string | null) => void;

  appendToOllamaHistory: (msg: OllamaMessage) => void;
  clearOllamaHistory: () => void;

  approveProposal: (proposalId: string) => void;
  rejectProposal: (proposalId: string) => void;
  clearApprovedProposals: () => void;

  clearChat: () => void;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  connectionStatus: 'checking',
  provider: 'ollama',
  serverUrl: 'http://localhost:11434',
  modelName: 'qwen2.5:1.5b',
  apiKey: '',

  messages: [],
  isThinking: false,
  error: null,
  ollamaHistory: [],
  pendingProposals: [],

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setProvider: (provider) => set({ provider }),
  setServerUrl: (url) => set({ serverUrl: url }),
  setModelName: (model) => set({ modelName: model }),
  setApiKey: (key) => set({ apiKey: key }),

  addUserMessage: (text) => {
    const id = uuidv4();
    const message: ChatMessage = {
      id,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    set((state) => ({ messages: [...state.messages, message] }));
    return id;
  },

  addAssistantMessage: ({ content, toolCalls, proposals }) => {
    const message: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      toolCalls,
      proposals,
    };
    set((state) => ({
      messages: [...state.messages, message],
      pendingProposals: proposals
        ? [...state.pendingProposals, ...proposals]
        : state.pendingProposals,
    }));
  },

  setThinking: (thinking) => set({ isThinking: thinking }),
  setError: (error) => set({ error }),

  appendToOllamaHistory: (msg) =>
    set((state) => ({ ollamaHistory: [...state.ollamaHistory, msg] })),

  clearOllamaHistory: () => set({ ollamaHistory: [] }),

  approveProposal: (proposalId) =>
    set((state) => ({
      pendingProposals: state.pendingProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'approved' } : p
      ),
      messages: state.messages.map((m) => ({
        ...m,
        proposals: m.proposals?.map((p) =>
          p.id === proposalId ? { ...p, status: 'approved' } : p
        ),
      })),
    })),

  rejectProposal: (proposalId) =>
    set((state) => ({
      pendingProposals: state.pendingProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'rejected' } : p
      ),
      messages: state.messages.map((m) => ({
        ...m,
        proposals: m.proposals?.map((p) =>
          p.id === proposalId ? { ...p, status: 'rejected' } : p
        ),
      })),
    })),

  clearApprovedProposals: () =>
    set((state) => ({
      pendingProposals: state.pendingProposals.filter((p) => p.status === 'pending'),
    })),

  clearChat: () =>
    set({
      messages: [],
      ollamaHistory: [],
      pendingProposals: [],
      isThinking: false,
      error: null,
    }),
}));
