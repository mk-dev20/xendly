export const formatCurrency = (amount: number, currency: string): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency === 'XLM' ? 7 : 2,
    maximumFractionDigits: currency === 'XLM' ? 7 : 2,
  }).format(amount);
  
  return `${formatted} ${currency}`;
};

export const shortenAddress = (address: string, start = 6, end = 4): string => {
  if (address.length <= start + end) return address;
  return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const countryToFlag = (code: string): string => {
  return code
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
};

export const isValidStellarAddress = (address: string): boolean => {
  try {
    const { StrKey } = require('stellar-sdk');
    return StrKey.isValidEd25519PublicKey(address);
  } catch (error) {
    console.error('Stellar SDK validation error:', error);
    // Fallback validation if SDK fails
    return address.length === 56 && address.startsWith('G');
  }
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to XLM first, then to target currency
  const xlmAmount = amount / rates[fromCurrency];
  return xlmAmount * rates[toCurrency];
};

export const formatTransactionHash = (hash: string): string => {
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes}m ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours}h ago`;
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const parseBalance = (balanceString: string): number => {
  // Parse balance from Stellar format "amount asset_code"
  const parts = balanceString.split(' ');
  return parseFloat(parts[0]) || 0;
};

export const getAssetFromBalance = (balanceString: string): string => {
  // Extract asset code from Stellar format "amount asset_code"
  const parts = balanceString.split(' ');
  return parts[1] || 'XLM';
};