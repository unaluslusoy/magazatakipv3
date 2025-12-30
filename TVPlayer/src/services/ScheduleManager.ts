import StorageService from './StorageService';
import type { Schedule, Playlist } from '@types/index';
import { isWithinInterval, parse, format } from 'date-fns';

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
      if (schedules.length === 0) {
        console.log('No schedules found');
        return null;
      }

      // Filter active schedules
      const activeSchedules = schedules.filter(s => s.is_active);
      if (activeSchedules.length === 0) {
        console.log('No active schedules');
        return null;
      }

      // Get current time info
      const now = new Date();
      const currentTime = format(now, 'HH:mm:ss');
      const currentDay = format(now, 'EEEE').toLowerCase();

      // Find matching schedules
      const matchingSchedules = activeSchedules.filter(schedule => {
        // Check day of week
        if (!schedule.days_of_week) {
          return true; // No day restriction
        }

        // Convert "1,2,3" string to array of numbers/strings
        const allowedDays = schedule.days_of_week.split(',').map(d => d.trim());

        // Map current day name to number (Sunday=0, Monday=1, etc.) or check logic
        // Assuming API returns 1 for Monday, 7 for Sunday or 0 for Sunday.
        // Let's assume standard JS getDay() (0=Sunday, 1=Monday)
        const currentDayIndex = now.getDay().toString();

        // If API uses 1=Monday, we need to adjust.
        // Let's try to match loosely for now or check documentation.
        // Documentation doesn't specify.

        const dayMatches = allowedDays.includes(currentDayIndex);

        if (!dayMatches) {
          return false;
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
        console.log('No matching schedules for current time');
        return null;
      }

      // Sort by priority (higher first) - use playlist priority
      matchingSchedules.sort((a, b) => (b.playlist?.priority || 0) - (a.playlist?.priority || 0));

      // Get highest priority schedule
      const selectedSchedule = matchingSchedules[0];
      
      // Get playlist
      const playlist = await StorageService.getPlaylistById(
        selectedSchedule.playlist_id
      );

      if (!playlist) {
        console.log('Playlist not found for schedule:', selectedSchedule.id);
        return null;
      }

      console.log('Selected playlist:', playlist.name, 'Priority:', selectedSchedule.priority);
      return playlist;
    } catch (error) {
      console.error('Failed to get current playlist:', error);
      return null;
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
