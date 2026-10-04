// app/(tabs)/ai.tsx
// ElectroQuote AI Assistant screen — fixed and complete.
// Supports Hugging Face, Ollama, OpenRouter, Groq.
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
  ActivityIndicator,
  Modal,
  ScrollView,
  Pressable,
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
import type { QuoteProposal } from '../../src/services/ai/types';
import type { OllamaMessage } from '../../src/services/ai/types';
import { useCustomers } from '../../src/hooks/useCustomers';
import { useProjects } from '../../src/hooks/useProjects';

// ─── User-friendly error messages ────────────────────────────────────────────

function getFriendlyError(err: unknown, providerLabel: string, modelName: string): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lc = msg.toLowerCase();
  if (lc.includes('401') || lc.includes('unauthorized')) {
    return `Invalid API key for ${providerLabel}. Check your API key in AI Settings.`;
  }
  if (lc.includes('403') || lc.includes('forbidden')) {
    return `Access denied. Your key may not have permission for model "${modelName}".`;
  }
  if (lc.includes('404') || lc.includes('not found')) {
    return `Model "${modelName}" not found. Check the model name in AI Settings.`;
  }
  if (lc.includes('429') || lc.includes('rate limit')) {
    return `Rate limit reached. Please wait a moment and try again.`;
  }
  if (lc.includes('timeout') || lc.includes('aborted') || lc.includes('timed out')) {
    return `Request timed out. The server may be busy — please try again.`;
  }
  if (lc.includes('network') || lc.includes('fetch') || lc.includes('failed to fetch')) {
    return `Cannot reach the AI server. Check your internet connection and AI Settings.`;
  }
  if (lc.includes('model')) {
    return `Model error: "${modelName}" may not be available. Check AI Settings.`;
  }
  return `AI error: ${msg}`;
}

// ─── Proposal applier hook ────────────────────────────────────────────────────

