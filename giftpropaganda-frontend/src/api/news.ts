import axios from 'axios';

// Определяем API URL в зависимости от окружения
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://giftpropaganda.onrender.com/api/news/'
  : 'http://localhost:8000/api/news/';

export interface MediaItem {
  id: number;  // или string, в зависимости от вашей системы
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  content_html: string; // Добавлено HTML-содержимое
  link: string;
  publish_date: string;
  category: string;
  reading_time?: number;
  views_count?: number;
  author?: string;
  subtitle?: string;
  media?: MediaItem[]; // Медиа как массив
  source_name?: string; // Название источника
  source_url?: string;  // URL источника
}

export interface NewsResponse {
  status: string;
  data: NewsItem[];
  message: string;
  total?: number;
  page?: number;
  limit?: number;
}

export const fetchNews = async (category?: string): Promise<NewsResponse> => {
  try {
    const url = category ? `${API_URL}?category=${category}` : API_URL;

    const response = await axios.get<NewsResponse>(url, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    return response.data;
  } catch (error: any) {
    console.error('Ошибка при загрузке новостей:', error);

    if (error.response) {
      throw new Error(`Ошибка сервера: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Нет ответа от сервера. Проверьте подключение к интернету.');
    } else {
      throw new Error(`Ошибка запроса: ${error.message}`);
    }
  }
};

export const fetchNewsById = async (id: number): Promise<NewsItem> => {
  try {
    const response = await axios.get<NewsItem>(`${API_URL}${id}`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    return response.data;
  } catch (error: any) {
    console.error('Ошибка при загрузке новости:', error);
    throw new Error('Не удалось загрузить новость');
  }
};

export const fetchCategories = async (): Promise<string[]> => {
  try {
    const response = await axios.get<{status: string, data: string[]}>(`${API_URL}categories/`, {
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    return response.data.data;
  } catch (error: any) {
    console.error('Ошибка при загрузке категорий:', error);
    return ['gifts', 'crypto', 'tech', 'community', 'gaming']; // fallback
  }
};