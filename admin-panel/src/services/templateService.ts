import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Template {
  id: number;
  name: string;
  template_type: 'slider' | 'banner' | 'countdown' | 'weather' | 'news' | 'custom';
  category?: 'promotional' | 'informational' | 'interactive' | 'dynamic';
  preview_image?: string;
  config: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    [key: string]: any;
  };
  layers: Array<{
    id: string;
    type: 'image' | 'text' | 'rectangle' | 'circle' | 'countdown' | 'weather' | 'video';
    [key: string]: any;
  }>;
  animations: Array<{
    layerId: string;
    type: string;
    delay?: number;
    duration?: number;
    easing?: string;
    repeat?: boolean;
    [key: string]: any;
  }>;
  duration: number;
  is_active: boolean;
  created_by?: number;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTemplateDto {
  name: string;
  template_type: Template['template_type'];
  category?: Template['category'];
  preview_image?: string;
  config?: Template['config'];
  layers?: Template['layers'];
  animations?: Template['animations'];
  duration?: number;
  is_active?: boolean;
}

const templateService = {
  async getAll() {
    const response = await axios.get(`${API_URL}/templates`);
    return response.data;
  },

  async getById(id: number) {
    const response = await axios.get(`${API_URL}/templates/${id}`);
    return response.data;
  },

  async create(data: CreateTemplateDto) {
    const response = await axios.post(`${API_URL}/templates`, data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateTemplateDto>) {
    const response = await axios.put(`${API_URL}/templates/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await axios.delete(`${API_URL}/templates/${id}`);
    return response.data;
  },

  async duplicate(id: number) {
    const response = await axios.post(`${API_URL}/templates/${id}/duplicate`);
    return response.data;
  },
};

export default templateService;
