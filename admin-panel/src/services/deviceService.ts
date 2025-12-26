import api from './api';

export interface Device {
  id: number;
  store_id: number;
  device_code: string;
  device_name: string;
  device_type: string;
  status: 'online' | 'offline' | 'error';
  last_seen_at?: string;
  current_playlist_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  store?: any;
}

class DeviceService {
  async getAll(params?: { store_id?: number; status?: string; page?: number; limit?: number }) {
    const response = await api.get('/devices', { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await api.get(`/devices/${id}`);
    return response.data;
  }

  async create(data: Partial<Device>) {
    const response = await api.post('/devices', data);
    return response.data;
  }

  async update(id: number, data: Partial<Device>) {
    const response = await api.put(`/devices/${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/devices/${id}`);
    return response.data;
  }

  async assignPlaylist(deviceId: number, playlistId: number) {
    const response = await api.post(`/devices/${deviceId}/assign-playlist`, {
      playlist_id: playlistId,
    });
    return response.data;
  }
}

export default new DeviceService();
