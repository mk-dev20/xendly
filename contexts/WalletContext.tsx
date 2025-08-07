import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletContextType, Wallet, SendMoneyParams, Transaction } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext';

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshWallets();
    } else {
      setWallets([]);
      setSelectedWallet(null);
    }
  }, [isAuthenticated]);

  const refreshWallets = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getWallets();
      const walletsData = response.wallets;
      
      // Get detailed info for each wallet
      const detailedWallets = await Promise.all(
        walletsData.map(async (wallet) => {
          try {
            const details = await apiService.getWallet(wallet.wallet_id);
            return details;
          } catch (error) {
            console.error(`Failed to get details for wallet ${wallet.wallet_id}:`, error);
            return {
              ...wallet,
              balance_xlm: '0',
              created_at: new Date().toISOString(),
            };
          }
        })
      );
      
      setWallets(detailedWallets);
      
      // Set first wallet as selected if none selected or current selected doesn't exist
      if (detailedWallets.length > 0) {
        const currentWalletExists = selectedWallet && 
          detailedWallets.some(w => w.wallet_id === selectedWallet.wallet_id);
        
        if (!currentWalletExists) {
          setSelectedWallet(detailedWallets[0]);
        } else {
          // Update selected wallet with fresh data
          const updatedWallet = detailedWallets.find(w => w.wallet_id === selectedWallet.wallet_id);
          if (updatedWallet) {
            setSelectedWallet(updatedWallet);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const selectWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet);
  };

  const createWallet = async (name: string, password: string) => {
    try {
      // Check for duplicate wallet names
      const existingWallet = wallets.find(w => 
        w.wallet_name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingWallet) {
        throw new Error('A wallet with this name already exists');
      }

      const response = await apiService.createWallet(name, password);
      await refreshWallets();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const fundWallet = async (walletId: string) => {
  try {
    const response = await apiService.fundWallet(walletId);

    // Sync to get the real-time updated balance
    const syncedWallet = await syncWallet(walletId);

    // Set the synced wallet as the selected one
    setSelectedWallet(syncedWallet);

    return syncedWallet;
  } catch (error) {
    console.error('❌ Error funding wallet:', error);
    throw error;
  }
};



  const syncWallet = async (walletId: string) => {
    try {
      const syncedWallet = await apiService.syncWallet(walletId);
      setWallets(prev => prev.map(w => 
        w.wallet_id === walletId ? syncedWallet : w
      ));
      if (selectedWallet?.wallet_id === walletId) {
        setSelectedWallet(syncedWallet);
      }
      return syncedWallet;
    } catch (error) {
      throw error;
    }
  };

  const sendMoney = async (params: SendMoneyParams) => {
    try {
      const response = await apiService.sendMoney(params.walletId, {
        destination: params.destination,
        amount: params.amount,
        asset_code: params.assetCode,
        memo: params.memo,
        password: params.password,
        totp_code: params.totpCode,
      });
      await refreshWallets();
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getWalletTransactions = async (walletId: string): Promise<Transaction[]> => {
    try {
      const response = await apiService.getWalletTransactions(walletId);
      return response.transactions;
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  };

  const getReceiveInfo = async (walletId: string) => {
    try {
      return await apiService.getReceiveInfo(walletId);
    } catch (error) {
      throw error;
    }
  };

  const value: WalletContextType = {
    wallets,
    selectedWallet,
    isLoading,
    refreshWallets,
    selectWallet,
    createWallet,
    fundWallet,
    sendMoney,
    syncWallet,
    getWalletTransactions,
    getReceiveInfo,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}