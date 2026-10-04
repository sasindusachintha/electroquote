// src/components/ai/ChatBubble.tsx
// Renders a single chat message (user or assistant).

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import type { ChatMessage } from '../../services/ai/types';
import { ProposalCard } from './ProposalCard';

interface Props {
  message: ChatMessage;
  onApproveProposal: (proposalId: string) => void;
  onRejectProposal: (proposalId: string) => void;
}

export function ChatBubble({ message, onApproveProposal, onRejectProposal }: Props) {
  const isUser = message.role === 'user';
  const isLoading = message.isLoading;

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  // Assistant message
  return (
    <View style={styles.assistantRow}>
      {/* AI avatar */}
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="robot-excited-outline" size={20} color={Colors.accent} />
      </View>

      <View style={styles.assistantContent}>
        {/* Message text or loading */}
        <View style={styles.assistantBubble}>
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.accent} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          ) : (
            <Text style={styles.assistantText}>{message.content}</Text>
          )}
        </View>

        {/* Proposals */}
        {message.proposals && message.proposals.length > 0 && (
          <View style={styles.proposals}>
            {message.proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onApprove={() => onApproveProposal(proposal.id)}
                onReject={() => onRejectProposal(proposal.id)}
              />
            ))}
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // User bubble
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  userBubble: {
    maxWidth: '78%',
    backgroundColor: Colors.accent,
    borderRadius: Radius.lg,
    borderBottomRightRadius: Radius.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  userText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontMedium,
    fontSize: Typography.base,
    lineHeight: 22,
  },

  // Assistant bubble
  assistantRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
  },
  assistantContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  assistantBubble: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    borderTopLeftRadius: Radius.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assistantText: {
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
    fontSize: Typography.base,
    lineHeight: 22,
  },

  // Loading
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    fontSize: Typography.sm,
  },

  // Proposals
  proposals: { gap: Spacing.sm },

  // Timestamp
  timestamp: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
    marginTop: 2,
  },
});
