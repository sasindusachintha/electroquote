// app/customers/[id]/index.tsx — Customer Detail Screen with Projects & Quotations

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme';
import { useCustomer } from '../../../src/hooks/useCustomers';
import { useProjects } from '../../../src/hooks/useProjects';
import { ProjectCard } from '../../../src/components/projects/ProjectCard';
import type { ProjectWithCustomer } from '../../../src/types/models';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = parseInt(id, 10);
  const [activeTab, setActiveTab] = useState<'projects' | 'quotations'>('projects');

  const { data: customer, isLoading: loadingCustomer } = useCustomer(customerId);
  const { data: projects = [], isLoading: loadingProjects } = useProjects(undefined, customerId);

  if (loadingCustomer || !customer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  function handleAddProject() {
    router.push({
      pathname: '/(modals)/project-form' as any,
      params: { customerId: String(customer!.id) },
    } as any);
  }

  function handleEditCustomer() {
    router.push({
      pathname: '/(modals)/customer-form' as any,
      params: { id: String(customer!.id) },
    } as any);
  }

  function handleViewProject(project: ProjectWithCustomer) {
    router.push(`/projects/${project.id}` as any);
  }

  function handleEditProject(project: ProjectWithCustomer) {
    router.push({
      pathname: '/(modals)/project-form' as any,
      params: { id: String(project.id) },
    } as any);
  }

  function handleCallPhone() {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {customer.name}
        </Text>
        <TouchableOpacity style={styles.editBtn} onPress={handleEditCustomer}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {customer.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileTitleCol}>
              <Text style={styles.customerName}>{customer.name}</Text>
              {customer.company ? (
                <Text style={styles.companyName}>🏢 {customer.company}</Text>
              ) : null}
            </View>
          </View>

          {/* Contact Details Grid */}
          <View style={styles.contactBox}>
            {customer.phone ? (
              <TouchableOpacity style={styles.contactRow} onPress={handleCallPhone}>
                <MaterialCommunityIcons name="phone-outline" size={16} color={Colors.accent} />
                <Text style={styles.phoneText}>{customer.phone}</Text>
                <View style={styles.callBadge}>
                  <Text style={styles.callBadgeText}>Call</Text>
                </View>
              </TouchableOpacity>
            ) : null}

            {customer.addressLine1 || customer.city ? (
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.contactText}>
                  {[customer.addressLine1, customer.addressLine2, customer.city].filter(Boolean).join(', ')}
                </Text>
              </View>
            ) : null}

            {customer.email ? (
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="email-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{customer.email}</Text>
              </View>
            ) : null}

            {customer.notes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{customer.notes}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Tab Toggle: Projects vs Quotations */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'projects' && styles.tabActive]}
            onPress={() => setActiveTab('projects')}
          >
            <MaterialCommunityIcons
              name="folder-outline"
              size={18}
              color={activeTab === 'projects' ? Colors.accent : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'projects' && styles.tabTextActive]}>
              Projects ({projects.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'quotations' && styles.tabActive]}
            onPress={() => setActiveTab('quotations')}
          >
            <MaterialCommunityIcons
              name="file-document-outline"
              size={18}
              color={activeTab === 'quotations' ? Colors.accent : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'quotations' && styles.tabTextActive]}>
              Quotation History
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Content */}
        {activeTab === 'projects' ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Customer Projects</Text>
              <TouchableOpacity style={styles.newProjectBtn} onPress={handleAddProject}>
                <MaterialCommunityIcons name="plus" size={16} color={Colors.textInverse} />
                <Text style={styles.newProjectBtnText}>New Project</Text>
              </TouchableOpacity>
            </View>

            {loadingProjects ? (
              <ActivityIndicator size="small" color={Colors.accent} style={{ marginVertical: Spacing.lg }} />
            ) : projects.length > 0 ? (
              projects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  onPress={handleViewProject}
                  onEdit={handleEditProject}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="folder-open-outline" size={48} color={Colors.textDisabled} />
                <Text style={styles.emptyTitle}>No projects yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create projects (e.g. "New House Wiring", "Shop Work") for {customer.name}.
                </Text>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddProject}>
                  <MaterialCommunityIcons name="plus" size={18} color={Colors.textInverse} />
                  <Text style={styles.addBtnText}>Create First Project</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color={Colors.textDisabled} />
              <Text style={styles.emptyTitle}>No quotations found</Text>
              <Text style={styles.emptySubtitle}>
                Quotations created under {customer.name}'s projects will appear here.
              </Text>
            </View>
          </View>
        )}
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
  profileCard: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  avatarText: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  profileTitleCol: { flex: 1 },
  customerName: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  companyName: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  contactBox: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  phoneText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
    flex: 1,
  },
  contactText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    flex: 1,
  },
  callBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.full,
  },
  callBadgeText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.textInverse,
  },
  notesBox: {
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  notesLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  notesText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.xxs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderRadius: Radius.sm,
  },
  tabActive: {
    backgroundColor: Colors.bg3,
  },
  tabText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  tabTextActive: {
    color: Colors.accent,
    fontFamily: Typography.fontSemiBold,
  },
  sectionContainer: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  newProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    ...Shadow.accent,
  },
  newProjectBtnText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textInverse,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.xxl,
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontSemiBold,
  },
  emptySubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    textAlign: 'center',
    lineHeight: 18,
  },
  addBtn: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addBtnText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
    fontSize: Typography.sm,
  },
});
