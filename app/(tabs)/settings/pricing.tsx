// app/(tabs)/settings/pricing.tsx — Markup, Tax (VAT) & Banking Settings Form
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useBusinessProfile, useUpdateBusinessProfile } from '../../../src/hooks/useBusinessProfile';
import { Colors, Typography, Spacing, Radius } from '../../../src/constants/theme';
import type { BusinessProfileInput } from '../../../src/types/models';

export default function PricingSettingsScreen() {
  const { data: profile, isLoading } = useBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();

  const { control, handleSubmit, reset, watch, setValue } = useForm<BusinessProfileInput>({
    defaultValues: {
      name: '',
      currencySymbol: 'Rs.',
      defaultMarkupPct: 0,
      defaultVatEnabled: false,
      defaultVatPct: 0,
      pdfMode: 'detailed',
      bankName: '',
      bankAccount: '',
      bankBranch: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        ...profile,
      });
    }
  }, [profile, reset]);

  const vatEnabled = watch('defaultVatEnabled');

  const onSubmit = (data: BusinessProfileInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert('Saved', 'Pricing and VAT settings updated!');
        router.back();
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.message || 'Failed to update settings.');
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pricing & Tax Settings</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.saveBtn}>
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Material Markup Defaults */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Default Material Markup</Text>

          <Controller
            control={control}
            name="defaultMarkupPct"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Default Markup Percentage (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textDisabled}
                  value={value !== undefined ? String(value) : '0'}
                  onChangeText={(v) => onChange(parseFloat(v) || 0)}
                />
                <Text style={styles.inputHelp}>
                  Automatically applied when creating new material items in catalogue.
                </Text>
              </View>
            )}
          />
        </View>

        {/* VAT Tax Configuration */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>VAT Tax Configuration</Text>

          <Controller
            control={control}
            name="defaultVatEnabled"
            render={({ field: { onChange, value } }) => (
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchLabel}>Enable VAT by Default</Text>
                  <Text style={styles.switchHelp}>
                    New quotations will automatically include VAT calculation.
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: Colors.bg3, true: Colors.accent }}
                  thumbColor={Colors.white}
                />
              </View>
            )}
          />

          {vatEnabled && (
            <Controller
              control={control}
              name="defaultVatPct"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Configurable VAT Rate (%)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="18"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textDisabled}
                    value={value !== undefined ? String(value) : '0'}
                    onChangeText={(v) => onChange(parseFloat(v) || 0)}
                  />
                  <Text style={styles.inputHelp}>
                    Dynamic VAT rate (e.g. 18% or 15%). Existing quotations retain their original rate.
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        {/* Banking & Payment Info */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Banking & Payment Details</Text>

          <Controller
            control={control}
            name="bankName"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Commercial Bank / Bank of Ceylon"
                  placeholderTextColor={Colors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />

          <View style={styles.twoColRow}>
            <Controller
              control={control}
              name="bankAccount"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Account Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10002938475"
                    placeholderTextColor={Colors.textDisabled}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="bankBranch"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Branch Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Kandy"
                    placeholderTextColor={Colors.textDisabled}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  centerContainer: {
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
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg1,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  saveBtnText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontBold,
    fontSize: Typography.sm,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardSectionTitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  inputHelp: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
    marginTop: 2,
  },
  input: {
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  switchLabel: {
    fontSize: Typography.base,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  switchHelp: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    marginTop: 2,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
