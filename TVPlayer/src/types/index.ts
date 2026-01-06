// Device Types
export interface Device {
  id: number;
  device_code: string;
  device_name: string;
  store_id: number;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  current_playlist_id?: number;
  orientation?: 'landscape' | 'portrait';
  resolution?: string;
  layout_type?: 'single' | 'split' | 'grid';
  store_name?: string;
  last_seen?: string;
  created_at?: string;
}

// Playlist Types
export interface Playlist {
  id: number;
  name: string;
  description?: string;
  duration_seconds: number;
  is_default: boolean;
  priority: number;
  is_active: boolean;
  contents?: PlaylistContent[];
  created_at: string;
  updated_at?: string;
}

export interface PlaylistContent {
  id: number;
  playlist_id: number;
  content_id: number;
  position: number;
  duration_override?: number;
  transition_type?: string;
  content: Content;
}

// Content Types
export interface Content {
  id: number;
  name: string;
  title?: string; // API'den gelebilir
  description?: string;
  ticker_text?: string; // Kayan yazı metni
  type: 'image' | 'video' | 'slider' | 'ticker' | 'announcement' | 'template';
  file_url?: string;
  url?: string; // API'den bu şekilde de gelebilir
  thumbnail_url?: string;
  thumbnail?: string; // API'den bu şekilde de gelebilir
  duration_seconds?: number;
  duration?: number; // API'den bu şekilde de gelebilir
  order?: number;
  status?: string;
  is_active?: boolean;
  created_at?: string;
  local_path?: string; // For downloaded files
}

// Schedule Types
export interface Schedule {
  id: number;
  device_id?: number;
  playlist_id: number;
  playlist_name?: string;
  schedule_type?: 'daily' | 'weekly' | 'custom';
  start_date?: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  days_of_week?: number[]; // [1, 2, 3, 4, 5] - 1=Pazartesi, 7=Pazar
  priority?: number;
  is_active: boolean;
  playlist?: Playlist;
}

// Auth Types
export interface LoginCredentials {
  device_code: string;
}

export interface AuthToken {
  token: string;
  device: Device;
  expires_at: string;
}

// Sync Types
export interface SyncStatus {
  last_sync_at?: string;
  is_syncing: boolean;
  playlists_count: number;
  contents_count: number;
  schedules_count: number;
  pending_downloads: number;
}

export interface DownloadProgress {
  content_id: number;
  file_url: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  local_path?: string;
  error?: string;
}

// Player Types
export interface PlayerState {
  current_playlist_id?: number;
  current_content_index: number;
  is_playing: boolean;
  volume: number;
  is_muted: boolean;
  playback_mode: 'normal' | 'loop' | 'shuffle';
}

// Log Types
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  data?: any;
}
