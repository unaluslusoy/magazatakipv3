import api from './api';

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  total_duration?: number;
  content_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PlaylistContent {
  id: number;
  playlist_id: number;
  content_id: number;
  order_index: number;
  duration_override?: number;
  created_at: string;
  content?: any;
}

export interface CreatePlaylistDto {
  name: string;
  description?: string;
  is_active?: boolean;
}

class PlaylistService {
  async getAll(params?: { is_active?: boolean; page?: number; limit?: number }) {
    const response = await api.get('/playlists', { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  }

  async create(data: CreatePlaylistDto) {
    const response = await api.post('/playlists', data);
    return response.data;
  }

  async update(id: number, data: Partial<CreatePlaylistDto>) {
    const response = await api.put(`/playlists/${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  }

  async getContents(id: number) {
    const response = await api.get(`/playlists/${id}/contents`);
    return response.data;
  }

  async addContent(playlistId: number, contentId: number, orderIndex?: number) {
    const response = await api.post(`/playlists/${playlistId}/contents`, {
      content_id: contentId,
      order_index: orderIndex,
    });
    return response.data;
  }

  async removeContent(playlistId: number, contentId: number) {
    const response = await api.delete(`/playlists/${playlistId}/contents/${contentId}`);
    return response.data;
  }

  async reorderContents(playlistId: number, contentIds: number[]) {
    const response = await api.put(`/playlists/${playlistId}/contents/reorder`, {
      content_ids: contentIds,
    });
    return response.data;
  }

  async duplicate(id: number, newName: string) {
    const response = await api.post(`/playlists/${id}/duplicate`, { name: newName });
    return response.data;
  }
}

export default new PlaylistService();
