/**
 * AgriRaksha AI — ScreenBackground Component
 * 
 * Provides the signature foliage top framing and clean agricultural canvas
 * matching reference screens (Language, Login, OTP, Profile Setup, Dashboard).
 */

import React from 'react';
import { View, StyleSheet, Image, ViewStyle } from 'react-native';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  showFoliage?: boolean;
  style?: ViewStyle;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  children,
  showFoliage = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {showFoliage && (
        <Image
          source={require('../../assets/foliage_top.jpg')}
          style={styles.foliageImage}
          resizeMode="cover"
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    position: 'relative',
  },
  foliageImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 130,
    opacity: 0.92,
  },
});

export default ScreenBackground;
