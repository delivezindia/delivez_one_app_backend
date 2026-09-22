export interface PrivacySecuritySettings {
  twoFactorAuth: boolean;
  twoFactorStatusText: string;
  profileVisibility: 'Public' | 'Contacts Only' | 'Private';
  personalisedRecommendations: boolean;
  analyticsUsageData: boolean;
  activeDevicesCount: number;
}

export interface UserDeviceItem {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  platform: string;
  browser: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginActivityItem {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface SecurityIssueReport {
  id: string;
  userId: string;
  issueType: string;
  description: string;
  reportedAt: string;
  status: 'PENDING' | 'RESOLVED';
}
