import api from './api';

export interface Schedule {
  id: number;
  name: string;
  device_id?: number;
  store_id?: number;
  playlist_id: number;
  schedule_type: 'daily' | 'weekly' | 'date_range' | 'specific_dates' | 'hourly';
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
  days_of_week?: number[];
  specific_dates?: string[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  device?: any;
  store?: any;
  playlist?: any;
}

class ScheduleService {
  async getAll(params?: { device_id?: number; store_id?: number; is_active?: boolean }) {
    const response = await api.get('/schedules', { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await api.get(`/schedules/${id}`);
    return response.data;
  }

  async create(data: Partial<Schedule>) {
    const response = await api.post('/schedules', data);
    return response.data;
  }

  async update(id: number, data: Partial<Schedule>) {
    const response = await api.put(`/schedules/${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  }
}

export default new ScheduleService();
