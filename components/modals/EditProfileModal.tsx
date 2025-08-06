import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { User, X, Mail, Phone, AtSign } from 'lucide-react-native';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProfileModal({ visible, onClose, onSuccess }: EditProfileModalProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const handleSave = async () => {
    if (!email || !username) {
      Alert.alert('Error', 'Email and username are required');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validateUsername(username)) {
      Alert.alert('Error', 'Username must be at least 3 characters and contain only letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    try {
      await apiService.updateProfile(email, username, phoneNumber || undefined);
      Alert.alert('Success', 'Profile updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail(user?.email || '');
    setUsername(user?.username || '');
    setPhoneNumber(user?.phone_number || '');
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
              Edit Profile
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
                <User size={32} color={colors.primary} />
              </View>
              <Text style={[styles.subtitle, { color: colors.textMuted }]} className="text-base text-center">
                Update your account information
              </Text>
            </View>

            <Card style={styles.formCard} elevated>
              <View style={styles.inputGroup} className="mb-4">
                <View style={[styles.inputIcon, { backgroundColor: `${colors.primary}15` }]} 
                      className="w-10 h-10 rounded-full justify-center items-center mr-3">
                  <Mail size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Input
                    label="Email Address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Enter your email"
                    error={email && !validateEmail(email) ? 'Invalid email format' : undefined}
                  />
                </View>
              </View>

              <View style={styles.inputGroup} className="mb-4">
                <View style={[styles.inputIcon, { backgroundColor: `${colors.primary}15` }]} 
                      className="w-10 h-10 rounded-full justify-center items-center mr-3">
                  <AtSign size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Input
                    label="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholder="Choose a username"
                    error={username && !validateUsername(username) ? 'Invalid username format' : undefined}
                    helperText="At least 3 characters, letters, numbers, and underscores only"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={[styles.inputIcon, { backgroundColor: `${colors.primary}15` }]} 
                      className="w-10 h-10 rounded-full justify-center items-center mr-3">
                  <Phone size={20} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Input
                    label="Phone Number (Optional)"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    placeholder="+254 700 000 000"
                    helperText="For SMS notifications and account recovery"
                  />
                </View>
              </View>
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
                title="Save Changes"
                onPress={handleSave}
                loading={loading}
                disabled={!email || !username || !validateEmail(email) || !validateUsername(username)}
                style={styles.saveButton}
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
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 28,
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
  saveButton: {
    flex: 2,
  },
});