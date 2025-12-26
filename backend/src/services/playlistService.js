/**
 * Playlist Service
 * Playlist yönetim servisi
 */

const Playlist = require('../models/Playlist');
const PlaylistContent = require('../models/PlaylistContent');
const Content = require('../models/Content');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class PlaylistService {
    /**
     * Tüm playlist'leri getir
     */
    async getAllPlaylists(filters = {}, pagination = {}) {
        try {
            const where = {};

            // Filters
            if (filters.is_active !== undefined) {
                where.is_active = filters.is_active;
            }

            if (filters.is_default !== undefined) {
                where.is_default = filters.is_default;
            }

            if (filters.min_priority) {
                where.priority = {
                    [Op.gte]: parseInt(filters.min_priority) };
            }

            if (filters.search) {
                where[Op.or] = [{
                        name: {
                            [Op.iLike]: `%${filters.search}%`
                        }
                    },
                    {
                        description: {
                            [Op.iLike]: `%${filters.search}%`
                        }
                    }
                ];
            }

            // Pagination
            const page = pagination.page || 1;
            const limit = pagination.limit || 20;
            const offset = (page - 1) * limit;

            const { count, rows } = await Playlist.findAndCountAll({
                where,
                limit,
                offset,
                order: [
                    ['priority', 'DESC'],
                    ['name', 'ASC']
                ],
                distinct: true
            });

            return {
                playlists: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            logger.error('Get all playlists service error:', error);
            throw error;
        }
    }

    /**
     * ID ile playlist getir (içerikleriyle)
     */
    async getPlaylistById(id, includeContents = false) {
        try {
            const playlist = await Playlist.findByPk(id);

            if (!playlist) {
                throw new Error('Playlist bulunamadı');
            }

            if (includeContents) {
                const playlistContents = await PlaylistContent.findAll({
                    where: { playlist_id: id },
                    include: [{
                        model: Content,
                        as: 'content',
                        attributes: ['id', 'name', 'type', 'file_url', 'thumbnail_url', 'duration_seconds']
                    }],
                    order: [
                        ['position', 'ASC']
                    ]
                });

                return {
                    ...playlist.toJSON(),
                    contents: playlistContents
                };
            }

            return playlist;
        } catch (error) {
            logger.error('Get playlist by ID service error:', error);
            throw error;
        }
    }

    /**
     * Yeni playlist oluştur
     */
    async createPlaylist(data, userId) {
        try {
            const playlist = await Playlist.create({
                ...data,
                created_by: userId
            });

            logger.info(`Playlist created: ${playlist.name} (ID: ${playlist.id})`);
            return playlist;
        } catch (error) {
            logger.error('Create playlist service error:', error);
            throw error;
        }
    }

    /**
     * Playlist güncelle
     */
    async updatePlaylist(id, data) {
        try {
            const playlist = await Playlist.findByPk(id);

            if (!playlist) {
                throw new Error('Playlist bulunamadı');
            }

            // Güncelle
            const allowedFields = [
                'name', 'description', 'priority',
                'is_default', 'is_active'
            ];

            Object.keys(data).forEach(key => {
                if (allowedFields.includes(key)) {
                    playlist[key] = data[key];
                }
            });

            await playlist.save();

            logger.info(`Playlist updated: ${playlist.name} (ID: ${id})`);
            return playlist;
        } catch (error) {
            logger.error('Update playlist service error:', error);
            throw error;
        }
    }

    /**
     * Playlist sil
     */
    async deletePlaylist(id) {
        try {
            const playlist = await Playlist.findByPk(id);

            if (!playlist) {
                throw new Error('Playlist bulunamadı');
            }

            // Default playlist silinmez
            if (playlist.is_default) {
                throw new Error('Varsayılan playlist silinemez');
            }

            await playlist.destroy();

            logger.info(`Playlist deleted: ID ${id}`);
            return { message: 'Playlist başarıyla silindi' };
        } catch (error) {
            logger.error('Delete playlist service error:', error);
            throw error;
        }
    }

    /**
     * Playlist'e içerik ekle
     */
    async addContentToPlaylist(playlistId, contentId, position = null) {
        try {
            const playlist = await Playlist.findByPk(playlistId);
            if (!playlist) {
                throw new Error('Playlist bulunamadı');
            }

            const content = await Content.findByPk(contentId);
            if (!content) {
                throw new Error('İçerik bulunamadı');
            }

            // Position belirlenmemişse, sona ekle
            if (position === null) {
                const maxPosition = await PlaylistContent.max('position', {
                    where: { playlist_id: playlistId }
                });
                position = (maxPosition || -1) + 1;
            }

            const playlistContent = await PlaylistContent.create({
                playlist_id: playlistId,
                content_id: contentId,
                position
            });

            // Playlist toplam süresini güncelle
            await this.updatePlaylistDuration(playlistId);

            logger.info(`Content ${contentId} added to playlist ${playlistId} at position ${position}`);
            return playlistContent;
        } catch (error) {
            logger.error('Add content to playlist service error:', error);
            throw error;
        }
    }

    /**
     * Playlist'ten içerik kaldır
     */
    async removeContentFromPlaylist(playlistId, contentId) {
        try {
            const deleted = await PlaylistContent.destroy({
                where: {
                    playlist_id: playlistId,
                    content_id: contentId
                }
            });

            if (deleted === 0) {
                throw new Error('İçerik playlist\'te bulunamadı');
            }

            // Position'ları yeniden düzenle
            await this.reorderPlaylistPositions(playlistId);

            // Playlist toplam süresini güncelle
            await this.updatePlaylistDuration(playlistId);

            logger.info(`Content ${contentId} removed from playlist ${playlistId}`);
            return { message: 'İçerik playlist\'ten kaldırıldı' };
        } catch (error) {
            logger.error('Remove content from playlist service error:', error);
            throw error;
        }
    }

    /**
     * Playlist içeriklerinin sırasını değiştir
     */
    async reorderPlaylistContents(playlistId, contentIds) {
        try {
            const playlist = await Playlist.findByPk(playlistId);
            if (!playlist) {
                throw new Error('Playlist bulunamadı');
            }

            await PlaylistContent.reorderPositions(playlistId, contentIds);

            logger.info(`Playlist ${playlistId} contents reordered`);
            return { message: 'İçerik sıralaması güncellendi' };
        } catch (error) {
            logger.error('Reorder playlist contents service error:', error);
            throw error;
        }
    }

    /**
     * Playlist toplam süresini hesapla ve güncelle
     */
    async updatePlaylistDuration(playlistId) {
        try {
            const playlistContents = await PlaylistContent.findAll({
                where: { playlist_id: playlistId },
                include: [{
                    model: Content,
                    as: 'content',
                    attributes: ['duration_seconds']
                }]
            });

            const totalDuration = playlistContents.reduce((sum, pc) => {
                const contentDuration = pc.content && pc.content.duration_seconds ? pc.content.duration_seconds : 0;
                const duration = pc.duration_override || contentDuration;
                return sum + duration;
            }, 0);

            await Playlist.update({ duration_seconds: totalDuration }, { where: { id: playlistId } });

            return totalDuration;
        } catch (error) {
            logger.error('Update playlist duration service error:', error);
            throw error;
        }
    }

    /**
     * Playlist position'larını yeniden düzenle
     */
    async reorderPlaylistPositions(playlistId) {
        try {
            const playlistContents = await PlaylistContent.findAll({
                where: { playlist_id: playlistId },
                order: [
                    ['position', 'ASC']
                ]
            });

            for (let i = 0; i < playlistContents.length; i++) {
                playlistContents[i].position = i;
                await playlistContents[i].save();
            }
        } catch (error) {
            logger.error('Reorder playlist positions service error:', error);
            throw error;
        }
    }

    /**
     * Playlist istatistikleri
     */
    async getPlaylistStats() {
        try {
            const total = await Playlist.count();
            const active = await Playlist.count({ where: { is_active: true } });
            const defaults = await Playlist.count({ where: { is_default: true } });

            return {
                total,
                active,
                inactive: total - active,
                defaults
            };
        } catch (error) {
            logger.error('Get playlist stats service error:', error);
            throw error;
        }
    }
}

module.exports = new PlaylistService();