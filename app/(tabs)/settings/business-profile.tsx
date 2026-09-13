// app/(tabs)/settings/business-profile.tsx — Business Profile Form with Logo Picker
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useForm, Controller } from 'react-hook-form';
import { useBusinessProfile, useUpdateBusinessProfile } from '../../../src/hooks/useBusinessProfile';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme';
import type { BusinessProfileInput } from '../../../src/types/models';

export default function BusinessProfileScreen() {
  const { data: profile, isLoading } = useBusinessProfile();
  const updateMutation = useUpdateBusinessProfile();

  const { control, handleSubmit, setValue, watch, reset } = useForm<BusinessProfileInput>({
    defaultValues: {
      name: '',
      tradingName: '',
      ownerName: '',
      phone: '',
      whatsappNumber: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      regNumber: '',
      vatNumber: '',
      logoUri: '',
      currencySymbol: 'Rs.',
      defaultPaymentTerms: '',
      defaultValidityDays: 30,
      bankName: '',
      bankAccount: '',
      bankBranch: '',
      defaultVatEnabled: false,
      defaultVatPct: 0,
      defaultMarkupPct: 0,
      defaultNotes: '',
      pdfMode: 'detailed',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        tradingName: profile.tradingName || '',
        ownerName: profile.ownerName || '',
        phone: profile.phone || '',
        whatsappNumber: profile.whatsappNumber || '',
        email: profile.email || '',
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        regNumber: profile.regNumber || '',
        vatNumber: profile.vatNumber || '',
        logoUri: profile.logoUri || '',
        currencySymbol: profile.currencySymbol || 'Rs.',
        defaultPaymentTerms: profile.defaultPaymentTerms || '',
        defaultValidityDays: profile.defaultValidityDays ?? 30,
        bankName: profile.bankName || '',
        bankAccount: profile.bankAccount || '',
        bankBranch: profile.bankBranch || '',
        defaultVatEnabled: profile.defaultVatEnabled ?? false,
        defaultVatPct: profile.defaultVatPct ?? 0,
        defaultMarkupPct: profile.defaultMarkupPct ?? 0,
        defaultNotes: profile.defaultNotes || '',
        pdfMode: profile.pdfMode || 'detailed',
      });
    }
  }, [profile, reset]);

  const logoUri = watch('logoUri');

  const handlePickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setValue('logoUri', result.assets[0].uri, { shouldDirty: true });
      }
    } catch {
      Alert.alert('Error', 'Failed to select image from gallery.');
    }
  };

  const handleRemoveLogo = () => {
    setValue('logoUri', '', { shouldDirty: true });
  };

  const onSubmit = (data: BusinessProfileInput) => {
    if (!data.name.trim()) {
      Alert.alert('Validation Error', 'Business name is required.');
      return;
    }

    updateMutation.mutate(data, {
      onSuccess: () => {
        Alert.alert('Saved', 'Business profile updated successfully!');
        router.back();
      },
      onError: (err: any) => {
        Alert.alert('Error', err?.message || 'Failed to save business profile.');
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
        <Text style={styles.headerTitle}>Business Profile</Text>
        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.saveBtn}>
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Business Logo Picker Section */}
        <View style={styles.logoCard}>
          <Text style={styles.cardSectionTitle}>Business Logo</Text>
          <View style={styles.logoRow}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoImage} resizeMode="contain" />
            ) : (
              <View style={styles.logoPlaceholder}>
                <MaterialCommunityIcons name="image-plus" size={32} color={Colors.textDisabled} />
                <Text style={styles.logoPlaceholderText}>No Logo</Text>
              </View>
            )}

            <View style={styles.logoActionCol}>
              <TouchableOpacity style={styles.logoBtn} onPress={handlePickLogo}>
                <MaterialCommunityIcons name="upload" size={18} color={Colors.accent} />
                <Text style={styles.logoBtnText}>{logoUri ? 'Change Logo' : 'Select Logo'}</Text>
              </TouchableOpacity>

              {logoUri ? (
                <TouchableOpacity style={styles.logoRemoveBtn} onPress={handleRemoveLogo}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
                  <Text style={styles.logoRemoveText}>Remove</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>

        {/* Business Info Section */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>General Information</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Perera Electrical Estimators"
                  placeholderTextColor={Colors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="tradingName"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Trading Name (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Perera Electrics"
                  placeholderTextColor={Colors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="ownerName"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Owner / Contact Person</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nimal Perera (Licensed Electrician)"
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
              name="phone"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0771234567"
                    keyboardType="phone-pad"
                    placeholderTextColor={Colors.textDisabled}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="whatsappNumber"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>WhatsApp #</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0771234567"
                    keyboardType="phone-pad"
                    placeholderTextColor={Colors.textDisabled}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="nimal@electrotech.lk"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.textDisabled}
                  value={value}
                  onChangeText={onChange}
                />
              </View>
            )}
          />
        </View>

        {/* Location / Address Section */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Address & Currency</Text>

          <Controller
            control={control}
            name="addressLine1"
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address Line 1</Text>
                <TextInput
                  style={styles.input}
                  placeholder="No. 45, Main Street"
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
              name="city"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Colombo 03"
                    placeholderTextColor={Colors.textDisabled}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="currencySymbol"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Currency</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Rs."
                    placeholderTextColor={Colors.textDisabled}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </View>
        </View>

        {/* Business Registration & Tax Section */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Registration & Tax Numbers</Text>

          <View style={styles.twoColRow}>
            <Controller
              control={control}
              name="regNumber"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Business Reg #</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="PV-12345"
                    placeholderTextColor={Colors.textDisabled}
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="vatNumber"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>VAT Reg #</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VAT-98765"
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
  logoCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoPlaceholderText: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
  },
  logoActionCol: {
    gap: Spacing.xs,
  },
  logoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  logoBtnText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.accent,
  },
  logoRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  logoRemoveText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.error,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
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
  twoColRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
