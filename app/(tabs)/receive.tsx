import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Vibration, Platform } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { formatCurrency, shortenAddress } from '@/utils/format';
import { Wallet, Copy, Share, QrCode, CircleCheck as CheckCircle, RefreshCw } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

interface ReceiveData {
  public_key: string;
  qr_code_url: string;
  supported_assets: string[];
  wallet_id: string;
  message?: string;
}

export default function ReceiveScreen() {
  const [receiveData, setReceiveData] = useState<ReceiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addressCopied, setAddressCopied] = useState(false);
  const { selectedWallet, refreshWallet } = useWallet();
  const { colors } = useTheme();
  
  const scale = useSharedValue(1);
  const copyScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const copyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: copyScale.value }],
  }));

  useEffect(() => {
    if (selectedWallet) {
      loadReceiveData();
    }
  }, [selectedWallet]);

  const loadReceiveData = async () => {
    if (!selectedWallet) return;
    
    setLoading(true);
    try {
      const data = await apiService.getWalletReceiveInfo(selectedWallet.wallet_id);
      setReceiveData(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load receive data';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = async () => {
    if (!receiveData?.public_key) return;
    
    await Clipboard.setStringAsync(receiveData.public_key);
    setAddressCopied(true);
    
    copyScale.value = withSequence(
      withSpring(1.1, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
    
    if (Platform.OS !== 'web') {
      Vibration.vibrate(100);
    }
    
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const shareQRCode = async () => {
    if (!receiveData?.public_key) return;
    
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(receiveData.public_key, {
          dialogTitle: 'Share Wallet Address',
        });
      } else {
        // Fallback to copying
        await copyAddress();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleRefresh = async () => {
    scale.value = withSequence(
      withSpring(0.95, { damping: 8 }),
      withSpring(1, { damping: 8 })
    );
    
    await Promise.all([
      loadReceiveData(),
      refreshWallet()
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} className="flex-1">
        <View style={styles.loadingContainer} className="flex-1 justify-center items-center">
          <RefreshCw size={32} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]} className="text-base mt-4">
            Loading receive information...
          </Text>
        </View>
      </View>
    );
  }

  if (!selectedWallet || !receiveData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} className="flex-1">
        <View style={styles.errorContainer} className="flex-1 justify-center items-center p-6">
          <Text style={[styles.errorText, { color: colors.textMuted }]} className="text-base text-center">
            No wallet selected or failed to load receive data
          </Text>
          <Button
            title="Retry"
            onPress={loadReceiveData}
            variant="outline"
            style={styles.retryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} className="flex-1">
      <ScrollView style={styles.content} className="flex-1" showsVerticalScrollIndicator={false}>
        <View style={styles.header} className="items-center mb-8">
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]} 
                className="w-20 h-20 rounded-full justify-center items-center mb-4">
            <QrCode size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]} className="text-2xl font-bold mb-2">
            Receive Funds
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]} className="text-base text-center">
            Share your wallet address or QR code to receive payments
          </Text>
        </View>

        <Card style={styles.walletCard} elevated>
          <View style={styles.walletHeader} className="flex-row items-center justify-between mb-6">
            <View style={styles.walletInfo} className="flex-row items-center flex-1">
              <View style={[styles.walletIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-12 h-12 rounded-full justify-center items-center mr-4">
                <Wallet size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text style={[styles.walletName, { color: colors.text }]} className="text-lg font-bold">
                  {selectedWallet.wallet_name}
                </Text>
                <Text style={[styles.walletBalance, { color: colors.textMuted }]} className="text-sm">
                  {formatCurrency(parseFloat(selectedWallet.balance_xlm), 'XLM')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleRefresh} className="w-10 h-10 rounded-full justify-center items-center"
                            style={{ backgroundColor: `${colors.textMuted}20` }}>
              <Animated.View style={animatedStyle}>
                <RefreshCw size={20} color={colors.textMuted} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={styles.qrSection} className="items-center mb-6">
            <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]} className="p-6 rounded-2xl">
              <QRCode
                value={receiveData.public_key}
                size={200}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={[styles.addressContainer, { backgroundColor: colors.background, borderColor: colors.border }]} 
                className="p-4 border-2 rounded-2xl mb-6">
            <Text style={[styles.addressLabel, { color: colors.textMuted }]} className="text-xs font-bold uppercase tracking-wider mb-2">
              Wallet Address
            </Text>
            <Text style={[styles.addressText, { color: colors.text }]} className="text-sm font-mono leading-5 mb-3">
              {receiveData.public_key}
            </Text>
            <View style={[styles.validationBadge, { backgroundColor: `${colors.success}20` }]} className="flex-row items-center px-3 py-2 rounded-full mb-3">
              <CheckCircle size={14} color={colors.success} />
              <Text style={[styles.validationText, { color: colors.success }]} className="text-xs font-bold ml-2">
                Valid Stellar Address
              </Text>
            </View>
            <View style={styles.addressActions} className="flex-row gap-3">
              <Animated.View style={[copyAnimatedStyle, { flex: 1 }]}>
                <Button
                  title={addressCopied ? "Copied!" : "Copy Address"}
                  onPress={copyAddress}
                  variant={addressCopied ? "ghost" : "outline"}
                  size="small"
                  style={addressCopied ? { backgroundColor: `${colors.success}20` } : undefined}
                  textStyle={addressCopied ? { color: colors.success } : undefined}
                />
              </Animated.View>
              <Button
                title="Share QR"
                onPress={shareQRCode}
                variant="outline"
                size="small"
                style={styles.shareButton}
              />
            </View>
          </View>

          {receiveData.supported_assets && receiveData.supported_assets.length > 0 && (
            <View style={[styles.assetsContainer, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]} 
                  className="p-4 border-2 rounded-2xl">
              <Text style={[styles.assetsTitle, { color: colors.primary }]} className="text-base font-bold mb-3">
                Supported Assets
              </Text>
              <View style={styles.assetsList} className="flex-row flex-wrap gap-2">
                {receiveData.supported_assets.map((asset, index) => (
                  <View key={index} style={[styles.assetTag, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }]} 
                        className="px-3 py-2 border rounded-full">
                    <Text style={[styles.assetText, { color: colors.primary }]} className="text-sm font-semibold">
                      {typeof asset === 'string' ? asset : 'Unknown Asset'}
                    </Text>
                  </View>
                helperText="Share this address to receive Stellar payments"
              </View>
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    marginTop: 16,
  },
  header: {
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
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  walletCard: {
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  walletName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletBalance: {
    fontSize: 14,
    marginTop: 2,
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
  addressContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
    marginBottom: 12,
  },
  validationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  validationText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
  },
  assetsContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  assetsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  assetsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assetTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  assetText: {
    fontSize: 14,
    fontWeight: '600',
  },
});