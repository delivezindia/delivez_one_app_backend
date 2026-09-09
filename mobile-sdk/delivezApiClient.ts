/**
 * Delivez Mobile API Client (React Native / TypeScript)
 * Ready-to-use production client for React Native mobile apps.
 */
export class DelivezApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = 'http://localhost:4000/api/v1', initialToken?: string) {
    this.baseUrl = baseUrl;
    if (initialToken) this.accessToken = initialToken;
  }

  public setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Device-Platform': 'ReactNative',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const url = `${this.baseUrl}/${path.replace(/^\//, '')}`;
    const response = await fetch(url, { ...options, headers });
    const json = await response.json();

    if (!response.ok) {
      throw new DelivezApiError(
        response.status,
        json.message || 'API request failed',
        json.error
      );
    }

    return json.data as T;
  }

  // ==========================================
  // 1. SYSTEM & HOME
  // ==========================================
  public checkHealth() {
    return this.request('/health');
  }

  public getHomeFeed() {
    return this.request('/home/all');
  }

  public detectLocation(lat?: number, lng?: number) {
    if (lat !== undefined && lng !== undefined) {
      return this.request(`/location/detect?lat=${lat}&lng=${lng}`);
    }
    return this.request('/location/current');
  }

  public checkPincode(pincode: string) {
    return this.request(`/pincode/${pincode}`);
  }

  // ==========================================
  // 2. AUTHENTICATION & PROFILE
  // ==========================================
  public sendLoginOtp(mobileNumber: string, countryCode: string = '+91') {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ countryCode, mobileNumber }),
    });
  }

  public async verifyOtp(challengeId: string, otp: string, deviceId?: string) {
    const data = await this.request<{ user: any; accessToken: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ challengeId, otp, deviceId }),
    });
    if (data?.accessToken) {
      this.setAccessToken(data.accessToken);
    }
    return data;
  }

  public getProfile() {
    return this.request('/auth/me');
  }

  // ==========================================
  // 3. SAVED ADDRESSES
  // ==========================================
  public async getAddresses() {
    const data = await this.request<{ addresses: any[] }>('/addresses');
    return data.addresses || [];
  }

  public saveAddress(address: Record<string, any>) {
    return this.request('/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  // ==========================================
  // 4. SERVICE 1: PERSONAL COURIER
  // ==========================================
  public getCourierOptions() {
    return this.request('/courier/options');
  }

  public getCourierQuote(payload: Record<string, any>) {
    return this.request('/courier/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public createCourierBooking(payload: Record<string, any>) {
    return this.request('/courier/bookings', {
      method: 'POST',
      headers: { 'Idempotency-Key': `idemp-${Date.now()}` },
      body: JSON.stringify(payload),
    });
  }

  public trackCourierBooking(id: string) {
    return this.request(`/courier/bookings/${id}/track`);
  }

  public getCourierPod(id: string) {
    return this.request(`/courier/bookings/${id}/pod`);
  }

  // ==========================================
  // 5. SERVICE 2: LUGGAGE DELIVERY
  // ==========================================
  public getLuggageOptions() {
    return this.request('/luggage-delivery/options');
  }

  public getLuggageQuote(payload: Record<string, any>) {
    return this.request('/luggage-delivery/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public createLuggageBooking(payload: Record<string, any>) {
    return this.request('/luggage-delivery/bookings', {
      method: 'POST',
      headers: { 'Idempotency-Key': `idemp-${Date.now()}` },
      body: JSON.stringify(payload),
    });
  }

  // ==========================================
  // 6. SERVICE 3: CONFIDENTIAL VAULT DELIVERY
  // ==========================================
  public getVaultOptions() {
    return this.request('/confidential-delivery/options');
  }

  public getVaultQuote(payload: Record<string, any>) {
    return this.request('/confidential-delivery/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public createVaultBooking(payload: Record<string, any>) {
    return this.request('/confidential-delivery/bookings', {
      method: 'POST',
      headers: { 'Idempotency-Key': `idemp-${Date.now()}` },
      body: JSON.stringify(payload),
    });
  }

  public trackVaultShipment(vaultId: string) {
    return this.request(`/confidential-delivery/track/${vaultId}`);
  }

  public verifyVaultOtp(id: string, otp: string) {
    return this.request(`/confidential-delivery/track/${id}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    });
  }

  // ==========================================
  // 7. SERVICE 4: FORGOT SOMETHING
  // ==========================================
  public getForgotSomethingOptions() {
    return this.request('/forgot-something/options');
  }

  public getForgotSomethingQuote(payload: Record<string, any>) {
    return this.request('/forgot-something/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public createForgotSomethingBooking(payload: Record<string, any>) {
    return this.request('/forgot-something/bookings', {
      method: 'POST',
      headers: { 'Idempotency-Key': `idemp-${Date.now()}` },
      body: JSON.stringify(payload),
    });
  }

  public trackForgotSomething(id: string) {
    return this.request(`/forgot-something/track/${id}`);
  }

  public verifyForgotSomethingOtp(id: string, type: 'PICKUP' | 'DELIVERY', otp: string) {
    return this.request(`/forgot-something/track/${id}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ type, otp }),
    });
  }

  // ==========================================
  // 8. UNIVERSAL TRACKER & SUPPORT
  // ==========================================
  public universalTrack(trackingId: string) {
    return this.request(`/track/${encodeURIComponent(trackingId)}`);
  }

  public getSupportConfig() {
    return this.request('/support/config');
  }

  public submitInquiry(payload: Record<string, any>) {
    return this.request('/support/inquiry', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export class DelivezApiError extends Error {
  public statusCode: number;
  public details: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = 'DelivezApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
