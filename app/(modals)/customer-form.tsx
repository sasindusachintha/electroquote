// app/(modals)/customer-form.tsx — Customer Add/Edit Modal

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
  useCustomer,
  useCreateCustomer,
  useUpdateCustomer,
} from '../../src/hooks/useCustomers';

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomerFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const customerId = id ? parseInt(id, 10) : undefined;
  const isEditing = !!customerId;

  const { data: existingCustomer, isLoading: loadingCustomer } = useCustomer(customerId);

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: {
      name: '',
      company: '',
      phone: '',
      email: '',
      addressLine1: '',
      city: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (existingCustomer) {
      reset({
        name: existingCustomer.name,
        company: existingCustomer.company || '',
        phone: existingCustomer.phone || '',
        email: existingCustomer.email || '',
        addressLine1: existingCustomer.addressLine1 || '',
        city: existingCustomer.city || '',
        notes: existingCustomer.notes || '',
      });
    }
  }, [existingCustomer, reset]);

  const onSubmit = async (values: CustomerFormValues) => {
    const payload = {
      name: values.name.trim(),
      company: values.company?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      email: values.email?.trim() || undefined,
      addressLine1: values.addressLine1?.trim() || undefined,
      city: values.city?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    };

    try {
      if (isEditing && customerId) {
        await updateMutation.mutateAsync({ id: customerId, input: payload });
        showMessage({ message: 'Customer updated', type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        showMessage({ message: 'New customer created', type: 'success' });
      }
      router.back();
    } catch (err) {
      console.error('Error saving customer:', err);
      showMessage({ message: 'Failed to save customer', type: 'danger' });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (loadingCustomer) {
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
          {isEditing ? 'Edit Customer' : 'Add Customer'}
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
            Customer Name <Text style={styles.required}>*</Text>
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="e.g. Nimal Perera"
                placeholderTextColor={Colors.textDisabled}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name.message}</Text> : null}
        </View>

        {/* Company & Phone */}
        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>Phone Number</Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="phone-pad"
                  placeholder="e.g. 0771234567"
                  placeholderTextColor={Colors.textDisabled}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>Company (optional)</Text>
            <Controller
              control={control}
              name="company"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Perera Traders"
                  placeholderTextColor={Colors.textDisabled}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        {/* Address & City */}
        <View style={styles.field}>
          <Text style={styles.label}>Address Line 1</Text>
          <Controller
            control={control}
            name="addressLine1"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="e.g. No. 45, Temple Road"
                placeholderTextColor={Colors.textDisabled}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>City / Town</Text>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Colombo / Kandy"
                  placeholderTextColor={Colors.textDisabled}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>Email (optional)</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="e.g. nimal@gmail.com"
                  placeholderTextColor={Colors.textDisabled}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                placeholder="Special requirements, contact preferences..."
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
  closeBtn: { padding: Spacing.xs },
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
  disabledBtn: { opacity: 0.6 },
  formContent: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  field: { gap: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.md },
  flex1: { flex: 1 },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  required: { color: Colors.error },
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
  inputError: { borderColor: Colors.error },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    fontFamily: Typography.fontRegular,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
});
