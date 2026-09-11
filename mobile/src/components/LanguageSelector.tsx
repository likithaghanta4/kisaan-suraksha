import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ViewStyle,
} from 'react-native';
import { Colors, FontSizes, Spacing } from '../constants';
import { Language } from '../types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  style?: ViewStyle;
}

const LANGUAGES: Array<{ code: Language; label: string; native: string; icon: string }> = [
  { code: 'mr', label: 'Marathi', native: 'मराठी', icon: '🌾' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', icon: '🌱' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', icon: '🌿' },
  { code: 'en', label: 'English', native: 'English', icon: '🌍' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onSelectLanguage,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const activeLang = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  const handleSelect = (code: Language) => {
    onSelectLanguage(code);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.pill, style]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>🌐</Text>
        <Text style={styles.label}>{activeLang.native}</Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Language / भाषा निवडा</Text>
              <Text style={styles.modalSubtitle}>
                Select your preferred language for farming advice
              </Text>
            </View>

            <View style={styles.optionsList}>
              {LANGUAGES.map((item) => {
                const isSelected = item.code === currentLanguage;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelect(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionIcon}>{item.icon}</Text>
                    <View style={styles.optionTextCol}>
                      <Text
                        style={[
                          styles.optionNative,
                          isSelected && styles.optionNativeSelected,
                        ]}
                      >
                        {item.native}
                      </Text>
                      <Text style={styles.optionLabel}>{item.label}</Text>
                    </View>
                    {isSelected ? (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4E2D5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: FontSizes.xs + 1,
    fontWeight: '700',
    color: '#1E6B24',
  },
  chevron: {
    fontSize: 12,
    color: '#1E6B24',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 360,
    padding: Spacing.lg,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSizes.md,
    fontWeight: '800',
    color: '#1C2E1E',
  },
  modalSubtitle: {
    fontSize: FontSizes.xs,
    color: '#697B6B',
    marginTop: 4,
    textAlign: 'center',
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2EBE2',
  },
  optionItemSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionTextCol: {
    flex: 1,
  },
  optionNative: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#264228',
  },
  optionNativeSelected: {
    color: '#1B5E20',
  },
  optionLabel: {
    fontSize: FontSizes.xs,
    color: '#697B6B',
    marginTop: 1,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});

export default LanguageSelector;
