// src/components/customers/CustomerCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import type { Customer } from '../../types/models';

interface CustomerCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onArchive: (customer: Customer) => void;
}

export function CustomerCard({ customer, onPress, onEdit, onArchive }: CustomerCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(customer)} activeOpacity={0.8}>
      <View style={styles.headerRow}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {customer.name.substring(0, 2).toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>
            {customer.name}
          </Text>
          {customer.company ? (
            <Text style={styles.company} numberOfLines={1}>
              {customer.company}
            </Text>
          ) : null}
        </View>

        {customer.isArchived ? (
          <View style={styles.archivedBadge}>
            <Text style={styles.archivedText}>Archived</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.moreBtn} onPress={() => onEdit(customer)}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color={Colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.detailsBox}>
        {customer.phone ? (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone-outline" size={14} color={Colors.accent} />
            <Text style={styles.detailText}>{customer.phone}</Text>
          </View>
        ) : null}

        {customer.addressLine1 || customer.city ? (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {[customer.addressLine1, customer.city].filter(Boolean).join(', ')}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.tapPrompt}>Tap to view projects & quote history</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  avatarText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  company: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  archivedBadge: {
    backgroundColor: Colors.bg3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
  },
  archivedText: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontMedium,
  },
  moreBtn: {
    padding: Spacing.xs,
  },
  detailsBox: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  tapPrompt: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
  },
});
