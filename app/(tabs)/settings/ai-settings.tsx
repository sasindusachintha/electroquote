// app/(tabs)/settings/ai-settings.tsx
// AI Settings screen — configure local Ollama or Free Cloud AI Provider (Hugging Face, OpenRouter, Groq).

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme';
import { useAIChatStore } from '../../../src/stores/aiChatStore';
import { getAIService, PROVIDER_PRESETS } from '../../../src/services/ai/AIService';
import type { AIProvider } from '../../../src/services/ai/types';

export default function AISettingsScreen() {
  const {
    provider,
    serverUrl,
    modelName,
    apiKey,
    connectionStatus,
    setProvider,
    setServerUrl,
    setModelName,
    setApiKey,
    setConnectionStatus,
  } = useAIChatStore();

  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(provider);
  const [urlInput, setUrlInput] = useState(serverUrl);
  const [modelInput, setModelInput] = useState(modelName);
  const [apiKeyInput, setApiKeyInput] = useState(apiKey);
  const [isTesting, setIsTesting] = useState(false);

  function handleSelectProvider(p: AIProvider) {
    setSelectedProvider(p);
    const preset = PROVIDER_PRESETS[p];
    setUrlInput(preset.baseUrl);
    setModelInput(preset.defaultModel);
  }

  async function testConnection() {
    setIsTesting(true);
    const aiService = getAIService({
      provider: selectedProvider,
      baseUrl: urlInput,
      model: modelInput,
      apiKey: apiKeyInput,
    });
    const status = await aiService.checkConnection();
    setConnectionStatus(status);
    setIsTesting(false);

    if (status === 'connected') {
      Alert.alert('✅ Connected', `Successfully connected to ${PROVIDER_PRESETS[selectedProvider].label}.\nModel "${modelInput}" is ready.`);
    } else {
      Alert.alert(
        'Connection Failed',
        `Could not connect to ${PROVIDER_PRESETS[selectedProvider].label}.\nCheck your URL / API key / network connection.`
      );
    }
  }

  function saveSettings() {
    setProvider(selectedProvider);
    setServerUrl(urlInput);
    setModelName(modelInput);
    setApiKey(apiKeyInput);
    getAIService({
      provider: selectedProvider,
      baseUrl: urlInput,
      model: modelInput,
      apiKey: apiKeyInput,
    });
    router.back();
  }

  const statusColor =
    connectionStatus === 'connected'
      ? Colors.success
      : connectionStatus === 'disconnected'
      ? Colors.warning
      : connectionStatus === 'error'
      ? Colors.error
      : Colors.textSecondary;

  const statusLabel =
    connectionStatus === 'connected'
      ? 'Connected'
      : connectionStatus === 'disconnected'
      ? 'Not reachable'
      : connectionStatus === 'error'
      ? 'Connection / Model Error'
      : 'Checking...';

  const currentPreset = PROVIDER_PRESETS[selectedProvider];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status badge */}
        <View style={[styles.statusBadge, { borderColor: statusColor + '40' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        {/* Provider Selector */}
        <Text style={styles.sectionTitle}>AI Provider Mode</Text>
        {(Object.keys(PROVIDER_PRESETS) as AIProvider[]).map((p) => {
          const preset = PROVIDER_PRESETS[p];
          const isActive = selectedProvider === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.providerCard, isActive && styles.providerCardActive]}
              onPress={() => handleSelectProvider(p)}
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons
                name={p === 'ollama' ? 'laptop' : p === 'huggingface' ? 'emoticon-happy-outline' : p === 'groq' ? 'lightning-bolt' : 'cloud-outline'}
                size={22}
                color={isActive ? Colors.accent : Colors.textSecondary}
              />
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{preset.label}</Text>
                <Text style={styles.providerSub}>Default Model: {preset.defaultModel}</Text>
              </View>
              {isActive && <MaterialCommunityIcons name="check-circle" size={20} color={Colors.accent} />}
            </TouchableOpacity>
          );
        })}

        {/* API Key (if cloud provider) */}
        {currentPreset.requiresKey && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>API Key / Token</Text>
            <TextInput
              style={styles.input}
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="Paste your free API Key / Token here"
              placeholderTextColor={Colors.textDisabled}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.fieldHint}>
              {selectedProvider === 'huggingface'
                ? 'Get your free User Access Token from huggingface.co/settings/tokens'
                : selectedProvider === 'openrouter'
                ? 'Get a free key from openrouter.ai/keys'
                : 'Get a free key from console.groq.com/keys'}
            </Text>
          </View>
        )}

        {/* Server URL */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Server Base URL</Text>
          <TextInput
            style={styles.input}
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="http://192.168.1.x:11434"
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        {/* Model name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Model Name</Text>
          <TextInput
            style={styles.input}
            value={modelInput}
            onChangeText={setModelInput}
            placeholder={currentPreset.defaultModel}
            placeholderTextColor={Colors.textDisabled}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.testBtn}
            onPress={testConnection}
            disabled={isTesting}
            activeOpacity={0.75}
          >
            {isTesting ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <MaterialCommunityIcons name="wifi-check" size={18} color={Colors.accent} />
            )}
            <Text style={styles.testBtnText}>{isTesting ? 'Testing...' : 'Test Connection'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} activeOpacity={0.75}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },

  content: { padding: Spacing.base, gap: Spacing.base, paddingBottom: Spacing.xxxl },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.bg2,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: Typography.sm, fontFamily: Typography.fontSemiBold },

  sectionTitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },

  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  providerCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + '10' },
  providerInfo: { flex: 1 },
  providerName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  providerSub: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  fieldGroup: { gap: Spacing.xs },
  fieldLabel: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: Typography.base,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
  },
  fieldHint: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textDisabled,
    lineHeight: 17,
  },

  buttons: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '12',
  },
  testBtnText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.accent,
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent,
    ...Shadow.accent,
  },
  saveBtnText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textInverse,
  },
});
