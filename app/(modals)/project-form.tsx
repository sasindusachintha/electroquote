// app/(modals)/project-form.tsx — Project Add/Edit Modal

import React, { useEffect, useState } from 'react';
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
import { showMessage } from 'react-native-flash-message';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useCustomers } from '../../src/hooks/useCustomers';
import {
  useProject,
  useCreateProject,
  useUpdateProject,
} from '../../src/hooks/useProjects';
import type { ProjectStatus, ProjectInput } from '../../src/types/models';

const STATUS_OPTIONS: { key: ProjectStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'quoting', label: 'Quoting' },
  { key: 'approved', label: 'Approved' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'complete', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function ProjectFormScreen() {
  const { id, customerId: paramCustId } = useLocalSearchParams<{ id?: string; customerId?: string }>();
  const projectId = id ? parseInt(id, 10) : undefined;
  const initialCustomerId = paramCustId ? parseInt(paramCustId, 10) : undefined;
  const isEditing = !!projectId;

  const { data: customers = [], isLoading: loadingCustomers } = useCustomers();
  const { data: existingProject, isLoading: loadingProject } = useProject(projectId);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const [name, setName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(initialCustomerId);
  const [siteAddress, setSiteAddress] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('active');

  useEffect(() => {
    if (existingProject) {
      setName(existingProject.name);
      setSelectedCustomerId(existingProject.customerId);
      setSiteAddress(existingProject.siteAddress || '');
      setDescription(existingProject.description || '');
      setStatus(existingProject.status);
    } else if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    } else if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [existingProject, initialCustomerId, customers]);

  const handleSave = async () => {
    if (!name.trim()) {
      showMessage({ message: 'Project name is required', type: 'danger' });
      return;
    }
    if (!selectedCustomerId) {
      showMessage({ message: 'Select a customer for this project', type: 'danger' });
      return;
    }

    const payload: ProjectInput = {
      name: name.trim(),
      customerId: selectedCustomerId,
      siteAddress: siteAddress.trim() || undefined,
      description: description.trim() || undefined,
      status,
    };

    try {
      if (isEditing && projectId) {
        await updateMutation.mutateAsync({ id: projectId, input: payload });
        showMessage({ message: 'Project updated', type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        showMessage({ message: 'New project created', type: 'success' });
      }
      router.back();
    } catch (err) {
      console.error('Error saving project:', err);
      showMessage({ message: 'Failed to save project', type: 'danger' });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (loadingProject || loadingCustomers) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Project' : 'New Project'}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.disabledBtn]}
          onPress={handleSave}
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
        {/* Project Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Project Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. New House Wiring / Shop Extension"
            placeholderTextColor={Colors.textDisabled}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Customer Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Customer *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {customers.map((c) => {
              const isSelected = selectedCustomerId === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setSelectedCustomerId(c.id)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    👤 {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Status Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Project Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {STATUS_OPTIONS.map((st) => {
              const isSelected = status === st.key;
              return (
                <TouchableOpacity
                  key={st.key}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setStatus(st.key)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Site Address */}
        <View style={styles.field}>
          <Text style={styles.label}>Site Address (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 123 Main Street, Kandy (if different from customer address)"
            placeholderTextColor={Colors.textDisabled}
            value={siteAddress}
            onChangeText={setSiteAddress}
          />
        </View>

        {/* Description / Scope */}
        <View style={styles.field}>
          <Text style={styles.label}>Description / Work Scope (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            placeholder="3-bedroom house complete wiring, DB installation..."
            placeholderTextColor={Colors.textDisabled}
            value={description}
            onChangeText={setDescription}
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
  chipRow: { gap: Spacing.xs, paddingVertical: Spacing.xxs },
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
    height: 80,
    textAlignVertical: 'top',
  },
});
