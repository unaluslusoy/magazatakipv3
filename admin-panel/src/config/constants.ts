export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const APP_NAME = 'MağazaPano';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  MEDIA: '/media',
  PLAYLISTS: '/playlists',
  DEVICES: '/devices',
  SCHEDULES: '/schedules',
  CAMPAIGNS: '/campaigns',
  STORES: '/stores',
  SETTINGS: '/settings',
} as const;

export const CONTENT_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
  SLIDER: 'slider',
  TICKER: 'ticker',
  ANNOUNCEMENT: 'announcement',
} as const;

export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error',
} as const;
