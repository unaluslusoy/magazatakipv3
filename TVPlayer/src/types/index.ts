// Device Types
export interface Device {
  id: number;
  device_code: string;
  device_name: string;
  store_id: number;
  status: 'active' | 'inactive' | 'offline';
  last_seen?: string;
  created_at: string;
}

// Playlist Types
export interface Playlist {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  contents: PlaylistContent[];
  created_at: string;
  updated_at: string;
}

export interface PlaylistContent {
  id: number;
  content_id: number;
  playlist_id: number;
  order: number;
  duration: number;
  content: Content;
}

// Content Types
export interface Content {
  id: number;
  title: string;
  type: 'image' | 'video' | 'template' | 'announcement';
  file_url?: string;
  local_path?: string;
  duration: number;
  file_size?: number;
  thumbnail_url?: string;
  data?: any;
  is_active: boolean;
  created_at: string;
}

// Schedule Types
export interface Schedule {
  id: number;
  playlist_id: number;
  device_id?: number;
  store_id?: number;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  is_active: boolean;
  priority: number;
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
