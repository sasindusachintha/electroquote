// app/(tabs)/quotations/new/edit.tsx — Quotation Builder Screen (New / Edit Draft)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

import { useSQLiteContext } from 'expo-sqlite';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../../src/constants/theme';
import { useQuotationDraftStore } from '../../../../src/stores/quotationDraftStore';
import { BusinessProfileRepository } from '../../../../src/db/repositories/BusinessProfileRepository';
import { QuotationRepository } from '../../../../src/db/repositories/QuotationRepository';
import { generateUUID } from '../../../../src/utils/id';
import { useCustomers } from '../../../../src/hooks/useCustomers';
import { useProjects } from '../../../../src/hooks/useProjects';

import { TotalsFooter } from '../../../../src/components/quotations/TotalsFooter';
import { QuotationLineItemRow } from '../../../../src/components/quotations/QuotationLineItemRow';
import { ItemPickerModal } from '../../../../src/components/quotations/ItemPickerModal';

import type {
  BusinessProfile,
  AssemblyDetail,
  MaterialWithCategory,
  LabourItem,
  DraftLineItem,
} from '../../../../src/types/models';

export default function QuotationBuilderScreen() {
  const db = useSQLiteContext();
  const { customerId: paramCustId, projectId: paramProjId, id: paramId } = useLocalSearchParams<{
    customerId?: string;
    projectId?: string;
    id?: string;
  }>();

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Store & Hooks
  const {
    draft,
    totals,
    initNewDraft,
    loadDraft,
    setCustomer,
    setProject,
    setTitle,
    addAssembly,
    addMaterial,
    addLabour,
    updateLine,
    removeLine,
    setVat,
    resetDraft,
  } = useQuotationDraftStore();

  const { data: customers = [] } = useCustomers();
  const { data: customerProjects = [] } = useProjects(undefined, draft.customerId);

  const selectedCustomer = customers.find((c) => c.id === draft.customerId);
  const selectedProject = customerProjects.find((p) => p.id === draft.projectId);

  // Load Business Profile & Init Draft
  useEffect(() => {
    async function loadProfile() {
      const repo = new BusinessProfileRepository(db);
      const profile = await repo.get();
      setBusinessProfile(profile);

      const quotationId = paramId ? parseInt(paramId, 10) : undefined;
      const custId = paramCustId ? parseInt(paramCustId, 10) : undefined;
      const projId = paramProjId ? parseInt(paramProjId, 10) : undefined;

      if (quotationId) {
        // EDIT mode — load existing quotation into draft
        const qRepo = new QuotationRepository(db);
        const detail = await qRepo.getById(quotationId);
        if (detail) {
          const sectionLocalId = generateUUID();
          loadDraft({
            quotationId: detail.id,
            projectId: detail.projectId,
            customerId: detail.customerId,
            title: detail.title ?? '',
            sections: [
              {
                localId: sectionLocalId,
                dbId: detail.sections[0]?.id,
                name: detail.sections[0]?.name ?? 'General',
                sortOrder: 0,
                lineItems: detail.lineItems.map((li) => ({
                  localId: generateUUID(),
                  dbId: li.id,
                  sourceType: li.sourceType,
                  sourceId: li.sourceId,
                  assemblyInstanceId: li.assemblyInstanceId,
                  description: li.description,
                  unit: li.unit,
                  quantity: li.quantity,
                  unitCost: li.unitCost,
                  markupPct: li.markupPct,
                  unitPrice: li.unitPrice,
                  lineTotal: li.lineTotal,
                  priceOverridden: li.priceOverridden,
                  lineDiscountType: li.lineDiscountType,
                  lineDiscountValue: li.lineDiscountValue,
                  isMaterial: li.isMaterial,
                  sortOrder: li.sortOrder,
                })),
              },
            ],
            discountType: detail.discountType,
            discountValue: detail.discountValue,
            discountNote: detail.discountNote ?? '',
            vatEnabled: detail.vatEnabled,
            vatPct: detail.vatPct,
            notes: detail.notes ?? '',
            terms: detail.terms ?? '',
            isDirty: false,
          });
        }
      } else if (!draft.customerId || custId) {
        // NEW mode
        initNewDraft(custId, projId, profile);
      }
    }
    loadProfile();
  }, [paramId, paramCustId, paramProjId]);

  // Handlers for adding items
  function handleAddAssembly(assembly: AssemblyDetail, multiplier: number) {
    if (!businessProfile) return;
    addAssembly(assembly, multiplier, businessProfile);
    showMessage({ message: `Added ${multiplier} × "${assembly.name}" to draft`, type: 'success' });
  }

  function handleAddMaterial(material: MaterialWithCategory, quantity: number) {
    if (!businessProfile) return;
    addMaterial(material, quantity, businessProfile);
    showMessage({ message: `Added ${quantity} ${material.unit} of "${material.name}"`, type: 'success' });
  }

  function handleAddLabour(item: LabourItem, quantity: number) {
    addLabour(item, quantity);
    showMessage({ message: `Added ${quantity} ${item.unit} of "${item.name}"`, type: 'success' });
  }

  // Handlers for line updates
  function handleUpdateQty(sectionLocalId: string, lineLocalId: string, qty: number) {
    updateLine(sectionLocalId, lineLocalId, { quantity: Math.max(0.1, qty) });
  }

  function handleUpdateUnitPrice(sectionLocalId: string, lineLocalId: string, price: number) {
    updateLine(sectionLocalId, lineLocalId, { unitPrice: Math.max(0, price), priceOverridden: true });
  }

  function handleRemoveLine(sectionLocalId: string, lineLocalId: string) {
    removeLine(sectionLocalId, lineLocalId);
    showMessage({ message: 'Line item removed', type: 'info' });
  }

  // Save Quotation Draft to SQLite
  async function handleSaveDraft() {
    if (!draft.customerId) {
      setShowCustomerPicker(true);
      showMessage({ message: 'Please select a customer for this quotation', type: 'warning' });
      return;
    }
    if (!draft.projectId) {
      setShowProjectPicker(true);
      showMessage({ message: 'Please select a project for this quotation', type: 'warning' });
      return;
    }

    setIsSaving(true);
    try {
      const qRepo = new QuotationRepository(db);
      // Pass undefined \u2014 saveDraft generates the ref number atomically
      // inside its own transaction, avoiding a nested withTransactionAsync crash.
      const currencySymbol = businessProfile?.currencySymbol || 'Rs.';

      const savedId = await qRepo.saveDraft(
        draft,
        undefined,
        currencySymbol,
        undefined, // validUntil default
        'detailed'
      );

      // Fetch the generated reference number for the success toast
      const saved = await qRepo.getById(savedId);
      const refNo = saved?.referenceNo ?? '';

      showMessage({
        message: `Quotation ${refNo} saved successfully!`,
        type: 'success',
      });

      resetDraft();
      router.back();
    } catch (err) {
      console.error('Failed to save quotation:', err);
      showMessage({ message: 'Failed to save quotation', type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  }

  if (!businessProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  // Flatten line items from sections into Materials and Labour lists
  const currentSection = draft.sections[0]; // Primary general section
  const lineItems = currentSection?.lineItems || [];
  const materialLines = lineItems.filter((l) => l.isMaterial);
  const labourLines = lineItems.filter((l) => !l.isMaterial);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Material List Builder</Text>
          <Text style={styles.headerSubtitle}>
            {lineItems.length} total items in list
          </Text>
        </View>
        <TouchableOpacity style={styles.addSectionBtn} onPress={() => setShowItemPicker(true)}>
          <MaterialCommunityIcons name="plus" size={20} color={Colors.textInverse} />
          <Text style={styles.addSectionText}>Add Items</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Customer & Project Header Card */}
        <View style={styles.clientCard}>
          <TouchableOpacity style={styles.clientSelectorRow} onPress={() => setShowCustomerPicker(true)}>
            <View style={styles.clientCol}>
              <Text style={styles.clientLabel}>CLIENT / CUSTOMER</Text>
              <Text style={styles.clientName}>
                {selectedCustomer ? `👤 ${selectedCustomer.name}` : 'Tap to select customer...'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.accent} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.clientSelectorRow} onPress={() => setShowProjectPicker(true)}>
            <View style={styles.clientCol}>
              <Text style={styles.clientLabel}>PROJECT</Text>
              <Text style={styles.projectName}>
                {selectedProject ? `📁 ${selectedProject.name}` : 'Tap to select project...'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Item Picker Launch Bar */}
        <View style={styles.launcherBar}>
          <TouchableOpacity style={styles.launchBtn} onPress={() => setShowItemPicker(true)}>
            <MaterialCommunityIcons name="lightning-bolt-circle" size={18} color={Colors.accent} />
            <Text style={styles.launchBtnText}>+ Assembly</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.launchBtn} onPress={() => setShowItemPicker(true)}>
            <MaterialCommunityIcons name="package-variant" size={18} color={Colors.accent} />
            <Text style={styles.launchBtnText}>+ Material</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.launchBtn} onPress={() => setShowItemPicker(true)}>
            <MaterialCommunityIcons name="wrench" size={18} color={Colors.info} />
            <Text style={styles.launchBtnText}>+ Labour</Text>
          </TouchableOpacity>
        </View>

        {/* Materials Section List */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📦 Materials ({materialLines.length})</Text>
          </View>

          {materialLines.map((line) => (
            <QuotationLineItemRow
              key={line.localId}
              item={line}
              sectionLocalId={currentSection.localId}
              onUpdateQty={(qty) => handleUpdateQty(currentSection.localId, line.localId, qty)}
              onUpdateUnitPrice={(price) => handleUpdateUnitPrice(currentSection.localId, line.localId, price)}
              onRemove={() => handleRemoveLine(currentSection.localId, line.localId)}
            />
          ))}

          {materialLines.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyBlockText}>No materials added yet.</Text>
            </View>
          ) : null}
        </View>

        {/* Labour Section List */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🔧 Labour Items ({labourLines.length})</Text>
          </View>

          {labourLines.map((line) => (
            <QuotationLineItemRow
              key={line.localId}
              item={line}
              sectionLocalId={currentSection.localId}
              onUpdateQty={(qty) => handleUpdateQty(currentSection.localId, line.localId, qty)}
              onUpdateUnitPrice={(price) => handleUpdateUnitPrice(currentSection.localId, line.localId, price)}
              onRemove={() => handleRemoveLine(currentSection.localId, line.localId)}
            />
          ))}

          {labourLines.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyBlockText}>No labour items added yet.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Persistent Docked Totals Footer */}
      <TotalsFooter
        totals={totals}
        currencySymbol={businessProfile.currencySymbol}
        discountType={draft.discountType}
        discountValue={draft.discountValue}
        discountNote={draft.discountNote}
        vatEnabled={draft.vatEnabled}
        vatPct={draft.vatPct}
        onOpenDiscount={() => router.push('/(modals)/discount-modal' as any)}
        onToggleVat={(enabled) => setVat(enabled, businessProfile.defaultVatPct)}
        onSave={handleSaveDraft}
        isSaving={isSaving}
      />

      {/* Item Picker Modal */}
      <ItemPickerModal
        visible={showItemPicker}
        onClose={() => setShowItemPicker(false)}
        businessProfile={businessProfile}
        onAddAssembly={handleAddAssembly}
        onAddMaterial={handleAddMaterial}
        onAddLabour={handleAddLabour}
      />

      {/* Customer Picker Overlay */}
      {showCustomerPicker ? (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setShowCustomerPicker(false)}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {customers.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.pickerRow}
                  onPress={() => {
                    setCustomer(c.id);
                    setShowCustomerPicker(false);
                  }}
                >
                  <Text style={styles.pickerRowText}>👤 {c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {/* Project Picker Overlay */}
      {showProjectPicker ? (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Project</Text>
              <TouchableOpacity onPress={() => setShowProjectPicker(false)}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {customerProjects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.pickerRow}
                  onPress={() => {
                    setProject(p.id);
                    setShowProjectPicker(false);
                  }}
                >
                  <Text style={styles.pickerRowText}>📁 {p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}
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
  headerTitleCol: { flex: 1, paddingHorizontal: Spacing.sm },
  headerTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  addSectionBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    ...Shadow.accent,
  },
  addSectionText: {
    color: Colors.textInverse,
    fontSize: Typography.xs,
    fontFamily: Typography.fontBold,
  },
  content: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  clientCard: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  clientSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  clientCol: { flex: 1 },
  clientLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  clientName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.accent,
    marginTop: Spacing.xxs,
  },
  projectName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
  launcherBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  launchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    ...Shadow.sm,
  },
  launchBtnText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  sectionBlock: {
    gap: Spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  sectionSubtotal: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.accent,
  },
  emptyBlock: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyBlockText: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  pickerModal: {
    backgroundColor: Colors.bg1,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.base,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  pickerRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerRowText: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
  },
});
