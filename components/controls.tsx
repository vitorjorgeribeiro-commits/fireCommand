import { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '@/lib/constants';

export function HeaderBar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.headerBar}>
      <View style={styles.headerContent}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        {right}
      </View>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}>
      {icon}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.secondaryButton} onPress={onPress} activeOpacity={0.85}>
      {icon}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
}) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={THEME.textMuted}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );
}

import { TextInput } from 'react-native';

export function SelectField({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string | null;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.selectRow}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.selectChip, selected && styles.selectChipActive]}
              onPress={() => onSelect(opt.value)}>
              <Text style={[styles.selectChipText, selected && styles.selectChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    backgroundColor: THEME.primaryDark,
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  secondaryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: THEME.text,
  },
  inputField: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: THEME.textSecondary,
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: THEME.borderDark,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: THEME.text,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: THEME.borderDark,
    backgroundColor: '#F8FAFC',
  },
  selectChipActive: {
    borderColor: THEME.primary,
    backgroundColor: '#FEE2E2',
  },
  selectChipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: THEME.textSecondary,
  },
  selectChipTextActive: {
    color: THEME.primary,
  },
});
