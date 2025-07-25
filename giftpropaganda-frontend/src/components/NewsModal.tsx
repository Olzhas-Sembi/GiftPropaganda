import React, { useEffect } from 'react';
import styled from 'styled-components';
import TelegramWebApp from '../telegram/TelegramWebApp';

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

interface NewsModalProps {
  news: NewsItem;
  isOpen: boolean;
  onClose: () => void;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--tg-theme-bg-color, #0f0f0f);
  color: var(--tg-theme-text-color, #ffffff);
  transform: translateY(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const ModalHeader = styled.header`
  position: sticky;
  top: 0;
  background: var(--tg-theme-bg-color, #0f0f0f);
  border-bottom: 1px solid var(--tg-theme-hint-color, #333);
  padding: 16px;
  z-index: 100;
  backdrop-filter: blur(10px);
`;

const HeaderControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const CloseButton = styled.button`
  background: var(--tg-theme-secondary-bg-color, #1a1a1a);
  border: 1px solid var(--tg-theme-hint-color, #333);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--tg-theme-text-color, #ffffff);
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--tg-theme-hint-color, #333);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ShareButton = styled.button`
  background: var(--tg-theme-button-color, #0088cc);
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  color: var(--tg-theme-button-text-color, #ffffff);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ArticleHeader = styled.div`
  margin-bottom: 16px;
`;

const CategoryBadge = styled.span<{ $category: string }>`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => getCategoryColor(props.$category)};
  color: #ffffff;
  margin-bottom: 12px;
`;

const ArticleTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--tg-theme-text-color, #ffffff);
`;

const ArticleSubtitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.4;
  color: var(--tg-theme-hint-color, #999);
`;

const ArticleMetadata = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--tg-theme-hint-color, #999);
  padding-bottom: 16px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #333);
`;

const MetadataItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ArticleContent = styled.div`
  padding: 24px 16px;
  max-width: 700px;
  margin: 0 auto;
`;

const ArticleImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 20px 0;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
`;

const VideoContainer = styled.div`
  width: 100%;
  margin: 20px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
`;

const ArticleText = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: var(--tg-theme-text-color, #ffffff);
  
  p {
    margin: 0 0 16px 0;
  }
  
  a {
    color: var(--tg-theme-link-color, #0088cc);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SourceLink = styled.div`
  margin-top: 32px;
  padding: 16px;
  background: var(--tg-theme-secondary-bg-color, #1a1a1a);
  border: 1px solid var(--tg-theme-hint-color, #333);
  border-radius: 12px;
  font-size: 14px;
  color: var(--tg-theme-hint-color, #999);
  text-align: center;
`;

const SourceLinkButton = styled.button`
  background: transparent;
  border: 1px solid var(--tg-theme-hint-color, #333);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--tg-theme-text-color, #ffffff);
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--tg-theme-button-color, #0088cc);
    color: var(--tg-theme-button-color, #0088cc);
  }
`;

const RecommendationsSection = styled.div`
  margin-top: 32px;
  padding: 20px 16px;
  background: var(--tg-theme-secondary-bg-color, #1a1a1a);
  border-top: 1px solid var(--tg-theme-hint-color, #333);
`;

const RecommendationsTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--tg-theme-text-color, #ffffff);
  text-align: center;
`;

const RecommendationCard = styled.div`
  background: var(--tg-theme-bg-color, #0f0f0f);
  border: 1px solid var(--tg-theme-hint-color, #333);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--tg-theme-button-color, #0088cc);
    transform: translateY(-1px);
  }
`;

const RecommendationTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--tg-theme-text-color, #ffffff);
  line-height: 1.3;
`;

const RecommendationMeta = styled.div`
  font-size: 12px;
  color: var(--tg-theme-hint-color, #999);
`;

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

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'только что';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
  return `${Math.floor(diffInSeconds / 86400)} дн назад`;
}

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.split(' ').length;
  return Math.ceil(words / wordsPerMinute);
}

const NewsModal: React.FC<NewsModalProps> = ({ news, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      TelegramWebApp.triggerHapticFeedback('notification');
    }
  }, [isOpen]);

  const handleShare = () => {
    TelegramWebApp.triggerHapticFeedback('impact');
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.content.substring(0, 100) + '...',
        url: news.link
      });
    } else {
      // Fallback для старых браузеров
      navigator.clipboard.writeText(news.link);
      TelegramWebApp.showAlert('Ссылка скопирована в буфер обмена');
    }
  };

  const handleSourceClick = () => {
    TelegramWebApp.triggerHapticFeedback('impact');
    TelegramWebApp.openLink(news.link);
  };

  const handleClose = () => {
    TelegramWebApp.triggerHapticFeedback('impact');
    onClose();
  };

  if (!isOpen) return null;

  const readingTime = news.reading_time || estimateReadingTime(news.content);

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContainer $isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderControls>
            <CloseButton onClick={handleClose}>×</CloseButton>
            <ShareButton onClick={handleShare}>Поделиться</ShareButton>
          </HeaderControls>

          <ArticleHeader>
            <CategoryBadge $category={news.category}>
              {news.category.toUpperCase()}
            </CategoryBadge>

            <ArticleTitle>{news.title}</ArticleTitle>

            {news.subtitle && (
              <ArticleSubtitle>{news.subtitle}</ArticleSubtitle>
            )}

            <ArticleMetadata>
              <MetadataItem>
                📅 {formatTimeAgo(news.publish_date)}
              </MetadataItem>

              <MetadataItem>
                📖 {readingTime} мин чтения
              </MetadataItem>

              {news.views_count !== undefined && (
                <MetadataItem>
                  👁️ {news.views_count} просмотров
                </MetadataItem>
              )}

              {news.author && (
                <MetadataItem>
                  👤 {news.author}
                </MetadataItem>
              )}
            </ArticleMetadata>
          </ArticleHeader>
        </ModalHeader>

        <ArticleContent>
          {news.image_url && (
            <ArticleImage
              src={news.image_url}
              alt={news.title}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          {news.video_url && (
            <VideoContainer>
              <video
                controls
                style={{ width: '100%', height: 'auto' }}
                poster={news.image_url}
              >
                <source src={news.video_url} type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
            </VideoContainer>
          )}

          <ArticleText>
            {news.content.split('\n').map((paragraph, index) =>
              paragraph.trim() && (
                <p key={index}>{paragraph}</p>
              )
            )}
          </ArticleText>

          <SourceLink>
            Источник
            <SourceLinkButton onClick={handleSourceClick}>
              Читать оригинал
            </SourceLinkButton>
          </SourceLink>
        </ArticleContent>

        <RecommendationsSection>
          <RecommendationsTitle>Рекомендуем к прочтению</RecommendationsTitle>

          {/* Здесь можно добавить рекомендованные статьи */}
          <RecommendationCard>
            <RecommendationTitle>
              Похожие новости появятся здесь
            </RecommendationTitle>
            <RecommendationMeta>
              Система рекомендаций в разработке
            </RecommendationMeta>
          </RecommendationCard>
        </RecommendationsSection>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default NewsModal;
