import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context';
import { Colors, FontSizes, Spacing } from '../constants';

const { width } = Dimensions.get('window');

interface AuthSuccessScreenProps {
  route?: {
    params?: {
      isNewUser?: boolean;
      phone?: string;
      token?: string;
      user?: any;
    };
  };
  navigation?: any;
}

export const AuthSuccessScreen: React.FC<AuthSuccessScreenProps> = ({
  route,
  navigation,
}) => {
  const { isNewUser = false, phone = '', token, user } = route?.params || {};
  const { t } = useTranslation();
  const { completeAuth } = useAuth();

  // Animation values
  const plantScale = useRef(new Animated.Value(0.2)).current;
  const leafRotate = useRef(new Animated.Value(0)).current;
  const sunPulse = useRef(new Animated.Value(0.8)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Plant grow & sun pulse animation
    Animated.parallel([
      Animated.spring(plantScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(leafRotate, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(sunPulse, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sunPulse, {
            toValue: 0.95,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(textFade, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Automated routing transition after success animation
    const timer = setTimeout(async () => {
      try {
        if (isNewUser) {
          navigation.replace('ProfileSetup', { phone });
        } else {
          if (token && user) {
            await completeAuth(token, user);
          }
          if (navigation?.replace) {
            navigation.replace('MainTabs');
          }
        }
      } catch (err) {
        console.error('Error during auth success transition:', err);
        if (navigation?.replace) {
          navigation.replace('MainTabs');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isNewUser, phone, token, user, navigation, plantScale, leafRotate, sunPulse, textFade, progressWidth, completeAuth]);

  const leafRotation = leafRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '0deg'],
  });

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8F3" />

      <View style={styles.container}>
        {/* Background Sun Glow */}
        <Animated.View
          style={[
            styles.sunGlow,
            {
              transform: [{ scale: sunPulse }],
            },
          ]}
        >
          <Text style={styles.sunEmoji}>☀️</Text>
        </Animated.View>

        {/* Plant Growing & Bloom Animation Container */}
        <View style={styles.plantContainer}>
          <Animated.View
            style={[
              styles.plantIconCircle,
              {
                transform: [
                  { scale: plantScale },
                  { rotate: leafRotation },
                ],
              },
            ]}
          >
            <Text style={styles.sproutEmoji}>🌱</Text>
          </Animated.View>
          <View style={styles.soilBed}>
            <Text style={styles.soilTexture}>🌾 🌿 🌾</Text>
          </View>
        </View>

        {/* Text Section */}
        <Animated.View style={[styles.textSection, { opacity: textFade }]}>
          <View style={styles.successBadge}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>

          <Text style={styles.welcomeTitle}>
            {t('auth.welcomeTitle', 'Welcome to Kisaan Suraksha!')}
          </Text>

          <Text style={styles.welcomeSub}>
            {t(
              'auth.welcomeSub',
              "Let's grow a healthier and brighter tomorrow together."
            )}
          </Text>
        </Animated.View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressBar, { width: progressBarWidth }]}
          />
        </View>
        <Text style={styles.loadingHint}>Starting your dashboard...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8F3',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  sunGlow: {
    position: 'absolute',
    top: 90,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  sunEmoji: {
    fontSize: 50,
  },
  plantContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: 60,
  },
  plantIconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E8F5E9',
    borderWidth: 4,
    borderColor: '#A5D6A7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  sproutEmoji: {
    fontSize: 64,
  },
  soilBed: {
    marginTop: -8,
    backgroundColor: '#EFEBE9',
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  soilTexture: {
    fontSize: 16,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  checkIcon: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '900',
    marginRight: 6,
  },
  verifiedText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '900',
    color: '#1B5E20',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  welcomeSub: {
    fontSize: FontSizes.sm + 1,
    color: '#49614B',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    maxWidth: 300,
    fontWeight: '500',
  },
  progressContainer: {
    width: width * 0.55,
    height: 6,
    backgroundColor: '#E2EBE2',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 40,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2E7D32',
    borderRadius: 3,
  },
  loadingHint: {
    fontSize: 11,
    color: '#8A9C8C',
    fontWeight: '600',
    marginTop: 10,
  },
});

export default AuthSuccessScreen;
