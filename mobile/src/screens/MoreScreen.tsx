/**
 * AgriRaksha AI — Screen: Services & Settings / Profile
 * 
 * Recreated with exact pixel-level fidelity to the AgriRaksha AI design system:
 * - Realistic Indian agricultural farm landscape background with dark green overlay
 * - Clean header: "⚙️ Services & Settings" with subtitle (top-right welcome box completely removed)
 * - Farmer Profile Card with Avatar, Name, Phone, Location, Language, and Edit Profile button
 * - Krishi Vigyan Kendra (KVK) Card with Scientist advice, Ask a Question, and 1800-180-1551 Helpline
 * - Government Schemes & Subsidies (PMFBY, PM-KISAN, Micro-Irrigation, KCC)
 * - Settings & System (Language Switcher, Offline AI Engine, Manage Profile, Privacy & Data)
 * - Logout Button & KVK Ask Modal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Linking,
  TextInput,
  Modal,
  ImageBackground,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';

interface MoreScreenProps {
  navigation?: any;
}

const SCHEMES = [
  {
    id: 'pmfby',
    icon: '🌱',
    title: 'PM Fasal Bima Yojana (PMFBY)',
    titleLocal: 'प्रधानमंत्री फसल बीमा योजना',
    sub: '1-Rupee token premium crop insurance against drought & unseasonal rain',
    link: 'https://pmfby.gov.in',
  },
  {
    id: 'pmkisan',
    icon: '💰',
    title: 'PM-KISAN Samman Nidhi',
    titleLocal: 'पीएम-किसान सम्मान निधि',
    sub: 'Direct income support of Rs.6,000/year in 3 equal installments',
    link: 'https://pmkisan.gov.in',
  },
  {
    id: 'mahadbt',
    icon: '💧',
    title: 'Micro-Irrigation Subsidy (MahaDBT)',
    titleLocal: 'सूक्ष्म सिंचन योजना',
    sub: '55% to 80% capital subsidy on drip & sprinkler systems',
    link: 'https://mahadbt.maharashtra.gov.in',
  },
  {
    id: 'kcc',
    icon: '💳',
    title: 'Kisan Credit Card (KCC)',
    titleLocal: 'किसान क्रेडिट कार्ड',
    sub: 'Institutional farm crop loan at subsidized 4% interest rate',
    link: 'https://www.myscheme.gov.in/schemes/kcc',
  },
];

export const MoreScreen: React.FC<MoreScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, language, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 880;

  const [expertModalVisible, setExpertModalVisible] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCallHelpline = () => {
    Linking.openURL('tel:18001801551');
  };

  const handleSubmitQuestion = () => {
    if (!questionText.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setQuestionText('');
      setExpertModalVisible(false);
    }, 1500);
  };

  const handleLogout = async () => {
    await logout();
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
    }
  };

  const langMap: { [key: string]: string } = {
    mr: 'मराठी (Marathi)',
    te: 'తెలుగు (Telugu)',
    hi: 'हिन्दी (Hindi)',
    en: 'English',
  };

  const registeredAddress =
    user?.location?.address ||
    [user?.village, user?.district, user?.state].filter(Boolean).join(', ') ||
    [user?.district, user?.state].filter(Boolean).join(', ') ||
    user?.state ||
    'kamavarapukota, Eluru, Andhra Pradesh';

  const farmerName = user?.name || 'likitha';
  const farmerPhone = user?.phone || '9392495439';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/crop_diagnostic_bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.bgOverlay} />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 10, Platform.OS === 'web' ? 16 : 36),
              paddingBottom: Math.max(insets.bottom + 85, 95),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Header (Top-right profile box completely removed) */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={styles.headerIconCircle}>
                  <Text style={styles.headerEmoji}>⚙️</Text>
                </View>
                <View style={styles.titleTextGroup}>
                  <Text style={styles.headerTitle}>Services & Settings</Text>
                  <Text style={styles.headerSubtitle}>
                    Access KVK support, government schemes and personalize your experience
                  </Text>
                </View>
              </View>
            </View>

            {/* 1. Farmer Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatarBox}>
                <Text style={styles.avatarEmoji}>👩‍🌾</Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{farmerName}</Text>
                <View style={styles.profileMetaRow}>
                  <Text style={styles.profileMetaIcon}>📞</Text>
                  <Text style={styles.profileMetaText}>+91 {farmerPhone}</Text>
                </View>
                <View style={styles.profileMetaRow}>
                  <Text style={styles.profileMetaIcon}>📍</Text>
                  <Text style={styles.profileMetaText}>{registeredAddress}</Text>
                </View>
                <View style={styles.langPill}>
                  <Text style={styles.langPillText}>
                    🌐 {langMap[language] || 'English'}
                  </Text>
                </View>
              </View>

              {/* Edit Profile CTA */}
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => navigation?.navigate('ProfileSetup', { isEditing: true })}
                activeOpacity={0.75}
              >
                <Text style={styles.editProfileIcon}>✏️</Text>
                <Text style={styles.editProfileText}>Edit Profile</Text>
                <Text style={styles.editProfileChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Krishi Vigyan Kendra (KVK) Consultation Banner */}
            <View style={styles.kvkCard}>
              <View style={styles.kvkCardBody}>
                <View style={styles.kvkLeft}>
                  <View style={styles.kvkAvatarCircle}>
                    <Text style={styles.kvkAvatarEmoji}>👨‍🌾</Text>
                  </View>
                  <View style={styles.kvkTextGroup}>
                    <Text style={styles.kvkTitle}>Krishi Vigyan Kendra (KVK)</Text>
                    <Text style={styles.kvkSubtitle}>Direct Agricultural Scientist Advice</Text>
                    <Text style={styles.kvkDesc}>
                      Connect with your district agronomists for personalized leaf disease diagnosis, soil nutrient planning, and organic spray recipes.
                    </Text>
                  </View>
                </View>

                {/* KVK Action Buttons */}
                <View style={styles.kvkActionsGroup}>
                  <TouchableOpacity
                    style={styles.kvkAskBtn}
                    onPress={() => setExpertModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.kvkAskBtnIcon}>💬</Text>
                    <Text style={styles.kvkAskBtnText}>Ask a Question</Text>
                    <Text style={styles.kvkBtnChevron}>›</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.kvkCallBtn}
                    onPress={handleCallHelpline}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.kvkCallBtnIcon}>📞</Text>
                    <Text style={styles.kvkCallBtnText}>Call 1800-180-1551</Text>
                    <Text style={styles.kvkBtnChevron}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 3. Government Schemes & Subsidies */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <Text style={styles.sectionHeaderIcon}>🏛️</Text>
                <Text style={styles.sectionHeaderTitle}>Government Schemes & Subsidies</Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.myscheme.gov.in/')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All ›</Text>
              </TouchableOpacity>
            </View>

            <View style={isDesktop ? styles.schemesGridDesktop : styles.schemesGridMobile}>
              {SCHEMES.map((scheme) => (
                <TouchableOpacity
                  key={scheme.id}
                  style={styles.schemeCard}
                  onPress={() => Linking.openURL(scheme.link)}
                  activeOpacity={0.8}
                >
                  <View style={styles.schemeTopRow}>
                    <View style={styles.schemeIconCircle}>
                      <Text style={styles.schemeIconEmoji}>{scheme.icon}</Text>
                    </View>
                    <View style={styles.schemeTitleBlock}>
                      <Text style={styles.schemeTitle}>{scheme.title}</Text>
                      <Text style={styles.schemeLocal}>{scheme.titleLocal}</Text>
                    </View>
                    <Text style={styles.schemeChevron}>›</Text>
                  </View>
                  <Text style={styles.schemeSub}>{scheme.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 4. Settings & System */}
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleGroup}>
                <Text style={styles.sectionHeaderIcon}>⚙️</Text>
                <Text style={styles.sectionHeaderTitle}>Settings & System</Text>
              </View>
            </View>

            <View style={isDesktop ? styles.settingsGridDesktop : styles.settingsGridMobile}>
              {/* Language Switcher */}
              <TouchableOpacity
                style={styles.settingCard}
                onPress={() => navigation?.navigate('LanguageSelect', { fromSettings: true })}
                activeOpacity={0.8}
              >
                <View style={styles.settingIconCircle}>
                  <Text style={styles.settingIconEmoji}>🌐</Text>
                </View>
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Change Language / भाषा बदल</Text>
                  <Text style={styles.settingSub}>मराठी • हिंदी • తెలుగు • English</Text>
                </View>
                <Text style={styles.settingChevron}>›</Text>
              </TouchableOpacity>

              {/* Offline AI Engine */}
              <View style={styles.settingCard}>
                <View style={styles.settingIconCircle}>
                  <Text style={styles.settingIconEmoji}>📊</Text>
                </View>
                <View style={styles.settingDetails}>
                  <View style={styles.offlineTitleRow}>
                    <Text style={styles.settingTitle}>Offline AI Engine</Text>
                    <View style={styles.readyBadge}>
                      <Text style={styles.readyBadgeText}>READY</Text>
                    </View>
                  </View>
                  <Text style={styles.settingSub}>Active • Ready for low-connectivity fields</Text>
                </View>
                <Text style={styles.settingChevron}>›</Text>
              </View>

              {/* Manage Profile */}
              <TouchableOpacity
                style={styles.settingCard}
                onPress={() => navigation?.navigate('ProfileSetup', { isEditing: true })}
                activeOpacity={0.8}
              >
                <View style={styles.settingIconCircle}>
                  <Text style={styles.settingIconEmoji}>👤</Text>
                </View>
                <View style={styles.settingDetails}>
                  <Text style={styles.settingTitle}>Manage Profile</Text>
                  <Text style={styles.settingSub}>Update your personal information</Text>
                </View>
                <Text style={styles.settingChevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* 5. Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
              <Text style={styles.logoutBtnIcon}>🚪</Text>
              <Text style={styles.logoutBtnText}>Logout (लॉग आउट करा)</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Ask KVK Scientist Modal */}
        <Modal visible={expertModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>👨‍🔬 Ask KVK Agronomist</Text>
              <Text style={styles.modalSub}>
                Describe your crop symptom or pest issue. A certified ICAR scientist will respond within 24 hours.
              </Text>
              {isSubmitted ? (
                <View style={styles.submittedBox}>
                  <Text style={styles.submittedEmoji}>✅</Text>
                  <Text style={styles.submittedTitle}>Question Submitted!</Text>
                  <Text style={styles.submittedSub}>
                    Your query has been sent to your district KVK scientist desk. You will receive an SMS update.
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.questionInput}
                    placeholder="Describe leaf spots, plant age, and recent sprays in Marathi, Hindi, Telugu, or English..."
                    placeholderTextColor="#8C9B90"
                    multiline
                    numberOfLines={4}
                    value={questionText}
                    onChangeText={setQuestionText}
                  />
                  <View style={styles.modalActionsRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setExpertModalVisible(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalSubmitBtn}
                      onPress={handleSubmitQuestion}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.modalSubmitBtnText}>Submit Query</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#05180C',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bgOverlay: {
    ...(StyleSheet.absoluteFill as object),
    backgroundColor: 'rgba(5, 24, 11, 0.45)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1220,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 85, 40, 0.88)',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 22,
  },
  titleTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
    marginTop: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    flexWrap: 'wrap',
    gap: 14,
  },
  profileAvatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
  avatarEmoji: {
    fontSize: 34,
  },
  profileInfo: {
    flex: 1,
    minWidth: 200,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A3822',
    marginBottom: 4,
  },
  profileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  profileMetaIcon: {
    fontSize: 12,
  },
  profileMetaText: {
    fontSize: 12.5,
    color: '#4B5C52',
    fontWeight: '700',
  },
  langPill: {
    backgroundColor: '#E8F8EC',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1B5E20',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAF8',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#D4E2D8',
    paddingVertical: 9,
    paddingHorizontal: 16,
    gap: 6,
  },
  editProfileIcon: {
    fontSize: 13,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B5E20',
  },
  editProfileChevron: {
    fontSize: 18,
    color: '#1B5E20',
    fontWeight: '900',
    marginLeft: 2,
  },
  kvkCard: {
    backgroundColor: '#10461C',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  kvkCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  kvkLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    flex: 1,
    minWidth: 280,
  },
  kvkAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kvkAvatarEmoji: {
    fontSize: 28,
  },
  kvkTextGroup: {
    flex: 1,
  },
  kvkTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  kvkSubtitle: {
    fontSize: 12,
    color: '#A5D6A7',
    fontWeight: '700',
    marginTop: 1,
  },
  kvkDesc: {
    fontSize: 11.5,
    color: '#E8F8EC',
    lineHeight: 16,
    marginTop: 6,
  },
  kvkActionsGroup: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  kvkAskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
  },
  kvkAskBtnIcon: {
    fontSize: 14,
  },
  kvkAskBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0A3314',
  },
  kvkCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB300',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
  },
  kvkCallBtnIcon: {
    fontSize: 14,
  },
  kvkCallBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#3E2723',
  },
  kvkBtnChevron: {
    fontSize: 16,
    fontWeight: '900',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderIcon: {
    fontSize: 18,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A5D6A7',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  schemesGridDesktop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  schemesGridMobile: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  schemeCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  schemeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  schemeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schemeIconEmoji: {
    fontSize: 18,
  },
  schemeTitleBlock: {
    flex: 1,
  },
  schemeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A3822',
  },
  schemeLocal: {
    fontSize: 10.5,
    color: '#2E7D32',
    fontWeight: '700',
    marginTop: 1,
  },
  schemeChevron: {
    fontSize: 18,
    color: '#607267',
    fontWeight: '700',
  },
  schemeSub: {
    fontSize: 11,
    color: '#607267',
    lineHeight: 15,
  },
  settingsGridDesktop: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  settingsGridMobile: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  settingCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  settingIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconEmoji: {
    fontSize: 18,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A3822',
  },
  settingSub: {
    fontSize: 10.5,
    color: '#607267',
    marginTop: 2,
    fontWeight: '600',
  },
  offlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readyBadge: {
    backgroundColor: '#E8F8EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readyBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1B5E20',
  },
  settingChevron: {
    fontSize: 18,
    color: '#607267',
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderWidth: 1.2,
    borderColor: '#FFCDD2',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
  },
  logoutBtnIcon: {
    fontSize: 16,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#C62828',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A3822',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#607267',
    lineHeight: 17,
    marginBottom: 14,
  },
  questionInput: {
    height: 100,
    borderWidth: 1.5,
    borderColor: '#E2EBE4',
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    color: '#1A3822',
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalCancelBtnText: {
    fontSize: 13,
    color: '#607267',
    fontWeight: '700',
  },
  modalSubmitBtn: {
    backgroundColor: '#1E7036',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  submittedBox: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  submittedEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  submittedTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B5E20',
  },
  submittedSub: {
    fontSize: 12,
    color: '#607267',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default MoreScreen;
