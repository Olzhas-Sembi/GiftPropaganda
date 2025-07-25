import axios from 'axios';

const API_URL = 'https://giftpropaganda.onrender.com/api/news/';  // Обновлен на реальный домен

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  link: string;
  publish_date: string;
  category: string;
}

export interface NewsResponse {
  status: string;
  data: NewsItem[];
  message: string;
}

export const fetchNews = async (): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(API_URL, {
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    console.log('API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Ошибка при загрузке новостей:', error);
    return {
      status: 'error',
      data: [],
      message: 'Ошибка загрузки новостей (frontend)'
    };
  }
};