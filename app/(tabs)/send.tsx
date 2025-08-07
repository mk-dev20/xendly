import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency, shortenAddress, isValidStellarAddress } from '@/utils/format';
import { COUNTRIES, EXCHANGE_RATES } from '@/constants/countries';
import { ChevronDown, Wallet as WalletIcon, Send, Shield, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Globe } from 'lucide-react-native';
import { getFlagImage } from '@/utils/getFlagImage';
import { Image } from 'react-native';

export default function SendScreen() {
  const { selectedWallet, sendMoney } = useWallet();
  const { colors } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [show2FAInput, setShow2FAInput] = useState(false);

  const amountNumber = parseFloat(amount) || 0;
  const walletBalance = parseFloat(selectedWallet?.balance_xlm || '0');
  const convertedAmount = amountNumber / EXCHANGE_RATES[selectedCountry.currency];
  const remainingBalance = walletBalance - convertedAmount;
  const estimatedFee = 0.00001; // XLM

  const handleSend = async () => {
    if (!recipientAddress || !amount || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isValidStellarAddress(recipientAddress)) {
      Alert.alert('Error', 'Invalid Stellar address format. Address must start with "G" and be 56 characters long.');
      return;
    }

    if (convertedAmount <= 0) {
      Alert.alert('Error', 'Amount must be greater than 0');
      return;
    }

    if (convertedAmount > walletBalance) {
      Alert.alert('Error', 'Insufficient balance for this transaction');
      return;
    }

    setLoading(true);
    try {
      const response = await sendMoney({
        walletId: selectedWallet!.wallet_id,
        destination: recipientAddress,
        amount: convertedAmount,
        assetCode: 'XLM', // For MVP, using XLM
        memo: memo || undefined,
        password,
        totpCode: totpCode || undefined,
      });
      
      Alert.alert(
        'Transaction Successful!', 
        `Money sent successfully!\n\nTransaction Hash: ${response.transaction_hash.substring(0, 16)}...`, 
        [
          { text: 'View History', onPress: () => router.push('/(tabs)/history') },
          { text: 'Done', onPress: () => router.push('/(tabs)') }
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send money';
      if (errorMessage.includes('2FA') || errorMessage.includes('TOTP') || errorMessage.includes('totp')) {
        setShow2FAInput(true);
        Alert.alert('2FA Required', 'Please enter your 2FA code to complete the transaction');
      } else {
        Alert.alert('Send Failed', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedBackground>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View style={styles.header} className="px-6 mb-8 items-center">
            <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}20` }]} 
                  className="w-16 h-16 rounded-full justify-center items-center mb-4">
              <Send size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]} className="text-3xl font-bold mb-2">
              Send Money
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]} className="text-base text-center">
              Transfer funds across East Africa instantly
            </Text>
          </View>

          {/* From Wallet Card */}
          <Card style={styles.card} className="mx-6 mb-6" elevated>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]} className="text-xs font-bold uppercase tracking-wider mb-4">
              FROM WALLET
            </Text>
            <View style={styles.walletSelector} className="flex-row justify-between items-center">
              <View style={styles.walletInfo} className="flex-row items-center flex-1">
                <View style={[styles.walletIconContainer, { backgroundColor: `${colors.primary}20` }]} 
                      className="w-12 h-12 rounded-full justify-center items-center mr-4">
                  <WalletIcon size={24} color={colors.primary} />
                </View>
                <View style={styles.walletDetails} className="flex-1">
                  <Text style={[styles.walletName, { color: colors.text }]} className="text-lg font-bold">
                    {selectedWallet?.wallet_name || 'Default Wallet'}
                  </Text>
                  <Text style={[styles.walletAddress, { color: colors.textMuted }]} className="text-sm font-mono">
                    {selectedWallet ? shortenAddress(selectedWallet.public_key) : 'Loading...'}
                  </Text>
                </View>
              </View>
              <View style={styles.walletBalance} className="items-end">
                <Text style={[styles.balanceLabel, { color: colors.textMuted }]} className="text-xs font-semibold">
                  Balance
                </Text>
                <Text style={[styles.balanceAmount, { color: colors.text }]} className="text-lg font-bold">
                  {formatCurrency(walletBalance, 'XLM')}
                </Text>
              </View>
            </View>
          </Card>

          {/* Country Selector */}
          <Card style={styles.card} className="mx-6 mb-6" elevated>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]} className="text-xs font-bold uppercase tracking-wider mb-4">
              RECIPIENT COUNTRY
            </Text>
            <TouchableOpacity 
              style={[styles.countrySelector, { borderColor: colors.border }]}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
              className="flex-row justify-between items-center border-2 rounded-2xl"
            >
              <View style={styles.countryInfo} className="flex-row items-center">
                <Image
                  source={getFlagImage(selectedCountry.flag)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    marginRight: 16,
                    backgroundColor: '#eee',
                  }}
                  resizeMode="cover"
                />
                <View>
                  <Text style={[styles.countryName, { color: colors.text }]} className="text-lg font-bold">
                    {selectedCountry.name}
                  </Text>
                  <View style={styles.currencyRow} className="flex-row items-center">
                    <Text style={[styles.countryCurrency, { color: colors.textMuted }]} className="text-sm font-semibold mr-2">
                      {selectedCountry.currency}
                    </Text>
                  </View>
                </View>
              </View>

              <ChevronDown size={24} color={colors.textMuted} />
            </TouchableOpacity>

            {showCountryPicker && (
              <View style={[styles.countryPicker, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                    className="border-2 rounded-2xl mt-4 overflow-hidden">
                {COUNTRIES.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={styles.countryOption}
                    onPress={() => {
                      setSelectedCountry(country);
                      setShowCountryPicker(false);
                    }}
                    className="flex-row items-center p-4 border-b border-gray-100"
                  >
                    <Image
                      source={getFlagImage(country.flag)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        marginRight: 16,
                      }}
                      resizeMode="cover"
                    />

                    <View>
                      <Text style={[styles.countryName, { color: colors.text }]} className="text-lg font-bold">
                        {country.name}
                      </Text>
                      <View style={styles.currencyRow} className="flex-row items-center">
                        <Text style={[styles.countryCurrency, { color: colors.textMuted }]} className="text-sm font-semibold mr-2">
                          {country.currency}
                        </Text>
                        
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* Recipient Address */}
          <Card style={styles.card} className="mx-6 mb-6" elevated>
            <Input
              label="Recipient Stellar Address"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              placeholder="G... (56 characters)"
              multiline
              error={recipientAddress && !isValidStellarAddress(recipientAddress) ? 'Invalid Stellar address format' : undefined}
              helperText="Enter a valid Stellar public key address"
            />
          </Card>

          {/* Amount */}
          <Card style={styles.card} className="mx-6 mb-6" elevated>
            <Input
              label={`Amount (${selectedCountry.currency})`}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
            />
            
            {amountNumber > 0 && (
              <View style={[styles.conversionInfo, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]} 
                    className="mt-4 p-4 border-2 rounded-2xl">
                <View style={styles.conversionRow} className="flex-row justify-between mb-2">
                  <Text style={[styles.conversionLabel, { color: colors.textMuted }]} className="text-sm font-semibold">
                    Amount in XLM:
                  </Text>
                  <Text style={[styles.conversionValue, { color: colors.text }]} className="text-sm font-bold">
                    {formatCurrency(convertedAmount, 'XLM')}
                  </Text>
                </View>
                <View style={styles.conversionRow} className="flex-row justify-between mb-2">
                  <Text style={[styles.conversionLabel, { color: colors.textMuted }]} className="text-sm font-semibold">
                    Network Fee:
                  </Text>
                  <Text style={[styles.conversionValue, { color: colors.text }]} className="text-sm font-bold">
                    {formatCurrency(estimatedFee, 'XLM')}
                  </Text>
                </View>
                <View style={styles.conversionRow} className="flex-row justify-between">
                  <Text style={[styles.conversionLabel, { color: colors.textMuted }]} className="text-sm font-semibold">
                    Remaining Balance:
                  </Text>
                  <Text style={[
                    styles.conversionValue, 
                    { color: remainingBalance >= 0 ? colors.success : colors.error }
                  ]} className="text-sm font-bold">
                    {formatCurrency(Math.max(0, remainingBalance), 'XLM')}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* Transaction Details */}
          <Card style={styles.card} className="mx-6 mb-6" elevated>
            <Input
              label="Memo (Optional)"
              value={memo}
              onChangeText={setMemo}
              placeholder="Add a note for this transaction"
              helperText="This will be visible on the blockchain"
            />
            
            <Input
              label="Wallet Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your wallet password"
            />

            {show2FAInput && (
              <Input
                label="2FA Code"
                value={totpCode}
                onChangeText={setTotpCode}
                keyboardType="numeric"
                placeholder="000000"
                maxLength={6}
                helperText="Enter the 6-digit code from your authenticator app"
              />
            )}
          </Card>

          {/* Security Notice */}
          <Card style={[styles.securityCard, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]} 
                className="mx-6 mb-6" elevated={false}>
            <View style={styles.securityHeader} className="flex-row items-center mb-3">
              <Shield size={20} color={colors.warning} />
              <Text style={[styles.securityTitle, { color: colors.warning }]} className="text-base font-bold ml-2">
                Security Notice
              </Text>
            </View>
            <Text style={[styles.securityText, { color: colors.textMuted }]} className="text-sm leading-5">
              Transactions on Stellar are irreversible. Please verify the recipient address carefully before sending.
            </Text>
          </Card>

          <View style={styles.buttonContainer} className="px-6 pb-10">
            <Button
              title="Send Money"
              onPress={handleSend}
              loading={loading}
              disabled={!recipientAddress || !amount || !password || convertedAmount > walletBalance || !isValidStellarAddress(recipientAddress)}
              fullWidth
              size="large"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  walletSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletDetails: {
    marginLeft: 16,
    flex: 1,
  },
  walletName: {
    fontSize: 18,
    fontWeight: '700',
  },
  walletAddress: {
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  walletBalance: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  countrySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderRadius: 10,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    fontSize: 32,
    marginRight: 18,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  countryCurrency: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagBadge: {
    marginLeft: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  flagBadgeText: {
    fontSize: 12,
  },
  countryPicker: {
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 12,
    overflow: 'hidden',
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  conversionInfo: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  conversionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  conversionValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  securityCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 2,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
});