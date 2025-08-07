import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { ThemedBackground } from '@/components/ThemedBackground';
import { Card } from '@/components/Card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useWallet } from '@/contexts/WalletContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency, shortenAddress, formatDate } from '@/utils/format';
import { Transaction } from '@/types';
import { Send, ArrowDownLeft, Wallet, ArrowLeftRight, Clock, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, History as HistoryIcon } from 'lucide-react-native';

const filterOptions = ['All', 'Sent', 'Received', 'Funded', 'Swaps'];

export default function HistoryScreen() {
  const { selectedWallet, getWalletTransactions } = useWallet();
  const { colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [selectedWallet]);

  const loadTransactions = async () => {
    if (!selectedWallet) return;
    
    setLoading(true);
    try {
      const data = await getWalletTransactions(selectedWallet.wallet_id);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      Alert.alert('Error', 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const getTransactionType = (tx: Transaction): 'sent' | 'received' | 'funded' | 'swap' => {
    if (tx.from === selectedWallet?.public_key) return 'sent';
    if (tx.to === selectedWallet?.public_key) return 'received';
    if (tx.from === 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR') return 'funded'; // Friendbot
    return 'swap';
  };

  const filteredTransactions = transactions.filter(tx => {
    if (selectedFilter === 'All') return true;
    const type = getTransactionType(tx);
    return type === selectedFilter.toLowerCase().slice(0, -1);
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return Send;
      case 'received':
        return ArrowDownLeft;
      case 'funded':
        return Wallet;
      case 'swap':
        return ArrowLeftRight;
      default:
        return Clock;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return CheckCircle;
      case 'failed':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return colors.success;
      case 'failed':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const type = getTransactionType(item);
    const TransactionIcon = getTransactionIcon(type);
    const StatusIcon = getStatusIcon(item.status);
    const statusColor = getStatusColor(item.status);
    const isPositive = type === 'received' || type === 'funded';
    const amount = parseFloat(item.amount);

    return (
      <Card style={styles.transactionCard} className="mx-6 mb-3" elevated>
        <View style={styles.transactionRow} className="flex-row justify-between">
          <View style={styles.transactionLeft} className="flex-row flex-1">
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]} 
                  className="w-12 h-12 rounded-full justify-center items-center mr-4">
              <TransactionIcon size={20} color={colors.primary} />
            </View>
            <View style={styles.transactionDetails} className="flex-1">
              <Text style={[styles.transactionType, { color: colors.text }]} className="text-base font-bold mb-1">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
              <Text style={[styles.transactionAddress, { color: colors.textMuted }]} className="text-xs font-mono mb-1">
                {type === 'sent' ? `To: ${shortenAddress(item.to)}` : 
                 type === 'received' ? `From: ${shortenAddress(item.from)}` :
                 type === 'funded' ? 'Friendbot Funding' : 'Currency Swap'}
              </Text>
              <View style={styles.assetInfo} className="flex-row items-center mb-1">
                <Text style={[styles.assetCode, { color: colors.textMuted }]} className="text-xs font-semibold">
                  {item.asset_code}
                </Text>
                {item.asset_code !== 'XLM' && (
                  <View style={[styles.assetBadge, { backgroundColor: `${colors.accent}20` }]} className="ml-2 px-2 py-1 rounded-full">
                    <Text style={[styles.assetBadgeText, { color: colors.accent }]} className="text-xs font-bold">
                      Asset
                    </Text>
                  </View>
                )}
              </View>
              {item.memo && (
                <Text style={[styles.transactionMemo, { color: colors.textMuted }]} className="text-xs italic">
                  "{item.memo}"
                </Text>
              )}
              <Text style={[styles.transactionDate, { color: colors.textMuted }]} className="text-xs font-semibold mt-1">
                {formatDate(item.created_at)}
              </Text>
            </View>
          </View>
          
          <View style={styles.transactionRight} className="items-end">
            <Text style={[
              styles.transactionAmount, 
              { color: isPositive ? colors.success : colors.text }
            ]} className="text-lg font-bold mb-2">
              {isPositive ? '+' : '-'}{formatCurrency(amount, item.asset_code)}
            </Text>
            <View style={styles.statusRow} className="flex-row items-center">
              <StatusIcon size={12} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]} className="text-xs font-bold ml-1 capitalize">
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    );
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
      <View style={styles.container} className="flex-1">
        <View style={styles.header} className="px-6 mb-6 items-center">
          <View style={[styles.headerIcon, { backgroundColor: `${colors.primary}20` }]} 
                className="w-16 h-16 rounded-full justify-center items-center mb-4">
            <HistoryIcon size={32} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]} className="text-3xl font-bold mb-2">
            Transaction History
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]} className="text-base text-center">
            View all your wallet activity
          </Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer} className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6">
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: selectedFilter === filter ? colors.primary : `${colors.primary}15`,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedFilter(filter)}
                className="px-6 py-3 rounded-full border-2 mr-3"
              >
                <Text style={[
                  styles.filterText,
                  { color: selectedFilter === filter ? '#FFFFFF' : colors.primary }
                ]} className="text-sm font-bold">
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.hash}
          renderItem={renderTransaction}
          contentContainerStyle={styles.transactionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState} className="items-center justify-center py-20">
              <Clock size={64} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]} className="text-xl font-bold mt-6 mb-2">
                No transactions found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textMuted }]} className="text-base text-center">
                Your transaction history will appear here
              </Text>
            </View>
          }
        />
      </View>
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
  filterContainer: {
    paddingLeft: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
  },
  transactionsList: {
    paddingBottom: 40,
  },
  transactionCard: {
    marginBottom: 12,
    padding: 20,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    marginLeft: 16,
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  transactionAddress: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  transactionMemo: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  assetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  assetCode: {
    fontSize: 12,
    fontWeight: '600',
  },
  assetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  assetBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});