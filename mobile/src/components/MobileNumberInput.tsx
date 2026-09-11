import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants';

interface MobileNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const MobileNumberInput: React.FC<MobileNumberInputProps> = ({
  value,
  onChangeText,
  label = 'Enter Your Mobile Number',
  placeholder = '98765 43210',
  errorMessage,
  disabled = false,
  style,
}) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
  const isValidStartingDigit =
    digitsOnly.length === 0 || ['6', '7', '8', '9'].includes(digitsOnly[0]);
  const isComplete = digitsOnly.length === 10 && isValidStartingDigit;

  const handleChange = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, 10);
    onChangeText(clean);
  };

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputRow,
          errorMessage ? styles.inputRowError : isComplete ? styles.inputRowSuccess : null,
        ]}
      >
        {/* +91 India Country Code Badge */}
        <View style={styles.countryBadge}>
          <Text style={styles.flagEmoji}>🇮🇳</Text>
          <Text style={styles.countryCode}>+91</Text>
          <View style={styles.divider} />
        </View>

        {/* 10-Digit Mobile Input */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9AA69B"
          keyboardType="number-pad"
          maxLength={10}
          value={digitsOnly}
          onChangeText={handleChange}
          editable={!disabled}
          selectionColor={Colors.primary}
        />

        {isComplete && (
          <View style={styles.validCheck}>
            <Text style={styles.checkEmoji}>✓</Text>
          </View>
        )}
      </View>

      {/* Helper / Counter Row */}
      <View style={styles.metaRow}>
        <Text style={[styles.hintText, !isValidStartingDigit && styles.hintError]}>
          {!isValidStartingDigit
            ? 'Must start with 6, 7, 8, or 9'
            : digitsOnly.length < 10
            ? '10-digit mobile number'
            : 'Valid mobile number'}
        </Text>
        <Text
          style={[
            styles.counterText,
            isComplete && styles.counterSuccess,
          ]}
        >
          {digitsOnly.length} / 10
        </Text>
      </View>

      {/* Error Message */}
      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: '#264228',
    marginBottom: Spacing.xs + 2,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFCF8',
    borderWidth: 1.5,
    borderColor: '#D4E2D5',
    borderRadius: 16,
    height: 58,
    paddingHorizontal: Spacing.sm,
  },
  inputRowSuccess: {
    borderColor: '#2E7D32',
    backgroundColor: '#F7FCF7',
  },
  inputRowError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF8F8',
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.xs,
  },
  flagEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  countryCode: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#2E4030',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1.5,
    height: 26,
    backgroundColor: '#CFDBCF',
    marginLeft: 10,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 18,
    fontWeight: '700',
    color: '#1C2E1E',
    letterSpacing: 1.2,
  },
  validCheck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  checkEmoji: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#697B6B',
    fontWeight: '500',
  },
  hintError: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  counterText: {
    fontSize: 11,
    color: '#8A9C8C',
    fontWeight: '600',
  },
  counterSuccess: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});

export default MobileNumberInput;
