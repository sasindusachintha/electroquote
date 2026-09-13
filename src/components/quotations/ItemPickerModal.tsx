// src/components/quotations/ItemPickerModal.tsx — Unified Fast Item Picker Modal

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { useAssemblies } from '../../hooks/useAssemblies';
import { useMaterials } from '../../hooks/useMaterials';
import { useLabourItems } from '../../hooks/useLabour';
import { useCategories } from '../../hooks/useCategories';
import { CategorySelector } from '../catalogue/CategorySelector';
import { PricingService } from '../../services/PricingService';
import type {
  AssemblyDetail,
  MaterialWithCategory,
  LabourItem,
  BusinessProfile,
} from '../../types/models';

type PickerTab = 'assemblies' | 'materials' | 'labour';

interface ItemPickerModalProps {
  visible: boolean;
  onClose: () => void;
  businessProfile: BusinessProfile;
  onAddAssembly: (assembly: AssemblyDetail, multiplier: number) => void;
  onAddMaterial: (material: MaterialWithCategory, quantity: number) => void;
  onAddLabour: (item: LabourItem, quantity: number) => void;
}

export function ItemPickerModal({
  visible,
  onClose,
  businessProfile,
  onAddAssembly,
  onAddMaterial,
  onAddLabour,
}: ItemPickerModalProps) {
  const [activeTab, setActiveTab] = useState<PickerTab>('assemblies');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  // Sub-modal for entering quantity/multiplier
  const [pendingAssembly, setPendingAssembly] = useState<AssemblyDetail | null>(null);
  const [pendingMaterial, setPendingMaterial] = useState<MaterialWithCategory | null>(null);
  const [pendingLabour, setPendingLabour] = useState<LabourItem | null>(null);
  const [inputQty, setInputQty] = useState(1);

  // Data Queries
  const { data: categories = [] } = useCategories();
  const { data: assemblies = [] } = useAssemblies(
    activeTab === 'assemblies' ? searchQuery : undefined,
    activeTab === 'assemblies' ? selectedCategoryId : undefined
  );
  const { data: materials = [] } = useMaterials(
    activeTab === 'materials' ? searchQuery : undefined,
    activeTab === 'materials' ? selectedCategoryId : undefined
  );
  const { data: labourItems = [] } = useLabourItems(
    activeTab === 'labour' ? searchQuery : undefined
  );

  function handleSelectAssembly(assembly: AssemblyDetail) {
    setPendingAssembly(assembly);
    setInputQty(10); // default demo quantity for assembly e.g. 10x
  }

  function handleConfirmAssembly() {
    if (pendingAssembly) {
      onAddAssembly(pendingAssembly, inputQty);
      setPendingAssembly(null);
      onClose();
    }
  }

  function handleSelectMaterial(mat: MaterialWithCategory) {
    setPendingMaterial(mat);
    setInputQty(1);
  }

  function handleConfirmMaterial() {
    if (pendingMaterial) {
      onAddMaterial(pendingMaterial, inputQty);
      setPendingMaterial(null);
      onClose();
    }
  }

  function handleSelectLabour(lab: LabourItem) {
    setPendingLabour(lab);
    setInputQty(1);
  }

  function handleConfirmLabour() {
    if (pendingLabour) {
      onAddLabour(pendingLabour, inputQty);
      setPendingLabour(null);
      onClose();
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Items to Quote</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Top Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'assemblies' && styles.tabActive]}
              onPress={() => {
                setActiveTab('assemblies');
                setSearchQuery('');
              }}
            >
              <MaterialCommunityIcons
                name="lightning-bolt-circle"
                size={16}
                color={activeTab === 'assemblies' ? Colors.accent : Colors.textSecondary}
              />
              <Text style={[styles.tabLabel, activeTab === 'assemblies' && styles.tabLabelActive]}>
                Assemblies
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'materials' && styles.tabActive]}
              onPress={() => {
                setActiveTab('materials');
                setSearchQuery('');
              }}
            >
              <MaterialCommunityIcons
                name="package-variant"
                size={16}
                color={activeTab === 'materials' ? Colors.accent : Colors.textSecondary}
              />
              <Text style={[styles.tabLabel, activeTab === 'materials' && styles.tabLabelActive]}>
                Materials
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'labour' && styles.tabActive]}
              onPress={() => {
                setActiveTab('labour');
                setSearchQuery('');
              }}
            >
              <MaterialCommunityIcons
                name="wrench"
                size={16}
                color={activeTab === 'labour' ? Colors.accent : Colors.textSecondary}
              />
              <Text style={[styles.tabLabel, activeTab === 'labour' && styles.tabLabelActive]}>
                Labour
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor={Colors.textDisabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Category Selector Chips (Assemblies & Materials) */}
          {activeTab !== 'labour' ? (
            <CategorySelector
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          ) : null}

          {/* Item List */}
          <ScrollView style={styles.listContent}>
            {activeTab === 'assemblies' ? (
              assemblies.map((asm) => (
                <TouchableOpacity
                  key={asm.id}
                  style={styles.itemRow}
                  onPress={() => handleSelectAssembly(asm)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{asm.name}</Text>
                    <Text style={styles.itemSub}>
                      per {asm.unit} · {asm.materialLines.length} materials · {asm.labourLines.length} labour
                    </Text>
                  </View>
                  <View style={styles.addIconBadge}>
                    <MaterialCommunityIcons name="plus" size={18} color={Colors.textInverse} />
                  </View>
                </TouchableOpacity>
              ))
            ) : activeTab === 'materials' ? (
              materials.map((mat) => {
                const sellPrice = PricingService.calculateSellPrice(
                  mat.costPrice,
                  mat.markupPct,
                  mat.category?.defaultMarkupPct,
                  businessProfile.defaultMarkupPct
                );
                return (
                  <TouchableOpacity
                    key={mat.id}
                    style={styles.itemRow}
                    onPress={() => handleSelectMaterial(mat)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{mat.name}</Text>
                      <Text style={styles.itemSub}>
                        Rs. {sellPrice.toLocaleString()} / {mat.unit} · {mat.category?.name || 'General'}
                      </Text>
                    </View>
                    <View style={styles.addIconBadge}>
                      <MaterialCommunityIcons name="plus" size={18} color={Colors.textInverse} />
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              labourItems.map((lab) => (
                <TouchableOpacity
                  key={lab.id}
                  style={styles.itemRow}
                  onPress={() => handleSelectLabour(lab)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{lab.name}</Text>
                    <Text style={styles.itemSub}>
                      Rs. {lab.unitRate.toLocaleString()} / {lab.unit}
                    </Text>
                  </View>
                  <View style={styles.addIconBadge}>
                    <MaterialCommunityIcons name="plus" size={18} color={Colors.textInverse} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Sub-modal: Assembly Multiplier Sheet */}
          {pendingAssembly ? (
            <View style={styles.qtyOverlay}>
              <View style={styles.qtyBox}>
                <Text style={styles.qtyTitle}>Add Assembly: {pendingAssembly.name}</Text>
                <Text style={styles.qtySubtitle}>How many {pendingAssembly.unit}s?</Text>

                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setInputQty((q) => Math.max(1, q - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={20} color={Colors.accent} />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.counterInput}
                    keyboardType="numeric"
                    value={String(inputQty)}
                    onChangeText={(val) => setInputQty(parseInt(val, 10) || 1)}
                  />

                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setInputQty((q) => q + 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setPendingAssembly(null)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmAssembly}>
                    <Text style={styles.confirmText}>Add {inputQty} × to Quote</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          {/* Sub-modal: Material Qty Sheet */}
          {pendingMaterial ? (
            <View style={styles.qtyOverlay}>
              <View style={styles.qtyBox}>
                <Text style={styles.qtyTitle}>Add Material: {pendingMaterial.name}</Text>
                <Text style={styles.qtySubtitle}>Quantity ({pendingMaterial.unit}):</Text>

                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setInputQty((q) => Math.max(1, q - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={20} color={Colors.accent} />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.counterInput}
                    keyboardType="numeric"
                    value={String(inputQty)}
                    onChangeText={(val) => setInputQty(parseFloat(val) || 1)}
                  />

                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setInputQty((q) => q + 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setPendingMaterial(null)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmMaterial}>
                    <Text style={styles.confirmText}>Add {inputQty} {pendingMaterial.unit} to Quote</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          {/* Sub-modal: Labour Qty Sheet */}
          {pendingLabour ? (
            <View style={styles.qtyOverlay}>
              <View style={styles.qtyBox}>
                <Text style={styles.qtyTitle}>Add Labour: {pendingLabour.name}</Text>
                <Text style={styles.qtySubtitle}>Quantity ({pendingLabour.unit}):</Text>

                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setInputQty((q) => Math.max(1, q - 1))}
                  >
                    <MaterialCommunityIcons name="minus" size={20} color={Colors.accent} />
                  </TouchableOpacity>

                  <TextInput
                    style={styles.counterInput}
                    keyboardType="numeric"
                    value={String(inputQty)}
                    onChangeText={(val) => setInputQty(parseFloat(val) || 1)}
                  />

                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setInputQty((q) => q + 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalActionRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setPendingLabour(null)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmLabour}>
                    <Text style={styles.confirmText}>Add {inputQty} {pendingLabour.unit} to Quote</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bg0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '85%',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  closeBtn: { padding: Spacing.xs },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    borderRadius: Radius.sm,
  },
  tabActive: {
    backgroundColor: Colors.bg3,
  },
  tabLabel: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  tabLabelActive: {
    color: Colors.accent,
    fontFamily: Typography.fontSemiBold,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 40,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.sm,
  },
  listContent: {
    maxHeight: 350,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemName: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  itemSub: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },
  addIconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.accent,
  },
  qtyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  qtyBox: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    width: '100%',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    ...Shadow.lg,
  },
  qtyTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  qtySubtitle: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterInput: {
    width: 64,
    height: 40,
    backgroundColor: Colors.bg3,
    borderRadius: Radius.sm,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
  },
  confirmBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  confirmText: {
    color: Colors.textInverse,
    fontSize: Typography.sm,
    fontFamily: Typography.fontBold,
  },
});
