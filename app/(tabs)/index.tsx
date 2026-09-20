// app/(tabs)/index.tsx — Dashboard / Home screen

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useProjects } from '../../src/hooks/useProjects';
import { useSQLiteContext } from 'expo-sqlite';
import { QuotationRepository } from '../../src/db/repositories/QuotationRepository';
import type { QuotationSummary } from '../../src/types/models';

function QuickActionCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.qaCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.qaIcon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProjectsSection() {
  const { data: projects = [], isLoading } = useProjects();

  return (
    <View>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Projects</Text>
        <TouchableOpacity
          style={styles.sectionLink}
          onPress={() => router.push('/projects' as any)}
        >
          <Text style={styles.sectionLinkText}>View All</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      {!isLoading && projects.length === 0 ? (
        <View style={styles.projectEmptyCard}>
          <MaterialCommunityIcons name="folder-open-outline" size={44} color={Colors.textDisabled} />
          <Text style={styles.emptyTitle}>No projects yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a project first, then attach quotations to it.
          </Text>
          <TouchableOpacity
            style={styles.emptyAction}
            onPress={() => router.push('/(modals)/project-form' as any)}
          >
            <MaterialCommunityIcons name="folder-plus-outline" size={18} color={Colors.textInverse} />
            <Text style={styles.emptyActionText}>Create First Project</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.projectList}>
          {projects.slice(0, 3).map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.projectRow}
              onPress={() => router.push(`/projects/${p.id}` as any)}
            >
              <View style={styles.projectIconWrap}>
                <MaterialCommunityIcons name="folder-outline" size={22} color={Colors.accent} />
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.projectMeta} numberOfLines={1}>
                  {p.customer?.name ?? 'No customer'} · {p.status}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textDisabled} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addProjectRow}
            onPress={() => router.push('/(modals)/project-form' as any)}
          >
            <MaterialCommunityIcons name="plus" size={18} color={Colors.accent} />
            <Text style={styles.addProjectText}>New Project</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function RecentQuotationsSection() {
  const db = useSQLiteContext();
  const [quotations, setQuotations] = useState<QuotationSummary[]>([]);

  useEffect(() => {
    const repo = new QuotationRepository(db);
    repo.getAll().then((all) => {
      setQuotations(all.slice(0, 3));
    }).catch(() => {});
  }, [db]);

  return (
    <View style={{ marginTop: Spacing.md }}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Recent Quotations</Text>
        <TouchableOpacity
          style={styles.sectionLink}
          onPress={() => router.push('/quotations' as any)}
        >
          <Text style={styles.sectionLinkText}>View All</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      {quotations.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="file-document-outline" size={44} color={Colors.textDisabled} />
          <Text style={styles.emptyTitle}>No quotations yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a project first, then tap "New Quotation"
          </Text>
          <TouchableOpacity
            style={styles.emptyAction}
            onPress={() => router.push('/quotations/new/edit')}
          >
            <Text style={styles.emptyActionText}>Create Quotation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.projectList}>
          {quotations.map((q) => (
            <TouchableOpacity
              key={q.id}
              style={styles.projectRow}
              onPress={() => router.push(`/quotations/${q.id}` as any)}
            >
              <View style={[styles.projectIconWrap, { backgroundColor: Colors.info + '22' }]}>
                <MaterialCommunityIcons name="file-document-outline" size={22} color={Colors.info} />
              </View>
              <View style={styles.projectInfo}>
                <Text style={styles.projectName} numberOfLines={1}>{q.referenceNo}</Text>
                <Text style={styles.projectMeta} numberOfLines={1}>{q.project?.name ?? 'No project'}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textDisabled} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg0} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning ⚡</Text>
            <Text style={styles.appName}>ElectroQuote</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/settings/business-profile')}
          >
            <MaterialCommunityIcons name="account-circle" size={36} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionCard
            icon="folder-plus-outline"
            label="New Project"
            color={Colors.accent}
            onPress={() => router.push('/(modals)/project-form' as any)}
          />
          <QuickActionCard
            icon="file-plus"
            label="New Quotation"
            color={Colors.info}
            onPress={() => router.push('/quotations/new/edit')}
          />
          <QuickActionCard
            icon="account-plus"
            label="New Customer"
            color={Colors.success}
            onPress={() => router.push('/(modals)/customer-form' as any)}
          />
          <QuickActionCard
            icon="package-variant-plus"
            label="Add Material"
            color="#A78BFA"
            onPress={() => router.push('/(modals)/material-form' as any)}
          />
        </View>

        {/* Projects section */}
        <ProjectsSection />

        {/* Recent quotations */}
        <RecentQuotationsSection />
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  greeting: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  appName: {
    fontSize: Typography.xxl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
    letterSpacing: -0.5,
  },
  profileBtn: { padding: Spacing.xs },

  sectionLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },

  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  qaCard: {
    width: '47%',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  qaIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaLabel: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
    textAlign: 'center',
  },

  emptyCard: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: Typography.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontSemiBold,
  },
  emptySubtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadow.accent,
  },
  emptyActionText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
    fontSize: Typography.base,
  },

  // Section header row
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionLinkText: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontFamily: Typography.fontMedium,
  },

  // Projects
  projectEmptyCard: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.xl,
  },
  projectList: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  projectIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.accent + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectInfo: { flex: 1 },
  projectName: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
  },
  projectMeta: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  addProjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  addProjectText: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontFamily: Typography.fontMedium,
  },
});

