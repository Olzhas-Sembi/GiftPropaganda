import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchNews } from './api/news';
import NewsModal from './components/NewsModal';
import SearchBar from './components/SearchBar';
import TelegramWebApp from './telegram/TelegramWebApp';

// Типы данных
interface NewsItem {
  id: number;
  title: string;
  content: string;
  link: string;
  publish_date: string;
  category: string;
  image_url?: string;
  video_url?: string;
  reading_time?: number;
  views_count?: number;
  author?: string;
  subtitle?: string;
}

// Стилизованные компоненты
const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--tg-theme-bg-color, #0f0f0f);
  color: var(--tg-theme-text-color, #ffffff);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 0;
  margin: 0;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--tg-theme-bg-color, #0f0f0f);
  border-bottom: 1px solid var(--tg-theme-hint-color, #333);
  padding: 16px;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: var(--tg-theme-text-color, #ffffff);
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  margin-bottom: 16px;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--tg-theme-hint-color, #333);
    border-radius: 2px;
  }
`;

const CategoryTab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: ${props => props.$active 
    ? 'var(--tg-theme-button-color, #0088cc)' 
    : 'var(--tg-theme-secondary-bg-color, #1a1a1a)'};
  color: ${props => props.$active 
    ? 'var(--tg-theme-button-text-color, #ffffff)' 
    : 'var(--tg-theme-text-color, #ffffff)'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NewsContainer = styled.div`
  padding: 0 16px 20px 16px;
  max-width: 800px;
  margin: 0 auto;
`;

const NewsCard = styled.div<{ $isNew?: boolean }>`
  background: var(--tg-theme-secondary-bg-color, #1a1a1a);
  border: 1px solid var(--tg-theme-hint-color, #333);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  ${props => props.$isNew && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--tg-theme-button-color, #0088cc);
    }
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: var(--tg-theme-button-color, #0088cc);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NewsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
`;

const NewsImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--tg-theme-hint-color, #333);
  flex-shrink: 0;
`;

const NewsContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NewsTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--tg-theme-text-color, #ffffff);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsPreview = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--tg-theme-hint-color, #999);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsMetadata = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
`;

const NewsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--tg-theme-hint-color, #999);
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  background: ${props => getCategoryColor(props.$category)};
  color: #ffffff;
`;

const ReadingTime = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '📖';
  }
`;

const ViewsCount = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  
  &::before {
    content: '👁️';
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  &::after {
    content: '';
    width: 32px;
    height: 32px;
    border: 3px solid var(--tg-theme-hint-color, #333);
    border-top: 3px solid var(--tg-theme-button-color, #0088cc);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--tg-theme-destructive-text-color, #ff4444);
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--tg-theme-hint-color, #999);
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: var(--tg-theme-text-color, #ffffff);
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

// Функция для получения цвета категории
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'gifts': '#ff6b6b',
    'crypto': '#4ecdc4',
    'tech': '#45b7d1',
    'community': '#96ceb4',
    'gaming': '#feca57',
    'news': '#ff9ff3',
    'default': '#6c5ce7'
  };
  return colors[category] || colors.default;
}

// Функция для форматирования времени
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'только что';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
  return `${Math.floor(diffInSeconds / 86400)} дн назад`;
}

// Основной компонент
const App: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'gifts', name: 'Подарки' },
    { id: 'crypto', name: 'Крипто' },
    { id: 'tech', name: 'Технологии' },
    { id: 'community', name: 'Сообщество' },
    { id: 'gaming', name: 'Игры' }
  ];

  useEffect(() => {
    TelegramWebApp.init();
  }, []);

  const getNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchNews(selectedCategory === 'all' ? undefined : selectedCategory);
      setNews(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке новостей:', err);
      setError('Не удалось загрузить новости. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNews();
  }, [selectedCategory]);

  const handleNewsClick = (newsItem: NewsItem) => {
    TelegramWebApp.triggerHapticFeedback('impact');
    setSelectedNews(newsItem);
  };

  const handleCategoryChange = (categoryId: string) => {
    TelegramWebApp.triggerHapticFeedback('impact');
    setSelectedCategory(categoryId);
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isNewNews = (dateString: string): boolean => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  if (loading) {
    return (
      <AppContainer>
        <Header>
          <Title>Новости от Telegram</Title>
        </Header>
        <LoadingSpinner />
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer>
        <Header>
          <Title>Новости от Telegram</Title>
        </Header>
        <ErrorMessage>{error}</ErrorMessage>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header>
        <Title>Новости от Telegram</Title>

        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск новостей..."
        />

        <CategoryTabs>
          {categories.map(category => (
            <CategoryTab
              key={category.id}
              $active={selectedCategory === category.id}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </CategoryTab>
          ))}
        </CategoryTabs>
      </Header>

      <NewsContainer>
        {filteredNews.length === 0 ? (
          <EmptyState>
            <h3>Новостей не найдено</h3>
            <p>Попробуйте изменить категорию или поисковый запрос</p>
          </EmptyState>
        ) : (
          filteredNews.map(item => (
            <NewsCard
              key={item.id}
              $isNew={isNewNews(item.publish_date)}
              onClick={() => handleNewsClick(item)}
            >
              <NewsHeader>
                {item.image_url && (
                  <NewsImage
                    src={item.image_url}
                    alt={item.title}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <NewsContent>
                  <NewsTitle>{item.title}</NewsTitle>
                  <NewsPreview>{item.content}</NewsPreview>
                </NewsContent>
              </NewsHeader>

              <NewsMetadata>
                <NewsInfo>
                  <CategoryBadge $category={item.category}>
                    {categories.find(cat => cat.id === item.category)?.name || item.category}
                  </CategoryBadge>

                  <span>{formatTimeAgo(item.publish_date)}</span>

                  {item.reading_time && (
                    <ReadingTime>{item.reading_time} мин</ReadingTime>
                  )}

                  {item.views_count !== undefined && (
                    <ViewsCount>{item.views_count}</ViewsCount>
                  )}
                </NewsInfo>
              </NewsMetadata>
            </NewsCard>
          ))
        )}
      </NewsContainer>

      {selectedNews && (
        <NewsModal
          news={selectedNews}
          isOpen={!!selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}
    </AppContainer>
  );
};

export default App;
