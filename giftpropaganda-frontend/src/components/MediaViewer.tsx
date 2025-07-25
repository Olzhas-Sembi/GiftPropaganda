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
  border-radius: 12px;
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

  &:hover {
    transform: ${props => props.$hasVideo ? 'scale(1.02)' : 'none'};
  }
`;

const VideoElement = styled.video`
  width: 100%;
  height: auto;
  max-height: 300px;
  border-radius: 12px;
  background: #000;
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translate(-50%, -50%) scale(1.1);
  }

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 20px solid #fff;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    margin-left: 4px;
  }
`;

const MediaTypeIndicator = styled.div<{ $type: 'photo' | 'video' }>`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(4px);

  &::before {
    content: '${props => props.$type === 'photo' ? '📷' : '🎥'}';
    margin-right: 4px;
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: rgba(255, 255, 255, 0.8);
`;

const ErrorImage = styled.div`
  width: 100%;
  height: 120px;
  background: var(--tg-theme-secondary-bg-color, #2a2a2a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tg-theme-hint-color, #999);
  font-size: 14px;
  flex-direction: column;
  gap: 8px;

  &::before {
    content: '🖼️';
    font-size: 32px;
    opacity: 0.5;
  }
`;

const MediaViewer: React.FC<MediaViewerProps> = ({
  imageUrl,
  videoUrl,
  title,
  className
}) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handlePlayVideo = () => {
    if (videoUrl && !videoError) {
      setIsVideoPlaying(true);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleVideoError = () => {
    setVideoError(true);
    setIsVideoPlaying(false);
  };

  // If there's a video and it's playing, show video
  if (videoUrl && isVideoPlaying && !videoError) {
    return (
      <MediaContainer className={className}>
        <VideoElement
          controls
          autoPlay
          poster={imageUrl}
          onError={handleVideoError}
          onEnded={() => setIsVideoPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/ogg" />
          Ваш браузер не поддерживает видео.
        </VideoElement>
        <MediaTypeIndicator $type="video">
          Видео
        </MediaTypeIndicator>
      </MediaContainer>
    );
  }

  // Show image with video play button if video exists
  if (imageUrl && !imageError) {
    return (
      <MediaContainer className={className}>
        <MediaImage
          src={imageUrl}
          alt={title}
          $hasVideo={!!videoUrl && !videoError}
          onError={handleImageError}
          onClick={videoUrl && !videoError ? handlePlayVideo : undefined}
        />

        {videoUrl && !videoError && (
          <>
            <PlayButton onClick={handlePlayVideo} />
            <MediaTypeIndicator $type="video">
              Видео
            </MediaTypeIndicator>
          </>
        )}

        {!videoUrl && (
          <MediaTypeIndicator $type="photo">
            Фото
          </MediaTypeIndicator>
        )}
      </MediaContainer>
    );
  }

  // Show video thumbnail or placeholder if image failed but video exists
  if (videoUrl && !videoError) {
    return (
      <MediaContainer className={className}>
        <PlaceholderImage>
          🎥
        </PlaceholderImage>
        <PlayButton onClick={handlePlayVideo} />
        <MediaTypeIndicator $type="video">
          Видео
        </MediaTypeIndicator>
      </MediaContainer>
    );
  }

  // Show error state if both image and video failed or don't exist
  return (
    <MediaContainer className={className}>
      <ErrorImage>
        Нет изображения
      </ErrorImage>
    </MediaContainer>
  );
};

export default MediaViewer;
