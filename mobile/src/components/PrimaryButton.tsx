import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  loadingText,
  style,
  textStyle,
  icon,
}) => {
  const isInactive = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isInactive && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isInactive}
      activeOpacity={0.85}
    >
      {loading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator size="small" color={Colors.white} />
          {loadingText ? (
            <Text style={[styles.text, textStyle, { marginLeft: 8 }]}>
              {loadingText}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.contentRow}>
          <Text style={[styles.text, isInactive && styles.textDisabled, textStyle]}>
            {title}
          </Text>
          {icon ? <Text style={[styles.icon, textStyle]}>{icon}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1E6B24', // Deep agricultural leaf green
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: '#C8D6C9',
    elevation: 0,
    shadowOpacity: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textDisabled: {
    color: '#8A9C8C',
  },
  icon: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default PrimaryButton;
