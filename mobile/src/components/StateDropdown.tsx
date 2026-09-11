import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  SafeAreaView,
  ViewStyle,
} from 'react-native';
import { Colors, FontSizes, Spacing, ALL_INDIAN_STATES } from '../constants';

interface StateDropdownProps {
  selectedState: string;
  onSelectState: (state: string) => void;
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const StateDropdown: React.FC<StateDropdownProps> = ({
  selectedState,
  onSelectState,
  label = 'State *',
  placeholder = 'Select your state',
  errorMessage,
  disabled = false,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return ALL_INDIAN_STATES;
    return ALL_INDIAN_STATES.filter((st) => st.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleSelect = (item: string) => {
    onSelectState(item);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={[
          styles.selectorButton,
          errorMessage ? styles.selectorError : null,
          disabled && styles.selectorDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={styles.locationIcon}>🏛️</Text>
        <Text
          style={[
            styles.selectorText,
            !selectedState && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedState || placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {/* Modal Selection */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalTitle}>Select State / राज्य निवडा</Text>
              <Text style={styles.modalSubtitle}>All 36 Indian States & Union Territories</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search state or UT..."
              placeholderTextColor="#9AA69B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              clearButtonMode="while-editing"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* List */}
          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              const isSelected = item === selectedState;
              return (
                <TouchableOpacity
                  style={[styles.listItem, isSelected && styles.listItemSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stateItemIcon}>🌾</Text>
                  <Text
                    style={[
                      styles.listItemText,
                      isSelected && styles.listItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected ? (
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          />
        </SafeAreaView>
      </Modal>
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
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFCF8',
    borderWidth: 1.5,
    borderColor: '#D4E2D5',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: Spacing.md,
  },
  selectorError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF8F8',
  },
  selectorDisabled: {
    backgroundColor: '#F0F3F0',
    borderColor: '#E0E5E0',
    opacity: 0.7,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#1C2E1E',
  },
  placeholderText: {
    color: '#9AA69B',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 16,
    color: '#1E6B24',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EBE2',
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: '#1C2E1E',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#697B6B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F3F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#264228',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 14,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D4E2D5',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#1C2E1E',
    height: '100%',
  },
  clearSearchText: {
    fontSize: 14,
    color: '#8A9C8C',
    padding: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EFE8',
  },
  listItemSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
    borderWidth: 1.5,
  },
  stateItemIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#2C3E2E',
  },
  listItemTextSelected: {
    color: '#1B5E20',
    fontWeight: '800',
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

export default StateDropdown;
