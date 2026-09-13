// src/components/projects/ProjectCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import type { ProjectWithCustomer, ProjectStatus } from '../../types/models';

interface ProjectCardProps {
  project: ProjectWithCustomer;
  onPress: (project: ProjectWithCustomer) => void;
  onEdit: (project: ProjectWithCustomer) => void;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#8B9BB4', bg: '#1E2533' },
  quoting: { label: 'Quoting', color: '#4DA6FF', bg: 'rgba(77, 166, 255, 0.15)' },
  approved: { label: 'Approved', color: '#2DD4A0', bg: 'rgba(45, 212, 160, 0.15)' },
  in_progress: { label: 'In Progress', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' },
  complete: { label: 'Completed', color: '#2DD4A0', bg: 'rgba(45, 212, 160, 0.2)' },
  active: { label: 'Active', color: '#4DA6FF', bg: 'rgba(77, 166, 255, 0.15)' },
  cancelled: { label: 'Cancelled', color: '#FF5C72', bg: 'rgba(255, 92, 114, 0.15)' },
  archived: { label: 'Archived', color: '#4A5568', bg: '#161B24' },
};

export function ProjectCard({ project, onPress, onEdit }: ProjectCardProps) {
  const statusCfg = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(project)} activeOpacity={0.8}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.name} numberOfLines={1}>
            {project.name}
          </Text>
          <Text style={styles.customerName} numberOfLines={1}>
            👤 {project.customer?.name || `Customer #${project.customerId}`}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {project.siteAddress || project.description ? (
        <View style={styles.detailsBox}>
          {project.siteAddress ? (
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={14} color={Colors.accent} />
              <Text style={styles.detailText} numberOfLines={1}>
                {project.siteAddress}
              </Text>
            </View>
          ) : null}

          {project.description ? (
            <Text style={styles.descriptionText} numberOfLines={2}>
              {project.description}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.cardFooter}>
        <Text style={styles.quoteCount}>
          📋 {project.quotationCount ?? 0} {project.quotationCount === 1 ? 'Quotation' : 'Quotations'}
        </Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(project)}>
          <MaterialCommunityIcons name="pencil-outline" size={16} color={Colors.accent} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  name: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  customerName: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
    marginTop: Spacing.xxs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
  },
  detailsBox: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    flex: 1,
  },
  descriptionText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
  },
  quoteCount: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
  },
  editText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.accent,
  },
});
