import axios from 'axios';

const API_URL = 'https://c614d13bcb7d.ngrok-free.app/api/news';

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
  const response = await axios.get<NewsResponse>(API_URL);
  return response.data;
};