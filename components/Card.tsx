import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevated?: boolean;
  className?: string;
}

export function Card({ children, style, padding = 16, elevated = true, className }: CardProps) {
  const { colors, isDark } = useTheme();

  const cardStyle = [
    styles.card,
    elevated && (isDark ? styles.elevatedDark : styles.elevatedLight),
    {
      backgroundColor: colors.surface,
      shadowColor: isDark ? colors.primary : '#000000',
      borderColor: colors.border,
      padding,
    },
    style,
  ];

  return (
    <View style={cardStyle} className={className}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  elevatedLight: {
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  elevatedDark: {
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
});