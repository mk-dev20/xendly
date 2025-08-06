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
import { ArrowLeftRight, Wallet as WalletIcon, ChevronDown } from 'lucide-react-native';

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
                <Text style={[styles.currencyText, { color: colors.text }]}>{fromCurrency}</Text>
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
                      <Text style={[styles.currencyOptionText, { color: colors.text }]}>{currency}</Text>
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
                <Text style={[styles.currencyText, { color: colors.text }]}>{toCurrency}</Text>
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
                      <Text style={[styles.currencyOptionText, { color: colors.text }]}>{currency}</Text>
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
            <View style={styles.conversionPreview}>
              <Text style={[styles.conversionText, { color: colors.text }]}>
                You will receive: {formatCurrency(convertedAmount, toCurrency)}
              </Text>
              <Text style={[styles.rateText, { color: colors.textMuted }]}>
                Rate: 1 {fromCurrency} = {conversionRate.toFixed(4)} {toCurrency}
              </Text>
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
    padding: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  conversionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rateText: {
    fontSize: 12,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  swapActionButton: {
    marginTop: 8,
  },
});