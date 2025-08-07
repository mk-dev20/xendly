import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Wallet, X, Plus } from 'lucide-react-native';

interface CreateWalletModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateWalletModal({ visible, onClose }: CreateWalletModalProps) {
  const [walletName, setWalletName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { createWallet, wallets } = useWallet();
  const { colors } = useTheme();

  const handleCreate = async () => {
    if (!walletName.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    // Check for duplicate wallet names
    const existingWallet = wallets.find(w => 
      w.wallet_name.toLowerCase() === walletName.trim().toLowerCase()
    );
    
    if (existingWallet) {
      Alert.alert('Error', 'A wallet with this name already exists');
      return;
    }

    setLoading(true);
    try {
      await createWallet(walletName.trim(), password);
      Alert.alert('Success', 'Wallet created successfully!');
      setWalletName('');
      setPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create wallet';
      Alert.alert('Creation Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setWalletName('');
    setPassword('');
    setConfirmPassword('');
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
        <KeyboardAvoidingView 
          style={styles.content} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View style={styles.header} className="flex-row justify-between items-center p-6 border-b" 
                borderBottomColor={colors.border}>
            <Text style={[styles.title, { color: colors.text }]} className="text-2xl font-bold">
              Create New Wallet
            </Text>
            <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full justify-center items-center"
                            style={{ backgroundColor: `${colors.textMuted}20` }}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.form} className="flex-1 p-6">
            <View style={styles.iconSection} className="items-center mb-8">
              <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-20 h-20 rounded-full justify-center items-center mb-4">
                <Plus size={24} color={colors.primary} />
              </View>
              <Text style={[styles.subtitle, { color: colors.textMuted }]} className="text-base text-center">
                Create a new Stellar wallet for secure transactions
              </Text>
            </View>

            <Card style={styles.formCard} elevated>
              <Input
                label="Wallet Name"
                value={walletName}
                onChangeText={setWalletName}
                placeholder="Enter wallet name"
                autoCapitalize="words"
                helperText="Choose a unique name to identify your Stellar wallet"
              />
              
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Create a strong password"
                helperText="Minimum 8 characters - secures your wallet's private key"
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm your password"
                error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              />
            </Card>

            <View style={styles.securityNotice} className="mt-6">
              <Text style={[styles.noticeText, { color: colors.textMuted }]} className="text-sm text-center leading-6">
                🔒 This password encrypts your Stellar private key locally. It cannot be recovered if lost, so store it securely.
              </Text>
            </View>
          </View>

          <View style={styles.footer} className="p-6">
            <Button
              title="Create Wallet"
              onPress={handleCreate}
              loading={loading}
              disabled={!walletName.trim() || !password || !confirmPassword || password !== confirmPassword || password.length < 8}
              fullWidth
              size="large"
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  form: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    marginBottom: 28,
    marginTop: 28,
    borderRadius: 10,
  },
  securityNotice: {
    marginTop: 24,
  },
  noticeText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});