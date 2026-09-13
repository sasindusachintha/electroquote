// app/(tabs)/quotations/index.tsx — Quotation History Screen
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuotations } from '../../../src/hooks/useQuotations';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme';
import { formatCurrency } from '../../../src/utils/calculations';
import type { QuotationStatus, QuotationSummary } from '../../../src/types/models';

const STATUS_TABS: { key: QuotationStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'declined', label: 'Declined' },
  { key: 'revised', label: 'Revised' },
];

function getStatusBadgeStyle(status: QuotationStatus) {
  switch (status) {
    case 'accepted':
      return { bg: '#dcfce7', text: '#15803d', border: '#86efac' };
    case 'sent':
      return { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' };
    case 'declined':
      return { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' };
    case 'revised':
      return { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' };
    case 'draft':
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
  }
}

export default function QuotationsScreen() {
  const [selectedTab, setSelectedTab] = useState<QuotationStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const queryStatus = selectedTab === 'all' ? undefined : selectedTab;
  const { data: quotations = [], isLoading, refetch } = useQuotations(queryStatus);

  const filteredQuotations = useMemo(() => {
    if (!searchQuery.trim()) return quotations;
    const q = searchQuery.toLowerCase().trim();
    return quotations.filter(
      (item) =>
        item.referenceNo.toLowerCase().includes(q) ||
        item.customer.name.toLowerCase().includes(q) ||
        item.project.name.toLowerCase().includes(q) ||
        (item.title && item.title.toLowerCase().includes(q))
    );
  }, [quotations, searchQuery]);

  const renderQuotationCard = ({ item }: { item: QuotationSummary }) => {
    const badgeStyle = getStatusBadgeStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/quotations/${item.id}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.refContainer}>
            <Text style={styles.refText}>{item.referenceNo}</Text>
            {item.title ? <Text style={styles.titleText}>• {item.title}</Text> : null}
          </View>
          <View style={[styles.badge, { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border }]}>
            <Text style={[styles.badgeText, { color: badgeStyle.text }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="account-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.customer.name}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="folder-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.project.name}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.dateCol}>
            <Text style={styles.dateText}>Issued: {item.issueDate}</Text>
            {item.validUntil ? <Text style={styles.dateText}>Valid: {item.validUntil}</Text> : null}
          </View>

          <View style={styles.priceCol}>
            <Text style={styles.totalText}>Material List</Text>
            <Text style={styles.countText}>{item.lineItemCount} items</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quotations</Text>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/quotations/new/edit')}
        >
          <MaterialCommunityIcons name="plus" size={22} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ref #, customer, project..."
          placeholderTextColor={Colors.textDisabled}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filters Bar */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={(t) => t.key}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => {
            const isActive = selectedTab === item.key;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setSelectedTab(item.key)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Quotations List */}
      <FlatList
        data={filteredQuotations}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderQuotationCard}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="file-document-multiple-outline"
                size={64}
                color={Colors.textDisabled}
              />
              <Text style={styles.emptyTitle}>No quotations found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No quotations match your search criteria.'
                  : 'Tap the + button to create a new quotation.'}
              </Text>
            </View>
          ) : null
        }
      />
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
  headerTitle: {
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg1,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
  },
  tabsContainer: {
    marginVertical: Spacing.sm,
  },
  tabsContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
  },
  tabChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  tabText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  tabTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
  },
  listContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  refText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  titleText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
  },
  cardBody: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
  },
  dateCol: {
    gap: 2,
  },
  dateText: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  countText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
