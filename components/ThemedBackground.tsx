import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemedBackgroundProps {
  children: ReactNode;
  style?: any;
}

export function ThemedBackground({ children, style }: ThemedBackgroundProps) {
  const { isDark } = useTheme();

  if (isDark) {
    return (
      <LinearGradient
        colors={['#064E3B', '#0F172A', '#020617']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.container, style]}
        className="flex-1"
      >
        <View style={styles.darkGridPattern} />
        <View style={styles.darkGlow} />
        {children}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#9da00aff', '#F0FDF4', '#c9d8ceff']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.container, style]}
      className="flex-1"
    >
      <View style={styles.lightGridPattern} />
      <View style={styles.lightGlow} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkGridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
    backgroundColor: 'transparent',
  },
  lightGridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.04,
    backgroundColor: 'transparent',
  },
  darkGlow: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    height: 200,
    backgroundColor: '#10B981',
    opacity: 0.1,
    borderRadius: 100,
    transform: [{ scaleX: 2 }],
    filter: 'blur(60px)',
  },
  lightGlow: {
    position: 'absolute',
    top: '30%',
    left: '30%',
    right: '30%',
    height: 150,
    backgroundColor: '#34D399',
    opacity: 0.06,
    borderRadius: 75,
    transform: [{ scaleX: 1.5 }],
    filter: 'blur(40px)',
  },
});