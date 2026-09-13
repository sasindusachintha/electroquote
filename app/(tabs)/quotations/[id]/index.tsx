// app/(tabs)/quotations/[id]/index.tsx — Quotation Detail & Preview Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import {
  useQuotationDetail,
  useUpdateQuotationStatus,
  useUpdateQuotationPdfMode,
  useDuplicateQuotation,
  useDeleteQuotation,
} from '../../../../src/hooks/useQuotations';
import { BusinessProfileRepository } from '../../../../src/db/repositories/BusinessProfileRepository';
import { PdfService } from '../../../../src/services/PdfService';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../../src/constants/theme';
import { formatCurrency } from '../../../../src/utils/calculations';
import type { QuotationStatus, BusinessProfile } from '../../../../src/types/models';

export default function QuotationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const quotationId = Number(id);
  const db = useSQLiteContext();

  const { data: quotation, isLoading, refetch } = useQuotationDetail(quotationId);
  const updateStatusMutation = useUpdateQuotationStatus();
  const updatePdfModeMutation = useUpdateQuotationPdfMode();
  const duplicateMutation = useDuplicateQuotation();
  const deleteMutation = useDeleteQuotation();

  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleStatusChange = (status: QuotationStatus) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this quotation as "${status.toUpperCase()}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: () => {
            updateStatusMutation.mutate({ id: quotationId, status });
          },
        },
      ]
    );
  };

  const handleTogglePdfMode = (mode: 'detailed' | 'simple') => {
    if (!quotation || quotation.pdfMode === mode) return;
    updatePdfModeMutation.mutate({ id: quotationId, pdfMode: mode });
  };

  const handleSharePdf = async () => {
    if (!quotation) return;
    try {
      setGeneratingPdf(true);
      const bizRepo = new BusinessProfileRepository(db);
      const profile = await bizRepo.get();

      const pdfUri = await PdfService.generateQuotationPdf(quotation, profile);
      await PdfService.sharePdf(pdfUri, quotation.referenceNo);
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      // Expo Go cannot share file:// URIs due to Android FileProvider restrictions.
      // This works correctly in a production/development build (not Expo Go).
      if (msg.toLowerCase().includes('not allowed') || msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('url')) {
        Alert.alert(
          'Share Requires Dev Build',
          'PDF file sharing is not supported inside Expo Go due to Android file permissions.\n\nBuild the app with "eas build" or "npx expo run:android" to enable PDF sharing.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('PDF Error', msg || 'Failed to generate PDF.');
      }
    } finally {
      setGeneratingPdf(false);
    }
  };


  const handleDuplicate = () => {
    Alert.alert(
      'Duplicate Quotation',
      'Create a new draft copy of this quotation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: () => {
            duplicateMutation.mutate(quotationId, {
              onSuccess: (newId) => {
                router.push(`/quotations/${newId}` as any);
              },
            });
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Quotation',
      'Are you sure you want to delete this quotation permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(quotationId, {
              onSuccess: () => {
                router.back();
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Loading quotation details...</Text>
      </SafeAreaView>
    );
  }

  if (!quotation) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Quotation Not Found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isDetailed = quotation.pdfMode === 'detailed';
  const currency = quotation.currencySymbol;
  const materials = quotation.lineItems.filter((l) => l.isMaterial);
  const labour = quotation.lineItems.filter((l) => !l.isMaterial);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerRef}>{quotation.referenceNo}</Text>
          <Text style={styles.headerSub}>{quotation.customer.name}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDuplicate} style={styles.headerIconBtn}>
            <MaterialCommunityIcons name="content-copy" size={20} color={Colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerIconBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Banner & Action Buttons */}
        <View style={styles.statusBanner}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>STATUS:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{quotation.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.statusActionsRow}>
            <TouchableOpacity
              style={[styles.statusBtn, quotation.status === 'draft' && styles.statusBtnActive]}
              onPress={() => handleStatusChange('draft')}
            >
              <Text style={styles.statusBtnText}>Draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, quotation.status === 'sent' && styles.statusBtnActive]}
              onPress={() => handleStatusChange('sent')}
            >
              <Text style={styles.statusBtnText}>Sent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, quotation.status === 'accepted' && styles.statusBtnActiveSuccess]}
              onPress={() => handleStatusChange('accepted')}
            >
              <Text style={styles.statusBtnText}>Accepted</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, quotation.status === 'declined' && styles.statusBtnActiveDanger]}
              onPress={() => handleStatusChange('declined')}
            >
              <Text style={styles.statusBtnText}>Declined</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Pricing Transparency Mode Selector */}
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>PDF Display Pricing Mode:</Text>
          <View style={styles.modeSegmentContainer}>
            <TouchableOpacity
              style={[styles.modeSegment, isDetailed && styles.modeSegmentActive]}
              onPress={() => handleTogglePdfMode('detailed')}
            >
              <MaterialCommunityIcons
                name="format-list-numbered"
                size={16}
                color={isDetailed ? Colors.textInverse : Colors.textSecondary}
              />
              <Text style={[styles.modeSegmentText, isDetailed && styles.modeSegmentTextActive]}>
                Detailed (Show Unit Prices)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeSegment, !isDetailed && styles.modeSegmentActive]}
              onPress={() => handleTogglePdfMode('simple')}
            >
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={16}
                color={!isDetailed ? Colors.textInverse : Colors.textSecondary}
              />
              <Text style={[styles.modeSegmentText, !isDetailed && styles.modeSegmentTextActive]}>
                Simple (Hide Unit Prices)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Customer & Project Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoCol}>
            <Text style={styles.infoHeading}>CUSTOMER</Text>
            <Text style={styles.infoName}>{quotation.customer.name}</Text>
            {quotation.customer.phone ? (
              <Text style={styles.infoSub}>Phone: {quotation.customer.phone}</Text>
            ) : null}
            {quotation.customer.email ? (
              <Text style={styles.infoSub}>Email: {quotation.customer.email}</Text>
            ) : null}
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoCol}>
            <Text style={styles.infoHeading}>PROJECT</Text>
            <Text style={styles.infoName}>{quotation.project.name}</Text>
            {quotation.project.siteAddress ? (
              <Text style={styles.infoSub}>Site: {quotation.project.siteAddress}</Text>
            ) : null}
            <Text style={styles.infoSub}>Issued: {quotation.issueDate}</Text>
            {quotation.validUntil ? (
              <Text style={styles.infoSub}>Valid Until: {quotation.validUntil}</Text>
            ) : null}
          </View>
        </View>

        {/* Materials Table Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="cube-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionCardTitle}>Materials ({materials.length})</Text>
          </View>

          {materials.length === 0 ? (
            <Text style={styles.emptyItemsText}>No material line items</Text>
          ) : (
            materials.map((item, idx) => (
              <View key={item.id || idx} style={styles.itemRow}>
                <View style={styles.itemMainCol}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemSub}>
                    Qty: {item.quantity} {item.unit}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Labour Table Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <MaterialCommunityIcons name="wrench-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionCardTitle}>Labour Items ({labour.length})</Text>
          </View>

          {labour.length === 0 ? (
            <Text style={styles.emptyItemsText}>No labour line items</Text>
          ) : (
            labour.map((item, idx) => (
              <View key={item.id || idx} style={styles.itemRow}>
                <View style={styles.itemMainCol}>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                  <Text style={styles.itemSub}>
                    Qty: {item.quantity} {item.unit}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* List Summary Card */}
        <View style={styles.totalsCard}>
          <View style={styles.grandTotalBox}>
            <Text style={styles.grandTotalLabel}>Total Material & Work Items:</Text>
            <Text style={styles.grandTotalVal}>{quotation.lineItems.length}</Text>
          </View>
        </View>

        {/* Notes & Terms Card */}
        {(quotation.notes || quotation.terms) && (
          <View style={styles.notesCard}>
            {quotation.notes ? (
              <View style={styles.notesSection}>
                <Text style={styles.notesTitle}>Notes:</Text>
                <Text style={styles.notesText}>{quotation.notes}</Text>
              </View>
            ) : null}

            {quotation.terms ? (
              <View style={styles.notesSection}>
                <Text style={styles.notesTitle}>Terms & Conditions:</Text>
                <Text style={styles.notesText}>{quotation.terms}</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Docked Primary Actions Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/quotations/${quotationId}/edit` as any)}
        >
          <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.accent} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={handleSharePdf}
          disabled={generatingPdf}
        >
          {generatingPdf ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <>
              <MaterialCommunityIcons name="share-variant" size={22} color={Colors.textInverse} />
              <Text style={styles.shareBtnText}>Share PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.bg0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  errorTitle: {
    fontSize: Typography.lg,
    color: Colors.error,
    fontFamily: Typography.fontBold,
  },
  backBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  backBtnText: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bg1,
  },
  headerBtn: {
    padding: Spacing.xs,
  },
  headerTitleCol: {
    flex: 1,
    alignItems: 'center',
  },
  headerRef: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  headerIconBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.md,
    paddingBottom: 100,
  },
  statusBanner: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.textSecondary,
  },
  statusBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statusBadgeText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  statusActionsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bg2,
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: Colors.accent,
  },
  statusBtnActiveSuccess: {
    backgroundColor: Colors.success,
  },
  statusBtnActiveDanger: {
    backgroundColor: Colors.error,
  },
  statusBtnText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  modeCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  modeTitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  modeSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: 3,
    gap: 4,
  },
  modeSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radius.sm,
    gap: 6,
  },
  modeSegmentActive: {
    backgroundColor: Colors.accent,
  },
  modeSegmentText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  modeSegmentTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontBold,
  },
  infoCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
  },
  infoCol: {
    flex: 1,
    gap: 2,
  },
  infoDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  infoHeading: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
    marginBottom: 2,
  },
  infoName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  infoSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  sectionCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  sectionCardTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  emptyItemsText: {
    fontSize: Typography.sm,
    color: Colors.textDisabled,
    fontStyle: 'italic',
    paddingVertical: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  itemMainCol: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  itemDesc: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  itemSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  itemTotal: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  totalsCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  totalVal: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
  },
  subtotalBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    marginTop: 2,
  },
  totalLabelBold: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
  },
  totalValBold: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
  },
  discountLabel: {
    fontSize: Typography.sm,
    color: Colors.error,
    fontFamily: Typography.fontMedium,
  },
  discountVal: {
    fontSize: Typography.sm,
    color: Colors.error,
    fontFamily: Typography.fontBold,
  },
  grandTotalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.accentLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  grandTotalLabel: {
    fontSize: Typography.lg,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  grandTotalVal: {
    fontSize: Typography.xl,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  notesCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  notesSection: {
    gap: 2,
  },
  notesTitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
    color: Colors.textSecondary,
  },
  notesText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontRegular,
    color: Colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.bg1,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.base,
    flexDirection: 'row',
    gap: Spacing.md,
    ...Shadow.lg,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    gap: Spacing.xs,
  },
  editBtnText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    height: 48,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    ...Shadow.accent,
  },
  shareBtnText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textInverse,
  },
});
