import api from './api';

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  playlist_id: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  playlist?: any;
}

class CampaignService {
  async getAll(params?: { status?: string; page?: number; limit?: number }) {
    const response = await api.get('/campaigns', { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  }

  async create(data: Partial<Campaign>) {
    const response = await api.post('/campaigns', data);
    return response.data;
  }

  async update(id: number, data: Partial<Campaign>) {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  }
}

export default new CampaignService();
