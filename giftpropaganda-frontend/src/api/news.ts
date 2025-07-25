import axios from 'axios';

// Определяем API URL в зависимости от окружения
const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://giftpropaganda.onrender.com/api/news/'
  : 'http://localhost:8000/api/news/';

export interface MediaItem {
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  link: string;
  publish_date: string;
  category: string;
  media?: MediaItem; // Добавляем поддержку медиа
  source?: {
    name: string;
    type: string;
  };
}

export interface NewsResponse {
  status: string;
  data: NewsItem[];
  message: string;
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
      timeout: 10000 // 10 секунд таймаут
    });

    console.log('API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при загрузке новостей:', error);

    // Возвращаем более детальную информацию об ошибке
    let errorMessage = 'Ошибка загрузки новостей';
    if (error.response) {
      errorMessage = `Ошибка сервера: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = 'Нет ответа от сервера';
    }

    return {
      status: 'error',
      data: [],
      message: errorMessage
    };
  }
};