// src/components/ai/AIStatusBanner.tsx
// Shows the current AI connection status at the top of the chat screen.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import type { AIConnectionStatus, AIProvider } from '../../services/ai/types';

interface Props {
  status: AIConnectionStatus;
  modelName: string;
  serverUrl: string;
  provider?: AIProvider;
  onPressSettings?: () => void;
}

const STATUS_CONFIGS: Record<
  AIConnectionStatus,
  { color: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }
> = {
  checking: { color: Colors.textSecondary, icon: 'circle-outline', label: 'Connecting...' },
  connected: { color: Colors.success, icon: 'circle', label: 'AI Connected' },
  disconnected: { color: Colors.warning, icon: 'circle-off-outline', label: 'AI Unavailable' },
  error: { color: Colors.error, icon: 'alert-circle-outline', label: 'AI Error' },
};

export function AIStatusBanner({ status, modelName, serverUrl, provider, onPressSettings }: Props) {
  const cfg = STATUS_CONFIGS[status];

  const providerLabel =
    provider === 'huggingface' ? 'Hugging Face' :
    provider === 'ollama' ? 'Ollama' :
    provider === 'groq' ? 'Groq' :
    provider === 'openrouter' ? 'OpenRouter' :
    provider === 'custom' ? 'Custom API' : 'AI';

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: cfg.color + '40' }]}
      onPress={onPressSettings}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: cfg.color }]} />
        <View>
          <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
          {status === 'connected' && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {providerLabel} · {modelName}
            </Text>
          )}
          {status === 'disconnected' && (
            <Text style={styles.subtitle}>
              Quotation features still work normally
            </Text>
          )}
          {status === 'error' && (
            <Text style={styles.subtitle}>
              Check API key and model name in AI Settings
            </Text>
          )}
          {status === 'checking' && (
            <Text style={styles.subtitle}>
              Testing connection to {providerLabel}...
            </Text>
          )}
        </View>
      </View>
      {onPressSettings && (
        <MaterialCommunityIcons name="cog-outline" size={18} color={Colors.textDisabled} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
    marginTop: 1,
  },
});
