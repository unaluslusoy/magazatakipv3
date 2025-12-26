// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:3000/api',
  SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
};

// Device Configuration
export const DEVICE_CONFIG = {
  DEVICE_ID: process.env.DEVICE_ID || '',
  DEVICE_CODE: process.env.DEVICE_CODE || '',
};

// Sync Configuration
export const SYNC_CONFIG = {
  INTERVAL: parseInt(process.env.SYNC_INTERVAL || '300000', 10), // 5 dakika
  MAX_RETRY: parseInt(process.env.MAX_RETRY_ATTEMPTS || '3', 10),
  OFFLINE_MODE: process.env.OFFLINE_MODE === 'true',
};

// Media Cache Configuration
export const CACHE_CONFIG = {
  SIZE_LIMIT: parseInt(process.env.CACHE_SIZE_LIMIT || '5000', 10), // MB
  EXPIRY_DAYS: parseInt(process.env.CACHE_EXPIRY_DAYS || '30', 10),
  DOWNLOAD_PATH: 'media_cache',
};

// App Configuration
export const APP_CONFIG = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  ENABLE_DEBUG: process.env.ENABLE_DEBUG === 'true',
  VERSION: '1.0.0',
};

// Storage Keys
export const STORAGE_KEYS = {
  DEVICE_INFO: 'device_info',
  AUTH_TOKEN: 'auth_token',
  PLAYLISTS: 'playlists',
  CONTENTS: 'contents',
  SCHEDULES: 'schedules',
  LAST_SYNC: 'last_sync',
  OFFLINE_QUEUE: 'offline_queue',
};
