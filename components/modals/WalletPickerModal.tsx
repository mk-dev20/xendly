import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency, shortenAddress } from '@/utils/format';
import { Wallet, Plus, X, CircleCheck as CheckCircle } from 'lucide-react-native';

const { height } = Dimensions.get('window');

interface WalletPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateNew: () => void;
}

export function WalletPickerModal({ visible, onClose, onCreateNew }: WalletPickerModalProps) {
  const { wallets, selectedWallet, selectWallet } = useWallet();
  const { colors } = useTheme();

  const handleSelectWallet = (wallet: any) => {
    selectWallet(wallet);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]} className="flex-1">
        <View style={styles.header} className="flex-row justify-between items-center p-6 border-b" 
              borderBottomColor={colors.border}>
          <Text style={[styles.title, { color: colors.text }]} className="text-2xl font-bold">
            Select Wallet
          </Text>
          <TouchableOpacity onPress={onClose} className="w-10 h-10 rounded-full justify-center items-center"
                          style={{ backgroundColor: `${colors.textMuted}20` }}>
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={wallets}
          keyExtractor={(item) => item.wallet_id}
          contentContainerStyle={styles.walletsList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectWallet(item)}>
              <Card style={styles.walletCard} className="mx-6 mb-4" elevated>
                <View style={styles.walletRow} className="flex-row items-center">
                  <View style={[styles.walletIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                        className="w-12 h-12 rounded-full justify-center items-center mr-4">
                    <Wallet size={24} color={colors.primary} />
                  </View>
                  <View style={styles.walletInfo} className="flex-1">
                    <Text style={[styles.walletName, { color: colors.text }]} className="text-lg font-bold mb-1">
                      {item.wallet_name}
                    </Text>
                    <Text style={[styles.walletAddress, { color: colors.textMuted }]} className="text-sm font-mono">
                      {shortenAddress(item.public_key)}
                    </Text>
                    <Text style={[styles.walletBalance, { color: colors.text }]} className="text-base font-semibold mt-2">
                      {formatCurrency(parseFloat(item.balance_xlm || '0'), 'XLM')}
                    </Text>
                  </View>
                  {selectedWallet?.wallet_id === item.wallet_id && (
                    <CheckCircle size={24} color={colors.success} />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />

        <View style={styles.footer} className="p-6">
          <Button
            title="Create New Wallet"
            onPress={onCreateNew}
            variant="outline"
            fullWidth
            size="large"
            style={styles.createButton}
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
  walletsList: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  walletCard: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  createButton: {
    marginTop: 8,
  },
});