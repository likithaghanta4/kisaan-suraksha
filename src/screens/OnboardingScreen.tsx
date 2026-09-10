/**
 * AgriRaksha AI — Onboarding Screen
 * 
 * Interactive 3-slide walkthrough introducing the farmer to:
 * 1. AI Leaf & Crop Disease Detection
 * 2. Hyperlocal Risk & Outbreak Alerts
 * 3. Expert Guidance & Government Support
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, FontSizes, Spacing } from '../constants';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  navigation: any;
}

interface SlideItem {
  id: string;
  emoji: string;
  badge: string;
  titleKey: string;
  descKey: string;
  accentBg: string;
}

const SLIDES: SlideItem[] = [
  {
    id: '1',
    emoji: '🔍🍃',
    badge: 'AI Powered',
    titleKey: 'onboarding.slide1Title',
    descKey: 'onboarding.slide1Desc',
    accentBg: '#E8F5E9',
  },
  {
    id: '2',
    emoji: '🌦️⚠️',
    badge: 'Real-Time Alerts',
    titleKey: 'onboarding.slide2Title',
    descKey: 'onboarding.slide2Desc',
    accentBg: '#FFF3E0',
  },
  {
    id: '3',
    emoji: '👨‍🌾🏛️',
    badge: 'KVK & Govt Support',
    titleKey: 'onboarding.slide3Title',
    descKey: 'onboarding.slide3Desc',
    accentBg: '#E3F2FD',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    navigation.replace('Login');
  };

  const handleLanguageSwitch = () => {
    navigation.navigate('LanguageSelect', { fromSettings: true });
  };

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Bar: Skip and Language Toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.langButton}
          onPress={handleLanguageSwitch}
          activeOpacity={0.7}
        >
          <Text style={styles.langButtonEmoji}>🌐</Text>
          <Text style={styles.langButtonText}>भाषा / Language</Text>
        </TouchableOpacity>

        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>{t('common.skip')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.illustrationContainer, { backgroundColor: item.accentBg }]}>
              <Text style={styles.slideEmoji}>{item.emoji}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            </View>

            <View style={styles.textContent}>
              <Text style={styles.slideTitle}>{t(item.titleKey)}</Text>
              <Text style={styles.slideDesc}>{t(item.descKey)}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom Section: Pagination Dots & Action Buttons */}
      <View style={styles.bottomSection}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                currentIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Primary CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>
            {currentIndex === SLIDES.length - 1
              ? t('onboarding.getStarted')
              : `${t('common.next')} →`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  langButtonEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  langButtonText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  skipText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: (width * 0.72) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  slideEmoji: {
    fontSize: 70,
  },
  badge: {
    position: 'absolute',
    bottom: Spacing.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  textContent: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  slideTitle: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  slideDesc: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 28,
    backgroundColor: Colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: Colors.border,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 2,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
