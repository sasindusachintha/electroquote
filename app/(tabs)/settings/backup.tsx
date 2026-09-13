// app/(tabs)/settings/backup.tsx — Data Safety, Local Backup & Restore Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme';

export default function BackupScreen() {
  const db = useSQLiteContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);

      // Fetch all tables from SQLite DB
      const profile = await db.getAllAsync('SELECT * FROM business_profile');
      const customers = await db.getAllAsync('SELECT * FROM customers');
      const projects = await db.getAllAsync('SELECT * FROM projects');
      const materials = await db.getAllAsync('SELECT * FROM materials');
      const labourItems = await db.getAllAsync('SELECT * FROM labour_items');
      const assemblies = await db.getAllAsync('SELECT * FROM assemblies');
      const assemblyDetails = await db.getAllAsync('SELECT * FROM assembly_details');
      const quotations = await db.getAllAsync('SELECT * FROM quotations');
      const quotationSections = await db.getAllAsync('SELECT * FROM quotation_sections');
      const quotationLineItems = await db.getAllAsync('SELECT * FROM quotation_line_items');

      const backupPayload = {
        app: 'ElectroQuote',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        data: {
          business_profile: profile,
          customers,
          projects,
          materials,
          labour_items: labourItems,
          assemblies,
          assembly_details: assemblyDetails,
          quotations,
          quotation_sections: quotationSections,
          quotation_line_items: quotationLineItems,
        },
      };

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `electroquote-backup-${dateStr}.json`;
      const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      const filePath = `${cacheDir}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(backupPayload, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export ElectroQuote Backup Data',
          UTI: 'public.json',
        });
      } else {
        Alert.alert('Backup Created', `Backup file created successfully at:\n${filePath}`);
      }
    } catch (err: any) {
      Alert.alert('Backup Failed', err?.message || 'Failed to export backup data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      'Restore Database Backup',
      'Restoring a backup file will replace your current catalogue, customers, and quotations. Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Select Backup File',
          onPress: async () => {
            try {
              setIsImporting(true);
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
              });

              if (result.canceled || !result.assets?.[0]?.uri) {
                setIsImporting(false);
                return;
              }

              const fileUri = result.assets[0].uri;
              const jsonText = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.UTF8,
              });

              const parsed = JSON.parse(jsonText);
              if (!parsed || parsed.app !== 'ElectroQuote' || !parsed.data) {
                throw new Error('Invalid backup file. Please select a valid ElectroQuote backup JSON.');
              }

              const { data } = parsed;

              // Restore database atomically in a single SQLite transaction
              await db.withTransactionAsync(async () => {
                if (data.business_profile && data.business_profile[0]) {
                  const b = data.business_profile[0];
                  await db.runAsync(
                    `UPDATE business_profile SET
                      name=?, trading_name=?, owner_name=?, phone=?, whatsapp_number=?, email=?,
                      address_line1=?, address_line2=?, city=?, postal_code=?, reg_number=?, vat_number=?,
                      logo_uri=?, currency_symbol=?, default_payment_terms=?, default_validity_days=?,
                      bank_name=?, bank_account=?, bank_branch=?, default_vat_enabled=?, default_vat_pct=?,
                      default_markup_pct=?, default_notes=?, pdf_mode=?
                     WHERE id=1`,
                    [
                      b.name, b.trading_name, b.owner_name, b.phone, b.whatsapp_number, b.email,
                      b.address_line1, b.address_line2, b.city, b.postal_code, b.reg_number, b.vat_number,
                      b.logo_uri, b.currency_symbol, b.default_payment_terms, b.default_validity_days,
                      b.bank_name, b.bank_account, b.bank_branch, b.default_vat_enabled, b.default_vat_pct,
                      b.default_markup_pct, b.default_notes, b.pdf_mode,
                    ]
                  );
                }

                if (data.customers) {
                  await db.runAsync('DELETE FROM customers');
                  for (const row of data.customers) {
                    await db.runAsync(
                      `INSERT INTO customers (id, name, company, phone, email, address_line1, address_line2, city, postal_code, notes, is_archived, created_at, updated_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                      [row.id, row.name, row.company, row.phone, row.email, row.address_line1, row.address_line2, row.city, row.postal_code, row.notes, row.is_archived, row.created_at, row.updated_at]
                    );
                  }
                }

                if (data.projects) {
                  await db.runAsync('DELETE FROM projects');
                  for (const row of data.projects) {
                    await db.runAsync(
                      `INSERT INTO projects (id, customer_id, name, site_address, description, status, created_at, updated_at)
                       VALUES (?,?,?,?,?,?,?,?)`,
                      [row.id, row.customer_id, row.name, row.site_address, row.description, row.status, row.created_at, row.updated_at]
                    );
                  }
                }

                if (data.materials) {
                  await db.runAsync('DELETE FROM materials');
                  for (const row of data.materials) {
                    await db.runAsync(
                      `INSERT INTO materials (id, name, category_id, unit, purchase_price, selling_price, brand, code, is_active, created_at, updated_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                      [row.id, row.name, row.category_id, row.unit, row.purchase_price, row.selling_price, row.brand, row.code, row.is_active, row.created_at, row.updated_at]
                    );
                  }
                }

                if (data.labour_items) {
                  await db.runAsync('DELETE FROM labour_items');
                  for (const row of data.labour_items) {
                    await db.runAsync(
                      `INSERT INTO labour_items (id, name, unit, default_rate, is_active, created_at, updated_at)
                       VALUES (?,?,?,?,?,?,?)`,
                      [row.id, row.name, row.unit, row.default_rate, row.is_active, row.created_at, row.updated_at]
                    );
                  }
                }

                if (data.assemblies) {
                  await db.runAsync('DELETE FROM assemblies');
                  for (const row of data.assemblies) {
                    await db.runAsync(
                      `INSERT INTO assemblies (id, name, category_id, description, is_active, is_favourite, unit, created_at, updated_at)
                       VALUES (?,?,?,?,?,?,?,?,?)`,
                      [row.id, row.name, row.category_id, row.description, row.is_active, row.is_favourite, row.unit || 'point', row.created_at, row.updated_at]
                    );
                  }
                }

                if (data.assembly_details) {
                  await db.runAsync('DELETE FROM assembly_details');
                  for (const row of data.assembly_details) {
                    await db.runAsync(
                      `INSERT INTO assembly_details (id, assembly_id, is_material, item_id, quantity, apply_wastage, created_at)
                       VALUES (?,?,?,?,?,?,?)`,
                      [row.id, row.assembly_id, row.is_material, row.item_id, row.quantity, row.apply_wastage, row.created_at]
                    );
                  }
                }

                if (data.quotations) {
                  await db.runAsync('DELETE FROM quotations');
                  for (const row of data.quotations) {
                    await db.runAsync(
                      `INSERT INTO quotations (id, project_id, customer_id, reference_no, title, status, revision, parent_id, issue_date, valid_until, currency_symbol, discount_type, discount_value, discount_note, vat_enabled, vat_pct, pdf_mode, subtotal_materials, subtotal_labour, subtotal_before_discount, discount_amount, subtotal_after_discount, vat_amount, grand_total, notes, terms, pdf_uri, created_at, updated_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                      [
                        row.id, row.project_id, row.customer_id, row.reference_no, row.title, row.status,
                        row.revision, row.parent_id, row.issue_date, row.valid_until, row.currency_symbol,
                        row.discount_type, row.discount_value, row.discount_note, row.vat_enabled, row.vat_pct,
                        row.pdf_mode, row.subtotal_materials, row.subtotal_labour, row.subtotal_before_discount,
                        row.discount_amount, row.subtotal_after_discount, row.vat_amount, row.grand_total,
                        row.notes, row.terms, row.pdf_uri, row.created_at, row.updated_at,
                      ]
                    );
                  }
                }

                if (data.quotation_sections) {
                  await db.runAsync('DELETE FROM quotation_sections');
                  for (const row of data.quotation_sections) {
                    await db.runAsync(
                      `INSERT INTO quotation_sections (id, quotation_id, name, sort_order)
                       VALUES (?,?,?,?)`,
                      [row.id, row.quotation_id, row.name, row.sort_order]
                    );
                  }
                }

                if (data.quotation_line_items) {
                  await db.runAsync('DELETE FROM quotation_line_items');
                  for (const row of data.quotation_line_items) {
                    await db.runAsync(
                      `INSERT INTO quotation_line_items (id, quotation_id, section_id, source_type, source_id, assembly_instance_id, description, unit, quantity, unit_cost, markup_pct, unit_price, line_total, price_overridden, line_discount_type, line_discount_value, is_material, sort_order, created_at, updated_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                      [
                        row.id, row.quotation_id, row.section_id, row.source_type, row.source_id,
                        row.assembly_instance_id, row.description, row.unit, row.quantity,
                        row.unit_cost, row.markup_pct, row.unit_price, row.line_total,
                        row.price_overridden, row.line_discount_type, row.line_discount_value,
                        row.is_material, row.sort_order, row.created_at, row.updated_at,
                      ]
                    );
                  }
                }
              });

              Alert.alert('Restore Complete', 'Your entire database has been successfully restored from backup!');
            } catch (err: any) {
              Alert.alert('Restore Error', err?.message || 'Failed to restore backup file.');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Safety & Backup</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Offline Safety Guarantee Box */}
        <View style={styles.safetyCard}>
          <MaterialCommunityIcons name="shield-check" size={36} color={Colors.success} />
          <View style={styles.safetyTextCol}>
            <Text style={styles.safetyTitle}>100% Offline Data Ownership</Text>
            <Text style={styles.safetySub}>
              All your materials, customers, and quotation records stay 100% private on your phone. Export backup files anytime to save to Google Drive or SD card.
            </Text>
          </View>
        </View>

        {/* Export Backup Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="export-variant" size={22} color={Colors.accent} />
            <Text style={styles.cardTitle}>Export Backup</Text>
          </View>
          <Text style={styles.cardText}>
            Export your entire database (customers, projects, catalogues, saved quotations, and settings) as a portable backup JSON file.
          </Text>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleExportBackup}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <>
                <MaterialCommunityIcons name="download" size={20} color={Colors.textInverse} />
                <Text style={styles.actionBtnText}>Export Database Backup</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Restore Backup Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialCommunityIcons name="import" size={22} color={Colors.warning} />
            <Text style={styles.cardTitle}>Restore Database</Text>
          </View>
          <Text style={styles.cardText}>
            Restore your app data from a previously saved ElectroQuote backup JSON file.
          </Text>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestoreBackup}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={Colors.warning} />
            ) : (
              <>
                <MaterialCommunityIcons name="folder-open-outline" size={20} color={Colors.warning} />
                <Text style={styles.restoreBtnText}>Restore From Backup File</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
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
  backBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  safetyCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  safetyTextCol: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  safetySub: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardTitle: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  cardText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    lineHeight: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    height: 48,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    ...Shadow.accent,
  },
  actionBtnText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textInverse,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg2,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.warning,
    gap: Spacing.xs,
  },
  restoreBtnText: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.warning,
  },
});
