import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchNews, NewsItem } from './api/news';
import NewsModal from './components/NewsModal';
import SearchBar from './components/SearchBar';
import MediaViewer from './components/MediaViewer';
import TelegramWebApp from './telegram/TelegramWebApp';

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
  padding: 12px 16px;
  backdrop-filter: blur(10px);
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--tg-theme-text-color, #ffffff);
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatsBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--tg-theme-hint-color, #999);
`;

const StatItem = styled.span<{ $color?: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: ${props => props.$color || 'var(--tg-theme-hint-color, #999)'};
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0 4px 0;
  margin-bottom: 8px;
  
  &::-webkit-scrollbar {
    height: 3px;
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
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  background: ${props => props.$active 
    ? 'var(--tg-theme-button-color, #0088cc)' 
    : 'var(--tg-theme-secondary-bg-color, #1a1a1a)'};
  color: ${props => props.$active 
    ? 'var(--tg-theme-button-text-color, #ffffff)' 
    : 'var(--tg-theme-text-color, #ffffff)'};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: fit-content;
  display: flex;
  align-items: center;
  gap: 4px;

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
  border-radius: 8px;
  margin-bottom: 12px;
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
      width: 3px;
      height: 100%;
      background: var(--tg-theme-button-color, #0088cc);
      z-index: 1;
    }
  `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    border-color: var(--tg-theme-button-color, #0088cc);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NewsCardContent = styled.div`
  padding: 14px 16px;
`;

const NewsHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
`;

const NewsImagePreview = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--tg-theme-hint-color, #333);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NewsTextContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NewsTitle = styled.h3`
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--tg-theme-text-color, #ffffff);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NewsPreview = styled.p`
  margin: 0 0 8px 0;
  font-size: 13px;
  line-height: 1.4;
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
  gap: 8px;
  margin-top: 8px;
`;

const NewsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--tg-theme-hint-color, #888);
  flex-wrap: wrap;
`;

const CategoryBadge = styled.span<{ $category: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: ${props => getCategoryColor(props.$category)};
  color: #ffffff;
  white-space: nowrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;
  white-space: nowrap;
  font-size: 11px;
`;

const InteractionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: var(--tg-theme-hint-color, #888);
`;

const InteractionButton = styled.button`
  background: none;
  border: none;
  color: var(--tg-theme-hint-color, #888);
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0;
  transition: color 0.2s ease;

  &:hover {
    color: var(--tg-theme-text-color, #ffffff);
  }
`;

const MediaContainer = styled.div`
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
`;

const StyledMediaViewer = styled(MediaViewer)`
  border-radius: 0;
  
  &:first-child {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
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
    { id: 'all', name: 'Все потоки', icon: '' },
    { id: 'gifts', name: 'Подарки', icon: '🎁' },
    { id: 'crypto', name: 'Крипто', icon: '₿' },
    { id: 'tech', name: 'Технологии', icon: '💻' },
    { id: 'community', name: 'Сообщество', icon: '👥' },
    { id: 'nft', name: 'NFT', icon: '🖼️' }
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

  // В renderNewsCard обновляем отображение медиа
  const renderNewsCard = (item: NewsItem) => {
    // Берем первое медиа для превью
    const previewMedia = item.media && item.media.length > 0 ? item.media[0] : null;

    return (
      <NewsCard
        key={item.id}
        $isNew={isNewNews(item.publish_date)}
        onClick={() => handleNewsClick(item)}
      >
        {/* Превью медиа */}
        {previewMedia && (
          <MediaContainer>
            {previewMedia.type === 'photo' && (
              <img
                src={previewMedia.url}
                alt={item.title}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {previewMedia.type === 'video' && previewMedia.thumbnail && (
              <div style={{ position: 'relative' }}>
                <img
                  src={previewMedia.thumbnail}
                  alt="Video preview"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', opacity: 0.8 }}
                />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0,0,0,0.7)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px'
                }}>
                  ▶️
                </div>
              </div>
            )}
          </MediaContainer>
        )}

        <NewsCardContent>
          <NewsHeader>
            <NewsImagePreview>
              {previewMedia && previewMedia.type === 'photo' ? (
                <img
                  src={previewMedia.url}
                  alt={item.title}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'var(--tg-theme-hint-color, #333)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {item.category === 'gifts' ? '🎁' : 
                   item.category === 'crypto' ? '₿' : 
                   item.category === 'tech' ? '💻' : 
                   item.category === 'nft' ? '🖼️' : '📰'}
                </div>
              )}
            </NewsImagePreview>
            
            <NewsTextContent>
              <NewsTitle>{item.title}</NewsTitle>
              <NewsPreview>{item.content}</NewsPreview>
            </NewsTextContent>
          </NewsHeader>

          <NewsMetadata>
            <NewsInfo>
              <CategoryBadge $category={item.category}>
                {item.category.toUpperCase()}
              </CategoryBadge>
              <MetaItem>🕒 {formatTimeAgo(item.publish_date)}</MetaItem>
              {item.reading_time && (
                <MetaItem>📖 {item.reading_time} мин</MetaItem>
              )}
              {item.views_count !== undefined && (
                <MetaItem>👁️ {item.views_count}</MetaItem>
              )}
            </NewsInfo>
            
            <InteractionBar>
              <InteractionButton>🔥</InteractionButton>
              <InteractionButton>💬</InteractionButton>
              <InteractionButton>🔖</InteractionButton>
            </InteractionBar>
          </NewsMetadata>
        </NewsCardContent>
      </NewsCard>
    );
  };

  return (
    <AppContainer>
      <Header>
        <HeaderTop>
          <Title>
            🎁 Gift Propaganda
          </Title>
        </HeaderTop>

        <StatsBar>
          <StatItem $color="#4ade80">СТАТЬИ +78</StatItem>
          <StatItem $color="#60a5fa">ПОСТЫ +20</StatItem>
          <StatItem $color="#a78bfa">НОВОСТИ +54</StatItem>
        </StatsBar>

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
              {category.icon && <span>{category.icon}</span>}
              <span>{category.name}</span>
            </CategoryTab>
          ))}
        </CategoryTabs>
      </Header>

      <NewsContainer>
        {filteredNews.length === 0 ? (
          <EmptyState>
            <h3>📭 Новостей не найдено</h3>
            <p>Попробуйте изменить категорию или поисковый запрос</p>
          </EmptyState>
        ) : (
          filteredNews.map(item => renderNewsCard(item))
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