function useProposalApplier() {
  const db = useSQLiteContext();
  const draftStore = useQuotationDraftStore();
  const approveProposal = useAIChatStore((s) => s.approveProposal);
  const rejectProposal = useAIChatStore((s) => s.rejectProposal);
  const [isApplying, setIsApplying] = useState(false);

  const handleApprove = useCallback(
    async (proposalId: string, proposals: QuoteProposal[]) => {
      const proposal = proposals.find((p) => p.id === proposalId);
      if (!proposal || isApplying) return;

      setIsApplying(true);
      try {
        if (proposal.type === 'add_assembly' && proposal.assemblyId != null) {
          const { AssemblyRepository } = await import('../../src/db/repositories/AssemblyRepository');
          const { BusinessProfileRepository } = await import('../../src/db/repositories/BusinessProfileRepository');
          const assembly = await new AssemblyRepository(db).getById(proposal.assemblyId);
          const profile = await new BusinessProfileRepository(db).get();
          if (!assembly) {
            Alert.alert('Error', 'Assembly not found in database. It may have been deleted.');
            return;
          }
          if (assembly && profile) {
            draftStore.addAssembly(assembly, proposal.quantity ?? 1, profile);
          }
        } else if (proposal.type === 'add_material' && proposal.materialId != null) {
          const { MaterialRepository } = await import('../../src/db/repositories/MaterialRepository');
          const { BusinessProfileRepository } = await import('../../src/db/repositories/BusinessProfileRepository');
          const material = await new MaterialRepository(db).getById(proposal.materialId);
          const profile = await new BusinessProfileRepository(db).get();
          if (!material) {
            Alert.alert('Error', 'Material not found in database. It may have been deleted.');
            return;
          }
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
      } finally {
        setIsApplying(false);
      }
    },
    [db, draftStore, approveProposal, isApplying]
  );

  return { handleApprove, handleReject: rejectProposal, isApplying };
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
    addUserMessage,
    addAssistantMessage,
    setThinking,
    setError,
    appendToOllamaHistory,
    setConnectionStatus,
    clearChat,
  } = useAIChatStore();

  const { draft, resetDraft, setCustomer, setProject } = useQuotationDraftStore();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { handleApprove, handleReject } = useProposalApplier();

  // Customer/Project picker modal state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerStep, setPickerStep] = useState<'customer' | 'project'>('customer');
  const [pickedCustomerId, setPickedCustomerId] = useState<number | null>(null);
  const [pickedCustomerName, setPickedCustomerName] = useState('');

  const { data: customers = [] } = useCustomers();
  const { data: projects = [] } = useProjects(undefined, pickedCustomerId ?? undefined);

  const allProposals = messages.flatMap((m) => m.proposals ?? []);
  const draftItemCount = draft.sections.flatMap((s) => s.lineItems).length;

  // ── Connection check ───────────────────────────────────────────────────────
  useEffect(() => {
    checkConnection();
  }, [serverUrl, modelName, provider, apiKey]);

  async function checkConnection() {
    setConnectionStatus('checking');
    const aiService = getAIService({ provider, baseUrl: serverUrl, model: modelName, apiKey });
    const status = await aiService.checkConnection();
    setConnectionStatus(status);
  }

  // ── Save draft to DB and navigate ─────────────────────────────────────────
  async function handleSaveAndViewQuotation() {
    if (draftItemCount === 0) {
      Alert.alert('Empty Quotation', 'Please approve at least one item before saving.');
      return;
    }
    // If customer/project not set, open the picker modal
    if (!draft.customerId || !draft.projectId) {
      setPickerStep('customer');
      setPickedCustomerId(null);
      setPickedCustomerName('');
      setShowPicker(true);
      return;
    }
    await doSaveDraft();
  }

  async function doSaveDraft() {
    if (isSavingDraft) return;
    setIsSavingDraft(true);
    try {
      const { QuotationRepository } = await import('../../src/db/repositories/QuotationRepository');
      const { BusinessProfileRepository } = await import('../../src/db/repositories/BusinessProfileRepository');

      const profile = await new BusinessProfileRepository(db).get();
      const currencySymbol = profile?.currencySymbol ?? 'Rs.';
      // Read the LATEST draft state (not the stale closure) so customer/project
      // IDs set by the picker are always reflected.
      const latestDraft = useQuotationDraftStore.getState().draft;
      // Pass undefined as referenceNo — saveDraft generates it atomically
      // inside its own transaction, avoiding a nested withTransactionAsync crash.
      const quotationId = await new QuotationRepository(db).saveDraft(
        latestDraft,
        undefined,
        currencySymbol,
        undefined,
        'detailed'
      );
      resetDraft();
      router.push(`/quotations/${quotationId}` as any);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert(
        'Could not create quotation',
        `${msg}\n\nPlease try again or use the Quotations tab.`,
        [
          { text: 'OK' },
          { text: 'Go to Quotations', onPress: () => router.push('/quotations' as any) },
        ]
      );
    } finally {
      setIsSavingDraft(false);
    }
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function handleSend(text?: string) {
    const messageText = (text ?? inputText).trim();
    if (!messageText || isThinking) return;

    Keyboard.dismiss();
    setInputText('');
    setError(null);

    addUserMessage(messageText);
    const userOllamaMsg: OllamaMessage = { role: 'user', content: messageText };
    setThinking(true);

    try {
      const aiService = getAIService({ provider, baseUrl: serverUrl, model: modelName, apiKey });
      const toolExecutor = new ToolExecutor(db, () => draft);
      const builtMessages = aiService.buildMessages(ollamaHistory, messageText);

      const resolvedToolCalls: Array<{
        name: string;
        args: Record<string, unknown>;
        result: unknown;
        displayLabel: string;
      }> = [];
      const allNewProposals: QuoteProposal[] = [];
      let pendingNavigation: { route: string; params: Record<string, string | number> } | undefined;

      const result = await aiService.runAgenticTurn(
        builtMessages,
        async (name, args) => {
          const execResult = await toolExecutor.execute(name, args);
          if (execResult.proposals) allNewProposals.push(...execResult.proposals);
          if (execResult.navigationTarget) pendingNavigation = execResult.navigationTarget;
          resolvedToolCalls.push({
            name,
            args,
            result: execResult.toolResult,
            displayLabel: execResult.displayLabel,
          });
          return { toolResult: execResult.toolResult, proposals: execResult.proposals };
        }
      );

      appendToOllamaHistory(userOllamaMsg);
      appendToOllamaHistory({ role: 'assistant', content: result.finalMessage });

      addAssistantMessage({
        content: result.finalMessage,
        toolCalls: resolvedToolCalls.map((tc) => ({
          toolName: tc.name,
          args: tc.args,
          result: tc.result,
          displayLabel: tc.displayLabel,
        })),
        proposals: result.proposals,
      });

      // AI triggered quotation creation — navigate after message renders
      if (pendingNavigation) {
        const nav = pendingNavigation;
        resetDraft();
        setTimeout(() => {
          router.push(`/quotations/${nav.params.id}` as any);
        }, 700);
      }
    } catch (err: unknown) {
      const providerLabel =
        provider === 'huggingface' ? 'Hugging Face' :
        provider === 'ollama' ? 'Ollama' :
        provider === 'groq' ? 'Groq' :
        provider === 'openrouter' ? 'OpenRouter' : 'AI';

      const msg = getFriendlyError(err, providerLabel, modelName);
      setError(msg);
      addAssistantMessage({ content: `\u26a0\ufe0f ${msg}` });
      setConnectionStatus('error');
    } finally {
      setThinking(false);
    }
  }

  // ── Auto scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const showSuggestedPrompts = messages.length === 0 && connectionStatus === 'connected';

  // ── Render ────────────────────────────────────────────────────────────────
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
          <TouchableOpacity style={styles.headerBtn} onPress={checkConnection} activeOpacity={0.75}>
            <MaterialCommunityIcons name="refresh" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() =>
              Alert.alert('Clear Chat', 'Clear the conversation history?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearChat },
              ])
            }
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* AI connection status */}
      <AIStatusBanner
        status={connectionStatus}
        modelName={modelName}
        serverUrl={serverUrl}
        provider={provider}
        onPressSettings={() => router.push('/settings/ai-settings' as any)}
      />

      {/* Draft bar — visible when draft has approved items */}
      {draftItemCount > 0 && (
        <View style={styles.draftBar}>
          <View style={styles.draftBarLeft}>
            <MaterialCommunityIcons name="file-document-outline" size={16} color={Colors.accent} />
            <Text style={styles.draftBarText}>
              {draftItemCount} item{draftItemCount !== 1 ? 's' : ''} approved
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, isSavingDraft && styles.saveBtnDisabled]}
            onPress={handleSaveAndViewQuotation}
            disabled={isSavingDraft}
            activeOpacity={0.75}
          >
            {isSavingDraft ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <MaterialCommunityIcons name="content-save-check" size={16} color={Colors.textInverse} />
            )}
            <Text style={styles.saveBtnText}>
              {isSavingDraft ? 'Creating...' : 'Save & View Quotation'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chat + input */}
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
                  <MaterialCommunityIcons name="robot-excited-outline" size={48} color={Colors.accent} />
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
            placeholder={
              connectionStatus === 'connected'
                ? 'Ask anything about your quote...'
                : connectionStatus === 'checking'
                ? 'Connecting to AI...'
                : 'AI unavailable — configure in Settings'
            }
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
              styles.sendBtn2,
              (!inputText.trim() || isThinking) && styles.sendBtnDisabled2,
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isThinking}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={!inputText.trim() || isThinking ? Colors.textDisabled : Colors.textInverse}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── Customer / Project picker modal ────────────────────────────── */}
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowPicker(false)} />
        <View style={styles.modalSheet}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            {pickerStep === 'project' && (
              <TouchableOpacity
                onPress={() => setPickerStep('customer')}
                style={styles.modalBackBtn}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="arrow-left" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>
                {pickerStep === 'customer' ? 'Select Customer' : `Projects — ${pickedCustomerName}`}
              </Text>
              <Text style={styles.modalSubtitle}>
                {pickerStep === 'customer'
                  ? 'Link this quotation to a customer'
                  : 'Pick a project for this quotation'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowPicker(false)} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Customer step */}
          {pickerStep === 'customer' && (
            <ScrollView
              style={styles.pickerList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {customers.length === 0 ? (
                <View style={styles.pickerEmpty}>
                  <MaterialCommunityIcons name="account-off-outline" size={40} color={Colors.textDisabled} />
                  <Text style={styles.pickerEmptyText}>No customers found.</Text>
                  <Text style={styles.pickerEmptyHint}>Add customers in the Customers tab first.</Text>
                </View>
              ) : (
                customers.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.pickerRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPickedCustomerId(c.id);
                      setPickedCustomerName(c.name);
                      setCustomer(c.id);
                      setPickerStep('project');
                    }}
                  >
                    <View style={styles.pickerRowIcon}>
                      <MaterialCommunityIcons name="account-outline" size={18} color={Colors.accent} />
                    </View>
                    <View style={styles.pickerRowText}>
                      <Text style={styles.pickerRowName}>{c.name}</Text>
                      {c.company ? <Text style={styles.pickerRowSub}>{c.company}</Text> : null}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textDisabled} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}

          {/* Project step */}
          {pickerStep === 'project' && (
            <ScrollView
              style={styles.pickerList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {projects.length === 0 ? (
                <View style={styles.pickerEmpty}>
                  <MaterialCommunityIcons name="folder-open-outline" size={40} color={Colors.textDisabled} />
                  <Text style={styles.pickerEmptyText}>No projects for this customer.</Text>
                  <Text style={styles.pickerEmptyHint}>Create a project in the Projects screen first.</Text>
                </View>
              ) : (
                projects.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.pickerRow}
                    activeOpacity={0.7}
                    onPress={async () => {
                      setProject(p.id);
                      setShowPicker(false);
                      // Small delay so state updates propagate before saving
                      await new Promise((r) => setTimeout(r, 80));
                      await doSaveDraft();
                    }}
                  >
                    <View style={styles.pickerRowIcon}>
                      <MaterialCommunityIcons name="folder-outline" size={18} color={Colors.accent} />
                    </View>
                    <View style={styles.pickerRowText}>
                      <Text style={styles.pickerRowName}>{p.name}</Text>
                      {p.siteAddress ? <Text style={styles.pickerRowSub}>{p.siteAddress}</Text> : null}
                    </View>
                    <MaterialCommunityIcons name="content-save-check-outline" size={20} color={Colors.success} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
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
  headerRight: { flexDirection: 'row', gap: Spacing.sm },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  draftBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accent + '18',
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent + '35',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  draftBarLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  draftBarText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    ...Shadow.accent,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textInverse,
  },

  messageList: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },

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
  sendBtn2: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.accent,
  },
  sendBtnDisabled2: {
    backgroundColor: Colors.bg2,
    shadowOpacity: 0,
    elevation: 0,
  },

  // ── Picker modal ──────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalSheet: {
    backgroundColor: Colors.bg1,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '72%',
    paddingBottom: Spacing.xxl,
    ...Shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  modalBackBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleWrap: { flex: 1 },
  modalTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  pickerList: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerRowIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRowText: { flex: 1 },
  pickerRowName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  pickerRowSub: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  pickerEmpty: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxxl,
  },
  pickerEmptyText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  pickerEmptyHint: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textDisabled,
    textAlign: 'center',
    maxWidth: 260,
  },
});

