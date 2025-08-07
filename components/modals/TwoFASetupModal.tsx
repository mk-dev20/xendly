import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, ScrollView, Vibration, Platform } from 'react-native';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { Shield, X, Smartphone, Copy, CircleCheck as CheckCircle, Key, Download, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

interface TwoFASetupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TwoFASetupModal({ visible, onClose, onSuccess }: TwoFASetupModalProps) {
  const [step, setStep] = useState(1); // 1: Setup, 2: Verify, 3: Success
  const [setupData, setSetupData] = useState<any>(null);
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const { colors } = useTheme();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

    useEffect(() => {
      if (visible) {
        loadSetupData();
        setStep(1);
        setTotpCode('');
        setBackupCodes([]);
        setSecretCopied(false);
      }
    }, [visible]);

    const loadSetupData = async () => {
      setLoading(true);
      try {
        const data = await apiService.setup2FA();
        setSetupData(data);
      } catch (error) {
        Alert.alert('Setup Error', 'Failed to initialize 2FA setup. Please try again.');
        onClose();
      } finally {
        setLoading(false);
      }
    };

  const copySecret = async () => {
    if (!setupData?.secret_key) return;
    
    await Clipboard.setStringAsync(setupData.secret_key);
    setSecretCopied(true);
    
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
    
    setTimeout(() => setSecretCopied(false), 3000);
  };

  const copyBackupCodes = async () => {
    if (backupCodes.length === 0) return;
    
    const codesText = backupCodes.join('\n');
    await Clipboard.setStringAsync(codesText);
    
    if (Platform.OS !== 'web') {
      Vibration.vibrate(100);
    }
    
    Alert.alert('Copied!', 'Backup codes copied to clipboard. Store them safely!');
  };

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

    setLoading(true);
    try {
      const response = await apiService.enable2FA(totpCode);
      
      // Success animation
      scale.value = withSequence(
        withSpring(1.1, { damping: 8 }),
        withSpring(1, { damping: 8 })
      );
      
      if (Platform.OS !== 'web') {
        Vibration.vibrate(200);
      }
      
      if (response.backup_codes && response.backup_codes.length > 0) {
        setBackupCodes(response.backup_codes);
        setStep(3);
      } else {
        Alert.alert('Success!', '2FA has been enabled successfully!', [
          { text: 'Done', onPress: () => { handleClose(); onSuccess(); } }
        ]);
      }
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
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setTotpCode('');
    setSetupData(null);
    setSecretCopied(false);
    setBackupCodes([]);
    onClose();
  };

  const handleFinish = () => {
    handleClose();
    onSuccess();
    Alert.alert('2FA Enabled!', 'Your account is now secured with two-factor authentication.');
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
          <Text style={[styles.title, { color: colors.text }]} className="text-2xl font-bold">
            {step === 1 ? 'Secure Your Account' : step === 2 ? 'Verify Setup' : 'Backup Codes'}
          </Text>
          <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full justify-center items-center"
                          style={{ backgroundColor: `${colors.textMuted}20` }}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} className="flex-1" showsVerticalScrollIndicator={false}>
          {loading && step === 1 ? (
            <View style={styles.loadingContainer} className="flex-1 justify-center items-center py-20">
              <View style={[styles.loadingIcon, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-16 h-16 rounded-full justify-center items-center mb-4">
                <Shield size={32} color={colors.primary} />
              </View>
              <Text style={[styles.loadingText, { color: colors.textMuted }]} className="text-base font-semibold">
                Setting up 2FA...
              </Text>
            </View>
          ) : step === 1 ? (
            <View style={styles.setupStep} className="p-6">
              <View style={styles.iconSection} className="items-center mb-8">
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]} 
                      className="w-20 h-20 rounded-full justify-center items-center mb-4">
                  <Shield size={32} color={colors.primary} />
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]} className="text-2xl font-bold mb-2">
                  Secure Your Xendly Account
                </Text>
                <Text style={[styles.stepSubtitle, { color: colors.textMuted }]} className="text-base text-center leading-6">
                  Set up two-factor authentication using Google Authenticator or any TOTP app
                </Text>
              </View>

              {setupData && (
                <Card style={styles.qrCard} elevated>
                  <Text style={[styles.sectionTitle, { color: colors.text }]} className="text-lg font-bold mb-6 text-center">
                    Step 1: Scan QR Code
                  </Text>
                  
                  <View style={styles.qrSection} className="items-center mb-6">
                    <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]} className="p-6 rounded-2xl">
                      <QRCode
                        value={`otpauth://totp/Xendly:${setupData.secret_key}?secret=${setupData.secret_key}&issuer=Xendly`}
                        size={200}
                        color="#000000"
                        backgroundColor="#FFFFFF"
                      />
                    </View>
                    <Text style={[styles.qrLabel, { color: colors.textMuted }]} className="text-sm mt-4 text-center font-semibold">
                      Scan with Google Authenticator or any TOTP app
                    </Text>
                  </View>

                  <Text style={[styles.sectionTitle, { color: colors.text }]} className="text-lg font-bold mb-4 text-center">
                    Step 2: Manual Entry (Optional)
                  </Text>

                  <View style={[styles.secretContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                        className="p-4 border-2 rounded-2xl mb-6">
                    <Text style={[styles.secretLabel, { color: colors.textMuted }]} className="text-xs font-bold uppercase tracking-wider mb-2">
                      Secret Key
                    </Text>
                    <Text style={[styles.secretKey, { color: colors.text }]} className="text-sm font-mono leading-5 mb-3">
                      {setupData.secret_key}
                    </Text>
                    <Button
                      title={secretCopied ? "Copied!" : "Copy Secret Key"}
                      onPress={copySecret}
                      variant={secretCopied ? "ghost" : "outline"}
                      size="small"
                      style={secretCopied ? { backgroundColor: `${colors.success}20` } : undefined}
                      textStyle={secretCopied ? { color: colors.success } : undefined}
                    />
                  </View>

                  <Button
                    title="I've Added the Account"
                    onPress={() => setStep(2)}
                    fullWidth
                    size="large"
                  />
                </Card>
              )}
            </View>
          ) : step === 2 ? (
            <Animated.View style={[styles.verifyStep, animatedStyle]} className="p-6">
              <View style={styles.iconSection} className="items-center mb-8">
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]} 
                      className="w-20 h-20 rounded-full justify-center items-center mb-4">
                  <Smartphone size={32} color={colors.primary} />
                </View>
                <Text style={[styles.stepTitle, { color: colors.text }]} className="text-2xl font-bold mb-2">
                  Verify with Google Authenticator
                </Text>
                <Text style={[styles.stepSubtitle, { color: colors.textMuted }]} className="text-base text-center leading-6">
                  Enter the 6-digit code from your authenticator app to complete setup
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

                <View style={styles.verifyButtons} className="flex-row gap-3 mt-4">
                  <Button
                    title="Back"
                    onPress={() => setStep(1)}
                    variant="outline"
                    style={styles.backButton}
                  />
                  <Button
                    title="Enable 2FA"
                    onPress={handleVerify}
                    loading={loading}
                    disabled={totpCode.length !== 6}
                    style={styles.verifyButton}
                  />
                </View>
              </Card>
            </Animated.View>
          ) : (
            <View style={styles.successStep} className="p-6">
              <View style={styles.iconSection} className="items-center mb-8">
                <View style={[styles.successIconContainer, { backgroundColor: `${colors.success}20` }]} 
                      className="w-20 h-20 rounded-full justify-center items-center mb-4">
                  <CheckCircle size={32} color={colors.success} />
                </View>
                <Text style={[styles.stepTitle, { color: colors.success }]} className="text-2xl font-bold mb-2">
                  2FA Enabled Successfully!
                </Text>
                <Text style={[styles.stepSubtitle, { color: colors.textMuted }]} className="text-base text-center leading-6">
                  Save these backup codes in a secure location. You can use them if you lose access to your authenticator.
                </Text>
              </View>

              <Card style={styles.backupCard} elevated>
                <View style={styles.backupHeader} className="flex-row items-center justify-between mb-4">
                  <Text style={[styles.backupTitle, { color: colors.text }]} className="text-lg font-bold">
                    Backup Recovery Codes
                  </Text>
                  <TouchableOpacity onPress={copyBackupCodes} className="flex-row items-center px-3 py-2 rounded-full"
                                  style={{ backgroundColor: `${colors.primary}20` }}>
                    <Copy size={16} color={colors.primary} />
                    <Text style={[styles.copyText, { color: colors.primary }]} className="text-sm font-bold ml-1">
                      Copy All
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.codesContainer, { backgroundColor: colors.background, borderColor: colors.border }]} 
                      className="p-4 border-2 rounded-2xl mb-6">
                  {backupCodes.map((code, index) => (
                    <Text key={index} style={[styles.backupCode, { color: colors.text }]} className="text-sm font-mono mb-2">
                      {String(index + 1).padStart(2, '0')}. {code}
                    </Text>
                  ))}
                </View>

                <View style={[styles.warningContainer, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]} 
                      className="p-4 border-2 rounded-2xl mb-6">
                  <View style={styles.warningHeader} className="flex-row items-center mb-2">
                    <AlertTriangle size={18} color={colors.warning} />
                    <Text style={[styles.warningTitle, { color: colors.warning }]} className="text-sm font-bold ml-2">
                      Important Security Notice
                    </Text>
                  </View>
                  <Text style={[styles.warningText, { color: colors.textMuted }]} className="text-sm leading-5">
                    • Store these codes in a secure password manager{'\n'}
                    • Each code can only be used once{'\n'}
                    • You'll need them if you lose your authenticator device
                  </Text>
                </View>

                <Button
                  title="I've Saved My Backup Codes"
                  onPress={handleFinish}
                  fullWidth
                  size="large"
                />
              </Card>
            </View>
          )}
        </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  setupStep: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  verifyStep: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  successStep: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  qrCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 24,
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qrLabel: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  secretContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  secretLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  secretKey: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginBottom: 12,
  },
  verifyCard: {
    marginBottom: 24,
  },
  verifyButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
  },
  verifyButton: {
    flex: 2,
  },
  backupCard: {
    marginBottom: 24,
  },
  backupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  copyText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  codesContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  backupCode: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  warningContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
});