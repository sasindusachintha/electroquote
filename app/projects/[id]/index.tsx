// app/projects/[id]/index.tsx — Project Detail Screen

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme';
import { useProject, useUpdateProjectStatus, useArchiveProject } from '../../../src/hooks/useProjects';
import type { ProjectStatus } from '../../../src/types/models';

const STATUSES: { key: ProjectStatus; label: string }[] = [
  { key: 'draft', label: 'Draft' },
  { key: 'quoting', label: 'Quoting' },
  { key: 'approved', label: 'Approved' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'complete', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = parseInt(id, 10);

  const { data: project, isLoading } = useProject(projectId);
  const updateStatusMutation = useUpdateProjectStatus();
  const archiveMutation = useArchiveProject();

  if (isLoading || !project) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  function handleEditProject() {
    router.push({
      pathname: '/(modals)/project-form' as any,
      params: { id: String(project!.id) },
    } as any);
  }

  function handleViewCustomer() {
    if (project?.customerId) {
      router.push(`/customers/${project.customerId}` as any);
    }
  }

  async function handleStatusChange(newStatus: ProjectStatus) {
    try {
      await updateStatusMutation.mutateAsync({ id: projectId, status: newStatus });
      showMessage({ message: `Project status set to ${newStatus}`, type: 'success' });
    } catch (err) {
      console.error('Failed to update project status:', err);
      showMessage({ message: 'Failed to update status', type: 'danger' });
    }
  }

  function handleArchive() {
    Alert.alert(
      'Archive Project',
      `Are you sure you want to archive "${project?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveMutation.mutateAsync(projectId);
              showMessage({ message: 'Project archived', type: 'success' });
              router.back();
            } catch (err) {
              console.error('Failed to archive project:', err);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {project.name}
        </Text>
        <TouchableOpacity style={styles.editBtn} onPress={handleEditProject}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer Reference Banner */}
        <TouchableOpacity style={styles.customerBanner} onPress={handleViewCustomer}>
          <View style={styles.customerBannerCol}>
            <Text style={styles.customerBannerLabel}>CLIENT / CUSTOMER</Text>
            <Text style={styles.customerBannerName}>
              👤 {project.customer?.name || `Customer #${project.customerId}`}
            </Text>
            {project.customer?.company ? (
              <Text style={styles.customerBannerSub}>{project.customer.company}</Text>
            ) : null}
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.accent} />
        </TouchableOpacity>

        {/* Project Overview Card */}
        <View style={styles.card}>
          <Text style={styles.projectName}>{project.name}</Text>

          {project.siteAddress ? (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={Colors.accent} />
              <Text style={styles.infoText}>Site Address: {project.siteAddress}</Text>
            </View>
          ) : null}

          {project.description ? (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>Project Description / Scope:</Text>
              <Text style={styles.descriptionText}>{project.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Status Selector Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Update Project Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {STATUSES.map((st) => {
              const isSelected = project.status === st.key;
              return (
                <TouchableOpacity
                  key={st.key}
                  style={[styles.statusChip, isSelected && styles.statusChipActive]}
                  onPress={() => handleStatusChange(st.key)}
                >
                  <Text style={[styles.statusChipText, isSelected && styles.statusChipTextActive]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Related Quotations Section */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionTitle}>Project Quotations</Text>
          </View>

          <View style={styles.emptyQuotesBox}>
            <MaterialCommunityIcons name="file-document-outline" size={44} color={Colors.textDisabled} />
            <Text style={styles.emptyQuotesTitle}>No Quotations Created Yet</Text>
            <Text style={styles.emptyQuotesSub}>
              Quotations created for this project will appear here.
            </Text>
          </View>
        </View>

        {/* Archive Action */}
        <TouchableOpacity style={styles.archiveBtn} onPress={handleArchive}>
          <MaterialCommunityIcons name="archive-outline" size={18} color={Colors.error} />
          <Text style={styles.archiveBtnText}>Archive Project</Text>
        </TouchableOpacity>
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
  backBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  editBtn: { padding: Spacing.xs },
  content: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  customerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  customerBannerCol: { flex: 1 },
  customerBannerLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  customerBannerName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
    marginTop: Spacing.xxs,
  },
  customerBannerSub: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  projectName: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  descriptionBox: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.xxs,
  },
  descriptionLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  descriptionText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSectionTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  chipRow: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xxs,
  },
  statusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  statusChipText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  statusChipTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontBold,
  },
  emptyQuotesBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  emptyQuotesTitle: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  emptyQuotesSub: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  archiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  archiveBtnText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.error,
  },
});
