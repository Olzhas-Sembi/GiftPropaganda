import React, { useState } from 'react';
import styled from 'styled-components';

interface MediaViewerProps {
  imageUrl?: string;
  videoUrl?: string;
  title: string;
  className?: string;
}

const MediaContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--tg-theme-secondary-bg-color, #1a1a1a);
`;

const MediaImage = styled.img<{ $hasVideo?: boolean }>`
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
  cursor: ${props => props.$hasVideo ? 'pointer' : 'default'};
  transition: transform 0.2s ease;
  display: block;

  &:hover {
    transform: ${props => props.$hasVideo ? 'scale(1.02)' : 'none'};
  }
`;

const VideoElement = styled.video`
  width: 100%;
  height: auto;
  max-height: 300px;
  background: #000;
  display: block;
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translate(-50%, -50%) scale(1.1);
  }

  &::before {
    content: '▶️';
    font-size: 18px;
    margin-left: 2px;
  }
`;

const MediaType = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  backdrop-filter: blur(4px);
`;

const ErrorPlaceholder = styled.div`
  width: 100%;
  height: 120px;
  background: var(--tg-theme-hint-color, #333);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tg-theme-text-color, #ffffff);
  font-size: 14px;
  border-radius: 8px;
`;

const MediaViewer: React.FC<MediaViewerProps> = ({
  imageUrl,
  videoUrl,
  title,
  className
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError && !videoUrl) {
    return (
      <MediaContainer className={className}>
        <ErrorPlaceholder>
          📷 Изображение недоступно
        </ErrorPlaceholder>
      </MediaContainer>
    );
  }

  if (videoUrl && isVideoPlaying) {
    return (
      <MediaContainer className={className}>
        <VideoElement
          controls
          autoPlay
          poster={imageUrl}
          onError={() => setIsVideoPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          Ваш браузер не поддерживает воспроизведение видео.
        </VideoElement>
        <MediaType>📹 ВИДЕО</MediaType>
      </MediaContainer>
    );
  }

  if (imageUrl) {
    return (
      <MediaContainer className={className}>
        <MediaImage
          src={imageUrl}
          alt={title}
          $hasVideo={!!videoUrl}
          onError={handleImageError}
          onClick={videoUrl ? handlePlayVideo : undefined}
        />
        {videoUrl && (
          <>
            <PlayButton onClick={handlePlayVideo} />
            <MediaType>📹 ВИДЕО</MediaType>
          </>
        )}
        {!videoUrl && (
          <MediaType>📷 ФОТО</MediaType>
        )}
      </MediaContainer>
    );
  }

  return null;
};

export default MediaViewer;
