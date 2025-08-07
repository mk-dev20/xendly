import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { WalletPickerModal } from '@/components/modals/WalletPickerModal';
import { CreateWalletModal } from '@/components/modals/CreateWalletModal';
import { FundWalletModal } from '@/components/modals/FundWalletModal';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency, shortenAddress, getGreeting } from '@/utils/format';
import { COUNTRIES, EXCHANGE_RATES } from '@/constants/countries';
import { Wallet, Send, ArrowLeftRight, QrCode, Clock, ChevronDown, Plus, TrendingUp, PiggyBank, Users, ChartBar as BarChart3, RefreshCw, Zap, Star, Gift, Target } from 'lucide-react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { getFlagImage } from '@/utils/getFlagImage';
import { ImageBackground } from 'react-native';


const { width } = Dimensions.get('window');

const mockInsights = [
  {
    title: 'Weekly Savings Goal',
    subtitle: 'You saved 15,000 KES this week! Keep it up!',
    icon: PiggyBank,
    color: '#10B981',
    progress: 75,
  },
  {
    title: 'Invite Friends',
    subtitle: 'Earn 500 KES for each friend who joins',
    icon: Users,
    color: '#8B5CF6',
    cta: 'Invite Now',
  },
  {
    title: 'Top Up Bonus',
    subtitle: 'Get 5% extra on your next wallet funding',
    icon: Gift,
    color: '#F59E0B',
    cta: 'Claim Bonus',
  },
  {
    title: 'Achievement Unlocked',
    subtitle: 'First international transfer completed!',
    icon: Star,
    color: '#EF4444',
    badge: 'New',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const { selectedWallet, setSelectedWallet, wallets, refreshWallets, fundWallet, syncWallet, isLoading } = useWallet();
  const { colors } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState('KES');
  const [refreshing, setRefreshing] = useState(false);
  const [fundingWallet, setFundingWallet] = useState(false);
  const [showWalletPicker, setShowWalletPicker] = useState(false);
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  const greeting = getGreeting();
  const balance = parseFloat(selectedWallet?.balance_xlm || '0');
  const convertedBalance = balance * EXCHANGE_RATES[selectedCurrency];

  const onRefresh = async () => {
  if (!selectedWallet) return;

  setRefreshing(true);
  try {
    await syncWallet(selectedWallet.wallet_id);
    await refreshWallets();
  } catch (error) {
    console.error('Refresh failed:', error);
    Alert.alert('Refresh Failed', 'Unable to refresh wallet data');
  } finally {
    setRefreshing(false);
  }
};


  const handleFundWallet = async () => {
  if (!selectedWallet) return;

  setFundingWallet(true);
  try {
    const updated = await fundWallet(selectedWallet.wallet_id);

    Alert.alert('🔥 Funded!', `Wallet balance: ${updated.balance_xlm} XLM`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fund wallet';
    Alert.alert('🚫 Funding Failed', errorMessage);
  } finally {
    setFundingWallet(false);
  }
};



  const quickActions = [
    { 
      title: 'Fund', 
      icon: Wallet, 
      onPress: () => setShowFundModal(true), 
      color: colors.primary,
      loading: fundingWallet,
      gradient: ['#10B981', '#34D399'],
    },
    { 
      title: 'Send', 
      icon: Send, 
      onPress: () => router.push('/(tabs)/send'), 
      color: '#3B82F6',
      gradient: ['#3B82F6', '#60A5FA'],
    },
    { 
      title: 'Receive', 
      icon: QrCode, 
      onPress: () => router.push('/(tabs)/receive'), 
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#A78BFA'],
    },
    { 
      title: 'History', 
      icon: Clock, 
      onPress: () => router.push('/(tabs)/history'), 
      color: '#6B7280',
      gradient: ['#6B7280', '#9CA3AF'],
    },
  ];

  if (isLoading && !selectedWallet) {
    return (
      <ThemedBackground>
        <LoadingSpinner />
      </ThemedBackground>
    );
  }

  return (
    <ThemedBackground>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        className="flex-1"
      >
        {/* Enhanced Greeting Section */}
        <View style={styles.greeting} className="px-6 mb-8">
          <Text style={[styles.name]}>
            <Text style={[styles.greetingText, { color: colors.textMuted }]} className="text-base font-medium">
              {greeting}
            </Text>
            <Text style={[styles.userName, { color: colors.text }]} className="text-3xl font-bold">
              {user?.username || 'User'}
            </Text>
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${colors.success}20` }]} className="mt-2">
            <Text style={[styles.statusText, { color: colors.success }]} className="text-xs font-semibold">
              ● VERIFIED ACCOUNT
            </Text>
          </View>
        </View>

                {/* Enhanced Wallet Card */}
        <Card style={styles.walletCard} className="mx-6 mb-6" elevated>
          <View style={styles.walletHeader} className="flex-row justify-between items-center mb-6">
            <Text style={[styles.walletLabel, { color: colors.textMuted }]} className="text-sm font-bold uppercase tracking-wider">
              Your Wallet
            </Text>
            <View style={styles.walletActions} className="flex-row gap-2">
              <TouchableOpacity 
                style={[styles.syncButton, { backgroundColor: `${colors.primary}20` }]}
                onPress={async () => {
                  if (!selectedWallet) return;
                  const synced = await syncWallet(selectedWallet.wallet_id);
                  setSelectedWallet(synced);
                }}
                className="w-10 h-10 rounded-full justify-center items-center"
              >
                <RefreshCw size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.walletSelector, { backgroundColor: `${colors.primary}20` }]}
                onPress={() => wallets.length > 1 ? setShowWalletPicker(true) : setShowCreateWallet(true)}
                className="w-10 h-10 rounded-full justify-center items-center"
              >
                {wallets.length > 1 ? (
                  <ChevronDown size={18} color={colors.primary} />
                ) : (
                  <Plus size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.walletAddressContainer} className="items-center mb-8">
            <Text style={[styles.walletAddress, { color: colors.text }]} className="text-lg font-semibold text-center mb-3 font-mono">
              {selectedWallet ? shortenAddress(selectedWallet.public_key, 8, 6) : 'Loading...'}
            </Text>
            <View style={[styles.walletBadge, { backgroundColor: `${colors.success}25` }]} className="px-4 py-2 rounded-full">
              <Text style={[styles.walletBadgeText, { color: colors.success }]} className="text-xs font-bold">
                {selectedWallet?.wallet_name || 'Default'}
              </Text>
            </View>
          </View>

          <View style={styles.balanceSection} className="items-center">
            <Text style={[styles.balance, { color: colors.text }]} className="text-4xl font-bold mb-2">
              {formatCurrency(
                parseFloat(selectedWallet?.balance_xlm || '0') * EXCHANGE_RATES[selectedCurrency],
                selectedCurrency
              )}
            </Text>
            <Text style={[styles.balanceXLM, { color: colors.textMuted }]} className="text-base mb-8">
              ≈ {formatCurrency(parseFloat(selectedWallet?.balance_xlm || '0'), 'XLM')}
            </Text>
            
            <View style={styles.currencyFlags} className="flex-row justify-center gap-3">
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  onPress={() => setSelectedCurrency(country.currency)}
                  style={[
                    styles.flagButton,
                    {
                      transform: selectedCurrency === country.currency 
                        ? [{ scale: 1.15 }] 
                        : [{ scale: 1 }],
                      shadowColor: selectedCurrency === country.currency ? colors.primary : 'transparent',
                    },
                  ]}
                  className="w-14 h-14 rounded-full justify-center items-center overflow-hidden"
                >
                  <ImageBackground
                    source={getFlagImage(country.flag)}
                    resizeMode="cover"
                    style={{
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    imageStyle={{
                      borderRadius: 10,
                      opacity: selectedCurrency === country.currency ? 1 : 0.7,
                    }}
                  >
                    <Text style={[
                      styles.currencyCode,
                      { 
                        color: selectedCurrency === country.currency ? '#fff' : '#000',
                        backgroundColor: selectedCurrency === country.currency ? `${colors.primary}88` : 'rgba(235, 194, 14, 0.3)',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        fontSize: 10,
                        marginTop: 2
                      }
                    ]}>
                      {country.currency}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>


        {/* Enhanced Quick Actions */}
        <Card style={styles.actionsCard} className="mx-6 mb-6" elevated>
          
          <View style={styles.actionsGrid} className="flex-row flex-wrap">
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.actionButton, 
                  { backgroundColor: `${action.color}32` }
                ]}
                onPress={action.onPress}
                disabled={action.loading}
                className="rounded-2xl mb-4 shadow-lg"
              >
                <View style={[styles.actionIconContainer]} className="w-14 h-14 rounded-full justify-center items-center mb-3">
                  {action.loading ? (
                    <RefreshCw size={28} color={action.color} />
                  ) : (
                    <action.icon size={28} color={action.color} />
                  )}
                </View>
                <Text style={[styles.actionText, { color: colors.text }]} className="text-sm font-bold">
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Enhanced Insights Carousel */}
        <View style={styles.insightsSection} className="mb-6">
          <Text style={[styles.sectionTitle, { color: colors.text }]} className="text-xl font-bold">
            Insights & Offers
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.insightsScroll} className="pl-6">
            {mockInsights.map((insight, index) => (
              <Card key={index} style={styles.insightCard} className="mr-4 w-64" elevated>
                <View style={styles.insightContent} className="items-center">
                  <View style={[styles.insightIconContainer, { backgroundColor: `${insight.color}32` }]} className="w-16 h-16 rounded-full justify-center items-center mb-4">
                    <insight.icon size={32} color={insight.color} />
                  </View>
                  {insight.badge && (
                    <View style={[styles.badge, { backgroundColor: insight.color }]} className="absolute top-4 right-4 px-2 py-1 rounded-full">
                      <Text style={styles.badgeText} className="text-xs font-bold text-white">
                        {insight.badge}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.insightTitle, { color: colors.text }]} className="text-lg font-bold mb-3 text-center">
                    {insight.title}
                  </Text>
                  <Text style={[styles.insightSubtitle, { color: colors.textMuted }]} className="text-sm text-center leading-5 mb-4">
                    {insight.subtitle}
                  </Text>
                  {insight.progress && (
                    <View style={styles.progressContainer} className="w-full mb-4">
                      <View style={[styles.progressBar, { backgroundColor: colors.border }]} className="h-2 rounded-full">
                        <View 
                          style={[
                            styles.progressFill, 
                            { backgroundColor: insight.color, width: `${insight.progress}%` }
                          ]} 
                          className="h-full rounded-full"
                        />
                      </View>
                      <Text style={[styles.progressText, { color: colors.textMuted }]} className="text-xs mt-2 text-center">
                        {insight.progress}% Complete
                      </Text>
                    </View>
                  )}
                  {insight.cta && (
                    <Button
                      title={insight.cta}
                      onPress={() => {}}
                      variant="ghost"
                      size="small"
                      style={{ backgroundColor: `${insight.color}20` }}
                      textStyle={{ color: insight.color }}
                    />
                  )}
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Enhanced Analytics Section */}
        <Card style={styles.analyticsCard} className="mx-6 mb-6" elevated>
          <View style={styles.analyticsHeader} className="flex-row justify-between items-center mb-6">
            <Text style={[styles.sectionTitle, { color: colors.text }]} className="text-xl font-bold">
              Spending Analytics
            </Text>
            <View style={[styles.analyticsIconContainer, { backgroundColor: `${colors.primary}20` }]} className="w-10 h-10 rounded-full justify-center items-center">
              <BarChart3 size={20} color={colors.primary} />
            </View>
          </View>
          
          <View style={styles.analyticsContent} className="flex-row justify-around">
            <View style={styles.analyticsItem} className="items-center">
              <Text style={[styles.analyticsLabel, { color: colors.textMuted }]} className="text-xs mb-3 font-semibold uppercase tracking-wider">
                This Week
              </Text>
              <Text style={[styles.analyticsValue, { color: colors.text }]} className="text-xl font-bold mb-3">
                {formatCurrency(45000, selectedCurrency)}
              </Text>
              <View style={[styles.trendIndicator, { backgroundColor: `${colors.success}20` }]} className="flex-row items-center px-3 py-1 rounded-full">
                <TrendingUp size={12} color={colors.success} />
                <Text style={[styles.trendText, { color: colors.success }]} className="text-xs font-bold ml-1">+12%</Text>
              </View>
            </View>
            <View style={styles.analyticsItem} className="items-center">
              <Text style={[styles.analyticsLabel, { color: colors.textMuted }]} className="text-xs mb-3 font-semibold uppercase tracking-wider">
                Most Used
              </Text>
              <Text style={[styles.analyticsValue, { color: colors.text }]} className="text-xl font-bold mb-3">
                {selectedCurrency}
              </Text>
              <View style={[styles.currencyBadge, { backgroundColor: `${colors.primary}20` }]} className="px-3 py-1 rounded-full">
                <Text style={[styles.currencyBadgeText, { color: colors.primary }]} className="text-xs font-bold">Primary</Text>
              </View>
            </View>
            <View style={styles.analyticsItem} className="items-center">
              <Text style={[styles.analyticsLabel, { color: colors.textMuted }]} className="text-xs mb-3 font-semibold uppercase tracking-wider">
                Saved
              </Text>
              <Text style={[styles.analyticsValue, { color: colors.text }]} className="text-xl font-bold mb-3">
                {formatCurrency(12500, selectedCurrency)}
              </Text>
              <View style={[styles.savingsBadge, { backgroundColor: `${colors.warning}20` }]} className="flex-row items-center px-3 py-1 rounded-full">
                <Target size={12} color={colors.warning} />
                <Text style={[styles.savingsText, { color: colors.warning }]} className="text-xs font-bold ml-1">Goal</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Enhanced Performance Metrics */}
        <Card style={styles.metricsCard} className="mx-6 mb-10" elevated>
          <View style={styles.metricsHeader} className="flex-row items-center mb-6">
            <View style={[styles.metricsIconContainer, { backgroundColor: `${colors.warning}20` }]} className="w-10 h-10 rounded-full justify-center items-center mr-3">
              <Zap size={20} color={colors.warning} />
            </View>
            <Text style={[styles.metricsTitle, { color: colors.text }]} className="text-lg font-bold">
              Network Performance
            </Text>
          </View>
          <View style={styles.metricsGrid} className="flex-row justify-around">
            <View style={styles.metricItem} className="items-center">
              <Text style={[styles.metricValue, { color: colors.success }]} className="text-lg font-bold mb-2">~3s</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]} className="text-xs font-semibold">Avg. Speed</Text>
            </View>
            <View style={styles.metricItem} className="items-center">
              <Text style={[styles.metricValue, { color: colors.success }]} className="text-lg font-bold mb-2">$0.01</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]} className="text-xs font-semibold">Avg. Fee</Text>
            </View>
            <View style={styles.metricItem} className="items-center">
              <Text style={[styles.metricValue, { color: colors.success }]} className="text-lg font-bold mb-2">99.9%</Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]} className="text-xs font-semibold">Success Rate</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Modals */}
      <WalletPickerModal
        visible={showWalletPicker}
        onClose={() => setShowWalletPicker(false)}
        onCreateNew={() => {
          setShowWalletPicker(false);
          setShowCreateWallet(true);
        }}
      />

      <CreateWalletModal
        visible={showCreateWallet}
        onClose={() => setShowCreateWallet(false)}
      />

      <FundWalletModal
        visible={showFundModal}
        onClose={() => setShowFundModal(false)}
      />
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  greeting: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  name: {
    flexDirection: 'row',
  },
  greetingText: {
    fontSize: 24,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  walletCard: {
    marginHorizontal: 12,
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 8,
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletSelector: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletAddressContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  walletAddress: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  walletBadge: {
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 10,
  },
  walletBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  balanceSection: {
    alignItems: 'center',
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  balanceXLM: {
    fontSize: 16,
    marginBottom: 12,
  },
  currencyFlags: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  flagButton: {
    width: 56,
    height: 54,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  flag: {
    fontSize: 18,
  },
  currencyCode: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  actionsCard: {
    marginHorizontal: 12,
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    alignItems: 'center',
    paddingLeft: 18,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 90) / 4,
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  actionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  insightsSection: {
    marginBottom: 18,
  },
  
  insightsScroll: {
    paddingLeft: 12,
  },
  insightCard: {
    width: 340,
    marginRight: 12,
    minHeight: 160,
    borderRadius: 10,
  },
  insightContent: {
    alignItems: 'center',
    position: 'relative',
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  insightSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 12,
    marginBottom: 12,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  analyticsCard: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  analyticsIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analyticsItem: {
    
  },
  analyticsLabel: {
    fontSize: 12,
    marginBottom: 12,
    fontWeight: '700',
  },
  analyticsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  currencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currencyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricsCard: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  metricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  metricsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});