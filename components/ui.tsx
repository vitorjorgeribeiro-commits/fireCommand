import { ReactNode } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { THEME } from '@/lib/constants';

type BadgeVariant = 'danger' | 'warning' | 'success' | 'info' | 'neutral';

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  danger: { bg: '#FEE2E2', text: '#991B1B' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  success: { bg: '#D1FAE5', text: '#065F46' },
  info: { bg: '#DBEAFE', text: '#1E40AF' },
  neutral: { bg: '#F1F5F9', text: '#475569' },
};

export function Badge({
  label,
  variant = 'neutral',
  size = 'medium',
}: {
  label: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium';
}) {
  const colors = VARIANT_COLORS[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, size === 'small' && styles.badgeSmall]}>
      <Text style={[styles.text, { color: colors.text }, size === 'small' && styles.textSmall]}>
        {label}
      </Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children, style }: { children: ReactNode; style?: any }) {
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

export function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || '—'}</Text>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>{icon}</View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  textSmall: {
    fontSize: 11,
  fontFamily: 'Inter-Medium',
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: THEME.text,
    marginBottom: 10,
    marginTop: 6,
  },
  field: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: THEME.textMuted,
    marginBottom: 2,
  },
  fieldValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: THEME.text,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: 'center',
  },
});
