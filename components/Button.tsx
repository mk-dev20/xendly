import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  className,
}: ButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button, 
      styles[size], 
      fullWidth && styles.fullWidth,
      (disabled || loading) && styles.disabled,
    ];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, { 
          backgroundColor: colors.primary,
          shadowColor: colors.primary,
        }];
      case 'secondary':
        return [...baseStyle, { 
          backgroundColor: colors.accent,
          shadowColor: colors.accent,
        }];
      case 'outline':
        return [...baseStyle, { 
          backgroundColor: 'transparent', 
          borderWidth: 2, 
          borderColor: colors.primary,
          shadowOpacity: 0,
        }];
      case 'ghost':
        return [...baseStyle, { 
          backgroundColor: `${colors.primary}15`,
          shadowOpacity: 0,
        }];
      case 'danger':
        return [...baseStyle, { 
          backgroundColor: colors.error,
          shadowColor: colors.error,
        }];
      default:
        return [...baseStyle, { backgroundColor: colors.primary }];
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return [...baseStyle, { color: '#FFFFFF' }];
      case 'outline':
      case 'ghost':
        return [...baseStyle, { color: colors.primary }];
      default:
        return [...baseStyle, { color: '#FFFFFF' }];
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={className}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'secondary' || variant === 'danger' ? '#FFFFFF' : colors.primary} 
          size="small"
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 40,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.6,
  },
});