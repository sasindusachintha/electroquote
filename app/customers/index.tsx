// app/customers/index.tsx — Customer Management Main List Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useCustomers, useArchiveCustomer } from '../../src/hooks/useCustomers';
import { CustomerCard } from '../../src/components/customers/CustomerCard';
import type { Customer } from '../../src/types/models';

export default function CustomerListScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const { data: customers = [], isLoading } = useCustomers(searchQuery, showArchived);
  const archiveMutation = useArchiveCustomer();

  function handleAddCustomer() {
    router.push('/(modals)/customer-form' as any);
  }

  function handleViewCustomer(customer: Customer) {
    router.push(`/customers/${customer.id}` as any);
  }

  function handleEditCustomer(customer: Customer) {
    router.push({
      pathname: '/(modals)/customer-form' as any,
      params: { id: String(customer.id) },
    } as any);
  }

  function handleArchiveCustomer(customer: Customer) {
    Alert.alert(
      'Archive Customer',
      `Are you sure you want to archive "${customer.name}"? Existing projects and quotes will remain intact.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveMutation.mutateAsync(customer.id);
              showMessage({ message: 'Customer archived', type: 'success' });
            } catch (err) {
              console.error('Failed to archive customer:', err);
              showMessage({ message: 'Failed to archive customer', type: 'danger' });
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
        <View style={styles.headerTitleCol}>
          <Text style={styles.title}>Customers</Text>
          <Text style={styles.subtitle}>{customers.length} Client Records</Text>
        </View>
        <TouchableOpacity style={styles.fab} onPress={handleAddCustomer}>
          <MaterialCommunityIcons name="account-plus" size={22} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers by name, phone, company, address..."
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

      {/* Filter Toggle */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, !showArchived && styles.filterChipActive]}
          onPress={() => setShowArchived(false)}
        >
          <Text style={[styles.filterChipText, !showArchived && styles.filterChipTextActive]}>
            Active Clients
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, showArchived && styles.filterChipActive]}
          onPress={() => setShowArchived(true)}
        >
          <Text style={[styles.filterChipText, showArchived && styles.filterChipTextActive]}>
            Show Archived
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            data={customers}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <CustomerCard
                customer={item}
                onPress={handleViewCustomer}
                onEdit={handleEditCustomer}
                onArchive={handleArchiveCustomer}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="account-search-outline" size={56} color={Colors.textDisabled} />
                <Text style={styles.emptyTitle}>No customers found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? 'No clients match your search query.'
                    : 'Your client directory is empty. Add clients to create projects and estimates.'}
                </Text>
                <TouchableOpacity style={styles.addBtn} onPress={handleAddCustomer}>
                  <MaterialCommunityIcons name="account-plus" size={18} color={Colors.textInverse} />
                  <Text style={styles.addBtnText}>Add Customer</Text>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
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
