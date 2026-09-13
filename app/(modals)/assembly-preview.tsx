// app/(modals)/assembly-preview.tsx — Multiplier Preview & Expansion Test Modal

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useAssembly } from '../../src/hooks/useAssemblies';
import { PricingService } from '../../src/services/PricingService';
import { applyWastage, round2 } from '../../src/utils/calculations';

export default function AssemblyPreviewModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const assemblyId = parseInt(id, 10);
  const [multiplier, setMultiplier] = useState(8); // default demo multiplier e.g. 8x

  const { data: assembly, isLoading } = useAssembly(assemblyId);

  if (isLoading || !assembly) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  // Calculate scaled quantities and prices
  let totalMaterialsCost = 0;
  const scaledMaterials = assembly.materialLines.map((ml) => {
    const baseQty = ml.quantity * multiplier;
    const qty = ml.includeWastage && ml.material?.wastagePct
      ? applyWastage(baseQty, ml.material.wastagePct)
      : round2(baseQty);

    const unitPrice = ml.material
      ? PricingService.calculateSellPrice(
          ml.material.costPrice,
          ml.material.markupPct,
          ml.material.category?.defaultMarkupPct
        )
      : 0;

    const lineTotal = round2(qty * unitPrice);
    totalMaterialsCost += lineTotal;

    return {
      id: ml.id,
      name: ml.material?.name || `Material #${ml.materialId}`,
      unit: ml.material?.unit || 'each',
      baseQty: ml.quantity,
      scaledQty: qty,
      unitPrice,
      lineTotal,
    };
  });

  let totalLabourCost = 0;
  const scaledLabour = assembly.labourLines.map((ll) => {
    const qty = round2(ll.quantity * multiplier);
    const unitRate = ll.labourItem?.unitRate || 0;
    const lineTotal = round2(qty * unitRate);
    totalLabourCost += lineTotal;

    return {
      id: ll.id,
      name: ll.labourItem?.name || `Labour #${ll.labourItemId}`,
      unit: ll.labourItem?.unit || 'point',
      baseQty: ll.quantity,
      scaledQty: qty,
      unitRate,
      lineTotal,
    };
  });

  const grandTotal = round2(totalMaterialsCost + totalLabourCost);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assembly Multiplier Test</Text>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Assembly Info Header */}
        <View style={styles.infoCard}>
          <Text style={styles.assemblyName}>{assembly.name}</Text>
          <Text style={styles.assemblyDesc}>
            {assembly.description || 'Reusable installation recipe template'}
          </Text>

          {/* Multiplier Counter */}
          <View style={styles.multiplierBox}>
            <Text style={styles.multiplierLabel}>Multiplier (How many {assembly.unit}s?)</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setMultiplier((m) => Math.max(1, m - 1))}
              >
                <MaterialCommunityIcons name="minus" size={20} color={Colors.accent} />
              </TouchableOpacity>

              <TextInput
                style={styles.counterInput}
                keyboardType="numeric"
                value={String(multiplier)}
                onChangeText={(val) => setMultiplier(parseInt(val, 10) || 1)}
              />

              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setMultiplier((m) => m + 1)}
              >
                <MaterialCommunityIcons name="plus" size={20} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Dynamic Formula Explanation Banner */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="information-outline" size={20} color={Colors.accent} />
          <Text style={styles.bannerText}>
            Recipe multiplier calculation: <Text style={styles.boldText}>{assembly.name}</Text> ×{' '}
            <Text style={styles.boldText}>{multiplier}</Text>
          </Text>
        </View>

        {/* Scaled Material Component Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📦 Generated Materials ({scaledMaterials.length})</Text>
            <Text style={styles.subtotalText}>Subtotal: Rs. {totalMaterialsCost.toLocaleString()}</Text>
          </View>

          {scaledMaterials.map((item) => (
            <View key={item.id} style={styles.rowItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.formulaText}>
                  Base: {item.baseQty} × {multiplier} ={' '}
                  <Text style={styles.highlightQty}>
                    {item.scaledQty} {item.unit}
                  </Text>
                </Text>
              </View>
              <Text style={styles.itemPrice}>Rs. {item.lineTotal.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Scaled Labour Component Breakdown */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🔧 Generated Labour Items ({scaledLabour.length})</Text>
            <Text style={styles.subtotalText}>Subtotal: Rs. {totalLabourCost.toLocaleString()}</Text>
          </View>

          {scaledLabour.map((item) => (
            <View key={item.id} style={styles.rowItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.formulaText}>
                  Base: {item.baseQty} × {multiplier} ={' '}
                  <Text style={styles.highlightQty}>
                    {item.scaledQty} {item.unit}
                  </Text>
                </Text>
              </View>
              <Text style={styles.itemPrice}>Rs. {item.lineTotal.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Grand Total Summary Box */}
        <View style={styles.grandTotalBox}>
          <Text style={styles.grandTotalLabel}>Estimated Total for {multiplier} × {assembly.unit}</Text>
          <Text style={styles.grandTotalValue}>Rs. {grandTotal.toLocaleString()}</Text>
          <Text style={styles.grandTotalNote}>
            When added to a quotation, these generated items become independent lines that can be edited per job without modifying the template recipe.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  doneBtn: {
    backgroundColor: Colors.bg3,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  doneBtnText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  assemblyName: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  assemblyDesc: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  multiplierBox: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.bg2,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  multiplierLabel: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
    flex: 1,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterInput: {
    width: 50,
    height: 36,
    backgroundColor: Colors.bg3,
    borderRadius: Radius.sm,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  bannerText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    flex: 1,
  },
  boldText: {
    color: Colors.textPrimary,
    fontFamily: Typography.fontSemiBold,
  },
  sectionCard: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  subtotalText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.accent,
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg3,
  },
  itemInfo: { flex: 1, paddingRight: Spacing.md },
  itemName: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  formulaText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  highlightQty: {
    color: Colors.accent,
    fontFamily: Typography.fontBold,
  },
  itemPrice: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.success,
  },
  grandTotalBox: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.accent,
    ...Shadow.accent,
  },
  grandTotalLabel: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  grandTotalValue: {
    fontSize: Typography.xxl,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  grandTotalNote: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
});
