
export interface AuthResponse {
  user_id: string;
  email: string;
  username: string;
  phone_number?: string;
  is_verified: boolean;
  is_phone_verified: boolean;
  token: string;
  two_fa_required?: boolean;
}

export interface User {
  user_id: string;
  email: string;
  username: string;
  phone_number?: string;
  is_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
}

export interface Wallet {
  wallet_id: string;
  wallet_name: string;
  public_key: string;
  balance_xlm: string;
  balances: string[];
  created_at: string;
}

export interface AssetBalance {
  id: string;
  wallet_id: string;
  asset_type: string;
  asset_code: string;
  asset_issuer: string | null;
  balance: string;
  last_updated: string;
}


export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  asset_code: string;
  asset_issuer?: string;
  memo?: string;
  status: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  status: string;
  date: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  security_alerts: boolean;
  payment_failure_alerts: boolean;
  incoming_payment_alerts: boolean;
  outgoing_payment_alerts: boolean;
  balance_change_alerts: boolean;
  exchange_alerts: boolean;
  system_alerts: boolean;
  low_balance_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface TwoFAStatus {
  enabled: boolean;
  setup_complete: boolean;
  backup_codes_remaining: number;
}

export interface TwoFASetup {
  secret_key: string;
  qr_code_svg: string;
  backup_codes: string[];
  message: string;
}

export interface Country {
  code: string;
  name: string;
  currency: string;
  flag: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<{ two_fa_required: boolean; user_id?: string }>;
  signup: (email: string, password: string, username: string, phoneNumber?: string) => Promise<any>;
  logout: () => Promise<void>;
  verify2FA: (userId: string, totpCode: string) => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface WalletContextType {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  isLoading: boolean;
  refreshWallets: () => Promise<void>;
  selectWallet: (wallet: Wallet) => void;
  createWallet: (name: string, password: string) => Promise<any>;
  fundWallet: (walletId: string) => Promise<any>;
  sendMoney: (params: SendMoneyParams) => Promise<any>;
  syncWallet: (walletId: string) => Promise<any>;
  getWalletTransactions: (walletId: string) => Promise<Transaction[]>;
  getReceiveInfo: (walletId: string) => Promise<any>;
}

export interface SendMoneyParams {
  walletId: string;
  destination: string;
  amount: number;
  assetCode: string;
  memo?: string;
  password: string;
  totpCode?: string;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    error: string;
    warning: string;
  };
}