// app/(modals)/material-form.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showMessage } from 'react-native-flash-message';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useCategories } from '../../src/hooks/useCategories';
import {
  useMaterial,
  useCreateMaterial,
  useUpdateMaterial,
} from '../../src/hooks/useMaterials';
import { PricingService } from '../../src/services/PricingService';

const UNITS = ['each', 'm', 'box', 'roll', 'set', 'pack', 'coil', 'length', 'kg'];

const materialSchema = z.object({
  name: z.string().min(1, 'Material name is required'),
  categoryId: z.number().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  costPrice: z.coerce.number().min(0, 'Cost price must be 0 or greater'),
  markupPct: z.coerce.number().min(0, 'Markup must be 0 or greater').optional(),
  priceOverride: z.boolean().default(false),
  sellPrice: z.coerce.number().min(0, 'Sell price must be 0 or greater').optional(),
  wastagePct: z.coerce.number().min(0, 'Wastage must be 0 or greater').default(0),
  notes: z.string().optional(),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

export default function MaterialFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const materialId = id ? parseInt(id, 10) : undefined;
  const isEditing = !!materialId;

  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { data: existingMaterial, isLoading: loadingMaterial } = useMaterial(materialId);

  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema) as any,
    defaultValues: {
      name: '',
      unit: 'each',
      costPrice: 0,
      markupPct: 25,
      priceOverride: false,
      sellPrice: 0,
      wastagePct: 0,
    },
  });

  const costPrice = watch('costPrice');
  const markupPct = watch('markupPct');
  const categoryId = watch('categoryId');
  const priceOverride = watch('priceOverride');
  const watchSellPrice = watch('sellPrice');

  // Find active category
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const effectiveMarkup = markupPct ?? selectedCategory?.defaultMarkupPct ?? 25;

  // Auto calculate sell price if override is false
  useEffect(() => {
    if (!priceOverride) {
      const computed = PricingService.calculateSellPrice(
        costPrice || 0,
        markupPct,
        selectedCategory?.defaultMarkupPct
      );
      setValue('sellPrice', computed);
    }
  }, [costPrice, markupPct, categoryId, priceOverride, selectedCategory, setValue]);

  // Populate existing data when editing
  useEffect(() => {
    if (existingMaterial) {
      reset({
        name: existingMaterial.name,
        categoryId: existingMaterial.categoryId,
        brand: existingMaterial.brand || '',
        sku: existingMaterial.sku || '',
        unit: existingMaterial.unit || 'each',
        costPrice: existingMaterial.costPrice,
        markupPct: existingMaterial.markupPct ?? 25,
        priceOverride: existingMaterial.priceOverride,
        sellPrice: existingMaterial.sellPrice,
        wastagePct: existingMaterial.wastagePct || 0,
        notes: existingMaterial.notes || '',
      });
    }
  }, [existingMaterial, reset]);

  const onSubmit = async (values: MaterialFormValues) => {
    const computedSell = values.priceOverride
      ? values.sellPrice || 0
      : PricingService.calculateSellPrice(
          values.costPrice,
          values.markupPct,
          selectedCategory?.defaultMarkupPct
        );

    const payload = {
      name: values.name.trim(),
      categoryId: values.categoryId,
      brand: values.brand?.trim() || undefined,
      sku: values.sku?.trim() || undefined,
      unit: values.unit,
      costPrice: values.costPrice,
      markupPct: values.markupPct,
      sellPrice: computedSell,
      priceOverride: values.priceOverride,
      wastagePct: values.wastagePct,
      notes: values.notes?.trim() || undefined,
    };

    try {
      if (isEditing && materialId) {
        await updateMutation.mutateAsync({ id: materialId, input: payload });
        showMessage({ message: 'Material updated successfully', type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        showMessage({ message: 'Material added to catalogue', type: 'success' });
      }
      router.back();
    } catch (err) {
      console.error('Error saving material:', err);
      showMessage({ message: 'Failed to save material', type: 'danger' });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (loadingMaterial || loadingCategories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Material' : 'Add Material'}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.disabledBtn]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Material Name <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g. 2.5mm² Twin & Earth Cable"
                placeholderTextColor={Colors.textDisabled}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
        </View>

        {/* Category Picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {categories.map((cat) => {
              const isSelected = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setValue('categoryId', cat.id)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Brand & SKU */}
        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>Brand (optional)</Text>
            <Controller
              control={control}
              name="brand"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. ACL / Orange"
                  placeholderTextColor={Colors.textDisabled}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>SKU / Code (optional)</Text>
            <Controller
              control={control}
              name="sku"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. CAB-25-TE"
                  placeholderTextColor={Colors.textDisabled}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        {/* Unit Selection */}
        <View style={styles.field}>
          <Text style={styles.label}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {UNITS.map((u) => {
              const isSelected = watch('unit') === u;
              return (
                <TouchableOpacity
                  key={u}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setValue('unit', u)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <Text style={styles.sectionHeader}>Pricing & Markup</Text>

          <View style={styles.row}>
            {/* Cost Price */}
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Cost Price (Rs.) *</Text>
              <Controller
                control={control}
                name="costPrice"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.costPrice && styles.inputError]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textDisabled}
                    onChangeText={onChange}
                    value={value ? String(value) : ''}
                  />
                )}
              />
              {errors.costPrice ? (
                <Text style={styles.errorText}>{errors.costPrice.message}</Text>
              ) : null}
            </View>

            {/* Markup % */}
            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Markup %</Text>
              <Controller
                control={control}
                name="markupPct"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder={String(selectedCategory?.defaultMarkupPct ?? 25)}
                    placeholderTextColor={Colors.textDisabled}
                    onChangeText={onChange}
                    value={value !== undefined ? String(value) : ''}
                  />
                )}
              />
            </View>
          </View>

          {/* Manual Override Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextCol}>
              <Text style={styles.toggleLabel}>Manual Sell Price Override</Text>
              <Text style={styles.toggleSubtext}>
                Set custom sell price directly instead of cost + markup
              </Text>
            </View>
            <Controller
              control={control}
              name="priceOverride"
              render={({ field: { onChange, value } }) => (
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: Colors.border, true: Colors.accent }}
                  thumbColor={Colors.white}
                />
              )}
            />
          </View>

          {/* Final Sell Price */}
          <View style={styles.field}>
            <Text style={styles.label}>Selling Price (Rs.)</Text>
            {priceOverride ? (
              <Controller
                control={control}
                name="sellPrice"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, styles.sellInput]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={Colors.textDisabled}
                    onChangeText={onChange}
                    value={value ? String(value) : ''}
                  />
                )}
              />
            ) : (
              <View style={styles.calculatedPriceBox}>
                <Text style={styles.calculatedPriceText}>
                  Rs. {watchSellPrice ? watchSellPrice.toLocaleString() : '0'}
                </Text>
                <Text style={styles.calculatedNote}>
                  Auto calculated ({effectiveMarkup}% markup)
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Wastage % */}
        <View style={styles.field}>
          <Text style={styles.label}>Default Wastage % (optional)</Text>
          <Controller
            control={control}
            name="wastagePct"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0 (e.g. 10% for cable cuts)"
                placeholderTextColor={Colors.textDisabled}
                onChangeText={onChange}
                value={value !== undefined ? String(value) : ''}
              />
            )}
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes / Description (optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                placeholder="Specification details, supplier code..."
                placeholderTextColor={Colors.textDisabled}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
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
  closeBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    ...Shadow.accent,
  },
  saveBtnText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textInverse,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  formContent: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: { flex: 1 },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    fontFamily: Typography.fontRegular,
  },
  chipRow: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xxs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  chipTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
  },
  pricingCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  sectionHeader: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.accent,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  toggleTextCol: { flex: 1, paddingRight: Spacing.md },
  toggleLabel: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  toggleSubtext: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  calculatedPriceBox: {
    backgroundColor: Colors.bg3,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calculatedPriceText: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.success,
  },
  calculatedNote: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  sellInput: {
    borderColor: Colors.success,
    color: Colors.success,
    fontFamily: Typography.fontBold,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
