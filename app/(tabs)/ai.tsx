// app/(tabs)/ai.tsx
// ElectroQuote AI Assistant screen.
// Uses a local Ollama server (open-weight model) via HTTP.
// All data comes from the ElectroQuote SQLite database — never from the model's memory.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useAIChatStore } from '../../src/stores/aiChatStore';
import { useQuotationDraftStore } from '../../src/stores/quotationDraftStore';
import { getAIService } from '../../src/services/ai/AIService';
import { ToolExecutor } from '../../src/services/ai/toolExecutor';
import { ChatBubble } from '../../src/components/ai/ChatBubble';
import { AIStatusBanner } from '../../src/components/ai/AIStatusBanner';
import { SuggestedPrompts } from '../../src/components/ai/SuggestedPrompts';
import type { ChatMessage, QuoteProposal } from '../../src/services/ai/types';
import type { OllamaMessage } from '../../src/services/ai/types';
import { generateUUID as uuidv4 } from '../../src/utils/id';

// ─── Phase 5: Apply approved proposals to the quotation draft ────────────────

function useProposalApplier() {
  const db = useSQLiteContext();
  const draftStore = useQuotationDraftStore();
  const approveProposal = useAIChatStore((s) => s.approveProposal);
  const rejectProposal = useAIChatStore((s) => s.rejectProposal);
  const draft = useQuotationDraftStore((s) => s.draft);

  const handleApprove = useCallback(
    async (proposalId: string, proposals: QuoteProposal[]) => {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal) return;

      try {
        if (proposal.type === 'add_assembly' && proposal.assemblyId != null) {
          // Load full assembly from DB, then expand into draft
          const { AssemblyRepository } = await import(
            '../../src/db/repositories/AssemblyRepository'
          );
          const { BusinessProfileRepository } = await import(
            '../../src/db/repositories/BusinessProfileRepository'
          );
          const assemblyRepo = new AssemblyRepository(db);
          const profileRepo = new BusinessProfileRepository(db);
          const assembly = await assemblyRepo.getById(proposal.assemblyId);
          const profile = await profileRepo.get();
          if (assembly && profile) {
            draftStore.addAssembly(assembly, proposal.quantity ?? 1, profile);
          }
        } else if (proposal.type === 'add_material' && proposal.materialId != null) {
          const { MaterialRepository } = await import(
            '../../src/db/repositories/MaterialRepository'
          );
          const { BusinessProfileRepository } = await import(
            '../../src/db/repositories/BusinessProfileRepository'
          );
          const materialRepo = new MaterialRepository(db);
          const profileRepo = new BusinessProfileRepository(db);
          const material = await materialRepo.getById(proposal.materialId);
          const profile = await profileRepo.get();
          if (material && profile) {
            draftStore.addMaterial(material, proposal.quantity ?? 1, profile);
          }
        } else if (
          proposal.type === 'update_quantity' &&
          proposal.lineLocalId &&
          proposal.sectionLocalId
        ) {
          draftStore.updateLine(proposal.sectionLocalId, proposal.lineLocalId, {
            quantity: proposal.quantity ?? 1,
          });
        } else if (
          proposal.type === 'remove_item' &&
          proposal.lineLocalId &&
          proposal.sectionLocalId
        ) {
          draftStore.removeLine(proposal.sectionLocalId, proposal.lineLocalId);
        }

        approveProposal(proposalId);
      } catch (err) {
        Alert.alert('Error', 'Could not apply the change. Please try again.');
      }
    },
    [db, draftStore, approveProposal]
  );

  return { handleApprove, handleReject: rejectProposal };
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AIAssistantScreen() {
  const db = useSQLiteContext();
  const {
    messages,
    isThinking,
    connectionStatus,
    serverUrl,
    modelName,
    provider,
    apiKey,
    ollamaHistory,
    error,
    addUserMessage,
    addAssistantMessage,
    setThinking,
    setError,
    appendToOllamaHistory,
    setConnectionStatus,
    clearChat,
  } = useAIChatStore();

  const draft = useQuotationDraftStore((s) => s.draft);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = useState('');
  const { handleApprove, handleReject } = useProposalApplier();

  // All proposals from all messages (needed for the proposal applier)
  const allProposals = messages.flatMap((m) => m.proposals ?? []);

  // ── Connection check on mount ──────────────────────────────────────────────
  useEffect(() => {
    checkConnection();
  }, [serverUrl, modelName, provider, apiKey]);

  async function checkConnection() {
    setConnectionStatus('checking');
    const aiService = getAIService({ provider, baseUrl: serverUrl, model: modelName, apiKey });
    const status = await aiService.checkConnection();
    setConnectionStatus(status);
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function handleSend(text?: string) {
    const messageText = (text ?? inputText).trim();
    if (!messageText) return;
    if (isThinking) return;

    Keyboard.dismiss();
    setInputText('');
    setError(null);

    // Add user message to UI
    addUserMessage(messageText);

    // Build the new Ollama message
    const userOllamaMsg: OllamaMessage = { role: 'user', content: messageText };

    setThinking(true);

    try {
      const aiService = getAIService({ provider, baseUrl: serverUrl, model: modelName, apiKey });
      const toolExecutor = new ToolExecutor(db, () => draft);

      // Build full message history for the model
      const messages = aiService.buildMessages(ollamaHistory, messageText);

      const resolvedToolCalls: Array<{ name: string; args: Record<string, unknown>; result: unknown }> = [];
      const allNewProposals: QuoteProposal[] = [];

      const result = await aiService.runAgenticTurn(
        messages,
        async (name, args) => {
          const execResult = await toolExecutor.execute(name, args);
          if (execResult.proposals) {
            allNewProposals.push(...execResult.proposals);
          }
          resolvedToolCalls.push({
            name,
            args,
            result: execResult.toolResult,
          });
          return { toolResult: execResult.toolResult, proposals: execResult.proposals };
        }
      );

      // Update Ollama history for the next turn
      appendToOllamaHistory(userOllamaMsg);
      appendToOllamaHistory({
        role: 'assistant',
        content: result.finalMessage,
      });

      // Add assistant message to UI with tool calls and proposals
      addAssistantMessage({
        content: result.finalMessage,
        toolCalls: resolvedToolCalls.map((tc, i) => ({
          toolName: tc.name,
          args: tc.args,
          result: tc.result,
          displayLabel: `${tc.name}`,
        })),
        proposals: result.proposals,
      });
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unknown error occurred';

      let userFriendlyMsg = 'Could not reach the AI server.';
      if (errorMsg.includes('timeout') || errorMsg.includes('fetch')) {
        userFriendlyMsg =
          'Cannot connect to the local AI server. Make sure Ollama is running on your computer.';
      } else if (errorMsg.includes('model')) {
        userFriendlyMsg = `The model "${modelName}" is not loaded in Ollama. Run: ollama run ${modelName}`;
      }

      setError(userFriendlyMsg);
      addAssistantMessage({ content: `⚠️ ${userFriendlyMsg}` });
      setConnectionStatus('disconnected');
    } finally {
      setThinking(false);
    }
  }

  // ── Scroll to bottom when messages change ─────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  // ── Render ────────────────────────────────────────────────────────────────
  const showSuggestedPrompts = messages.length === 0 && connectionStatus === 'connected';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg0} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="robot-excited-outline" size={24} color={Colors.accent} />
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>ElectroQuote</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={checkConnection}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              Alert.alert('Clear Chat', 'Clear the conversation history?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearChat },
              ]);
            }}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection status */}
      <AIStatusBanner
        status={connectionStatus}
        modelName={modelName}
        serverUrl={serverUrl}
        onPressSettings={() => router.push('/settings/ai-settings' as any)}
      />

      {/* Offline warning */}
      {connectionStatus === 'disconnected' && (
        <View style={styles.offlineBanner}>
          <MaterialCommunityIcons name="information-outline" size={16} color={Colors.warning} />
          <Text style={styles.offlineText}>
            AI is unavailable. Your quotation features still work normally.
          </Text>
        </View>
      )}

      {/* Chat messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            showSuggestedPrompts ? (
              <View style={styles.emptyState}>
                <View style={styles.welcomeIconWrap}>
                  <MaterialCommunityIcons
                    name="robot-excited-outline"
                    size={48}
                    color={Colors.accent}
                  />
                </View>
                <Text style={styles.welcomeTitle}>ElectroQuote AI</Text>
                <Text style={styles.welcomeSubtitle}>
                  Describe the electrical job and I'll help you build the quotation using your
                  real materials, assemblies and prices.
                </Text>
                <SuggestedPrompts onSelectPrompt={handleSend} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              onApproveProposal={(id) => handleApprove(id, allProposals)}
              onRejectProposal={handleReject}
            />
          )}
          ListFooterComponent={
            isThinking ? (
              <ChatBubble
                message={{
                  id: 'thinking',
                  role: 'assistant',
                  content: '',
                  timestamp: Date.now(),
                  isLoading: true,
                }}
                onApproveProposal={() => {}}
                onRejectProposal={() => {}}
              />
            ) : null
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything about your quote..."
            placeholderTextColor={Colors.textDisabled}
            multiline
            maxLength={500}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => handleSend()}
            editable={!isThinking}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isThinking) && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isThinking}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={
                !inputText.trim() || isThinking ? Colors.textDisabled : Colors.textInverse
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Offline banner
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '15',
    borderBottomWidth: 1,
    borderBottomColor: Colors.warning + '30',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  offlineText: {
    flex: 1,
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.warning,
  },

  // Messages
  messageList: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },

  // Empty / welcome state
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing.xxxl,
    gap: Spacing.md,
  },
  welcomeIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    marginBottom: Spacing.sm,
  },
  welcomeTitle: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg0,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bg2,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    fontSize: Typography.base,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.accent,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.bg2,
    shadowOpacity: 0,
    elevation: 0,
  },
});
