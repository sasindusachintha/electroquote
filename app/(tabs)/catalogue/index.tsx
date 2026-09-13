// app/(tabs)/catalogue/index.tsx — Catalogue tab for Materials, Labour & Assemblies management

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme';
import { useCategories } from '../../../src/hooks/useCategories';
import { useMaterials, useDeactivateMaterial } from '../../../src/hooks/useMaterials';
import { useLabourItems, useDeactivateLabour } from '../../../src/hooks/useLabour';
import {
  useAssemblies,
  useDuplicateAssembly,
  useToggleFavouriteAssembly,
  useDeactivateAssembly,
} from '../../../src/hooks/useAssemblies';

import { CategorySelector } from '../../../src/components/catalogue/CategorySelector';
import { MaterialCard } from '../../../src/components/catalogue/MaterialCard';
import { LabourCard } from '../../../src/components/catalogue/LabourCard';
import { AssemblyCard } from '../../../src/components/catalogue/AssemblyCard';

import type {
  MaterialWithCategory,
  LabourItem,
  AssemblyDetail,
} from '../../../src/types/models';

type CatalogueTab = 'materials' | 'labour' | 'assemblies';

const TABS: { key: CatalogueTab; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { key: 'materials', label: 'Materials', icon: 'package-variant' },
  { key: 'labour', label: 'Labour', icon: 'wrench' },
  { key: 'assemblies', label: 'Assemblies', icon: 'lightning-bolt-circle' },
];

