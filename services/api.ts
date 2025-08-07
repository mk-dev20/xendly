const API_BASE_URL = 'http://localhost:8080';


class ApiService {
  private token: string | null = null;

  setAuthToken(token: string) {
    this.token = token;
  }

  clearAuthToken() {
    this.token = null;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    console.log('✅ Sending auth headers:', headers);
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Auth endpoints
  async login(emailOrUsername: string, password: string) {
    return this.request<{ 
      token: string; 
      expires_in: number; 
      two_fa_required: boolean; 
      user_id: string 
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email_or_username: emailOrUsername, 
        password 
      }),
    });
  }

  async register(email: string, password: string, username: string, phoneNumber?: string) {
    return this.request<{ 
      message: string; 
      user_id: string 
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        username, 
        phone_number: phoneNumber 
      }),
    });
  }

  async verify2FA(userId: string, totpCode: string) {
    return this.request<{ 
      token: string; 
      expires_in: number 
    }>('/api/auth/2fa-verify', {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId, 
        totp_code: totpCode 
      }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });
  }

  async logoutAll() {
    return this.request<{ message: string }>('/api/auth/logout-all', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });
  }

  async refreshToken() {
    return this.request<{ 
      token: string; 
      expires_in: number 
    }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });
  }

  async validateToken() {
    return this.request<{ 
      valid: boolean; 
      user_id: string; 
      email: string; 
      username: string 
    }>('/api/auth/validate', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, totpCode?: string) {
    return this.request<{ message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId, 
        current_password: currentPassword, 
        new_password: newPassword,
        totp_code: totpCode 
      }),
    });
  }

  async deleteAccount(userId: string, password: string, totpCode?: string) {
    return this.request<{ message: string }>('/api/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId, 
        password, 
        totp_code: totpCode 
      }),
    });
  }

  // Profile endpoints
  async getProfile() {
    return this.request<{
      user_id: string;
      email: string;
      username: string;
      phone_number?: string;
      is_verified: boolean;
      is_phone_verified: boolean;
      created_at: string;
    }>('/api/profile');
  }

  async updateProfile(email?: string, username?: string, phoneNumber?: string) {
    return this.request<{
      user_id: string;
      email: string;
      username: string;
      phone_number?: string;
      is_verified: boolean;
      is_phone_verified: boolean;
      created_at: string;
    }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ 
        email, 
        username, 
        phone_number: phoneNumber 
      }),
    });
  }

  async updatePhone(phoneNumber: string) {
    return this.request<{
      user_id: string;
      email: string;
      username: string;
      phone_number?: string;
      is_verified: boolean;
      is_phone_verified: boolean;
      created_at: string;
    }>('/api/profile/phone', {
      method: 'PUT',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  }

  async sendPhoneVerification(phoneNumber: string) {
    return this.request<{ 
      success: boolean; 
      message: string 
    }>('/api/profile/phone/send-verification', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  }

  async verifyPhone(code: string) {
    return this.request<{ 
      success: boolean; 
      message: string 
    }>('/api/profile/phone/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // 2FA Profile endpoints
  async get2FAStatus() {
    return this.request<{
      enabled: boolean;
      setup_complete: boolean;
      backup_codes_remaining: number;
    }>('/api/profile/2fa/status');
  }

  async setup2FA() {
    return this.request<{
      secret_key: string;
      qr_code_svg: string;
      backup_codes: string[];
      message: string;
    }>('/api/profile/2fa/setup');
  }

  async enable2FA(totpCode: string) {
    return this.request<{
      success: boolean;
      message: string;
      backup_codes: string[];
    }>('/api/profile/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({ totp_code: totpCode }),
    });
  }

  async disable2FA(userId: string, totpCode: string) {
    return this.request<{ message: string }>('/api/auth/disable-2fa', {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId, 
        totp_code: totpCode 
      }),
    });
  }

  // Wallet endpoints
  async getWallets() {
    return this.request<{
      wallets: Array<{
        wallet_id: string;
        wallet_name: string;
        public_key: string;
        balances: string[];
      }>
    }>('/api/wallets');
  }

  async getWallet(walletId: string) {
    return this.request<{
      wallet_id: string;
      wallet_name: string;
      public_key: string;
      balance_xlm: string;
      balances: string[];
      created_at: string;
    }>(`/api/wallets/${walletId}`);
  }

  async createWallet(walletName: string, password: string) {
    return this.request<{
      wallet_id: string;
      wallet_name: string;
      public_key: string;
      message: string;
    }>('/api/wallets', {
      method: 'POST',
      body: JSON.stringify({ 
        wallet_name: walletName, 
        password 
      }),
    });
  }

  async importWallet(walletName: string, secretKey: string, password: string) {
    return this.request<{
      wallet_id: string;
      wallet_name: string;
      public_key: string;
      message: string;
    }>('/api/wallets/import', {
      method: 'POST',
      body: JSON.stringify({ 
        wallet_name: walletName, 
        secret_key: secretKey, 
        password 
      }),
    });
  }

  async getWalletBalance(walletId: string) {
    return this.request<string>(`/api/wallets/${walletId}/balance`);
  }

  async fundWallet(walletId: string) {
    return this.request<{
      wallet_id: string;
      public_key: string;
      message: string;
    }>(`/api/wallets/${walletId}/fund`, {
      method: 'POST',
    });
  }

  async syncWallet(walletId: string) {
    return this.request<{
      wallet_id: string;
      wallet_name: string;
      public_key: string;
      balance_xlm: string;
      balances: string[];
      created_at: string;
    }>(`/api/wallets/${walletId}/sync`, {
      method: 'POST',
    });
  }

  async getWalletTransactions(walletId: string) {
    return this.request<{
      transactions: Array<{
        hash: string;
        from: string;
        to: string;
        amount: string;
        asset_code: string;
        asset_issuer?: string;
        memo?: string;
        status: string;
        created_at: string;
      }>
    }>(`/api/wallets/${walletId}/transactions`);
  }

  async sendMoney(walletId: string, params: {
    destination: string;
    amount: number;
    asset_code: string;
    memo?: string;
    password: string;
    totp_code?: string;
  }) {
    return this.request<{
      message: string;
      transaction_hash: string;
    }>(`/api/wallets/${walletId}/send`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getReceiveInfo(walletId: string) {
    return this.request<{
      wallet_id: string;
      public_key: string;
      qr_code_url: string;
      supported_assets: string[];
      message: string;
    }>(`/api/wallets/${walletId}/receive`);
  }

  // Notification endpoints
  async getNotifications() {
    return this.request<{
      notifications: Array<{
        id: string;
        title: string;
        message: string;
        status: string;
        date: string;
      }>
    }>('/api/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request<{ message: string }>(`/api/notifications/${notificationId}/mark-read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string }>('/api/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request<{ message: string }>(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async deleteAllNotifications() {
    return this.request<{ message: string }>('/api/notifications/delete-all', {
      method: 'DELETE',
    });
  }

  async getNotificationPreferences() {
    return this.request<{
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
    }>('/api/notifications/preferences');
  }

  async updateNotificationPreferences(preferences: any) {
    return this.request<{ message: string }>('/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }
}

export const apiService = new ApiService();