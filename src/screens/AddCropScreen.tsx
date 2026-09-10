/**
 * AgriRaksha AI — Screen: Add Crop / फसल जोड़ें
 * 
 * Redesigned with exact pixel-level fidelity to the AgriRaksha AI design system:
 * - Realistic Indian agricultural farm landscape background with dark green overlay
 * - Header with ← Back, 🌱 Add New Crop / फसल जोड़ें, subtitle, and "🌿 Healthy Farms Happy Farmers" badge
 * - Responsive 3-Column Desktop Grid:
 *   - LEFT: "Better Crop, Better Tomorrow" Benefits panel with 5 icon badges & inspirational quote
 *   - CENTER: White rounded form card with 5 distinct numbered steps:
 *       1. Select Crop (10 attractive crop cards in responsive grid with checkmark indicator)
 *       2. Variety (clean input with icon)
 *       3. Farm Acreage (numeric input + Acres / Gunthas / Hectares / Bighas unit selector)
 *       4. Sowing Time (5 selectable period chips)
 *       5. Current Stage (5 visual stage cards: Sowing, Vegetative, Flowering, Fruiting, Harvesting)
 *       ✓ Register Crop / फसल दर्ज करें CTA button
 *   - RIGHT: "💡 Tips for Better Results" card with 6 checkmark items & accurate advisory callout
 * - Clean mobile & tablet vertical stacking with touch-friendly controls
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  ImageBackground,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { apiService } from '../services/api';
import { Colors } from '../constants';

interface AddCropScreenProps {
  navigation: any;
}

const COMMON_CROPS = [
  { name: 'Tomato', local: 'टमाटर / టమాటా', icon: '🍅', defaultVariety: 'Abhinav' },
  { name: 'Cotton', local: 'कपास / పత్తి', icon: '🌾', defaultVariety: 'BT Cotton BG-II' },
  { name: 'Soybean', local: 'सोयाबीन / సోయాబీన్', icon: '🌱', defaultVariety: 'JS 335' },
  { name: 'Onion', local: 'प्याज / ఉల్లిపాయ', icon: '🧅', defaultVariety: 'Bhima Super' },
  { name: 'Chilli', local: 'मिर्च / మిరప', icon: '🌶️', defaultVariety: 'Guntur Teja' },
  { name: 'Wheat', local: 'गेहूं / గోధుమ', icon: '🌾', defaultVariety: 'Lokwan' },
  { name: 'Rice', local: 'धान / వరి', icon: '🌾', defaultVariety: 'Basmati / BPT 5204' },
  { name: 'Sugarcane', local: 'गन्ना / చెరకు', icon: '🎋', defaultVariety: 'Co 86032' },
  { name: 'Potato', local: 'आलू / బంగాళాదుంప', icon: '🥔', defaultVariety: 'Kufri Jyoti' },
  { name: 'Maize', local: 'मक्का / మొక్కజొన్న', icon: '🌽', defaultVariety: 'Pioneer 30V92' },
];

const STAGES = [
  { key: 'sowing', name: 'Sowing', local: 'बुआई / విత్తనం', icon: '🌱' },
  { key: 'vegetative', name: 'Vegetative', local: 'विकास / వృద్ధి', icon: '🌿' },
  { key: 'flowering', name: 'Flowering', local: 'फूल आना / పూవుతదశ', icon: '🌸' },
  { key: 'fruiting', name: 'Fruiting', local: 'फल लगना / కాయదశ', icon: '🍅' },
  { key: 'harvesting', name: 'Harvesting', local: 'कटाई / కోత', icon: '🌾' },
];

const SOWING_PERIODS = [
  { label: 'Today (आज)', daysAgo: 0, icon: '📅' },
  { label: '15 Days Ago', daysAgo: 15, icon: '📅' },
  { label: '1 Month Ago', daysAgo: 30, icon: '📍' },
  { label: '2 Months Ago', daysAgo: 60, icon: '📅' },
  { label: '3 Months Ago', daysAgo: 90, icon: '📅' },
];

const LAND_UNITS = ['Acres', 'Gunthas', 'Hectares', 'Bighas'];

const BENEFITS = [
  { id: '1', icon: '🌿', text: 'Get AI-powered\ndisease alerts' },
  { id: '2', icon: '📊', text: 'Track crop health\nover time' },
  { id: '3', icon: '📄', text: 'Personalized\nadvisories' },
  { id: '4', icon: '🌦️', text: 'Weather-based\ncrop guidance' },
  { id: '5', icon: '🛡️', text: 'Increase yield\nand farm income' },
];

const TIPS = [
  'Select the correct crop',
  'Enter accurate variety',
  'Provide actual farm area',
  'Choose the correct sowing time',
  'Update current crop stage',
  'Keep your information up to date',
];

export const AddCropScreen: React.FC<AddCropScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 960;
  const isTablet = windowWidth >= 680 && windowWidth < 960;

  const [selectedCrop, setSelectedCrop] = useState(COMMON_CROPS[0]);
  const [variety, setVariety] = useState(COMMON_CROPS[0].defaultVariety);
  const [areaValue, setAreaValue] = useState('2.5');
  const [areaUnit, setAreaUnit] = useState('Acres');
  const [selectedPeriod, setSelectedPeriod] = useState(SOWING_PERIODS[2]);
  const [selectedStage, setSelectedStage] = useState('sowing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectCrop = (crop: typeof COMMON_CROPS[0]) => {
    setSelectedCrop(crop);
    setVariety(crop.defaultVariety);
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    if (!variety.trim()) {
      setErrorMessage('Please enter crop variety');
      return;
    }
    if (!areaValue.trim()) {
      setErrorMessage('Please specify farm acreage');
      return;
    }

    try {
      setIsSubmitting(true);
      const sowingDate = new Date(Date.now() - selectedPeriod.daysAgo * 86400000);
      const formattedArea = `${areaValue} ${areaUnit}`;

      await apiService.createCrop({
        cropName: selectedCrop.name,
        variety: variety.trim(),
        area: formattedArea,
        sowingDate: sowingDate.toISOString(),
      });

      navigation.goBack();
    } catch (err: any) {
      const msg =
        err.response?.data?.error || err.message || 'Failed to add crop. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              paddingBottom: Math.max(insets.bottom + 40, 50),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            {/* Top Navigation & Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.titleRow}>
                  <Text style={styles.headerEmoji}>🌱</Text>
                  <Text style={styles.headerTitle}>Add New Crop / फसल जोड़ें</Text>
                </View>

                <Text style={styles.headerSubtitle}>
                  Register your crop for AI disease tracking and personalized advisory
                </Text>
              </View>

              {/* Header Right Badge */}
              <View style={styles.headerRightBadge}>
                <Text style={styles.badgeEmoji}>🌿</Text>
                <View>
                  <Text style={styles.badgeTextTop}>Healthy Farms</Text>
                  <Text style={styles.badgeTextBottom}>Happy Farmers</Text>
                </View>
              </View>
            </View>

            {/* Main 3-Column Layout on Desktop */}
            <View style={isDesktop ? styles.desktopGrid : styles.mobileGrid}>
              {/* LEFT COLUMN: Agricultural Benefits Panel */}
              {isDesktop && (
                <View style={styles.desktopLeftCol}>
                  <View style={styles.benefitsCard}>
                    <Text style={styles.benefitsTitle}>Better Crop</Text>
                    <Text style={styles.benefitsTitle}>Better Tomorrow</Text>
                    <View style={styles.benefitsDivider} />

                    <View style={styles.benefitsList}>
                      {BENEFITS.map((item) => (
                        <View key={item.id} style={styles.benefitItemRow}>
                          <View style={styles.benefitIconBox}>
                            <Text style={styles.benefitEmoji}>{item.icon}</Text>
                          </View>
                          <Text style={styles.benefitText}>{item.text}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.benefitsQuoteWrap}>
                      <Text style={styles.benefitsQuote}>
                        “Healthy Crops,{'\n'}Prosperous Farmers,{'\n'}Sustainable India”
                      </Text>
                      <Text style={styles.benefitsQuoteLeaf}>🌿</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* CENTER COLUMN: Main Crop Registration Form Card */}
              <View style={isDesktop ? styles.desktopCenterCol : styles.mobileCenterCol}>
                <View style={styles.formCard}>
                  {/* Error Notification */}
                  {!!errorMessage && (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorEmoji}>⚠️</Text>
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  )}

                  {/* STEP 1: Select Crop */}
                  <View style={styles.formSection}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>1</Text>
                      </View>
                      <View style={styles.sectionTitleGroup}>
                        <Text style={styles.sectionTitle}>Select Crop / फसल चुनें</Text>
                        <Text style={styles.sectionSub}>Choose the crop you want to register</Text>
                      </View>
                    </View>

                    <View style={styles.cropsGrid}>
                      {COMMON_CROPS.map((crop) => {
                        const isSelected = selectedCrop.name === crop.name;
                        return (
                          <TouchableOpacity
                            key={crop.name}
                            style={[
                              styles.cropCard,
                              isSelected && styles.cropCardSelected,
                            ]}
                            onPress={() => handleSelectCrop(crop)}
                            activeOpacity={0.75}
                          >
                            {isSelected && (
                              <View style={styles.cropCheckCircle}>
                                <Text style={styles.cropCheckIcon}>✓</Text>
                              </View>
                            )}
                            <Text style={styles.cropCardEmoji}>{crop.icon}</Text>
                            <Text
                              style={[
                                styles.cropCardName,
                                isSelected && styles.cropCardNameSelected,
                              ]}
                            >
                              {crop.name}
                            </Text>
                            <Text style={styles.cropCardLocal}>{crop.local}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* STEP 2: Variety */}
                  <View style={styles.formSection}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>2</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Variety / किस्म / రకం</Text>
                    </View>

                    <View style={styles.inputWithIconWrap}>
                      <Text style={styles.inputPrefixIcon}>🌱</Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter variety name (e.g., Abhinav, PKM-1, etc.)"
                        placeholderTextColor="#8C9B90"
                        value={variety}
                        onChangeText={setVariety}
                      />
                    </View>
                  </View>

                  {/* STEP 3: Farm Acreage */}
                  <View style={styles.formSection}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>3</Text>
                      </View>
                      <Text style={styles.sectionTitle}>Farm Acreage / खेती का क्षेत्र</Text>
                    </View>

                    <View style={styles.acreageRow}>
                      <View style={styles.acreageInputWrap}>
                        <Text style={styles.acreagePrefixIcon}>📈</Text>
                        <TextInput
                          style={styles.acreageInput}
                          placeholder="2.5"
                          placeholderTextColor="#8C9B90"
                          keyboardType="numeric"
                          value={areaValue}
                          onChangeText={setAreaValue}
                        />
                      </View>

                      <View style={styles.unitsPillsRow}>
                        {LAND_UNITS.map((unit) => {
                          const isSelected = areaUnit === unit;
                          return (
                            <TouchableOpacity
                              key={unit}
                              style={[
                                styles.unitPill,
                                isSelected && styles.unitPillSelected,
                              ]}
                              onPress={() => setAreaUnit(unit)}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.unitPillText,
                                  isSelected && styles.unitPillTextSelected,
                                ]}
                              >
                                {unit}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  {/* STEP 4: Sowing Time */}
                  <View style={styles.formSection}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>4</Text>
                      </View>
                      <Text style={styles.sectionTitle}>
                        Sowing Time / बुआई कब की? / విత్తనాలు వేసిన సమయం
                      </Text>
                    </View>

                    <View style={styles.sowingPeriodsRow}>
                      {SOWING_PERIODS.map((period) => {
                        const isSelected = selectedPeriod.label === period.label;
                        return (
                          <TouchableOpacity
                            key={period.label}
                            style={[
                              styles.periodCard,
                              isSelected && styles.periodCardSelected,
                            ]}
                            onPress={() => setSelectedPeriod(period)}
                            activeOpacity={0.75}
                          >
                            <Text style={styles.periodCardIcon}>{period.icon}</Text>
                            <Text
                              style={[
                                styles.periodCardText,
                                isSelected && styles.periodCardTextSelected,
                              ]}
                            >
                              {period.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* STEP 5: Current Crop Stage */}
                  <View style={styles.formSection}>
                    <View style={styles.sectionHeaderRow}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>5</Text>
                      </View>
                      <Text style={styles.sectionTitle}>
                        Current Stage / फसल की वर्तमान स्थिति / ప్రస్తుత దశ
                      </Text>
                    </View>

                    <View style={styles.stagesRow}>
                      {STAGES.map((stg) => {
                        const isSelected = selectedStage === stg.key;
                        return (
                          <TouchableOpacity
                            key={stg.key}
                            style={[
                              styles.stageCard,
                              isSelected && styles.stageCardSelected,
                            ]}
                            onPress={() => setSelectedStage(stg.key)}
                            activeOpacity={0.75}
                          >
                            <Text style={styles.stageCardIcon}>{stg.icon}</Text>
                            <Text
                              style={[
                                styles.stageCardName,
                                isSelected && styles.stageCardNameSelected,
                              ]}
                            >
                              {stg.name}
                            </Text>
                            <Text
                              style={[
                                styles.stageCardLocal,
                                isSelected && styles.stageCardLocalSelected,
                              ]}
                            >
                              {stg.local}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* CTA Submit Button */}
                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      isSubmitting && styles.registerButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.registerButtonText}>
                        ✓ Register Crop / फसल दर्ज करें
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* RIGHT COLUMN: Tips for Better Results */}
              {isDesktop && (
                <View style={styles.desktopRightCol}>
                  <View style={styles.tipsCard}>
                    <View style={styles.tipsHeaderRow}>
                      <Text style={styles.tipsHeaderEmoji}>💡</Text>
                      <Text style={styles.tipsHeaderTitle}>Tips for Better Results</Text>
                    </View>

                    <View style={styles.tipsList}>
                      {TIPS.map((tip, idx) => (
                        <View key={idx} style={styles.tipItemRow}>
                          <View style={styles.tipCheckCircle}>
                            <Text style={styles.tipCheckIcon}>✓</Text>
                          </View>
                          <Text style={styles.tipItemText}>{tip}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Bottom AI Advisory Callout */}
                    <View style={styles.tipsCallout}>
                      <Text style={styles.calloutEmoji}>🌱</Text>
                      <Text style={styles.calloutText}>
                        <Text style={{ fontWeight: '800' }}>Accurate information</Text> helps us
                        give you better AI-based advisories!
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Mobile / Tablet Extra Panels (Appears below form on small screens) */}
            {!isDesktop && (
              <View style={styles.mobileExtraPanels}>
                {/* Tips Panel */}
                <View style={styles.tipsCardMobile}>
                  <View style={styles.tipsHeaderRow}>
                    <Text style={styles.tipsHeaderEmoji}>💡</Text>
                    <Text style={styles.tipsHeaderTitle}>Tips for Better Results</Text>
                  </View>
                  <View style={styles.tipsList}>
                    {TIPS.map((tip, idx) => (
                      <View key={idx} style={styles.tipItemRow}>
                        <View style={styles.tipCheckCircle}>
                          <Text style={styles.tipCheckIcon}>✓</Text>
                        </View>
                        <Text style={styles.tipItemText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.tipsCallout}>
                    <Text style={styles.calloutEmoji}>🌱</Text>
                    <Text style={styles.calloutText}>
                      Accurate information helps us give you better AI-based advisories!
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
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
    maxWidth: 1240,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    minWidth: 280,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backText: {
    color: '#D7F5DB',
    fontSize: 14,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 26,
    marginRight: 8,
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
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerRightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 68, 35, 0.88)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    gap: 10,
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeTextTop: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  badgeTextBottom: {
    color: '#A5D6A7',
    fontSize: 11,
    fontWeight: '700',
  },
  desktopGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  mobileGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  desktopLeftCol: {
    width: 200,
  },
  desktopCenterCol: {
    flex: 1,
  },
  desktopRightCol: {
    width: 240,
  },
  mobileCenterCol: {
    width: '100%',
  },
  benefitsCard: {
    backgroundColor: 'rgba(10, 40, 18, 0.88)',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  benefitsDivider: {
    width: 32,
    height: 3,
    backgroundColor: '#66BB6A',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 16,
  },
  benefitsList: {
    gap: 14,
    marginBottom: 20,
  },
  benefitItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(26, 85, 40, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitEmoji: {
    fontSize: 18,
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 15,
    flex: 1,
  },
  benefitsQuoteWrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 14,
    alignItems: 'center',
  },
  benefitsQuote: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
  benefitsQuoteLeaf: {
    fontSize: 16,
    marginTop: 6,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    gap: 8,
  },
  errorEmoji: {
    fontSize: 18,
  },
  errorText: {
    color: '#C62828',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  formSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionTitleGroup: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3822',
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#667085',
    marginTop: 1,
    fontWeight: '500',
  },
  cropsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cropCard: {
    width: '18.4%',
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: '#FAFCFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2EBE4',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    position: 'relative',
  },
  cropCardSelected: {
    backgroundColor: '#E8F8EC',
    borderColor: '#2E7D32',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  cropCheckCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropCheckIcon: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  cropCardEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  cropCardName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1A3822',
    textAlign: 'center',
  },
  cropCardNameSelected: {
    color: '#1B5E20',
  },
  cropCardLocal: {
    fontSize: 9.5,
    color: '#607267',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
  inputWithIconWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFCFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2EBE4',
    paddingHorizontal: 14,
    height: 48,
  },
  inputPrefixIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    color: '#1A3822',
    fontWeight: '600',
  },
  acreageRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  acreageInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFCFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2EBE4',
    paddingHorizontal: 14,
    height: 48,
    width: 140,
  },
  acreagePrefixIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  acreageInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '800',
    color: '#1A3822',
  },
  unitsPillsRow: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    minWidth: 260,
  },
  unitPill: {
    flex: 1,
    height: 48,
    backgroundColor: '#FAFCFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2EBE4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  unitPillSelected: {
    backgroundColor: '#E8F8EC',
    borderColor: '#2E7D32',
  },
  unitPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#4B5C52',
  },
  unitPillTextSelected: {
    color: '#1B5E20',
    fontWeight: '900',
  },
  sowingPeriodsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  periodCard: {
    flex: 1,
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2EBE4',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  periodCardSelected: {
    backgroundColor: '#E8F8EC',
    borderColor: '#2E7D32',
  },
  periodCardIcon: {
    fontSize: 14,
  },
  periodCardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5C52',
  },
  periodCardTextSelected: {
    color: '#1B5E20',
    fontWeight: '900',
  },
  stagesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  stageCard: {
    flex: 1,
    minWidth: 95,
    backgroundColor: '#FAFCFA',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2EBE4',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  stageCardSelected: {
    backgroundColor: '#E8F8EC',
    borderColor: '#2E7D32',
  },
  stageCardIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  stageCardName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A3822',
    textAlign: 'center',
  },
  stageCardNameSelected: {
    color: '#1B5E20',
  },
  stageCardLocal: {
    fontSize: 9,
    color: '#607267',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
  stageCardLocalSelected: {
    color: '#2E7D32',
  },
  registerButton: {
    backgroundColor: '#1E7036',
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#1E7036',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  tipsCardMobile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  tipsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  tipsHeaderEmoji: {
    fontSize: 18,
  },
  tipsHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1A3822',
  },
  tipsList: {
    gap: 10,
    marginBottom: 16,
  },
  tipItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#66BB6A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCheckIcon: {
    color: '#07240E',
    fontSize: 11,
    fontWeight: '900',
  },
  tipItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E33',
    flex: 1,
  },
  tipsCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8EC',
    borderRadius: 14,
    padding: 10,
    gap: 8,
  },
  calloutEmoji: {
    fontSize: 20,
  },
  calloutText: {
    fontSize: 11,
    color: '#1A3822',
    lineHeight: 15,
    flex: 1,
  },
  mobileExtraPanels: {
    marginTop: 8,
  },
});

export default AddCropScreen;
