import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TwoFASetupModal } from '@/components/modals/TwoFASetupModal';
import { EditProfileModal } from '@/components/modals/EditProfileModal';
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import { TwoFAStatus, NotificationPreferences } from '@/types';
import { User, Shield, Moon, Sun, LogOut, Trash2, ChevronRight, CreditCard as Edit, Bell, Lock, Settings as SettingsIcon, Phone, Mail, Smartphone, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFAStatus | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTwoFASetup, setShowTwoFASetup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [twoFAData, notifData] = await Promise.all([
        apiService.get2FAStatus(),
        apiService.getNotificationPreferences(),
      ]);
      setTwoFAStatus(twoFAData);
      setNotificationPrefs(notifData);
    } catch (error) {
      console.error('Failed to load settings:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigation = useNavigation();
  
  const dologout = async () => {
  try {
    // 1. Hit backend logout endpoint (optional but clean)
    await apiService.logout(); 

    // 2. Clear token from AsyncStorage
    await AsyncStorage.removeItem('auth_token');

    // 3. Navigate to login screen & reset stack
    navigation.reset({
      index: 0,
      routes: [{ name: '(auth)/login' }],
    });
  } catch (error) {
    console.error('Logout failed:', error);
    Alert.alert('Logout Failed', 'Something went wrong while logging out. Try again.');
  }
};


  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout of your Xendly account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: dologout },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your wallets and transaction history will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          style: 'destructive', 
          onPress: () => setShowDeleteAccount(true)
        },
      ]
    );
  };

  const toggle2FA = async () => {
    if (!twoFAStatus || !user) return;

    if (twoFAStatus.enabled) {
      Alert.alert(
        'Disable 2FA',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive', 
            onPress: async () => {
              try {
                // TODO: Implement 2FA disable flow with TOTP verification
                Alert.alert('Feature Coming Soon', '2FA disable will require TOTP verification in the next update');
              } catch (error) {
                Alert.alert('Error', 'Failed to disable 2FA');
              }
            }
          },
        ]
      );
    } else {
      setShowTwoFASetup(true);
    }
  };

  const updateNotificationPref = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!notificationPrefs) return;

    try {
      const updatedPrefs = { ...notificationPrefs, [key]: value };
      await apiService.updateNotificationPreferences({ [key]: value });
      setNotificationPrefs(updatedPrefs);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification preferences');
      console.error('Failed to update notification preference:', error);
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
            <SettingsIcon size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]} className="text-3xl font-bold">
            Settings
          </Text>
        </View>

        {/* Enhanced Profile Section */}
        <Card style={styles.profileCard} className="mx-6 mb-6" elevated>
          <View style={styles.profileHeader} className="flex-row items-center mb-6">
            <View style={[styles.avatar, { backgroundColor: colors.primary }]} 
                  className="w-16 h-16 rounded-full justify-center items-center mr-4">
              <User size={32} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo} className="flex-1">
              <Text style={[styles.profileName, { color: colors.text }]} className="text-xl font-bold mb-1">
                {user?.username || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textMuted }]} className="text-sm mb-1">
                {user?.email || 'user@example.com'}
              </Text>
              {user?.phone_number && (
                <Text style={[styles.profilePhone, { color: colors.textMuted }]} className="text-sm">
                  {user.phone_number}
                </Text>
              )}
              <View style={styles.verificationBadges} className="flex-row mt-2 gap-2">
                {user?.is_verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: `${colors.success}20` }]} 
                        className="flex-row items-center px-2 py-1 rounded-full">
                    <CheckCircle size={12} color={colors.success} />
                    <Text style={[styles.badgeText, { color: colors.success }]} className="text-xs font-bold ml-1">
                      Verified
                    </Text>
                  </View>
                )}
                {user?.is_phone_verified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: `${colors.primary}20` }]} 
                        className="flex-row items-center px-2 py-1 rounded-full">
                    <Phone size={12} color={colors.primary} />
                    <Text style={[styles.badgeText, { color: colors.primary }]} className="text-xs font-bold ml-1">
                      Phone
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: `${colors.primary}20` }]}
              onPress={() => setShowEditProfile(true)}
              className="w-12 h-12 rounded-full justify-center items-center"
            >
              <Edit size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Enhanced Security Settings */}
        <Card style={styles.settingsCard} className="mx-6 mb-6" elevated>
          <Text style={[styles.cardTitle, { color: colors.text }]} className="text-xl font-bold mb-6">
            Security
          </Text>
          
          <View style={styles.settingItem} className="flex-row justify-between items-center py-4">
            <View style={styles.settingLeft} className="flex-row items-center flex-1">
              <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-12 h-12 rounded-full justify-center items-center mr-4">
                <Shield size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]} className="text-base font-bold">
                  Two-Factor Authentication
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textMuted }]} className="text-sm">
                  {twoFAStatus?.enabled ? 'Enabled - Your account is secure' : 'Disabled - Recommended for security'}
                </Text>
                {!twoFAStatus?.enabled && (
                  <View style={[styles.recommendedBadge, { backgroundColor: `${colors.warning}20` }]} 
                        className="flex-row items-center px-2 py-1 rounded-full mt-1">
                    <AlertTriangle size={10} color={colors.warning} />
                    <Text style={[styles.recommendedText, { color: colors.warning }]} className="text-xs font-bold ml-1">
                      Recommended
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Switch
              value={twoFAStatus?.enabled || false}
              onValueChange={toggle2FA}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
            />
          </View>

          <TouchableOpacity style={styles.settingItem} className="flex-row justify-between items-center py-4">
            <View style={styles.settingLeft} className="flex-row items-center flex-1">
              <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-12 h-12 rounded-full justify-center items-center mr-4">
                <Lock size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]} className="text-base font-bold">
                  Change Password
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textMuted }]} className="text-sm">
                  Update your account password
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Enhanced Notification Settings */}
        <Card style={styles.settingsCard} className="mx-6 mb-6" elevated>
          <Text style={[styles.cardTitle, { color: colors.text }]} className="text-xl font-bold mb-6">
            Notifications
          </Text>
          
          <View style={styles.settingItem} className="flex-row justify-between items-center py-4">
            <View style={styles.settingLeft} className="flex-row items-center flex-1">
              <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-12 h-12 rounded-full justify-center items-center mr-4">
                <Bell size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]} className="text-base font-bold">
                  Push Notifications
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textMuted }]} className="text-sm">
                  Receive app notifications for transactions
                </Text>
              </View>
            </View>
            <Switch
              value={notificationPrefs?.push_enabled || false}
              onValueChange={(value) => updateNotificationPref('push_enabled', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
            />
          </View>

          <View style={styles.settingItem} className="flex-row justify-between items-center py-4">
            <View style={styles.settingLeft} className="flex-row items-center flex-1">
              <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-12 h-12 rounded-full justify-center items-center mr-4">
                <Mail size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]} className="text-base font-bold">
                  Email Notifications
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textMuted }]} className="text-sm">
                  Receive email updates and alerts
                </Text>
              </View>
            </View>
            <Switch
              value={notificationPrefs?.email_enabled || false}
              onValueChange={(value) => updateNotificationPref('email_enabled', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
            />
          </View>

          <View style={styles.settingItem} className="flex-row justify-between items-center py-4">
            <View style={styles.settingLeft} className="flex-row items-center flex-1">
              <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-12 h-12 rounded-full justify-center items-center mr-4">
                <Smartphone size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]} className="text-base font-bold">
                  SMS Notifications
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textMuted }]} className="text-sm">
                  Receive SMS alerts for important events
                </Text>
              </View>
            </View>
            <Switch
              value={notificationPrefs?.sms_enabled || false}
              onValueChange={(value) => updateNotificationPref('sms_enabled', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
            />
          </View>
        </Card>

        {/* Enhanced Preferences */}
        <Card style={styles.settingsCard} className="mx-6 mb-6" elevated>
          <Text style={[styles.cardTitle, { color: colors.text }]} className="text-xl font-bold mb-6">
            Preferences
          </Text>
          
          <View style={styles.settingItem} className="flex-row justify-between items-center py-4">
            <View style={styles.settingLeft} className="flex-row items-center flex-1">
              <View style={[styles.settingIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                    className="w-12 h-12 rounded-full justify-center items-center mr-4">
                {isDark ? (
                  <Moon size={24} color={colors.primary} />
                ) : (
                  <Sun size={24} color={colors.primary} />
                )}
              </View>
              <View>
                <Text style={[styles.settingText, { color: colors.text }]} className="text-base font-bold">
                  Dark Mode
                </Text>
                <Text style={[styles.settingSubtext, { color: colors.textMuted }]} className="text-sm">
                  Switch between light and dark themes
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
            />
          </View>
        </Card>

        {/* Enhanced Account Actions */}
        <Card style={styles.actionsCard} className="mx-6 mb-6" elevated>
          <Text style={[styles.cardTitle, { color: colors.text }]} className="text-xl font-bold mb-6">
            Account Actions
          </Text>

          <TouchableOpacity style={styles.actionItem} onPress={handleLogout} className="flex-row items-center py-4">
            <View style={[styles.actionIconContainer, { backgroundColor: `${colors.error}20` }]} 
                  className="w-12 h-12 rounded-full justify-center items-center mr-4">
              <LogOut size={24} color={colors.error} />
            </View>
            <View className="flex-1">
              <Text style={[styles.actionText, { color: colors.error }]} className="text-base font-bold">
                Logout
              </Text>
              <Text style={[styles.actionSubtext, { color: colors.textMuted }]} className="text-sm">
                Sign out of your Xendly account
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} className="h-px my-2" />

          <TouchableOpacity style={styles.actionItem} onPress={handleDeleteAccount} className="flex-row items-center py-4">
            <View style={[styles.actionIconContainer, { backgroundColor: `${colors.error}20` }]} 
                  className="w-12 h-12 rounded-full justify-center items-center mr-4">
              <Trash2 size={24} color={colors.error} />
            </View>
            <View className="flex-1">
              <Text style={[styles.actionText, { color: colors.error }]} className="text-base font-bold">
                Delete Account
              </Text>
              <Text style={[styles.actionSubtext, { color: colors.textMuted }]} className="text-sm">
                Permanently delete your account and all data
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <View style={styles.footer} className="items-center py-10">
          <Text style={[styles.footerText, { color: colors.textMuted }]} className="text-sm font-semibold mb-1">
            Xendly v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]} className="text-sm font-semibold">
            Powered by Stellar Network
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <TwoFASetupModal
        visible={showTwoFASetup}
        onClose={() => setShowTwoFASetup(false)}
        onSuccess={() => {
          setShowTwoFASetup(false);
          loadSettings();
        }}
      />

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSuccess={() => {
          setShowEditProfile(false);
          // Refresh user data if needed
        }}
      />

      <DeleteAccountModal
        visible={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  header: {
    paddingHorizontal: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileCard: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 14,
  },
  verificationBadges: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsCard: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingText: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 12,
    fontWeight: '500',
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  actionsCard: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    marginVertical: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
});