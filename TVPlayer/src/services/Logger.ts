import type { LogEntry } from '@types/index';
import StorageService from './StorageService';
import ApiService from './ApiService';
import { APP_CONFIG } from '@config/constants';

/**
 * Logger Service
 * Centralized logging with offline support
 */
class Logger {
  private logs: LogEntry[] = [];
  private maxLocalLogs = 1000;

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  /**
   * Log warning
   */
  warning(message: string, data?: any): void {
    this.log('warning', message, data);
  }

  /**
   * Log error
   */
  error(message: string, data?: any): void {
    this.log('error', message, data);
    console.error('[ERROR]', message, data);
  }

  /**
   * Internal log method
   */
  private log(level: 'info' | 'warning' | 'error', message: string, data?: any): void {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    // Console output
    if (APP_CONFIG.ENABLE_DEBUG) {
      console.log(`[${level.toUpperCase()}]`, message, data || '');
    }

    // Store locally
    this.logs.push(entry);
    if (this.logs.length > this.maxLocalLogs) {
      this.logs.shift();
    }

    // Send to server (async, non-blocking)
    this.sendToServer(entry);
  }

  /**
   * Send log to server
   */
  private async sendToServer(entry: LogEntry): Promise<void> {
    try {
      await ApiService.sendLog({
        level: entry.level,
        message: entry.message,
        data: entry.data,
        timestamp: entry.timestamp,
      });
    } catch (error) {
      // Failed to send - add to offline queue
      await StorageService.addToOfflineQueue({
        type: 'log',
        data: entry,
      });
    }
  }

  /**
   * Get local logs
   */
  getLogs(level?: 'info' | 'warning' | 'error'): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  /**
   * Clear local logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

export default new Logger();
