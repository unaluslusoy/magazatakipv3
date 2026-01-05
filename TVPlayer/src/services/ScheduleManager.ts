import StorageService from './StorageService';
import type { Schedule, Playlist } from '@types/index';
import { parse, format } from 'date-fns';

/**
 * Schedule Manager
 * Determines which playlist should be playing based on schedules
 */
class ScheduleManager {
  /**
   * Get current active playlist based on schedules
   */
  async getCurrentPlaylist(): Promise<Playlist | null> {
    try {
      const schedules = await StorageService.getSchedules();
      const playlists = await StorageService.getPlaylists();

      // Önce cihaza atanmış playlist'i kontrol et
      const deviceInfo = await StorageService.getDeviceInfo();
      const devicePlaylistId = deviceInfo?.current_playlist_id;

      // Eğer hiç schedule yoksa, cihazın varsayılan playlist'ini veya ilk playlist'i kullan
      if (schedules.length === 0) {
        console.log('No schedules found, using default playlist');

        if (devicePlaylistId) {
          const devicePlaylist = playlists.find(p => p.id === devicePlaylistId);
          if (devicePlaylist) {
            return devicePlaylist;
          }
        }

        // İlk aktif playlist'i döndür
        return playlists.find(p => p.is_active) || playlists[0] || null;
      }

      // Filter active schedules
      const activeSchedules = schedules.filter(s => s.is_active);
      if (activeSchedules.length === 0) {
        console.log('No active schedules, using default playlist');
        return playlists.find(p => p.is_active) || playlists[0] || null;
      }

      // Get current time info
      const now = new Date();
      const currentTime = format(now, 'HH:mm:ss');
      // JavaScript getDay(): 0=Pazar, 1=Pazartesi, ... 6=Cumartesi
      // API: 1=Pazartesi, 7=Pazar
      const jsDay = now.getDay();
      const apiDay = jsDay === 0 ? 7 : jsDay; // Pazar'ı 7 yap

      // Find matching schedules
      const matchingSchedules = activeSchedules.filter(schedule => {
        // Check day of week - days_of_week artık number[] olarak geliyor
        if (schedule.days_of_week && Array.isArray(schedule.days_of_week)) {
          if (!schedule.days_of_week.includes(apiDay)) {
            return false;
          }
        }

        // Check time range
        if (schedule.start_time && schedule.end_time) {
          const isInTimeRange = this.isTimeInRange(
            currentTime,
            schedule.start_time,
            schedule.end_time
          );
          return isInTimeRange;
        }

        return true;
      });

      if (matchingSchedules.length === 0) {
        console.log('No matching schedules for current time, using default playlist');

        if (devicePlaylistId) {
          const devicePlaylist = playlists.find(p => p.id === devicePlaylistId);
          if (devicePlaylist) {
            return devicePlaylist;
          }
        }

        return playlists.find(p => p.is_active) || playlists[0] || null;
      }

      // Sort by priority (higher first)
      matchingSchedules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      // Get highest priority schedule
      const selectedSchedule = matchingSchedules[0];

      // Get playlist
      const playlist = await StorageService.getPlaylistById(selectedSchedule.playlist_id);

      if (!playlist) {
        console.log('Playlist not found for schedule:', selectedSchedule.id);
        return playlists.find(p => p.is_active) || playlists[0] || null;
      }

      console.log('Selected playlist:', playlist.name, 'Priority:', selectedSchedule.priority);
      return playlist;
    } catch (error) {
      console.error('Failed to get current playlist:', error);

      // Hata durumunda fallback olarak ilk playlist'i dön
      try {
        const playlists = await StorageService.getPlaylists();
        return playlists[0] || null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Check if current time is within schedule time range
   */
  private isTimeInRange(
    currentTime: string,
    startTime: string,
    endTime: string
  ): boolean {
    try {
      const current = parse(currentTime, 'HH:mm:ss', new Date());
      const start = parse(startTime, 'HH:mm:ss', new Date());
      const end = parse(endTime, 'HH:mm:ss', new Date());

      // Handle overnight schedules (e.g., 22:00 - 02:00)
      if (end < start) {
        return current >= start || current <= end;
      }

      return current >= start && current <= end;
    } catch (error) {
      console.error('Failed to check time range:', error);
      return false;
    }
  }

  /**
   * Get next schedule change time
   * Returns minutes until next schedule change
   */
  async getNextScheduleChange(): Promise<number | null> {
    try {
      const schedules = await StorageService.getSchedules();
      const now = new Date();
      let nextChangeMinutes: number | null = null;

      for (const schedule of schedules) {
        if (!schedule.start_time) continue;

        const startTime = parse(schedule.start_time, 'HH:mm:ss', now);
        const minutesUntilStart = Math.floor(
          (startTime.getTime() - now.getTime()) / 1000 / 60
        );

        if (
          minutesUntilStart > 0 &&
          (nextChangeMinutes === null || minutesUntilStart < nextChangeMinutes)
        ) {
          nextChangeMinutes = minutesUntilStart;
        }
      }

      return nextChangeMinutes;
    } catch (error) {
      console.error('Failed to get next schedule change:', error);
      return null;
    }
  }
}

export default new ScheduleManager();
