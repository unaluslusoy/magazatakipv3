/**
 * Schedule Service
 * Zamanlama yönetim servisi
 */

const Schedule = require('../models/Schedule');
const Playlist = require('../models/Playlist');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

class ScheduleService {
    /**
     * Tüm zamanlamaları getir
     */
    async getAllSchedules(filters = {}, pagination = {}) {
        try {
            const where = {};

            // Filters
            if (filters.is_active !== undefined) {
                where.is_active = filters.is_active;
            }

            if (filters.schedule_type) {
                where.schedule_type = filters.schedule_type;
            }

            if (filters.playlist_id) {
                where.playlist_id = parseInt(filters.playlist_id);
            }

            // Pagination
            const page = pagination.page || 1;
            const limit = pagination.limit || 20;
            const offset = (page - 1) * limit;

            const { count, rows } = await Schedule.findAndCountAll({
                where,
                include: [{
                    model: Playlist,
                    as: 'playlist',
                    attributes: ['id', 'name', 'duration_seconds', 'is_active']
                }],
                limit,
                offset,
                order: [
                    ['created_at', 'DESC']
                ],
                distinct: true
            });

            return {
                schedules: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Get all schedules service error:', error);
            throw error;
        }
    }

    /**
     * ID ile zamanlama getir
     */
    async getScheduleById(id) {
        try {
            const schedule = await Schedule.findByPk(id, {
                include: [{
                    model: Playlist,
                    as: 'playlist',
                    attributes: ['id', 'name', 'description', 'duration_seconds', 'is_active']
                }]
            });

            if (!schedule) {
                throw new Error('Zamanlama bulunamadı');
            }

            return schedule;
        } catch (error) {
            logger.error('Get schedule by ID service error:', error);
            throw error;
        }
    }

    /**
     * Yeni zamanlama oluştur
     */
    async createSchedule(data) {
        try {
            // Playlist kontrolü
            const playlist = await Playlist.findByPk(data.playlist_id);
            if (!playlist) {
                throw new Error('Playlist bulunamadı');
            }

            // Validation
            this.validateScheduleData(data);

            const schedule = await Schedule.create(data);

            logger.info(`Schedule created: ID ${schedule.id} for playlist ${data.playlist_id}`);
            return schedule;
        } catch (error) {
            logger.error('Create schedule service error:', error);
            throw error;
        }
    }

    /**
     * Zamanlama güncelle
     */
    async updateSchedule(id, data) {
        try {
            const schedule = await Schedule.findByPk(id);

            if (!schedule) {
                throw new Error('Zamanlama bulunamadı');
            }

            // Playlist değişiyorsa kontrol et
            if (data.playlist_id && data.playlist_id !== schedule.playlist_id) {
                const playlist = await Playlist.findByPk(data.playlist_id);
                if (!playlist) {
                    throw new Error('Playlist bulunamadı');
                }
            }

            // Validation
            this.validateScheduleData({...schedule.toJSON(), ...data });

            // Güncelle
            const allowedFields = [
                'playlist_id', 'schedule_type', 'start_date', 'end_date',
                'start_time', 'end_time', 'days_of_week', 'is_active'
            ];

            Object.keys(data).forEach(key => {
                if (allowedFields.includes(key)) {
                    schedule[key] = data[key];
                }
            });

            await schedule.save();

            logger.info(`Schedule updated: ID ${id}`);
            return schedule;
        } catch (error) {
            logger.error('Update schedule service error:', error);
            throw error;
        }
    }

    /**
     * Zamanlama sil
     */
    async deleteSchedule(id) {
        try {
            const schedule = await Schedule.findByPk(id);

            if (!schedule) {
                throw new Error('Zamanlama bulunamadı');
            }

            await schedule.destroy();

            logger.info(`Schedule deleted: ID ${id}`);
            return { message: 'Zamanlama başarıyla silindi' };
        } catch (error) {
            logger.error('Delete schedule service error:', error);
            throw error;
        }
    }

    /**
     * Şu anda aktif zamanlamaları getir
     */
    async getCurrentlyActiveSchedules() {
        try {
            const activeSchedules = await Schedule.findCurrentlyActive();
            return activeSchedules;
        } catch (error) {
            logger.error('Get currently active schedules service error:', error);
            throw error;
        }
    }

    /**
     * Playlist için zamanlamaları getir
     */
    async getSchedulesByPlaylist(playlistId) {
        try {
            const schedules = await Schedule.findByPlaylist(playlistId);
            return schedules;
        } catch (error) {
            logger.error('Get schedules by playlist service error:', error);
            throw error;
        }
    }

    /**
     * Zamanlama istatistikleri
     */
    async getScheduleStats() {
        try {
            const total = await Schedule.count();
            const active = await Schedule.count({ where: { is_active: true } });
            const currentlyActive = (await Schedule.findCurrentlyActive()).length;

            const byType = await Schedule.findAll({
                attributes: [
                    'schedule_type', [Schedule.sequelize.fn('COUNT', Schedule.sequelize.col('id')), 'count']
                ],
                group: ['schedule_type']
            });

            return {
                total,
                active,
                inactive: total - active,
                currently_active: currentlyActive,
                by_type: byType.reduce((acc, item) => {
                    acc[item.schedule_type] = parseInt(item.get('count'));
                    return acc;
                }, {})
            };
        } catch (error) {
            logger.error('Get schedule stats service error:', error);
            throw error;
        }
    }

    /**
     * Zamanlama verisi validasyonu
     */
    validateScheduleData(data) {
        const { schedule_type, start_date, end_date, start_time, end_time, days_of_week } = data;

        // Date range type
        if (schedule_type === 'date_range') {
            if (!start_date || !end_date) {
                throw new Error('Date range tipi için başlangıç ve bitiş tarihi gereklidir');
            }
            if (start_date > end_date) {
                throw new Error('Başlangıç tarihi bitiş tarihinden önce olmalıdır');
            }
        }

        // Daily type
        if (schedule_type === 'daily') {
            if (!start_time || !end_time) {
                throw new Error('Daily tipi için başlangıç ve bitiş saati gereklidir');
            }
        }

        // Weekly type
        if (schedule_type === 'weekly') {
            if (!days_of_week || !Array.isArray(days_of_week) || days_of_week.length === 0) {
                throw new Error('Weekly tipi için en az bir gün seçilmelidir');
            }
        }

        // Time validation
        if (start_time && end_time && start_time >= end_time) {
            throw new Error('Başlangıç saati bitiş saatinden önce olmalıdır');
        }

        return true;
    }

    /**
     * Timeline verileri getir (günlük/haftalık görünüm için)
     */
    async getTimelineData(date, filters = {}) {
        try {
            const { device_id, store_id } = filters;

            // Playlists ve schedules'ı çek
            let query = `
                SELECT 
                    p.id,
                    p.name,
                    p.priority,
                    s.schedule_type,
                    s.start_date,
                    s.end_date,
                    s.start_time,
                    s.end_time,
                    s.days_of_week,
                    s.is_active
                FROM playlists p
                INNER JOIN schedules s ON s.playlist_id = p.id
                WHERE p.is_active = true
                AND s.is_active = true
            `;

            const params = [];

            // Tarih kontrolü
            if (date) {
                query += ` AND (
                    s.schedule_type = 'always' 
                    OR (s.schedule_type = 'date_range' AND $${params.length + 1}::date BETWEEN s.start_date AND s.end_date)
                    OR s.schedule_type IN ('daily', 'weekly')
                )`;
                params.push(date);
            }

            query += ` ORDER BY p.priority DESC`;

            const schedules = await sequelize.query(query, {
                bind: params,
                type: sequelize.QueryTypes.SELECT
            });

            // Timeline saatlik dağılım oluştur
            const timeline = [];
            for (let hour = 0; hour < 24; hour++) {
                const activePlaylist = this.findActivePlaylistAtHour(schedules, date, hour);
                timeline.push({
                    hour,
                    active_playlist: activePlaylist
                });
            }

            // Renk kodları ekle
            const playlists = schedules.map((s, idx) => ({
                id: s.id,
                name: s.name,
                priority: s.priority,
                schedule_type: s.schedule_type,
                color: this.getColorForPriority(s.priority, idx)
            }));

            // Unique playlists
            const uniquePlaylists = Array.from(
                new Map(playlists.map(p => [p.id, p])).values()
            );

            return {
                date,
                timeline,
                playlists: uniquePlaylists
            };
        } catch (error) {
            logger.error('Get timeline data error:', error);
            throw error;
        }
    }

    /**
     * Belirli saatte aktif playlist bul
     */
    findActivePlaylistAtHour(schedules, date, hour) {
        const targetTime = `${hour.toString().padStart(2, '0')}:00`;
        const dayOfWeek = new Date(date).getDay();

        // Priority'ye göre sıralı olarak kontrol et
        for (const schedule of schedules) {
            if (schedule.schedule_type === 'always') {
                return {
                    id: schedule.id,
                    name: schedule.name,
                    priority: schedule.priority
                };
            }

            if (schedule.schedule_type === 'date_range') {
                if (schedule.start_time && schedule.end_time) {
                    if (targetTime >= schedule.start_time && targetTime < schedule.end_time) {
                        return {
                            id: schedule.id,
                            name: schedule.name,
                            priority: schedule.priority
                        };
                    }
                } else {
                    return {
                        id: schedule.id,
                        name: schedule.name,
                        priority: schedule.priority
                    };
                }
            }

            if (schedule.schedule_type === 'weekly') {
                const daysArray = schedule.days_of_week ? JSON.parse(schedule.days_of_week) : [];
                if (daysArray.includes(dayOfWeek)) {
                    if (targetTime >= schedule.start_time && targetTime < schedule.end_time) {
                        return {
                            id: schedule.id,
                            name: schedule.name,
                            priority: schedule.priority
                        };
                    }
                }
            }

            if (schedule.schedule_type === 'daily') {
                if (targetTime >= schedule.start_time && targetTime < schedule.end_time) {
                    return {
                        id: schedule.id,
                        name: schedule.name,
                        priority: schedule.priority
                    };
                }
            }
        }

        return null;
    }

    /**
     * Priority'ye göre renk al
     */
    getColorForPriority(priority, index) {
        const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

        if (priority >= 80) return '#EF4444'; // Yüksek öncelik - kırmızı
        if (priority >= 60) return '#F59E0B'; // Orta-yüksek - turuncu
        if (priority >= 40) return '#3B82F6'; // Orta - mavi
        if (priority >= 20) return '#10B981'; // Düşük-orta - yeşil

        return colors[index % colors.length];
    }
}

module.exports = new ScheduleService();