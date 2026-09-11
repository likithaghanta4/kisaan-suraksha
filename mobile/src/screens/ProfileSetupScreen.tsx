/**
 * AgriRaksha AI — Screen 6: Profile Setup ("Create Your Profile")
 * 
 * Recreated faithfully from the reference design:
 * - Full-screen authentic Indian agricultural landscape with crops, village houses, sunrise, and rustic wooden sign ("Healthy Farmers Stronger India 🍃")
 * - Top-left "← Back" button and Top-right "English ▼" language indicator
 * - AgriRaksha emblem, title & "Healthy Crops | Prosperous Farmers" tagline
 * - Upper-right cursive motto: "Rooted in Farmers For a Better Tomorrow 🍃"
 * - Main heading: "Create Your Profile"
 * - Subtitle: "Tell us a few details to personalize your AgriRaksha experience"
 * - Clean rounded white/translucent card containing 4 farmer fields:
 *   1. Full Name (with 👤 badge)
 *   2. State (with 📍 badge, dynamic searchable Indian states)
 *   3. District (with 🌱 badge, dynamic dependent list based on selected state)
 *   4. Village / Taluka (with 🏡 badge, text input)
 * - Large green rounded CTA: "Continue →" (navigates to MainTabs)
 * - Soft rounded privacy card: "🔒 Your information is used to provide a better and personalized experience."
 * - Translucent 4-pillar information strip: Better Guidance, Stronger Farmers, Healthier Crops, Greener India
 * - Footer: "🇮🇳 | Built for Indian Farmers"
 * - Responsive on mobile and web without any phone mockup frame
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';
import { ALL_INDIAN_STATES, getDistrictsForState } from '../constants';

interface ProfileSetupScreenProps {
  route?: any;
  navigation?: any;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { i18n } = useTranslation();
  const { user, setupProfile, language } = useAuth();

  const isEditing = route?.params?.isEditing || !!user?.name;
  const phone = route?.params?.phone || user?.phone || '9876543210';

  // Form State initialized from route params or logged-in user profile
  const [name, setName] = useState(route?.params?.name || user?.name || '');
  const [selectedState, setSelectedState] = useState(route?.params?.state || user?.state || '');
  const [selectedDistrict, setSelectedDistrict] = useState(route?.params?.district || user?.district || '');
  const [village, setVillage] = useState(route?.params?.village || user?.village || '');

  // Modals State
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  // Search queries for modals
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentLangLabel =
    i18n.language === 'hi'
      ? 'हिंदी'
      : i18n.language === 'mr'
      ? 'मराठी'
      : i18n.language === 'te'
      ? 'తెలుగు'
      : 'English';

  // Dynamic districts based on selected state
  const availableDistricts = useMemo(() => {
    return getDistrictsForState(selectedState);
  }, [selectedState]);

  // Filtered lists for searchable modals
  const filteredStates = useMemo(() => {
    const q = stateSearch.trim().toLowerCase();
    if (!q) return ALL_INDIAN_STATES;
    return ALL_INDIAN_STATES.filter((st) => st.toLowerCase().includes(q));
  }, [stateSearch]);

  const filteredDistricts = useMemo(() => {
    const q = districtSearch.trim().toLowerCase();
    if (!q) return availableDistricts;
    return availableDistricts.filter((dist) => dist.toLowerCase().includes(q));
  }, [availableDistricts, districtSearch]);

  const handleSelectState = (stateName: string) => {
    if (stateName !== selectedState) {
      setSelectedState(stateName);
      setSelectedDistrict(''); // Reset district when state changes
    }
    setStateModalVisible(false);
    setStateSearch('');
    setErrorMessage('');
  };

  const handleSelectDistrict = (distName: string) => {
    setSelectedDistrict(distName);
    setDistrictModalVisible(false);
    setDistrictSearch('');
    setErrorMessage('');
  };

  const handleCompleteSetup = async () => {
    setErrorMessage('');
    const cleanName = name.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!selectedState) {
      setErrorMessage('Please select your state.');
      return;
    }

    if (!selectedDistrict) {
      setErrorMessage('Please select your district.');
      return;
    }

    try {
      setIsLoading(true);
      await setupProfile({
        phone,
        name: cleanName,
        state: selectedState,
        district: selectedDistrict,
        village: village.trim() || undefined,
        language: language || 'en',
      });

      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('MainTabs');
      }
    } catch (err: any) {
      console.warn('Profile setup warning (continuing to MainTabs):', err);
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('MainTabs');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = Boolean(name.trim() && selectedState && selectedDistrict);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/profile_farm_bg.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: Math.max(insets.top + 8, Platform.OS === 'web' ? 20 : 36),
                paddingBottom: Math.max(insets.bottom + 12, Platform.OS === 'web' ? 18 : 24),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.contentWrapper}>
              {/* Top Navigation Row: Back and Language */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.navButtonText}>← Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => navigation.navigate('LanguageSelect', { fromSettings: false })}
                  activeOpacity={0.7}
                >
                  <Text style={styles.navButtonText}>{currentLangLabel} ▼</Text>
                </TouchableOpacity>
              </View>

              {/* AgriRaksha Branding & Right Decorative Motto */}
              <View style={styles.brandRow}>
                <View style={styles.brandCenter}>
                  <Image
                    source={require('../../assets/agriraksha_logo_clean.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.brandTitle}>Kisaan Suraksha</Text>
                  <Text style={styles.brandTagline}>Healthy Crops | Prosperous Farmers</Text>
                </View>

                {/* Upper-Right Decorative Motto */}
                <View style={styles.decorativeMotto}>
                  <Text style={styles.mottoLine1}>Rooted</Text>
                  <Text style={styles.mottoLine2}>in Farmers</Text>
                  <Text style={styles.mottoLine3}>For a Better</Text>
                  <View style={styles.mottoLine4Row}>
                    <Text style={styles.mottoLine4}>Tomorrow</Text>
                    <Text style={styles.leafIcon}>🍃</Text>
                  </View>
                </View>
              </View>

              {/* Heading Section */}
              <View style={styles.headingSection}>
                <Text style={styles.mainHeading}>
                  {isEditing ? 'Manage & Edit Profile' : 'Create Your Profile'}
                </Text>
                <Text style={styles.subHeading}>
                  {isEditing
                    ? 'Update your personal details and farm location'
                    : `Tell us a few details to personalize\nyour Kisaan Suraksha experience`}
                </Text>
              </View>

              {/* Error Message */}
              {!!errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Profile Setup Form Card */}
              <View style={styles.formCard}>
                {/* Field 1: Full Name */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIconBadge}>
                    <Text style={styles.fieldEmoji}>👤</Text>
                  </View>
                  <View style={styles.fieldInputContainer}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your full name"
                      placeholderTextColor="#9AA69B"
                      value={name}
                      onChangeText={(val) => {
                        setName(val);
                        setErrorMessage('');
                      }}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Field 2: State */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIconBadge}>
                    <Text style={styles.fieldEmoji}>📍</Text>
                  </View>
                  <View style={styles.fieldInputContainer}>
                    <Text style={styles.fieldLabel}>State</Text>
                    <TouchableOpacity
                      style={styles.dropdownSelector}
                      onPress={() => setStateModalVisible(true)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.selectorValueText,
                          !selectedState && styles.selectorPlaceholderText,
                        ]}
                      >
                        {selectedState || 'Select your state'}
                      </Text>
                      <Text style={styles.selectorChevron}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Field 3: District */}
                <View style={styles.fieldRow}>
                  <View style={styles.fieldIconBadge}>
                    <Text style={styles.fieldEmoji}>🌱</Text>
                  </View>
                  <View style={styles.fieldInputContainer}>
                    <Text style={styles.fieldLabel}>District</Text>
                    <TouchableOpacity
                      style={[
                        styles.dropdownSelector,
                        !selectedState && styles.dropdownDisabled,
                      ]}
                      onPress={() => {
                        if (!selectedState) {
                          setErrorMessage('Please select a State first.');
                          return;
                        }
                        setDistrictModalVisible(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.selectorValueText,
                          !selectedDistrict && styles.selectorPlaceholderText,
                        ]}
                      >
                        {selectedDistrict ||
                          (selectedState ? 'Select your district' : 'Choose state first')}
                      </Text>
                      <Text style={styles.selectorChevron}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Field 4: Village / Taluka */}
                <View style={[styles.fieldRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <View style={styles.fieldIconBadge}>
                    <Text style={styles.fieldEmoji}>🏡</Text>
                  </View>
                  <View style={styles.fieldInputContainer}>
                    <Text style={styles.fieldLabel}>
                      Village / Taluka <Text style={styles.optionalLabel}>(Optional)</Text>
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your village or taluka"
                      placeholderTextColor="#9AA69B"
                      value={village}
                      onChangeText={setVillage}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Primary CTA Button: Continue */}
                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    (!isValid || isLoading) && styles.ctaButtonDisabled,
                  ]}
                  onPress={handleCompleteSetup}
                  disabled={!isValid || isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.ctaButtonText}>
                      {isEditing ? 'Save Profile Changes ✓' : 'Continue →'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Privacy Card inside/below form */}
                <View style={styles.privacyBadge}>
                  <View style={styles.lockCircle}>
                    <Text style={styles.lockEmoji}>🔒</Text>
                  </View>
                  <Text style={styles.privacyText}>
                    Your information is used to provide a better{'\n'}and personalized experience.
                  </Text>
                </View>
              </View>

              {/* Landscape Spacer to let the rustic sign show on the left */}
              <View style={styles.landscapeSpacer} />

              {/* Bottom Translucent Information Strip (4 Pillars) */}
              <View style={styles.impactStrip}>
                <View style={styles.impactItem}>
                  <Text style={styles.impactEmoji}>🌱</Text>
                  <Text style={styles.impactTitle}>Better{'\n'}Guidance</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactItem}>
                  <Text style={styles.impactEmoji}>👥</Text>
                  <Text style={styles.impactTitle}>Stronger{'\n'}Farmers</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactItem}>
                  <Text style={styles.impactEmoji}>🌿</Text>
                  <Text style={styles.impactTitle}>Healthier{'\n'}Crops</Text>
                </View>
                <View style={styles.impactDivider} />
                <View style={styles.impactItem}>
                  <Text style={styles.impactEmoji}>🌐</Text>
                  <Text style={styles.impactTitle}>Greener{'\n'}India</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footerRow}>
                <Text style={styles.footerFlag}>🇮🇳</Text>
                <Text style={styles.footerDivider}>|</Text>
                <Text style={styles.footerText}>Built for Indian Farmers</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>

      {/* MODAL 1: State Picker */}
      <Modal visible={stateModalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your State (राज्य)</Text>
              <TouchableOpacity
                onPress={() => setStateModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchBox}>
              <Text style={styles.modalSearchIcon}>🔍</Text>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search State / राज्य शोधा..."
                placeholderTextColor="#9AA69B"
                value={stateSearch}
                onChangeText={setStateSearch}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedState === item && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelectState(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedState === item && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedState === item && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: District Picker */}
      <Modal visible={districtModalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select District in {selectedState}
              </Text>
              <TouchableOpacity
                onPress={() => setDistrictModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchBox}>
              <Text style={styles.modalSearchIcon}>🔍</Text>
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search District / जिल्हा शोधा..."
                placeholderTextColor="#9AA69B"
                value={districtSearch}
                onChangeText={setDistrictSearch}
                autoFocus
              />
            </View>
            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedDistrict === item && styles.modalItemSelected,
                  ]}
                  onPress={() => handleSelectDistrict(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedDistrict === item && styles.modalItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedDistrict === item && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0F2E1B',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A3B1C',
    letterSpacing: 0.2,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginTop: 2,
  },
  brandCenter: {
    alignItems: 'center',
  },
  logoImage: {
    width: 64,
    height: 56,
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#083318',
    letterSpacing: -0.6,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '700',
    color: '#164823',
    letterSpacing: 0.2,
    marginTop: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  decorativeMotto: {
    position: 'absolute',
    right: 0,
    top: 4,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  mottoLine1: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '800',
    color: '#0A3B1C',
    lineHeight: 13,
  },
  mottoLine2: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#072C15',
    lineHeight: 15,
  },
  mottoLine3: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '800',
    color: '#0A3B1C',
    lineHeight: 13,
    marginTop: 1,
  },
  mottoLine4Row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mottoLine4: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#072C15',
    lineHeight: 15,
  },
  leafIcon: {
    fontSize: 11,
    marginLeft: 2,
  },
  headingSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  mainHeading: {
    fontSize: 28,
    fontWeight: '900',
    color: '#083318',
    letterSpacing: -0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#164823',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 235, 238, 0.94)',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2ECE2',
    elevation: 4,
    shadowColor: '#12431E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  fieldIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  fieldEmoji: {
    fontSize: 20,
  },
  fieldInputContainer: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#083318',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  optionalLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B826E',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#D4E2D5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#12431E',
    fontWeight: '600',
  },
  dropdownSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#D4E2D5',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dropdownDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  selectorValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#12431E',
  },
  selectorPlaceholderText: {
    color: '#9AA69B',
    fontWeight: '500',
  },
  selectorChevron: {
    fontSize: 11,
    color: '#0F5F2C',
    fontWeight: '900',
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#0F5F2C',
    borderRadius: 32,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginTop: 12,
    marginBottom: 10,
  },
  ctaButtonDisabled: {
    backgroundColor: 'rgba(15, 95, 44, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 1,
    shadowOpacity: 0,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 245, 233, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  lockCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  lockEmoji: {
    fontSize: 14,
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    color: '#1B4725',
    fontWeight: '600',
    lineHeight: 15,
  },
  landscapeSpacer: {
    flex: 1,
    minHeight: 20,
  },
  impactStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2ECE2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 6,
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactEmoji: {
    fontSize: 17,
    marginBottom: 2,
  },
  impactTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#164823',
    textAlign: 'center',
    lineHeight: 12,
  },
  impactDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#D7E7D8',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    gap: 8,
  },
  footerFlag: {
    fontSize: 13,
  },
  footerDivider: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#083318',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F9F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4E2D5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalSearchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#12431E',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F5F0',
  },
  modalItemSelected: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  modalItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#0F5F2C',
    fontWeight: '800',
  },
  checkMark: {
    fontSize: 18,
    color: '#0F5F2C',
    fontWeight: '900',
  },
});

export default ProfileSetupScreen;
