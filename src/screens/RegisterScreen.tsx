/**
 * AgriRaksha AI — Register Screen
 * 
 * Farmer account creation with language, location, phone, and password.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';
import { Colors, FontSizes, Spacing } from '../constants';
import { Language } from '../types';

interface RegisterScreenProps {
  navigation: any;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'mr', label: 'मराठी' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'en', label: 'English' },
];

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { register, setLanguage } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>('mr');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang);
  };

  const handleRegister = async () => {
    setErrorMessage('');
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setErrorMessage(t('auth.name') + ' is required');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await setLanguage(selectedLang);
      await register({
        name: cleanName,
        phone: cleanPhone,
        password,
        language: selectedLang,
      });
      // AuthContext will update isAuthenticated, triggering navigation to MainTabs
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please check your details.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>← {t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('auth.registerTitle')}</Text>
            <Text style={styles.headerSubtitle}>{t('auth.registerSubtitle')}</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Error Banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* Language Selector Chips */}
            <Text style={styles.inputLabel}>{t('language.title')}</Text>
            <View style={styles.langChipsRow}>
              {LANGUAGES.map((item) => {
                const isSelected = selectedLang === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.langChip, isSelected && styles.langChipSelected]}
                    onPress={() => handleLanguageSelect(item.code)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.langChipText,
                        isSelected && styles.langChipTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Farmer Full Name */}
            <Text style={styles.inputLabel}>{t('auth.name')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Ramesh Patil / రమేష్ పాటిల్"
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errorMessage) setErrorMessage('');
              }}
              editable={!isLoading}
            />

            {/* Mobile Number */}
            <Text style={styles.inputLabel}>{t('auth.phone')}</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBadge}>
                <Text style={styles.flagEmoji}>🇮🇳</Text>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="98765 43210"
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
                  if (errorMessage) setErrorMessage('');
                }}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isLoading}
              />
            </View>

            {/* District / Taluka (Location) */}
            <Text style={styles.inputLabel}>District & State / जिल्हा आणि राज्य</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Pune, Maharashtra / Warangal, Telangana"
              placeholderTextColor={Colors.textTertiary}
              value={district}
              onChangeText={setDistrict}
              editable={!isLoading}
            />

            {/* Password */}
            <Text style={styles.inputLabel}>{t('auth.password')}</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Min 6 characters"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errorMessage) setErrorMessage('');
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeEmoji}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.inputLabel}>{t('auth.confirmPassword')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Re-enter password"
              placeholderTextColor={Colors.textTertiary}
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (errorMessage) setErrorMessage('');
              }}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>{t('auth.register')}</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginFooter}>
              <Text style={styles.loginPrompt}>{t('auth.haveAccount')} </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>{t('auth.login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl + 10,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: Colors.white,
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.primaryBg,
    marginTop: 4,
  },
  formCard: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.danger,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  langChipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  langChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  langChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primary,
  },
  langChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  langChipTextSelected: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  textInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 50,
    marginRight: Spacing.sm,
  },
  flagEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    letterSpacing: 1,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: Spacing.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeEmoji: {
    fontSize: 20,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
  loginFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  loginPrompt: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default RegisterScreen;
