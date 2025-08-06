import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { Trash2, X, TriangleAlert as AlertTriangle, Shield } from 'lucide-react-native';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!password || !totpCode || confirmText !== 'DELETE') {
      Alert.alert('Error', 'Please fill in all fields and type DELETE to confirm');
      return;
    }

    if (!user?.user_id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. All your wallets, transactions, and data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Forever', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await apiService.deleteAccount(user.user_id, password, totpCode);
              Alert.alert(
                'Account Deleted',
                'Your account has been permanently deleted.',
                [{ text: 'OK', onPress: logout }]
              );
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
              Alert.alert('Deletion Failed', errorMessage);
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleClose = () => {
    setPassword('');
    setTotpCode('');
    setConfirmText('');
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
            <Text style={[styles.title, { color: colors.error }]} className="text-2xl font-bold">
              Delete Account
            </Text>
            <TouchableOpacity onPress={handleClose} className="w-10 h-10 rounded-full justify-center items-center"
                            style={{ backgroundColor: `${colors.textMuted}20` }}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.form} className="flex-1 p-6">
            <View style={styles.iconSection} className="items-center mb-8">
              <View style={[styles.iconContainer, { backgroundColor: `${colors.error}20` }]} 
                    className="w-20 h-20 rounded-full justify-center items-center mb-4">
                <Trash2 size={32} color={colors.error} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.error }]} className="text-2xl font-bold mb-2 text-center">
                Delete Your Account
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]} className="text-base text-center leading-6">
                This action cannot be undone. All data will be permanently deleted.
              </Text>
            </View>

            <Card style={[styles.warningCard, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]} 
                  elevated={false}>
              <View style={styles.warningHeader} className="flex-row items-center mb-3">
                <AlertTriangle size={20} color={colors.error} />
                <Text style={[styles.warningTitle, { color: colors.error }]} className="text-base font-bold ml-2">
                  What will be deleted:
                </Text>
              </View>
              <Text style={[styles.warningText, { color: colors.textMuted }]} className="text-sm leading-5">
                • All your wallets and cryptocurrency funds{'\n'}
                • Complete transaction history{'\n'}
                • Profile information and settings{'\n'}
                • Security settings including 2FA{'\n'}
                • All notification preferences
              </Text>
            </Card>

            <Card style={styles.formCard} elevated>
              <Input
                label="Current Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Enter your account password"
                helperText="Required to verify your identity"
              />
              
              <Input
                label="2FA Code"
                value={totpCode}
                onChangeText={setTotpCode}
                keyboardType="numeric"
                placeholder="000000"
                maxLength={6}
                helperText="Enter the 6-digit code from Google Authenticator"
              />

              <Input
                label="Type DELETE to confirm"
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="DELETE"
                autoCapitalize="characters"
                helperText="Type DELETE in capital letters to confirm deletion"
                error={confirmText && confirmText !== 'DELETE' ? 'Must type DELETE exactly' : undefined}
              />
            </Card>
          </View>

          <View style={styles.footer} className="p-6">
            <View style={styles.buttons} className="flex-row gap-3">
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Delete Forever"
                onPress={handleDelete}
                variant="danger"
                loading={loading}
                disabled={!password || !totpCode || confirmText !== 'DELETE'}
                style={styles.deleteButton}
              />
            </View>
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
  modalTitle: {
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
  warningCard: {
    marginBottom: 24,
    borderWidth: 2,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  formCard: {
    marginBottom: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 2,
  },
});