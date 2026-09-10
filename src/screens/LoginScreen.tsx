/**
 * AgriRaksha AI — Screen 4: Mobile Number Login Screen
 * 
 * Recreated faithfully from the reference design:
 * - Full-screen authentic Indian agricultural landscape with green crops, sunrise, hills, village houses, and rustic wooden sign
 * - Top-left "← Back" button and Top-right "English ▼" language indicator
 * - AgriRaksha emblem, title & "Healthy Crops | Prosperous Farmers" tagline
 * - Upper-right cursive motto: "Towards Greener Tomorrow 🍃"
 * - Main heading: "Enter Your Mobile Number"
 * - Subtitle: "We will send a 6-digit OTP to your mobile number"
 * - Clean rounded phone input: 🇮🇳 +91 | Enter mobile number
 * - Large green rounded CTA: "Send OTP →"
 * - Soft rounded security card: "🔒 Your mobile number is used only for login and is kept secure."
 * - Translucent 4-pillar information strip: Better Guidance, Stronger Farmers, Healthier Crops, Greener India
 * - Footer: "🇮🇳 | Built for Indian Farmers"
 * - Responsive on both mobile and web without any phone mockup frame
 */

import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { sendOtp } = useAuth();

  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isSendingRef = useRef(false);
  const lastSentPhoneRef = useRef('');

  const cleanPhone = phone.replace(/\D/g, '').slice(0, 10);
  const isValid = cleanPhone.length === 10;

  const currentLangLabel =
    i18n.language === 'hi'
      ? 'हिंदी'
      : i18n.language === 'mr'
      ? 'मराठी'
      : i18n.language === 'te'
      ? 'తెలుగు'
      : 'English';

  const triggerAutoSendOtp = async (targetPhone: string) => {
    if (isSendingRef.current || targetPhone.length !== 10) return;
    if (lastSentPhoneRef.current === targetPhone) return;

    isSendingRef.current = true;
    lastSentPhoneRef.current = targetPhone;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await sendOtp(targetPhone);
      navigation.navigate('Otp', {
        phone: targetPhone,
        isNewUser: response.isNewUser,
        devOtp: response.devOtp,
      });
    } catch (err: any) {
      // Allow retry on error
      lastSentPhoneRef.current = '';
      const msg = err.response?.data?.error || err.message || 'Could not generate OTP. Please check your mobile number.';
      setErrorMessage(msg);
    } finally {
      isSendingRef.current = false;
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (text: string) => {
    setErrorMessage('');
    const numeric = text.replace(/\D/g, '').slice(0, 10);
    setPhone(numeric);

    // Automatic OTP Trigger: When exactly 10 digits are entered
    if (numeric.length === 10 && numeric !== lastSentPhoneRef.current && !isSendingRef.current) {
      triggerAutoSendOtp(numeric);
    }
  };

  const handleSendOtp = () => {
    if (isValid && !isLoading) {
      lastSentPhoneRef.current = ''; // Force retry if user explicitly clicks
      triggerAutoSendOtp(cleanPhone);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('../../assets/login_farm_bg.jpg')}
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
                paddingTop: Math.max(insets.top + 8, Platform.OS === 'web' ? 20 : 40),
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

              {/* AgriRaksha Branding & Right Motto */}
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
                  <Text style={styles.mottoLine1}>Towards</Text>
                  <Text style={styles.mottoLine2}>Greener</Text>
                  <View style={styles.mottoLine3Row}>
                    <Text style={styles.mottoLine3}>Tomorrow</Text>
                    <Text style={styles.leafIcon}>🍃</Text>
                  </View>
                </View>
              </View>

              {/* Heading Section */}
              <View style={styles.headingSection}>
                <Text style={styles.mainHeading}>Enter Your{'\n'}Mobile Number</Text>
                <Text style={styles.subHeading}>
                  We will send a 6-digit OTP to your mobile number
                </Text>
              </View>

              {/* Error Message if any */}
              {!!errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Mobile Input Field */}
              <View style={styles.phoneInputCard}>
                <View style={styles.countryCodeSection}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={styles.dialCode}>+91</Text>
                </View>

                <View style={styles.verticalDivider} />

                <TextInput
                  style={styles.phoneTextInput}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9AA69B"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  editable={!isLoading}
                />

                {isValid && <Text style={styles.validCheck}>✓</Text>}
              </View>

              {/* Primary Action Button: Send OTP */}
              <TouchableOpacity
                style={[
                  styles.ctaButton,
                  (!isValid || isLoading) && styles.ctaButtonDisabled,
                ]}
                onPress={handleSendOtp}
                disabled={!isValid || isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.ctaButtonText}>Sending OTP...</Text>
                  </View>
                ) : (
                  <Text style={styles.ctaButtonText}>Send OTP →</Text>
                )}
              </TouchableOpacity>

              {/* Security Card */}
              <View style={styles.securityCard}>
                <View style={styles.lockBadge}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
                <Text style={styles.securityText}>
                  Your mobile number is used only for login{'\n'}and is kept secure.
                </Text>
              </View>

              {/* Spacer so the rustic wooden signboard in the landscape shows through */}
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
    width: 66,
    height: 58,
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
    top: 6,
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
    lineHeight: 14,
  },
  mottoLine2: {
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '900',
    color: '#072C15',
    lineHeight: 16,
  },
  mottoLine3Row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mottoLine3: {
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '800',
    color: '#0A3B1C',
    lineHeight: 14,
  },
  leafIcon: {
    fontSize: 11,
    marginLeft: 2,
  },
  headingSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 14,
  },
  mainHeading: {
    fontSize: 29,
    fontWeight: '900',
    color: '#083318',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 35,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#164823',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    textShadowColor: 'rgba(255, 255, 255, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 235, 238, 0.92)',
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
  phoneInputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2ECE2',
    height: 60,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#12431E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 8,
  },
  countryCodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  dialCode: {
    fontSize: 17,
    fontWeight: '800',
    color: '#12431E',
  },
  verticalDivider: {
    width: 1.5,
    height: 30,
    backgroundColor: '#D4E2D5',
    marginHorizontal: 12,
  },
  phoneTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#12431E',
    height: '100%',
    letterSpacing: 0.8,
  },
  validCheck: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '900',
    marginLeft: 6,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#0F5F2C',
    borderRadius: 32,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 12,
  },
  ctaButtonDisabled: {
    backgroundColor: 'rgba(15, 95, 44, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 1,
    shadowOpacity: 0,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2ECE2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  lockBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(30, 94, 46, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 18,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#1B4725',
    fontWeight: '600',
    lineHeight: 16,
  },
  landscapeSpacer: {
    flex: 1,
    minHeight: 30,
  },
  impactStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2ECE2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 8,
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactEmoji: {
    fontSize: 18,
    marginBottom: 3,
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
    height: 28,
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
});

export default LoginScreen;
