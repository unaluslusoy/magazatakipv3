import api from './api';

export interface Content {
  id: number;
  type: 'video' | 'image' | 'text' | 'html' | 'web_page' | 'slider' | 'ticker' | 'announcement';
  title: string;
  file_path?: string;
  thumbnail_path?: string;
  duration?: number;
  file_size?: number;
  mime_type?: string;
  text_content?: string;
  html_content?: string;
  web_url?: string;
  metadata?: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContentDto {
  type: Content['type'];
  title: string;
  file?: File;
  text_content?: string;
  html_content?: string;
  web_url?: string;
  metadata?: any;
}

export interface UpdateContentDto {
  title?: string;
  text_content?: string;
  html_content?: string;
  web_url?: string;
  metadata?: any;
  is_active?: boolean;
}

class ContentService {
  async getAll(params?: { type?: string; is_active?: boolean; page?: number; limit?: number }) {
    const response = await api.get('/contents', { params });
    return response.data;
  }

  async getById(id: number) {
    const response = await api.get(`/contents/${id}`);
    return response.data;
  }

  async create(data: CreateContentDto) {
    // Özel tiplerle güzel entegrasyon için route seçimi
    let endpoint = '/contents';
    if (data.type === 'slider') {
      endpoint = '/contents/slider';
    } else if (data.type === 'ticker') {
      endpoint = '/contents/ticker';
    } else if (data.type === 'announcement') {
      endpoint = '/contents/announcement';
    }

    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('title', data.title);
    
    if (data.file) {
      formData.append('file', data.file);
    }
    if (data.text_content) {
      formData.append('text_content', data.text_content);
    }
    if (data.html_content) {
      formData.append('html_content', data.html_content);
    }
    if (data.web_url) {
      formData.append('web_url', data.web_url);
    }
    if (data.metadata) {
      formData.append('metadata', JSON.stringify(data.metadata));
    }

    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async update(id: number, data: UpdateContentDto) {
    const response = await api.put(`/contents/${id}`, data);
    return response.data;
  }

  async delete(id: number) {
    const response = await api.delete(`/contents/${id}`);
    return response.data;
  }

  async uploadProgress(onProgress: (progress: number) => void) {
    // Upload progress callback
    return (progressEvent: any) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    };
  }
}

export default new ContentService();
