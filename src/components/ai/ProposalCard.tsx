// src/components/ai/ProposalCard.tsx
// Shows an AI-proposed quote modification with Approve / Reject buttons.
// The key safety feature: nothing changes in the quote until the user taps Approve.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import type { QuoteProposal } from '../../services/ai/types';

interface Props {
  proposal: QuoteProposal;
  onApprove: () => void;
  onReject: () => void;
}

const PROPOSAL_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  add_assembly: 'package-variant-plus',
  add_material: 'plus-circle-outline',
  update_quantity: 'pencil-circle-outline',
  remove_item: 'minus-circle-outline',
};

export function ProposalCard({ proposal, onApprove, onReject }: Props) {
  const icon = PROPOSAL_ICONS[proposal.type] ?? 'lightning-bolt';
  const isApproved = proposal.status === 'approved';
  const isRejected = proposal.status === 'rejected';
  const isPending = proposal.status === 'pending';

  return (
    <View
      style={[
        styles.card,
        isApproved && styles.cardApproved,
        isRejected && styles.cardRejected,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: Colors.accent + '20' }]}>
          <MaterialCommunityIcons name={icon} size={20} color={Colors.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.label}>{proposal.label}</Text>
          {proposal.detailLines?.map((line, i) => (
            <Text key={i} style={styles.detail}>{line}</Text>
          ))}
        </View>
      </View>

      {/* Status / Actions */}
      {isPending ? (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.rejectBtn} onPress={onReject} activeOpacity={0.75}>
            <MaterialCommunityIcons name="close" size={16} color={Colors.error} />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.approveBtn} onPress={onApprove} activeOpacity={0.75}>
            <MaterialCommunityIcons name="check" size={16} color={Colors.textInverse} />
            <Text style={styles.approveText}>Add to Quote</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.statusRow}>
          <MaterialCommunityIcons
            name={isApproved ? 'check-circle' : 'close-circle'}
            size={16}
            color={isApproved ? Colors.success : Colors.error}
          />
          <Text style={[styles.statusText, { color: isApproved ? Colors.success : Colors.error }]}>
            {isApproved ? 'Added to quote' : 'Rejected'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg3,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
    padding: Spacing.base,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  cardApproved: {
    borderColor: Colors.success + '50',
    backgroundColor: Colors.success + '08',
  },
  cardRejected: {
    borderColor: Colors.border,
    opacity: 0.6,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  detail: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.error + '50',
    backgroundColor: Colors.error + '12',
  },
  rejectText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.error,
  },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent,
    ...Shadow.accent,
  },
  approveText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textInverse,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
  },
});
