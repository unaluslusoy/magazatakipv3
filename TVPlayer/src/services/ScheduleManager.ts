import StorageService from './StorageService';
import type { Schedule, Playlist } from '@types/index';
import { parse, format } from 'date-fns';

/**
 * Schedule Manager
 * Yeni API ile playlist yönetimi
 * Not: Yeni API'de schedule endpoint'i olmayabilir, bu durumda direkt playlist kullanılır
 */
class ScheduleManager {
  /**
   * Mevcut playlist'i al
   * Öncelik: Schedule -> Cihaz Playlist -> İlk Playlist
   */
  async getCurrentPlaylist(): Promise<Playlist | null> {
    try {
      const playlists = await StorageService.getPlaylists();

      if (playlists.length === 0) {
        console.log('[ScheduleManager] Hiç playlist yok');
        return null;
      }

      // Schedule'ları kontrol et (varsa)
      try {
        const schedules = await StorageService.getSchedules();

        if (schedules.length > 0) {
          const activeSchedules = schedules.filter(s => s.is_active);

          if (activeSchedules.length > 0) {
            const matchingSchedule = this.findMatchingSchedule(activeSchedules);

            if (matchingSchedule) {
              const playlist = playlists.find(p => p.id === matchingSchedule.playlist_id);
              if (playlist) {
                console.log('[ScheduleManager] Schedule playlist:', playlist.name);
                return playlist;
              }
            }
          }
        }
      } catch {
        // Schedule yoksa devam et
      }

      // İlk playlist'i kullan (yeni API'de cihaza atanmış tek playlist gelir)
      const activePlaylist = playlists.find(p => p.is_active) || playlists[0];
      console.log('[ScheduleManager] Playlist:', activePlaylist?.name || 'Yok');
      return activePlaylist || null;

    } catch (error) {
      console.error('[ScheduleManager] Playlist alınamadı:', error);

      // Fallback
      try {
        const playlists = await StorageService.getPlaylists();
        return playlists[0] || null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Aktif schedule'ları kontrol et ve uygun olanı bul
   */
  private findMatchingSchedule(schedules: Schedule[]): Schedule | null {
    const now = new Date();
    const currentTime = format(now, 'HH:mm:ss');
    const jsDay = now.getDay();
    const apiDay = jsDay === 0 ? 7 : jsDay;

    const matchingSchedules = schedules.filter(schedule => {
      // Gün kontrolü
      if (schedule.days_of_week && Array.isArray(schedule.days_of_week)) {
        if (!schedule.days_of_week.includes(apiDay)) {
          return false;
        }
      }

      // Saat aralığı kontrolü
      if (schedule.start_time && schedule.end_time) {
        return this.isTimeInRange(currentTime, schedule.start_time, schedule.end_time);
      }

      return true;
    });

    if (matchingSchedules.length === 0) return null;

    // Önceliğe göre sırala
    matchingSchedules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    return matchingSchedules[0];
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
