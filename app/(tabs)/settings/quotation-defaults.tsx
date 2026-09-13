// app/(tabs)/settings/quotation-defaults.tsx — Quotation Defaults Settings Form
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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

export default function QuotationDefaultsScreen() {
  const { data: profile, isLoading } = useBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();

  const { control, handleSubmit, reset } = useForm<BusinessProfileInput>({
    defaultValues: {
      name: '',
      currencySymbol: 'Rs.',
      defaultValidityDays: 30,
      defaultNotes: '',
      defaultPaymentTerms: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        ...profile,
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: BusinessProfileInput) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert('Saved', 'Quotation default settings updated!');
        router.back();
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.message || 'Failed to update quotation defaults.');
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quotation Defaults</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.saveBtn}>
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Validity Period */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Validity & Numbering</Text>

          <Controller
            control={control}
            name="defaultValidityDays"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Default Validity Period (Days)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textDisabled}
                  value={value !== undefined ? String(value) : '30'}
                  onChangeText={(v) => onChange(parseInt(v, 10) || 30)}
                />
                <Text style={styles.inputHelp}>
                  New quotations automatically set valid-until date to (Issue Date + Validity Days).
                </Text>
              </View>
            )}
          />

          <View style={styles.refInfoBox}>
            <MaterialCommunityIcons name="information-outline" size={18} color={Colors.accent} />
            <Text style={styles.refInfoText}>
              Reference Numbering Format: <Text style={{ fontFamily: Typography.fontBold }}>EQ-YYYY-NNNN</Text> (e.g. EQ-2026-0001). Auto-incremented sequentially.
            </Text>
          </View>
        </View>

        {/* Default Notes & Terms */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Default Notes & Terms</Text>

          <Controller
            control={control}
            name="defaultNotes"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Default Quotation Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. Prices subject to market copper rate changes. Work will be carried out according to IET wiring regulations."
                  placeholderTextColor={Colors.textDisabled}
                  multiline
                  numberOfLines={3}
                  value={value}
                  onChangeText={onChange}
                />
                <Text style={styles.inputHelp}>
                  Automatically filled on new quotation drafts. Overrideable per quotation.
                </Text>
              </View>
            )}
          />

          <Controller
            control={control}
            name="defaultPaymentTerms"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Default Terms & Conditions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="e.g. 50% advance upon project start, 40% on piping completion, 10% on final inspection and handover."
                  placeholderTextColor={Colors.textDisabled}
                  multiline
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                />
                <Text style={styles.inputHelp}>
                  Appears in generated PDF under Terms & Conditions section.
                </Text>
              </View>
            )}
          />
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
  textArea: {
    height: 90,
    paddingTop: Spacing.sm,
    textAlignVertical: 'top',
  },
  refInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bg2,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refInfoText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    flex: 1,
  },
});
