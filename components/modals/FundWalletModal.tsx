import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Vibration, Platform } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency, shortenAddress } from '@/utils/format';
import { Wallet, X, Zap, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Coins, MoveLeft } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';

interface FundWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FundWalletModal({ visible, onClose }: FundWalletModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { selectedWallet, fundWallet, refreshWallets, syncWallet } = useWallet();
  const { colors } = useTheme();
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleFund = async () => {
  if (!selectedWallet) return;

  setLoading(true);
  try {
    await fundWallet(selectedWallet.wallet_id);

    // 🔥 Immediately sync after funding
    await syncWallet(selectedWallet.wallet_id);

    // ✅ Refresh the wallets list to update context/global state
    await refreshWallets();

    scale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );

    if (Platform.OS !== 'web') Vibration.vibrate(200);

    setSuccess(true);

    Toast.show({
      type: 'success',
      text1: '✅ Funded Successfully!',
      text2: 'Friendbot said: "Drip activated 💧"',
    });

    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 3000);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fund wallet';

    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1.05, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    if (Platform.OS !== 'web') {
      Vibration.vibrate([100, 50, 100]);
    }

    // Log the error (recommended for debugging)
    console.error("🚨 Fund Wallet Error:", errorMessage);

    // Hilarious + helpful error handling
    if (errorMessage.includes('already funded')) {
      Alert.alert(
        '🔒 Already Funded',
        'This wallet’s got that Friendbot love already. No double dipping on testnet! 😅',
        [{ text: 'OK', onPress: onClose }]
      );
    } else if (errorMessage.includes('500')) {
      Alert.alert(
        '💀 Server Error',
        'Friendbot is probably napping. Try again later or check your connection 💤',
        [{ text: 'OK', onPress: onClose }]
      );
    } else if (errorMessage.includes('401')) {
      Alert.alert(
        '🔐 Auth Expired',
        'Your session’s expired. Time to log back in and flex again.',
        [{ text: 'OK', onPress: onClose }]
      );
    } else {
      Alert.alert(
        '🚫 Funding Failed',
        `Something went wrong:\n\n${errorMessage}`,
        [{ text: 'OK', onPress: onClose }]
      );
    }
  } finally {
    setLoading(false);
  }
};


  const handleClose = () => {
    setSuccess(false);
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
          <Text style={[styles.title, { color: colors.text }]} className="text-2xl font-bold">
            Fund Wallet
          </Text>
          <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full justify-center items-center"
                          style={{ backgroundColor: `${colors.textMuted}20` }}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.content} className="flex-1 p-6 justify-center">
          {success ? (
            <Animated.View style={[styles.successContainer, animatedStyle]} className="items-center">
              <View style={[styles.successIcon, { backgroundColor: `${colors.success}20` }]} 
                    className="w-24 h-24 rounded-full justify-center items-center mb-6">
                <CheckCircle size={48} color={colors.success} />
              </View>
              <Text style={[styles.successTitle, { color: colors.success }]} className="text-2xl font-bold mb-2 text-center">
                Wallet Funded Successfully!
              </Text>
              <Text style={[styles.successSubtitle, { color: colors.textMuted }]} className="text-base text-center leading-6">
                Your wallet has been funded with 10,000 XLM from Friendbot
              </Text>
            </Animated.View>
          ) : (
            <Animated.View style={animatedStyle}>
              <View style={styles.iconSection} className="items-center mb-8">
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]} 
                      className="w-20 h-20 rounded-full justify-center items-center mb-4">
                  <Coins size={32} color={colors.primary} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]} className="text-2xl font-bold mb-2 text-center">
                  Fund Your Wallet
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]} className="text-base text-center leading-6">
                  Get 10,000 XLM from Friendbot to start transacting on the Stellar testnet
                </Text>
              </View>

              <Card style={styles.walletCard} elevated>
                <View style={styles.walletInfo} className="flex-row items-center mb-6">
                  <View style={[styles.walletIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                        className="w-12 h-12 rounded-full justify-center items-center mr-4">
                    <Wallet size={24} color={colors.primary} />
                  </View>
                  
                    <View className="flex-1">
                      <Text style={[styles.walletName, { color: colors.text }]} className="text-lg font-bold">
                        {selectedWallet?.wallet_name || 'Default Wallet'}
                      </Text>
                      <Text style={[styles.walletAddress, { color: colors.textMuted }]} className="text-sm font-mono">
                        {selectedWallet ? shortenAddress(selectedWallet.public_key) : 'Loading...'}
                      </Text>
                    </View>
                    <View className="flex-end">
                      <Text style={[styles.balanceLabel, { color: colors.textMuted }]} className="text-xs font-semibold">
                        Current Balance
                      </Text>
                      <Text style={[styles.balanceAmount, { color: colors.text }]} className="text-lg font-bold">
                        {formatCurrency(parseFloat(selectedWallet?.balance_xlm || '0'), 'XLM')}
                      </Text>
                    </View>
                  
                </View>

                <View style={[styles.fundingInfo, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]} 
                      className="p-4 border-2 rounded-2xl mb-6">
                  <View style={styles.fundingHeader} className="flex-row items-center mb-3">
                    <AlertTriangle size={20} color={colors.warning} />
                    <Text style={[styles.fundingTitle, { color: colors.warning }]} className="text-base font-bold ml-2">
                      Testnet Funding
                    </Text>
                  </View>
                  <Text style={[styles.fundingText, { color: colors.textMuted }]} className="text-sm leading-5">
                    • This will fund your wallet with 10,000 XLM from Friendbot{'\n'}
                    • Each wallet can only be funded once on the testnet{'\n'}
                    • Funding is free and instant for testing purposes
                  </Text>
                </View>

                
              </Card>
              
            </Animated.View>
          )}
        </View>
        <View style={styles.footer} className="p-6">
          <Button
            title="Fund Your Testnet Wallet!"
            onPress={handleFund}
            loading={loading}
            fullWidth
            size="large"
            style={styles.fundButton}
          />
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  walletCard: {
    marginBottom: 24,
  },
  walletInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  walletName: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingRight: 56,
  },
  walletAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  fundingInfo: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  fundingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fundingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  fundingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  fundButton: {
    
  },
  walletData: {

  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});