// app/(tabs)/settings/index.tsx — Settings Home Hub Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBusinessProfile } from '../../../src/hooks/useBusinessProfile';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../../src/constants/theme';

interface SettingsItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  subtitle: string;
  route: string;
  color?: string;
}

const SETTINGS_SECTIONS: { title: string; items: SettingsItem[] }[] = [
  {
    title: 'Business Information',
    items: [
      {
        icon: 'domain',
        label: 'Business Profile & Logo',
        subtitle: 'Name, logo, address, contact numbers, VAT #',
        route: '/settings/business-profile',
        color: Colors.accent,
      },
    ],
  },
  {
    title: 'Pricing & Tax Settings',
    items: [
      {
        icon: 'percent',
        label: 'Markup, Tax & Banking',
        subtitle: 'Default material markup %, VAT rate, bank info',
        route: '/settings/pricing',
        color: Colors.info,
      },
    ],
  },
  {
    title: 'Quotation Defaults',
    items: [
      {
        icon: 'file-document-outline',
        label: 'Validity, Notes & Terms',
        subtitle: 'Default validity days, terms and conditions',
        route: '/settings/quotation-defaults',
        color: Colors.success,
      },
    ],
  },
  {
    title: 'Data & Security',
    items: [
      {
        icon: 'backup-restore',
        label: 'Backup & Restore',
        subtitle: 'Export or import your offline SQLite data',
        route: '/settings/backup',
        color: Colors.warning,
      },
    ],
  },
];

export default function SettingsScreen() {
  const { data: profile } = useBusinessProfile();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Profile Summary Card */}
        {profile && (
          <TouchableOpacity
            style={styles.profileSummaryCard}
            onPress={() => router.push('/settings/business-profile')}
            activeOpacity={0.7}
          >
            <View style={styles.profileAvatar}>
              <MaterialCommunityIcons name="lightning-bolt" size={28} color={Colors.accent} />
            </View>
            <View style={styles.profileTextCol}>
              <Text style={styles.profileName}>
                {profile.tradingName || profile.name || 'Set Up Business Profile'}
              </Text>
              <Text style={styles.profileSub}>
                {profile.phone ? `Phone: ${profile.phone}` : 'Tap to configure contact details'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textDisabled} />
          </TouchableOpacity>
        )}

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, index) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        { backgroundColor: (item.color ?? Colors.accent) + '22' },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={22}
                        color={item.color ?? Colors.accent}
                      />
                    </View>
                    <View style={styles.itemText}>
                      <Text style={styles.itemLabel}>{item.label}</Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={Colors.textDisabled}
                    />
                  </TouchableOpacity>
                  {index < section.items.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* About App Footer */}
        <View style={styles.aboutBox}>
          <MaterialCommunityIcons name="shield-check-outline" size={24} color={Colors.success} />
          <Text style={styles.aboutText}>100% Offline & Private SQLite Storage</Text>
          <Text style={styles.versionText}>ElectroQuote v1.0.0 — Build 2026</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg0 },
  header: {
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.xl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontBold,
  },
  scroll: { flex: 1 },
  content: { padding: Spacing.base, paddingBottom: Spacing.xxxl, gap: Spacing.lg },
  profileSummaryCard: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.base,
    fontFamily: Typography.fontBold,
    color: Colors.textPrimary,
  },
  profileSub: {
    fontSize: Typography.xs,
    fontFamily: Typography.fontRegular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.bg1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { flex: 1 },
  itemLabel: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontMedium,
  },
  itemSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontRegular,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 70,
  },
  aboutBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    gap: 4,
  },
  aboutText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontMedium,
  },
  versionText: {
    fontSize: Typography.xs,
    color: Colors.textDisabled,
    fontFamily: Typography.fontRegular,
  },
});
