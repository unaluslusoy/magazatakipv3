import api from './api';

export interface Store {
  id: number;
  code: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class StoreService {
  async getAll(params?: { is_active?: boolean; page?: number; limit?: number }) {
    const response = await api.get('/stores', { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await api.get(`/stores/${id}`);
    return response.data;
  }

  async create(data: Partial<Store>) {
    const response = await api.post('/stores', data);
    return response.data;
  }

  async update(id: number, data: Partial<Store>) {
    const response = await api.put(`/stores/${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  }
}

export default new StoreService();
