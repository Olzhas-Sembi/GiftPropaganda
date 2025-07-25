import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { fetchNews, NewsResponse, NewsItem } from './api/news';
import TelegramWebApp from './telegram/TelegramWebApp';

// Глобальные стили для Telegram Mini App
const GlobalStyle = createGlobalStyle<{ theme: any }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    background-color: ${props => props.theme.bg_color || '#ffffff'};
    color: ${props => props.theme.text_color || '#000000'};
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }
`;

const AppContainer = styled.div<{ theme: any }>`
  background-color: ${props => props.theme.bg_color || '#ffffff'};
  min-height: 100vh;
  color: ${props => props.theme.text_color || '#000000'};
  padding: 0;
  margin: 0;
`;

const Header = styled.header<{ theme: any }>`
  background-color: ${props => props.theme.secondary_bg_color || props.theme.bg_color || '#f8f9fa'};
  color: ${props => props.theme.text_color || '#000000'};
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid ${props => props.theme.hint_color || '#e0e0e0'};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Title = styled.h1<{ theme: any }>`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${props => props.theme.text_color || '#000000'};
`;

const NewsList = styled.div`
  padding: 8px;
`;

const NewsItemCard = styled.div<{ theme: any }>`
  background-color: ${props => props.theme.secondary_bg_color || '#ffffff'};
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${props => props.theme.hint_color || '#e0e0e0'};
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const NewsContent = styled.div`
  padding: 16px;
`;

const NewsTitle = styled.h2<{ theme: any }>`
  color: ${props => props.theme.link_color || '#007AFF'};
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
`;

const NewsText = styled.p<{ theme: any }>`
  color: ${props => props.theme.text_color || '#000000'};
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.4;
`;

const NewsInfo = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid ${props => props.theme.hint_color || '#e0e0e0'};
`;

const CategoryBadge = styled.span<{ theme: any }>`
  background-color: ${props => props.theme.button_color || '#007AFF'};
  color: ${props => props.theme.button_text_color || '#ffffff'};
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
`;

const DateText = styled.span<{ theme: any }>`
  color: ${props => props.theme.hint_color || '#8E8E93'};
  font-size: 12px;
`;

const SourceLink = styled.button<{ theme: any }>`
  background: none;
  border: none;
  color: ${props => props.theme.hint_color || '#8E8E93'};
  font-size: 11px;
  text-decoration: none;
  padding: 4px 0;
  cursor: pointer;
  margin-top: 8px;

  &:active {
    opacity: 0.6;
  }
`;

const Message = styled.div<{ theme: any }>`
  text-align: center;
  padding: 32px 16px;
  color: ${props => props.theme.hint_color || '#8E8E93'};
  font-size: 14px;
`;

const LoadingSpinner = styled.div<{ theme: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  color: ${props => props.theme.hint_color || '#8E8E93'};
`;

const CategoryFilter = styled.div`
  padding: 8px 16px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const FilterButton = styled.button<{ active: boolean; theme: any }>`
  background-color: ${props => props.active 
    ? props.theme.button_color || '#007AFF' 
    : props.theme.secondary_bg_color || '#f0f0f0'};
  color: ${props => props.active 
    ? props.theme.button_text_color || '#ffffff' 
    : props.theme.text_color || '#000000'};
  border: none;
  padding: 8px 16px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
`;

const App: React.FC = () => {
  const [news, setNews] = useState<NewsResponse>({ status: 'success', data: [], message: '' });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [telegramTheme, setTelegramTheme] = useState<any>({});

  const categories = [
    { key: 'all', name: 'Все' },
    { key: 'gifts', name: 'Подарки' },
    { key: 'crypto', name: 'Крипто' },
    { key: 'nft', name: 'NFT' },
    { key: 'tech', name: 'Технологии' },
    { key: 'community', name: 'Сообщество' }
  ];

  useEffect(() => {
    // Инициализация Telegram Web App
    if (TelegramWebApp.isAvailable()) {
      const theme = TelegramWebApp.getTheme();
      setTelegramTheme(theme.themeParams);

      // Показываем главную кнопку для закрытия
      TelegramWebApp.showMainButton('Закрыть', () => {
        TelegramWebApp.close();
      });
    }

    // Загрузка новостей
    getNews();
    const interval = setInterval(getNews, 300000); // Обновление каждые 5 минут
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const getNews = async () => {
    setLoading(true);
    try {
      const data = await fetchNews();
      setNews(data);

      // Фильтруем по категории на клиенте
      if (selectedCategory !== 'all' && data.data) {
        const filtered = data.data.filter(item => item.category === selectedCategory);
        setNews({ ...data, data: filtered });
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews({ status: 'error', data: [], message: 'Ошибка загрузки новостей' });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (TelegramWebApp.isAvailable()) {
      TelegramWebApp.hapticFeedback('light');
    }
    setSelectedCategory(category);
  };

  const handleSourceClick = (url: string) => {
    if (TelegramWebApp.isAvailable()) {
      TelegramWebApp.hapticFeedback('medium');
      TelegramWebApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ч назад`;
    } else if (diffDays < 7) {
      return `${diffDays} дн назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.key === category);
    return cat ? cat.name : category;
  };

  return (
    <ThemeProvider theme={telegramTheme}>
      <GlobalStyle theme={telegramTheme} />
      <AppContainer theme={telegramTheme}>
        <Header theme={telegramTheme}>
          <Title theme={telegramTheme}>Gift Propaganda News</Title>
        </Header>

        <CategoryFilter>
          {categories.map(category => (
            <FilterButton
              key={category.key}
              active={selectedCategory === category.key}
              theme={telegramTheme}
              onClick={() => handleCategoryChange(category.key)}
            >
              {category.name}
            </FilterButton>
          ))}
        </CategoryFilter>

        {loading ? (
          <LoadingSpinner theme={telegramTheme}>
            Загрузка новостей...
          </LoadingSpinner>
        ) : news.status === 'success' ? (
          news.data.length > 0 ? (
            <NewsList>
              {news.data.map((item: NewsItem) => (
                <NewsItemCard key={item.id} theme={telegramTheme}>
                  <NewsContent>
                    <NewsTitle theme={telegramTheme}>{item.title}</NewsTitle>
                    <NewsText theme={telegramTheme}>{item.content}</NewsText>

                    <NewsInfo theme={telegramTheme}>
                      <CategoryBadge theme={telegramTheme}>
                        {getCategoryName(item.category)}
                      </CategoryBadge>
                      <DateText theme={telegramTheme}>
                        {formatDate(item.publish_date)}
                      </DateText>
                    </NewsInfo>

                    {item.link && (
                      <SourceLink
                        theme={telegramTheme}
                        onClick={() => handleSourceClick(item.link)}
                      >
                        Источник
                      </SourceLink>
                    )}
                  </NewsContent>
                </NewsItemCard>
              ))}
            </NewsList>
          ) : (
            <Message theme={telegramTheme}>
              {news.message || 'Нет новостей в выбранной категории'}
            </Message>
          )
        ) : (
          <Message theme={telegramTheme}>
            Ошибка загрузки новостей
          </Message>
        )}
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;