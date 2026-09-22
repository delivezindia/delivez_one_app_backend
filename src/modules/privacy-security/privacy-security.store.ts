import fs from 'node:fs';
import path from 'node:path';
import type {
  PrivacySecuritySettings,
  UserDeviceItem,
  LoginActivityItem,
  SecurityIssueReport,
} from './privacy-security.types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'privacy-security-store.json');

interface UserPrivacyData {
  settings: PrivacySecuritySettings;
  devices: UserDeviceItem[];
  loginActivity: LoginActivityItem[];
}

const DEFAULT_SETTINGS: PrivacySecuritySettings = {
  twoFactorAuth: false,
  twoFactorStatusText: 'Off',
  profileVisibility: 'Public',
  personalisedRecommendations: true,
  analyticsUsageData: false,
  activeDevicesCount: 2,
};

const DEFAULT_DEVICES: UserDeviceItem[] = [
  {
    id: 'dev-curr',
    deviceId: 'android-pixel7-01',
    deviceName: 'Google Pixel 7 (This Device)',
    deviceType: 'Mobile',
    platform: 'Android 14',
    browser: 'Delivez Mobile App',
    lastActive: 'Active Now',
    isCurrent: true,
  },
  {
    id: 'dev-chrome',
    deviceId: 'win-chrome-02',
    deviceName: 'Chrome on Windows 11',
    deviceType: 'Desktop',
    platform: 'Windows NT 10.0',
    browser: 'Chrome 122.0',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
];

const DEFAULT_LOGIN_ACTIVITY: LoginActivityItem[] = [
  {
    id: 'log-1',
    timestamp: new Date().toISOString(),
    device: 'Google Pixel 7 (Delivez App)',
    location: 'Bengaluru, India',
    ipAddress: '49.37.12.89',
    status: 'SUCCESS',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    device: 'Chrome on Windows 11',
    location: 'Bengaluru, India',
    ipAddress: '49.37.12.89',
    status: 'SUCCESS',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 48 * 3600000).toISOString(),
    device: 'Mobile Safari on iPhone 14',
    location: 'Mumbai, India',
    ipAddress: '152.58.24.110',
    status: 'SUCCESS',
  },
];

let privacyStore: Record<string, UserPrivacyData> = {};
let securityReports: SecurityIssueReport[] = [];

function initStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.privacyStore) privacyStore = parsed.privacyStore;
      if (parsed.securityReports) securityReports = parsed.securityReports;
    }
  } catch (err) {
    console.error('Failed to init privacy-security store:', err);
  }
}

function saveStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ privacyStore, securityReports }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error('Failed to save privacy-security store:', err);
  }
}

initStorage();

export function getOrCreateUserPrivacy(userId: string): UserPrivacyData {
  if (!privacyStore[userId]) {
    privacyStore[userId] = {
      settings: { ...DEFAULT_SETTINGS },
      devices: JSON.parse(JSON.stringify(DEFAULT_DEVICES)),
      loginActivity: JSON.parse(JSON.stringify(DEFAULT_LOGIN_ACTIVITY)),
    };
    saveStorage();
  }
  privacyStore[userId].settings.activeDevicesCount = privacyStore[userId].devices.length;
  return privacyStore[userId];
}

export function updateUserSettings(
  userId: string,
  partial: Partial<PrivacySecuritySettings>
): PrivacySecuritySettings {
  const user = getOrCreateUserPrivacy(userId);
  if (partial.twoFactorAuth !== undefined) {
    user.settings.twoFactorAuth = Boolean(partial.twoFactorAuth);
    user.settings.twoFactorStatusText = user.settings.twoFactorAuth ? 'On' : 'Off';
  }
  if (partial.profileVisibility !== undefined) {
    user.settings.profileVisibility = partial.profileVisibility;
  }
  if (partial.personalisedRecommendations !== undefined) {
    user.settings.personalisedRecommendations = Boolean(partial.personalisedRecommendations);
  }
  if (partial.analyticsUsageData !== undefined) {
    user.settings.analyticsUsageData = Boolean(partial.analyticsUsageData);
  }
  saveStorage();
  return user.settings;
}

export function removeDevice(userId: string, deviceId: string): boolean {
  const user = getOrCreateUserPrivacy(userId);
  const initialCount = user.devices.length;
  user.devices = user.devices.filter((d) => d.id !== deviceId && d.deviceId !== deviceId);
  user.settings.activeDevicesCount = user.devices.length;
  saveStorage();
  return user.devices.length !== initialCount;
}

export function addSecurityReport(userId: string, issueType: string, description: string): SecurityIssueReport {
  const report: SecurityIssueReport = {
    id: `sec-${Date.now()}`,
    userId,
    issueType,
    description,
    reportedAt: new Date().toISOString(),
    status: 'PENDING',
  };
  securityReports.unshift(report);
  saveStorage();
  return report;
}
