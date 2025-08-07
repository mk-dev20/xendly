import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { shortenAddress } from '@/utils/format';
import { QrCode, Copy, Share2, Wallet as WalletIcon, CircleCheck as CheckCircle } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { AlertTriangle } from 'lucide-react-native'; // using lucide


export default function ReceiveScreen() {
  const { selectedWallet, getReceiveInfo } = useWallet();
  const { colors } = useTheme();
  const [receiveInfo, setReceiveInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReceiveInfo();
  }, [selectedWallet]);

  const loadReceiveInfo = async () => {
    if (!selectedWallet) return;

    setLoading(true);
    try {
      const info = await getReceiveInfo(selectedWallet.wallet_id);
      setReceiveInfo(info);
    } catch (error) {
      console.error('Failed to load receive info:', error);
      Alert.alert('Error', 'Failed to load receive information');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!selectedWallet) return;
    
    await Clipboard.setStringAsync(selectedWallet.public_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareAddress = async () => {
    if (!selectedWallet) return;

    try {
      await Share.share({
        message: `Send me money on Xendly! My wallet address is: ${selectedWallet.public_key}`,
        title: 'My Xendly Wallet Address',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (loading) {
    return (
      <ThemedBackground>
        <LoadingSpinner />
      </ThemedBackground>
    );
  }

  return (
    <ThemedBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} className="flex-1">
        <View style={styles.header} className="px-6 mb-8 items-center">
          <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}20` }]} 
                className="w-16 h-16 rounded-full justify-center items-center mb-4">
            <QrCode size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]} className="text-3xl font-bold mb-2">
            Receive Money
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]} className="text-base text-center">
            Share your wallet address to receive payments
          </Text>
        </View>

        {/* Wallet Info Card */}
        <Card style={styles.walletCard} className="mx-6 mb-6" elevated>
          <View style={styles.walletHeader} className="flex-row items-center mb-6">
            <View style={[styles.walletIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                  className="w-12 h-12 rounded-full justify-center items-center mr-4">
              <WalletIcon size={24} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text style={[styles.walletName, { color: colors.text }]} className="text-lg font-bold">
                {selectedWallet?.wallet_name || 'Default Wallet'}
              </Text>
              <Text style={[styles.walletBalance, { color: colors.textMuted }]} className="text-sm">
                Balance: {selectedWallet?.balance_xlm || '0'} XLM
              </Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrSection} className="items-center mb-6">
            <View style={[styles.qrContainer, { backgroundColor: '#FFFFFF' }]} className="p-6 rounded-2xl">
              <QRCode
                value={selectedWallet?.public_key || ''}
                size={200}
                color="#000000"
                backgroundColor="#FFFFFF"
                logo={require('@/assets/images/icon.png')}
                logoSize={40}
                logoBackgroundColor="#FFFFFF"
                logoMargin={4}
              />
            </View>
            <Text style={[styles.qrLabel, { color: colors.textMuted }]} className="text-sm mt-4 text-center">
              Scan this QR code to get my wallet address
            </Text>
          </View>

          {/* Address Display */}
          <View style={[styles.addressContainer, { backgroundColor: colors.background, borderColor: colors.border }]} 
                className="p-4 rounded-2xl border-2 mb-6">
            <Text style={[styles.addressLabel, { color: colors.textMuted }]} className="text-xs font-bold uppercase tracking-wider mb-2">
              Stellar Address
            </Text>
            <Text style={[styles.address, { color: colors.text }]} className="text-base font-mono leading-6">
              {selectedWallet?.public_key || 'Loading...'}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons} className="flex-row gap-3">
            <Button
              title={copied ? "Copied!" : "Copy Address"}
              onPress={copyToClipboard}
              variant={copied ? "ghost" : "outline"}
              style={[styles.actionButton, copied && { backgroundColor: `${colors.success}20` }]}
              textStyle={copied ? { color: colors.success } : undefined}
              fullWidth
            />
            <Button
              title="Share"
              onPress={shareAddress}
              variant="primary"
              style={styles.actionButton}
              fullWidth
            />
          </View>
        </Card>

        

        {/* Security Notice */}
        <Card style={[styles.securityCard, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]} 
              className="mx-6 mb-10" elevated={false}>
          <View style={styles.securityHeader} className="flex-row items-center mb-3">
            <AlertTriangle size={20} color={colors.warning} />
            <Text style={[styles.securityTitle, { color: colors.warning }]} className="text-base font-bold ml-2">
              Security Notice
            </Text>
          </View>
          <Text style={[styles.securityText, { color: colors.textMuted }]} className="text-sm leading-5">
            Only share your wallet address with trusted contacts. Never share your private key or wallet password with anyone.
          </Text>
        </Card>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    alignItems: 'center',
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  walletCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
  qrLabel: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
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
  address: {
    fontSize: 16,
    fontFamily: 'monospace',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  assetsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  assetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  assetsList: {
    gap: 8,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  assetIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assetIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
  },
  noAssets: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  securityCard: {
    marginHorizontal: 24,
    marginBottom: 40,
    borderWidth: 1,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
  },
});