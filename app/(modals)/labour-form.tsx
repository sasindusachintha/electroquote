// app/(modals)/labour-form.tsx

import React, { useEffect } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { showMessage } from 'react-native-flash-message';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import {
  useLabourItem,
  useCreateLabour,
  useUpdateLabour,
} from '../../src/hooks/useLabour';

const LABOUR_UNITS = ['per point', 'per hour', 'per day', 'lump sum', 'per item', 'per m'];

const labourSchema = z.object({
  name: z.string().min(1, 'Labour item name is required'),
  unit: z.string().min(1, 'Unit is required'),
  unitRate: z.coerce.number().min(0, 'Unit rate must be 0 or greater'),
  description: z.string().optional(),
});

type LabourFormValues = z.infer<typeof labourSchema>;

export default function LabourFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const labourId = id ? parseInt(id, 10) : undefined;
  const isEditing = !!labourId;

  const { data: existingLabour, isLoading: loadingLabour } = useLabourItem(labourId);

  const createMutation = useCreateLabour();
  const updateMutation = useUpdateLabour();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LabourFormValues>({
    resolver: zodResolver(labourSchema) as any,
    defaultValues: {
      name: '',
      unit: 'per point',
      unitRate: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (existingLabour) {
      reset({
        name: existingLabour.name,
        unit: existingLabour.unit || 'per point',
        unitRate: existingLabour.unitRate,
        description: existingLabour.description || '',
      });
    }
  }, [existingLabour, reset]);

  const onSubmit = async (values: LabourFormValues) => {
    const payload = {
      name: values.name.trim(),
      unit: values.unit,
      unitRate: values.unitRate,
      description: values.description?.trim() || undefined,
    };

    try {
      if (isEditing && labourId) {
        await updateMutation.mutateAsync({ id: labourId, input: payload });
        showMessage({ message: 'Labour item updated', type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        showMessage({ message: 'Labour item added to catalogue', type: 'success' });
      }
      router.back();
    } catch (err) {
      console.error('Error saving labour item:', err);
      showMessage({ message: 'Failed to save labour item', type: 'danger' });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (loadingLabour) {
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
          {isEditing ? 'Edit Labour Item' : 'Add Labour Item'}
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
        {/* Name / Description */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Labour Item Name <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g. 13A Socket Outlet Wiring & Fixing"
                placeholderTextColor={Colors.textDisabled}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
        </View>

        {/* Unit Selection */}
        <View style={styles.field}>
          <Text style={styles.label}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {LABOUR_UNITS.map((u) => {
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

        {/* Unit Rate */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Unit Rate (Rs.) <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="unitRate"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.rateInput, errors.unitRate && styles.inputError]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textDisabled}
                onChangeText={onChange}
                value={value ? String(value) : ''}
              />
            )}
          />
          {errors.unitRate ? (
            <Text style={styles.errorText}>{errors.unitRate.message}</Text>
          ) : null}
        </View>

        {/* Description / Scope Details */}
        <View style={styles.field}>
          <Text style={styles.label}>Description / Scope (optional)</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                placeholder="Includes chasing wall, laying conduit, pulling wire and installing faceplate..."
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
  rateInput: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
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
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
});
