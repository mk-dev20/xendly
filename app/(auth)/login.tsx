import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, Link } from 'expo-router';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string>('');
  const { login, verify2FA } = useAuth();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(emailOrUsername, password);
      
      if (result.two_fa_required && result.user_id) {
        setShowTwoFA(true);
        setPendingUserId(result.user_id);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFAVerification = async () => {
    if (!totpCode || totpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verify2FA(pendingUserId, totpCode);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedBackground>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <LogIn size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              {showTwoFA ? 'Two-Factor Authentication' : 'Welcome Back'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {showTwoFA 
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Sign in to your Xendly account'
              }
            </Text>
          </View>

          <Card style={styles.card} elevated>
            {!showTwoFA ? (
              <>
                <Input
                  label="Email or Username"
                  value={emailOrUsername}
                  onChangeText={setEmailOrUsername}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email or username"
                />
                
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Enter your password"
                />

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  fullWidth
                  size="large"
                />
              </>
            ) : (
              <>
                <Input
                  label="Authentication Code"
                  value={totpCode}
                  onChangeText={setTotpCode}
                  keyboardType="numeric"
                  placeholder="000000"
                  maxLength={6}
                  helperText="Enter the 6-digit code from Google Authenticator"
                />

                <View style={styles.twoFAButtons}>
                  <Button
                    title="Back"
                    onPress={() => {
                      setShowTwoFA(false);
                      setTotpCode('');
                      setPendingUserId('');
                    }}
                    variant="outline"
                    style={styles.backButton}
                  />
                  <Button
                    title="Verify"
                    onPress={handleTwoFAVerification}
                    loading={loading}
                    style={styles.verifyButton}
                  />
                </View>
              </>
            )}
          </Card>

          {!showTwoFA && (
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                Don't have an account?{' '}
                <Link href="/(auth)/signup" style={{ color: colors.primary, fontWeight: '600' }}>
                  Sign up
                </Link>
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  card: {
    marginBottom: 32,
  },
  twoFAButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  verifyButton: {
    flex: 2,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
  },
});