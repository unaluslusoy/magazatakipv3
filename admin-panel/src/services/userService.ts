import api from './api';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'viewer';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'admin' | 'manager' | 'viewer';
  is_active?: boolean;
  password?: string;
}

const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserDto) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id: number, data: UpdateUserDto) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id: number) => {
    const response = await api.put(`/users/${id}/toggle`);
    return response.data;
  },
};

export default userService;
