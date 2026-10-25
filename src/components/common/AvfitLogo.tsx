import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
  variant?: 'brand' | 'light' | 'dark';
}

export default function AvfitLogo({
  size = 36,
  showWordmark = true,
  wordmarkColor,
  variant = 'brand',
}: LogoProps) {
  // Brand color scheme: Deep Forest Green (#244A32) & Terracotta Orange (#EB7142)
  const defaultAVColor = variant === 'light' ? '#FFFFFF' : '#244A32';
  const avColor = wordmarkColor || defaultAVColor;
  const fitColor = '#EB7142';

  // Proportional font sizing matching emblem
  const fontSize = Math.round(size * 0.54);

  return (
    <View style={styles.container}>
      {/* Official AVFIT Icon Emblem - Rendered with exact aspect ratio without cropping */}
      <View
        style={[
          styles.emblemContainer,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.24),
          },
        ]}
      >
        <Image
          source={require('../../../assets/avfit_official_logo.png')}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="contain"
        />
      </View>

      {showWordmark && (
        <View style={styles.wordmarkRow}>
          <Text style={[styles.wordmarkAV, { color: avColor, fontSize }]}>AV</Text>
          <Text style={[styles.wordmarkFIT, { color: fitColor, fontSize }]}>FIT</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emblemContainer: {
    overflow: 'hidden',
    backgroundColor: '#0F1115',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  wordmarkAV: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  wordmarkFIT: {
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
