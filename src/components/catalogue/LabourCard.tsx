// src/components/catalogue/LabourCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import type { LabourItem } from '../../types/models';

interface LabourCardProps {
  item: LabourItem;
  onEdit: (item: LabourItem) => void;
  onDelete: (item: LabourItem) => void;
}

export function LabourCard({ item, onEdit, onDelete }: LabourCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.infoArea}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
        </View>
        <View style={styles.rateBadge}>
          <Text style={styles.unitText}>Unit: {item.unit}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(item)}>
          <MaterialCommunityIcons name="pencil" size={16} color={Colors.accent} />
          <Text style={styles.actionTextEdit}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(item)}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color={Colors.error} />
          <Text style={styles.actionTextDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoArea: {
    flex: 1,
  },
  name: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  description: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
    lineHeight: 18,
  },
  rateBadge: {
    alignItems: 'flex-end',
    backgroundColor: Colors.bg1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rateValue: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  unitText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionTextEdit: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
  },
  actionTextDelete: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.error,
  },
});
