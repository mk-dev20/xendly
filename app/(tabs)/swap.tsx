import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency, shortenAddress } from '@/utils/format';
import { SUPPORTED_CURRENCIES, EXCHANGE_RATES } from '@/constants/countries';
import { ArrowLeftRight, Wallet as WalletIcon, ChevronDown, TrendingUp } from 'lucide-react-native';

const getCurrencyFlag = (currency: string): string => {
  const currencyToCountry: Record<string, string> = {
    'KES': 'KE',
    'UGX': 'UG', 
    'TZS': 'TZ',
    'RWF': 'RW',
    'BIF': 'BI',
    'XLM': '🌟', // Special case for Stellar
    'USDC': '🇺🇸',
  };
  
  const countryCode = currencyToCountry[currency];
  if (!countryCode) return '💱';
  if (countryCode.length === 2) {
    return countryCode
      .toUpperCase()
      .replace(/./g, char =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
      );
  }
  return countryCode;
};

export default function SwapScreen() {
  const { selectedWallet } = useWallet();
  const { colors } = useTheme();
  const [fromCurrency, setFromCurrency] = useState('XLM');
  const [toCurrency, setToCurrency] = useState('KES');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const amountNumber = parseFloat(amount) || 0;
  const conversionRate = EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = amountNumber * conversionRate;

  const handleSwap = async () => {
    if (!amount || amountNumber <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (fromCurrency === toCurrency) {
      Alert.alert('Error', 'Please select different currencies');
      return;
    }

    setLoading(true);
    try {
      // Simulate swap for MVP
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', `Swapped ${formatCurrency(amountNumber, fromCurrency)} to ${formatCurrency(convertedAmount, toCurrency)}`);
      setAmount('');
    } catch (error) {
      Alert.alert('Swap Failed', 'Failed to complete currency swap');
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  return (
    <ThemedBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Currency Swap</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Convert between supported currencies
          </Text>
        </View>

        {/* Wallet Info */}
        <Card style={styles.card}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>From Wallet</Text>
          <View style={styles.walletInfo}>
            <WalletIcon size={20} color={colors.primary} />
            <View style={styles.walletDetails}>
              <Text style={[styles.walletName, { color: colors.text }]}>
                {selectedWallet?.name || 'Default Wallet'}
              </Text>
              <Text style={[styles.walletAddress, { color: colors.textMuted }]}>
                {selectedWallet ? shortenAddress(selectedWallet.public_key) : 'Loading...'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Currency Selection */}
        <Card style={styles.card}>
          <View style={styles.swapContainer}>
            {/* From Currency */}
            <View style={styles.currencySection}>
              <Text style={[styles.currencyLabel, { color: colors.textMuted }]}>From</Text>
              <TouchableOpacity 
                style={[styles.currencySelector, { borderColor: colors.border }]}
                onPress={() => setShowFromPicker(!showFromPicker)}
              >
                <View style={styles.currencyDisplay} className="flex-row items-center">
                  <Text style={styles.currencyFlag} className="text-xl mr-2">{getCurrencyFlag(fromCurrency)}</Text>
                  <Text style={[styles.currencyText, { color: colors.text }]}>{fromCurrency}</Text>
                </View>
                <ChevronDown size={20} color={colors.textMuted} />
              </TouchableOpacity>
              
              {showFromPicker && (
                <View style={[styles.currencyPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <TouchableOpacity
                      key={currency}
                      style={styles.currencyOption}
                      onPress={() => {
                        setFromCurrency(currency);
                        setShowFromPicker(false);
                      }}
                    >
                      <View style={styles.currencyOptionContent} className="flex-row items-center">
                        <Text style={styles.currencyOptionFlag} className="text-lg mr-3">{getCurrencyFlag(currency)}</Text>
                        <Text style={[styles.currencyOptionText, { color: colors.text }]}>{currency}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Swap Button */}
            <TouchableOpacity 
              style={[styles.swapButton, { backgroundColor: colors.primary }]}
              onPress={swapCurrencies}
            >
              <ArrowLeftRight size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* To Currency */}
            <View style={styles.currencySection}>
              <Text style={[styles.currencyLabel, { color: colors.textMuted }]}>To</Text>
              <TouchableOpacity 
                style={[styles.currencySelector, { borderColor: colors.border }]}
                onPress={() => setShowToPicker(!showToPicker)}
              >
                <View style={styles.currencyDisplay} className="flex-row items-center">
                  <Text style={styles.currencyFlag} className="text-xl mr-2">{getCurrencyFlag(toCurrency)}</Text>
                  <Text style={[styles.currencyText, { color: colors.text }]}>{toCurrency}</Text>
                </View>
                <ChevronDown size={20} color={colors.textMuted} />
              </TouchableOpacity>

              {showToPicker && (
                <View style={[styles.currencyPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <TouchableOpacity
                      key={currency}
                      style={styles.currencyOption}
                      onPress={() => {
                        setToCurrency(currency);
                        setShowToPicker(false);
                      }}
                    >
                      <View style={styles.currencyOptionContent} className="flex-row items-center">
                        <Text style={styles.currencyOptionFlag} className="text-lg mr-3">{getCurrencyFlag(currency)}</Text>
                        <Text style={[styles.currencyOptionText, { color: colors.text }]}>{currency}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Amount Input */}
        <Card style={styles.card}>
          <Input
            label={`Amount (${fromCurrency})`}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
          />
          
          {amountNumber > 0 && (
            <View style={[styles.conversionPreview, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]} 
                  className="mt-4 p-4 border-2 rounded-2xl">
              <View style={styles.conversionHeader} className="flex-row items-center mb-3">
                <TrendingUp size={20} color={colors.primary} />
                <Text style={[styles.conversionTitle, { color: colors.primary }]} className="text-base font-bold ml-2">
                  Conversion Preview
                </Text>
              </View>
              <View style={styles.conversionRow} className="flex-row justify-between items-center mb-2">
                <Text style={[styles.conversionLabel, { color: colors.textMuted }]} className="text-sm">
                  You will receive:
                </Text>
                <View style={styles.conversionAmount} className="flex-row items-center">
                  <Text style={styles.conversionFlag} className="text-base mr-1">{getCurrencyFlag(toCurrency)}</Text>
                  <Text style={[styles.conversionText, { color: colors.text }]} className="text-base font-bold">
                    {formatCurrency(convertedAmount, toCurrency)}
                  </Text>
                </View>
              </View>
              <View style={styles.conversionRow} className="flex-row justify-between items-center">
                <Text style={[styles.conversionLabel, { color: colors.textMuted }]} className="text-sm">
                  Exchange rate:
                </Text>
                <Text style={[styles.rateText, { color: colors.textMuted }]} className="text-sm font-semibold">
                  1 {fromCurrency} = {conversionRate.toFixed(4)} {toCurrency}
                </Text>
              </View>
            </View>
          )}
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="Swap Currency"
            onPress={handleSwap}
            loading={loading}
            disabled={!amount || amountNumber <= 0 || fromCurrency === toCurrency}
            style={styles.swapActionButton}
          />
        </View>
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
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletDetails: {
    marginLeft: 12,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
  },
  walletAddress: {
    fontSize: 12,
    marginTop: 2,
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencySection: {
    flex: 1,
    position: 'relative',
  },
  currencyLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  currencyPicker: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
  },
  currencyOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  currencyOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyOptionFlag: {
    fontSize: 18,
    marginRight: 12,
  },
  currencyOptionText: {
    fontSize: 14,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
  },
  conversionPreview: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  conversionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  conversionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  conversionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversionLabel: {
    fontSize: 14,
  },
  conversionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversionFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  conversionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  swapActionButton: {
    marginTop: 8,
  },
});