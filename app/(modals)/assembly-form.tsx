// app/(modals)/assembly-form.tsx — Assembly Recipe Builder Modal

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { showMessage } from 'react-native-flash-message';

import { Colors, Typography, Spacing, Radius, Shadow } from '../../src/constants/theme';
import { useCategories } from '../../src/hooks/useCategories';
import { useMaterials } from '../../src/hooks/useMaterials';
import { useLabourItems } from '../../src/hooks/useLabour';
import {
  useAssembly,
  useCreateAssembly,
  useUpdateAssembly,
} from '../../src/hooks/useAssemblies';
import type {
  AssemblyInput,
  MaterialWithCategory,
  LabourItem,
} from '../../src/types/models';

const UNITS = ['point', 'socket', 'fan', 'job', 'm', 'set', 'item'];

interface SelectedMaterialLine {
  materialId: number;
  materialName: string;
  unit: string;
  quantity: number;
  includeWastage: boolean;
}

interface SelectedLabourLine {
  labourItemId: number;
  labourName: string;
  unit: string;
  quantity: number;
}

export default function AssemblyFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const assemblyId = id ? parseInt(id, 10) : undefined;
  const isEditing = !!assemblyId;

  const { data: categories = [] } = useCategories();
  const { data: allMaterials = [] } = useMaterials();
  const { data: allLabour = [] } = useLabourItems();
  const { data: existingAssembly, isLoading: loadingAssembly } = useAssembly(assemblyId);

  const createMutation = useCreateAssembly();
  const updateMutation = useUpdateAssembly();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState('point');
  const [isFavourite, setIsFavourite] = useState(false);

  const [materialLines, setMaterialLines] = useState<SelectedMaterialLine[]>([]);
  const [labourLines, setLabourLines] = useState<SelectedLabourLine[]>([]);

  // Picker States
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [showLabourPicker, setShowLabourPicker] = useState(false);

  useEffect(() => {
    if (existingAssembly) {
      setName(existingAssembly.name);
      setDescription(existingAssembly.description || '');
      setCategoryId(existingAssembly.categoryId);
      setUnit(existingAssembly.unit || 'point');
      setIsFavourite(existingAssembly.isFavourite);

      setMaterialLines(
        existingAssembly.materialLines.map((ml) => ({
          materialId: ml.materialId,
          materialName: ml.material?.name || `Material #${ml.materialId}`,
          unit: ml.material?.unit || 'each',
          quantity: ml.quantity,
          includeWastage: ml.includeWastage,
        }))
      );

      setLabourLines(
        existingAssembly.labourLines.map((ll) => ({
          labourItemId: ll.labourItemId,
          labourName: ll.labourItem?.name || `Labour #${ll.labourItemId}`,
          unit: ll.labourItem?.unit || 'point',
          quantity: ll.quantity,
        }))
      );
    }
  }, [existingAssembly]);

  // Handlers for adding/removing materials
  function addMaterialToRecipe(mat: MaterialWithCategory) {
    if (materialLines.some((l) => l.materialId === mat.id)) {
      showMessage({ message: 'Material already added to recipe', type: 'warning' });
      return;
    }
    setMaterialLines((prev) => [
      ...prev,
      {
        materialId: mat.id,
        materialName: mat.name,
        unit: mat.unit,
        quantity: 1,
        includeWastage: true,
      },
    ]);
    setShowMaterialPicker(false);
  }

  function removeMaterialLine(materialId: number) {
    setMaterialLines((prev) => prev.filter((l) => l.materialId !== materialId));
  }

  function updateMaterialQty(materialId: number, qty: number) {
    setMaterialLines((prev) =>
      prev.map((l) => (l.materialId === materialId ? { ...l, quantity: Math.max(0.1, qty) } : l))
    );
  }

  // Handlers for adding/removing labour
  function addLabourToRecipe(lab: LabourItem) {
    if (labourLines.some((l) => l.labourItemId === lab.id)) {
      showMessage({ message: 'Labour item already added to recipe', type: 'warning' });
      return;
    }
    setLabourLines((prev) => [
      ...prev,
      {
        labourItemId: lab.id,
        labourName: lab.name,
        unit: lab.unit,
        quantity: 1,
      },
    ]);
    setShowLabourPicker(false);
  }

  function removeLabourLine(labourItemId: number) {
    setLabourLines((prev) => prev.filter((l) => l.labourItemId !== labourItemId));
  }

  function updateLabourQty(labourItemId: number, qty: number) {
    setLabourLines((prev) =>
      prev.map((l) => (l.labourItemId === labourItemId ? { ...l, quantity: Math.max(0.1, qty) } : l))
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showMessage({ message: 'Assembly name is required', type: 'danger' });
      return;
    }
    if (materialLines.length === 0 && labourLines.length === 0) {
      showMessage({ message: 'Add at least one material or labour item to recipe', type: 'danger' });
      return;
    }

    const payload: AssemblyInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId,
      unit,
      isFavourite,
      materialLines: materialLines.map((ml, idx) => ({
        materialId: ml.materialId,
        quantity: ml.quantity,
        includeWastage: ml.includeWastage,
        sortOrder: idx + 1,
      })),
      labourLines: labourLines.map((ll, idx) => ({
        labourItemId: ll.labourItemId,
        quantity: ll.quantity,
        sortOrder: idx + 1,
      })),
    };

    try {
      if (isEditing && assemblyId) {
        await updateMutation.mutateAsync({ id: assemblyId, input: payload });
        showMessage({ message: 'Assembly recipe updated', type: 'success' });
      } else {
        await createMutation.mutateAsync(payload);
        showMessage({ message: 'New assembly recipe created', type: 'success' });
      }
      router.back();
    } catch (err) {
      console.error('Failed to save assembly:', err);
      showMessage({ message: 'Failed to save assembly', type: 'danger' });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (loadingAssembly) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Assembly Recipe' : 'New Assembly Recipe'}
        </Text>
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.disabledBtn]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.textInverse} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        {/* Assembly Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Assembly Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 13A Double Socket Point"
            placeholderTextColor={Colors.textDisabled}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Category & Unit */}
        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setCategoryId(cat.id)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Recipe Unit */}
        <View style={styles.field}>
          <Text style={styles.label}>Assembly Unit (e.g. per point, socket, fan)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {UNITS.map((u) => {
              const isSelected = unit === u;
              return (
                <TouchableOpacity
                  key={u}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Complete socket outlet with box, cable, conduit, and labour"
            placeholderTextColor={Colors.textDisabled}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Favorite Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Mark as Favourite Template</Text>
          <Switch
            value={isFavourite}
            onValueChange={setIsFavourite}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Colors.white}
          />
        </View>

        {/* Included Materials Recipe Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📦 Materials in Recipe ({materialLines.length})</Text>
            <TouchableOpacity
              style={styles.addSmallBtn}
              onPress={() => setShowMaterialPicker(true)}
            >
              <MaterialCommunityIcons name="plus" size={16} color={Colors.accent} />
              <Text style={styles.addSmallBtnText}>Add Material</Text>
            </TouchableOpacity>
          </View>

          {materialLines.map((ml) => (
            <View key={ml.materialId} style={styles.itemEditRow}>
              <View style={styles.itemEditInfo}>
                <Text style={styles.itemEditName}>{ml.materialName}</Text>
                <Text style={styles.unitSub}>{ml.unit}</Text>
              </View>

              <View style={styles.qtyControl}>
                <Text style={styles.qtyLabel}>Base Qty:</Text>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={String(ml.quantity)}
                  onChangeText={(val) => updateMaterialQty(ml.materialId, parseFloat(val) || 0)}
                />
              </View>

              <TouchableOpacity onPress={() => removeMaterialLine(ml.materialId)}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {materialLines.length === 0 ? (
            <Text style={styles.emptyRecipeText}>No materials added to recipe yet.</Text>
          ) : null}
        </View>

        {/* Included Labour Recipe Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🔧 Labour Items in Recipe ({labourLines.length})</Text>
            <TouchableOpacity
              style={styles.addSmallBtn}
              onPress={() => setShowLabourPicker(true)}
            >
              <MaterialCommunityIcons name="plus" size={16} color={Colors.accent} />
              <Text style={styles.addSmallBtnText}>Add Labour</Text>
            </TouchableOpacity>
          </View>

          {labourLines.map((ll) => (
            <View key={ll.labourItemId} style={styles.itemEditRow}>
              <View style={styles.itemEditInfo}>
                <Text style={styles.itemEditName}>{ll.labourName}</Text>
                <Text style={styles.unitSub}>{ll.unit}</Text>
              </View>

              <View style={styles.qtyControl}>
                <Text style={styles.qtyLabel}>Base Qty:</Text>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={String(ll.quantity)}
                  onChangeText={(val) => updateLabourQty(ll.labourItemId, parseFloat(val) || 0)}
                />
              </View>

              <TouchableOpacity onPress={() => removeLabourLine(ll.labourItemId)}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))}

          {labourLines.length === 0 ? (
            <Text style={styles.emptyRecipeText}>No labour items added to recipe yet.</Text>
          ) : null}
        </View>
      </ScrollView>

      {/* Material Picker Modal Overlay */}
      {showMaterialPicker ? (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Material for Recipe</Text>
              <TouchableOpacity onPress={() => setShowMaterialPicker(false)}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {allMaterials.map((mat) => (
                <TouchableOpacity
                  key={mat.id}
                  style={styles.pickerRow}
                  onPress={() => addMaterialToRecipe(mat)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerItemName}>{mat.name}</Text>
                    <Text style={styles.pickerItemSub}>
                      {mat.category?.name || 'General'} · {mat.unit}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="plus-circle-outline" size={22} color={Colors.accent} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {/* Labour Picker Modal Overlay */}
      {showLabourPicker ? (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Labour Item for Recipe</Text>
              <TouchableOpacity onPress={() => setShowLabourPicker(false)}>
                <MaterialCommunityIcons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {allLabour.map((lab) => (
                <TouchableOpacity
                  key={lab.id}
                  style={styles.pickerRow}
                  onPress={() => addLabourToRecipe(lab)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pickerItemName}>{lab.name}</Text>
                    <Text style={styles.pickerItemSub}>Rs. {lab.unitRate} / {lab.unit}</Text>
                  </View>
                  <MaterialCommunityIcons name="plus-circle-outline" size={22} color={Colors.accent} />
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
  headerTitle: {
    fontSize: Typography.md,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    ...Shadow.accent,
  },
  saveBtnText: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textInverse,
  },
  disabledBtn: { opacity: 0.6 },
  formContent: {
    padding: Spacing.base,
    gap: Spacing.lg,
  },
  field: { gap: Spacing.xs },
  row: { flexDirection: 'row', gap: Spacing.md },
  flex1: { flex: 1 },
  label: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textSecondary,
  },
  required: { color: Colors.error },
  input: {
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontRegular,
  },
  chipRow: { gap: Spacing.xs, paddingVertical: Spacing.xxs },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  chipTextActive: {
    color: Colors.textInverse,
    fontFamily: Typography.fontSemiBold,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleLabel: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  sectionCard: {
    backgroundColor: Colors.bg2,
    borderRadius: Radius.md,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontSemiBold,
    color: Colors.textPrimary,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xxs,
    backgroundColor: Colors.bg3,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addSmallBtnText: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontSemiBold,
    color: Colors.accent,
  },
  itemEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg1,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    gap: Spacing.md,
  },
  itemEditInfo: { flex: 1 },
  itemEditName: {
    fontSize: Typography.sm,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  unitSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qtyLabel: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  qtyInput: {
    width: 50,
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xs,
    textAlign: 'center',
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
    fontSize: Typography.sm,
    paddingVertical: Spacing.xxs,
  },
  emptyRecipeText: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
    fontStyle: 'italic',
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
    maxHeight: '70%',
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
  pickerList: {
    paddingVertical: Spacing.sm,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontMedium,
    color: Colors.textPrimary,
  },
  pickerItemSub: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    marginTop: Spacing.xxs,
  },
});
