import React, { useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Colors } from '../constants';

interface OtpInputProps {
  digits: string[];
  onChangeDigits: (digits: string[]) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  digits,
  onChangeDigits,
  disabled = false,
  autoFocus = true,
  style,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/\D/g, '');

    // Handle full paste of 6 digits
    if (clean.length === 6) {
      onChangeDigits(clean.split(''));
      inputRefs.current[5]?.focus();
      return;
    }

    const char = clean.slice(-1);
    const updated = [...digits];
    updated[index] = char;
    onChangeDigits(updated);

    // Auto-advance to next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        const updated = [...digits];
        updated[index - 1] = '';
        onChangeDigits(updated);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      {digits.map((digit, index) => {
        const isFilled = digit !== '';
        return (
          <View
            key={index}
            style={[
              styles.boxWrapper,
              isFilled && styles.boxWrapperFilled,
            ]}
          >
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={styles.boxInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              editable={!disabled}
              selectTextOnFocus
              selectionColor={Colors.primary}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 6,
  },
  boxWrapper: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D4E2D5',
    backgroundColor: '#FAFCF8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  boxWrapperFilled: {
    borderColor: '#2E7D32',
    backgroundColor: '#F7FCF7',
    borderWidth: 2,
  },
  boxInput: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C2E1E',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
});

export default OtpInput;
