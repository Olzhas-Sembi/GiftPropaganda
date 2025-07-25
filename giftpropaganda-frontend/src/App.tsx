import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { fetchNews, NewsResponse, NewsItem } from './api/news';
import TelegramWebApp from './telegram/TelegramWebApp';
import SearchBar from './components/SearchBar';
import NewsModal from './components/NewsModal';

// Глобальные стили для Telegram Mini App
const GlobalStyle = createGlobalStyle<{ theme: any }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background-color: var(--tg-theme-bg-color, #ffffff);
    color: var(--tg-theme-text-color, #000000);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: var(--tg-viewport-height, 100vh);
    margin: 0;
    padding: 0;
  }
`;

const AppContainer = styled.div<{ theme: any }>`
  background-color: var(--tg-theme-bg-color, #ffffff);
  min-height: var(--tg-viewport-height, 100vh);
  color: var(--tg-theme-text-color, #000000);
  padding: 0;
  margin: 0;
`;

const Header = styled.header<{ theme: any }>`
  background-color: var(--tg-theme-secondary-bg-color, #f8f9fa);
  color: var(--tg-theme-text-color, #000000);
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid var(--tg-theme-hint-color, #e0e0e0);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--tg-theme-text-color, #000000);
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  background-color: var(--tg-theme-bg-color, #ffffff);
  border-bottom: 1px solid var(--tg-theme-hint-color, #e0e0e0);
`;

const CategoryButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid var(--tg-theme-button-color, #007AFF);
  background-color: ${props => props.$active ? 'var(--tg-theme-button-color, #007AFF)' : 'transparent'};
  color: ${props => props.$active ? 'var(--tg-theme-button-text-color, #ffffff)' : 'var(--tg-theme-button-color, #007AFF)'};
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
`;

const NewsList = styled.div`
  padding: 8px;
`;

const NewsItemCard = styled.div<{ $isNew?: boolean }>`
  background-color: var(--tg-theme-secondary-bg-color, #ffffff);
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--tg-theme-hint-color, #e0e0e0);
  transition: transform 0.1s ease;
  position: relative;
  cursor: pointer;

  ${props => props.$isNew && `
    border-left: 4px solid var(--tg-theme-button-color, #007AFF);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
  `}

  &:active {
    transform: scale(0.98);
  }
`;

const NewsContent = styled.div`
  padding: 16px;
`;

const NewsTitle = styled.h2`
  color: var(--tg-theme-link-color, #007AFF);
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsText = styled.p`
  color: var(--tg-theme-text-color, #000000);
  margin: 0 0 12px 0;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const NewsSource = styled.span`
  color: var(--tg-theme-hint-color, #999999);
  font-size: 12px;
`;

const NewsDate = styled.span`
  color: var(--tg-theme-hint-color, #999999);
  font-size: 12px;
`;

const CategoryTag = styled.span<{ $category: string }>`
  background-color: ${props => getCategoryColor(props.$category)};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--tg-theme-hint-color, #999999);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--tg-theme-destructive-text-color, #ff3b30);
  text-align: center;
  padding: 20px;
`;

const RetryButton = styled.button`
  background-color: var(--tg-theme-button-color, #007AFF);
  color: var(--tg-theme-button-text-color, #ffffff);
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  margin-top: 16px;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
  }
`;

// Компоненты для медиа
const MediaContainer = styled.div`
  margin: 12px 0;
  border-radius: 8px;
  overflow: hidden;
`;

const NewsImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  border-radius: 8px;
`;

const NewsVideo = styled.video`
  width: 100%;
  height: auto;
  max-height: 300px;
  border-radius: 8px;
`;

// Функция для получения цвета категории
const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    gifts: '#FF6B6B',
    crypto: '#4ECDC4',
    nft: '#45B7D1',
    tech: '#96CEB4',
    community: '#FECA57',
    general: '#DDA0DD'
  };
  return colors[category] || colors.general;
};

// Функция для форматирования даты
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'сейчас';
  if (diffMins < 60) return `${diffMins}м`;
  if (diffHours < 24) return `${diffHours}ч`;
  if (diffDays < 7) return `${diffDays}д`;

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });
};

const categories = [
  { key: 'all', label: 'Все' },
  { key: 'gifts', label: 'Подарки' },
  { key: 'crypto', label: 'Крипто' },
  { key: 'nft', label: 'NFT' },
  { key: 'tech', label: 'Технологии' },
  { key: 'community', label: 'Сообщество' }
];

const App: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [theme, setTheme] = useState<any>({});

  // Инициализация Telegram WebApp
  useEffect(() => {
    TelegramWebApp.init();
    setTheme(TelegramWebApp.getThemeParams());

    // Слушаем изменения темы
    const handleThemeChanged = () => {
      setTheme(TelegramWebApp.getThemeParams());
    };

    window.addEventListener('themeChanged', handleThemeChanged);
    return () => window.removeEventListener('themeChanged', handleThemeChanged);
  }, []);

  // Загрузка новостей
  const getNews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: NewsResponse = await fetchNews(selectedCategory === 'all' ? undefined : selectedCategory);

      if (response.status === 'success') {
        setNews(response.data);
      } else {
        setError(response.message || 'Ошибка загрузки новостей');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    getNews();
  }, [getNews]);

  // Фильтрация новостей по поиску
  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewsClick = (newsItem: NewsItem) => {
    setSelectedNews(newsItem);
    TelegramWebApp.triggerHapticFeedback('light');
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    TelegramWebApp.triggerHapticFeedback('selection_change');
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle theme={theme} />
      <AppContainer theme={theme}>
        <Header theme={theme}>
          <Title>🎁 Gift Propaganda News</Title>
        </Header>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Поиск новостей..."
        />

        <CategoryFilter>
          {categories.map(category => (
            <CategoryButton
              key={category.key}
              $active={selectedCategory === category.key}
              onClick={() => handleCategoryChange(category.key)}
            >
              {category.label}
            </CategoryButton>
          ))}
        </CategoryFilter>

        {loading && (
          <LoadingContainer>
            Загрузка новостей...
          </LoadingContainer>
        )}

        {error && (
          <ErrorContainer>
            <div>{error}</div>
            <RetryButton onClick={getNews}>
              Повторить
            </RetryButton>
          </ErrorContainer>
        )}

        {!loading && !error && (
          <NewsList>
            {filteredNews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tg-theme-hint-color, #999999)' }}>
                Новостей не найдено
              </div>
            ) : (
              filteredNews.map((item) => (
                <NewsItemCard
                  key={item.id}
                  onClick={() => handleNewsClick(item)}
                  $isNew={new Date(item.publish_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)}
                >
                  <NewsContent>
                    <NewsTitle>{item.title}</NewsTitle>

                    {/* Добавляем поддержку медиа */}
                    {item.media && (
                      <MediaContainer>
                        {item.media.type === 'photo' && (
                          <NewsImage
                            src={item.media.url}
                            alt={item.title}
                            loading="lazy"
                          />
                        )}
                        {item.media.type === 'video' && (
                          <NewsVideo
                            src={item.media.url}
                            controls
                            preload="metadata"
                          />
                        )}
                      </MediaContainer>
                    )}

                    <NewsText>{item.content}</NewsText>
                    <NewsFooter>
                      <div>
                        <CategoryTag $category={item.category}>
                          {categories.find(c => c.key === item.category)?.label || item.category}
                        </CategoryTag>
                        <NewsSource style={{ marginLeft: '8px' }}>
                          {item.source?.name || 'Telegram'}
                        </NewsSource>
                      </div>
                      <NewsDate>
                        {formatDate(item.publish_date)}
                      </NewsDate>
                    </NewsFooter>
                  </NewsContent>
                </NewsItemCard>
              ))
            )}
          </NewsList>
        )}

        {selectedNews && (
          <NewsModal
            news={selectedNews}
            onClose={() => setSelectedNews(null)}
          />
        )}
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
