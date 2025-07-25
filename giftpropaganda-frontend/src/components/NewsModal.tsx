import React, { useEffect } from 'react';
import styled from 'styled-components';
import { NewsItem } from '../api/news';
import TelegramWebApp from '../telegram/TelegramWebApp';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: flex-end;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $isOpen: boolean }>`
  background-color: var(--tg-theme-bg-color, #ffffff);
  width: 100%;
  max-height: 80vh;
  border-radius: 16px 16px 0 0;
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(100%)'};
  transition: transform 0.3s ease-out;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--tg-theme-hint-color, #e0e0e0);
  background-color: var(--tg-theme-secondary-bg-color, #f8f9fa);
`;

const ModalTitle = styled.h3`
  color: var(--tg-theme-text-color, #000000);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  line-height: 1.3;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: var(--tg-theme-hint-color, #999999);
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    background-color: var(--tg-theme-hint-color, #e0e0e0);
    transform: scale(0.95);
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

const CategoryTag = styled.span<{ $category: string }>`
  background-color: ${props => getCategoryColor(props.$category)};
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 16px;
  display: inline-block;
`;

// Компоненты для медиа в модальном окне
const ModalMediaContainer = styled.div`
  margin: 16px 0;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--tg-theme-secondary-bg-color, #f8f9fa);
`;

const ModalNewsImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 60vh;
  object-fit: contain;
  display: block;
`;

const ModalNewsVideo = styled.video`
  width: 100%;
  height: auto;
  max-height: 60vh;
  display: block;
`;

const NewsContent = styled.div`
  line-height: 1.6;
  color: var(--tg-theme-text-color, #000000);
  font-size: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const NewsFooter = styled.div`
  padding: 16px 20px;
  border-top: 1px solid var(--tg-theme-hint-color, #e0e0e0);
  background-color: var(--tg-theme-secondary-bg-color, #f8f9fa);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NewsSource = styled.div`
  color: var(--tg-theme-hint-color, #999999);
  font-size: 14px;
`;

const NewsDate = styled.div`
  color: var(--tg-theme-hint-color, #999999);
  font-size: 14px;
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
const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface NewsModalProps {
  news: NewsItem | null;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ news, onClose }) => {
  const isOpen = !!news;

  useEffect(() => {
    if (isOpen) {
      // Блокируем скролл основной страницы
      document.body.style.overflow = 'hidden';
      TelegramWebApp.triggerHapticFeedback('medium');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    TelegramWebApp.triggerHapticFeedback('light');
    onClose();
  };

  if (!news) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContent $isOpen={isOpen}>
        <ModalHeader>
          <ModalTitle>{news.title}</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <CategoryTag $category={news.category}>
            {news.category.toUpperCase()}
          </CategoryTag>

          {/* Поддержка медиа в модальном окне */}
          {news.media && (
            <ModalMediaContainer>
              {news.media.type === 'photo' && (
                <ModalNewsImage
                  src={news.media.url}
                  alt={news.title}
                  loading="lazy"
                />
              )}
              {news.media.type === 'video' && (
                <ModalNewsVideo
                  src={news.media.url}
                  controls
                  preload="metadata"
                  poster={news.media.thumbnail}
                />
              )}
            </ModalMediaContainer>
          )}

          <NewsContent>{news.content}</NewsContent>
        </ModalBody>

        <NewsFooter>
          <NewsSource>
            Источник: {news.source?.name || 'Telegram'}
          </NewsSource>
          <NewsDate>
            {formatFullDate(news.publish_date)}
          </NewsDate>
        </NewsFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default NewsModal;