export default function CatalogueScreen() {
  const [activeTab, setActiveTab] = useState<CatalogueTab>('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  // Queries
  const { data: categories = [] } = useCategories();
  const { data: materials = [], isLoading: loadingMaterials } = useMaterials(
    activeTab === 'materials' ? searchQuery : undefined,
    activeTab === 'materials' ? selectedCategoryId : undefined
  );
  const { data: labourItems = [], isLoading: loadingLabour } = useLabourItems(
    activeTab === 'labour' ? searchQuery : undefined
  );
  const { data: assemblies = [], isLoading: loadingAssemblies } = useAssemblies(
    activeTab === 'assemblies' ? searchQuery : undefined,
    activeTab === 'assemblies' ? selectedCategoryId : undefined
  );

  // Mutations
  const deactivateMaterialMutation = useDeactivateMaterial();
  const deactivateLabourMutation = useDeactivateLabour();
  const duplicateAssemblyMutation = useDuplicateAssembly();
  const toggleFavouriteAssemblyMutation = useToggleFavouriteAssembly();
  const deactivateAssemblyMutation = useDeactivateAssembly();

  function handleAdd() {
    if (activeTab === 'materials') {
      router.push('/(modals)/material-form' as any);
    } else if (activeTab === 'labour') {
      router.push('/(modals)/labour-form' as any);
    } else {
      router.push('/(modals)/assembly-form' as any);
    }
  }

  function handleEditMaterial(item: MaterialWithCategory) {
    router.push({
      pathname: '/(modals)/material-form' as any,
      params: { id: String(item.id) },
    } as any);
  }

  function handleDeleteMaterial(item: MaterialWithCategory) {
    Alert.alert(
      'Deactivate Material',
      `Are you sure you want to deactivate "${item.name}"? It will no longer appear in search, but existing quotes will not be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateMaterialMutation.mutateAsync(item.id);
              showMessage({ message: 'Material deactivated', type: 'success' });
            } catch (err) {
              console.error('Failed to deactivate material:', err);
              showMessage({ message: 'Failed to deactivate material', type: 'danger' });
            }
          },
        },
      ]
    );
  }

  function handleEditLabour(item: LabourItem) {
    router.push({
      pathname: '/(modals)/labour-form' as any,
      params: { id: String(item.id) },
    } as any);
  }

  function handleDeleteLabour(item: LabourItem) {
    Alert.alert(
      'Deactivate Labour Item',
      `Are you sure you want to deactivate "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateLabourMutation.mutateAsync(item.id);
              showMessage({ message: 'Labour item deactivated', type: 'success' });
            } catch (err) {
              console.error('Failed to deactivate labour item:', err);
              showMessage({ message: 'Failed to deactivate labour item', type: 'danger' });
            }
          },
        },
      ]
    );
  }

  // Assembly Actions
  function handlePreviewAssemblyMultiplier(item: AssemblyDetail) {
    router.push({
      pathname: '/(modals)/assembly-preview' as any,
      params: { id: String(item.id) },
    } as any);
  }

  function handleEditAssembly(item: AssemblyDetail) {
    router.push({
      pathname: '/(modals)/assembly-form' as any,
      params: { id: String(item.id) },
    } as any);
  }

  async function handleDuplicateAssembly(item: AssemblyDetail) {
    try {
      await duplicateAssemblyMutation.mutateAsync(item.id);
      showMessage({ message: `Duplicated "${item.name}"`, type: 'success' });
    } catch (err) {
      console.error('Failed to duplicate assembly:', err);
      showMessage({ message: 'Failed to duplicate assembly', type: 'danger' });
    }
  }

  async function handleToggleFavouriteAssembly(id: number) {
    try {
      await toggleFavouriteAssemblyMutation.mutateAsync(id);
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
    }
  }

  function handleDeleteAssembly(item: AssemblyDetail) {
    Alert.alert(
      'Deactivate Assembly Recipe',
      `Are you sure you want to deactivate "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateAssemblyMutation.mutateAsync(item.id);
              showMessage({ message: 'Assembly recipe deactivated', type: 'success' });
            } catch (err) {
              console.error('Failed to deactivate assembly:', err);
              showMessage({ message: 'Failed to deactivate assembly', type: 'danger' });
            }
          },
        },
      ]
    );
  }

  const isLoading =
    activeTab === 'materials'
      ? loadingMaterials
      : activeTab === 'labour'
      ? loadingLabour
      : loadingAssemblies;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Catalogue</Text>
          <Text style={styles.subtitle}>
            {activeTab === 'materials'
              ? `${materials.length} Materials`
              : activeTab === 'labour'
              ? `${labourItems.length} Labour Rates`
              : `${assemblies.length} Installation Templates`}
          </Text>
        </View>
        <TouchableOpacity style={styles.fab} onPress={handleAdd}>
          <MaterialCommunityIcons name="plus" size={22} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Top tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.key);
              setSearchQuery('');
            }}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? Colors.accent : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'materials'
                ? 'Search materials by name, SKU, or brand...'
                : activeTab === 'labour'
                ? 'Search labour items...'
                : 'Search installation templates...'
            }
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

      {/* Category selector chips (Materials & Assemblies tabs) */}
      {activeTab !== 'labour' ? (
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />
      ) : null}

      {/* Main List Area */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : activeTab === 'materials' ? (
          <FlatList
            data={materials}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <MaterialCard
                material={item}
                onEdit={handleEditMaterial}
                onDelete={handleDeleteMaterial}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="package-variant-closed" size={56} color={Colors.textDisabled} />
                <Text style={styles.emptyTitle}>No materials found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedCategoryId
                    ? 'No materials match your current filter or search criteria.'
                    : 'Your material catalogue is empty. Add materials to use in estimates.'}
                </Text>
                <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                  <MaterialCommunityIcons name="plus" size={18} color={Colors.textInverse} />
                  <Text style={styles.addBtnText}>Add Material</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : activeTab === 'labour' ? (
          <FlatList
            data={labourItems}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <LabourCard
                item={item}
                onEdit={handleEditLabour}
                onDelete={handleDeleteLabour}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="wrench-outline" size={56} color={Colors.textDisabled} />
                <Text style={styles.emptyTitle}>No labour items found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'No labour items match your search term.'
                    : 'Add labour items (e.g. per point rate, DB installation rate).'}
                </Text>
                <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                  <MaterialCommunityIcons name="plus" size={18} color={Colors.textInverse} />
                  <Text style={styles.addBtnText}>Add Labour Item</Text>
                </TouchableOpacity>
              </View>
            }
          />
        ) : (
          <FlatList
            data={assemblies}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <AssemblyCard
                assembly={item}
                onPreviewMultiplier={handlePreviewAssemblyMultiplier}
                onEdit={handleEditAssembly}
                onDuplicate={handleDuplicateAssembly}
                onToggleFavourite={handleToggleFavouriteAssembly}
                onDelete={handleDeleteAssembly}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="lightning-bolt-circle" size={56} color={Colors.textDisabled} />
                <Text style={styles.emptyTitle}>No assemblies found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery || selectedCategoryId
                    ? 'No installation templates match your search criteria.'
                    : 'Create reusable installation assemblies (e.g. Lighting Point, Socket Point) to speed up quoting.'}
                </Text>
                <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
                  <MaterialCommunityIcons name="plus" size={18} color={Colors.textInverse} />
                  <Text style={styles.addBtnText}>Create Assembly Recipe</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
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

  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bg1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: Colors.transparent,
  },
  tabActive: {
    borderBottomColor: Colors.accent,
  },
  tabLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  tabLabelActive: {
    color: Colors.accent,
    fontFamily: Typography.fontSemiBold,
  },

  searchBarContainer: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.bg0,
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listPadding: {
    padding: Spacing.base,
  },

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
    marginTop: Spacing.sm,
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
