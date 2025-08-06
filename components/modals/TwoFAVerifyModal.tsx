import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Vibration, Platform } from 'react-native';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Smartphone, X, Shield } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring, withTiming } from 'react-native-reanimated';

interface TwoFAVerifyModalProps {
  visible: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

export function TwoFAVerifyModal({ 
  visible, 
  onClose, 
  onVerify, 
  title = "Verify with Google Authenticator",
  subtitle = "Enter the 6-digit code from your authenticator app",
  loading = false
}: TwoFAVerifyModalProps) {
  const [totpCode, setTotpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { colors } = useTheme();

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleVerify = async () => {
    if (!totpCode || totpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit code from Google Authenticator');
      
      // Error animation
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      
      if (Platform.OS !== 'web') {
        Vibration.vibrate([100, 50, 100]);
      }
      return;
    }

    setVerifying(true);
    try {
      await onVerify(totpCode);
      
      // Success animation
      scale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 8 })
      );
      
      if (Platform.OS !== 'web') {
        Vibration.vibrate(200);
      }
      
      setTotpCode('');
      onClose();
    } catch (error) {
      // Error animation
      scale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      
      if (Platform.OS !== 'web') {
        Vibration.vibrate([100, 50, 100, 50, 100]);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Invalid verification code';
      Alert.alert('Verification Failed', errorMessage + '. Please check your authenticator app and try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setTotpCode('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]} className="flex-1">
        <View style={styles.header} className="flex-row justify-between items-center p-6 border-b" 
              borderBottomColor={colors.border}>
          <Text style={[styles.modalTitle, { color: colors.text }]} className="text-2xl font-bold">
            2FA Verification
          </Text>
          <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full justify-center items-center"
                          style={{ backgroundColor: `${colors.textMuted}20` }}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.content} className="flex-1 p-6 justify-center">
          <Animated.View style={animatedStyle}>
            <View style={styles.iconSection} className="items-center mb-8">
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-20 h-20 rounded-full justify-center items-center mb-4">
                <Smartphone size={32} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.text }]} className="text-2xl font-bold mb-2 text-center">
                {title}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]} className="text-base text-center leading-6">
                {subtitle}
              </Text>
            </View>

            <Card style={styles.verifyCard} elevated>
              <Input
                label="Authentication Code"
                value={totpCode}
                onChangeText={setTotpCode}
                keyboardType="numeric"
                placeholder="000000"
                maxLength={6}
                helperText="Enter the 6-digit code from Google Authenticator"
              />

              <Button
                title="Verify Code"
                onPress={handleVerify}
                loading={verifying || loading}
                disabled={totpCode.length !== 6}
                fullWidth
                size="large"
                style={styles.verifyButton}
              />
            </Card>

            <View style={[styles.helpContainer, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]} 
                  className="mt-6 p-4 border-2 rounded-2xl">
              <View style={styles.helpHeader} className="flex-row items-center mb-2">
                <Shield size={16} color={colors.primary} />
                <Text style={[styles.helpTitle, { color: colors.primary }]} className="text-sm font-bold ml-2">
                  Need Help?
                </Text>
              </View>
              <Text style={[styles.helpText, { color: colors.textMuted }]} className="text-sm leading-5">
                • Make sure your device time is synchronized{'\n'}
                • Check that you're using the correct account in your authenticator app{'\n'}
                • Try refreshing the code if it's not working
              </Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  verifyCard: {
    marginBottom: 24,
  },
  verifyButton: {
    marginTop: 16,
  },
  helpContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
});