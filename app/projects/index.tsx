// app/projects/index.tsx — All Projects List Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useProjects } from '../../src/hooks/useProjects';
import { ProjectCard } from '../../src/components/projects/ProjectCard';
import type { ProjectWithCustomer } from '../../src/types/models';

export default function AllProjectsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects = [], isLoading } = useProjects(searchQuery);

  function handleAddProject() {
    router.push('/(modals)/project-form' as any);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.title}>All Projects</Text>
          <Text style={styles.subtitle}>{projects.length} Active Projects</Text>
        </View>
        <TouchableOpacity style={styles.fab} onPress={handleAddProject}>
          <MaterialCommunityIcons name="folder-plus-outline" size={22} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects by name, address, or customer..."
            placeholderTextColor={Colors.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Projects List */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <ProjectCard
                project={item}
                onPress={handleViewProject}
                onEdit={handleEditProject}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="folder-open-outline" size={56} color={Colors.textDisabled} />
                <Text style={styles.emptyTitle}>No projects found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'No projects match your search query.'
                    : 'Create projects (e.g. "New House Wiring") assigned to your customers.'}
                </Text>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddProject}>
                  <MaterialCommunityIcons name="plus" size={18} color={Colors.textInverse} />
                  <Text style={styles.addBtnText}>Create Project</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitleCol: { flex: 1 },
  title: {
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    marginTop: Spacing.xxs,
  },
  fab: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.accent,
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.base,
    fontFamily: Typography.fontRegular,
  },
  content: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listPadding: { padding: Spacing.base },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xxxl,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    color: Colors.textPrimary,
    fontFamily: Typography.fontSemiBold,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    textAlign: 'center',
    lineHeight: 22,
  },
  addBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.accent,
  },
  addBtnText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
    fontSize: Typography.base,
  },
});
